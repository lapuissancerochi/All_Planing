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
    <ScrollView style={[styles.container, { backgroundColor: interpretation.color + '10' }]} showsVerticalScrollIndicator={false}>
      
      {/* CITATION DU JOUR */}
      <View style={[styles.quoteCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF', borderLeftColor: interpretation.color }]}>
        <Text style={styles.quoteText}>"{dailyQuote}"</Text>
      </View>

      {/* HEADER : ENERGY SCORE */}
      <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
        <View style={styles.scoreHeader}>
          <Text style={styles.cardTitle}>Energy Score</Text>
          <Pressable style={styles.infoBtn} onPress={showScoreExplanation}>
            <SymbolView name={{ ios: 'info.circle', android: 'info', web: 'info' }} size={20} tintColor="#888" />
            <Text style={styles.infoText}>Pourquoi ce score ?</Text>
          </Pressable>
        </View>
        
        <View style={styles.scoreCircleContainer}>
          <View style={[styles.scoreCircle, { borderColor: interpretation.color }]}>
            <Text style={[styles.scoreNumber, { color: interpretation.color }]}>{score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </View>
        
        <Text style={[styles.scoreInterpretation, { color: interpretation.color }]}>
          {interpretation.text}
        </Text>
        
        <View style={styles.scoreDetailsRow}>
          <View style={styles.scoreDetailItem}>
            <Text style={styles.detailValue}>{tasksCompletedToday}</Text>
            <Text style={styles.detailLabel}>Tâches</Text>
          </View>
          <View style={styles.scoreDetailItem}>
            <Text style={styles.detailValue}>{focusSessionsCompletedToday}</Text>
            <Text style={styles.detailLabel}>Focus</Text>
          </View>
          <View style={styles.scoreDetailItem}>
            <Text style={styles.detailValue}>{tasksCreatedToday}</Text>
            <Text style={styles.detailLabel}>Ajouts</Text>
          </View>
        </View>
      </View>

      {/* TOP 3 PRIORITÉS */}
      <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
        <View style={styles.topTasksHeader}>
          <Text style={styles.cardTitle}>Top 3 Priorités (Q1)</Text>
          <Pressable onPress={() => router.push('/matrix')}>
            <Text style={{ color: themeColors.tint, fontSize: 13, fontWeight: 'bold' }}>Voir toutes</Text>
          </Pressable>
        </View>
        {top3Tasks.length === 0 ? (
          <Text style={styles.emptyText}>Aucune priorité définie pour le moment.</Text>
        ) : (
          top3Tasks.map((task, index) => (
            <View key={task.id} style={styles.topTaskRow}>
              <View style={[styles.topTaskRank, { backgroundColor: themeColors.tint + '20' }]}>
                <Text style={[styles.rankText, { color: themeColors.tint }]}>{index + 1}</Text>
              </View>
              <Text style={styles.topTaskTitle} numberOfLines={1}>{task.title}</Text>
            </View>
          ))
        )}
      </View>

      {/* AUTRES STATS */}
      <View style={styles.statsRow}>
        <View style={[styles.halfCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
          <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={24} tintColor={themeColors.tint} />
          <Text style={styles.statValue}>{estimatedHours}h{estimatedMins > 0 ? estimatedMins.toString().padStart(2, '0') : ''}</Text>
          <Text style={styles.statLabel}>Temps estimé</Text>
        </View>
        
        <View style={[styles.halfCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
          <SymbolView name={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }} size={24} tintColor="#FFB84B" />
          <View style={styles.miniChartPlaceholder}>
            <View style={[styles.bar, { height: 20 }]} />
            <View style={[styles.bar, { height: 40 }]} />
            <View style={[styles.bar, { height: 30 }]} />
            <View style={[styles.bar, { height: 60 }]} />
            <View style={[styles.bar, { height: 50 }]} />
            <View style={[styles.bar, { height: score * 0.8, backgroundColor: interpretation.color }]} />
          </View>
          <Text style={styles.statLabel}>7 derniers jours</Text>
        </View>
      </View>

      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  quoteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    fontWeight: '500',
  },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#88888815',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  topTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
    marginTop: 20,
  },
  scoreInterpretation: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 24,
  },
  scoreDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#88888820',
    paddingTop: 16,
  },
  scoreDetailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 12,
  },
  topTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  topTaskRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  topTaskTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  halfCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  miniChartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  bar: {
    width: 12,
    backgroundColor: '#88888840',
    borderRadius: 4,
  }
});
