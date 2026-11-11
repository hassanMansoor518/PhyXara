import { useId } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Line, Path, Rect, Stop, Text } from 'react-native-svg';

export function VernierHeroIllustration({ width, height }: { width: number; height: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const steel = 'steel' + id;
  const edge = 'edge' + id;
  const shine = 'shine' + id;
  return (
    <Svg width={width} height={height} viewBox="0 0 190 185" pointerEvents="none">
      <Defs>
        <LinearGradient id={steel} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F8F9FE" />
          <Stop offset="26%" stopColor="#CFD3E1" />
          <Stop offset="56%" stopColor="#F0F1F7" />
          <Stop offset="100%" stopColor="#9A9EB2" />
        </LinearGradient>
        <LinearGradient id={edge} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#37435B" />
          <Stop offset="38%" stopColor="#7F889F" />
          <Stop offset="100%" stopColor="#C6CCDA" />
        </LinearGradient>
        <LinearGradient id={shine} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#8D96AD" />
          <Stop offset="48%" stopColor="#F3F5FC" />
          <Stop offset="100%" stopColor="#AAB2C6" />
        </LinearGradient>
      </Defs>
      <G transform="translate(56 24) rotate(24)">
        <Path d="M0 32H255V61H77L73 96 58 126 41 130 43 120 51 91 48 59H24L21 112 5 129-8 130-5 114-1 70Z" fill="#3B5B91" opacity={.22} transform="translate(2 8)" />
        <Path d="M4 37L17 34 35 50 29 71 25 110 12 123 0 126 0 118 6 107 8 71 0 60Z" fill={`url(#${edge})`} stroke="#69728A" />
        <Path d="M1 34L10 27 26 35 24 63 20 104 13 118 0 124 5 109 8 59Z" fill={`url(#${shine})`} stroke="#919AB1" />
        <Path d="M6 33L6 13 12 3 18 2 21 11 15 31Z" fill={`url(#${edge})`} stroke="#65718B" />
        <Path d="M12 28L12 13 16 6 19 8 17 25Z" fill="#C9D0DF" />
        <Path d="M11 35H251V62H13L8 56Z" fill={`url(#${steel})`} stroke="#8C94AA" />
        <Path d="M13 59H254V65H13Z" fill="#737E96" />
        <Line x1={17} y1={37} x2={251} y2={37} stroke="#FCFCFF" />
        {Array.from({ length: 44 }, (_, i) => {
          const x = 20 + i * 5;
          return <Line key={i} x1={x} y1={58} x2={x} y2={i % 5 === 0 ? 48 : 53} stroke="#41485B" strokeWidth={.8} />;
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <Text key={i} x={20 + i * 25} y={46} fill="#454C5E" fontSize={6} textAnchor="middle">{i}</Text>
        ))}
        <Path d="M55 36L54 22 59 15 65 14 69 19 65 33Z" fill={`url(#${edge})`} stroke="#6C758C" />
        <Path d="M58 57L82 58 81 83 75 105 65 120 49 125 48 119 55 108 59 86Z" fill={`url(#${edge})`} stroke="#707990" />
        <Path d="M52 59L75 59 74 84 68 105 60 116 49 122 54 108 58 84Z" fill={`url(#${shine})`} stroke="#9CA4B8" />
        <Path d="M49 32H112L119 39V68H48L45 63V37Z" fill={`url(#${steel})`} stroke="#717B92" />
        <Path d="M49 33H112L117 38H49Z" fill="#F6F7FC" />
        <Rect x={55} y={42} width={51} height={13} rx={2} fill="#A6ADBF" stroke="#777F95" />
        <Rect x={57} y={43} width={47} height={5} fill="#D5D9E5" />
        {[53, 112].map(x => <Circle key={x} cx={x} cy={60} r={2.4} fill="#41495B" />)}
        {Array.from({ length: 11 }, (_, i) => <Line key={i} x1={60 + i * 4} y1={55} x2={60 + i * 4} y2={i % 5 ? 51 : 48} stroke="#50576B" strokeWidth={.7} />)}
        <Path d="M77 33V25H91V33" fill="#49546D" stroke="#737D96" />
        <Rect x={75} y={22} width={18} height={4} rx={1} fill="#8E97AC" />
        <Line x1={15} y1={73} x2={11} y2={105} stroke="#F7F8FE" strokeWidth={1.3} />
        <Line x1={63} y1={76} x2={60} y2={104} stroke="#F7F8FE" strokeWidth={1.3} />
      </G>
    </Svg>
  );
}
