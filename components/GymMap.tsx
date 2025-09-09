import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

const { width: screenWidth } = Dimensions.get('window');

interface GymMapProps {
  latitude: number;
  longitude: number;
  gymName: string;
  gymAddress?: string;
  height?: number;
  showMarker?: boolean;
  zoomLevel?: number;
}

export const GymMap: React.FC<GymMapProps> = ({
  latitude,
  longitude,
  gymName,
  gymAddress,
  height = 200,
  showMarker = true,
  zoomLevel = 15
}) => {
  const handleMapPress = async () => {
    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback для устройств без Google Maps
        const fallbackUrl = `https://maps.apple.com/?q=${latitude},${longitude}`;
        const fallbackSupported = await Linking.canOpenURL(fallbackUrl);
        if (fallbackSupported) {
          await Linking.openURL(fallbackUrl);
        }
      }
    } catch (error) {
      console.error('Failed to open maps:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { height }]} 
      onPress={handleMapPress}
      activeOpacity={0.9}
    >
      {/* Фон карты с градиентом */}
      <View style={styles.mapBackground}>
        {/* Сетка карты */}
        <View style={styles.mapGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: i * 25 }]} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: i * 50 }]} />
          ))}
        </View>

        {/* Дороги */}
        <View style={styles.roads}>
          <View style={[styles.road, styles.mainRoad]} />
          <View style={[styles.road, styles.secondaryRoad, { top: 60 }]} />
          <View style={[styles.road, styles.secondaryRoad, { top: 140 }]} />
        </View>

        {/* Здания */}
        <View style={styles.buildings}>
          <View style={[styles.building, { left: 20, top: 30, width: 40, height: 30 }]} />
          <View style={[styles.building, { left: 80, top: 50, width: 35, height: 25 }]} />
          <View style={[styles.building, { left: 140, top: 20, width: 45, height: 35 }]} />
          <View style={[styles.building, { left: 200, top: 60, width: 30, height: 20 }]} />
          <View style={[styles.building, { left: 250, top: 40, width: 40, height: 30 }]} />
        </View>

        {/* Парки/зеленые зоны */}
        <View style={styles.parks}>
          <View style={[styles.park, { left: 100, top: 100, width: 60, height: 40 }]} />
          <View style={[styles.park, { left: 180, top: 120, width: 50, height: 35 }]} />
        </View>
      </View>

      {/* Маркер зала */}
      {showMarker && (
        <View style={styles.markerContainer}>
          <View style={styles.markerPulse} />
          <MaterialIcons name="fitness-center" size={24} color="#FF6246" />
        </View>
      )}

      {/* Информация о местоположении */}
      <View style={styles.locationInfo}>
        <View style={styles.locationHeader}>
          <Ionicons name="location" size={16} color="#FF6246" />
          <ThemedText style={styles.locationTitle}>{gymName}</ThemedText>
        </View>
        {gymAddress && (
          <ThemedText style={styles.locationAddress}>{gymAddress}</ThemedText>
        )}
        <View style={styles.coordinatesContainer}>
          <ThemedText style={styles.coordinatesText}>
            📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </ThemedText>
        </View>
      </View>

      {/* Overlay с инструкцией */}
      <View style={styles.mapOverlay}>
        <View style={styles.overlayContent}>
          <MaterialIcons name="open-in-new" size={16} color="#FF6246" />
          <ThemedText style={styles.overlayText}>
            Нажмите для открытия в картах
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#E8F4F8',
    position: 'relative',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
  },
  horizontalLine: {
    height: 1,
    left: 0,
    right: 0,
  },
  verticalLine: {
    width: 1,
    top: 0,
    bottom: 0,
  },
  roads: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  road: {
    position: 'absolute',
    height: 8,
    backgroundColor: '#D3D3D3',
    borderRadius: 4,
  },
  mainRoad: {
    top: 100,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#A0A0A0',
  },
  secondaryRoad: {
    left: 0,
    right: 0,
    height: 6,
  },
  buildings: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  building: {
    position: 'absolute',
    backgroundColor: '#B8B8B8',
    borderRadius: 2,
  },
  parks: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  park: {
    position: 'absolute',
    backgroundColor: '#90EE90',
    borderRadius: 8,
    opacity: 0.7,
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FF6246',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 98, 70, 0.3)',
    zIndex: -1,
  },
  locationInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  locationAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 10,
    color: '#888',
    fontFamily: 'SpaceMono-Regular',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
  },
  overlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
});
