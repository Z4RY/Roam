"use client"

import { useEffect, useState, useRef } from "react"
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
  PanResponder,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native"
import MapView, { Marker, type Region } from "react-native-maps"
import * as Location from "expo-location"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { RoomCard } from "@/components/RoomCard"
import { useAuth } from "@/contexts/AuthContext"
import { subscribeToAllRooms, subscribeToFavorites, addToFavorites, removeFromFavorites } from "@/services/room"

const { height: screenHeight } = Dimensions.get("window")
const PANEL_HEIGHT = screenHeight * 0.6
const COLLAPSED_HEIGHT = 120

// ---------------------- INTERFACE ----------------------
export interface Room {
  id: string
  title: string
  price: number
  location: {
    latitude: number
    longitude: number
  }
  address: string
  images: string[]
  amenities: string[]
  distance: number // in km
  rating: number // 1-5 scale
}

// ---------------------- COMPONENT ----------------------
export default function HomeScreen() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [panelExpanded, setPanelExpanded] = useState(false)

  const panelY = useRef(new Animated.Value(PANEL_HEIGHT - COLLAPSED_HEIGHT)).current
  const isHorizontalScrolling = useRef(false)

  // ---------------------- PANRESPONDER ----------------------
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const verticalMove = Math.abs(gestureState.dy)
        const horizontalMove = Math.abs(gestureState.dx)
        const verticalDominant = verticalMove > 6 && verticalMove > horizontalMove
        return verticalDominant && !isHorizontalScrolling.current
      },
      onPanResponderMove: (evt, gestureState) => {
        const newY = Math.max(
          0,
          Math.min(
            PANEL_HEIGHT - COLLAPSED_HEIGHT,
            gestureState.dy + (panelExpanded ? 0 : PANEL_HEIGHT - COLLAPSED_HEIGHT),
          ),
        )
        panelY.setValue(newY)
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = 80
        const shouldExpand = gestureState.dy < -threshold
        const shouldCollapse = gestureState.dy > threshold

        if (shouldExpand && !panelExpanded) {
          Animated.spring(panelY, {
            toValue: 0,
            useNativeDriver: false,
          }).start()
          setPanelExpanded(true)
        } else if (shouldCollapse && panelExpanded) {
          Animated.spring(panelY, {
            toValue: PANEL_HEIGHT - COLLAPSED_HEIGHT,
            useNativeDriver: false,
          }).start()
          setPanelExpanded(false)
        } else {
          Animated.spring(panelY, {
            toValue: panelExpanded ? 0 : PANEL_HEIGHT - COLLAPSED_HEIGHT,
            useNativeDriver: false,
          }).start()
        }
      },
    }),
  ).current

  // ---------------------- LOCATION PERMISSION ----------------------
  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied")
        return
      }

      const loc = await Location.getCurrentPositionAsync({})
      setLocation(loc)
    })()
  }, [])

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToAllRooms((loadedRooms) => {
      setRooms(loadedRooms)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToFavorites(user.uid, (favoriteIds) => {
      setFavorites(favoriteIds)
    })
    return unsubscribe
  }, [user])

  const handleFavoriteToggle = async (roomId: string) => {
    if (!user) return
    try {
      if (favorites.includes(roomId)) {
        await removeFromFavorites(user.uid, roomId)
      } else {
        await addToFavorites(user.uid, roomId)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleRoomPress = (roomId: string) => {
    // Navigation will be handled by the router
    // This is a placeholder for navigation logic
    console.log("Navigate to room detail:", roomId)
  }

  // ---------------------- MOCK DATA LOAD ----------------------
  // useEffect(() => {
  //   loadRooms();
  // }, []);

  // const loadRooms = async () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     const mockRooms: Room[] = [
  //       {
  //         id: "1",
  //         title: "Cozy Studio Apartment",
  //         price: 1200,
  //         location: { latitude: 23.2409, longitude: 77.4345 },
  //         address: "MP Nagar, Bhopal",
  //         images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c"],
  //         amenities: ["WiFi", "Parking", "Gym"],
  //         distance: 0.5,
  //         rating: 4.8,
  //       },
  //       {
  //         id: "2",
  //         title: "Modern 1BR with View",
  //         price: 1800,
  //         location: { latitude: 23.1946, longitude: 77.4626 },
  //         address: "Kolar Road, Bhopal",
  //         images: ["https://images.unsplash.com/photo-1560185127-6ed189bf02f4"],
  //         amenities: ["WiFi", "Balcony", "AC"],
  //         distance: 1.2,
  //         rating: 4.6,
  //       },
  //       {
  //         id: "3",
  //         title: "Luxury PG Room",
  //         price: 2200,
  //         location: { latitude: 23.2335, longitude: 77.4003 },
  //         address: "TT Nagar, Bhopal",
  //         images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
  //         amenities: ["WiFi", "Pool", "Concierge"],
  //         distance: 2.1,
  //         rating: 4.9,
  //       },
  //     ];

  //     setRooms(mockRooms);
  //     setLoading(false);
  //   }, 1000);
  // };

  if (!location) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10, color: "#555" }}>Fetching location...</Text>
      </View>
    )
  }

  const userLat = location?.coords?.latitude
  const userLng = location?.coords?.longitude

  // Fallback to default coordinates if invalid
  const validLat = typeof userLat === "number" && !isNaN(userLat) ? userLat : 37.7749
  const validLng = typeof userLng === "number" && !isNaN(userLng) ? userLng : -122.4194

  const region: Region = {
    latitude: validLat,
    longitude: validLng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }

  const displayedRooms = selectedRoom ? [selectedRoom] : rooms

  // ---------------------- POPULAR ROOMS (NEW) ----------------------
  // derive popular rooms by rating, top 3
  const popularRooms = rooms
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)

  // ---------------------- RENDER ----------------------
  return (
    <ThemedView style={styles.container}>
      <View style={styles.mapContainer}>
        {typeof region.latitude === "number" &&
        typeof region.longitude === "number" &&
        !isNaN(region.latitude) &&
        !isNaN(region.longitude) ? (
          <MapView style={styles.map} region={region} showsUserLocation>
            {rooms.map((room) => (
              <Marker
                key={room.id}
                coordinate={room.location}
                title={room.title}
                description={room.address}
                onPress={() => setSelectedRoom(room)}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={{ marginTop: 10, color: "#555" }}>Loading map...</Text>
          </View>
        )}

        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <IconSymbol name="line.3.horizontal" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* -------- Bottom Sheet -------- */}
      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateY: panelY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.panelHandle}>
          <View style={styles.handleBar} />
        </View>

        <ScrollView style={styles.panelContent} scrollEnabled={panelExpanded} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {selectedRoom ? "Selected Room" : "Nearby Rooms"}
            </ThemedText>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ThemedText>Loading rooms...</ThemedText>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                onTouchStart={() => {
                  isHorizontalScrolling.current = true
                }}
                onTouchEnd={() => {
                  setTimeout(() => {
                    isHorizontalScrolling.current = false
                  }, 50)
                }}
                onScrollBeginDrag={() => {
                  isHorizontalScrolling.current = true
                }}
                onScrollEndDrag={() => {
                  isHorizontalScrolling.current = false
                }}
                onMomentumScrollEnd={() => {
                  isHorizontalScrolling.current = false
                }}
              >
                {displayedRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    id={room.id}
                    title={room.title}
                    price={room.price}
                    location={room.location}
                    images={room.images}
                    amenities={room.amenities}
                    rating={room.rating}
                    onPress={handleRoomPress}
                    onFavorite={handleFavoriteToggle}
                    isFavorite={favorites.includes(room.id)}
                  />
                ))}
              </ScrollView>
            )}

            {selectedRoom && (
              <TouchableOpacity onPress={() => setSelectedRoom(null)} style={{ marginTop: 10, alignSelf: "flex-end" }}>
                <Text style={{ color: "#007AFF", fontWeight: "600" }}>Show All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* -------- NEW: Popular Rooms Section -------- */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Popular Rooms
            </ThemedText>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ThemedText>Loading popular rooms...</ThemedText>
              </View>
            ) : popularRooms.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ThemedText>No popular rooms found</ThemedText>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                onTouchStart={() => {
                  isHorizontalScrolling.current = true
                }}
                onTouchEnd={() => {
                  setTimeout(() => {
                    isHorizontalScrolling.current = false
                  }, 50)
                }}
                onScrollBeginDrag={() => {
                  isHorizontalScrolling.current = true
                }}
                onScrollEndDrag={() => {
                  isHorizontalScrolling.current = false
                }}
                onMomentumScrollEnd={() => {
                  isHorizontalScrolling.current = false
                }}
              >
                {popularRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    id={room.id}
                    title={room.title}
                    price={room.price}
                    location={room.location}
                    images={room.images}
                    amenities={room.amenities}
                    rating={room.rating}
                    onPress={handleRoomPress}
                    onFavorite={handleFavoriteToggle}
                    isFavorite={favorites.includes(room.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </ThemedView>
  )
}

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  searchBarContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: "#333" },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 5,
  },
  panelHandle: { alignItems: "center", paddingVertical: 12 },
  handleBar: { width: 40, height: 4, backgroundColor: "#DDD", borderRadius: 2 },
  panelContent: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12, fontSize: 18, fontWeight: "600" },
  loadingContainer: { paddingVertical: 20, alignItems: "center" },
  horizontalScroll: { paddingRight: 16, gap: 12 },
})
