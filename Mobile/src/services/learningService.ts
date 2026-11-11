import { useAuth } from '@clerk/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { applyPracticalEvent, emptyPracticalState, type PracticalEvent, type PracticalState } from '../data/practicalProgress';
import { SINDH_PHYSICS_CHAPTERS, type PhysicsChapter } from '../data/physicsTopics';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  category: 'Explorer' | 'Mastery' | 'Streak';
  rewardXP: number;
}

export const emptyStats = {
  xp: 0, streak: 0, questionsAnswered: 0, quizzesCompleted: 0,
  chaptersCompleted: 0, modelsExplored: 0, overallProgress: 0,
};
export type UserStats = typeof emptyStats;

export interface Progress {
  stats: UserStats;
  achievements: Achievement[];
  completedTopicIds: string[];
}
export interface Home extends Progress {
  topic: PhysicsChapter;
  featured: PhysicsChapter;
}
export const defaultPreferences = { classLevel: 'Class 9', timeZone: 'Asia/Karachi', reminders: false };
export type Preferences = typeof defaultPreferences;

type Submission =
  | { kind: 'topic_open' | 'topic_complete' | 'scan'; target: string }
  | { kind: 'quiz'; answers: string[] }
  | { kind: 'practical'; number: number; event: PracticalEvent };

export function newEventId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

class RequestError extends Error {
  constructor(public status: number) {
    super('Learning API returned ' + status);
  }
}

export async function learningRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const base = process.env.EXPO_PUBLIC_LEARNING_API_URL ||
    process.env.EXPO_PUBLIC_DIAGRAM_MATCH_URL?.replace(/\/api\/[^/]+\/?$/, '');
  if (!base) throw new Error('Learning API URL is missing');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(base.replace(/\/$/, '') + '/api/v1' + path, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    if (!response.ok) throw new RequestError(response.status);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function useLearningAccount() {
  const { getToken, sessionId, userId } = useAuth();
  const tokenGetter = useRef(getToken);

  // Clerk Expo wraps getToken on each render. Refresh on session changes, not wrapper changes.
  useEffect(() => {
    tokenGetter.current = getToken;
  }, [getToken]);
  const request = useCallback(async <T,>(path: string, options?: RequestInit) => {
    if (!sessionId || !userId) throw new Error('Sign in required');
    const token = await tokenGetter.current();
    if (!token) throw new Error('Sign in required');
    return learningRequest<T>(path, {
      ...options,
      headers: { Authorization: 'Bearer ' + token, 'X-PhyXara-Account': userId },
    });
  }, [sessionId, userId]);

  const prefix = userId ? '@phyxara_queue:' + userId + ':' : null;
  const flush = useCallback(async () => {
    if (!prefix) return;
    const keys = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith(prefix));
    if (!keys.length) return;
    for (const [key, raw] of await AsyncStorage.multiGet([...keys].sort())) {
      if (!raw) continue;
      const event: Submission & { occurredAt: string } = JSON.parse(raw);
      try {
        const endpoint = event.kind === 'practical' ? '/practicals/' + event.number + '/events'
          : event.kind === 'quiz' ? '/quiz-attempts' : '/activity';
        const payload = event.kind === 'practical' ? { ...event.event, occurredAt: event.occurredAt } : event;
        await request(endpoint, {
          method: 'POST',
          body: JSON.stringify({ ...payload, eventId: key.slice(prefix.length) }),
        });
      } catch (error) {
        if (!(error instanceof RequestError) || ![400, 409].includes(error.status)) return;
      }
      await AsyncStorage.removeItem(key);
    }
  }, [prefix, request]);

  const record = useCallback(async (event: Submission, eventId = newEventId()) => {
    if (!prefix || !userId) throw new Error('Sign in required');
    const payload = JSON.stringify({ ...event, occurredAt: new Date().toISOString() });
    if (event.kind === 'topic_complete') {
      await AsyncStorage.multiSet([
        [prefix + eventId, payload],
        ['@phyxara_completed:' + userId + ':' + event.target, '1'],
      ]);
    } else if (event.kind === 'practical') {
      await AsyncStorage.multiSet([[prefix + eventId, payload], [practicalLocalPrefix(userId, event.number) + eventId, payload]]);
    } else {
      await AsyncStorage.setItem(prefix + eventId, payload);
    }
    void flush().catch(error => console.warn("Learning sync failed", error));
  }, [prefix, flush, userId]);

  return { userId, request, record, flush };
}

function practicalLocalPrefix(userId: string, number: number) {
  return '@phyxara_practical:' + userId + ':' + number + ':';
}

export function useLearningData<T>(path: string) {
  const { userId, request, flush } = useLearningAccount();
  const [result, setResult] = useState<{ owner: string; data: T }>();
  const [failedOwner, setFailedOwner] = useState<string>();
  const [revision, setRevision] = useState(0);

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    let current = true;
    setFailedOwner(undefined);
    const cacheKey = '@phyxara_snapshot:' + userId + ':' + path;
    const completionPrefix = '@phyxara_completed:' + userId + ':';
    const practicalNumber = Number(path.match(/^\/practicals\/(\d+)\/state$/)?.[1]);
    const isProgress = path === '/home' || path === '/progress';
    const practicalPrefix = practicalLocalPrefix(userId, practicalNumber);
    const mergeLocal = async (data: T | undefined, acknowledged = new Set<string>()) => {
      if (practicalNumber) {
        const keys = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith(practicalPrefix));
        if (!keys.length) return (data ?? emptyPracticalState) as T;
        const entries = (await AsyncStorage.multiGet(keys)).flatMap(([key, raw]) => {
          if (!raw) return [];
          const { event, occurredAt } = JSON.parse(raw) as { event: PracticalEvent; occurredAt: string };
          return [{ id: key.slice(practicalPrefix.length), key, event, occurredAt }];
        }).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id));
        const active = entries.filter(entry => !acknowledged.has(entry.key));
        return active.reduce((state, entry) => applyPracticalEvent(state, practicalNumber, entry.event, entry.id, entry.occurredAt),
          (data as PracticalState | undefined) ?? emptyPracticalState) as T;
      }
      if (!isProgress) return data;
      const progress = data as Progress | undefined;
      const local = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith(completionPrefix))
        .map(key => key.slice(completionPrefix.length));
      const completedTopicIds = [...new Set([...(progress?.completedTopicIds ?? []), ...local])];
      return {
        ...data,
        completedTopicIds,
        achievements: progress?.achievements ?? [],
        stats: { ...emptyStats, ...progress?.stats, chaptersCompleted: completedTopicIds.length,
          overallProgress: Math.round(100 * completedTopicIds.length / SINDH_PHYSICS_CHAPTERS.length) },
      } as T;
    };
    const refresh = async () => {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        const local = await mergeLocal(cached ? JSON.parse(cached) as T : undefined);
        if (current && local) setResult({ owner: userId, data: local });
        await flush();
        const acknowledged = new Set<string>();
        if (practicalNumber) {
          const keys = new Set(await AsyncStorage.getAllKeys());
          for (const key of keys) {
            if (key.startsWith(practicalPrefix) && !keys.has('@phyxara_queue:' + userId + ':' + key.slice(practicalPrefix.length))) {
              acknowledged.add(key);
            }
          }
        }
        const data = await request<T>(path);
        if (!current) return;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        const merged = await mergeLocal(data, acknowledged);
        if (acknowledged.size) await AsyncStorage.multiRemove([...acknowledged]);
        if (current && merged) setResult({ owner: userId, data: merged });
      } catch {
        if (current) setFailedOwner(userId);
      }
    };
    void refresh();
    return () => { current = false; };
  }, [userId, request, flush, path, revision]));

  return {
    data: result?.owner === userId ? result?.data : undefined,
    failed: Boolean(userId && failedOwner === userId),
    retry: () => setRevision(value => value + 1),
  };
}
