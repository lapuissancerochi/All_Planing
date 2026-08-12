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

  const QuadrantBlock = ({ title, data, q, color, emptyMsg }: { title: string, data: Task[], q: Quadrant, color: string, emptyMsg: string }) => (
    <View style={[styles.quadrant, { borderColor: color + '40', backgroundColor: color + '05' }]}>
      <View style={[styles.quadrantHeader, { borderBottomColor: color + '20' }]}>
        <Text style={[styles.quadrantTitle, { color }]}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: color + '20' }]}>
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
              style={[styles.taskCard, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}
              onPress={() => setSelectedTask(task)}
            >
              <View style={styles.taskCardHeader}>
                <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
              </View>
              <Pressable 
                style={styles.focusBtn} 
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/focus?id=${task.id}`);
                }}
              >
                <SymbolView name={{ ios: 'target', android: 'my_location', web: 'my_location' }} size={16} tintColor={color} />
                <Text style={[styles.focusBtnText, { color }]}>Focus</Text>
              </Pressable>
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
    <View style={styles.container}>
      <View style={styles.row}>
        <QuadrantBlock title="Faire" data={q1Tasks} q="Q1" color="#FF4B4B" emptyMsg="Bravo ! Pas d'urgences." />
        <QuadrantBlock title="Planifier" data={q2Tasks} q="Q2" color="#4B88FF" emptyMsg="Vos objectifs à long terme ici." />
      </View>
      <View style={styles.row}>
        <QuadrantBlock title="Déléguer" data={q3Tasks} q="Q3" color="#FFB84B" emptyMsg="Rien à déléguer pour le moment." />
        <QuadrantBlock title="Éliminer" data={q4Tasks} q="Q4" color="#888888" emptyMsg="Parfait, pas de distractions !" />
      </View>

      <Modal visible={!!selectedTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedTask(null)} />
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFF' }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Déplacer "{selectedTask?.title}"</Text>
            
            <View style={styles.actionGrid}>
              <Pressable style={[styles.actionBtn, { borderColor: '#FF4B4B' }]} onPress={() => moveTask('Q1')}>
                <Text style={[styles.actionText, { color: '#FF4B4B' }]}>Important & Urgent (Faire)</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { borderColor: '#4B88FF' }]} onPress={() => moveTask('Q2')}>
                <Text style={[styles.actionText, { color: '#4B88FF' }]}>Important, Pas Urgent (Planifier)</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { borderColor: '#FFB84B' }]} onPress={() => moveTask('Q3')}>
                <Text style={[styles.actionText, { color: '#FFB84B' }]}>Pas Important, Urgent (Déléguer)</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { borderColor: '#888888' }]} onPress={() => moveTask('Q4')}>
                <Text style={[styles.actionText, { color: '#888888' }]}>Pas Important/Urgent (Éliminer)</Text>
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
  container: { flex: 1, padding: 8 },
  row: { flex: 1, flexDirection: 'row' },
  quadrant: { 
    flex: 1, 
    margin: 4, 
    borderRadius: 12, 
    borderWidth: 1, 
    overflow: 'hidden' 
  },
  quadrantHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 8, 
    borderBottomWidth: 1 
  },
  quadrantTitle: { fontSize: 14, fontWeight: 'bold' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  quadrantScroll: { flex: 1, padding: 8 },
  emptyMsg: { fontSize: 12, color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  taskCard: { 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1
  },
  taskCardHeader: { marginBottom: 8 },
  taskTitle: { fontSize: 13, fontWeight: '500' },
  focusBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 6, 
    borderRadius: 6, 
    backgroundColor: '#88888815', 
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
