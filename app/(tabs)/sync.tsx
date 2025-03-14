import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, Check, CircleAlert as AlertCircle, FileSpreadsheet } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, ResponseType } from 'expo-auth-session';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const GOOGLE_CLIENT_ID = "876816417530-rpv6i7g1nkvbacgaq081j0ogm8vmelrf.apps.googleusercontent.com";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

export default function SyncScreen() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);
  const [hasFlights, setHasFlights] = useState<boolean>(false);

  const redirectUri = makeRedirectUri({
    scheme: 'myapp',
    path: Platform.OS === 'web' ? '' : 'oauth2/callback',
    preferLocalhost: true,
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: [GOOGLE_SHEETS_SCOPE],
      responseType: ResponseType.Token,
      redirectUri,
      usePKCE: false,
      extraParams: {
        access_type: 'online',
        prompt: 'consent',
      },
    },
    discovery
  );

  useEffect(() => {
    loadLastSync();
    loadSpreadsheetUrl();
    checkFlights();
  }, []);

  const checkFlights = async () => {
    try {
      const storedFlights = await AsyncStorage.getItem('flights');
      const flights = storedFlights ? JSON.parse(storedFlights) : [];
      setHasFlights(flights.length > 0);
    } catch (error) {
      console.error('Error checking flights:', error);
      setHasFlights(false);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleSyncWithToken(access_token);
    } else if (response?.type === 'error') {
      setError('Authentication failed. Please try again.');
      setSyncStatus('error');
    }
  }, [response]);

  const loadLastSync = async () => {
    try {
      const lastSyncDate = await AsyncStorage.getItem('lastSync');
      if (lastSyncDate) {
        setLastSync(lastSyncDate);
      }
    } catch (error) {
      console.error('Error loading last sync date:', error);
    }
  };

  const loadSpreadsheetUrl = async () => {
    try {
      const url = await AsyncStorage.getItem('spreadsheetUrl');
      if (url) {
        setSpreadsheetUrl(url);
      }
    } catch (error) {
      console.error('Error loading spreadsheet URL:', error);
    }
  };

  const formatFlightDataForSheet = (flights) => {
    const headers = [
      'Date',
      'Type',
      'From',
      'To',
      'Departure Time',
      'Arrival Time',
      'Flight Time',
      'Registration',
      'Model',
      'Pilot',
      'Role'
    ];

    const rows = flights.map(flight => [
      new Date(flight.date).toLocaleDateString(),
      flight.type,
      flight.fromIATA,
      flight.toIATA,
      new Date(flight.departureTime).toLocaleTimeString(),
      new Date(flight.arrivalTime).toLocaleTimeString(),
      flight.flightTime,
      flight.registration,
      flight.model,
      flight.pilot,
      flight.holder
    ]);

    return [headers, ...rows];
  };

  const createSpreadsheet = async (accessToken) => {
    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `Flight Log - ${new Date().toLocaleDateString()}`,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create spreadsheet');
      }

      const data = await response.json();
      return {
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl,
      };
    } catch (error) {
      console.error('Create spreadsheet error:', error);
      throw new Error('Failed to create Google Sheet. Please try again.');
    }
  };

  const appendToSheet = async (accessToken, spreadsheetId, values) => {
    try {
      const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to append data to sheet');
      }

      return response.json();
    } catch (error) {
      console.error('Append to sheet error:', error);
      throw new Error('Failed to update Google Sheet. Please try again.');
    }
  };

  const handleSyncWithToken = async (accessToken) => {
    try {
      const storedFlights = await AsyncStorage.getItem('flights');
      const flights = storedFlights ? JSON.parse(storedFlights) : [];

      if (flights.length === 0) {
        throw new Error('No flights available to synchronize. Please add some flights first.');
      }

      const formattedData = formatFlightDataForSheet(flights);
      
      let spreadsheetId;
      if (!spreadsheetUrl) {
        const { spreadsheetId: newId, spreadsheetUrl: newUrl } = await createSpreadsheet(accessToken);
        spreadsheetId = newId;
        setSpreadsheetUrl(newUrl);
        await AsyncStorage.setItem('spreadsheetUrl', newUrl);
      } else {
        spreadsheetId = spreadsheetUrl.split('/')[5];
      }
      
      await appendToSheet(accessToken, spreadsheetId, formattedData);

      const now = new Date().toISOString();
      await AsyncStorage.setItem('lastSync', now);
      setLastSync(now);
      
      setSyncStatus('success');
      
      if (Platform.OS === 'web' && spreadsheetUrl) {
        window.open(spreadsheetUrl, '_blank');
      }
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setError(error.message || 'Sync failed. Please try again.');
      setSyncStatus('error');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  const handleSync = async () => {
    if (!hasFlights) {
      setError('No flights available to synchronize. Please add some flights first.');
      setSyncStatus('error');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
      return;
    }

    setSyncStatus('syncing');
    setError(null);

    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        const { access_token } = result.params;
        await handleSyncWithToken(access_token);
      } else if (result.type === 'error') {
        throw new Error(result.error?.message || 'Authentication failed');
      } else if (result.type === 'dismiss') {
        throw new Error('Authentication was cancelled');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
      setSyncStatus('error');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <FileSpreadsheet size={24} color="#0066cc" />
        <Text style={styles.title}>Google Sheets Sync</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.syncCard}>
          <View style={styles.statusContainer}>
            {syncStatus === 'syncing' && (
              <RefreshCw size={48} color="#0066cc" />
            )}
            {syncStatus === 'success' && (
              <Check size={48} color="#28a745" />
            )}
            {syncStatus === 'error' && (
              <AlertCircle size={48} color="#dc3545" />
            )}
            {syncStatus === 'idle' && (
              <FileSpreadsheet size={48} color="#666666" />
            )}
          </View>

          <Text style={styles.statusText}>
            {syncStatus === 'syncing' && 'Synchronization in progress...'}
            {syncStatus === 'success' && 'Synchronization successful!'}
            {syncStatus === 'error' && 'Synchronization failed'}
            {syncStatus === 'idle' && (hasFlights ? 'Ready to synchronize' : 'No flights to synchronize')}
          </Text>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {lastSync && (
            <Text style={styles.lastSyncText}>
              Last sync: {formatLastSync(lastSync)}
            </Text>
          )}

          {spreadsheetUrl && (
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.open(spreadsheetUrl, '_blank');
                }
              }}>
              <Text style={styles.viewButtonText}>
                View Google Sheet
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.syncButton,
              (syncStatus === 'syncing' || !hasFlights) && styles.syncButtonDisabled
            ]}
            onPress={handleSync}
            disabled={syncStatus === 'syncing' || !hasFlights}>
            <Text style={styles.syncButtonText}>
              {syncStatus === 'syncing' ? 'Synchronizing...' : 'Sync with Google Sheets'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  syncCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  lastSyncText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  viewButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  viewButtonText: {
    color: '#0066cc',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  syncButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  syncButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});