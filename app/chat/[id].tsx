"use client"

import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator, Share } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Image } from "expo-image"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { getRoomById } from "@/services/room"
import { addToFavorites, removeFromFavorites } from "@/services/room"
import { useAuth } from "@/contexts/AuthContext"
import type { Room } from "@/services/room"

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!id) return

    const loadRoom = async () => {
      try {
        setLoading(true)
        const roomData = await getRoomById(id as string)
        setRoom(roomData)
      } catch (error) {
        console.error("Error loading room:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRoom()
  }, [id])

  const handleFavorite = async () => {
    if (!user || !room) return

    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, room.id)
      } else {
        await addToFavorites(user.uid, room.id)
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleShare = async () => {
    if (!room) return

    try {
      await Share.share({
        message: `Check out this room: ${room.title} - ₹${room.price}/month at ${room.location}`,
        title: room.title,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const nextImage = () => {
    if (room && room.images && room.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }
  }

  const prevImage = () => {
    if (room && room.images && room.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </ThemedView>
    )
  }

  if (!room) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText>Room not found</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back and share buttons */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <IconSymbol name="square.and.arrow.up" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Image carousel */}
        <View style={styles.imageContainer}>
          {room.images && room.images.length > 0 ? (
            <Image source={{ uri: room.images[currentImageIndex] }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <IconSymbol name="house.fill" size={60} color="#ccc" />
            </View>
          )}

          {room.images && room.images.length > 1 && (
            <>
              <TouchableOpacity style={styles.imageNavButton} onPress={prevImage}>
                <IconSymbol name="chevron.left" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.imageNavButton, styles.rightNav]} onPress={nextImage}>
                <IconSymbol name="chevron.right" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite}>
            <IconSymbol name={isFavorite ? "heart.fill" : "heart"} size={24} color={isFavorite ? "#e11433" : "white"} />
          </TouchableOpacity>

          {room.images && room.images.length > 1 && (
            <View style={styles.imageIndicator}>
              <ThemedText style={styles.imageIndicatorText}>
                {currentImageIndex + 1} / {room.images.length}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Room details card */}
        <View style={styles.detailsCard}>
          <View style={styles.titleSection}>
            <View style={styles.titleContent}>
              <ThemedText type="title" style={styles.roomTitle}>
                {room.title}
              </ThemedText>
              <ThemedText style={styles.subtitle}>This is how others will see you on the site.</ThemedText>
            </View>
            <ThemedText style={styles.price}>₹{room.price}</ThemedText>
          </View>

          {/* Location */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <IconSymbol name="location.fill" size={18} color="#e11433" />
              <ThemedText style={styles.infoText}>{room.location}</ThemedText>
            </View>
          </View>

          {/* Rating */}
          {room.rating && room.rating > 0 && (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <IconSymbol name="star.fill" size={18} color="#FFD700" />
                <ThemedText style={styles.infoText}>
                  {room.rating} rating ({room.reviews} reviews)
                </ThemedText>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Description
            </ThemedText>
            <ThemedText style={styles.description}>{room.description}</ThemedText>
          </View>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Amenities
              </ThemedText>
              <View style={styles.amenitiesGrid}>
                {room.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#e11433" />
                    <ThemedText style={styles.amenityText}>{amenity}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Preferences */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Preferences
            </ThemedText>
            <ThemedText style={styles.preferencesText}>
              Contact the landlord for specific preferences and house rules.
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.messageButton}>
            <ThemedText style={styles.messageButtonText}>Message</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    height: 300,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  imageNavButton: {
    position: "absolute",
    top: "50%",
    left: 16,
    transform: [{ translateY: -20 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  rightNav: {
    left: "auto",
    right: 16,
  },
  favoriteButton: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageIndicatorText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleContent: {
    marginBottom: 12,
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e11433",
  },
  infoSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  amenitiesGrid: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  amenityText: {
    fontSize: 14,
    color: "#333",
  },
  preferencesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  messageButton: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  messageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
  },
})
