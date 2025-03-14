import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plane, User, Calendar, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FlightDetails() {
  const router = useRouter();
  const [flight, setFlight] = React.useState(null);
  const { id } = useLocalSearchParams();

  React.useEffect(() => {
    loadFlight();
  }, [id]);

  const loadFlight = async () => {
    try {
      const storedFlights = await AsyncStorage.getItem('flights');
      if (storedFlights) {
        const flights = JSON.parse(storedFlights);
        const foundFlight = flights.find(f => f.id.toString() === id);
        if (foundFlight) {
          setFlight(foundFlight);
        }
      }
    } catch (error) {
      console.error('Error loading flight details:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!flight) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0066cc" />
          </TouchableOpacity>
          <Text style={styles.title}>Flight Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading flight details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0066cc" />
        </TouchableOpacity>
        <Text style={styles.title}>Flight Details</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <View style={styles.routeHeader}>
            <View style={styles.airports}>
              <Text style={styles.iata}>{flight.fromIATA}</Text>
              <View style={styles.planeIconContainer}>
                <Plane size={24} color="#0066cc" style={styles.planeIcon} />
              </View>
              <Text style={styles.iata}>{flight.toIATA}</Text>
            </View>
            {flight.roundTripId && (
              <View style={[
                styles.badge,
                flight.isReturn ? styles.returnBadge : styles.outboundBadge
              ]}>
                <Text style={[
                  styles.badgeText,
                  flight.isReturn ? styles.returnBadgeText : styles.outboundBadgeText
                ]}>
                  {flight.isReturn ? 'Return' : 'Outbound'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#666666" />
              <Text style={styles.sectionTitle}>Date & Time</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.date}>{formatDate(flight.date)}</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>Departure</Text>
                  <Text style={styles.time}>{formatTime(flight.departureTime)}</Text>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>Arrival</Text>
                  <Text style={styles.time}>{formatTime(flight.arrivalTime)}</Text>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>Duration</Text>
                  <Text style={styles.duration}>{flight.flightTime}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Plane size={20} color="#666666" />
              <Text style={styles.sectionTitle}>Aircraft Details</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Registration</Text>
              <Text style={styles.detailValue}>{flight.registration}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Model</Text>
              <Text style={styles.detailValue}>{flight.model}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#666666" />
              <Text style={styles.sectionTitle}>Crew</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pilot</Text>
              <Text style={styles.detailValue}>{flight.pilot}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>{flight.holder}</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  routeHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  airports: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iata: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
  planeIconContainer: {
    marginHorizontal: 16,
  },
  planeIcon: {
    transform: [{ rotate: '90deg' }],
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  outboundBadge: {
    backgroundColor: '#e6f0ff',
  },
  returnBadge: {
    backgroundColor: '#fff5f5',
  },
  badgeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  outboundBadgeText: {
    color: '#0066cc',
  },
  returnBadgeText: {
    color: '#dc3545',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginLeft: 8,
  },
  dateTimeContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  duration: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0066cc',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1a1a1a',
  },
});