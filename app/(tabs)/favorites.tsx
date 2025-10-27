import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FavoriteRoom {
  id: string;
  title: string;
  price: number;
  address: string;
  images: string[];
  amenities: string[];
  addedDate: Date;
}

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    // Simulate loading favorites from Firebase
    setTimeout(() => {
      const mockFavorites: FavoriteRoom[] = [
        {
          id: '1',
          title: 'Cozy Studio Apartment',
          price: 1200,
          address: '123 Main St, San Francisco, CA',
          images: ['https://example.com/image1.jpg'],
          amenities: ['WiFi', 'Parking', 'Gym'],
          addedDate: new Date('2024-01-15')
        },
        {
          id: '2',
          title: 'Modern 1BR with View',
          price: 1800,
          address: '456 Oak Ave, San Francisco, CA',
          images: ['https://example.com/image2.jpg'],
          amenities: ['WiFi', 'Balcony', 'AC'],
          addedDate: new Date('2024-01-20')
        }
      ];
      setFavorites(mockFavorites);
      setLoading(false);
    }, 1000);
  };

  const removeFavorite = (roomId: string) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this room from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavorites(favorites.filter(room => room.id !== roomId));
          }
        }
      ]
    );
  };

  const contactOwner = (room: FavoriteRoom) => {
    Alert.alert(
      'Contact Owner',
      `Would you like to message the owner of "${room.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Message', onPress: () => {
          // Navigate to chat screen
          console.log('Navigate to chat for room:', room.id);
        }}
      ]
    );
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteRoom }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.roomImage}>
        <IconSymbol name="house.fill" size={40} color="#007AFF" />
      </View>
      
      <View style={styles.roomInfo}>
        <ThemedText type="defaultSemiBold" style={styles.roomTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.roomPrice}>${item.price}/month</ThemedText>
        <ThemedText style={styles.roomAddress}>{item.address}</ThemedText>
        
        <View style={styles.amenitiesContainer}>
          {item.amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <ThemedText style={styles.amenityText}>{amenity}</ThemedText>
            </View>
          ))}
        </View>
        
        <ThemedText style={styles.addedDate}>
          Added {item.addedDate.toLocaleDateString()}
        </ThemedText>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => contactOwner(item)}
        >
          <IconSymbol name="message.fill" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => removeFavorite(item.id)}
        >
          <IconSymbol name="heart.fill" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <IconSymbol name="person.circle" size={80} color="#ccc" />
          <ThemedText type="title" style={styles.emptyTitle}>Sign In Required</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Please sign in to view your favorite rooms.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading your favorites...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (favorites.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <IconSymbol name="heart" size={80} color="#ccc" />
          <ThemedText type="title" style={styles.emptyTitle}>No Favorites Yet</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Start exploring rooms and add them to your favorites!
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>My Favorites</ThemedText>
        <ThemedText style={styles.subtitle}>
          {favorites.length} saved room{favorites.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>
      
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 5,
  },
  subtitle: {
    color: '#666',
  },
  listContainer: {
    padding: 20,
  },
  favoriteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  roomInfo: {
    flex: 1,
  },
  roomTitle: {
    marginBottom: 5,
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  roomAddress: {
    color: '#666',
    marginBottom: 10,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
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
  addedDate: {
    fontSize: 12,
    color: '#999',
  },
  actionsContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
