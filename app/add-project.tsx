import { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Toast from 'react-native-toast-message';

const PROJECT_COLORS = ['#4B88FF', '#FF4B4B', '#FFB84B', '#34C759', '#AF52DE', '#FF9500'];

export default function AddProjectScreen() {
  const router = useRouter();
  const { goals, addProject } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>();
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  const handleSave = () => {
    if (!title.trim()) return;

    addProject({
      title: title.trim(),
      description: description.trim(),
      goalId: selectedGoalId,
      color: color
    });
    
    Toast.show({
      type: 'success',
      text1: 'Projet créé 🚀',
      position: 'top',
      visibilityTime: 2000,
    });
    
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.formGroup}>
        <Text style={styles.label}>Titre du projet *</Text>
        <TextInput
          style={[styles.input, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
          placeholder="Ex: Lancer EventPass"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description (optionnelle)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
          placeholder="Détails du projet..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Couleur du projet</Text>
        <View style={styles.colorPicker}>
          {PROJECT_COLORS.map(c => (
            <Pressable 
              key={c}
              style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorOptionSelected]}
              onPress={() => setColor(c)}
            />
          ))}
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
        <Text style={styles.saveBtnText}>Créer le projet</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#888' },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  colorPicker: { flexDirection: 'row', gap: 12 },
  colorOption: { width: 40, height: 40, borderRadius: 20 },
  colorOptionSelected: { borderWidth: 3, borderColor: '#fff' },
  chipsContainer: { flexDirection: 'row', paddingVertical: 8, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
