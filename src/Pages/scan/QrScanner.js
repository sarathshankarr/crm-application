import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';

const QRCodeScanner = props => {
  const [hasPermission, setHasPermission] = useState(false);
  const [latestScannedData, setLatestScannedData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const device = useCameraDevice('back');
  const navigation = useNavigation();

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39'],
    onCodeScanned: codes => {
      try {
        if (codes && codes.length > 0 && codes[0]?.value) {
          console.log('Scanned Code:', codes[0]?.value);
          setLatestScannedData(codes[0]?.value);
          props.route.params?.onRead(codes[0]?.value); // Pass scanned data back to parent
          navigation.goBack(); // Close scanner
        } else {
          throw new Error('No valid QR code detected');
        }
      } catch (error) {
        console.error('Scanning error: ', error.message);
        Alert.alert('Error', 'Failed to read the QR code. Please try again.', [
          {text: 'Retry', onPress: () => setRefresh(!refresh)},
        ]);
      }
    },
  });

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const permission = await Camera.requestCameraPermission();
        console.log('Camera.requestCameraPermission: ', permission);
        setHasPermission(permission === 'granted');
      } catch (error) {
        console.error('Permission error: ', error.message);
        Alert.alert(
          'Permission Error',
          'Failed to get camera permission. Please enable it in settings.',
        );
      }
    };

    requestCameraPermission();

    // Timeout to close the scanner after a certain period if no scan happens
    const timeout = setTimeout(() => {
      props.route.params?.onRead(null);
    }, 15 * 1000);

    return () => clearTimeout(timeout); // Cleanup the timeout on unmount
  }, []);

  useEffect(() => {
    setRefresh(!refresh); // Trigger a re-render when device or permission changes
  }, [device, hasPermission]);

  if (!device || !hasPermission) {
    return (
      <View style={styles.page}>
        <Text style={styles.errorText}>
          Camera not available or not permitted
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Camera
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (
              props.route.params?.onRead &&
              typeof props.route.params.onRead === 'function'
            ) {
              props.route.params.onRead(null); // Notify parent no scan happened
            }
            navigation.goBack();
          }}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
      {latestScannedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Latest Scanned Code:</Text>
          <Text style={styles.resultText}>{latestScannedData}</Text>
        </View>
      )}
    </View>
  );
};

export default QRCodeScanner;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  footer: {
    backgroundColor: '#00000090',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'white',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    color: 'white',
  },
});
