import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScheduleScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Расписание</ThemedText>
      <ThemedText style={styles.description}>
        Здесь будет отображаться расписание тренировок и занятий
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  description: {
    textAlign: 'center',
    marginTop: 20,
  },
}); 