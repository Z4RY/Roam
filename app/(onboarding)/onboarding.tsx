import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace({
        pathname: '/login',
        params: {
          animation: 'slide_from_right'
        }
      });
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>roam</Text>
        {/* <ActivityIndicator size="large" color="#2CA6A4" style={styles.spinner} /> */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.Text 
        style={[
          styles.title,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        Choose Any Location!
      </Animated.Text>

      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <Image 
          source={require('../../assets/images/onboarding.png')} 
          style={styles.image} 
        />
      </Animated.View>

      <Animated.Text 
        style={[
          styles.desc,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        This will not only allow you to work toward something important but will also help you find something meaningful
      </Animated.Text>

      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C7D7DC', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    width: 280,
    height: 280,
    marginTop: 42,
    marginBottom: 82,
    marginLeft: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    fontFamily: 'Product Sans',
    color: '#1A3557',
    alignSelf: 'flex-start',
    marginRight: 70,
    position: 'relative',

  },
  desc: {
    fontSize: 16,
    fontFamily: 'Syne',
    color: '#1A3557',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2CA6A4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 92,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#E11433',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    fontFamily: 'Product Sans',
  },
  spinner: {
    transform: [{ scale: 1.5 }],
  },
});