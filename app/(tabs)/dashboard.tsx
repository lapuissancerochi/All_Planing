import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { analyzeTask } from '@/utils/priorityEngine';

export default function DashboardScreen() {
  const { tasks, projects, habits, goals, toggleHabit } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // --- 1. PRIORITES ---
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const tasksWithDetails = activeTasks.map(t => ({ task: t, details: analyzeTask(t) }));
  
  const urgentes = tasksWithDetails.filter(t => t.details.quadrant === 'Q1').length;
  const importantes = tasksWithDetails.filter(t => t.details.quadrant === 'Q2').length;
  const planifiees = activeTasks.length - urgentes - importantes; // Simplification pour la vue

  const topTask = tasksWithDetails
    .filter(t => t.details.quadrant === 'Q1' || t.details.quadrant === 'Q2')
    .sort((a, b) => b.details.priorityScore - a.details.priorityScore)[0]?.task;

  // --- 2. PROJETS ---
  const activeProjects = projects.filter(p => p.status === 'active');
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  // --- 3. HABITUDES ---
  const todayISO = new Date().toISOString().split('T')[0];

  // --- 4. OBJECTIFS ---
  const getGoalProgress = (goalId: string) => {
    const gProjects = projects.filter(p => p.goalId === goalId);
    if (gProjects.length === 0) return 0;
    const totalProgress = gProjects.reduce((acc, p) => acc + getProjectProgress(p.id), 0);
    return Math.round(totalProgress / gProjects.length);
  };

  // --- 5. COACH WIDGET ---
  const { analyzeDailyLoad, detectProcrastination } = require('@/utils/coachEngine').coachEngine;
  const loadAnalysis = analyzeDailyLoad(tasks);
  const procrastinationCount = detectProcrastination(tasks).length;

  const currentHour = new Date().getHours();
  const showBilan = currentHour >= 18;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.onSurface }]}>Aujourd'hui</Text>
          <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* BILAN WIDGET (> 18h) */}
        {showBilan && (
          <Pressable 
            style={[styles.bilanWidget, { backgroundColor: themeColors.surfaceContainerHighest, borderColor: themeColors.primary }]}
            onPress={() => router.push('/daily-summary')}
          >
            <Text style={[styles.bilanWidgetTitle, { color: themeColors.onSurface }]}>🌙 Votre journée est presque terminée</Text>
            <Text style={[styles.bilanWidgetMessage, { color: themeColors.onSurfaceVariant }]}>
              Consultez votre bilan quotidien et préparez demain.
            </Text>
            <View style={styles.bilanBtnRow}>
              <Text style={[styles.bilanBtnText, { color: themeColors.primary }]}>Voir mon bilan →</Text>
            </View>
          </Pressable>
        )}

        {/* WIDGET COACH */}
        <Pressable 
          style={[styles.coachWidget, { backgroundColor: loadAnalysis.status === '🔴' ? themeColors.errorContainer : loadAnalysis.status === '🟡' ? themeColors.q2Container : themeColors.surfaceContainerHigh }]}
          onPress={() => router.push('/(tabs)/coach')}
        >
          <View style={styles.coachWidgetHeader}>
            <SymbolView name={{ ios: 'brain', android: 'psychology', web: 'psychology' }} size={24} tintColor={themeColors.onSurface} />
            <Text style={[styles.coachWidgetTitle, { color: themeColors.onSurface }]}>Coach IA</Text>
          </View>
          <Text style={[styles.coachWidgetMessage, { color: themeColors.onSurfaceVariant }]}>
            {loadAnalysis.status} {loadAnalysis.message}
          </Text>
          {procrastinationCount > 0 && (
            <Text style={[styles.coachWidgetAlert, { color: themeColors.error }]}>
              ⚠️ {procrastinationCount} tâche(s) en stagnation.
            </Text>
          )}
        </Pressable>

        {/* SECTION 1 : PRIORITÉS */}
        <View style={[styles.card, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: themeColors.onSurface }]}>Priorités</Text>
            {topTask && (
              <Pressable style={[styles.playBtn, { backgroundColor: themeColors.onSurface }]} onPress={() => router.push(`/focus?id=${topTask.id}`)}>
                <SymbolView name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }} size={16} tintColor={themeColors.surfaceBright} />
                <Text style={[styles.playBtnText, { color: themeColors.surfaceBright }]}>Focus</Text>
              </Pressable>
            )}
          </View>
          
          <View style={styles.prioritiesRow}>
            <View style={styles.priorityItem}>
              <View style={[styles.priorityBadge, { backgroundColor: themeColors.q1Container }]}>
                <Text style={[styles.priorityNumber, { color: themeColors.q1 }]}>{urgentes}</Text>
              </View>
              <Text style={[styles.priorityLabel, { color: themeColors.onSurfaceVariant }]}>Urgentes</Text>
            </View>
            <View style={styles.priorityItem}>
              <View style={[styles.priorityBadge, { backgroundColor: themeColors.q2Container }]}>
                <Text style={[styles.priorityNumber, { color: themeColors.q2 }]}>{importantes}</Text>
              </View>
              <Text style={[styles.priorityLabel, { color: themeColors.onSurfaceVariant }]}>Importantes</Text>
            </View>
            <View style={styles.priorityItem}>
              <View style={[styles.priorityBadge, { backgroundColor: themeColors.surfaceContainerHigh }]}>
                <Text style={[styles.priorityNumber, { color: themeColors.onSurface }]}>{planifiees}</Text>
              </View>
              <Text style={[styles.priorityLabel, { color: themeColors.onSurfaceVariant }]}>Autres</Text>
            </View>
          </View>
        </View>

        {/* SECTION 2 : MES PROJETS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>Mes Projets</Text>
          <Pressable onPress={() => router.push('/add-project')}>
            <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} size={24} tintColor={themeColors.primary} />
          </Pressable>
        </View>

        {activeProjects.length === 0 ? (
          <Text style={styles.emptyText}>Aucun projet actif.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {activeProjects.map(project => {
              const progress = getProjectProgress(project.id);
              return (
                <View key={project.id} style={[styles.projectCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
                  <View style={[styles.projectColorDot, { backgroundColor: project.color }]} />
                  <Text style={[styles.projectTitle, { color: themeColors.onSurface }]} numberOfLines={1}>{project.title}</Text>
                  
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: project.color }]} />
                  </View>
                  <Text style={[styles.progressText, { color: themeColors.outline }]}>{progress}%</Text>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* SECTION 3 : MES HABITUDES */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>Mes Habitudes</Text>
          <Pressable onPress={() => router.push('/add-habit')}>
            <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} size={24} tintColor={themeColors.q3} />
          </Pressable>
        </View>

        {habits.length === 0 ? (
          <Text style={styles.emptyText}>Aucune habitude configurée.</Text>
        ) : (
          <View style={styles.habitsContainer}>
            {habits.map(habit => {
              const isCompleted = habit.completionHistory.includes(todayISO);
              return (
                <View key={habit.id} style={[styles.habitRow, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitTitle, { color: themeColors.onSurface }]} numberOfLines={1}>{habit.title}</Text>
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakText}>🔥 {habit.streak} jours</Text>
                    </View>
                  </View>
                  <Pressable 
                    style={[styles.habitCheckBtn, isCompleted && { backgroundColor: '#34C759', borderColor: '#34C759' }]}
                    onPress={() => toggleHabit(habit.id)}
                  >
                    {isCompleted && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={16} tintColor="#fff" />}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* SECTION 4 : MES OBJECTIFS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>Mes Objectifs</Text>
          <Pressable onPress={() => router.push('/add-goal')}>
            <SymbolView name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }} size={24} tintColor={themeColors.q4} />
          </Pressable>
        </View>

        {goals.length === 0 ? (
          <Text style={styles.emptyText}>Aucun objectif à long terme.</Text>
        ) : (
          <View style={styles.goalsContainer}>
            {goals.map(goal => {
              const progress = getGoalProgress(goal.id);
              return (
                <View key={goal.id} style={[styles.goalCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
                  <View style={styles.goalHeaderRow}>
                    <SymbolView name={{ ios: 'target', android: 'track_changes', web: 'track_changes' }} size={20} tintColor={themeColors.onSurface} />
                    <Text style={[styles.goalTitle, { color: themeColors.onSurface }]} numberOfLines={1}>{goal.title}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: themeColors.onSurface }]} />
                  </View>
                  <Text style={[styles.progressText, { color: themeColors.outline, textAlign: 'right' }]}>{progress}%</Text>
                </View>
              );
            })}
          </View>
        )}

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
  
  card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 32 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: '600' },
  playBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  playBtnText: { fontSize: 12, fontWeight: 'bold' },
  prioritiesRow: { flexDirection: 'row', justifyContent: 'space-around' },
  priorityItem: { alignItems: 'center' },
  priorityBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  priorityNumber: { fontSize: 20, fontWeight: 'bold' },
  priorityLabel: { fontSize: 12, fontWeight: '500' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold' },
  
  emptyText: { fontStyle: 'italic', color: '#888', marginBottom: 24 },
  
  bilanWidget: { padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1 },
  bilanWidgetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  bilanWidgetMessage: { fontSize: 14, marginBottom: 12 },
  bilanBtnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  bilanBtnText: { fontSize: 14, fontWeight: 'bold' },

  coachWidget: { padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  coachWidgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  coachWidgetTitle: { fontSize: 16, fontWeight: 'bold' },
  coachWidgetMessage: { fontSize: 14, fontWeight: '500' },
  coachWidgetAlert: { fontSize: 12, fontWeight: 'bold', marginTop: 8 },

  horizontalScroll: { paddingBottom: 24 },
  projectCard: { width: 160, padding: 16, borderRadius: 20, borderWidth: 1, marginRight: 16 },
  projectColorDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 12 },
  projectTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  progressBarBg: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600' },
  
  habitsContainer: { gap: 12, marginBottom: 32 },
  habitRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  habitInfo: { flex: 1 },
  habitTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  streakBadge: { backgroundColor: '#FF950020', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  streakText: { color: '#FF9500', fontSize: 12, fontWeight: 'bold' },
  habitCheckBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },

  goalsContainer: { gap: 12 },
  goalCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  goalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  goalTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
});
