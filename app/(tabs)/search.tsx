import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
// // import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';

interface Room {
  id: string;
  title: string;
  price: number;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  images: string[];
  amenities: string[];
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [userLocation, setUserLocation] = useState<{coords: {latitude: number, longitude: number}} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    // Mock location for development
    setUserLocation({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    });
  };

  const searchRooms = async () => {
    setLoading(true);
    // Simulate API call - replace with actual Firebase query
    setTimeout(() => {
      const mockRooms: Room[] = [
        {
          id: '1',
          title: 'Cozy Studio Apartment',
          price: 1200,
          location: { latitude: 37.7749, longitude: -122.4194 },
          address: '123 Main St, San Francisco, CA',
          images: ['https://example.com/image1.jpg'],
          amenities: ['WiFi', 'Parking', 'Gym']
        },
        {
          id: '2',
          title: 'Modern 1BR with View',
          price: 1800,
          location: { latitude: 37.7849, longitude: -122.4094 },
          address: '456 Oak Ave, San Francisco, CA',
          images: ['https://example.com/image2.jpg'],
          amenities: ['WiFi', 'Balcony', 'AC']
        }
      ];
      setRooms(mockRooms);
      setLoading(false);
    }, 1000);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Find Your Room</ThemedText>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, price, or amenities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filtersContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Filters</ThemedText>
          
          <View style={styles.filterRow}>
            <ThemedText>Price Range: ${priceRange.min} - ${priceRange.max}</ThemedText>
          </View>
          
          <TouchableOpacity style={styles.searchButton} onPress={searchRooms}>
            <ThemedText style={styles.searchButtonText}>
              {loading ? 'Searching...' : 'Search Rooms'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {userLocation && (
          <View style={styles.mapContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Map View</ThemedText>
            <View style={styles.mapPlaceholder}>
              <ThemedText>Map view will be available in production</ThemedText>
            </View>
          </View>
        )}

        <View style={styles.resultsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Available Rooms ({rooms.length})
          </ThemedText>
          {rooms.map((room) => (
            <TouchableOpacity key={room.id} style={styles.roomCard}>
              <View style={styles.roomInfo}>
                <ThemedText type="defaultSemiBold">{room.title}</ThemedText>
                <ThemedText style={styles.roomPrice}>${room.price}/month</ThemedText>
                <ThemedText style={styles.roomAddress}>{room.address}</ThemedText>
                <View style={styles.amenitiesContainer}>
                  {room.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      <ThemedText style={styles.amenityText}>{amenity}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
  },
  title: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  filterRow: {
    marginBottom: 15,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  mapContainer: {
    marginBottom: 20,
  },
  map: {
    height: 200,
    borderRadius: 10,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomInfo: {
    flex: 1,
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginVertical: 5,
  },
  roomAddress: {
    color: '#666',
    marginBottom: 10,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
    color: '#666',
  },
});
