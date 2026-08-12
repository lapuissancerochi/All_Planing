import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { tasks, focusSessionsCompletedToday, tasksCompletedToday, tasksCreatedToday, checkAndResetDailyStats } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const router = useRouter();


  useEffect(() => {
    checkAndResetDailyStats();
  }, []);

  // --- CALCUL DE L'ENERGY SCORE ---
  const getEnergyScore = () => {
    // 1. Exécution (40%) : Tâches terminées / Tâches créées (ou planifiées)
    const execRatio = tasksCreatedToday > 0 ? (tasksCompletedToday / tasksCreatedToday) : (tasksCompletedToday > 0 ? 1 : 0);
    const execScore = Math.min(1, execRatio) * 40;

    // 2. Priorisation (35%) : % de tâches bien classées terminées (Q1 & Q2)
    const completedTasks = tasks.filter(t => t.status === 'done');
    const goodPrioTasks = completedTasks.filter(t => t.quadrant === 'Q1' || t.quadrant === 'Q2');
    const prioRatio = completedTasks.length > 0 ? (goodPrioTasks.length / completedTasks.length) : 0;
    const prioScore = prioRatio * 35;

    // 3. Discipline (25%) : Sessions focus complétées (Objectif arbitraire de 4 par jour pour le 100%)
    const focusRatio = Math.min(1, focusSessionsCompletedToday / 4);
    const focusScore = focusRatio * 25;

    return Math.round(execScore + prioScore + focusScore);
  };

  const score = getEnergyScore();

  const getScoreInterpretation = (s: number) => {
    if (s >= 80) return { text: "🔥 Journée de feu ! Vous êtes en zone de flow.", color: '#FF4B4B' };
    if (s >= 60) return { text: "💪 Bonne journée, vous êtes sur la bonne voie.", color: '#4B88FF' };
    if (s >= 40) return { text: "🤔 Une journée moyenne, identifions les blocages.", color: '#FFB84B' };
    return { text: "🛑 Prenez votre temps. Commencez par une petite tâche.", color: '#888888' };
  };

  const interpretation = getScoreInterpretation(score);

  const showScoreExplanation = () => {
    Alert.alert(
      "Pourquoi ce score ?",
      "Votre Energy Score est composé de 3 éléments :\n\n1. Exécution (40%) : Tâches terminées vs créées.\n2. Priorisation (35%) : Vos tâches Q1/Q2 terminées.\n3. Discipline (25%) : Vos sessions Focus complétées.\n\nContinuez vos efforts !"
    );
  };

  // --- STATISTIQUES DU JOUR ---
  const top3Tasks = tasks.filter(t => t.status !== 'done' && (t.quadrant === 'Q1' || t.quadrant === 'Q2')).slice(0, 3);
  const estimatedTime = tasks.filter(t => t.status !== 'done').length * 25; // 25 min par tâche
  const estimatedHours = Math.floor(estimatedTime / 60);
  const estimatedMins = estimatedTime % 60;

  // Citation aléatoire simple
  const quotes = [
    "Le futur dépend de ce que vous faites aujourd'hui. - Gandhi",
    "Faites de chaque jour un chef-d'œuvre. - John Wooden",
    "La clé n'est pas de dépenser le temps, mais de l'investir. - S. Covey",
    "Ne comptez pas les jours, faites que les jours comptent. - M. Ali"
  ];
  const dailyQuote = quotes[new Date().getDay() % quotes.length];

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.surfaceBright }]} showsVerticalScrollIndicator={false}>
      
      {/* CITATION DU JOUR */}
      <View style={[styles.quoteCard, { backgroundColor: themeColors.surfaceContainerLowest }]}>
        <Text style={[styles.quoteText, { color: themeColors.onSurfaceVariant }]}>"{dailyQuote}"</Text>
      </View>

      {/* HEADER : ENERGY SCORE */}
      <View style={[styles.card, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
        <View style={styles.scoreHeader}>
          <Text style={[styles.cardTitle, { color: themeColors.onSurface }]}>Energy Score</Text>
          <Pressable style={[styles.infoBtn, { backgroundColor: themeColors.surfaceContainer }]} onPress={showScoreExplanation}>
            <SymbolView name={{ ios: 'info.circle', android: 'info', web: 'info' }} size={16} tintColor={themeColors.onSurfaceVariant} />
            <Text style={[styles.infoText, { color: themeColors.onSurfaceVariant }]}>Détails</Text>
          </Pressable>
        </View>
        
        <View style={styles.scoreCircleContainer}>
          <View style={[styles.scoreCircle, { borderColor: interpretation.color + '40', borderLeftColor: interpretation.color, borderTopColor: interpretation.color }]}>
            <Text style={[styles.scoreNumber, { color: themeColors.onSurface }]}>{score}%</Text>
          </View>
        </View>
        
        <View style={[styles.interpretationBadge, { backgroundColor: interpretation.color + '20', borderColor: interpretation.color + '40' }]}>
          <Text style={[styles.scoreInterpretation, { color: interpretation.color }]}>
            {interpretation.text}
          </Text>
        </View>
        
        <View style={styles.scoreDetailsRow}>
          <View style={styles.scoreDetailItem}>
            <Text style={[styles.detailValue, { color: themeColors.onSurface }]}>{tasksCompletedToday}</Text>
            <Text style={[styles.detailLabel, { color: themeColors.outline }]}>Tâches</Text>
          </View>
          <View style={styles.scoreDetailItem}>
            <Text style={[styles.detailValue, { color: themeColors.onSurface }]}>{focusSessionsCompletedToday}</Text>
            <Text style={[styles.detailLabel, { color: themeColors.outline }]}>Focus</Text>
          </View>
          <View style={styles.scoreDetailItem}>
            <Text style={[styles.detailValue, { color: themeColors.onSurface }]}>{tasksCreatedToday}</Text>
            <Text style={[styles.detailLabel, { color: themeColors.outline }]}>Ajouts</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        {/* FOCUS MODE CARD */}
        <View style={[styles.halfCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
          <View style={styles.focusHeader}>
            <Text style={[styles.cardTitle, { color: themeColors.onSurface, fontSize: 16 }]}>Focus Mode</Text>
            <SymbolView name={{ ios: 'timer', android: 'timer', web: 'timer' }} size={16} tintColor={themeColors.outline} />
          </View>
          <View style={styles.focusCenter}>
            <Text style={[styles.focusTime, { color: themeColors.onSurface }]}>25:00</Text>
            <Text style={[styles.focusLabel, { color: themeColors.outline }]}>POMODORO</Text>
          </View>
          <Pressable style={[styles.focusPlayBtn, { backgroundColor: themeColors.onSurface }]} onPress={() => router.push('/focus')}>
            <SymbolView name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }} size={24} tintColor={themeColors.surfaceBright} />
          </Pressable>
        </View>

        {/* TOP 3 PRIORITÉS */}
        <View style={[styles.halfCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant, padding: 16 }]}>
          <View style={styles.topTasksHeader}>
            <Text style={[styles.cardTitle, { color: themeColors.onSurface, fontSize: 16 }]}>Priorités</Text>
          </View>
          {top3Tasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: themeColors.outline }]}>Aucune urgence.</Text>
          ) : (
            top3Tasks.map((task, index) => (
              <View key={task.id} style={styles.topTaskRow}>
                <View style={[styles.topTaskRank, { backgroundColor: themeColors.q1Container }]}>
                  <Text style={[styles.rankText, { color: themeColors.q1 }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.topTaskTitle, { color: themeColors.onSurface }]} numberOfLines={1}>{task.title}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#1c1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
  },
  quoteCard: { paddingVertical: 24, alignItems: 'center' },
  quoteText: { fontSize: 20, fontStyle: 'italic', fontWeight: '300', textAlign: 'center', opacity: 0.8 },
  
  infoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  infoText: { fontSize: 12, fontWeight: '600' },
  
  topTasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '600' },
  
  scoreCircleContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  scoreCircle: {
    width: 160, height: 160, borderRadius: 80, borderWidth: 8,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '-45deg' }]
  },
  scoreNumber: { fontSize: 56, fontWeight: '700', transform: [{ rotate: '45deg' }] },
  
  interpretationBadge: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  scoreInterpretation: { fontSize: 14, fontWeight: '600' },
  
  scoreDetailsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16 },
  scoreDetailItem: { alignItems: 'center' },
  detailValue: { fontSize: 24, fontWeight: '700' },
  detailLabel: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  
  emptyText: { fontStyle: 'italic', marginTop: 12, fontSize: 14 },
  topTaskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  topTaskRank: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankText: { fontWeight: 'bold', fontSize: 12 },
  topTaskTitle: { fontSize: 14, fontWeight: '500', flex: 1 },
  
  statsRow: { flexDirection: 'row', gap: 16 },
  halfCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#1c1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
    alignItems: 'center',
  },
  focusHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  focusCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 16 },
  focusTime: { fontSize: 40, fontWeight: '700' },
  focusLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '600', marginTop: 4 },
  focusPlayBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#1c1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
});
