import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from './ThemedText';

interface MiniMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  gymName?: string;
  height?: number;
}

const { width } = Dimensions.get('window');

export function MiniMap({
  latitude,
  longitude,
  address,
  gymName,
  height = 150
}: MiniMapProps) {
  const webViewRef = useRef<WebView>(null);

  // HTML для мини-карты с OpenStreetMap
  const getMapHtml = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mini Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body {
                margin: 0;
                padding: 0;
                height: 100vh;
                font-family: Arial, sans-serif;
            }
            #map {
                height: 100%;
                width: 100%;
            }
            .leaflet-control-container {
                display: none !important;
            }
            .custom-popup .leaflet-popup-content-wrapper {
                border-radius: 8px;
                padding: 0;
            }
            .custom-popup .leaflet-popup-content {
                margin: 12px;
                font-size: 14px;
                line-height: 1.4;
            }
            .gym-name {
                font-weight: bold;
                color: #FF6246;
                margin-bottom: 4px;
            }
            .gym-address {
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Инициализация карты
            const map = L.map('map', {
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false,
                touchZoom: false
            }).setView([${latitude}, ${longitude}], 15);

            // Добавляем тайлы OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Добавляем маркер
            const marker = L.marker([${latitude}, ${longitude}], {
                icon: L.divIcon({
                    html: '<div style="background-color: #FF6246; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    className: 'custom-marker',
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                })
            }).addTo(map);

            // Добавляем popup с информацией
            const popupContent = '<div class="custom-popup">' +
                '<div class="gym-name">${gymName || 'Фитнес-зал'}</div>' +
                '<div class="gym-address">${address || 'Адрес не указан'}</div>' +
                '</div>';

            marker.bindPopup(popupContent, {
                closeButton: false,
                autoClose: false,
                closeOnEscapeKey: false,
                closeOnClick: false
            });

            // Автоматически открываем popup
            marker.openPopup();

            // Центрируем карту на маркере
            map.setView([${latitude}, ${longitude}], 15);

            // Предотвращаем любые взаимодействия с картой
            map.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
            });
        </script>
    </body>
    </html>
    `;
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: getMapHtml() }}
        style={styles.webview}
        scrollEnabled={false}
        zoomEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Загрузка карты...</ThemedText>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  webview: {
    flex: 1,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});
