import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plane } from 'lucide-react-native';
import AirportInput from '@/components/AirportInput';

const AIRCRAFT_MODELS = ['B737-8000', 'B737-8200'];

// Web-compatible time picker component
const TimePicker = ({ value, onChange }) => {
  if (Platform.OS === 'web') {
    const timeString = value instanceof Date 
      ? value.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
      : '00:00';

    return (
      <input
        type="time"
        value={timeString}
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
          height: 40,
        }}
      />
    );
  }
  return null;
};

// Web-compatible model picker component
const ModelPicker = ({ value, onChange }) => {
  if (Platform.OS === 'web') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          borderRadius: 8,
          border: '1px solid #e5e5e5',
          fontFamily: 'Inter-Regular',
          width: '100%',
          height: 40,
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

export default function NewFlight() {
  const [flightType, setFlightType] = useState('one-way');
  const [registration, setRegistration] = useState('');
  const [model, setModel] = useState(AIRCRAFT_MODELS[0]);
  const [pilot, setPilot] = useState('G.KOSIOR');
  const [fromIATA, setFromIATA] = useState('');
  const [toIATA, setToIATA] = useState('');
  const [departureTime, setDepartureTime] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [returnDepartureTime, setReturnDepartureTime] = useState(new Date());
  const [returnArrivalTime, setReturnArrivalTime] = useState(new Date());

  const calculateFlightTime = (departure, arrival) => {
    const diff = arrival.getTime() - departure.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const generateFlightId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleSaveFlight = async () => {
    const roundTripId = flightType === 'round-trip' ? generateFlightId() : null;
    
    const outboundFlight = {
      id: generateFlightId(),
      type: flightType,
      registration,
      model,
      pilot,
      holder: 'PIC',
      fromIATA,
      toIATA,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      flightTime: calculateFlightTime(departureTime, arrivalTime),
      date: new Date().toISOString(),
      roundTripId,
      isReturn: false,
    };

    let flights = [outboundFlight];

    if (flightType === 'round-trip') {
      const returnFlight = {
        id: generateFlightId(),
        type: flightType,
        registration,
        model,
        pilot,
        holder: 'PIC',
        fromIATA: toIATA,
        toIATA: fromIATA,
        departureTime: returnDepartureTime.toISOString(),
        arrivalTime: returnArrivalTime.toISOString(),
        flightTime: calculateFlightTime(returnDepartureTime, returnArrivalTime),
        date: new Date().toISOString(),
        roundTripId,
        isReturn: true,
      };
      flights.push(returnFlight);
    }

    try {
      const existingFlights = await AsyncStorage.getItem('flights');
      const allFlights = existingFlights ? [...JSON.parse(existingFlights), ...flights] : flights;
      await AsyncStorage.setItem('flights', JSON.stringify(allFlights));
      
      // Reset form
      setRegistration('');
      setFromIATA('');
      setToIATA('');
      setDepartureTime(new Date());
      setArrivalTime(new Date());
      setReturnDepartureTime(new Date());
      setReturnArrivalTime(new Date());
    } catch (error) {
      console.error('Error saving flight:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Plane size={24} color="#0066cc" />
          <Text style={styles.title}>New Flight Log</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight Type</Text>
          <View style={styles.flightTypeContainer}>
            <TouchableOpacity
              style={[
                styles.flightTypeButton,
                flightType === 'one-way' && styles.flightTypeButtonActive,
              ]}
              onPress={() => setFlightType('one-way')}>
              <Text
                style={[
                  styles.flightTypeText,
                  flightType === 'one-way' && styles.flightTypeTextActive,
                ]}>
                One Way
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.flightTypeButton,
                flightType === 'round-trip' && styles.flightTypeButtonActive,
              ]}
              onPress={() => setFlightType('round-trip')}>
              <Text
                style={[
                  styles.flightTypeText,
                  flightType === 'round-trip' && styles.flightTypeTextActive,
                ]}>
                Round Trip
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aircraft Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Registration (e.g., F-ABCD)"
            value={registration}
            onChangeText={setRegistration}
            autoCapitalize="characters"
          />
          <View style={styles.pickerContainer}>
            <ModelPicker value={model} onChange={setModel} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Pilot Name"
            value={pilot}
            onChangeText={setPilot}
          />
        </View>

        <View style={[styles.section, styles.flightDetailsSection]}>
          <Text style={styles.sectionTitle}>Flight Details</Text>
          <View style={styles.airportInputsContainer}>
            <View style={styles.flex1}>
              <AirportInput
                value={fromIATA}
                onChange={setFromIATA}
                placeholder="From (IATA)"
              />
            </View>
            <View style={styles.flex1}>
              <AirportInput
                value={toIATA}
                onChange={setToIATA}
                placeholder="To (IATA)"
              />
            </View>
          </View>

          <View style={styles.timeInputsContainer}>
            <Text style={styles.flightLabel}>Outbound Flight</Text>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Departure</Text>
                <TimePicker value={departureTime} onChange={setDepartureTime} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Arrival</Text>
                <TimePicker value={arrivalTime} onChange={setArrivalTime} />
              </View>
            </View>
            <View style={styles.flightTimeContainer}>
              <Text style={styles.flightTimeLabel}>Flight Time:</Text>
              <Text style={styles.flightTime}>
                {calculateFlightTime(departureTime, arrivalTime)}
              </Text>
            </View>
          </View>

          {flightType === 'round-trip' && (
            <View style={[styles.timeInputsContainer, styles.returnContainer]}>
              <Text style={styles.flightLabel}>Return Flight</Text>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Departure</Text>
                  <TimePicker value={returnDepartureTime} onChange={setReturnDepartureTime} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Arrival</Text>
                  <TimePicker value={returnArrivalTime} onChange={setReturnArrivalTime} />
                </View>
              </View>
              <View style={styles.flightTimeContainer}>
                <Text style={styles.flightTimeLabel}>Flight Time:</Text>
                <Text style={styles.flightTime}>
                  {calculateFlightTime(returnDepartureTime, returnArrivalTime)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveFlight}>
          <Text style={styles.saveButtonText}>Save Flight</Text>
        </TouchableOpacity>
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
    ...(Platform.OS === 'web' && {
      position: 'relative',
    }),
  },
  flightDetailsSection: {
    ...(Platform.OS === 'web' && {
      zIndex: 2,
    }),
  },
  airportInputsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      position: 'relative',
      zIndex: 3,
    }),
  },
  timeInputsContainer: {
    marginTop: 20,
    ...(Platform.OS === 'web' && {
      position: 'relative',
      zIndex: 1,
    }),
  },
  returnContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
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
    height: 40,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 12,
  },
  flightLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    marginBottom: 8,
  },
  flightTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 4,
  },
  flightTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  flightTypeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flightTypeText: {
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  flightTypeTextActive: {
    color: '#0066cc',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  flightTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  saveButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});