import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Participant {
  id: string;
  name: string;
  avatar?: string | null;
}

interface ParticipantsListProps {
  participants: Participant[];
  maxVisible?: number;
  totalCount?: number;
}

export function ParticipantsList({
  participants,
  maxVisible = 5,
  totalCount
}: ParticipantsListProps) {
  const visibleParticipants = participants.slice(0, maxVisible);
  const hiddenCount = Math.max(0, (totalCount || participants.length) - maxVisible);

  if (participants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Пока нет участников</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {visibleParticipants.map((participant, index) => (
        <View key={participant.id || index} style={styles.participant}>
          <View style={styles.avatar}>
            {participant.avatar ? (
              // Здесь можно добавить Image компонент для аватаров
              <Text style={styles.avatarText}>
                {participant.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <MaterialIcons name="person" size={14} color="#fff" />
            )}
          </View>
        </View>
      ))}

      {hiddenCount > 0 && (
        <View style={styles.moreParticipants}>
          <Text style={styles.moreText}>+{hiddenCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participant: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF6246', // BIRGE GO primary color
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  moreParticipants: {
    backgroundColor: '#FFF5F2', // BIRGE GO accent
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFE7D8',
  },
  moreText: {
    fontSize: 12,
    color: '#FF6246',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#737373',
    fontStyle: 'italic',
  },
});
