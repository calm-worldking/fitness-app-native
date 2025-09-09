import React from 'react';
import { 
  StyleSheet, 
  View, 
  ViewProps, 
  Text, 
  TextProps, 
  TouchableOpacity, 
  TouchableOpacityProps 
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

function Card({ children, style, ...props }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border 
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

function CardHeader({ children, style, ...props }: CardHeaderProps) {
  return (
    <View style={[styles.cardHeader, style]} {...props}>
      {children}
    </View>
  );
}

interface CardTitleProps extends TextProps {
  children: React.ReactNode;
}

function CardTitle({ children, style, ...props }: CardTitleProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Text 
      style={[
        styles.cardTitle, 
        { color: colors.text },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
}

interface CardDescriptionProps extends TextProps {
  children: React.ReactNode;
}

function CardDescription({ children, style, ...props }: CardDescriptionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Text 
      style={[
        styles.cardDescription, 
        { color: colors.mutedForeground },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
}

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

function CardContent({ children, style, ...props }: CardContentProps) {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
}

interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
}

function CardFooter({ children, style, ...props }: CardFooterProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View 
      style={[
        styles.cardFooter, 
        { borderTopColor: colors.border },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

interface CardPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

function CardPressable({ children, style, ...props }: CardPressableProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border 
        }, 
        style
      ]} 
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardPressable
}; 
