import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View, 
  ActivityIndicator,
  TouchableOpacityProps 
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'default',
  children,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Определяем стили в зависимости от варианта
  const getVariantStyle = () => {
    switch (variant) {
      case 'destructive':
        return {
          backgroundColor: colors.destructive,
          borderColor: colors.destructive,
          color: colors.destructiveForeground,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          color: colors.text,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
          color: colors.text,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          color: colors.text,
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          color: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          color: 'white',
        };
    }
  };

  // Определяем стили в зависимости от размера
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSmall;
      case 'lg':
        return styles.sizeLarge;
      case 'icon':
        return styles.sizeIcon;
      default:
        return styles.sizeDefault;
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();
  const isOutlineOrGhost = variant === 'outline' || variant === 'ghost' || variant === 'link';

  // Функция для рендеринга содержимого кнопки
  const renderContent = () => {
    if (typeof children === 'string') {
      return (
        <Text 
          style={[
            styles.text, 
            { color: variantStyle.color },
            disabled && styles.disabledText,
            size === 'sm' && styles.textSmall,
            size === 'lg' && styles.textLarge,
          ]}
        >
          {children}
        </Text>
      );
    }
    
    // Если children не строка, проверяем, является ли это React элементом
    if (React.isValidElement(children)) {
      return children;
    }
    
    // Для других типов данных (например, числа или смешанные выражения), преобразуем в строку
    return (
      <Text 
        style={[
          styles.text, 
          { color: variantStyle.color },
          disabled && styles.disabledText,
          size === 'sm' && styles.textSmall,
          size === 'lg' && styles.textLarge,
        ]}
      >
        {String(children)}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isLoading || disabled}
      style={[
        styles.button,
        { backgroundColor: variantStyle.backgroundColor, borderColor: variantStyle.borderColor },
        sizeStyle,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <View style={styles.contentContainer}>
        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color={isOutlineOrGhost ? colors.primary : 'white'} 
            style={styles.loader} 
          />
        )}
        
        {!isLoading && leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        
        {renderContent()}
        
        {!isLoading && rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
  sizeDefault: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  sizeLarge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
  },
  sizeIcon: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  loader: {
    marginRight: 8,
  },
  iconContainer: {
    marginHorizontal: 4,
  },
}); 