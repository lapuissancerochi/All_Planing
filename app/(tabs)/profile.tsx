import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { useTaskStore } from '@/store/useTaskStore';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BADGES, gamificationEngine } from '@/utils/gamificationEngine';

export default function ProfileScreen() {
  const { xp, level, badges, gameStats, tasks } = useTaskStore();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const { nextLevelXp, progressPercent } = gamificationEngine.calculateLevel(xp);
  
  // Analyse des stats rapides
  let bestHour = -1;
  let maxTasks = 0;
  Object.entries(gameStats.tasksCompletedByHour).forEach(([hour, count]) => {
    if (count > maxTasks) {
      maxTasks = count;
      bestHour = parseInt(hour);
    }
  });

  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) 
    : 0;

  const focusHours = Math.floor(gameStats.focusTimeTotal / 3600);
  const focusMins = Math.floor((gameStats.focusTimeTotal % 3600) / 60);

  const lateTasks = tasks.filter(t => {
    if (t.status === 'done' || !t.date) return false;
    const due = new Date(t.date);
    due.setHours(23, 59, 59);
    return new Date() > due;
  }).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.surfaceBright }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER PROFIL */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.onSurface }]}>Mon Profil</Text>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
          <View style={styles.profileHeaderRow}>
            <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.avatarText}>R</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={[styles.name, { color: themeColors.onSurface }]}>Rochi</Text>
              <Text style={[styles.levelText, { color: themeColors.onSurfaceVariant }]}>Niveau {level} • Productivité</Text>
            </View>
          </View>

          <View style={styles.xpContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: themeColors.primary }]} />
            </View>
            <Text style={[styles.xpText, { color: themeColors.outline }]}>{xp} / {nextLevelXp} XP</Text>
          </View>
        </View>

        {/* BADGES */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>🏆 Mes Badges</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map(badge => {
              const isUnlocked = badges.includes(badge.id);
              return (
                <View key={badge.id} style={[styles.badgeItem, { opacity: isUnlocked ? 1 : 0.4 }]}>
                  <View style={[styles.badgeCircle, { backgroundColor: isUnlocked ? themeColors.primaryContainer : themeColors.surfaceVariant }]}>
                    <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                  </View>
                  <Text style={[styles.badgeName, { color: themeColors.onSurface }]} numberOfLines={2}>{badge.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* INSIGHTS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>📊 Mes Insights</Text>
          
          <View style={styles.insightsGrid}>
            <View style={[styles.insightCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
              <Text style={styles.insightIcon}>⏰</Text>
              <Text style={[styles.insightLabel, { color: themeColors.onSurfaceVariant }]}>Heure la plus productive</Text>
              <Text style={[styles.insightValue, { color: themeColors.onSurface }]}>
                {bestHour !== -1 ? `${bestHour}h00 - ${bestHour+1}h00` : '--h--'}
              </Text>
            </View>

            <View style={[styles.insightCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
              <Text style={styles.insightIcon}>✅</Text>
              <Text style={[styles.insightLabel, { color: themeColors.onSurfaceVariant }]}>Taux de complétion</Text>
              <Text style={[styles.insightValue, { color: themeColors.onSurface }]}>{completionRate}%</Text>
            </View>

            <View style={[styles.insightCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
              <Text style={styles.insightIcon}>⏱️</Text>
              <Text style={[styles.insightLabel, { color: themeColors.onSurfaceVariant }]}>Temps Focus</Text>
              <Text style={[styles.insightValue, { color: themeColors.onSurface }]}>{focusHours}h {focusMins}m</Text>
            </View>

            <View style={[styles.insightCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
              <Text style={styles.insightIcon}>🎯</Text>
              <Text style={[styles.insightLabel, { color: themeColors.onSurfaceVariant }]}>Tâches Q1 terminées</Text>
              <Text style={[styles.insightValue, { color: themeColors.onSurface }]}>{gameStats.q1Completed}</Text>
            </View>
          </View>

          {lateTasks > 0 && (
            <View style={[styles.lateCard, { backgroundColor: themeColors.errorContainer }]}>
              <Text style={[styles.lateCardText, { color: themeColors.error }]}>🔴 Tâches en retard : {lateTasks}</Text>
            </View>
          )}

        </View>

        {/* PARAMÈTRES (EXPORT/IMPORT) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>⚙️ Paramètres & Données</Text>
          
          <View style={[styles.settingsCard, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.surfaceVariant }]}>
            <Text style={[styles.settingsDesc, { color: themeColors.onSurfaceVariant }]}>
              ALLPLANING est 100% hors-ligne. Vous pouvez sauvegarder vos données sous forme de fichier pour les sécuriser ou les transférer.
            </Text>
            
            <View style={styles.settingsButtonsRow}>
              <Pressable 
                style={[styles.settingsBtn, { backgroundColor: themeColors.primary, flex: 1, marginRight: 8 }]}
                onPress={() => {
                  const { backupEngine } = require('@/utils/backupEngine');
                  backupEngine.exportData();
                }}
              >
                <Text style={styles.settingsBtnText}>Exporter mes données</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.settingsBtn, { backgroundColor: themeColors.surfaceVariant, flex: 1, marginLeft: 8 }]}
                onPress={() => {
                  const { backupEngine } = require('@/utils/backupEngine');
                  backupEngine.importData();
                }}
              >
                <Text style={[styles.settingsBtnText, { color: themeColors.onSurface }]}>Importer (Restaurer)</Text>
              </Pressable>
            </View>
          </View>
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
  
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  levelInfo: { flex: 1 },
  name: { fontSize: 24, fontWeight: 'bold' },
  levelText: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  
  xpContainer: { marginTop: 8 },
  progressBarBg: { height: 12, backgroundColor: '#E5E5EA', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 6 },
  xpText: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
  badgeItem: { width: '22%', alignItems: 'center', marginBottom: 8 },
  badgeCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeEmoji: { fontSize: 28 },
  badgeName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

  insightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  insightCard: { width: '48%', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 4 },
  insightIcon: { fontSize: 24, marginBottom: 8 },
  insightLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  insightValue: { fontSize: 18, fontWeight: 'bold' },

  lateCard: { padding: 16, borderRadius: 16, marginTop: 12, alignItems: 'center' },
  lateCardText: { fontSize: 16, fontWeight: 'bold' },

  settingsCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  settingsDesc: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  settingsButtonsRow: { flexDirection: 'row' },
  settingsBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingsBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
