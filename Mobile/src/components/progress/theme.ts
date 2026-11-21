import { StyleSheet } from 'react-native';

export const palette = { background: '#F5F8FF', navy: '#080F38', primary: '#1751F0', link: '#1751F0', tint: '#EAF1FF', muted: '#64748B', border: '#CCDDF599' };
export const progressStyles = StyleSheet.create({
  title: { fontFamily: 'AuthPoppins-SemiBold', fontSize: 16, lineHeight: 24, color: palette.navy },
  body: { fontFamily: 'AuthInter-Regular', fontSize: 12, lineHeight: 18, color: palette.muted },
  label: { fontFamily: 'AuthInter-Medium', fontSize: 11, lineHeight: 16, color: palette.muted },
  link: { fontFamily: 'AuthInter-Medium', fontSize: 11, lineHeight: 16, color: palette.link },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: palette.border, borderRadius: 28, boxShadow: '0 2px 5px rgba(8,15,56,0.04)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
