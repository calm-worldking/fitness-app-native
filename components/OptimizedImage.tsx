import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

// Кэш для изображений
const imageCache = new Map<string, { uri: string; loaded: boolean; error: boolean }>();

interface OptimizedImageProps {
  source: any;
  style: any;
  placeholder?: any;
  onLoad?: () => void;
  onError?: (error: any) => void;
  showLoadingOverlay?: boolean;
  showErrorOverlay?: boolean;
}

export function OptimizedImage({
  source,
  style,
  placeholder,
  onLoad,
  onError,
  showLoadingOverlay = true,
  showErrorOverlay = true,
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const imageUri = typeof source === 'object' && source.uri ? source.uri : null;
  const imageKey = imageUri || 'local_image';
  
  useEffect(() => {
    if (imageUri) {
      // Проверяем кэш
      const cached = imageCache.get(imageKey);
      if (cached) {
        if (cached.loaded) {
          setLoading(false);
          setError(false);
        } else if (cached.error) {
          setLoading(false);
          setError(true);
        }
      } else {
        // Предварительная загрузка для сетевых изображений
        if (imageUri.startsWith('http')) {
          setLoading(true);
          imageCache.set(imageKey, { uri: imageUri, loaded: false, error: false });
        }
      }
    }
  }, [imageUri, imageKey]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    if (imageUri) {
      imageCache.set(imageKey, { uri: imageUri, loaded: true, error: false });
    }
    onLoad?.();
  };

  const handleError = (error: any) => {
    setLoading(false);
    setError(true);
    if (imageUri) {
      imageCache.set(imageKey, { uri: imageUri, loaded: false, error: true });
    }
    onError?.(error);
  };

  return (
    <View style={[styles.container, style]}>
      <ExpoImage
        source={source}
        style={[styles.image, style]}
        contentFit="cover"
        placeholder={placeholder}
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy="memory-disk"
        priority="high"
      />
      
      {showLoadingOverlay && loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingSpinner}>
            <MaterialIcons name="refresh" size={24} color="white" />
          </View>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      )}
      
      {showErrorOverlay && error && (
        <View style={styles.errorOverlay}>
          <MaterialIcons name="broken-image" size={48} color="white" />
          <Text style={styles.errorText}>Ошибка загрузки</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingSpinner: {
    marginBottom: 8,
    transform: [{ rotate: '0deg' }],
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});




