import { StyleSheet, FlatList, Pressable, View, Alert, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { useTaskStore, Task } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import Toast from 'react-native-toast-message';

export default function TasksScreen() {
  const { tasks, changeTaskStatus, deleteTask } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const getQuadrantColor = (quadrant: string) => {
    switch(quadrant) {
      case 'Q1': return '#FF4B4B'; // Important & Urgent (Rouge)
      case 'Q2': return '#4B88FF'; // Important & Non Urgent (Bleu)
      case 'Q3': return '#FFB84B'; // Non Important & Urgent (Orange)
      case 'Q4': return '#888888'; // Non Important & Non Urgent (Gris)
      default: return '#888888';
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    const toggleStatus = () => {
      if (item.status === 'todo') changeTaskStatus(item.id, 'in_progress');
      else if (item.status === 'in_progress') changeTaskStatus(item.id, 'done');
      else changeTaskStatus(item.id, 'todo');
    };

    const getStatusColor = () => {
      if (item.status === 'done') return '#4CAF50';
      if (item.status === 'in_progress') return '#FFB84B'; // Jaune orangé
      return '#88888840';
    };

    const getStatusIcon = () => {
      if (item.status === 'done') return 'checkmark';
      if (item.status === 'in_progress') return 'play.fill';
      return undefined;
    };

    return (
      <View style={[styles.taskCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
        <View style={[styles.priorityIndicator, { backgroundColor: getQuadrantColor(item.quadrant) }]} />
        
        <Pressable 
          style={[
            styles.checkbox, 
            { borderColor: getStatusColor() },
            item.status === 'done' && { backgroundColor: getStatusColor() },
            item.status === 'in_progress' && { backgroundColor: getStatusColor() + '20' }
          ]} 
          onPress={toggleStatus}
        >
          {item.status !== 'todo' && (
            <SymbolView 
              name={{ ios: getStatusIcon() as any, android: item.status === 'done' ? 'check' : 'play_arrow', web: item.status === 'done' ? 'check' : 'play_arrow' }} 
              size={14} 
              tintColor={item.status === 'done' ? '#fff' : getStatusColor()} 
            />
          )}
        </Pressable>

        <View style={styles.taskContent}>
          <Text style={[
            styles.taskTitle,
            item.status === 'done' && styles.taskDone,
            { color: item.status === 'done' ? '#888' : themeColors.text }
          ]}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
          ) : null}
          
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: getQuadrantColor(item.quadrant) + '20' }]}>
              <View style={[styles.dot, { backgroundColor: getQuadrantColor(item.quadrant) }]} />
              <Text style={[styles.tagText, { color: getQuadrantColor(item.quadrant) }]}>{item.quadrant}</Text>
            </View>
            {item.date && (
              <View style={styles.tag}>
                <SymbolView name={{ ios: 'calendar', android: 'event', web: 'event' }} size={12} tintColor="#888" style={{ marginRight: 4 }} />
                <Text style={styles.tagText}>{item.date}</Text>
              </View>
            )}
            {item.reminder && (
              <View style={styles.tag}>
                <SymbolView name={{ ios: 'bell', android: 'notifications', web: 'notifications' }} size={12} tintColor="#FF4B4B" style={{ marginRight: 4 }} />
                <Text style={[styles.tagText, { color: '#FF4B4B' }]}>Actif</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable 
          onPress={() => {
            const deleteAction = () => {
              deleteTask(item.id);
              Toast.show({
                type: 'error',
                text1: 'Tâche supprimée 🗑️',
                text2: 'Elle a été retirée de votre liste.',
                position: 'top',
              });
            };

            if (Platform.OS === 'web') {
              if (window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
                deleteAction();
              }
            } else {
              Alert.alert(
                "Supprimer la tâche",
                "Voulez-vous vraiment supprimer cette tâche ?",
                [
                  { text: "Annuler", style: "cancel" },
                  { text: "Supprimer", style: "destructive", onPress: deleteAction }
                ]
              );
            }
          }} 
          style={styles.deleteBtn}
        >
          <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={24} tintColor="#FF4B4B" />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <SymbolView name={{ ios: 'tray', android: 'inbox', web: 'inbox' }} size={64} tintColor="#888" />
          <Text style={styles.emptyText}>Aucune tâche pour le moment.</Text>
          <Text style={styles.emptySubText}>Appuyez sur le bouton + pour en créer une.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#88888820',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
  },
  deleteBtn: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  }
});
