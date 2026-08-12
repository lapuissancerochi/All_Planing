import { StyleSheet, View, TextInput, Pressable, Keyboard } from 'react-native';
import { Text } from '@/components/Themed';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';

export default function ProfileScreen() {
  const { monthlyGoal, setMonthlyGoal, tasksCompletedToday, focusSessionsCompletedToday } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [goalInput, setGoalInput] = useState(monthlyGoal);
  const [isEditing, setIsEditing] = useState(false);

  const saveGoal = () => {
    setMonthlyGoal(goalInput.trim());
    setIsEditing(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: themeColors.tint + '20' }]}>
            <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={48} tintColor={themeColors.tint} />
          </View>
          <Text style={styles.userName}>Utilisateur ALLPLANING</Text>
          <Text style={styles.userStatus}>Producteur en série 🎯</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
          <View style={styles.cardHeader}>
            <SymbolView name={{ ios: 'target', android: 'my_location', web: 'my_location' }} size={24} tintColor="#FF4B4B" />
            <Text style={styles.cardTitle}>Objectif du mois</Text>
          </View>
          
          {isEditing ? (
            <View style={styles.editGoalContainer}>
              <TextInput
                style={[styles.goalInput, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
                value={goalInput}
                onChangeText={setGoalInput}
                placeholder="Quel est votre grand objectif ce mois-ci ?"
                placeholderTextColor="#888"
                multiline
                autoFocus
              />
              <Pressable style={[styles.saveBtn, { backgroundColor: themeColors.tint }]} onPress={saveGoal}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.goalDisplayContainer} onPress={() => setIsEditing(true)}>
              {monthlyGoal ? (
                <Text style={styles.goalText}>{monthlyGoal}</Text>
              ) : (
                <Text style={styles.goalEmpty}>Aucun objectif défini. Cliquez pour ajouter.</Text>
              )}
              <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={16} tintColor="#888" />
            </Pressable>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
            <Text style={styles.statValue}>{tasksCompletedToday}</Text>
            <Text style={styles.statLabel}>Tâches finies (Aujourd'hui)</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
            <Text style={styles.statValue}>{focusSessionsCompletedToday}</Text>
            <Text style={styles.statLabel}>Sessions Focus</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#88888820',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#888',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#88888810',
    padding: 16,
    borderRadius: 12,
  },
  goalText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  goalEmpty: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    flex: 1,
  },
  editGoalContainer: {
    gap: 12,
  },
  goalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  }
});
