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
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {useSelector} from 'react-redux';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const handleSignToggle = async () => {
    if (loading) return; // Prevent multiple clicks

    setLoading(true); // Start loading
    const now = new Date();
    const currentDateTime = formatDateTime(now);
    const day = now.toLocaleDateString('en-US', {weekday: 'long'});

    try {
      const location = await getLocation();
      if (!isSignedIn) {
        setSignInTime(extractTime(currentDateTime));
        setSignInDay(day);
        setSignInDate(currentDateTime.split('T')[0]);
        setSignInLocation(location);
      } else {
        setSignOutTime(extractTime(currentDateTime));
        setSignOutDay(day);
        setSignOutDate(currentDateTime.split('T')[0]);
        setSignOutLocation(location);
      }

      await PunchInPunchOut(); // Await API call

      setIsSignedIn(prevState => !prevState);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Could not get current location.');
    } finally {
      setLoading(false); // Stop loading after request is done
    }
  };

  const PunchInPunchOut = async () => {
    const now = new Date();
    const formattedDateTime = formatDateTime(now);
    const formattedDate = formattedDateTime.split('T')[0];
    const location = isSignedIn ? signInLocation : signOutLocation;

    const apiUrl = `${global?.userData?.productURL}${API.PUNCH_IN_PUNCH_OUT}`;

    const payload = isSignedIn
      ? {
          employeeId: userId,
          punchOut: formattedDateTime,
          punch_out_latitude: location.lat,
          punch_out_longitude: location.long,
          date: formattedDate,
          companyId: companyId,
        }
      : {
          employeeId: userId,
          punchIn: formattedDateTime,
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
        latestRecord.punchIn ? extractTime(latestRecord.punchIn) : '',
      );
      setSignInDay(
        new Date(latestRecord?.punchIn).toLocaleDateString('en-US', {
          weekday: 'long',
        }) || '',
      );
      setSignInDate(
        new Date(latestRecord.punchIn).toISOString().split('T')[0] || '',
      );
      setSignInLocation({
        lat: latestRecord.punch_in_latitude,
        long: latestRecord.punch_in_longitude,
      });
      setSignOutTime(
        latestRecord.punchOut ? extractTime(latestRecord.punchOut) : '',
      );
      setSignOutDay(
        new Date(latestRecord.punchOut).toLocaleDateString('en-US', {
          weekday: 'long',
        }) || '',
      );
      setSignOutDate(
        new Date(latestRecord.punchOut).toISOString().split('T')[0] || '',
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

  return (
    <View style={styles.container}>
      <View style={styles.header}></View>

      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello 👋</Text>
      </View>

      <View style={styles.shiftCard}>
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
              {currentDate}
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
              <Text style={styles.datetxt}>Date: {currentDate}</Text>
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
            <FlatList
              data={punchRecords}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.recordContainer}>
                  <Text style={{color: '#000', fontWeight: '500'}}>
                    {item.punchIn ? extractTime(item.punchIn) : 'N/A'}
                  </Text>
                  <Text style={{color: '#000', fontWeight: '500'}}>
                    {item.punchOut ? extractTime(item.punchOut) : 'N/A'}
                  </Text>
                </View>
              )}
            />
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    marginTop: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
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
});

export default Attendance;
