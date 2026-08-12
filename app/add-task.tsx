import { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View, ScrollView, Platform, Switch } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useTaskStore, Quadrant } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from '@/components/useColorScheme';
import Toast from 'react-native-toast-message';
import { useNotifications } from '@/hooks/useNotifications';

export default function AddTaskScreen() {
  const router = useRouter();
  const addTask = useTaskStore((state) => state.addTask);
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { scheduleTaskReminder } = useNotifications();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quadrant, setQuadrant] = useState<Quadrant>('Q1');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateSet, setDateSet] = useState(false);
  const [timeSet, setTimeSet] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);

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

  const formattedDate = dateSet ? date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '';
  const formattedTime = timeSet ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

  const handleSave = () => {
    if (!title.trim()) return;
    
    const finalDate = Platform.OS === 'web' ? dateStr : formattedDate;
    const finalTime = Platform.OS === 'web' ? timeStr : formattedTime;

    addTask({
      title: title.trim(),
      description: description.trim(),
      quadrant,
      status: 'todo',
      date: finalDate,
      time: finalTime,
      reminder: reminderEnabled
    });
    
    if (reminderEnabled) {
      scheduleTaskReminder(title.trim(), 5); // Rappel 5 min avant par défaut (démo)
    }
    
    Toast.show({
      type: 'success',
      text1: 'Tâche enregistrée ✅',
      text2: 'Elle a été ajoutée à votre matrice.',
      position: 'top',
      visibilityTime: 3000,
    });
    
    router.back();
  };

  const QuadrantOption = ({ q, label, color }: { q: Quadrant, label: string, color: string }) => (
    <Pressable 
      style={[
        styles.quadrantOption, 
        quadrant === q && { borderColor: color, backgroundColor: color + '15' }
      ]}
      onPress={() => setQuadrant(q)}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.quadrantText, quadrant === q && { color, fontWeight: 'bold' }]}>{label}</Text>
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
          <Text style={styles.label}>Date</Text>
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
                {dateSet ? formattedDate : "Sélectionner"}
              </Text>
            </Pressable>
          )}
        </View>
        
        <View style={[styles.formGroup, {flex: 1}]}>
          <Text style={styles.label}>Heure</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.text + '40' }]}
              placeholder="Ex: 14:30"
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

      <View style={styles.formGroup}>
        <Text style={styles.label}>Priorité (Matrice Eisenhower)</Text>
        <View style={styles.quadrantGrid}>
          <QuadrantOption q="Q1" label="Important & Urgent" color="#FF4B4B" />
          <QuadrantOption q="Q2" label="Important, Pas Urgent" color="#4B88FF" />
          <QuadrantOption q="Q3" label="Urgent, Pas Important" color="#FFB84B" />
          <QuadrantOption q="Q4" label="Pas Important/Urgent" color="#888888" />
        </View>
      </View>

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
  quadrantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quadrantOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  quadrantText: {
    fontSize: 13,
    flexShrink: 1,
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
  }
});
