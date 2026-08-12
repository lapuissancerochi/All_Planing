import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTaskStore } from '@/store/useTaskStore';
import { SymbolView } from 'expo-symbols';

export default function FocusScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tasks, incrementFocusSessions, changeTaskStatus, focusSessionsCompletedToday } = useTaskStore();
  
  const task = tasks.find(t => t.id === id);
  
  const [duration, setDuration] = useState<number>(25 * 60); // 25 min par defaut
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      incrementFocusSessions();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (mins: number) => {
    setIsActive(false);
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = (markDone: boolean) => {
    if (markDone && task) {
      changeTaskStatus(task.id, 'done');
    }
    router.back();
  };

  // Calcul couleur de progression
  const progress = timeLeft / duration;
  const color = progress > 0.5 ? '#34C759' : progress > 0.2 ? '#FFB84B' : '#FF4B4B';

  if (!task) return (
    <View style={styles.container}>
      <Text>Tâche introuvable.</Text>
      <Pressable onPress={() => router.back()}><Text style={{color: '#4B88FF'}}>Retour</Text></Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={24} tintColor="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mode Focus</Text>
        <View style={{width: 24}} />
      </View>

      <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>

      {!isActive && !isFinished && (
        <View style={styles.durationSelector}>
          {[15, 25, 45].map(mins => (
            <Pressable 
              key={mins}
              style={[styles.durationBtn, duration === mins * 60 && styles.durationBtnActive]}
              onPress={() => resetTimer(mins)}
            >
              <Text style={[styles.durationText, duration === mins * 60 && styles.durationTextActive]}>{mins}m</Text>
            </Pressable>
          ))}
        </View>
      )}

      {isFinished ? (
        <View style={styles.finishedContainer}>
          <Text style={styles.congratsText}>🎉 Session Terminée !</Text>
          <Text style={styles.statsText}>C'est ta {focusSessionsCompletedToday}ème session aujourd'hui.</Text>
          
          <Pressable style={[styles.actionBtn, { backgroundColor: '#34C759' }]} onPress={() => handleFinish(true)}>
            <Text style={styles.actionBtnText}>Marquer la tâche terminée</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: '#333' }]} onPress={() => handleFinish(false)}>
            <Text style={styles.actionBtnText}>Garder "En cours"</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.timerWrapper}>
          <View style={[styles.timerCircle, { borderColor: color }]}>
            <Text style={[styles.timerText, { color }]}>{formatTime(timeLeft)}</Text>
          </View>
          
          <Pressable 
            style={[styles.playBtn, { backgroundColor: isActive ? '#FFB84B' : color }]} 
            onPress={toggleTimer}
          >
            <SymbolView 
              name={{ ios: isActive ? 'pause.fill' : 'play.fill', android: isActive ? 'pause' : 'play_arrow', web: isActive ? 'pause' : 'play_arrow' }} 
              size={32} 
              tintColor="#fff" 
            />
          </Pressable>
        </View>
      )}

      {!isFinished && (
         <Text style={styles.footerStats}>Sessions terminées aujourd'hui : {focusSessionsCompletedToday}</Text>
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
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  taskTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  durationSelector: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  durationBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  durationBtnActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  durationText: {
    color: '#888',
    fontWeight: '600',
  },
  durationTextActive: {
    color: '#000',
  },
  timerWrapper: {
    alignItems: 'center',
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  footerStats: {
    color: '#666',
    position: 'absolute',
    bottom: 40,
  },
  finishedContainer: {
    width: '100%',
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  actionBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
