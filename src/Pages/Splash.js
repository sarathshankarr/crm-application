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


// import React, { useEffect } from 'react';
// import { View, StyleSheet, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withDelay,
//   interpolate,
//   Easing,
// } from 'react-native-reanimated';

// const Splash = () => {
//   const navigation = useNavigation();

//   // Shared values for animation
//   const translateX = useSharedValue(-300); // Start off-screen to the left
//   const dotOpacity = useSharedValue(0); // Start dots as invisible

//   useEffect(() => {
//     // Start animations
//     translateX.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.exp) }); // Slide logo to center
//     dotOpacity.value = withDelay(1000, withTiming(1, { duration: 1000 })); // Fade-in dots after delay

//     // Check login status after animations
//     const checkLoginStatus = async () => {
//       try {
//         const userDataString = await AsyncStorage.getItem('userdata');
//         const loggedIn = await AsyncStorage.getItem('loggedIn');
//         const userData = JSON.parse(userDataString);

//         setTimeout(() => {
//           if (loggedIn === 'true' && userData?.token) {
//             global.userData = userData;
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'Main' }],
//             });
//           } else {
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'Login' }],
//             });
//           }
//         }, 2000000000); // Wait for animations to finish
//       } catch (error) {
//         console.error('Error checking login status:', error);
//         Alert.alert('Error', 'Failed to retrieve login status.');
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'Login' }],
//         });
//       }
//     };

//     checkLoginStatus();
//   }, [translateX, dotOpacity, navigation]);

//   // Animated styles
//   const logoStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: translateX.value }],
//   }));

//   const dotStyle = useAnimatedStyle(() => ({
//     opacity: dotOpacity.value,
//   }));

//   return (
//     <View style={styles.container}>
//       {/* Animated Logo */}
//       <Animated.Image
//         style={[styles.logo, logoStyle]}
//         source={require('../../assets/Logo.png')}
//       />

//       {/* Animated Dots */}
//       <View style={styles.dotsContainer}>
//         {[0, 1, 2].map((_, index) => (
//           <Animated.View
//             key={index}
//             style={[
//               styles.dot,
//               dotStyle,
//               {
//                 transform: [
//                   {
//                     translateY: interpolate(
//                       dotOpacity.value,
//                       [0, 1],
//                       [20, 0] // Bounce effect for dots
//                     ),
//                   },
//                 ],
//               },
//             ]}
//           />
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   logo: {
//     width: 300,
//     height: 300,
//     resizeMode: 'contain',
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#1F74BA',
//     marginHorizontal: 5,
//   },
// });

// export default Splash;