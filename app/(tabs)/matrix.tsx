import { StyleSheet, View, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { useTaskStore, Task } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { analyzeTask, CalculatedTaskDetails } from '@/utils/priorityEngine';

type TaskWithDetails = { task: Task, details: CalculatedTaskDetails };

export default function MatrixScreen() {
  const { tasks, changeTaskStatus } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const tasksWithDetails: TaskWithDetails[] = activeTasks.map(t => ({ task: t, details: analyzeTask(t) }));

  const q1Tasks = tasksWithDetails.filter(t => t.details.quadrant === 'Q1').sort((a, b) => b.details.priorityScore - a.details.priorityScore);
  const q2Tasks = tasksWithDetails.filter(t => t.details.quadrant === 'Q2').sort((a, b) => b.details.priorityScore - a.details.priorityScore);
  const q3Tasks = tasksWithDetails.filter(t => t.details.quadrant === 'Q3').sort((a, b) => b.details.priorityScore - a.details.priorityScore);
  const q4Tasks = tasksWithDetails.filter(t => t.details.quadrant === 'Q4').sort((a, b) => b.details.priorityScore - a.details.priorityScore);

  const QuadrantBlock = ({ title, data, qColor, bgColor, emptyMsg }: { title: string, data: TaskWithDetails[], qColor: string, bgColor: string, emptyMsg: string }) => (
    <View style={[styles.quadrant, { borderColor: themeColors.surfaceVariant, backgroundColor: themeColors.surfaceContainerLowest }]}>
      <View style={[styles.quadrantHeader, { borderBottomColor: themeColors.surfaceVariant }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.colorDot, { backgroundColor: qColor }]} />
          <Text style={[styles.quadrantTitle, { color: themeColors.onSurface }]}>{title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: bgColor, borderColor: qColor + '40', borderWidth: 1 }]}>
          <Text style={[styles.badgeText, { color: qColor }]}>{data.length}</Text>
        </View>
      </View>
      <ScrollView style={styles.quadrantScroll} showsVerticalScrollIndicator={false}>
        {data.length === 0 ? (
          <Text style={styles.emptyMsg}>{emptyMsg}</Text>
        ) : (
          data.map(({ task, details }) => {
            // Mapping de la couleur visuelle retournée par le moteur vers notre thème
            let timerColor = '#34C759'; // green
            if (details.visualColor === 'yellow') timerColor = '#FFCC00';
            if (details.visualColor === 'orange') timerColor = '#FF9500';
            if (details.visualColor === 'red') timerColor = '#FF3B30';
            if (details.visualColor === 'black') timerColor = '#000000';

            return (
              <Pressable 
                key={task.id} 
                style={[styles.taskCard, { backgroundColor: themeColors.surfaceBright, borderColor: themeColors.surfaceVariant }]}
                onPress={() => setSelectedTask(task)}
              >
                <View style={[styles.taskCheckbox, { borderColor: themeColors.outlineVariant }]} />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, { color: themeColors.onSurface }]} numberOfLines={2}>{task.title}</Text>
                  
                  {details.formattedTimeRemaining && (
                    <View style={styles.timerBadge}>
                      <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={12} tintColor={timerColor} />
                      <Text style={[styles.timerText, { color: timerColor }]}>{details.formattedTimeRemaining}</Text>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <View style={styles.miniTag}>
                        <SymbolView name={{ ios: 'list.bullet', android: 'format_list_bulleted', web: 'list' }} size={10} tintColor={themeColors.primary} />
                        <Text style={[styles.miniTagText, { color: themeColors.primary }]}>
                          {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}
                        </Text>
                      </View>
                    )}

                    {task.actualTimeSpent && task.actualTimeSpent > 0 ? (
                      <View style={styles.miniTag}>
                        <SymbolView name={{ ios: 'timer', android: 'timer', web: 'timer' }} size={10} tintColor={themeColors.tertiary} />
                        <Text style={[styles.miniTagText, { color: themeColors.tertiary }]}>
                          {Math.floor(task.actualTimeSpent / 60)}m
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Pressable 
                    style={[styles.focusBtn, { backgroundColor: bgColor, marginTop: 6 }]} 
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/focus?id=${task.id}`);
                    }}
                  >
                    <SymbolView name={{ ios: 'target', android: 'my_location', web: 'my_location' }} size={14} tintColor={qColor} />
                    <Text style={[styles.focusBtnText, { color: qColor }]}>Focus</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  const markDone = () => {
    if (selectedTask) {
      changeTaskStatus(selectedTask.id, 'done');
      setSelectedTask(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.surfaceBright }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.onSurface }]}>Eisenhower IA</Text>
        <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>Les quadrants sont générés automatiquement.</Text>
      </View>
      
      <View style={styles.row}>
        <QuadrantBlock title="À faire" data={q1Tasks} qColor={themeColors.q1} bgColor={themeColors.q1Container} emptyMsg="Bravo ! Pas d'urgences." />
        <QuadrantBlock title="À planifier" data={q2Tasks} qColor={themeColors.q2} bgColor={themeColors.q2Container} emptyMsg="Vos objectifs à long terme ici." />
      </View>
      <View style={styles.row}>
        <QuadrantBlock title="À déléguer" data={q3Tasks} qColor={themeColors.q3} bgColor={themeColors.q3Container} emptyMsg="Rien à déléguer pour le moment." />
        <QuadrantBlock title="À éliminer" data={q4Tasks} qColor={themeColors.q4} bgColor={themeColors.q4Container} emptyMsg="Parfait, pas de distractions !" />
      </View>

      <Modal visible={!!selectedTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedTask(null)} />
          <View style={[styles.modalContent, { backgroundColor: themeColors.surfaceBright }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: themeColors.onSurface }]}>Tâche : {selectedTask?.title}</Text>
            
            <View style={styles.actionGrid}>
              {/* Le changement manuel de quadrant est désactivé car c'est géré par l'IA */}
              <Text style={{ textAlign: 'center', color: themeColors.onSurfaceVariant, fontStyle: 'italic', marginBottom: 16 }}>
                La priorité est gérée automatiquement par l'intelligence d'ALLPLANING en fonction de l'échéance et de l'importance.
              </Text>
            </View>

            <Pressable style={styles.doneBtn} onPress={markDone}>
              <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor="#fff" />
              <Text style={styles.doneBtnText}>Marquer comme terminée</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: '400' },
  row: { flex: 1, flexDirection: 'row', gap: 12, marginBottom: 12 },
  quadrant: { 
    flex: 1, 
    borderRadius: 16, 
    borderWidth: 1,
    shadowColor: '#1c1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
    overflow: 'hidden' 
  },
  quadrantHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12, 
    borderBottomWidth: 1 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  quadrantTitle: { fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  quadrantScroll: { flex: 1, padding: 12 },
  emptyMsg: { fontSize: 14, color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  taskCard: { 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  taskCheckbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  timerText: { fontSize: 12, fontWeight: '600' },
  focusBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 6, 
    borderRadius: 6, 
    alignSelf: 'flex-start' 
  },
  focusBtnText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdrop: { ...StyleSheet.absoluteFill },
  modalContent: { 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    paddingBottom: 40 
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#888', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  actionGrid: { gap: 12, marginBottom: 24 },
  doneBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#34C759', 
    padding: 16, 
    borderRadius: 12 
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  miniTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.05)' },
  miniTagText: { fontSize: 10, fontWeight: '600' }
});
