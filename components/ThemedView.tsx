import { StyleSheet, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'muted' | 'accent' | 'primary' | 'secondary' | 'destructive';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...rest
}: ThemedViewProps) {
  // Базовый цвет фона
  let backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  
  // Изменяем цвет в зависимости от варианта
  if (variant === 'card') {
    backgroundColor = useThemeColor({}, 'card');
  } else if (variant === 'muted') {
    backgroundColor = useThemeColor({}, 'muted');
  } else if (variant === 'accent') {
    backgroundColor = useThemeColor({}, 'accent');
  } else if (variant === 'primary') {
    backgroundColor = useThemeColor({}, 'primary');
  } else if (variant === 'secondary') {
    backgroundColor = useThemeColor({}, 'secondary');
  } else if (variant === 'destructive') {
    backgroundColor = useThemeColor({}, 'destructive');
  }

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
