import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTaskStore } from '@/store/useTaskStore';
import { SymbolView } from 'expo-symbols';

type FocusMode = 'pomodoro' | 'stopwatch';

export default function FocusScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tasks, incrementFocusSessions, changeTaskStatus, focusSessionsCompletedToday, addTimeSpent, toggleSubtask } = useTaskStore();
  
  const task = tasks.find(t => t.id === id);
  
  const [mode, setMode] = useState<FocusMode>('stopwatch'); // Mode par défaut = Chrono Libre
  const [pomodoroMins, setPomodoroMins] = useState<number>(25);
  
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && startTimeRef.current !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const nextSeconds = Math.floor((now - startTimeRef.current!) / 1000);
        setSecondsElapsed(nextSeconds);
        
        // Vérification de fin de Pomodoro
        if (mode === 'pomodoro' && nextSeconds >= pomodoroMins * 60) {
          setIsActive(false);
          setIsFinished(true);
          incrementFocusSessions();
        }
      }, 500); // Check twice a second for smoother updates
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, mode, pomodoroMins]);

  const toggleTimer = () => {
    if (!isActive) {
      startTimeRef.current = Date.now() - (secondsElapsed * 1000);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const switchMode = (newMode: FocusMode) => {
    if (isActive) setIsActive(false);
    setMode(newMode);
    setSecondsElapsed(0);
    startTimeRef.current = null;
    setIsFinished(false);
  };

  const changePomodoroDuration = (mins: number) => {
    if (isActive) setIsActive(false);
    setPomodoroMins(mins);
    setSecondsElapsed(0);
    startTimeRef.current = null;
    setIsFinished(false);
  };

  const handleStop = () => {
    setIsActive(false);
    if (secondsElapsed > 0) {
      addTimeSpent(task!.id, secondsElapsed);
      accumulatedTimeRef.current += secondsElapsed;
    }
    setIsFinished(true);
  };

  const handleFinish = (markDone: boolean) => {
    if (markDone && task) {
      changeTaskStatus(task.id, 'done');
    }
    router.back();
  };

  if (!task) return (
    <View style={styles.container}>
      <Text style={{color: '#fff'}}>Tâche introuvable.</Text>
      <Pressable onPress={() => router.back()}><Text style={{color: '#4B88FF', marginTop: 20}}>Retour</Text></Pressable>
    </View>
  );

  // Formatting
  const displaySeconds = mode === 'pomodoro' ? Math.max(0, (pomodoroMins * 60) - secondsElapsed) : secondsElapsed;
  const m = Math.floor(displaySeconds / 60);
  const s = displaySeconds % 60;
  const h = Math.floor(m / 60);
  const displayM = m % 60;
  const timeString = mode === 'stopwatch' && h > 0 
    ? `${h.toString().padStart(2, '0')}:${displayM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  // Visuals
  let progress = 0;
  if (mode === 'pomodoro') {
    progress = displaySeconds / (pomodoroMins * 60);
  }
  const timerColor = mode === 'stopwatch' ? '#4B88FF' : (progress > 0.5 ? '#34C759' : progress > 0.2 ? '#FFB84B' : '#FF4B4B');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => {
          if (secondsElapsed > 0) addTimeSpent(task.id, secondsElapsed);
          router.back();
        }} style={styles.backBtn}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mode Focus</Text>
        <View style={{width: 24}} />
      </View>

      <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>

      {!isActive && !isFinished && secondsElapsed === 0 && (
        <View style={styles.modeSelector}>
          <Pressable 
            style={[styles.modeBtn, mode === 'stopwatch' && styles.modeBtnActive]}
            onPress={() => switchMode('stopwatch')}
          >
            <SymbolView name={{ ios: 'stopwatch', android: 'timer', web: 'timer' }} size={16} tintColor={mode === 'stopwatch' ? '#000' : '#888'} />
            <Text style={[styles.modeText, mode === 'stopwatch' && styles.modeTextActive]}>Chronomètre</Text>
          </Pressable>
          <Pressable 
            style={[styles.modeBtn, mode === 'pomodoro' && styles.modeBtnActive]}
            onPress={() => switchMode('pomodoro')}
          >
            <SymbolView name={{ ios: 'timer', android: 'hourglass_bottom', web: 'hourglass_bottom' }} size={16} tintColor={mode === 'pomodoro' ? '#000' : '#888'} />
            <Text style={[styles.modeText, mode === 'pomodoro' && styles.modeTextActive]}>Pomodoro</Text>
          </Pressable>
        </View>
      )}

      {mode === 'pomodoro' && !isActive && !isFinished && secondsElapsed === 0 && (
        <View style={styles.durationSelector}>
          {[15, 25, 45].map(mins => (
            <Pressable 
              key={mins}
              style={[styles.durationBtn, pomodoroMins === mins && styles.durationBtnActive]}
              onPress={() => changePomodoroDuration(mins)}
            >
              <Text style={[styles.durationText, pomodoroMins === mins && styles.durationTextActive]}>{mins}m</Text>
            </Pressable>
          ))}
        </View>
      )}

      {isFinished ? (
        <View style={styles.finishedContainer}>
          <Text style={styles.congratsText}>🎉 Session Terminée !</Text>
          <Text style={styles.statsText}>C'est ta {focusSessionsCompletedToday}ème session aujourd'hui.</Text>
          <Text style={{color: '#aaa', marginBottom: 40}}>Temps enregistré : {Math.floor((secondsElapsed + accumulatedTimeRef.current) / 60)} min</Text>
          
          <Pressable style={[styles.actionBtn, { backgroundColor: '#34C759' }]} onPress={() => handleFinish(true)}>
            <Text style={styles.actionBtnText}>Marquer la tâche terminée</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: '#333' }]} onPress={() => handleFinish(false)}>
            <Text style={styles.actionBtnText}>Garder "En cours"</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.timerWrapper}>
          <View style={[styles.timerCircle, { borderColor: timerColor }]}>
            <Text style={[styles.timerText, { color: timerColor, fontSize: timeString.length > 5 ? 48 : 64 }]}>{timeString}</Text>
          </View>
          
          <View style={styles.controlsRow}>
            {secondsElapsed > 0 && !isActive && (
              <Pressable style={styles.stopBtn} onPress={handleStop}>
                <SymbolView name={{ ios: 'stop.fill', android: 'stop', web: 'stop' }} size={24} tintColor="#fff" />
              </Pressable>
            )}
            
            <Pressable 
              style={[styles.playBtn, { backgroundColor: isActive ? '#FFB84B' : timerColor }]} 
              onPress={toggleTimer}
            >
              <SymbolView 
                name={{ ios: isActive ? 'pause.fill' : 'play.fill', android: isActive ? 'pause' : 'play_arrow', web: isActive ? 'pause' : 'play_arrow' }} 
                size={32} 
                tintColor="#fff" 
              />
            </Pressable>
          </View>
        </View>
      )}

      {!isFinished && task.subtasks && task.subtasks.length > 0 && (
        <ScrollView style={styles.subtasksContainer}>
          <Text style={styles.subtasksTitle}>Sous-tâches</Text>
          {task.subtasks.map((st) => (
            <Pressable 
              key={st.id} 
              style={[styles.subtaskRow, st.isCompleted && { opacity: 0.5 }]}
              onPress={() => toggleSubtask(task.id, st.id)}
            >
              <View style={[styles.checkbox, st.isCompleted && styles.checkboxChecked]}>
                {st.isCompleted && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={14} tintColor="#fff" />}
              </View>
              <Text style={[styles.subtaskText, st.isCompleted && styles.subtaskTextChecked]}>{st.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
    marginBottom: 40,
  },
  backBtn: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  taskTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  
  modeSelector: { flexDirection: 'row', backgroundColor: '#222', borderRadius: 20, padding: 4, marginBottom: 20 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, gap: 8 },
  modeBtnActive: { backgroundColor: '#fff' },
  modeText: { color: '#888', fontWeight: '600' },
  modeTextActive: { color: '#000' },

  durationSelector: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  durationBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  durationBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  durationText: { color: '#888', fontWeight: '600' },
  durationTextActive: { color: '#000' },

  timerWrapper: { alignItems: 'center' },
  timerCircle: {
    width: 250, height: 250, borderRadius: 125, borderWidth: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 30,
  },
  timerText: { fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  playBtn: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  stopBtn: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF4B4B',
    alignItems: 'center', justifyContent: 'center',
  },

  subtasksContainer: { width: '100%', marginTop: 30, flex: 1 },
  subtasksTitle: { color: '#888', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#444', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#34C759', borderColor: '#34C759' },
  subtaskText: { color: '#fff', fontSize: 16, flex: 1 },
  subtaskTextChecked: { color: '#888', textDecorationLine: 'line-through' },

  finishedContainer: { width: '100%', alignItems: 'center', marginTop: 40 },
  congratsText: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  statsText: { fontSize: 16, color: '#888', marginBottom: 8 },
  actionBtn: { width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
