import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';

// Liste prédéfinie des aéroports IATA
const PREDEFINED_AIRPORTS = [
  'CDG', // Paris Charles de Gaulle
  'ORY', // Paris Orly
  'LHR', // London Heathrow
  'LGW', // London Gatwick
  'JFK', // New York JFK
  'LAX', // Los Angeles
  'DXB', // Dubai
  'AMS', // Amsterdam
  'FRA', // Frankfurt
  'MAD', // Madrid
  'BCN', // Barcelona
  'FCO', // Rome
  'MUC', // Munich
  'BRU', // Brussels
  'VIE', // Vienna
  'ZRH', // Zurich
  'LIS', // Lisbon
  'ATH', // Athens
  'CPH', // Copenhagen
  'OSL', // Oslo
];

export const AirportInput = ({ value, onChange, placeholder, error, errorText }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (text) => {
    const upperText = text.toUpperCase();
    setInputValue(upperText);
    setShowDropdown(true);
    onChange(upperText);
  };

  const handleSelectIata = (iata) => {
    setInputValue(iata);
    onChange(iata);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const filteredAirports = PREDEFINED_AIRPORTS.filter(iata =>
    iata.startsWith(inputValue.toUpperCase())
  );

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        error && styles.inputError
      ]}>
        <TextInput
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          style={styles.input}
          maxLength={3}
          autoCapitalize="characters"
        />
      </View>
      
      {error && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}

      {showDropdown && filteredAirports.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView 
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}>
            {filteredAirports.map((iata) => (
              <TouchableOpacity
                key={iata}
                style={styles.dropdownItem}
                onPress={() => handleSelectIata(iata)}>
                <Text style={styles.dropdownText}>{iata}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      zIndex: 1000,
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 4,
    height: 200, // Hauteur fixe pour montrer 5 éléments
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      zIndex: 1001,
    }),
  },
  dropdownScroll: {
    flex: 1,
  },
  dropdownItem: {
    height: 40, // Hauteur fixe pour chaque élément
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  dropdownText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1a1a1a',
  },
});

export default AirportInput;