import { useTaskStore } from '@/store/useTaskStore';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';

export const exportData = async () => {
  try {
    const state = useTaskStore.getState();
    const json = JSON.stringify(state, null, 2);

    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `allplaning_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const path = `${FileSystem.documentDirectory}allplaning_backup.json`;
    await FileSystem.writeAsStringAsync(path, json);
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(path);
    } else {
      Alert.alert('Erreur', 'Le partage n\'est pas disponible sur cet appareil.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    Alert.alert('Erreur', 'Impossible d\'exporter les données.');
  }
};

export const importData = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      const fileUri = result.assets[0].uri;
      
      let json = '';
      if (Platform.OS === 'web') {
        const file = result.assets[0].file;
        if (file) {
          json = await file.text();
        }
      } else {
        json = await FileSystem.readAsStringAsync(fileUri);
      }
      
      if (json) {
        const data = JSON.parse(json);
        if (data.tasks) {
          useTaskStore.setState(data);
          Alert.alert('Succès', 'Vos données ont été restaurées avec succès !');
        } else {
          Alert.alert('Erreur', 'Ce fichier ne semble pas être une sauvegarde ALLPLANING valide.');
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    Alert.alert('Erreur', 'Impossible de lire le fichier de sauvegarde.');
  }
};
