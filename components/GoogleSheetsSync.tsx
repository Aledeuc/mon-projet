import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { CloudSync, Plus, LogOut, ExternalLink } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import GoogleSheetsService, { GoogleAuthState, FlightData } from '../services/GoogleSheetsService';
import { useTheme } from '../theme/ThemeContext';

export const GoogleSheetsSync: React.FC = () => {
  const { colors } = useTheme();
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isConnected: false,
    sheetId: null,
    sheetName: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [manualSheetId, setManualSheetId] = useState<string>('');
  const [showSheetIdInput, setShowSheetIdInput] = useState<boolean>(false);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  useEffect(() => {
    loadAuthState();
    loadLastSyncDate();
  }, []);

  const loadAuthState = async () => {
    setIsLoading(true);
    const state = await GoogleSheetsService.getAuthState();
    setAuthState(state);
    setIsLoading(false);
  };

  const loadLastSyncDate = async () => {
    try {
      const date = await AsyncStorage.getItem('@flight_logger_last_sync');
      setLastSyncDate(date);
    } catch (error) {
      console.error('Erreur lors du chargement de la date de dernière synchronisation:', error);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    const success = await GoogleSheetsService.signIn();
    
    if (success) {
      await loadAuthState();
    } else {
      Alert.alert(
        'Échec de connexion',
        'La connexion à Google a échoué. Veuillez réessayer.'
      );
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    const success = await GoogleSheetsService.signOut();
    
    if (success) {
      setAuthState({
        isConnected: false,
        sheetId: null,
        sheetName: null,
      });
    }
    setIsLoading(false);
  };

  const handleCreateSheet = async () => {
    setIsLoading(true);
    const sheetId = await GoogleSheetsService.createSheet();
    
    if (sheetId) {
      Alert.alert(
        'Feuille créée',
        'Une nouvelle feuille de calcul a été créée pour vos données de vol.'
      );
      await loadAuthState();
    } else {
      Alert.alert(
        'Échec de création',
        'La création de la feuille de calcul a échoué. Veuillez réessayer.'
      );
    }
    setIsLoading(false);
  };

  const handleSetManualSheetId = async () => {
    if (!manualSheetId.trim()) {
      Alert.alert('ID invalide', 'Veuillez entrer un ID de feuille de calcul valide.');
      return;
    }
    
    setIsLoading(true);
    const success = await GoogleSheetsService.setSheetId(manualSheetId.trim());
    
    if (success) {
      Alert.alert(
        'ID défini',
        'L\'ID de la feuille de calcul a été défini avec succès.'
      );
      setShowSheetIdInput(false);
      setManualSheetId('');
      await loadAuthState();
    } else {
      Alert.alert(
        'ID invalide',
        'L\'ID fourni ne correspond pas à une feuille de calcul accessible. Vérifiez l\'ID et vos permissions.'
      );
    }
    setIsLoading(false);
  };

  const handleSyncFlights = async () => {
    setIsLoading(true);
    
    try {
      // Récupérer tous les vols depuis AsyncStorage
      const storedFlights = await AsyncStorage.getItem('flights');
      
      if (!storedFlights) {
        Alert.alert('Aucune donnée', 'Aucun vol à synchroniser.');
        setIsLoading(false);
        return;
      }
      
      const flights: FlightData[] = JSON.parse(storedFlights);
      
      if (flights.length === 0) {
        Alert.alert('Aucune donnée', 'Aucun vol à synchroniser.');
        setIsLoading(false);
        return;
      }
      
      const success = await GoogleSheetsService.syncFlights(flights);
      
      if (success) {
        const now = new Date().toLocaleString();
        await AsyncStorage.setItem('@flight_logger_last_sync', now);
        setLastSyncDate(now);
        
        Alert.alert(
          'Synchronisation réussie',
          `${flights.length} vol(s) ont été synchronisés avec succès.`
        );
      } else {
        Alert.alert(
          'Échec de synchronisation',
          'La synchronisation des vols a échoué. Veuillez vérifier votre connexion et réessayer.'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des vols:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la synchronisation. Veuillez réessayer.'
      );
    }
    
    setIsLoading(false);
  };

  const getSheetUrl = () => {
    if (authState.sheetId) {
      return `https://docs.google.com/spreadsheets/d/${authState.sheetId}`;
    }
    return null;
  };

  const openSheetInBrowser = async () => {
    const url = getSheetUrl();
    if (url) {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <CloudSync size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Google Sheets</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement...
          </Text>
        </View>
      ) : (
        <>
          {!authState.isConnected ? (
            <View style={styles.section}>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                Connectez-vous à Google pour synchroniser vos données de vol avec Google Sheets.
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleSignIn}>
                <Text style={[styles.buttonText, { color: colors.textInverse }]}>
                  Se connecter à Google
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={[styles.connectionStatus, { color: colors.success }]}>
                Connecté à Google
              </Text>
              
              {!authState.sheetId ? (
                <View style={styles.sheetOptions}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleCreateSheet}>
                    <Plus size={16} color={colors.textInverse} />
                    <Text style={[styles.buttonText, { color: colors.textInverse }]}>
                      Créer une nouvelle feuille
                    </Text>
                  </TouchableOpacity>
                  
                  <Text style={[styles.orText, { color: colors.textSecondary }]}>OU</Text>
                  
                  {showSheetIdInput ? (
                    <View style={styles.sheetIdInputContainer}>
                      <TextInput
                        style={[
                          styles.sheetIdInput,
                          { 
                            color: colors.textPrimary,
                            borderColor: colors.divider,
                            backgroundColor: colors.background
                          }
                        ]}
                        placeholder="ID de la feuille Google Sheets"
                        placeholderTextColor={colors.textTertiary}
                        value={manualSheetId}
                        onChangeText={setManualSheetId}
                      />
                      <TouchableOpacity
                        style={[styles.smallButton, { backgroundColor: colors.primary }]}
                        onPress={handleSetManualSheetId}>
                        <Text style={[styles.smallButtonText, { color: colors.textInverse }]}>
                          Définir
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.outlineButton, { borderColor: colors.primary }]}
                      onPress={() => setShowSheetIdInput(true)}>
                      <Text style={[styles.outlineButtonText, { color: colors.primary }]}>
                        Utiliser une feuille existante
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.sheetInfoContainer}>
                  <View style={styles.sheetInfo}>
                    <Text style={[styles.sheetName, { color: colors.textPrimary }]}>
                      {authState.sheetName || 'Feuille de calcul'}
                    </Text>
                    <TouchableOpacity 
                      style={styles.openSheetButton}
                      onPress={openSheetInBrowser}>
                      <ExternalLink size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[styles.sheetId, { color: colors.textSecondary }]}>
                    ID: {authState.sheetId}
                  </Text>
                  
                  {lastSyncDate && (
                    <Text style={[styles.lastSync, { color: colors.textTertiary }]}>
                      Dernière synchronisation: {lastSyncDate}
                    </Text>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary, marginTop: 16 }]}
                    onPress={handleSyncFlights}>
                    <CloudSync size={16} color={colors.textInverse} />
                    <Text style={[styles.buttonText, { color: colors.textInverse }]}>
                      Synchroniser maintenant
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.outlineButton, { borderColor: colors.error, marginTop: 16 }]}
                onPress={handleSignOut}>
                <LogOut size={16} color={colors.error} />
                <Text style={[styles.outlineButtonText, { color: colors.error }]}>
                  Se déconnecter
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  outlineButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  connectionStatus: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  sheetOptions: {
    marginBottom: 16,
  },
  orText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginVertical: 8,
  },
  sheetIdInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetIdInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    fontFamily: 'Inter-Regular',
  },
  smallButton: {
    padding: 12,
    borderRadius: 8,
  },
  smallButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  sheetInfoContainer: {
    marginBottom: 16,
  },
  sheetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  openSheetButton: {
    padding: 4,
  },
  sheetId: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  lastSync: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});

export default GoogleSheetsSync;
