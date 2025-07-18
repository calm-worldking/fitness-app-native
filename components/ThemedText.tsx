import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'heading1' | 'heading2' | 'heading3' | 'small' | 'muted';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useThemeColor({}, 'text');
  const colorScheme = theme === Colors.light.text ? 'light' : 'dark';
  
  // Определяем цвет текста в зависимости от типа
  let textColor = theme;
  if (type === 'link') {
    textColor = Colors[colorScheme].primary;
  } else if (type === 'muted') {
    textColor = Colors[colorScheme].mutedForeground;
  } else if (lightColor || darkColor) {
    textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  }

  // Определяем шрифт в зависимости от типа
  let fontFamily = 'MuseoSansCyrl_500';
  if (type === 'title' || type === 'heading1') fontFamily = 'MuseoSansCyrl_900';
  else if (type === 'heading2' || type === 'subtitle') fontFamily = 'MuseoSansCyrl_700';
  else if (type === 'defaultSemiBold') fontFamily = 'MuseoSansCyrl_700';
  else if (type === 'small' || type === 'muted') fontFamily = 'MuseoSansCyrl_300';
  else if (type === 'default') fontFamily = 'MuseoSansCyrl_500';

  return (
    <Text
      style={[
        { color: textColor, fontFamily },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'heading1' ? styles.heading1 : undefined,
        type === 'heading2' ? styles.heading2 : undefined,
        type === 'heading3' ? styles.heading3 : undefined,
        type === 'small' ? styles.small : undefined,
        type === 'muted' ? styles.muted : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
});
