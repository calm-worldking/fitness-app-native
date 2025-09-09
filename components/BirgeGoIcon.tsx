import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BirgeGoIconProps {
  size?: number;
  color?: string;
}

export function BirgeGoIcon({ 
  size = 24, 
  color = '#FF6246'
}: BirgeGoIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Упрощенная версия логотипа для иконки */}
        <Path d="M12 2L10 4L6 18L8 16L12 2Z" fill={color}/>
        <Path d="M10 4L9 7L18 6L19 3L10 4Z" fill={color}/>
        <Path d="M8 16L7 19L16 18L17 15L8 16Z" fill={color}/>
        <Path d="M14 8L13 11L16 10L17 7L14 8Z" fill={color}/>
        <Path d="M12 10L11 13L14 12L15 9L12 10Z" fill={color}/>
      </Svg>
    </View>
  );
}

