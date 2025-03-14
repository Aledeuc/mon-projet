import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clock, CreditCard as Edit2, Trash2, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

export default function History() {
  const [flights, setFlights] = useState([]);
  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadFlights();
    }
  }, [isFocused]);

  const loadFlights = async () => {
    try {
      const storedFlights = await AsyncStorage.getItem('flights');
      if (storedFlights) {
        const parsedFlights = JSON.parse(storedFlights);
        const sortedFlights = parsedFlights.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setFlights(sortedFlights);
      }
    } catch (error) {
      console.error('Error loading flights:', error);
      if (Platform.OS === 'web') {
        alert('Error loading flights. Please try again.');
      } else {
        Alert.alert('Error', 'Could not load flights. Please try again.');
      }
    }
  };

  const handleDelete = async (flightToDelete) => {
    try {
      if (Platform.OS === 'web') {
        const message = flightToDelete.roundTripId
          ? 'This is part of a round trip. Both outbound and return flights will be deleted. Continue?'
          : 'Are you sure you want to delete this flight?';
          
        if (!window.confirm(message)) {
          return;
        }
      }

      let updatedFlights = [...flights];
      
      if (flightToDelete.roundTripId) {
        updatedFlights = updatedFlights.filter(
          flight => flight.roundTripId !== flightToDelete.roundTripId
        );
      } else {
        updatedFlights = updatedFlights.filter(
          flight => flight.id !== flightToDelete.id
        );
      }

      await AsyncStorage.setItem('flights', JSON.stringify(updatedFlights));
      setFlights(updatedFlights);
    } catch (error) {
      console.error('Error deleting flight:', error);
      if (Platform.OS === 'web') {
        alert('Error deleting flight. Please try again.');
      } else {
        Alert.alert('Error', 'Could not delete flight. Please try again.');
      }
    }
  };

  const handleEdit = (flight) => {
    AsyncStorage.setItem('flightToEdit', JSON.stringify(flight))
      .then(() => {
        router.push('/edit-flight');
      })
      .catch(error => {
        console.error('Error storing flight to edit:', error);
        if (Platform.OS === 'web') {
          alert('Error preparing flight for edit. Please try again.');
        } else {
          Alert.alert('Error', 'Could not edit flight. Please try again.');
        }
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }) => {
    const isRoundTrip = item.roundTripId !== null;
    
    return (
      <TouchableOpacity
        style={[
          styles.flightCard,
          isRoundTrip && item.isReturn && styles.returnFlightCard
        ]}
        onPress={() => router.push(`/flight-details?id=${item.id}`)}>
        <View style={styles.flightHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            {isRoundTrip && (
              <View style={[
                styles.badge,
                item.isReturn ? styles.returnBadge : styles.outboundBadge
              ]}>
                <Text style={[
                  styles.badgeText,
                  item.isReturn ? styles.returnBadgeText : styles.outboundBadgeText
                ]}>
                  {item.isReturn ? 'Return' : 'Outbound'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}>
              <Edit2 size={18} color="#0066cc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}>
              <Trash2 size={18} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.route}>
          <Text style={styles.iata}>{item.fromIATA}</Text>
          <View style={styles.routeLine} />
          <Text style={styles.iata}>{item.toIATA}</Text>
        </View>
        <View style={styles.details}>
          <View style={styles.detailsLeft}>
            <Text style={styles.detailText}>
              {item.registration} • {item.model}
            </Text>
            <Text style={styles.pilotText}>{item.pilot}</Text>
          </View>
          <ChevronRight size={20} color="#666666" />
        </View>
        <Text style={styles.flightTime}>{item.flightTime}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Clock size={24} color="#0066cc" />
        <Text style={styles.title}>Flight History</Text>
      </View>
      
      {flights.length > 0 ? (
        <FlatList
          data={flights}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No flights recorded yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your flight history will appear here
          </Text>
        </View>
      )}
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
  listContent: {
    padding: 16,
  },
  flightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  returnFlightCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#dc3545',
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  outboundBadge: {
    backgroundColor: '#e6f0ff',
  },
  returnBadge: {
    backgroundColor: '#fff5f5',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  outboundBadgeText: {
    color: '#0066cc',
  },
  returnBadgeText: {
    color: '#dc3545',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iata: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1a1a1a',
  },
  routeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 12,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsLeft: {
    flex: 1,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  pilotText: {
    fontFamily: 'Inter-Medium',
    color: '#0066cc',
    marginTop: 4,
  },
  flightTime: {
    fontFamily: 'Inter-SemiBold',
    color: '#0066cc',
    marginTop: 8,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
});