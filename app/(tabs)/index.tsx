import { StyleSheet, FlatList, Pressable, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { useTaskStore, Task } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import Toast from 'react-native-toast-message';
import { Link } from 'expo-router';

export default function TasksScreen() {
  const { tasks, changeTaskStatus, deleteTask } = useTaskStore();
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

  const renderTask = ({ item }: { item: Task }) => {
    const toggleStatus = () => {
      if (item.status === 'todo') changeTaskStatus(item.id, 'in_progress');
      else if (item.status === 'in_progress') changeTaskStatus(item.id, 'done');
      else changeTaskStatus(item.id, 'todo');
    };

    return (
      <View style={[
        styles.taskCard, 
        { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant },
        item.status === 'done' && { opacity: 0.7 }
      ]}>
        <View style={[styles.priorityIndicator, { backgroundColor: getQuadrantColor(item.quadrant) }]} />
        
        <Pressable style={styles.checkboxContainer} onPress={toggleStatus}>
          <View style={[
            styles.checkbox,
            { borderColor: themeColors.outlineVariant, backgroundColor: themeColors.surfaceContainerLowest },
            item.status === 'done' && { backgroundColor: themeColors.surfaceVariant, borderColor: themeColors.outline }
          ]}>
            {(item.status === 'done' || item.status === 'in_progress') && (
              <SymbolView 
                name={{ ios: item.status === 'done' ? 'checkmark' : 'play.fill', android: item.status === 'done' ? 'check' : 'play_arrow', web: item.status === 'done' ? 'check' : 'play_arrow' }} 
                size={14} 
                tintColor={themeColors.outline} 
              />
            )}
          </View>
        </Pressable>

        <View style={styles.taskContent}>
          <View style={styles.taskTitleRow}>
            <Text style={[
              styles.taskTitle,
              item.status === 'done' && styles.taskDone,
              { color: item.status === 'done' ? themeColors.outline : themeColors.onSurface }
            ]}>
              {item.title}
            </Text>
          </View>
          {item.description ? (
            <Text style={[styles.taskDescription, item.status === 'done' && styles.taskDone]} numberOfLines={2}>{item.description}</Text>
          ) : null}
          
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: getQuadrantColor(item.quadrant) + '20' }]}>
              <Text style={[styles.tagText, { color: getQuadrantColor(item.quadrant) }]}>{item.quadrant}</Text>
            </View>
            {item.date && (
              <View style={[styles.tag, { backgroundColor: themeColors.surfaceContainerHigh }]}>
                <SymbolView name={{ ios: 'calendar', android: 'event', web: 'event' }} size={12} tintColor={themeColors.onSurfaceVariant} style={{ marginRight: 4 }} />
                <Text style={[styles.tagText, { color: themeColors.onSurfaceVariant }]}>{item.date}</Text>
              </View>
            )}
            {item.reminder && (
              <View style={[styles.tag, { backgroundColor: themeColors.surfaceContainerHigh }]}>
                <SymbolView name={{ ios: 'bell', android: 'notifications', web: 'notifications' }} size={12} tintColor={themeColors.error} style={{ marginRight: 4 }} />
                <Text style={[styles.tagText, { color: themeColors.error }]}>Rappel</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable onPress={() => { 
          if (Platform.OS === 'web') {
            if (window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
              deleteTask(item.id);
            }
          } else {
            Alert.alert("Supprimer la tâche", "Confirmer ?", [
              { text: "Annuler", style: "cancel" },
              { text: "Supprimer", style: "destructive", onPress: () => deleteTask(item.id) }
            ]);
          }
        }} style={styles.deleteBtn}>
          <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={20} tintColor={themeColors.onSurfaceVariant} />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.surfaceBright }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.onSurface }]}>My Tasks</Text>
        <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>Manage and prioritize your daily action items.</Text>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <SymbolView name={{ ios: 'tray', android: 'inbox', web: 'inbox' }} size={64} tintColor={themeColors.outlineVariant} />
          <Text style={[styles.emptyText, { color: themeColors.onSurface }]}>Aucune tâche pour le moment.</Text>
          <Text style={[styles.emptySubText, { color: themeColors.onSurfaceVariant }]}>Appuyez sur le bouton + pour en créer une.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* FLOATING ACTION BUTTON */}
      <Link href="/add-task" asChild>
        <Pressable style={StyleSheet.flatten([styles.fab, { backgroundColor: themeColors.primary }])}>
          <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={32} tintColor={themeColors.onPrimary} />
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: '400' },
  listContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1c1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#1c1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
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
  checkboxContainer: { marginRight: 12, marginTop: 2, paddingLeft: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  taskContent: { flex: 1 },
  taskTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  taskTitle: { fontSize: 16, fontWeight: '600' },
  taskDone: { textDecorationLine: 'line-through' },
  taskDescription: { fontSize: 14, color: '#888', marginBottom: 8 },
  tagsContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 8, justifyContent: 'flex-start', opacity: 0.5 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubText: { fontSize: 14, marginTop: 8, textAlign: 'center' }
});
