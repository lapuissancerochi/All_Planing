import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';

export default function CalendarScreen() {
  const { tasks } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Grouper les tâches par date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.status === 'done') return acc;
    const dateKey = task.date || 'Sans date';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const sortedDates = Object.keys(tasksByDate).sort((a, b) => {
    if (a === 'Sans date') return 1;
    if (b === 'Sans date') return -1;
    return a.localeCompare(b);
  });

  const getQuadrantColor = (q: string) => {
    switch (q) {
      case 'Q1': return '#FF4B4B';
      case 'Q2': return '#4B88FF';
      case 'Q3': return '#FFB84B';
      case 'Q4': return '#888888';
      default: return '#888';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendrier (Vue Liste)</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {sortedDates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={48} tintColor="#888" />
            <Text style={styles.emptyText}>Aucune tâche planifiée.</Text>
          </View>
        ) : (
          sortedDates.map(date => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={16} tintColor={themeColors.tint} />
                <Text style={[styles.dateTitle, { color: themeColors.tint }]}>{date}</Text>
              </View>
              {tasksByDate[date].map(task => (
                <View key={task.id} style={[styles.taskCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
                  <View style={[styles.priorityIndicator, { backgroundColor: getQuadrantColor(task.quadrant) }]} />
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.time ? (
                      <View style={styles.timeBadge}>
                        <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={12} tintColor="#888" />
                        <Text style={styles.timeText}>{task.time}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#88888820',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  priorityIndicator: {
    width: 6,
  },
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#88888815',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  }
});
