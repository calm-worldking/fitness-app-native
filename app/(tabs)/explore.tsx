import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface Gym {
  id: string;
  name: string;
  address: string;
  image: any;
  features: string[];
  category: string;
}

const allGyms: Gym[] = [
  {
    id: '1',
    name: 'FitLife Центральный',
    address: 'ул. Ленина, 42',
    image: require('../../assets/images/placeholder.jpg'),
    features: ['Бассейн', 'Сауна', 'Групповые занятия'],
    category: 'premium'
  },
  {
    id: '2',
    name: 'FitLife Восточный',
    address: 'ул. Гагарина, 15',
    image: require('../../assets/images/placeholder.jpg'),
    features: ['Тренажерный зал', 'Групповые занятия'],
    category: 'standard'
  },
  {
    id: '3',
    name: 'FitLife Южный',
    address: 'ул. Пушкина, 78',
    image: require('../../assets/images/placeholder.jpg'),
    features: ['Бассейн', 'Тренажерный зал', 'Детская комната'],
    category: 'premium'
  },
  {
    id: '4',
    name: 'FitLife Северный',
    address: 'ул. Мира, 23',
    image: require('../../assets/images/placeholder.jpg'),
    features: ['Тренажерный зал', 'Кардио-зона'],
    category: 'standard'
  },
  {
    id: '5',
    name: 'FitLife Западный',
    address: 'ул. Советская, 56',
    image: require('../../assets/images/placeholder.jpg'),
    features: ['Бассейн', 'Сауна', 'Спа-центр', 'Групповые занятия'],
    category: 'premium'
  }
];

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'premium', name: 'Премиум' },
  { id: 'standard', name: 'Стандарт' }
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredGyms = allGyms.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         gym.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || gym.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <ThemedView style={styles.container}>
      {/* Поисковая строка */}
      <ThemedView style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск залов"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Фильтры по категориям */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === item.id && styles.selectedCategoryText
              ]}
            >
              {item.name}
            </ThemedText>
          </TouchableOpacity>
        )}
      />

      {/* Список залов */}
      <FlatList
        data={filteredGyms}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gymsList}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Залы не найдены. Попробуйте изменить параметры поиска.
            </ThemedText>
          </ThemedView>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.gymCard}>
            <Image source={item.image} style={styles.gymImage} />
            <ThemedView style={styles.gymContent}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText style={styles.gymAddress}>{item.address}</ThemedText>
              <ThemedView style={styles.featuresContainer}>
                {item.features.map((feature, index) => (
                  <ThemedView key={index} style={styles.featureTag}>
                    <ThemedText style={styles.featureText}>{feature}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  categoriesList: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  gymsList: {
    paddingBottom: 16,
  },
  gymCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gymImage: {
    width: '100%',
    height: 150,
  },
  gymContent: {
    padding: 16,
  },
  gymAddress: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  featureTag: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
