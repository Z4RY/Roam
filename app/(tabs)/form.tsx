"use client"

import { ImageUpload } from "@/components/ImageUpload"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { useAuth } from "@/contexts/AuthContext"
import { createRoom } from "@/services/room"
import * as Location from "expo-location"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import MapView, { Marker, Region } from "react-native-maps"



interface ListingFormData {
  title: string
  description: string
  price: string
  preferences: string
  landlordName: string
  contactNumber: string
  email: string
  latitude: number
  longitude: number
  address: string
  images: string[]
}

export default function FormScreen() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [region, setRegion] = useState<Region | null>(null)

  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    preferences: "",
    landlordName: "",
    contactNumber: "",
    email: "",
    latitude: 0,
    longitude: 0,
    address: "",
    images: [],
  })

  const handleInputChange = (field: keyof ListingFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude })
      if (place) {
        const fullAddress = `${place.name || ""} ${place.street || ""}, ${place.city || ""}, ${place.region || ""}, ${place.postalCode || ""}`
        handleInputChange("address", fullAddress)
      }
    } catch (error) {
      console.warn("Reverse geocoding failed:", error)
    }
  }

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to set room location.")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })

      handleInputChange("latitude", latitude)
      handleInputChange("longitude", longitude)
      await reverseGeocode(latitude, longitude)
    })()
  }, [])

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          Alert.alert("Validation Error", "Please enter a room title")
          return false
        }
        if (!formData.price.trim()) {
          Alert.alert("Validation Error", "Please enter a price")
          return false
        }
        return true
      case 2:
        if (!formData.landlordName.trim()) {
          Alert.alert("Validation Error", "Please enter your name")
          return false
        }
        if (!formData.contactNumber.trim()) {
          Alert.alert("Validation Error", "Please enter your contact number")
          return false
        }
        if (!formData.email.trim()) {
          Alert.alert("Validation Error", "Please enter your email")
          return false
        }
        return true
      case 3:
        if (!formData.address.trim()) {
          Alert.alert("Validation Error", "Please enter the room address")
          return false
        }
        if (formData.latitude === 0 || formData.longitude === 0) {
          Alert.alert("Validation Error", "Please pin the location on the map")
          return false
        }
        return true
      case 4:
        if (formData.images.length === 0) {
          Alert.alert("Validation Error", "Please upload at least one image")
          return false
        }
        if (formData.images.length > 3) {
          Alert.alert("Validation Error", "Maximum 3 images allowed")
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    if (!user) {
      Alert.alert("Error", "You must be logged in to create a listing")
      return
    }

    setLoading(true)
    try {
      await createRoom({
        userId: user.uid,
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        location: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        amenities: formData.preferences
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
        images: formData.images,
        rating: 0,
        reviews: 0,
      })

      Alert.alert("Success", "Your room listing has been created!")

      setFormData({
        title: "",
        description: "",
        price: "",
        preferences: "",
        landlordName: "",
        contactNumber: "",
        email: "",
        latitude: 0,
        longitude: 0,
        address: "",
        images: [],
      })
      setCurrentStep(1)
    } catch (error) {
      Alert.alert("Error", "Failed to create listing. Please try again.")
      console.error("Error creating listing:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>Step {currentStep} of 4</ThemedText>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
          </View>
        </View>

        {/* Step 1: Room Details */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>Room Details</ThemedText>
            <ThemedText style={styles.stepSubtitle}>Tell us about your room</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Room Title *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., Cozy Studio in Downtown"
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your room, amenities, and what makes it special..."
                value={formData.description}
                onChangeText={(value) => handleInputChange("description", value)}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Monthly Rent *</ThemedText>
              <View style={styles.priceContainer}>
                <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="1200"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange("price", value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Preferences/Rules</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., No smoking, Pets allowed, Quiet hours after 10pm"
                value={formData.preferences}
                onChangeText={(value) => handleInputChange("preferences", value)}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Step 2: Landlord Info */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>Your Information</ThemedText>
            <ThemedText style={styles.stepSubtitle}>How can renters contact you?</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Full Name *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={formData.landlordName}
                onChangeText={(value) => handleInputChange("landlordName", value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Contact Number *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="+91 9876543210"
                value={formData.contactNumber}
                onChangeText={(value) => handleInputChange("contactNumber", value)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email Address *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
              />
            </View>
          </View>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>Room Location</ThemedText>
            <ThemedText style={styles.stepSubtitle}>Tap or drag marker to pinpoint location</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Address *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="123 Main St, City, State, ZIP"
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
              />
            </View>

            {region ? (
              <View style={styles.mapContainer}>
                <MapView
                  style={{ flex: 1 }}
                  region={region}
                  onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                  onPress={async (e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate
                    handleInputChange("latitude", latitude)
                    handleInputChange("longitude", longitude)
                    setRegion({ ...region, latitude, longitude })
                    await reverseGeocode(latitude, longitude)
                  }}
                >
                  <Marker
                    draggable
                    coordinate={{
                      latitude: formData.latitude || region.latitude,
                      longitude: formData.longitude || region.longitude,
                    }}
                    onDragEnd={async (e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate
                      handleInputChange("latitude", latitude)
                      handleInputChange("longitude", longitude)
                      await reverseGeocode(latitude, longitude)
                    }}
                  />
                </MapView>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <ThemedText>Fetching your location...</ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Step 4: Images */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.stepTitle}>Room Images</ThemedText>
            <ThemedText style={styles.stepSubtitle}>Upload up to 3 images</ThemedText>

            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => handleInputChange("images", images)}
              maxImages={3}
            />
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handlePrevious}>
              <ThemedText style={styles.secondaryButtonText}>Previous</ThemedText>
            </TouchableOpacity>
          )}
          {currentStep < 4 ? (
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNext}>
              <ThemedText style={styles.primaryButtonText}>Next</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <ThemedText style={styles.primaryButtonText}>
                {loading ? "Creating..." : "Create Listing"}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  progressContainer: { padding: 20, paddingTop: 40 },
  progressText: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#666" },
  progressBar: { height: 6, backgroundColor: "#e0e0e0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#e11433" },
  stepContainer: { padding: 20 },
  stepTitle: { marginBottom: 8, fontSize: 24, fontWeight: "700" },
  stepSubtitle: { color: "#666", marginBottom: 24, fontSize: 14 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  priceContainer: { flexDirection: "row", alignItems: "center" },
  currencySymbol: { fontSize: 18, fontWeight: "bold", marginRight: 8, color: "#e11433" },
  priceInput: { flex: 1 },
  mapContainer: { height: 300, borderRadius: 8, overflow: "hidden", marginBottom: 20 },
  mapPlaceholder: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  buttonContainer: { flexDirection: "row", padding: 20, gap: 12 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: { backgroundColor: "#e11433" },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  secondaryButton: { backgroundColor: "white", borderWidth: 1, borderColor: "#ddd" },
  secondaryButtonText: { color: "#333", fontSize: 16, fontWeight: "600" },
  buttonDisabled: { backgroundColor: "#ccc" },
})


