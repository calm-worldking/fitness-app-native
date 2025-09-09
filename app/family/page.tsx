import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  photo: any;
  isActive: boolean;
}

export default function FamilyPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      photo: require('../../assets/images/placeholder-user.jpg'),
      isActive: true
    },
    {
      id: '2',
      name: 'Мария Иванова',
      email: 'maria@example.com',
      photo: require('../../assets/images/placeholder-user.jpg'),
      isActive: true
    },
    {
      id: '3',
      name: 'Алексей Иванов',
      email: 'alexey@example.com',
      photo: require('../../assets/images/placeholder-user.jpg'),
      isActive: true
    }
  ]);

  const toggleMemberStatus = (id: string) => {
    setFamilyMembers(members => 
      members.map(member => 
        member.id === id 
          ? { ...member, isActive: !member.isActive } 
          : member
      )
    );
  };

  const removeMember = (id: string) => {
    Alert.alert(
      'Удаление участника',
      'Вы уверены, что хотите удалить этого участника из семейного аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            setFamilyMembers(members => members.filter(member => member.id !== id));
          }
        }
      ]
    );
  };

  const BG = '#FFE7D8';

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#fff', paddingHorizontal: 16 }]}>
      <ThemedView style={[styles.header, { alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>
        <Text type="title">Семейный аккаунт</Text>
      </ThemedView>

      <TouchableOpacity 
        style={[styles.infoCard, { backgroundColor: BG }]}
        onPress={() => router.push('./subscription')}
      >
        <ThemedView style={styles.infoCardContent}>
          <ThemedView style={styles.infoCardHeader}>
            <Text type="subtitle">Информация о подписке</Text>
            <IconSymbol name="chevron.right" size={16} color="#888888" />
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <Text type="defaultSemiBold">Тип:</Text>
            <Text>Семейный</Text>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <Text type="defaultSemiBold">Стоимость:</Text>
            <Text>4 900 ₽/месяц</Text>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <Text type="defaultSemiBold">Участники:</Text>
            <Text>{familyMembers.length}/4</Text>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <Text type="defaultSemiBold">Действует до:</Text>
            <Text>31.08.2023</Text>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>

      <Text type="subtitle" style={styles.membersTitle}>
        Участники ({familyMembers.length}/4)
      </Text>

      <ThemedView style={styles.membersList}>
        {familyMembers.map(member => (
          <ThemedView key={member.id} style={[styles.memberCard, { backgroundColor: BG }]}>
            <ThemedView style={styles.memberInfo}>
              <Image source={member.photo} style={styles.memberPhoto} />
              <ThemedView style={styles.memberDetails}>
                <Text type="defaultSemiBold">{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.memberActions}>
              <TouchableOpacity 
                style={[styles.statusButton, member.isActive ? styles.activeButton : styles.inactiveButton]} 
                onPress={() => toggleMemberStatus(member.id)}
              >
                <Text style={member.isActive ? styles.activeText : styles.inactiveText}>
                  {member.isActive ? 'Активен' : 'Не активен'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeMember(member.id)}
              >
                <IconSymbol name="trash" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>

      {familyMembers.length < 4 && (
        <TouchableOpacity style={styles.addButton}>
          <IconSymbol name="plus" size={20} color="white" style={styles.addIcon} />
          <Text style={styles.addButtonText}>Добавить участника</Text>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  membersTitle: {
    marginBottom: 16,
  },
  membersList: {
    gap: 16,
  },
  memberCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberDetails: {
    marginLeft: 12,
  },
  memberEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeButton: {
    backgroundColor: '#E8F5E9',
  },
  inactiveButton: {
    backgroundColor: '#FFEBEE',
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#FF3B30',
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 
