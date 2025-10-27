import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  setDoc,
  getDoc, // Import getDoc from firebase/firestore
} from "firebase/firestore"

export interface Room {
  id: string
  userId: string
  title: string
  description: string
  price: number
  location: string
  latitude: number
  longitude: number
  amenities: string[]
  images: string[]
  rating: number
  reviews: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Create a new room listing
export const createRoom = async (userId: string, roomData: Omit<Room, "id" | "createdAt" | "updatedAt">) => {
  try {
    const docRef = await addDoc(collection(db, "rooms"), {
      ...roomData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating room:", error)
    throw error
  }
}

// Get all rooms for a specific user (real-time listener)
export const subscribeToUserRooms = (userId: string, callback: (rooms: Room[]) => void) => {
  try {
    const q = query(collection(db, "rooms"), where("userId", "==", userId))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms: Room[] = []
      snapshot.forEach((doc) => {
        rooms.push({
          id: doc.id,
          ...doc.data(),
        } as Room)
      })
      callback(rooms)
    })

    return unsubscribe
  } catch (error) {
    console.error("Error subscribing to user rooms:", error)
    throw error
  }
}

// Get nearby rooms within a radius (5km)
export const getNearbyRooms = async (latitude: number, longitude: number, radiusKm = 5) => {
  try {
    const snapshot = await getDocs(collection(db, "rooms"))
    const rooms: Room[] = []

    snapshot.forEach((doc) => {
      const room = { id: doc.id, ...doc.data() } as Room
      const distance = calculateDistance(latitude, longitude, room.latitude, room.longitude)

      if (distance <= radiusKm) {
        rooms.push(room)
      }
    })

    return rooms.sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude)
      const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude)
      return distA - distB
    })
  } catch (error) {
    console.error("Error getting nearby rooms:", error)
    throw error
  }
}

// Update a room listing
export const updateRoom = async (roomId: string, updates: Partial<Room>) => {
  try {
    const roomRef = doc(db, "rooms", roomId)
    await updateDoc(roomRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating room:", error)
    throw error
  }
}

// Delete a room listing
export const deleteRoom = async (roomId: string) => {
  try {
    await deleteDoc(doc(db, "rooms", roomId))
  } catch (error) {
    console.error("Error deleting room:", error)
    throw error
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const addToFavorites = async (userId: string, roomId: string) => {
  try {
    const favRef = doc(db, "users", userId, "favorites", roomId)
    await setDoc(favRef, {
      roomId,
      addedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    throw error
  }
}

export const removeFromFavorites = async (userId: string, roomId: string) => {
  try {
    const favRef = doc(db, "users", userId, "favorites", roomId)
    await deleteDoc(favRef)
  } catch (error) {
    console.error("Error removing from favorites:", error)
    throw error
  }
}

export const subscribeToFavorites = (userId: string, callback: (favoriteIds: string[]) => void) => {
  try {
    const q = query(collection(db, "users", userId, "favorites"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favoriteIds: string[] = []
      snapshot.forEach((doc) => {
        favoriteIds.push(doc.data().roomId)
      })
      callback(favoriteIds)
    })
    return unsubscribe
  } catch (error) {
    console.error("Error subscribing to favorites:", error)
    throw error
  }
}

export const getAllRooms = async () => {
  try {
    const snapshot = await getDocs(collection(db, "rooms"))
    const rooms: Room[] = []
    snapshot.forEach((doc) => {
      rooms.push({
        id: doc.id,
        ...doc.data(),
      } as Room)
    })
    return rooms
  } catch (error) {
    console.error("Error getting all rooms:", error)
    throw error
  }
}

export const subscribeToAllRooms = (callback: (rooms: Room[]) => void) => {
  try {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const rooms: Room[] = []
      snapshot.forEach((doc) => {
        rooms.push({
          id: doc.id,
          ...doc.data(),
        } as Room)
      })
      callback(rooms)
    })
    return unsubscribe
  } catch (error) {
    console.error("Error subscribing to all rooms:", error)
    throw error
  }
}

export const getRoomById = async (roomId: string) => {
  try {
    const docSnap = await getDoc(doc(db, "rooms", roomId))
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Room
    }
    return null
  } catch (error) {
    console.error("Error getting room:", error)
    throw error
  }
}
