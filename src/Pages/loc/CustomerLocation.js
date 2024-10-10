// import React, { useEffect, useState } from 'react';
// import {
//   Text,
//   TouchableOpacity,
//   View,
//   PermissionsAndroid,
//   StyleSheet,
//   Alert,
//   Platform,
//   ActivityIndicator,
//   Image,
//   Switch,
//   ScrollView,
//   Linking,
// } from 'react-native';
// import Geolocation from 'react-native-geolocation-service';
// import axios from 'axios';
// import { useSelector } from 'react-redux';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';
// import { API } from '../../config/apiConfig';
// import { RadioButton } from 'react-native-radio-buttons-group';

// const CustomerLocation = ({ navigation }) => {
//   const userData = useSelector(state => state.loggedInUser);
//   const [mLat, setMLat] = useState(null);
//   const [mLong, setMLong] = useState(null);
//   const [tasks, setTasks] = useState([]);
//   const [filteredTasks, setFilteredTasks] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [clicked, setClicked] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
//   const [selectedId, setSelectedId] = useState(null);
//   const [switchState, setSwitchState] = useState(false); // State for switch
//   const [switchStates, setSwitchStates] = useState({});

//   const selectedCompany = useSelector(state => state.selectedCompany);

//   useFocusEffect(
//     React.useCallback(() => {
//       const initialize = async () => {
//         await requestLocationPermission();
//         await getLocation();
//         getTasksAccUser();
//       };

//       initialize();
//     }, []),
//   );

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

//   const handleGoBack = () => {
//     navigation.goBack();
//   };

//   const getTasksAccUser = () => {
//     setLoading(true);
//     if (!userData) {
//       console.error('User data is null');
//       return;
//     }
//     const apiUrl = `${global?.userData?.productURL}${API.GET_TASKS_ACC_USER}/${userData.userId}/${companyId}`;
//     axios
//       .get(apiUrl, {
//         headers: {
//           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
//         },
//       })
//       .then(response => {
//         const taskOptions = response.data.map(task => ({
//           id: task.id,
//           label: task.taskName,
//           value: task.id,
//           locationName: task.locationName || '', // Default to empty string if not available
//           state: task.state || '',
//           houseNo: task.houseNo || '',
//           street: task.street || '',
//           locality: task.locality || '',
//           cityOrTown: task.cityOrTown || '',
//           country: task.country || '',
//           pincode: task.pincode || '',
//           status: task.status || '',
//           dueDateStr: task.dueDateStr || '',
//           desc: task.desc || ''
//         }));
//         setTasks(taskOptions);
//         setFilteredTasks(taskOptions);
//       })
//       .catch(error => {
//         console.error(
//           'Error fetching tasks:',
//           error.response ? error.response.data : error.message,
//         );
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   const requestLocationPermission = async () => {
//     if (Platform.OS === 'ios') {
//       Geolocation.requestAuthorization('whenInUse');
//       return;
//     }

//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Permission',
//           message: 'We need access to your location to show it on the map.',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         },
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//       } else {
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };

//   const getLocation = async (retryCount = 0) => {
//     return new Promise((resolve, reject) => {
//       Geolocation.getCurrentPosition(
//         position => {
//           setMLat(position.coords.latitude);
//           setMLong(position.coords.longitude);
//           console.log(
//             'Current location:',
//             position.coords.latitude,
//             position.coords.longitude,
//           );
//           resolve();
//         },
//         error => {
//           console.error('Error getting location:', error);
//           if (retryCount < 3) {
//             // Retry up to 3 times
//             setTimeout(
//               () =>
//                 getLocation(retryCount + 1)
//                   .then(resolve)
//                   .catch(reject),
//               1000,
//             ); // Wait 1 second before retrying
//           } else {
//             Alert.alert('Error', 'Current location not available');
//             reject(error);
//           }
//         },
//         { enableHighAccuracy: true, timeout: 30000, maximumAge: 1000 }, // Increase timeout to 30 seconds
//       );
//     });
//   };

//   const createAddressString = task => {

//     const {
//       houseNo = '',
//       street = '',
//       locationName = '',
//       locality = '',
//       cityOrTown = '',
//       state = '',
//       country = '',
//       pincode = '',
//     } = task;

//     const addressParts = [
//       houseNo,
//       street,
//       locationName,
//       locality,
//       cityOrTown,
//       state,
//       country,
//       pincode,
//     ];
//     const address = addressParts.filter(part => part.trim()).join(', ');

//     return address;
//   };

//   const geocodeAddress = async address => {
//     const apiKey = 'AIzaSyBSKRShklVy5gBNSQzNSTwpXu6l2h8415M';
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//       address,
//     )}&key=${apiKey}`;

//     try {
//       const response = await axios.get(url);
//       const data = response.data;

//       if (data.status === 'OK') {
//         const location = data.results[0].geometry.location;
//         return location;
//       } else {
//         console.error('Geocoding error:', data.status);
//         Alert.alert('Error', 'Unable to geocode address');
//         return null;
//       }
//     } catch (error) {
//       console.error('Geocoding request error:', error);
//       Alert.alert('Error', 'Unable to geocode address');
//       return null;
//     }
//   };

//   const handleTaskSelect = async task => {
//     setSelectedTask(task);
//     setSearchQuery(task.label);
//     setClicked(false);

//     if (!mLat || !mLong) {
//       console.error('Current location not available');
//       Alert.alert('Error', 'Current location not available');
//       return;
//     }

//     const address = createAddressString(task);
//     const location = await geocodeAddress(address);

//     if (location) {
//       openGoogleMaps(mLat, mLong, location.lat, location.lng);
//     }
//   };
//   const handleTaskSelectt = task => {
//     setSelectedTask(task);
//     setSearchQuery(task.label);
//     setSelectedId(task.id);
//     setClicked(false);

//     // Navigate to TaskDetails with the task details
//     navigation.navigate('TaskDetails', {
//       task: task,
//       locationName: task.locationName,
//       state: task.state,
//       status: task.status,
//       dueDateStr: task.dueDateStr,
//       id: task.id,
//       label: task.label,
//       desc: task.desc
//     });

//     // Reset switch state for the task
//     setSwitchState(prevState => ({
//       ...prevState,
//       [task.id]: false,
//     }));
//   };

//   const openGoogleMaps = (
//     startLat,
//     startLong,
//     destinationLat,
//     destinationLong,
//   ) => {
//     const url = Platform.select({
//       ios: `maps://app?saddr=${startLat},${startLong}&daddr=${destinationLat},${destinationLong}`,
//       android: `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLong}&destination=${destinationLat},${destinationLong}&travelmode=driving`,
//     });

//     Linking.canOpenURL(url)
//       .then(supported => {
//         if (!supported) {
//           Alert.alert('Error', 'Google Maps is not installed');
//         } else {
//           return Linking.openURL(url);
//         }
//       })
//       .catch(err => console.error('An error occurred', err));
//   };

//   return (
//     <View style={styles.Container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
//           <Image
//             style={{ height: 25, width: 25 }}
//             source={require('../../../assets/back_arrow.png')}
//           />
//         </TouchableOpacity>
//         <Text
//           style={{
//             marginLeft: 10,
//             fontSize: 19,
//             fontWeight: 'bold',
//             color: '#000',
//           }}>
//           Location
//         </Text>
//       </View>
//       {/* <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           paddingVertical: 10,
//           backgroundColor: '#f0f0f0',
//           marginVertical: 5,
//         }}>
//         <Text style={styles.txt}>Visits</Text>
//         <Text style={styles.txt}>Events</Text>
//         <Text style={styles.txt}>Calls</Text>
//       </View> */}
//       <View
//         style={{
//           paddingVertical: 10,
//           backgroundColor: '#1F74BA',
//           marginVertical: 5,
//         }}>
//         <Text
//           style={{
//             color: '#000',
//             fontWeight: 'bold',
//             marginLeft: 10,
//             fontSize: 17,
//           }}>
//           All Visits
//         </Text>
//       </View>

//       {loading ? (
//         <ActivityIndicator
//           style={{ justifyContent: 'center', alignItems: 'center' }}
//           size="large"
//           color="#390050"
//         />
//       ) : (
//         filteredTasks.length === 0 ? (
//           <Text style={styles.noResultsText}>Sorry, no results found!</Text>
//         ) : (
//           <ScrollView style={styles.Content}>
//             {filteredTasks.map(task => (
//               <View key={task.value}>
//                 <View style={{ marginHorizontal: 10, marginVertical: 5 }}>
//                   <Text style={{ color: '#000', fontWeight: 'bold' }}>
//                     {task.dueDateStr}
//                   </Text>
//                 </View>
//                 <TouchableOpacity
//                   style={styles.dropdownItem}
//                   onPress={() => handleTaskSelectt(task)}>
//                   <View style={styles.taskContainer}>
//                     <RadioButton
//                       selected={selectedId === task.id}
//                       onPress={() => handleTaskSelectt(task)}
//                     />
//                     <View style={styles.taskDetails}>
//                       <Text style={styles.dropdownItemText}>
//                         {task.label}
//                       </Text>
//                       <Text style={styles.loctxt}>{task.locationName}</Text>
//                       <Text style={styles.statetxt}>{task.state}</Text>
//                     </View>
//                     <View style={{ flex: 0.6 }}>
//                       <TouchableOpacity onPress={() => handleTaskSelect(task)} >
//                         <Image
//                           style={styles.locatioimg}
//                           source={require('../../../assets/location-pin.png')}
//                         />
//                       </TouchableOpacity>
//                     </View>

//                     <View style={{ flex: 0.6 }}>
//                       <Text style={styles.statustxt}>{task.status}</Text>
//                       <View style={{}}>
//                         {/* <Switch
//                          trackColor={{false: '#767577', true: '#81b0ff'}}
//                          ios_backgroundColor="#3e3e3e"
//                           value={switchState}
//                           onValueChange={value => {
//                             setSwitchState(value);
//                             if (value) handleTaskSelectt(task);
//                           }}
//                         /> */}
//                       </View>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </ScrollView>
//         )
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   Container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     marginHorizontal: 10,
//     marginVertical: 10,
//   },
//   txt: {
//     color: '#000',
//     fontWeight: 'bold',
//     fontSize: 18,
//     marginHorizontal: 10,
//   },
//   dropdownItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     marginHorizontal: 5,
//     paddingVertical: 20,
//     marginVertical: 3,
//     borderRadius: 10,
//   },
//   taskContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//   },
//   taskDetails: {
//     flexDirection: 'column',
//     marginLeft: 10,
//     flex: 1.4,
//   },
//   dropdownItemText: {
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   loctxt: {
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   statetxt: {
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   locatioimg: {
//     width: 30,
//     height: 30,
//   },
//   statustxt: {
//     color: '#000',
//   },
//   noResultsText: {
//     top: 40,
//     textAlign: 'center',
//     color: '#000000',
//     fontSize: 20,
//     fontWeight: 'bold',
//     padding: 5,
//     flex: 1,
//   },
// });

// export default CustomerLocation;

import React, {useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Switch,
  ScrollView,
  Linking,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {API} from '../../config/apiConfig';
import {RadioButton} from 'react-native-radio-buttons-group';

const CustomerLocation = ({navigation}) => {
  const userData = useSelector(state => state.loggedInUser);
  const [mLat, setMLat] = useState(null);
  const [mLong, setMLong] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [switchState, setSwitchState] = useState(false); // State for switch
  const [switchStates, setSwitchStates] = useState({});
  const [distance, setDistance] = useState(null);
  const [traveledDistance, setTraveledDistance] = useState('0 km');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);

  useFocusEffect(
    React.useCallback(() => {
      const initialize = async () => {
        await requestLocationPermission();
        await getLocation();
        getTasksAccUser();
      };

      initialize();
    }, []),
  );

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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getTasksAccUser = () => {
    setLoading(true);
    if (!userData) {
      console.error('User data is null');
      return;
    }
    const apiUrl = `${global?.userData?.productURL}${API.GET_TASKS_ACC_USER}/${userData.userId}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const taskOptions = response.data.map(task => ({
          id: task.id,
          label: task.taskName,
          value: task.id,
          locationName: task.locationName || '',
          state: task.state || '',
          houseNo: task.houseNo || '',
          street: task.street || '',
          locality: task.locality || '',
          cityOrTown: task.cityOrTown || '',
          country: task.country || '',
          pincode: task.pincode || '',
          status: task.status || '',
          dueDateStr: task.dueDateStr || '',
          desc: task.desc || '',
          checkIn: task.checkIn || null,    
          checkOut: task.checkOut || null,
        }));
        console.log('Response:', response.data);
        setTasks(taskOptions);
        setFilteredTasks(taskOptions); // This sets both tasks and filteredTasks
      })
      
      .catch(error => {
        console.error(
          'Error fetching tasks:',
          error.response ? error.response.data : error.message,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location to show it on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getLocation = async (retryCount = 0) => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          setMLat(position.coords.latitude);
          setMLong(position.coords.longitude);
          console.log(
            'Current location:',
            position.coords.latitude,
            position.coords.longitude,
          );
          resolve();
        },
        error => {
          console.error('Error getting location:', error);
          if (retryCount < 3) {
            // Retry up to 3 times
            setTimeout(
              () =>
                getLocation(retryCount + 1)
                  .then(resolve)
                  .catch(reject),
              1000,
            ); // Wait 1 second before retrying
          } else {
            Alert.alert('Error', 'Current location not available');
            reject(error);
          }
        },
        {enableHighAccuracy: true, timeout: 30000, maximumAge: 1000}, // Increase timeout to 30 seconds
      );
    });
  };

  const createAddressString = task => {

    const {
      houseNo = '',
      street = '',
      locationName = '',
      locality = '',
      cityOrTown = '',
      state = '',
      country = '',
      pincode = '',
    } = task;

    const addressParts = [
      houseNo,
      street,
      locationName,
      locality,
      cityOrTown,
      state,
      country,
      pincode,
    ];
    const address = addressParts.filter(part => part.trim()).join(', ');

    return address;
  };

  const geocodeAddress = async address => {
    const apiKey = 'AIzaSyBSKRShklVy5gBNSQzNSTwpXu6l2h8415M';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        return location;
      } else {
        console.error('Geocoding error:', data.status);
        Alert.alert('Error', 'Unable to geocode address');
        return null;
      }
    } catch (error) {
      console.error('Geocoding request error:', error);
      Alert.alert('Error', 'Unable to geocode address');
      return null;
    }
  };

  const handleTaskSelect = async task => {
    setSelectedTask(task);
    setSearchQuery(task.label);
    setClicked(false);

    if (!mLat || !mLong) {
      console.error('Current location not available');
      Alert.alert('Error', 'Current location not available');
      return;
    }

    const address = createAddressString(task);
    const location = await geocodeAddress(address);

    if (location) {
      const distance = await getRoadDistance(
        mLat,
        mLong,
        location.lat,
        location.lng,
      );
      setDistance(distance); // Update the actual distance state
      setSelectedTaskId(task.id);
      openGoogleMaps(mLat, mLong, location.lat, location.lng);
    }
  };

  const getRoadDistance = async (startLat, startLong, endLat, endLong) => {
    const apiKey = 'AIzaSyBSKRShklVy5gBNSQzNSTwpXu6l2h8415M';
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${startLat},${startLong}&destinations=${endLat},${endLong}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const distance = data.rows[0].elements[0].distance.text;
        return distance;
      } else {
        console.error('Distance Matrix API error:', data.error_message);
        Alert.alert(
          'Error',
          `Unable to calculate road distance: ${data.error_message}`,
        );
        return null;
      }
    } catch (error) {
      console.error('Distance Matrix request error:', error);
      Alert.alert('Error', 'Unable to calculate road distance');
      return null;
    }
  };

  const handleTaskSelectt = async task => {
    setLoading(true);
    setSelectedTask(task);
    setSearchQuery(task.label);
    setSelectedId(task.id);
    setClicked(false);

    if (!mLat || !mLong) {
      console.error('Current location not available');
      Alert.alert('Error', 'Current location not available');
      return;
    }

    const address = createAddressString(task);
    const location = await geocodeAddress(address);

    const roadDistance = location
      ? await getRoadDistance(mLat, mLong, location.lat, location.lng)
      : 0;

    setLoading(false);

    // Navigate to TaskDetails with the task details
    navigation.navigate('TaskDetails', {
      task: task,
      locationName: task.locationName,
      state: task.state,
      status: task.status,
      dueDateStr: task.dueDateStr,
      id: task.id,
      label: task.label,
      desc: task.desc,
      distance: roadDistance || '0 km',
      traveledDistance: traveledDistance,
      checkIn:task.checkIn,
    checkOut :task.checkOut,
    });

    // Reset switch state for the task
    setSwitchState(prevState => ({
      ...prevState,
      [task.id]: false,
    }));
  };

  const openGoogleMaps = (
    startLat,
    startLong,
    destinationLat,
    destinationLong,
  ) => {
    const url = Platform.select({
      ios: `maps://app?saddr=${startLat},${startLong}&daddr=${destinationLat},${destinationLong}`,
      android: `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLong}&destination=${destinationLat},${destinationLong}&travelmode=driving`,
    });

    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Google Maps is not installed');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  useFocusEffect(
    React.useCallback(() => {
      trackDistance(); // Track the distance when the user returns to the app
    }, [selectedTaskId]),
  );

  const trackDistance = async () => {
    try {
      // Get the current location
      const currentPosition = await getLocation();
  
      if (previousLocation) {
        // Get road distance using the Google Maps API
        const distance = await getRoadDistance(
          previousLocation.latitude,
          previousLocation.longitude,
          currentPosition.coords.latitude,
          currentPosition.coords.longitude
        );
  
        // Parse and accumulate the distance
        if (distance) {
          const currentDistance = parseFloat(distance.replace(' km', '')) || 0;
          const existingDistance = parseFloat(traveledDistance.replace(' km', '')) || 0;
          
          // Calculate the new accumulated distance
          const newDistance = currentDistance + existingDistance;
  
          // Update the traveled distance state
          setTraveledDistance(`${newDistance.toFixed(2)} km`);
        }
      }
  
      // Update the previous location for the next calculation
      setPreviousLocation({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      });
    } catch (error) {
      console.error('Error tracking distance:', error);
      // Keep the previous traveled distance in case of an error
      setTraveledDistance(traveledDistance);
    }
  };
  
  

  return (
    <ScrollView style={styles.Container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            style={{height: 25, width: 25}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 10,
            fontSize: 19,
            fontWeight: 'bold',
            color: '#000',
          }}>
          Location
        </Text>
      </View>
      <View
        style={{
          paddingVertical: 10,
          backgroundColor: '#1F74BA',
          marginVertical: 5,
        }}>
        <Text
          style={{
            color: '#000',
            fontWeight: 'bold',
            marginLeft: 10,
            fontSize: 17,
          }}>
          All Visits
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator
          style={{justifyContent: 'center', alignItems: 'center'}}
          size="large"
          color="#390050"
        />
      ) : filteredTasks.length === 0 ? (
        <Text style={styles.noResultsText}>Sorry, no results found!</Text>
      ) : (
        <ScrollView style={styles.Content}>
          {filteredTasks.map(task => (
            <View key={task.value}>
              <View
                style={{position: 'absolute', right: 0, top: 10, right: 15}}>
                {selectedTaskId === task.id && distance && (
                  <View>
                    <Text style={{color: '#000'}}>{distance}</Text>
                  </View>
                )}
              </View>
              <View>
                <View style={{marginHorizontal: 10, marginVertical: 5}}>
                  <Text style={{color: '#000', fontWeight: 'bold'}}>
                    {task.dueDateStr}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleTaskSelectt(task)}>
                  <View style={styles.taskContainer}>
                    <RadioButton
                      selected={selectedId === task.id}
                      onPress={() => handleTaskSelectt(task)}
                    />
                    <View style={styles.taskDetails}>
                      <Text style={styles.dropdownItemText}>{task.label}</Text>
                      <Text style={styles.loctxt}>{task.locationName}</Text>
                      <Text style={styles.statetxt}>{task.state}</Text>
                    </View>
                    <View style={{flex: 0.6}}>
                      <TouchableOpacity onPress={() => handleTaskSelect(task)}>
                        <Image
                          style={styles.locatioimg}
                          source={require('../../../assets/location-pin.png')}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{flex: 0.6}}>
                      <Text style={styles.statustxt}>{task.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={{color: '#000',marginLeft:10}}>
                  Distance Traveled: {traveledDistance}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  txt: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 5,
    paddingVertical: 20,
    marginVertical: 3,
    borderRadius: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  taskDetails: {
    flexDirection: 'column',
    marginLeft: 10,
    flex: 1.4,
  },
  dropdownItemText: {
    color: '#000',
    fontWeight: 'bold',
  },
  loctxt: {
    color: '#000',
    fontWeight: 'bold',
  },
  statetxt: {
    color: '#000',
    fontWeight: 'bold',
  },
  locatioimg: {
    width: 30,
    height: 30,
  },
  statustxt: {
    color: '#000',
  },
  noResultsText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
    flex: 1,
  },
});

export default CustomerLocation;
