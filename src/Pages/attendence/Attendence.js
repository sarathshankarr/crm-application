// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Platform,
//   PermissionsAndroid,
//   Alert,
//   Modal,
//   Pressable,
//   FlatList,
//   ActivityIndicator,
// } from 'react-native';
// import Geolocation from 'react-native-geolocation-service';
// import { useSelector } from 'react-redux';
// import { API } from '../../config/apiConfig';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { formatDateIntoDMY } from '../../Helper/Helper';

// const Attendance = () => {
//   const userData = useSelector(state => state.loggedInUser);
//   const userId = userData?.userId;

//   const [isSignedIn, setIsSignedIn] = useState(false);
//   const [signInTime, setSignInTime] = useState('');
//   const [signInDay, setSignInDay] = useState('');
//   const [signInDate, setSignInDate] = useState('');
//   const [signInLocation, setSignInLocation] = useState({ lat: null, long: null });

//   const [signOutTime, setSignOutTime] = useState('');
//   const [signOutDay, setSignOutDay] = useState('');
//   const [signOutDate, setSignOutDate] = useState('');
//   const [signOutLocation, setSignOutLocation] = useState({
//     lat: null,
//     long: null,
//   });

//   const [modalVisible, setModalVisible] = useState(false);
//   const [latestRecord, setLatestRecord] = useState({});

//   const [currentTime, setCurrentTime] = useState('');
//   const [currentDate, setCurrentDate] = useState('');
//   const [currentDay, setCurrentDay] = useState('');

//   const selectedCompany = useSelector(state => state.selectedCompany);
//   const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

//   const [punchRecords, setPunchRecords] = useState([]);

//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchInitialSelectedCompany = async () => {
//       try {
//         const initialCompanyData = await AsyncStorage.getItem(
//           'initialSelectedCompany',
//         );
//         if (initialCompanyData) {
//           const initialCompany = JSON.parse(initialCompanyData);
//           setInitialSelectedCompany(initialCompany);
//         }
//       } catch (error) {
//         console.error('Error fetching initial selected company:', error);
//       }
//     };

//     fetchInitialSelectedCompany();
//   }, []);

//   const companyId = selectedCompany
//     ? selectedCompany.id
//     : initialSelectedCompany?.id;

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       const now = new Date();
//       const timeString = now.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//       });
//       setCurrentTime(timeString);
//       const dayString = now.toLocaleDateString('en-US', { weekday: 'long' });
//       setCurrentDay(dayString);
//     }, 1000); // Update every second

//     return () => clearInterval(intervalId); // Clean up interval on unmount
//   }, []);

//   useEffect(() => {
//     requestLocationPermission();
//     getPunchInPunchOut();
//   }, []);
//   const getLocationWithRetries = async (retries = 3) => {
//     for (let i = 0; i < retries; i++) {
//       try {
//         const location = await getLocation();
//         if (location.lat && location.long) {
//           return location; // Successfully got location
//         }
//       } catch (error) {
//         console.log(`Retry ${i + 1}: Failed to get location, retrying...`);
//       }
//     }
//     throw new Error('Unable to retrieve location after retries.');
//   };

//   useEffect(() => {
//     setCurrentDate(getCurrentDate());
//   }, []);

//   // Function to request location permission
//   const requestLocationPermission = async () => {
//     if (Platform.OS === 'ios') {
//       Geolocation.requestAuthorization('whenInUse');
//     } else {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Permission',
//             message: 'We need access to your location to display it.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           console.log('Location permission granted');
//         } else {
//           console.log('Location permission denied');
//         }
//       } catch (err) {
//         console.warn(err);
//       }
//     }
//   };

//   // Function to get the current location
//   const getLocation = async () => {
//     return new Promise((resolve, reject) => {
//       Geolocation.getCurrentPosition(
//         position => {
//           const { latitude, longitude } = position.coords;
//           resolve({ lat: latitude, long: longitude });
//         },
//         error => {
//           console.error('Error getting location:', error);
//           Alert.alert('Error', 'Could not get current location.');
//           reject(error);
//         },
//         { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
//       );
//     });
//   };

//   const getCurrentDate = () => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
//     const day = now.getDate().toString().padStart(2, '0');
//     return `${year}-${month}-${day}`; // Format YYYY-MM-DD
//   };

//   const extractTime = dateTimeString => {
//     return new Date(dateTimeString).toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };
//   const extractDate = dateTimeString => {
//     return new Date(dateTimeString).toLocaleDateString([], {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//     });
//   };
//   const formatDateTime = date => {
//     const year = date.getFullYear();
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     const seconds = date.getSeconds().toString().padStart(2, '0');
//     return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; // Format YYYY-MM-DDTHH:MM:SS
//   };

//   // const handleSignToggle = async () => {
//   //   if (loading) return; // Prevent multiple clicks

//   //   setLoading(true); // Start loading
//   //   const now = new Date();
//   //   const currentDateTime = formatDateTime(now);
//   //   const day = now.toLocaleDateString('en-US', { weekday: 'long' });

//   //   try {
//   //     const location = await getLocation();
//   //     if (!isSignedIn) {
//   //       setSignInTime(extractTime(currentDateTime));
//   //       setSignInDay(day);
//   //       setSignInDate(currentDateTime.split('T')[0]);
//   //       setSignInLocation(location);
//   //     } else {
//   //       setSignOutTime(extractTime(currentDateTime));
//   //       setSignOutDay(day);
//   //       setSignOutDate(currentDateTime.split('T')[0]);
//   //       setSignOutLocation(location);
//   //     }

//   //     await PunchInPunchOut(); // Await API call

//   //     setIsSignedIn(prevState => !prevState);
//   //   } catch (error) {
//   //     console.error('Error:', error);
//   //     Alert.alert('Error', 'Could not get current location.');
//   //   } finally {
//   //     setLoading(false); // Stop loading after request is done
//   //   }
//   // };

//   // const PunchInPunchOut = async () => {
//   //   const now = new Date();
//   //   const formattedDateTime = formatDateTime(now);
//   //   const formattedDate = formattedDateTime.split('T')[0];
//   //   const location = isSignedIn ? signInLocation : signOutLocation;

//   //   const apiUrl = `${global?.userData?.productURL}${API.PUNCH_IN_PUNCH_OUT}`;

//   //   const payload = isSignedIn
//   //     ? {
//   //       employeeId: userId,
//   //       punchOut: formattedDateTime,
//   //       punch_out_latitude: location.lat,
//   //       punch_out_longitude: location.long,
//   //       date: formattedDate,
//   //       companyId: companyId,
//   //     }
//   //     : {
//   //       employeeId: userId,
//   //       punchIn: formattedDateTime,
//   //       punch_in_latitude: location.lat,
//   //       punch_in_longitude: location.long,
//   //       date: formattedDate,
//   //       companyId: companyId,
//   //     };

//   //   console.log('payload==================>', payload);

//   //   try {
//   //     const response = await axios.put(apiUrl, payload, {
//   //       headers: {
//   //         Authorization: `Bearer ${global?.userData?.token?.access_token}`,
//   //         'Content-Type': 'application/json',
//   //       },
//   //     });

//   //     console.log('Response:', response.data);
//   //   } catch (error) {
//   //     console.error('Error:', error);
//   //     Alert.alert('Error', 'Failed to punch in/out. Please try again.');
//   //   }
//   // };

//   const handleSignToggle = async () => {
//     if (loading) return;

//     setLoading(true);
//     try {
//       // Fetch location with retries, ensure location is available
//       const location = await getLocationWithRetries(3);
//       if (!location || !location.lat || !location.long) {
//         throw new Error('Unable to retrieve location. Please try again.');
//       }

//       const now = new Date();
//       const currentDateTime = formatDateTime(now); // E.g. '2024-10-18T12:00:00'
//       const day = now.toLocaleDateString('en-US', { weekday: 'long' });

//       // If signing in
//       if (!isSignedIn) {
//         // Set state before punch-in
//         setSignInLocation(location);
//         setSignInTime(extractTime(currentDateTime));
//         setSignInDay(day);
//         setSignInDate(currentDateTime.split('T')[0]);
//       } else {
//         // Set state before punch-out
//         setSignOutLocation(location);
//         setSignOutTime(extractTime(currentDateTime));
//         setSignOutDay(day);
//         setSignOutDate(currentDateTime.split('T')[0]);
//       }

//       // Punch-in/out after ensuring location is set
//       await PunchInPunchOut(location, currentDateTime, day);
//       console.log('Location:', location);
//       console.log('Sign-In Time:', currentDateTime);

//       // Toggle sign-in state after punch-in/out success
//       setIsSignedIn(prevState => !prevState);
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to punch in/out. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const PunchInPunchOut = async (location, currentDateTime, day) => {
//     const formattedDate = currentDateTime.split('T')[0];

//     const apiUrl = `${global?.userData?.productURL}${API.PUNCH_IN_PUNCH_OUT}`;

//     const payload = isSignedIn
//       ? {
//           employeeId: userId,
//           punchOut: currentDateTime,
//           punch_out_latitude: location.lat,
//           punch_out_longitude: location.long,
//           date: formattedDate,
//           companyId: companyId,
//         }
//       : {
//           employeeId: userId,
//           punchIn: currentDateTime,
//           punch_in_latitude: location.lat,
//           punch_in_longitude: location.long,
//           date: formattedDate,
//           companyId: companyId,
//         };

//     console.log('payload==================>', payload);

//     try {
//       const response = await axios.put(apiUrl, payload, {
//         headers: {
//           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       console.log('Response:', response.data);
//     } catch (error) {
//       console.error('Error:', error);
//       Alert.alert('Error', 'Failed to punch in/out. Please try again.');
//     }
//   };

//   const getPunchInPunchOut = async () => {
//     const formattedDate = getCurrentDate();
//     const apiUrl = `${global?.userData?.productURL}${API.GET_PUNCH_IN_PUNCH_OUT}/${userId}/${formattedDate}`;

//     try {
//       const response = await axios.get(apiUrl, {
//         headers: {
//           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
//         },
//       });

//       console.log('response.data', response.data);

//       // Store all records in the state
//       setPunchRecords(response.data);

//       // Set other states for the latest record (optional)
//       const latestRecord = response.data[0];
//       setIsSignedIn(latestRecord?.loggedStts === 0);
//       setSignInTime(
//         latestRecord?.punchIn ? extractTime(latestRecord?.punchIn) : '',
//       );
//       setSignInDay(
//         new Date(latestRecord?.punchIn).toLocaleDateString('en-US', {
//           weekday: 'long',
//         }) || '',
//       );
//       setSignInDate(
//         new Date(latestRecord?.punchIn).toISOString().split('T')[0] || '',
//       );
//       setSignInLocation({
//         lat: latestRecord?.punch_in_latitude,
//         long: latestRecord?.punch_in_longitude,
//       });
//       setSignOutTime(
//         latestRecord?.punchOut ? extractTime(latestRecord?.punchOut) : '',
//       );
//       setSignOutDay(
//         new Date(latestRecord?.punchOut).toLocaleDateString('en-US', {
//           weekday: 'long',
//         }) || '',
//       );
//       setSignOutDate(
//         new Date(latestRecord?.punchOut).toISOString().split('T')[0] || '',
//       );
//       setSignOutLocation({
//         lat: latestRecord.punch_out_latitude,
//         long: latestRecord.punch_out_longitude,
//       });
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const openModal = () => {
//     getPunchInPunchOut();
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}></View>

//       <View style={styles.greetingContainer}>
//         <Text style={styles.greetingText}>Hello 👋</Text>
//       </View>

//       <View style={styles.shiftCard}>
//         <View style={styles.rowContainer}>
//           <View style={styles.shiftTime}>
//             <Text style={styles.timeText}>
//               <Text>{currentTime}</Text>
//             </Text>
//           </View>
//           <View style={styles.shiftDetails}>
//             <Text style={styles.shiftText}>
//               {/* {isSignedIn ? signInDay : signOutDay} */}
//               {currentDay}
//             </Text>
//             <Text style={styles.dateText}>
//               {/* {isSignedIn ? signInDate : signOutDate} */}
//               {formatDateIntoDMY(currentDate)}
//             </Text>
//           </View>
//         </View>

//         <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//           <TouchableOpacity style={styles.SwipesButton} onPress={openModal}>
//             <Text style={{ color: '#fff', fontSize: 15 }}>View Swipes</Text>
//           </TouchableOpacity>
//           {/* <TouchableOpacity
//             style={styles.signOutButton}
//             onPress={handleSignToggle}>
//             <Text style={{color: '#fff', fontSize: 15}}>
//               {isSignedIn ? 'Punch Out' : 'Punch In'}
//             </Text>
//           </TouchableOpacity> */}
//           <TouchableOpacity
//             style={[styles.signOutButton, loading ? { opacity: 0.5 } : {}]}
//             onPress={handleSignToggle}
//             disabled={loading} // Disable button while loading
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" /> // Show spinner during loading
//             ) : (
//               <Text style={{ color: '#fff', fontSize: 15 }}>
//                 {isSignedIn ? 'Punch Out' : 'Punch In'}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={closeModal}>
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContainer}>
//             <View style={styles.swipeshead}>
//               <Text style={styles.modalTitle}>Swipes</Text>
//               <Text style={styles.datetxt}>Date: {formatDateIntoDMY(currentDate)}</Text>
//             </View>

//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 backgroundColor: 'lightgray',
//               }}>
//               <Text style={styles.modalContentpunchin}>Punch In Time </Text>
//               <Text style={styles.modalContentpunchout}>Punch Out Time</Text>
//             </View>
//             {punchRecords.length === 0 ? (
//               <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
//             ) : (
//               <FlatList
//                 data={punchRecords}
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item }) => (
//                   <View style={styles.recordContainer}>
//                     <Text style={{ color: '#000', fontWeight: '500',marginLeft:10}}>
//                       {item?.punchIn ? extractTime(item?.punchIn) : 'N/A'}
//                     </Text>
//                     <Text style={{ color: '#000', fontWeight: '500',flex:0.5,marginRight:20}}>
//                       {item?.punchOut ? extractTime(item?.punchOut) : 'N/A'}
//                     </Text>
//                   </View>
//                 )}
//               />
//             )}
//             <Pressable style={styles.closeButton} onPress={closeModal}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   greetingContainer: {
//     marginTop: 20,
//   },
//   greetingText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   shiftCard: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginVertical: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//     borderWidth: 1,
//   },
//   rowContainer: {
//     flexDirection: 'row', // Display items in a row
//     justifyContent: 'space-between', // Add space between time and details
//     alignItems: 'center',
//     marginBottom: 10, // Add space between row and button
//   },
//   shiftTime: {
//     flex: 1.4,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: 75,
//     paddingVertical: 60,
//     paddingHorizontal: 12,
//   },
//   shiftDetails: {
//     flex: 1.8,
//     alignItems: 'flex-end',
//     marginRight: 12,
//   },
//   signOutButton: {
//     backgroundColor: '#3578e5',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 8,
//     alignSelf: 'flex-end', // Center the button
//   },
//   shiftText: {
//     color: '#000',
//     fontWeight: 'bold',
//     alignItems: 'flex-end',
//     fontSize: 18,
//   },
//   SwipesButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//     marginLeft: 15,
//     alignSelf: 'flex-end', // Center the button
//     backgroundColor: '#3578e5',
//   },
//   signOutText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   timeText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#FFA500',
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#000',
//     fontWeight: 'bold',
//     fontSize: 15,
//   },
//   locationText: {
//     fontSize: 14,
//     color: '#000',
//     marginTop: 5,
//   },
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContainer: {
//     width: '95%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     elevation: 10,
//   },
//   swipeshead: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#FFA500',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#000',
//     marginHorizontal: 10,
//     marginVertical: 5,
//   },
//   datetxt: {
//     color: '#000',
//     fontWeight: 'bold',
//     fontSize: 18,
//     marginHorizontal: 10,
//   },

//   modalContentpunchin: {
//     fontSize: 16,
//     marginVertical: 5,
//     color: '#000',
//     fontWeight: 'bold',
//     marginHorizontal:10,
//     marginVertical: 5,
//   },
//   modalContentpunchout:{
//     fontSize: 16,
//     marginVertical: 5,
//     color: '#000',
//     fontWeight: 'bold',
//     marginVertical: 5,
//     marginRight:40
//   },
//   closeButton: {
//     backgroundColor: '#dc3545',
//     padding: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   recordContainer: {
//     flexDirection: 'row',
//     marginVertical: 2,
//     justifyContent:"space-between",
//     },
//   noCategoriesText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000000',
//   },
// });

// export default Attendance;

import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Image,
  SafeAreaView,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {useSelector} from 'react-redux';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TickAnimationModal from '../../components/TickAnimationModal';
import {formatDateIntoDMY} from '../../Helper/Helper';
import LinearGradient from 'react-native-linear-gradient';

const Attendance = () => {
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signInTime, setSignInTime] = useState('');
  const [signInDay, setSignInDay] = useState('');
  const [signInDate, setSignInDate] = useState('');
  const [signInLocation, setSignInLocation] = useState({lat: null, long: null});

  const [signOutTime, setSignOutTime] = useState('');
  const [signOutDay, setSignOutDay] = useState('');
  const [signOutDate, setSignOutDate] = useState('');
  const [signOutLocation, setSignOutLocation] = useState({
    lat: null,
    long: null,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [latestRecord, setLatestRecord] = useState({});

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  const selectedCompany = useSelector(state => state.selectedCompany);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

  const [punchRecords, setPunchRecords] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showTick, setShowTick] = useState(false);
  const [modalTickVisible, setModalTickVisible] = useState(false);
  const [punchStatus, setPunchStatus] = useState('');

  const [isMorning, setIsMorning] = useState(true);

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem(
          'initialSelectedCompany',
        );
        if (initialCompanyData) {
          const initialCompany = JSON.parse(initialCompanyData);
          setInitialSelectedCompany(initialCompany);
        }
      } catch (error) {
        console.error('Error fetching initial selected company:', error);
      }
    };

    fetchInitialSelectedCompany();
  }, []);

  const companyId = selectedCompany
    ? selectedCompany.id
    : initialSelectedCompany?.id;

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(timeString);
      const dayString = now.toLocaleDateString('en-US', {weekday: 'long'});
      setCurrentDay(dayString);
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, []);

  useEffect(() => {
    requestLocationPermission();
    getPunchInPunchOut();
  }, []);
  const getLocationWithRetries = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const location = await getLocation();
        if (location.lat && location.long) {
          return location; // Successfully got location
        }
      } catch (error) {
        console.log(`Retry ${i + 1}: Failed to get location, retrying...`);
      }
    }
    throw new Error('Unable to retrieve location after retries.');
  };

  useEffect(() => {
    setCurrentDate(getCurrentDate());
  }, []);

  // Function to request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need access to your location to display it.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Function to get the current location
  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({lat: latitude, long: longitude});
        },
        error => {
          console.error('Error getting location:', error);
          Alert.alert('Error', 'Could not get current location.');
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // Format YYYY-MM-DD
  };

  const extractTime = dateTimeString => {
    return new Date(dateTimeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  const extractDate = dateTimeString => {
    return new Date(dateTimeString).toLocaleDateString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  const formatDateTime = date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; // Format YYYY-MM-DDTHH:MM:SS
  };

  // const handleSignToggle = async () => {
  //   if (loading) return; // Prevent multiple clicks

  //   setLoading(true); // Start loading
  //   const now = new Date();
  //   const currentDateTime = formatDateTime(now);
  //   const day = now.toLocaleDateString('en-US', { weekday: 'long' });

  //   try {
  //     const location = await getLocation();
  //     if (!isSignedIn) {
  //       setSignInTime(extractTime(currentDateTime));
  //       setSignInDay(day);
  //       setSignInDate(currentDateTime.split('T')[0]);
  //       setSignInLocation(location);
  //     } else {
  //       setSignOutTime(extractTime(currentDateTime));
  //       setSignOutDay(day);
  //       setSignOutDate(currentDateTime.split('T')[0]);
  //       setSignOutLocation(location);
  //     }

  //     await PunchInPunchOut(); // Await API call

  //     setIsSignedIn(prevState => !prevState);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     Alert.alert('Error', 'Could not get current location.');
  //   } finally {
  //     setLoading(false); // Stop loading after request is done
  //   }
  // };

  // const PunchInPunchOut = async () => {
  //   const now = new Date();
  //   const formattedDateTime = formatDateTime(now);
  //   const formattedDate = formattedDateTime.split('T')[0];
  //   const location = isSignedIn ? signInLocation : signOutLocation;

  //   const apiUrl = `${global?.userData?.productURL}${API.PUNCH_IN_PUNCH_OUT}`;

  //   const payload = isSignedIn
  //     ? {
  //       employeeId: userId,
  //       punchOut: formattedDateTime,
  //       punch_out_latitude: location.lat,
  //       punch_out_longitude: location.long,
  //       date: formattedDate,
  //       companyId: companyId,
  //     }
  //     : {
  //       employeeId: userId,
  //       punchIn: formattedDateTime,
  //       punch_in_latitude: location.lat,
  //       punch_in_longitude: location.long,
  //       date: formattedDate,
  //       companyId: companyId,
  //     };

  //   console.log('payload==================>', payload);

  //   try {
  //     const response = await axios.put(apiUrl, payload, {
  //       headers: {
  //         Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     console.log('Response:', response.data);
  //   } catch (error) {
  //     console.error('Error:', error);
  //     Alert.alert('Error', 'Failed to punch in/out. Please try again.');
  //   }
  // };

  const handleSignToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const location = await getLocationWithRetries(3);
      if (!location || !location.lat || !location.long) {
        throw new Error('Unable to retrieve location. Please try again.');
      }

      const now = new Date();
      const currentDateTime = formatDateTime(now);
      const day = now.toLocaleDateString('en-US', {weekday: 'long'});

      // Update sign in/out times and locations
      if (!isSignedIn) {
        setSignInLocation(location);
        setSignInTime(extractTime(currentDateTime));
        setSignInDay(day);
        setSignInDate(currentDateTime.split('T')[0]);
      } else {
        setSignOutLocation(location);
        setSignOutTime(extractTime(currentDateTime));
        setSignOutDay(day);
        setSignOutDate(currentDateTime.split('T')[0]);
      }

      // Call the punch in/out API
      await PunchInPunchOut(location, currentDateTime, day);

      // Update punch status after successful API call
      setPunchStatus(isSignedIn ? 'out' : 'in'); // Update punchStatus based on sign-in state

      // Toggle sign-in state after successful punch-in/out
      setIsSignedIn(prevState => !prevState);
      setModalTickVisible(true);
      setShowTick(true);

      // Hide the tick and modal after 2 seconds
      setTimeout(() => {
        setShowTick(false);
        setModalTickVisible(false); // Close the modal here
      }, 2000);
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to punch in/out. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const PunchInPunchOut = async (location, currentDateTime, day) => {
    const formattedDate = currentDateTime.split('T')[0];

    const apiUrl = `${global?.userData?.productURL}${API.PUNCH_IN_PUNCH_OUT}`;

    const payload = isSignedIn
      ? {
          employeeId: userId,
          punchOut: currentDateTime,
          punch_out_latitude: location.lat,
          punch_out_longitude: location.long,
          date: formattedDate,
          companyId: companyId,
        }
      : {
          employeeId: userId,
          punchIn: currentDateTime,
          punch_in_latitude: location.lat,
          punch_in_longitude: location.long,
          date: formattedDate,
          companyId: companyId,
        };

    console.log('payload==================>', payload);

    try {
      const response = await axios.put(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to punch in/out. Please try again.');
    }
  };

  const getPunchInPunchOut = async () => {
    const formattedDate = getCurrentDate();
    const apiUrl = `${global?.userData?.productURL}${API.GET_PUNCH_IN_PUNCH_OUT}/${userId}/${formattedDate}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log('response.data', response.data);

      // Store all records in the state
      setPunchRecords(response.data);

      // Set other states for the latest record (optional)
      const latestRecord = response.data[0];
      setIsSignedIn(latestRecord?.loggedStts === 0);
      setSignInTime(
        latestRecord?.punchIn ? extractTime(latestRecord?.punchIn) : '',
      );
      setSignInDay(
        new Date(latestRecord?.punchIn).toLocaleDateString('en-US', {
          weekday: 'long',
        }) || '',
      );
      setSignInDate(
        new Date(latestRecord?.punchIn).toISOString().split('T')[0] || '',
      );
      setSignInLocation({
        lat: latestRecord?.punch_in_latitude,
        long: latestRecord?.punch_in_longitude,
      });
      setSignOutTime(
        latestRecord?.punchOut ? extractTime(latestRecord?.punchOut) : '',
      );
      setSignOutDay(
        new Date(latestRecord?.punchOut).toLocaleDateString('en-US', {
          weekday: 'long',
        }) || '',
      );
      setSignOutDate(
        new Date(latestRecord?.punchOut).toISOString().split('T')[0] || '',
      );
      setSignOutLocation({
        lat: latestRecord.punch_out_latitude,
        long: latestRecord.punch_out_longitude,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = () => {
    getPunchInPunchOut();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const updateCurrentTimeAndPeriod = () => {
      const now = new Date();
      const hours = now.getHours();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setIsMorning(hours < 12); // Determine if it's morning or evening
    };

    // Set initial state immediately before starting the interval
    updateCurrentTimeAndPeriod();

    // Start interval to update time every second
    const intervalId = setInterval(updateCurrentTimeAndPeriod, 1000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Render only after `isMorning` has been determined
  if (isMorning === null) return null;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
       <View>
        <Text
          style={{
            color: '#000',
            fontSize: 20,
            fontWeight: 'bold',
            alignSelf:"center"
          }}>
       Attendence
        </Text>
      </View>
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello 👋</Text>
      </View>
      <View style={[styles.container]}>
        <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={
            isMorning
              ? require('../../../assets/morn.jpeg')
              : require('../../../assets/eve.jpeg')
          }
          resizeMode="contain"
        />
        </View>
        <View style={styles.shiftCard}>
          <LinearGradient
            colors={
              isMorning
                ? ['#8be1f8', 'transparent']
                : ['#cb65a4', 'transparent']
            }
            style={styles.gradientOverlay}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 0.5}}
          />
          <View style={styles.rowContainer}>
            <View style={styles.shiftTime}>
              <Text style={styles.timeText}>
                <Text>{currentTime}</Text>
              </Text>
            </View>
            <View style={styles.shiftDetails}>
              <Text style={styles.shiftText}>
                {/* {isSignedIn ? signInDay : signOutDay} */}
                {currentDay}
              </Text>
              <Text style={styles.dateText}>
                {/* {isSignedIn ? signInDate : signOutDate} */}
                {formatDateIntoDMY(currentDate)}
              </Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity style={styles.SwipesButton} onPress={openModal}>
              <Text style={{color: '#fff', fontSize: 15}}>View Swipes</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignToggle}>
            <Text style={{color: '#fff', fontSize: 15}}>
              {isSignedIn ? 'Punch Out' : 'Punch In'}
            </Text>
          </TouchableOpacity> */}
            <>
              <TouchableOpacity
                style={[styles.signOutButton, loading ? {opacity: 0.5} : {}]}
                onPress={handleSignToggle}
                disabled={loading} // Disable button while loading
              >
                {loading ? (
                  <ActivityIndicator color="#fff" /> // Show spinner during loading
                ) : (
                  <Text style={{color: '#fff', fontSize: 15}}>
                    {isSignedIn ? 'Punch Out' : 'Punch In'}
                  </Text>
                )}
              </TouchableOpacity>
              <TickAnimationModal
                isVisible={modalTickVisible}
                onClose={() => setModalTickVisible(false)}
                punchStatus={punchStatus}
                currentTime={currentTime}
                currentDate={currentDate}
                currentDay={currentDay}
              />
              {/* Show tick animation if punch-in/out is successful */}
              {/* {showTick && <TickAnimationModal isVisible={showTick} />} */}
            </>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.swipeshead}>
                <Text style={styles.modalTitle}>Swipes</Text>
                <Text style={styles.datetxt}>
                  Date: {formatDateIntoDMY(currentDate)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: 'lightgray',
                }}>
                <Text style={styles.modalContent}>Punch In Time: </Text>
                <Text style={styles.modalContent}>Punch Out Time:</Text>
              </View>
              {punchRecords.length === 0 ? (
                <Text style={styles.noCategoriesText}>
                  Sorry, no results found!
                </Text>
              ) : (
                <FlatList
                  data={punchRecords}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <View style={styles.recordContainer}>
                      <Text style={{color: '#000', fontWeight: '500'}}>
                        {item?.punchIn ? extractTime(item?.punchIn) : 'N/A'}
                      </Text>
                      <Text style={{color: '#000', fontWeight: '500'}}>
                        {item?.punchOut ? extractTime(item?.punchOut) : 'N/A'}
                      </Text>
                    </View>
                  )}
                />
              )}
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 15,
  },
  imageContainer: {
    width: '100%',
    height: 95,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  greetingContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    position: 'relative', // Important for overlay positioning
    overflow: 'hidden', // Ensure overlay stays within card
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: 'row', // Display items in a row
    justifyContent: 'space-between', // Add space between time and details
    alignItems: 'center',
    marginBottom: 10, // Add space between row and button
  },
  shiftTime: {
    flex: 1.4,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 75,
    paddingVertical: 55,
    paddingHorizontal: 12,
  },
  shiftDetails: {
    flex: 1.8,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  signOutButton: {
    backgroundColor: '#3578e5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-end', // Center the button
  },
  shiftText: {
    color: '#000',
    fontWeight: 'bold',
    alignItems: 'flex-end',
    fontSize: 18,
  },
  SwipesButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 15,
    alignSelf: 'flex-end', // Center the button
    backgroundColor: '#3578e5',
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  dateText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  locationText: {
    fontSize: 14,
    color: '#000',
    marginTop: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 10,
  },
  swipeshead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFA500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  datetxt: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 10,
  },

  modalContent: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000',
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 2,
  },
  noCategoriesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default Attendance;
