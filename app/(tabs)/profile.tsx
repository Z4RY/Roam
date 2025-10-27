"use client"

import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { useAuth } from "@/contexts/AuthContext"
import { subscribeToUserRooms, type Room } from "@/services/room"
import { useState, useEffect } from "react"
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, FlatList } from "react-native"

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [userRooms, setUserRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
  })
  const [userFavorites, setUserFavorites] = useState<Room[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    const unsubscribeRooms = subscribeToUserRooms(user.uid, (rooms) => {
      setUserRooms(rooms)
      setLoading(false)
    })

    const unsubscribeFavorites = subscribeToUserRooms(user.uid, (favorites) => {
      setUserFavorites(favorites)
      setLoadingFavorites(false)
    })

    return () => {
      unsubscribeRooms()
      unsubscribeFavorites()
    }
  }, [user])

  const handleSaveProfile = () => {
    Alert.alert("Success", "Profile updated successfully!")
    setIsEditing(false)
  }

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action cannot be undone. Are you sure you want to delete your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          console.log("Delete account")
        },
      },
    ])
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <IconSymbol name="person.circle" size={80} color="#ccc" />
          <ThemedText type="title" style={styles.emptyTitle}>
            Sign In Required
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>Please sign in to view your profile.</ThemedText>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.circle.fill" size={80} color="#007AFF" />
          </View>
          <ThemedText type="title" style={styles.name}>
            {user.displayName || "User"}
          </ThemedText>
          <ThemedText style={styles.email}>{user.email}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Profile Information
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Name</ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                placeholder="Enter your name"
              />
            ) : (
              <ThemedText style={styles.value}>{profile.name || "Not set"}</ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{profile.email}</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Phone</ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <ThemedText style={styles.value}>{profile.phone || "Not set"}</ThemedText>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            My Room Listings ({userRooms.length})
          </ThemedText>

          {loading ? (
            <ThemedText style={styles.loadingText}>Loading your rooms...</ThemedText>
          ) : userRooms.length === 0 ? (
            <ThemedText style={styles.emptyRoomsText}>You haven't created any room listings yet.</ThemedText>
          ) : (
            <FlatList
              data={userRooms}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.roomCard}>
                  <View style={styles.roomHeader}>
                    <ThemedText style={styles.roomTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.roomPrice}>${item.price}/month</ThemedText>
                  </View>
                  <ThemedText style={styles.roomLocation}>{item.location}</ThemedText>
                  <View style={styles.roomMeta}>
                    <ThemedText style={styles.roomRating}>
                      ⭐ {item.rating} ({item.reviews} reviews)
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.roomDescription} numberOfLines={2}>
                    {item.description}
                  </ThemedText>
                  <View style={styles.roomActions}>
                    <TouchableOpacity style={styles.editRoomButton}>
                      <ThemedText style={styles.editRoomText}>Edit</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteRoomButton}>
                      <ThemedText style={styles.deleteRoomText}>Delete</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            My Favorites ({userFavorites.length})
          </ThemedText>

          {loadingFavorites ? (
            <ThemedText style={styles.loadingText}>Loading favorites...</ThemedText>
          ) : userFavorites.length === 0 ? (
            <ThemedText style={styles.emptyRoomsText}>You haven't added any favorites yet.</ThemedText>
          ) : (
            <FlatList
              data={userFavorites}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.roomCard}>
                  <View style={styles.roomHeader}>
                    <ThemedText style={styles.roomTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.roomPrice}>₹{item.price}/month</ThemedText>
                  </View>
                  <ThemedText style={styles.roomLocation}>{item.location}</ThemedText>
                  <View style={styles.roomMeta}>
                    <ThemedText style={styles.roomRating}>
                      ⭐ {item.rating} ({item.reviews} reviews)
                    </ThemedText>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account Settings
          </ThemedText>

          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol name="bell" size={24} color="#007AFF" />
            <ThemedText style={styles.settingText}>Notifications</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol name="lock" size={24} color="#007AFF" />
            <ThemedText style={styles.settingText}>Privacy & Security</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <IconSymbol name="questionmark.circle" size={24} color="#007AFF" />
            <ThemedText style={styles.settingText}>Help & Support</ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutButtonText}>Sign Out</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <ThemedText style={styles.deleteButtonText}>Delete Account</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 30,
    paddingTop: 80,
    backgroundColor: "#f8f9fa",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  name: {
    marginBottom: 5,
  },
  email: {
    color: "#666",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  loadingText: {
    textAlign: "center",
    color: "#999",
    paddingVertical: 20,
  },
  emptyRoomsText: {
    textAlign: "center",
    color: "#999",
    paddingVertical: 20,
  },
  roomCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  roomLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  roomMeta: {
    marginBottom: 8,
  },
  roomRating: {
    fontSize: 13,
    color: "#666",
  },
  roomDescription: {
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
    lineHeight: 18,
  },
  roomActions: {
    flexDirection: "row",
    gap: 8,
  },
  editRoomButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  editRoomText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  deleteRoomButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteRoomText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  actionsContainer: {
    padding: 20,
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
  },
})
