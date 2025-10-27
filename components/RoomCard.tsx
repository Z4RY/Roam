"use client"

import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { Image } from "expo-image"
import { useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"

interface RoomCardProps {
  id: string
  title: string
  price: number
  location: string
  images: string[]
  amenities: string[]
  rating?: number
  distance?: number
  onPress?: (id: string) => void
  onFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function RoomCard({
  id,
  title,
  price,
  location,
  images = [],
  amenities = [],
  rating,
  distance,
  onPress,
  onFavorite,
  isFavorite = false,
}: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handlePress = () => {
    onPress?.(id)
  }

  const handleFavorite = (e: any) => {
    e.stopPropagation()
    onFavorite?.(id)
  }

  const nextImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  return (
    <ThemedView style={styles.card}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <ThemedView style={styles.imageContainer}>
          {images && images.length > 0 ? (
            <Image source={{ uri: images[currentImageIndex] }} style={styles.image} />
          ) : (
            <ThemedView style={styles.placeholderImage}>
              <IconSymbol name="house.fill" size={40} color="#ccc" />
            </ThemedView>
          )}

          {images && images.length > 1 && (
            <>
              <TouchableOpacity style={styles.imageNavButton} onPress={prevImage}>
                <IconSymbol name="chevron.left" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.imageNavButton, styles.rightNav]} onPress={nextImage}>
                <IconSymbol name="chevron.right" size={20} color="white" />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite} activeOpacity={0.7}>
            <IconSymbol name={isFavorite ? "heart.fill" : "heart"} size={20} color={isFavorite ? "#e11433" : "white"} />
          </TouchableOpacity>

          {distance && (
            <ThemedView style={styles.distanceBadge}>
              <ThemedText style={styles.distanceText}>{distance} mi</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.location}>{location}</ThemedText>
          <ThemedText style={styles.price}>${price}/month</ThemedText>

          {rating && (
            <ThemedView style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={14} color="#FFD700" />
              <ThemedText style={styles.rating}>{rating}</ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.amenitiesContainer}>
            {amenities &&
              amenities.length > 0 &&
              amenities.slice(0, 3).map((amenity, index) => (
                <ThemedView key={index} style={styles.amenityTag}>
                  <ThemedText style={styles.amenityText}>{amenity}</ThemedText>
                </ThemedView>
              ))}
            {amenities && amenities.length > 3 && (
              <ThemedView style={styles.amenityTag}>
                <ThemedText style={styles.amenityText}>+{amenities.length - 3}</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    margin: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  imageNavButton: {
    position: "absolute",
    top: "50%",
    left: 10,
    transform: [{ translateY: -15 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  rightNav: {
    left: "auto",
    right: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  distanceBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  location: {
    color: "#666",
    fontSize: 14,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
    color: "#666",
  },
})
