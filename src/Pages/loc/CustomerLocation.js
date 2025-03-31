import React, { useCallback, useContext, useEffect, useState } from 'react';
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
  SafeAreaView,
  RefreshControl,
  AppState,
  FlatList,
  TextInput,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API } from '../../config/apiConfig';
import { RadioButton } from 'react-native-radio-buttons-group';
import { ColorContext } from '../../components/colortheme/colorTheme';

const CustomerLocation = ({ navigation }) => {
  const { colors } = useContext(ColorContext);
  const styles = getStyles(colors);
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
  const appState = React.useRef(AppState.currentState);

  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, running useFocusEffect...");
      initialize();
    }, [])
  );

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      console.log("App resumed from background, reloading data...");
      initialize();
    }
    appState.current = nextAppState;
  };
  
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    
    return () => {
      subscription.remove(); // Cleanup listener on unmount
    };
  }, []);


  const [refreshing, setRefreshing] = useState(false);

  const selectedCompany = useSelector(state => state.selectedCompany);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const initialize = async () => {
  //       await requestLocationPermission();
  //       await getLocation();
  //       getTasksAccUser();
  //     };

  //     initialize();
  //   }, []),
  // );

  useEffect(() => {
    if (tasks.length > 0) {
      const updatedTask = tasks.find(task => task.id === selectedTaskId);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks, selectedTaskId]);
  
  useFocusEffect(
    React.useCallback(() => {
      initialize();
    }, [])
  );
  
const initialize = async () => {
  try {
    console.log("called requestLocationPermission=================>");
    await requestLocationPermission();
    console.log("called getLocation ===================>");
    await getLocation();
    console.log("called getTasksAccUser=====================> ");
    await getTasksAccUser();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
};


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

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15); // Initial batch size
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const batchSize = 15; // Items to load per batch

 
  

  
  const [noResultsFound, setNoResultsFound] = useState(false);

  const handleSearchInputChange = query => {
    setSearchQuery(query);
    // Reset pagination and no results state when searching
    setFrom(0);
    setTo(batchSize);
    setHasMore(true);
    setNoResultsFound(false);
    
    if (query.trim() === '') {
      getTasksAccUser(0, batchSize, false, '');
    } else {
      getTasksAccUser(0, batchSize, false, query);
    }
  };
  
  const getTasksAccUser = async (newFrom = 0, newTo = batchSize, isLoadMore = false, taskName = '') => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setNoResultsFound(false); // Reset no results flag on new search
    }
  
    if (!userData) {
      console.error('User data is null');
      return;
    }
  
    const apiUrl = `${global?.userData?.productURL}${API.GET_TASKS_ACC_USER_LAZY}/${userData.userId}/${companyId}/${newFrom}/${newTo}?taskName=${encodeURIComponent(taskName)}`;
  
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
  
      if (response.data.length === 0) {
        setHasMore(false);
        // Only show no results if it's not a load more operation and we have a search query
        if (!isLoadMore && taskName.trim() !== '') {
          setNoResultsFound(true);
          setTasks([]);
          setFilteredTasks([]);
        }
      } else {
        setNoResultsFound(false);
        if (!isLoadMore) {
          setTasks(response.data);
          setFilteredTasks(response.data);
        } else {
          setTasks(prevTasks => [...prevTasks, ...response.data]);
          setFilteredTasks(prevTasks => [...prevTasks, ...response.data]);
        }
  
        if (response.data.length > 0) {
          setFrom(newFrom);
          setTo(newTo);
        }
  
        setHasMore(response.data.length >= batchSize);
      }
    } catch (error) {
      console.error(
        'Error fetching tasks:',
        error.response ? error.response.data : error.message,
      );
      if (!isLoadMore && taskName.trim() !== '') {
        setNoResultsFound(true);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  

 
  const loadMoreTasks = async () => {
    if (loadingMore || !hasMore) return;
  
    setLoadingMore(true);
    const newFrom = to + 1;
    const newTo = to + batchSize;
  
    try {
      await getTasksAccUser(newFrom, newTo, true);
    } catch (error) {
      console.error('Error while loading more tasks:', error);
    } finally {
      setLoadingMore(false);
    }
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setFrom(0);
    setTo(batchSize);
    setHasMore(true);
    getTasksAccUser(0, batchSize, false);
  }, []);
  // Render each task
  const renderItem = ({ item }) => (
    <View key={item.id} style={styles.taskWrapper}>
      {/* Distance Text on Top Right */}
      {selectedTaskId === item.id && distance && (
        <View style={styles.distanceContainer}>
          <Text style={{ color: '#000' }}>{distance}</Text>
        </View>
      )}

      <View style={styles.taskItem}>
        <Text style={styles.taskDate}>{item.dueDateStr}</Text>

        <TouchableOpacity style={styles.dropdownItem} onPress={() => handleTaskSelectt(item)}>
          <View style={styles.taskContainer}>
            <RadioButton selected={selectedId === item.id} onPress={() => handleTaskSelectt(item)} />
            <View style={styles.taskDetails}>
              <Text style={styles.dropdownItemText}>{item.taskName}</Text>
              {item.changedLocFlag === 1 ? (
                <Text style={styles.loctxt}>{item.changedLocation}</Text>
              ) : (
                <Text style={styles.loctxt}>
                  {item.locationName}, {'\n'}
                  {item.state}
                </Text>
              )}
            </View>

            <View style={styles.locationIcon}>
              <TouchableOpacity onPress={() => handleTaskSelect(item)}>
                <Image style={styles.locatioimg} source={require('../../../assets/location-pin.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.statusContainer}>
              <Text style={styles.statustxt}>{item.status}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.distanceText}>Distance Traveled: {traveledDistance}</Text>
      </View>
    </View>
  );

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
            Alert.alert('Location permission denied. Please enable it in app settings.');
            reject(error);
          }
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 1000 }, // Increase timeout to 30 seconds
      );
    });
  };


  useFocusEffect(
    React.useCallback(() => {
      const updateDistance = async () => {
        try {
          console.log("Rechecking location after returning to the app...");
          
          // Get updated current location
          await requestLocationPermission();
          await getLocation();
  
          if (!mLat || !mLong) {
            console.error('Location permission denied. Please enable it in app settings.');
            return;
          }
  
          if (!selectedTask) {
            console.error('No task selected');
            return;
          }
  
          // Get customer location
          const customerAddress = createAddressString(selectedTask);
          const customerLocation = await geocodeAddress(customerAddress);
  
          if (!customerLocation) {
            console.error('Customer location not available');
            return;
          }
  
          // Recalculate distance
          const newDistance = await getRoadDistance(
            mLat, 
            mLong, 
            customerLocation.lat, 
            customerLocation.lng
          );
  
          console.log('Updated Distance:', newDistance, 'km');
  
          // Retrieve the last saved distance
          const savedDistance = await AsyncStorage.getItem('latestDistance');
          const parsedDistance = savedDistance ? parseFloat(savedDistance) : null;
  
          // Update and store the distance only if it has changed
          if (parsedDistance !== newDistance) {
            await AsyncStorage.setItem('latestDistance', newDistance.toString());
            setDistance(newDistance);
          }
        } catch (error) {
          console.error('Error updating distance:', error);
        }
      };
  
      updateDistance();
    }, [selectedTask]) // Dependency array ensures update when the selected task changes
  );
  
  useEffect(() => {
    const loadSavedDistance = async () => {
      try {
        const savedDistance = await AsyncStorage.getItem('latestDistance');
        if (savedDistance) {
          setDistance(parseFloat(savedDistance));
          console.log('Loaded saved distance:', savedDistance, 'km');
        }
      } catch (error) {
        console.error('Error loading saved distance:', error);
      }
    };
  
    loadSavedDistance();
  }, []);
  
  

  const createAddressString = task => {
    const {
      customerName = '',
      houseNo = '',
      street = '',
      locationName = '',
      locality = '',
      cityOrTown = '',
      state = '',
      country = '',
      pincode = '',
      changedLocation = '',
      changedLocFlag = 0,
      changed_loc_latitude = null,
      changed_loc_longitude = null
    } = task;
  
    // If changedLocFlag is 1, use the coordinates; otherwise, construct the full address
    let finalLocation = '';
  
    if (changedLocFlag === 1) {
      if (changed_loc_latitude !== null && changed_loc_longitude !== null) {
        finalLocation = ` ${changed_loc_latitude}, ${changed_loc_longitude}`;
      } else {
        // Fallback if latitude/longitude are missing
        finalLocation = 'Location coordinates not available';
      }
    } else {
      finalLocation = [
        customerName,
        houseNo,
        street,
        locationName,
        locality,
        cityOrTown,
        state,
        country,
        pincode
      ].filter(part => part.trim()).join(', ');
    }
  
    console.log("Address:", finalLocation);
  
    return finalLocation;
  };
  

  const geocodeAddress = async address => {
    const apiKey = 'AIzaSyBSKRShklVy5gBNSQzNSTwpXu6l2h8415M';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      console.log("added name", response.data)

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
      Alert.alert('Location permission denied. Please enable it in app settings.');
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
        // Alert.alert(
        //   'Error',
        //   `Unable to calculate road distance: ${data.error_message}`,
        // );
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
      Alert.alert('Location permission denied. Please enable it in app settings.');
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
      customerName: task.customerName,
      locationName: task.locationName,
      state: task.state,
      status: task.status,
      dueDateStr: task.dueDateStr,
      id: task.id,
      label: task.label,
      desc: task.desc,
      remarks:task.remarks,
      distance: roadDistance || '0 km',
      traveledDistance: traveledDistance,
      checkIn: task.checkIn,
      checkOut: task.checkOut,
      locId: task.locId,
      changedLocFlag: task.changedLocFlag,
      changedLocation: task.changedLocation
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

      <View style={styles.header}>
        {/* <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            style={{ height: 25, width: 25 }}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity> */}
        <Text
          style={{
           
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
          backgroundColor:  colors.color2,
          marginVertical: 5,
        }}>
        <Text
          style={{
            color: '#fff',
            fontWeight: 'bold',
            marginLeft: 10,
            fontSize: 17,
          }}>
          All Visits
        </Text>
      </View>
      <View style={styles.searchContainer}>
  <TextInput
    placeholder='Search with TaskName'
    placeholderTextColor="#000"
    value={searchQuery}
    onChangeText={handleSearchInputChange}
    style={styles.searchInput}
  />
  {searchQuery ? (
    <TouchableOpacity 
      onPress={() => {
        setSearchQuery('');
        handleSearchInputChange('');
      }}
      style={styles.iconContainer}
    >
      <Image 
        source={require('../../../assets/close.png')} 
        style={styles.icon}
      />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity 
      onPress={() => {
        // Optional: Focus the input when search icon is pressed
        // You'll need to add a ref to the TextInput for this
      }}
      style={styles.iconContainer}
    >
      <Image 
        source={require('../../../assets/search.png')} 
        style={styles.icon}
      />
    </TouchableOpacity>
  )}
</View>

  {loading ? (
    <ActivityIndicator size="large" color="#390050" style={styles.loadingIndicator} />
  ) : noResultsFound ? (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>Sorry, no results found!</Text>
    </View>
  ) : filteredTasks.length === 0 ? (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>No tasks available</Text>
    </View>
  ) : (
    <FlatList
      data={filteredTasks}
      keyExtractor={item => `${item.id}_${item.taskName}`} // Ensure unique keys
      renderItem={renderItem}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor="#390050" 
        />
      }
      onEndReached={loadMoreTasks}
      onEndReachedThreshold={0.2}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator size="small" color="#390050" style={{ marginVertical: 20 }} />
        ) : !hasMore ? (
          <Text style={{ textAlign: 'center', marginVertical: 20, color: '#666' }}>
            No more tasks to load
          </Text>
        ) : null
      }
    />
  )}
  

      {/* {loading ? (
        <ActivityIndicator size="large" color="#390050" style={styles.loadingIndicator} />
      ) : filteredTasks.length === 0 ? (
        <Text style={styles.noResultsText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#390050" 
          />
        }
        onEndReached={loadMoreTasks}
        onEndReachedThreshold={0.2} // Trigger earlier for smoother loading
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#390050" style={{ marginVertical: 20 }} />
          ) : !hasMore ? (
            <Text style={{ textAlign: 'center', marginVertical: 20, color: '#666' }}>
              No more tasks to load
            </Text>
          ) : null
        }
        ListEmptyComponent={
          !loading && filteredTasks.length === 0 ? (
            <Text style={styles.noResultsText}>Sorry, no results found!</Text>
          ) : null
        }
      />
      )} */}
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    marginVertical: 10,
    alignSelf:'center'
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
  taskDate:{
color: '#000', fontWeight: 'bold',
marginLeft: 10,
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
  locationIcon:{
    flex: 0.5
  },
  statustxt: {
    color: '#000',
  },
  statusContainer:{
    flex: 0.6
  },
  distanceText:{
    color: '#000', marginLeft: 10
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    borderRadius: 40,
    paddingHorizontal: 15,
    margin: 10,
    height: 45,

  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#000',
    fontSize: 16,
  },
  iconContainer: {
    padding: 8,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
});

export default CustomerLocation;
