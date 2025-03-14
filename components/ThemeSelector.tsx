import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Appearance</Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.option,
            theme === 'light' && [styles.selectedOption, { borderColor: colors.primary }],
            { backgroundColor: colors.card }
          ]}
          onPress={() => setTheme('light')}
        >
          <Sun size={24} color={theme === 'light' ? colors.primary : colors.icon} />
          <Text style={[
            styles.optionText,
            theme === 'light' && { color: colors.primary },
            { color: colors.textPrimary }
          ]}>
            Light
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            theme === 'dark' && [styles.selectedOption, { borderColor: colors.primary }],
            { backgroundColor: colors.card }
          ]}
          onPress={() => setTheme('dark')}
        >
          <Moon size={24} color={theme === 'dark' ? colors.primary : colors.icon} />
          <Text style={[
            styles.optionText,
            theme === 'dark' && { color: colors.primary },
            { color: colors.textPrimary }
          ]}>
            Dark
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            theme === 'system' && [styles.selectedOption, { borderColor: colors.primary }],
            { backgroundColor: colors.card }
          ]}
          onPress={() => setTheme('system')}
        >
          <Smartphone size={24} color={theme === 'system' ? colors.primary : colors.icon} />
          <Text style={[
            styles.optionText,
            theme === 'system' && { color: colors.primary },
            { color: colors.textPrimary }
          ]}>
            System
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {theme === 'system' 
          ? `Using your device's appearance settings (currently ${isDark ? 'dark' : 'light'} mode)` 
          : `Always use ${theme} mode regardless of device settings`}
      </Text>
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
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  option: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});

export default ThemeSelector;
