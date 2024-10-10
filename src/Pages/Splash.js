import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userdata');
        const loggedIn = await AsyncStorage.getItem('loggedIn');
        const userData = JSON.parse(userDataString);

        if (loggedIn === 'true' && userData?.token) {
          global.userData = userData; // Ensure global userData is updated
          // Navigate to the main screen if already logged in
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          // Navigate to the login screen if not logged in
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        Alert.alert('Error', 'Failed to retrieve login status.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    checkLoginStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../../assets/Logo.png')} />
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },
});

export default Splash;
