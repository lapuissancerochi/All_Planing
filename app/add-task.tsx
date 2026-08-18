import { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, ScrollView, Platform, Switch } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useTaskStore, TaskImportance, Subtask } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from '@/components/useColorScheme';
import Toast from 'react-native-toast-message';
import { useNotifications } from '@/hooks/useNotifications';
import { SymbolView } from 'expo-symbols';
import uuid from 'react-native-uuid';

export default function AddTaskScreen() {
  const router = useRouter();
  const addTask = useTaskStore((state) => state.addTask);
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { scheduleTaskReminder } = useNotifications();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState<TaskImportance>('medium');
  const [estimatedDuration, setEstimatedDuration] = useState(''); // en minutes
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateSet, setDateSet] = useState(false);
  const [timeSet, setTimeSet] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  
  // NOUVEAU: Sous-tâches locales avant l'enregistrement
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // NOUVEAU: Projet associé (Phase 3)
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setDateSet(true);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setTimeSet(true);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { id: uuid.v4() as string, title: newSubtaskTitle.trim(), isCompleted: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const formattedDate = dateSet ? date.toISOString() : '';
  const formattedTime = timeSet ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

  const handleSave = () => {
    if (!title.trim()) return;
    
    // Web vs Native date parsing
    let finalDate = undefined;
    if (Platform.OS === 'web' && dateStr) {
      const parts = dateStr.split('/');
      if (parts.length === 2) {
        const d = new Date();
        d.setMonth(parseInt(parts[1]) - 1, parseInt(parts[0]));
        finalDate = d.toISOString();
      } else {
        finalDate = new Date().toISOString();
      }
    } else if (dateSet) {
      finalDate = date.toISOString();
    }

    const finalTime = Platform.OS === 'web' && timeStr ? timeStr : timeSet ? formattedTime : undefined;
    const duration = estimatedDuration ? parseInt(estimatedDuration, 10) : undefined;

    addTask({
      title: title.trim(),
      description: description.trim(),
      importance,
      status: 'todo',
      date: finalDate,
      time: finalTime,
      estimatedDuration: isNaN(duration as number) ? undefined : duration,
      reminder: reminderEnabled,
      subtasks: subtasks, // Enregistrement des sous-tâches initiales
      projectId: selectedProjectId // Phase 3
    });
    
    if (reminderEnabled) {
      scheduleTaskReminder(title.trim(), 5);
    }
    
    Toast.show({
      type: 'success',
      text1: 'Tâche enregistrée ✅',
      text2: 'Le système calculera sa priorité.',
      position: 'top',
      visibilityTime: 3000,
    });
    
    router.back();
  };

  const ImportanceOption = ({ level, label, icon, color }: { level: TaskImportance, label: string, icon: string, color: string }) => (
    <Pressable 
      style={[
        styles.importanceOption, 
        importance === level && { borderColor: color, backgroundColor: color + '15' }
      ]}
      onPress={() => setImportance(level)}
    >
      <SymbolView name={{ ios: icon as any, android: icon as any, web: icon as any }} size={24} tintColor={importance === level ? color : '#888'} />
      <Text style={[styles.importanceText, importance === level && { color, fontWeight: 'bold' }]}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.formGroup}>
        <Text style={styles.label}>Titre de la tâche *</Text>
        <TextInput
          style={[styles.input, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
          placeholder="Ex: Préparer la présentation pour le client"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Niveau d'importance</Text>
        <View style={styles.importanceGroup}>
          <ImportanceOption level="high" label="Élevée" icon="exclamationmark.triangle.fill" color="#FF4B4B" />
          <ImportanceOption level="medium" label="Moyenne" icon="star.fill" color="#FFB84B" />
          <ImportanceOption level="low" label="Faible" icon="arrow.down.circle" color="#4B88FF" />
        </View>
      </View>

      {/* SOUS-TÂCHES (NOUVEAU) */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Sous-tâches (Décomposition)</Text>
        
        {subtasks.map((st, index) => (
          <View key={st.id} style={[styles.subtaskRow, { borderColor: themeColors.text + '20' }]}>
            <Text style={{ color: themeColors.text, flex: 1 }}>{index + 1}. {st.title}</Text>
            <Pressable onPress={() => handleRemoveSubtask(st.id)} style={{ padding: 4 }}>
              <SymbolView name={{ ios: 'minus.circle.fill', android: 'remove_circle', web: 'remove_circle' }} size={20} tintColor="#FF4B4B" />
            </Pressable>
          </View>
        ))}

        <View style={styles.addSubtaskContainer}>
          <TextInput
            style={[styles.input, styles.subtaskInput, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
            placeholder="Ex: Créer la maquette"
            placeholderTextColor="#888"
            value={newSubtaskTitle}
            onChangeText={setNewSubtaskTitle}
            onSubmitEditing={handleAddSubtask}
          />
          <Pressable 
            style={[styles.addSubtaskBtn, { backgroundColor: newSubtaskTitle.trim() ? themeColors.tint : themeColors.text + '40' }]}
            onPress={handleAddSubtask}
            disabled={!newSubtaskTitle.trim()}
          >
            <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={20} tintColor="#fff" />
          </Pressable>
        </View>
      </View>

      {/* PROJET ASSOCIE (PHASE 3) */}
      {useTaskStore.getState().projects.length > 0 && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Associer à un projet</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable 
              style={[
                { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: themeColors.text + '40', marginRight: 8 },
                !selectedProjectId && { backgroundColor: themeColors.tint }
              ]}
              onPress={() => setSelectedProjectId(undefined)}
            >
              <Text style={{ color: !selectedProjectId ? '#fff' : themeColors.text }}>Aucun</Text>
            </Pressable>
            {useTaskStore.getState().projects.map(p => (
              <Pressable 
                key={p.id}
                style={[
                  { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: themeColors.text + '40', marginRight: 8 },
                  selectedProjectId === p.id && { backgroundColor: themeColors.tint }
                ]}
                onPress={() => setSelectedProjectId(p.id)}
              >
                <Text style={{ color: selectedProjectId === p.id ? '#fff' : themeColors.text }}>{p.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
          placeholder="Détails de la tâche..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={{flexDirection: 'row', gap: 12}}>
        <View style={[styles.formGroup, {flex: 1}]}>
          <Text style={styles.label}>Date limite</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
              placeholder="Ex: 15/08"
              placeholderTextColor="#888"
              value={dateStr}
              onChangeText={setDateStr}
            />
          ) : (
            <Pressable 
              style={[styles.input, { borderColor: themeColors.text + '40', justifyContent: 'center' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: dateSet ? themeColors.text : '#888' }}>
                {dateSet ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : "Optionnel"}
              </Text>
            </Pressable>
          )}
        </View>
        
        <View style={[styles.formGroup, {flex: 1}]}>
          <Text style={styles.label}>Heure limite</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
              placeholder="Ex: 18:00"
              placeholderTextColor="#888"
              value={timeStr}
              onChangeText={setTimeStr}
            />
          ) : (
            <Pressable 
              style={[styles.input, { borderColor: themeColors.text + '40', justifyContent: 'center' }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={{ color: timeSet ? themeColors.text : '#888' }}>
                {timeSet ? formattedTime : "Optionnel"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Durée estimée (en minutes)</Text>
        <TextInput
          style={[styles.input, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
          placeholder="Ex: 120 pour 2 heures"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={estimatedDuration}
          onChangeText={setEstimatedDuration}
        />
      </View>

      <View style={[styles.formGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View>
          <Text style={styles.label}>Activer le rappel</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>Alerte 5 minutes avant l'heure prévue</Text>
        </View>
        <Switch 
          value={reminderEnabled} 
          onValueChange={setReminderEnabled}
          trackColor={{ false: '#767577', true: themeColors.tint + '80' }}
          thumbColor={reminderEnabled ? themeColors.tint : '#f4f3f4'}
        />
      </View>

      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Pressable 
        style={[styles.saveBtn, { backgroundColor: title.trim() ? themeColors.tint : '#555' }]} 
        onPress={handleSave}
        disabled={!title.trim()}
      >
        <Text style={styles.saveBtnText}>Enregistrer la tâche</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  importanceGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  importanceOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    gap: 8,
  },
  importanceText: {
    fontSize: 13,
  },
  saveBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  subtaskInput: {
    flex: 1,
    paddingVertical: 12,
  },
  addSubtaskBtn: {
    width: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
