import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Settings as SettingsIcon, CloudSync, Palette } from 'lucide-react-native';
import ThemeSelector from '../components/ThemeSelector';
import GoogleSheetsSync from '../components/GoogleSheetsSync';
import { useTheme } from '../theme/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Paramètres</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Section Apparence */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.divider }]}>
            <Palette size={20} color={colors.icon} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Apparence</Text>
          </View>
          
          <ThemeSelector />
        </View>
        
        {/* Section Synchronisation */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.divider }]}>
            <CloudSync size={20} color={colors.icon} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Synchronisation</Text>
          </View>
          
          <GoogleSheetsSync />
        </View>
        
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textTertiary }]}>
            Flight Logger v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  appInfo: {
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
