import { StyleSheet, View, ScrollView, Pressable, Modal } from 'react-native';
import { Text } from '@/components/Themed';
import { useTaskStore, Task, Quadrant } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function MatrixScreen() {
  const { tasks, changeTaskQuadrant, changeTaskStatus } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const q1Tasks = tasks.filter(t => t.quadrant === 'Q1' && t.status !== 'done');
  const q2Tasks = tasks.filter(t => t.quadrant === 'Q2' && t.status !== 'done');
  const q3Tasks = tasks.filter(t => t.quadrant === 'Q3' && t.status !== 'done');
  const q4Tasks = tasks.filter(t => t.quadrant === 'Q4' && t.status !== 'done');

  const QuadrantBlock = ({ title, data, q, color, bgColor, emptyMsg }: { title: string, data: Task[], q: Quadrant, color: string, bgColor: string, emptyMsg: string }) => (
    <View style={[styles.quadrant, { borderColor: themeColors.surfaceVariant, backgroundColor: themeColors.surfaceContainerLowest }]}>
      <View style={[styles.quadrantHeader, { borderBottomColor: themeColors.surfaceVariant }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Text style={[styles.quadrantTitle, { color: themeColors.onSurface }]}>{title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: bgColor, borderColor: color + '40', borderWidth: 1 }]}>
          <Text style={[styles.badgeText, { color }]}>{data.length}</Text>
        </View>
      </View>
      <ScrollView style={styles.quadrantScroll} showsVerticalScrollIndicator={false}>
        {data.length === 0 ? (
          <Text style={styles.emptyMsg}>{emptyMsg}</Text>
        ) : (
          data.map(task => (
            <Pressable 
              key={task.id} 
              style={[styles.taskCard, { backgroundColor: themeColors.surfaceBright, borderColor: themeColors.surfaceVariant }]}
              onPress={() => setSelectedTask(task)}
            >
              <View style={[styles.taskCheckbox, { borderColor: themeColors.outlineVariant }]} />
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, { color: themeColors.onSurface }]} numberOfLines={2}>{task.title}</Text>
                <Pressable 
                  style={[styles.focusBtn, { backgroundColor: bgColor }]} 
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/focus?id=${task.id}`);
                  }}
                >
                  <SymbolView name={{ ios: 'target', android: 'my_location', web: 'my_location' }} size={14} tintColor={color} />
                  <Text style={[styles.focusBtnText, { color }]}>Focus</Text>
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );

  const moveTask = (newQ: Quadrant) => {
    if (selectedTask) {
      changeTaskQuadrant(selectedTask.id, newQ);
      setSelectedTask(null);
    }
  };

  const markDone = () => {
    if (selectedTask) {
      changeTaskStatus(selectedTask.id, 'done');
      setSelectedTask(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surfaceBright }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.onSurface }]}>Eisenhower Matrix</Text>
        <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>Focus on what matters most.</Text>
      </View>
      
      <View style={styles.row}>
        <QuadrantBlock title="À faire" data={q1Tasks} q="Q1" color={themeColors.q1} bgColor={themeColors.q1Container} emptyMsg="Bravo ! Pas d'urgences." />
        <QuadrantBlock title="À planifier" data={q2Tasks} q="Q2" color={themeColors.q2} bgColor={themeColors.q2Container} emptyMsg="Vos objectifs à long terme ici." />
      </View>
      <View style={styles.row}>
        <QuadrantBlock title="À déléguer" data={q3Tasks} q="Q3" color={themeColors.q3} bgColor={themeColors.q3Container} emptyMsg="Rien à déléguer pour le moment." />
        <QuadrantBlock title="À éliminer" data={q4Tasks} q="Q4" color={themeColors.q4} bgColor={themeColors.q4Container} emptyMsg="Parfait, pas de distractions !" />
      </View>

      <Modal visible={!!selectedTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedTask(null)} />
          <View style={[styles.modalContent, { backgroundColor: themeColors.surfaceBright }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: themeColors.onSurface }]}>Déplacer "{selectedTask?.title}"</Text>
            
            <View style={styles.actionGrid}>
              <Pressable style={[styles.actionBtn, { borderColor: themeColors.q1, backgroundColor: themeColors.q1Container }]} onPress={() => moveTask('Q1')}>
                <Text style={[styles.actionText, { color: themeColors.q1 }]}>Important & Urgent (À faire)</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { borderColor: themeColors.q2, backgroundColor: themeColors.q2Container }]} onPress={() => moveTask('Q2')}>
                <Text style={[styles.actionText, { color: themeColors.q2 }]}>Important, Pas Urgent (À planifier)</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { borderColor: themeColors.q3, backgroundColor: themeColors.q3Container }]} onPress={() => moveTask('Q3')}>
                <Text style={[styles.actionText, { color: themeColors.q3 }]}>Pas Important, Urgent (À déléguer)</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { borderColor: themeColors.q4, backgroundColor: themeColors.q4Container }]} onPress={() => moveTask('Q4')}>
                <Text style={[styles.actionText, { color: themeColors.q4 }]}>Pas Important / Pas Urgent (À éliminer)</Text>
              </Pressable>
            </View>

            <Pressable style={styles.doneBtn} onPress={markDone}>
              <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} size={20} tintColor="#fff" />
              <Text style={styles.doneBtnText}>Marquer comme terminée</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
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
  taskTitle: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  focusBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 6, 
    borderRadius: 6, 
    alignSelf: 'flex-start' 
  },
  focusBtnText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24, 
    paddingBottom: 40 
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#888', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  actionGrid: { gap: 12, marginBottom: 24 },
  actionBtn: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '600' },
  doneBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#34C759', 
    padding: 16, 
    borderRadius: 12 
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
