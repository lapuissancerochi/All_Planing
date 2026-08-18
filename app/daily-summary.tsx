import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { gamificationEngine } from '@/utils/gamificationEngine';

export default function DailySummaryScreen() {
  const router = useRouter();
  const { tasks, gameStats, habits } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const today = new Date().toISOString().split('T')[0];

  // Statistiques du jour
  const todayTasks = tasks.filter(t => t.created_at?.startsWith(today) || t.date === today || (t.status === 'done' && gameStats.lastXpDate === today));
  const completedToday = todayTasks.filter(t => t.status === 'done').length;
  const postponedToday = todayTasks.filter(t => t.postponedCount && t.postponedCount > 0).length; // Approximatif
  const nonCompletedToday = todayTasks.length - completedToday;
  
  const focusHours = Math.floor(gameStats.focusTimeTotal / 3600);
  const focusMins = Math.floor((gameStats.focusTimeTotal % 3600) / 60);

  const habitsDone = habits.filter(h => h.completionHistory.includes(today)).length;

  const xpEarned = gameStats.dailyXpEarned;

  const insight = gamificationEngine.generateInsights(gameStats, tasks);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.surfaceBright }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{marginBottom: 16}}>
            <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={24} tintColor={themeColors.onSurface} />
          </Pressable>
          <Text style={[styles.title, { color: themeColors.onSurface }]}>🌙 Bilan de votre journée</Text>
          <Text style={[styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
            Vous aviez {todayTasks.length} tâches prévues.
          </Text>
        </View>

        {/* ACCOMPLISSEMENTS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>🏆 Accomplissements</Text>
          
          <View style={[styles.statsCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
            <View style={styles.statRow}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={[styles.statText, { color: themeColors.onSurface }]}>{completedToday} terminées</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statIcon}>🔄</Text>
              <Text style={[styles.statText, { color: themeColors.onSurfaceVariant }]}>{postponedToday} reportées</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statIcon}>❌</Text>
              <Text style={[styles.statText, { color: themeColors.error }]}>{nonCompletedToday} non terminées</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: themeColors.surfaceVariant }]} />
            
            <View style={styles.statRow}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={[styles.statText, { color: themeColors.onSurface }]}>Temps productif : {focusHours}h {focusMins}m</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={[styles.statText, { color: themeColors.onSurface }]}>{gameStats.q1Completed} tâches prioritaires terminées</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={[styles.statText, { color: themeColors.onSurface }]}>Habitudes : {habitsDone}/{habits.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={[styles.statText, { color: themeColors.primary, fontWeight: 'bold' }]}>XP gagné : +{xpEarned} XP</Text>
            </View>
          </View>
        </View>

        {/* ANALYSE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>🧠 Analyse</Text>
          <View style={[styles.insightCard, { backgroundColor: themeColors.primaryContainer }]}>
            <Text style={[styles.insightText, { color: themeColors.onPrimaryContainer }]}>
              {completedToday > 0 ? `Bonne journée ! Tu as terminé ${Math.round((completedToday/todayTasks.length)*100)}% de tes tâches.\n\n` : ''}
              {insight}
            </Text>
          </View>
        </View>

        {/* PREPARER DEMAIN */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>🌅 Demain</Text>
          <Pressable 
            style={[styles.btn, { backgroundColor: themeColors.tint }]}
            onPress={() => router.replace('/(tabs)/dashboard')}
          >
            <Text style={styles.btnText}>Préparer ma journée de demain →</Text>
          </Pressable>
        </View>

        <View style={{height: 60}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginBottom: 32, marginTop: 12 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  
  statsCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statIcon: { fontSize: 20, marginRight: 12, width: 24, textAlign: 'center' },
  statText: { fontSize: 16, fontWeight: '500' },
  divider: { height: 1, width: '100%', marginVertical: 12 },
  
  insightCard: { padding: 20, borderRadius: 16 },
  insightText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },

  btn: { padding: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
