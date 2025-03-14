import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, Download, Trash2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const [exportError, setExportError] = useState('');

  const exportData = async () => {
    try {
      const flights = await AsyncStorage.getItem('flights');
      if (flights) {
        const jsonData = JSON.stringify(JSON.parse(flights), null, 2);
        
        if (Platform.OS === 'web') {
          // Create a Blob and download link for web
          const blob = new Blob([jsonData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'flight-log.json';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // Use Share API for native platforms
          await Share.share({
            message: jsonData,
            title: 'Flight Log Data',
          });
        }
        setExportError('');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setExportError('Failed to export data. Please try again.');
    }
  };

  const clearData = async () => {
    try {
      await AsyncStorage.removeItem('flights');
      setExportError('');
    } catch (error) {
      console.error('Error clearing data:', error);
      setExportError('Failed to clear data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Settings size={24} color="#0066cc" />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={exportData}>
          <Download size={20} color="#0066cc" />
          <Text style={styles.buttonText}>Export Flight Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearData}>
          <Trash2 size={20} color="#dc3545" />
          <Text style={[styles.buttonText, styles.dangerText]}>
            Clear All Data
          </Text>
        </TouchableOpacity>

        {exportError ? (
          <Text style={styles.errorText}>{exportError}</Text>
        ) : null}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About</Text>
        <Text style={styles.infoText}>Flight Logger v1.0.0</Text>
        <Text style={styles.infoText}>© 2025 All rights reserved</Text>
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
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0066cc',
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
  },
  dangerText: {
    color: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  infoSection: {
    padding: 20,
    marginTop: 'auto',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
});