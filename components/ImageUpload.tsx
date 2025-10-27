import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera roll permission is required to upload images.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (disabled || uploading) return;
    
    if (images.length >= maxImages) {
      Alert.alert('Maximum images reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setUploading(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = result.assets[0].uri;
        onImagesChange([...images, newImage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error('Image picker error:', error);
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    if (disabled || uploading) return;
    
    if (images.length >= maxImages) {
      Alert.alert('Maximum images reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission is required to take photos.');
      return;
    }

    setUploading(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = result.assets[0].uri;
        onImagesChange([...images, newImage]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    if (disabled) return;
    
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          }
        }
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose how you want to add an image',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>
        Room Images ({images.length}/{maxImages})
      </ThemedText>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            {!disabled && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <IconSymbol name="xmark" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {images.length < maxImages && !disabled && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showImageOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ThemedText style={styles.addButtonText}>Uploading...</ThemedText>
            ) : (
              <>
                <IconSymbol name="plus" size={24} color="#007AFF" />
                <ThemedText style={styles.addButtonText}>Add Image</ThemedText>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {images.length === 0 && (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="photo" size={40} color="#ccc" />
          <ThemedText style={styles.emptyText}>
            No images added yet. Tap the button above to add photos of your room.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  scrollView: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  addButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  emptyText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
});

