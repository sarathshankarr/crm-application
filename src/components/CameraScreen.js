// CameraScreen.js
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { runOnJS } from 'react-native-reanimated';

const CameraScreen = ({ navigation, route }) => {
  const { onImageCaptured } = route.params;
  const device = useCameraDevice('back');
  const camera = useRef(null);
  const isFocused = useIsFocused();
  const [isActive, setIsActive] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  const format = useCameraFormat(device, [
    { photoResolution: 'max' },
    { photoAspectRatio: 1 }, // Square aspect ratio
  ]);

  const takePhoto = async () => {
    if (isCapturing || !camera.current) return;
    
    setIsCapturing(true);
    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        enableShutterSound: false,
      });

      // Process the captured photo
      const imageDetails = {
        path: `file://${photo.path}`,
        width: photo.width,
        height: photo.height,
      };

      // Call the callback function with the image details
      if (onImageCaptured) {
        runOnJS(onImageCaptured)(imageDetails);
      }

      // Go back to previous screen
      runOnJS(navigation.goBack)();
    } catch (error) {
      console.error('Failed to take photo:', error);
      runOnJS(Alert.alert)('Error', 'Failed to capture photo. Please try again.');
    } finally {
      runOnJS(setIsCapturing)(false);
    }
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Camera device not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && isActive && (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          photo={true}
          format={format}
        />
      )}
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={takePhoto}
          disabled={isCapturing}
        />
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CameraScreen;