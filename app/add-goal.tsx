import { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Toast from 'react-native-toast-message';

export default function AddGoalScreen() {
  const router = useRouter();
  const addGoal = useTaskStore((state) => state.addGoal);
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      description: description.trim(),
    });
    
    Toast.show({
      type: 'success',
      text1: 'Objectif créé 🎯',
      position: 'top',
      visibilityTime: 2000,
    });
    
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.formGroup}>
        <Text style={styles.label}>Titre de l'objectif *</Text>
        <TextInput
          style={[styles.input, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
          placeholder="Ex: Devenir développeur full-stack"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description (optionnelle)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
          placeholder="Détails de cet objectif à long terme..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <Pressable 
        style={[styles.saveBtn, { backgroundColor: title.trim() ? themeColors.tint : '#555' }]} 
        onPress={handleSave}
        disabled={!title.trim()}
      >
        <Text style={styles.saveBtnText}>Créer l'objectif</Text>
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
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
