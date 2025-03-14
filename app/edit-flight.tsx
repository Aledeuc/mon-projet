import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { CreditCard as Edit2 } from 'lucide-react-native';
import AirportInput from '@/components/AirportInput';

const AIRCRAFT_MODELS = ['B737-8000', 'B737-8200'];

const TimePicker = ({ value, onChange }) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="time"
        value={value.toLocaleTimeString().slice(0, 5)}
        onChange={(e) => {
          const [hours, minutes] = e.target.value.split(':');
          const newDate = new Date();
          newDate.setHours(parseInt(hours, 10));
          newDate.setMinutes(parseInt(minutes, 10));
          onChange(newDate);
        }}
        style={{
          borderRadius: 8,
          border: '1px solid #e5e5e5',
          fontFamily: 'Inter-Regular',
          width: '100%',
          height: 36,
        }}
      />
    );
  }
  return null;
};

const ModelPicker = ({ value, onChange }) => {
  if (Platform.OS === 'web') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: 8,
          borderRadius: 8,
          border: '1px solid #e5e5e5',
          fontFamily: 'Inter-Regular',
          width: '100%',
          height: 36,
          backgroundColor: '#ffffff',
        }}
      >
        {AIRCRAFT_MODELS.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    );
  }
  return null;
};

export default function EditFlight() {
  const router = useRouter();
  const [flight, setFlight] = useState(null);
  const [registration, setRegistration] = useState('');
  const [model, setModel] = useState(AIRCRAFT_MODELS[0]);
  const [fromIATA, setFromIATA] = useState('');
  const [toIATA, setToIATA] = useState('');
  const [departureTime, setDepartureTime] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [formErrors, setFormErrors] = useState({
    registration: false,
    fromIATA: false,
    toIATA: false,
  });

  useEffect(() => {
    loadFlight();
  }, []);

  const loadFlight = async () => {
    try {
      const flightData = await AsyncStorage.getItem('flightToEdit');
      if (flightData) {
        const parsedFlight = JSON.parse(flightData);
        setFlight(parsedFlight);
        setRegistration(parsedFlight.registration);
        setModel(parsedFlight.model);
        setFromIATA(parsedFlight.fromIATA);
        setToIATA(parsedFlight.toIATA);
        setDepartureTime(new Date(parsedFlight.departureTime));
        setArrivalTime(new Date(parsedFlight.arrivalTime));
      }
    } catch (error) {
      console.error('Error loading flight:', error);
    }
  };

  const calculateFlightTime = (departure, arrival) => {
    const diff = arrival.getTime() - departure.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const validateForm = () => {
    const errors = {
      registration: !registration.trim(),
      fromIATA: !fromIATA.trim(),
      toIATA: !toIATA.trim(),
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSave = async () => {
    if (!validateForm() || !flight) return;

    try {
      const storedFlights = await AsyncStorage.getItem('flights');
      let flights = storedFlights ? JSON.parse(storedFlights) : [];

      const updatedFlights = flights.map(f => {
        if (f.id === flight.id) {
          return {
            ...f,
            registration,
            model,
            fromIATA,
            toIATA,
            departureTime: departureTime.toISOString(),
            arrivalTime: arrivalTime.toISOString(),
            flightTime: calculateFlightTime(departureTime, arrivalTime),
          };
        }
        return f;
      });

      await AsyncStorage.setItem('flights', JSON.stringify(updatedFlights));
      await AsyncStorage.removeItem('flightToEdit');
      router.back();
    } catch (error) {
      console.error('Error saving flight:', error);
    }
  };

  if (!flight) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Edit2 size={24} color="#0066cc" />
          <Text style={styles.title}>Edit Flight</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aircraft Details</Text>
          <View style={styles.pickerContainer}>
            <ModelPicker value={model} onChange={setModel} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight Details</Text>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <AirportInput
                value={fromIATA}
                onChange={(text) => {
                  setFromIATA(text);
                  setFormErrors(prev => ({ ...prev, fromIATA: false }));
                }}
                placeholder="From (IATA)"
                error={formErrors.fromIATA}
                errorText="Departure airport is required"
              />
            </View>
            <View style={styles.flex1}>
              <AirportInput
                value={toIATA}
                onChange={(text) => {
                  setToIATA(text);
                  setFormErrors(prev => ({ ...prev, toIATA: false }));
                }}
                placeholder="To (IATA)"
                error={formErrors.toIATA}
                errorText="Arrival airport is required"
              />
            </View>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.label}>Departure Time</Text>
              <View style={styles.timeInputContainer}>
                <TimePicker value={departureTime} onChange={setDepartureTime} />
              </View>
            </View>
            <View style={styles.timeColumn}>
              <Text style={styles.label}>Arrival Time</Text>
              <View style={styles.timeInputContainer}>
                <TimePicker value={arrivalTime} onChange={setArrivalTime} />
              </View>
            </View>
          </View>

          <View style={styles.flightTimeContainer}>
            <Text style={styles.flightTimeLabel}>Flight Time:</Text>
            <Text style={styles.flightTime}>
              {calculateFlightTime(departureTime, arrivalTime)}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeColumn: {
    flex: 1,
  },
  timeInputContainer: {
    height: 36,
  },
  flex1: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    marginBottom: 8,
  },
  flightTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  flightTimeLabel: {
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  flightTime: {
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});