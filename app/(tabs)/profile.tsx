import { StyleSheet, View, TextInput, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.surfaceBright }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.onSurface }]}>Mon Profil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: themeColors.primaryContainer, borderColor: themeColors.primaryFixed }]}>
            <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={48} tintColor={themeColors.primary} />
          </View>
          <Text style={[styles.userName, { color: themeColors.onSurface }]}>Utilisateur ALLPLANING</Text>
          <Text style={[styles.userStatus, { color: themeColors.onSurfaceVariant }]}>Producteur en série 🎯</Text>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
          <View style={styles.cardHeader}>
            <SymbolView name={{ ios: 'target', android: 'my_location', web: 'my_location' }} size={24} tintColor={themeColors.q1} />
            <Text style={[styles.cardTitle, { color: themeColors.onSurface }]}>Objectif du mois</Text>
          </View>
          
          {isEditing ? (
            <View style={styles.editGoalContainer}>
              <TextInput
                style={[styles.goalInput, { color: themeColors.onSurface, borderColor: themeColors.outlineVariant, backgroundColor: themeColors.surfaceContainerLowest }]}
                value={goalInput}
                onChangeText={setGoalInput}
                placeholder="Quel est votre grand objectif ce mois-ci ?"
                placeholderTextColor={themeColors.outline}
                multiline
                autoFocus
              />
              <Pressable style={[styles.saveBtn, { backgroundColor: themeColors.primary }]} onPress={saveGoal}>
                <Text style={[styles.saveBtnText, { color: themeColors.onPrimary }]}>Enregistrer</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={[styles.goalDisplayContainer, { backgroundColor: themeColors.surfaceContainer }]} onPress={() => setIsEditing(true)}>
              {monthlyGoal ? (
                <Text style={[styles.goalText, { color: themeColors.onSurface }]}>{monthlyGoal}</Text>
              ) : (
                <Text style={[styles.goalEmpty, { color: themeColors.outline }]}>Aucun objectif défini. Cliquez pour ajouter.</Text>
              )}
              <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={16} tintColor={themeColors.outline} />
            </Pressable>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
            <Text style={[styles.statValue, { color: themeColors.onSurface }]}>{tasksCompletedToday}</Text>
            <Text style={[styles.statLabel, { color: themeColors.onSurfaceVariant }]}>Tâches finies (Aujourd'hui)</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
            <Text style={[styles.statValue, { color: themeColors.onSurface }]}>{focusSessionsCompletedToday}</Text>
            <Text style={[styles.statLabel, { color: themeColors.onSurfaceVariant }]}>Sessions Focus</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 32, fontWeight: '700' },
  content: { padding: 16 },
  avatarContainer: { alignItems: 'center', marginVertical: 32 },
  avatar: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userStatus: { fontSize: 14 },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#1c1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  goalDisplayContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 16, borderRadius: 16,
  },
  goalText: { fontSize: 15, flex: 1, lineHeight: 22 },
  goalEmpty: { fontSize: 15, fontStyle: 'italic', flex: 1 },
  editGoalContainer: { gap: 12 },
  goalInput: {
    borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 100, textAlignVertical: 'top',
  },
  saveBtn: { padding: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { fontWeight: '600', fontSize: 16 },
  statsGrid: { flexDirection: 'row', gap: 16 },
  statCard: {
    flex: 1, padding: 24, borderRadius: 24, borderWidth: 1, alignItems: 'center',
    shadowColor: '#1c1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
  },
  statValue: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  statLabel: { fontSize: 12, textAlign: 'center', fontWeight: '500' }
});
