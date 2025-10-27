"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from "react-native"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "expo-router"
import LoaderScreen from "../(onboarding)/loader"
import { sendEmailVerification } from "firebase/auth"

const { width } = Dimensions.get("window")

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.emailVerified) {
        router.replace("/(tabs)")
      } else {
        Alert.alert(
          "Email Verification Required",
          "Please verify your email before continuing. Check your inbox.",
        )
      }
    }
  }, [user, loading])

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    try {
      if (isSignUp) {
        const result = await signUp(email, password)
        if (result?.user) {
          await sendEmailVerification(result.user)
          Alert.alert("Success", "Verification email sent! Please check your inbox.")
        }
      } else {
        await signIn(email, password)
        if (user && !user.emailVerified) {
          Alert.alert("Email not verified", "Please verify your email before logging in.")
          return
        }
      }
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert("Error", error.message)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert("Error", error.message)
    }
  }

  if (loading) return <LoaderScreen />

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.decorativeTop}>
        <Text style={styles.boomText}>BOOM</Text>
      </View>

      <View style={styles.cardsContainer}>
        {!isSignUp ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome</Text>
            <Text style={styles.cardSubtitle}>Log in securely</Text>

            <View style={styles.illustrationContainer}>
              <View style={styles.illustration} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
              <Text style={styles.primaryButtonText}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: "#4285F4" }]} onPress={handleGoogleSignIn}>
              <Text style={[styles.primaryButtonText, { color: "#fff" }]}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setIsSignUp(true)
                setEmail("")
                setPassword("")
                setConfirmPassword("")
              }}
            >
              <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign Up</Text>
            <Text style={styles.cardSubtitle}>Create an account, it's free</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.secondaryButton} onPress={handleAuth}>
              <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.loginLink}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsSignUp(false)
                  setEmail("")
                  setPassword("")
                  setConfirmPassword("")
                }}
              >
                <Text style={styles.loginLinkBold}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.decorativeBottom} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#B3E5FC" },
  contentContainer: { paddingVertical: 40, paddingHorizontal: 20 },
  decorativeTop: { alignItems: "center", marginBottom: 40 },
  boomText: { fontSize: 48, fontWeight: "bold", color: "rgba(255, 255, 255, 0.8)", letterSpacing: 2 },
  cardsContainer: { width: "100%" },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 8 },
  cardSubtitle: { fontSize: 14, color: "#999", marginBottom: 24 },
  illustrationContainer: { height: 200, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  illustration: { width: 120, height: 120, backgroundColor: "#E0E0E0", borderRadius: 12 },
  input: { borderBottomWidth: 1, borderBottomColor: "#E0E0E0", paddingVertical: 12, fontSize: 14, color: "#333", marginBottom: 16 },
  primaryButton: { backgroundColor: "white", borderWidth: 2, borderColor: "#333", borderRadius: 24, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  primaryButtonText: { color: "#333", fontSize: 16, fontWeight: "600" },
  secondaryButton: { backgroundColor: "#B3E5FC", borderRadius: 24, paddingVertical: 14, alignItems: "center" },
  secondaryButtonText: { color: "#333", fontSize: 16, fontWeight: "600" },
  loginLink: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  loginLinkText: { color: "#999", fontSize: 14 },
  loginLinkBold: { color: "#333", fontSize: 14, fontWeight: "600" },
  decorativeBottom: { height: 60 },
})
