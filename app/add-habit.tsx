import { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Toast from 'react-native-toast-message';

export default function AddHabitScreen() {
  const router = useRouter();
  const { goals, addHabit } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>();
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const handleSave = () => {
    if (!title.trim()) return;

    addHabit({
      title: title.trim(),
      goalId: selectedGoalId,
      frequency: frequency
    });
    
    Toast.show({
      type: 'success',
      text1: 'Habitude créée 🔥',
      position: 'top',
      visibilityTime: 2000,
    });
    
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.formGroup}>
        <Text style={styles.label}>Titre de l'habitude *</Text>
        <TextInput
          style={[styles.input, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
          placeholder="Ex: Lire 30 min, Faire du sport"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fréquence</Text>
        <View style={styles.chipsContainer}>
          <Pressable 
            style={[styles.chip, frequency === 'daily' && { backgroundColor: themeColors.tint }]}
            onPress={() => setFrequency('daily')}
          >
            <Text style={{ color: frequency === 'daily' ? '#fff' : themeColors.text }}>Quotidienne</Text>
          </Pressable>
          <Pressable 
            style={[styles.chip, frequency === 'weekly' && { backgroundColor: themeColors.tint }]}
            onPress={() => setFrequency('weekly')}
          >
            <Text style={{ color: frequency === 'weekly' ? '#fff' : themeColors.text }}>Hebdomadaire</Text>
          </Pressable>
        </View>
      </View>

      {goals.length > 0 && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Associer à un objectif</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            <Pressable 
              style={[styles.chip, !selectedGoalId && { backgroundColor: themeColors.tint }]}
              onPress={() => setSelectedGoalId(undefined)}
            >
              <Text style={{ color: !selectedGoalId ? '#fff' : themeColors.text }}>Aucun</Text>
            </Pressable>
            {goals.map(g => (
              <Pressable 
                key={g.id}
                style={[styles.chip, { borderColor: themeColors.text + '40' }, selectedGoalId === g.id && { backgroundColor: themeColors.tint }]}
                onPress={() => setSelectedGoalId(g.id)}
              >
                <Text style={{ color: selectedGoalId === g.id ? '#fff' : themeColors.text }}>{g.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <Pressable 
        style={[styles.saveBtn, { backgroundColor: title.trim() ? themeColors.tint : '#555' }]} 
        onPress={handleSave}
        disabled={!title.trim()}
      >
        <Text style={styles.saveBtnText}>Créer l'habitude</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#888' },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  chipsContainer: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
