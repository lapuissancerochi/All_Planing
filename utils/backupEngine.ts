import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useTaskStore } from '@/store/useTaskStore';

const BACKUP_VERSION = 1;

export const backupEngine = {
  
  async exportData() {
    try {
      const state = useTaskStore.getState();
      
      const backup = {
        backupVersion: BACKUP_VERSION,
        exportedAt: Date.now(),
        appVersion: '1.0.0',
        data: {
          tasks: state.tasks,
          goals: state.goals,
          projects: state.projects,
          habits: state.habits,
          xp: state.xp,
          level: state.level,
          badges: state.badges,
          gameStats: state.gameStats,
          monthlyGoal: state.monthlyGoal,
          streakDays: state.streakDays
        }
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `ALLPLANING_backup_${dateStr}.json`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2), {
        encoding: FileSystem.EncodingType.UTF8
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Exporter les données ALLPLANING',
          UTI: 'public.json'
        });
      } else {
        Alert.alert('Erreur', 'Le partage de fichiers n\'est pas disponible sur cet appareil.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    }
  },

  async importData() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8
      });

      let parsed;
      try {
        parsed = JSON.parse(fileContent);
      } catch (e) {
        Alert.alert('Format invalide', 'Le fichier sélectionné n\'est pas un fichier JSON valide.');
        return;
      }

      if (!parsed.backupVersion || !parsed.data) {
        Alert.alert('Fichier non reconnu', 'Ce fichier ne correspond pas à une sauvegarde ALLPLANING valide.');
        return;
      }

      // VÉRIFICATION DE MIGRATION FUTURE ICI SI backupVersion > 1
      
      const { data } = parsed;
      const taskCount = data.tasks?.length || 0;
      const projectCount = data.projects?.length || 0;
      const habitCount = data.habits?.length || 0;
      const lvl = data.level || 1;

      Alert.alert(
        'Importer cette sauvegarde ?',
        `Elle contient :\n📝 ${taskCount} tâches\n🚀 ${projectCount} projets\n🔥 ${habitCount} habitudes\n🏆 Niveau ${lvl}\n\nCette opération remplacera vos données actuelles.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Importer', 
            style: 'destructive',
            onPress: () => {
              useTaskStore.setState({
                tasks: data.tasks || [],
                goals: data.goals || [],
                projects: data.projects || [],
                habits: data.habits || [],
                xp: data.xp || 0,
                level: data.level || 1,
                badges: data.badges || [],
                gameStats: data.gameStats || useTaskStore.getState().gameStats,
                monthlyGoal: data.monthlyGoal || '',
                streakDays: data.streakDays || 1
              });
              Alert.alert('Succès', 'Vos données ont été restaurées avec succès.');
            }
          }
        ]
      );

    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de lire le fichier de sauvegarde.');
    }
  }

};
