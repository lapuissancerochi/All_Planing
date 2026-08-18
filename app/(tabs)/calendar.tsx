import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { useTaskStore, Task } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import { analyzeTask } from '@/utils/priorityEngine';

export default function CalendarScreen() {
  const { tasks } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const getQuadrantColor = (quadrant: string) => {
    switch(quadrant) {
      case 'Q1': return themeColors.q1;
      case 'Q2': return themeColors.q2;
      case 'Q3': return themeColors.q3;
      case 'Q4': return themeColors.q4;
      default: return themeColors.outline;
    }
  };

  const getTimerColor = (visualColor: string) => {
    switch(visualColor) {
      case 'yellow': return '#FFCC00';
      case 'orange': return '#FF9500';
      case 'red': return '#FF3B30';
      case 'black': return '#000000';
      default: return '#34C759'; // green
    }
  };

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  const activeTasks = tasks.filter(t => t.status !== 'done');
  
  const tasksWithDetails = activeTasks.map(t => ({ task: t, details: analyzeTask(t) }));
  
  const todayTasks = tasksWithDetails.filter(t => t.task.date === todayStr);
  const futureTasks = tasksWithDetails.filter(t => t.task.date && t.task.date !== todayStr);
  const noDateTasks = tasksWithDetails.filter(t => !t.task.date);

  const renderTaskRow = ({ task, details }: { task: Task, details: any }) => (
    <View key={task.id} style={[styles.taskCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
      <View style={[styles.priorityIndicator, { backgroundColor: getQuadrantColor(details.quadrant) }]} />
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, { color: themeColors.onSurface }]}>{task.title}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          {task.time && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={12} tintColor={themeColors.outline} />
              <Text style={{ fontSize: 12, color: themeColors.outline }}>{task.time}</Text>
            </View>
          )}
          {details.formattedTimeRemaining && (
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <SymbolView name={{ ios: 'timer', android: 'timer', web: 'timer' }} size={12} tintColor={getTimerColor(details.visualColor)} />
                <Text style={{ fontSize: 12, color: getTimerColor(details.visualColor) }}>{details.formattedTimeRemaining}</Text>
             </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.surfaceBright }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.onSurface }]}>Calendrier</Text>
        <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>Vos échéances à venir.</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* AUJOURD'HUI */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>Aujourd'hui ({todayTasks.length})</Text>
          {todayTasks.length === 0 ? (
            <Text style={styles.emptyMsg}>Aucune échéance pour aujourd'hui.</Text>
          ) : (
            todayTasks.map(renderTaskRow)
          )}
        </View>

        {/* PLUS TARD */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>Plus tard ({futureTasks.length})</Text>
          {futureTasks.length === 0 ? (
            <Text style={styles.emptyMsg}>Aucune échéance future.</Text>
          ) : (
            futureTasks.map(renderTaskRow)
          )}
        </View>

        {/* SANS DATE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>Sans date ({noDateTasks.length})</Text>
          {noDateTasks.length === 0 ? (
            <Text style={styles.emptyMsg}>Toutes vos tâches sont planifiées.</Text>
          ) : (
            noDateTasks.map(renderTaskRow)
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 0 },
  header: { paddingTop: 24, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: '400' },
  scroll: { flex: 1 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  emptyMsg: { fontStyle: 'italic', color: '#888', fontSize: 14 },
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#1c1917', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  taskContent: { flex: 1, paddingLeft: 8 },
  taskTitle: { fontSize: 16, fontWeight: '600' },
});
