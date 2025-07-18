import { Platform, StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  return (
    <View style={styles.tabBarBg} />
  );
}

const styles = StyleSheet.create({
  tabBarBg: {
    flex: 1,
    backgroundColor: '#1A2A36', // фирменный тёмно-серый
    // borderTopLeftRadius: 20, // убрано
    // borderTopRightRadius: 20, // убрано
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      ios: {},
      android: {},
      default: {},
    }),
  },
});

export function useBottomTabOverflow() {
  return 0;
}
