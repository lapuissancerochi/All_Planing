import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import { coachEngine, ScheduleItem } from '@/utils/coachEngine';

export default function CoachScreen() {
  const { tasks, coachAlerts, addCoachAlert, dismissCoachAlert, changeTaskStatus, updateTask } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  // 1. Détection de la Procrastination au chargement
  useEffect(() => {
    const newAlerts = coachEngine.detectProcrastination(tasks);
    newAlerts.forEach(alert => {
      addCoachAlert(alert);
    });
    
    // Générer le planning
    setSchedule(coachEngine.generateSchedule(tasks));
  }, [tasks]);

  // 2. Analyse de charge
  const loadAnalysis = coachEngine.analyzeDailyLoad(tasks);

  // 3. Actions Rapides pour Procrastination
  const handleDiviser = (taskId: string) => {
    Alert.prompt("Diviser", "Quelle est la première petite sous-tâche à faire ?", (text) => {
      if (text) {
        useTaskStore.getState().addSubtask(taskId, text);
        Alert.alert("Bravo !", "Sous-tâche ajoutée. Commencez par ça.");
      }
    });
  };

  const handleDeleguer = (taskId: string) => {
    changeTaskStatus(taskId, 'done'); // Ou un statut délégué dans le futur
    Alert.alert("Délégué", "La tâche est retirée de votre charge actuelle.");
  };

  const handleEliminer = (taskId: string) => {
    useTaskStore.getState().deleteTask(taskId);
  };

  const activeAlerts = coachAlerts.filter(a => !a.isDismissed);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.surfaceBright }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.onSurface }]}>Le Coach IA</Text>
          <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>Analyse et recommandations</Text>
        </View>

        {/* ANALYSE DE CHARGE */}
        <View style={[styles.card, { backgroundColor: loadAnalysis.status === '🔴' ? themeColors.errorContainer : loadAnalysis.status === '🟡' ? themeColors.q2Container : themeColors.q1Container }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={{fontSize: 24}}>{loadAnalysis.status}</Text>
            <Text style={[styles.cardTitle, { color: themeColors.onSurface }]}>Charge de la journée</Text>
          </View>
          <Text style={[styles.cardMessage, { color: themeColors.onSurfaceVariant }]}>{loadAnalysis.message}</Text>
        </View>

        {/* INSIGHTS (PHASE 5) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>🧠 Insight Comportemental</Text>
          <View style={[styles.insightCard, { backgroundColor: themeColors.primaryContainer, borderColor: themeColors.primary }]}>
            <Text style={[styles.insightText, { color: themeColors.onPrimaryContainer }]}>
              {gamificationEngine.generateInsights(useTaskStore.getState().gameStats, tasks)}
            </Text>
          </View>
        </View>

        {/* ALERTES PROCRASTINATION */}
        {activeAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>⚠️ Alertes Procrastination</Text>
            
            {activeAlerts.map(alert => (
              <View key={alert.id} style={[styles.alertCard, { backgroundColor: themeColors.surfaceContainerHighest, borderColor: themeColors.surfaceVariant }]}>
                <View style={styles.alertHeader}>
                  <SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }} size={20} tintColor={themeColors.error} />
                  <Pressable onPress={() => dismissCoachAlert(alert.id)}>
                    <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={20} tintColor={themeColors.onSurfaceVariant} />
                  </Pressable>
                </View>
                <Text style={[styles.alertMessage, { color: themeColors.onSurface }]}>{alert.message}</Text>
                
                <View style={styles.alertActions}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: themeColors.primary }]} onPress={() => { alert.taskId && handleDiviser(alert.taskId); dismissCoachAlert(alert.id); }}>
                    <Text style={styles.actionBtnText}>Diviser</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: themeColors.surfaceVariant }]} onPress={() => { alert.taskId && handleDeleguer(alert.taskId); dismissCoachAlert(alert.id); }}>
                    <Text style={[styles.actionBtnText, { color: themeColors.onSurface }]}>Déléguer</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: themeColors.error }]} onPress={() => { alert.taskId && handleEliminer(alert.taskId); dismissCoachAlert(alert.id); }}>
                    <Text style={styles.actionBtnText}>Éliminer</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PLANNING RECOMMANDÉ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>📅 Planning Recommandé</Text>
          <Text style={[styles.sectionSub, { color: themeColors.onSurfaceVariant }]}>Généré selon vos priorités d'Eisenhower.</Text>
          
          {schedule.length === 0 ? (
            <Text style={{color: '#888', fontStyle: 'italic', marginTop: 12}}>Aucune tâche prévue aujourd'hui.</Text>
          ) : (
            <View style={styles.timeline}>
              {schedule.map((item, idx) => (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timeColumn}>
                    <Text style={[styles.timeText, { color: themeColors.onSurfaceVariant }]}>{item.startTime}</Text>
                    <Text style={[styles.timeTextSub, { color: themeColors.outline }]}>{item.endTime}</Text>
                  </View>
                  
                  <View style={styles.timelineLine}>
                    <View style={[styles.timelineDot, { backgroundColor: item.type === 'break' ? themeColors.outline : themeColors.primary }]} />
                    {idx !== schedule.length - 1 && <View style={[styles.timelineStick, { backgroundColor: themeColors.surfaceVariant }]} />}
                  </View>
                  
                  <View style={[styles.timelineContent, item.type === 'break' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: themeColors.surfaceVariant, borderStyle: 'dashed' }]}>
                    <Text style={[styles.timelineTitle, { color: item.type === 'break' ? themeColors.outline : themeColors.onSurface }]}>
                      {item.type === 'break' ? '☕ ' : ''}{item.title}
                    </Text>
                    {item.task?.quadrant && (
                      <Text style={[styles.timelineTag, { color: themeColors.primary }]}>{item.task.quadrant}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{height: 60}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginBottom: 24, marginTop: 12 },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 16, textTransform: 'capitalize' },
  
  card: { padding: 20, borderRadius: 16, marginBottom: 24 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardMessage: { fontSize: 14, lineHeight: 20 },
  
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  sectionSub: { fontSize: 14, marginBottom: 16 },
  
  alertCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  alertMessage: { fontSize: 14, fontWeight: '500', marginBottom: 16, lineHeight: 20 },
  alertActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  insightCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  insightText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },

  timeline: { marginTop: 12 },
  timelineRow: { flexDirection: 'row' },
  timeColumn: { width: 60, alignItems: 'flex-end', paddingTop: 16, paddingRight: 12 },
  timeText: { fontSize: 14, fontWeight: 'bold' },
  timeTextSub: { fontSize: 10 },
  
  timelineLine: { width: 20, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 18 },
  timelineStick: { width: 2, flex: 1, marginTop: 4 },
  
  timelineContent: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f4f4f5', marginBottom: 12, marginTop: 4, minHeight: 60, justifyContent: 'center' },
  timelineTitle: { fontSize: 14, fontWeight: '600' },
  timelineTag: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
});
