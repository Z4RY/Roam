import { View, Text, StyleSheet } from 'react-native';

export default function LoaderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>roam</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E11D3F', // Red background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
});