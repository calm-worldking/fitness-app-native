import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('../../assets/images/placeholder-user.jpg')}
        style={styles.avatar}
      />
      <ThemedText type="title" style={styles.name}>Иван Иванов</ThemedText>
      
      <Card style={styles.infoCard}>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Email:</ThemedText>
            <ThemedText>ivan@example.com</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Телефон:</ThemedText>
            <ThemedText>+7 (999) 123-45-67</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Дата регистрации:</ThemedText>
            <ThemedText>01.07.2023</ThemedText>
          </ThemedView>
        </CardContent>
      </Card>

      <Card style={styles.infoCard}>
        <CardHeader>
          <CardTitle>Абонемент</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Тип:</ThemedText>
            <ThemedText>Семейный</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Действует до:</ThemedText>
            <ThemedText>31.08.2023</ThemedText>
          </ThemedView>
          <Button variant="outline" style={styles.renewButton}>
            Продлить абонемент
          </Button>
        </CardContent>
      </Card>
      
      <Card style={styles.infoCard}>
        <CardHeader>
          <CardTitle>Настройки</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" style={styles.settingsButton}>
            Редактировать профиль
          </Button>
          <Button variant="ghost" style={styles.settingsButton}>
            Уведомления
          </Button>
          <Button variant="destructive" style={styles.logoutButton}>
            Выйти
          </Button>
        </CardContent>
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  name: {
    textAlign: 'center',
    marginBottom: 24,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  renewButton: {
    marginTop: 12,
  },
  settingsButton: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  logoutButton: {
    marginTop: 8,
  },
}); 