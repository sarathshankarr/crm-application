import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";

const QRCodeScanner = (props) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [latestScannedData, setLatestScannedData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const device = useCameraDevice("back");

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13','ean-8', 'code-128', 'code-39'],
    onCodeScanned: (codes) => {
      try {
        // Make sure we have valid data before proceeding
        if (codes && codes.length > 0 && codes[0]?.value) {
          setLatestScannedData(codes[0]?.value);
          props.onRead(codes[0]?.value);
        } else {
          throw new Error("Invalid QR code data");
        }
      } catch (error) {
        console.error("Scanning error: ", error.message);
        Alert.alert("Error", "Failed to read the QR code. Please try again.");
      }
    },
  });

  useEffect(() => {
    setRefresh(!refresh);
  }, [device, hasPermission]);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const permission = await Camera.requestCameraPermission();
        console.log("Camera.requestCameraPermission ", permission);
        setHasPermission(permission === "granted");
      } catch (error) {
        console.error("Permission error: ", error.message);
        Alert.alert("Permission Error", "Failed to get camera permission. Please enable it in settings.");
      }
    };

    requestCameraPermission();

    // Timeout to close the scanner after a certain period if no scan happens
    const timeout = setTimeout(() => {
      props.onRead(null);
    }, 15 * 1000);

    return () => clearTimeout(timeout); // Cleanup the timeout on unmount
  }, []);

  if (device === null || !hasPermission) {
    return (
      <View style={styles.page2}>
        <Text style={{ backgroundColor: "white" }}>
          Camera not available or not permitted
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page2}>
      <Camera
        codeScanner={codeScanner}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={{
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "snow",
            alignItems: "center",
          }}
          onPress={() => {
            props.onRead(null);
          }}
        >
          {latestScannedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Latest Scanned Code:</Text>
          <Text style={styles.resultText}>{latestScannedData}</Text>
        </View>
      )}
          <Text style={{ color: "snow", fontSize: 14 }}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default QRCodeScanner;

const styles = StyleSheet.create({
  page2: {
    flex: 1,
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  backHeader: {
    backgroundColor: "#00000090",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "2%",
    height: "5%",
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  footer: {
    backgroundColor: "#00000090",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "10%",
    height: "20%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  resultContainer: {
    position: 'absolute',
    bottom: 40, // Adjust the position to provide space between the camera view and the result container
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  resultText: {
    fontSize: 14,
    color: 'white',
  },
});
