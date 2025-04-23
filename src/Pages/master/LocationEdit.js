import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Image,
  SafeAreaView,
  PermissionsAndroid,
} from 'react-native';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import {ColorContext} from '../../components/colortheme/colorTheme';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const LocationEdit = ({route, navigation}) => {
  const [region, setRegion] = useState({
    latitude: 0, // Default values
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [confirmedLocation, setConfirmedLocation] = useState(null);
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    Geocoder.init('AIzaSyDFkFf27LcYV5Fz6cjvAfEX1hsdXx4zE6Q');
    getCurrentLocation();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse'); // or 'always'
      return auth === 'granted';
    }

    return false;
  };

  const getCurrentLocation = async () => {
    setLocationError(null);

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError('Permission denied. Please select location manually.');
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setMarker({latitude, longitude});

        Geocoder.from(latitude, longitude)
          .then(res => {
            const address = res.results[0].formatted_address;
            setAddress(address);
          })
          .catch(error => {
            console.log('Geocoding error: ', error);
            setAddress('Address not available');
          });
      },
      error => {
        console.log('Location error: ', error);
        setLocationError(
          'Could not get your location. Please select manually.',
        );
        setRegion({
          latitude: 0,
          longitude: 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const onMapPress = async event => {
    const {latitude, longitude} = event.nativeEvent.coordinate;
    setMarker({latitude, longitude});
    setRegion(prev => ({
      ...prev,
      latitude,
      longitude,
    }));

    try {
      const res = await Geocoder.from(latitude, longitude);
      const address = res.results[0].formatted_address;
      setAddress(address);
    } catch (error) {
      console.log('Geocoding error: ', error);
      setAddress('Address not available');
    }
  };

  // const handleConfirmLocation = () => {
  //   if (marker) {
  //     setConfirmedLocation({
  //       latitude: marker.latitude,
  //       longitude: marker.longitude,
  //       address: address,
  //     });
  //   }
  //   setIsLocationPickerVisible(false);
  // };

  const handleConfirmLocation = () => {
    if (marker) {
      setConfirmedLocation({
        latitude: marker.latitude,
        longitude: marker.longitude,
        address: address,
      });
      setFormEdited(true);
    }

    setIsLocationPickerVisible(false);

    setTimeout(() => {
      if (locationTriggeredBy === 'formModal') {
        setIsModalVisible(true);
      } else if (locationTriggeredBy === 'locationModal') {
        toggleLocationModal(); // re-open it
      }
      setLocationTriggeredBy(null); // reset the tracker
    }, 300);
  };
  const [isNavigatingToLocation, setIsNavigatingToLocation] = useState(false);
  const [locationTriggeredBy, setLocationTriggeredBy] = useState(null);

  const handlePickLocation = () => {
    setIsNavigatingToLocation(true);
    setLocationTriggeredBy('formModal');
    setIsModalVisible(false);

    setTimeout(() => {
      setIsLocationPickerVisible(true);
      getCurrentLocation();
    }, 100);
  };



  const {locationId, customerType} = route.params;
  const [loading, setLoading] = useState(false);
  const [stylesData, setStylesData] = useState({});
  const [originalLocation, setOriginalLocation] = useState({});
  const [selectedLocationType, setSelectedLocationType] = useState(null);
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const [distributors, setDistributors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;
  const [isSaving, setIsSaving] = useState(false);
  const [formEdited, setFormEdited] = useState(false);

  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);

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

  const customerTypeMap = {
    1: 'Retailor',
    2: 'Company',
    3: 'Distributor',
  };

  const customerTypeText = customerTypeMap[customerType] || 'UNKNOWN';

  useEffect(() => {
    if (customerType === 3) {
      // Distributor
      getDistributorsDetails();
    } else if (customerType === 1) {
      // Retailer
      getCustomersDetails();
    }
  }, [customerType]);

  useEffect(() => {
    if (customerType === 3 && distributors.length > 0) {
      const distributor = distributors.find(
        d => d.id === stylesData.customerId,
      );
      if (distributor) {
        setFirstName(distributor.firstName);
      }
    } else if (customerType === 1 && customers.length > 0) {
      const customer = customers.find(
        c => c.customerId === stylesData.customerId,
      );
      if (customer) {
        setFirstName(customer.firstName);
      }
    }
  }, [distributors, customers, stylesData.customerId, customerType]);

  const getDistributorsDetails = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTORS_DETAILS}/${companyId}`;
    setIsLoading(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global.userData.token.access_token}`,
        },
      })
      .then(response => {
        setDistributors(response?.data?.response?.distributorList || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const getCustomersDetails = () => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_CUSTOMER_LIST}/${companyId}`;
    setIsLoading(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setCustomers(response?.data?.response?.customerList || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getLocationStyles();
  }, []);

  const getLocationStyles = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.MASTER_LOCATION_EDIT}/${locationId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const locationData = response?.data?.response?.locationList?.[0] || {};
        setStylesData(locationData);
        setOriginalLocation({...locationData}); // Store original data for comparison
        setSelectedLocationType(locationData.locationType);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Function to check if name is valid
  const isNameValid = async (locationName, customerId, customerType) => {
    try {
      const apiUrl = `${global?.userData?.productURL}${API.MASTER_EDIT_LOCATION_VALIDATE}/${locationName}/${customerId}/${customerType}/${companyId}`;
      console.log('Validation URL:', apiUrl);

      // Send a request to validate location name
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log('Validation response:', response.data);

      // Check if the response data confirms the name is valid (case-sensitive)
      return response.data === true;
    } catch (error) {
      console.error('Error in name validation:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple simultaneous saves

    setIsSaving(true);

    try {
      // Only validate name if it changed
      if (
        stylesData.locationName !== originalLocation.locationName &&
        !(await isNameValid(
          stylesData.locationName,
          stylesData.customerId,
          customerType,
        ))
      ) {
        Alert.alert(
          'Validation Error',
          'This name has been used. Please enter a new name.',
          [{text: 'OK'}],
        );
        setIsSaving(false);
        return;
      }

      // Proceed with save if name is valid
      await EditLocation();
    } catch (error) {
      console.error('Error during save:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while saving. Please try again.',
        [{text: 'OK'}],
      );
    } finally {
      setIsSaving(false);
    }
  };

  const EditLocation = async () => {
    console.log('Saving location data:', stylesData);

    // Prepare the request data with all fields from stylesData
    const requestData = {
      locationId: stylesData.locationId,
      locationName: stylesData.locationName,
      locationCode: stylesData.locationCode,
      locationDescription: stylesData.locationDescription,
      status: stylesData.status || '',
      phoneNumber: stylesData.phoneNumber,
      emailId: stylesData.emailId,
      houseNo: stylesData.houseNo,
      street: stylesData.street,
      locality: stylesData.locality,
      cityOrTown: stylesData.cityOrTown,
      state: stylesData.state,
      country: stylesData.country,
      pincode: stylesData.pincode,
      customerType: customerType,
      customerId: stylesData.customerId,
      customer: null, // This seems to be null in your example
      mobLatitude: confirmedLocation?.latitude || null,
      mobLongitude: confirmedLocation?.longitude || null,
      locationType: selectedLocationType,
      companyId: companyId,
      linkType: stylesData.linkType || 1,
      userId: userId,
      createBy: stylesData.createBy,
      createOn: stylesData.createOn,
      changedLocation: stylesData.changedLocation || '',
      changedLocFlag: stylesData.changedLocFlag || 0,
      changed_loc_longitude: stylesData.changed_loc_longitude || null,
      changed_loc_latitude: stylesData.changed_loc_latitude || null,
    };

    console.log('Saving location data:', requestData);

    setIsLoading(true);

    try {
      const response = await axios.put(
        global?.userData?.productURL + API.MASTER_EDIT_LOCATION,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global.userData.token.access_token}`,
          },
        },
      );

      console.log('Location updated successfully:', response.data);

      Alert.alert('Success', 'Location updated successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.log('=== ERROR DETAILS ===');
      console.log('Full Error:', error);

      if (error.response) {
        console.log('🔴 Status:', error.response.status);
        console.log('📄 Headers:', error.response.headers);
        console.log('📦 Response Data:', error.response.data);
        console.log('➡️ Endpoint URL:', error.config?.url);
        console.log('📤 Sent Payload:', error.config?.data);
        console.log('📋 Request Headers:', error.config?.headers);

        Alert.alert(
          'Error',
          error.response.data?.message ||
            `Server responded with status code ${error.response.status}`,
        );
      } else if (error.request) {
        // Request was made but no response received
        console.log('🕳️ No response received');
        console.log('Request Details:', error.request);

        Alert.alert('Error', 'No response from server. Please try again.');
      } else {
        // Something happened setting up the request
        console.log('⚠️ Axios Config Error:', error.message);

        Alert.alert('Error', 'Unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update any field in stylesData
  const updateField = (fieldName, value) => {
    setStylesData(prevState => ({...prevState, [fieldName]: value}));
    setFormEdited(true); // Mark form as edited when any field changes
  };
  
  // Check if required fields are filled
  const isFormValid = () => {
    return (
      stylesData.locationName &&
      stylesData.locationDescription &&
      stylesData.phoneNumber &&
      stylesData.pincode
    );
  };

  // Determine if save button should be disabled
  const isSaveDisabled = () => {
    return !formEdited || !isFormValid();
  };

  const getInputStyle = fieldName => {
    // Check if field is empty AND either the form has been submitted or the field was touched
    return !stylesData[fieldName] && (isSaving || formEdited) 
      ? styles.inputError 
      : styles.input;
  };

  if (loading || isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex:1}}>
    <ScrollView style={styles.container}>
      <View style={styles.detailshead}>
        <Text
          style={{
            color: '#000',
            fontSize: 20,
            fontWeight: 'bold',
            marginHorizontal: 5,
          }}>
          Location Detail
        </Text>
        <View>
          <TouchableOpacity
            style={[styles.addButton, isSaveDisabled() && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaveDisabled()}>
            <Text style={styles.addButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
      {customerType === 2 && (
        <View style={styles.radioGroup}>
          <TouchableOpacity style={styles.radioButton} disabled={true}>
            <View style={styles.radioCircle}>
              {selectedLocationType === 0 && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.radioText}>Main Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.radioButton} disabled={true}>
            <View style={styles.radioCircle}>
              {selectedLocationType === 1 && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.radioText}>Sub Location</Text>
          </TouchableOpacity>
        </View>
      )}

      <View>
        <View>
          <View>
            <Text style={styles.label}>{customerTypeText}</Text>
            <TextInput
              style={styles.inputnoneditable}
              value={firstName}
              editable={false}
              placeholderTextColor="#000"
            />
          </View>
        </View>
      </View>
      {/* Editable TextInput Fields */}
      {stylesData && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Location Name *</Text>
          <TextInput
            style={getInputStyle('locationName')}
            value={stylesData.locationName}
            placeholderTextColor="#000"
            onChangeText={text => updateField('locationName', text)}
          />

          <Text style={styles.infoText}>Location Description *</Text>

          <TextInput
            style={getInputStyle('locationDescription')}
            value={stylesData.locationDescription}
            placeholderTextColor="#000"
            onChangeText={text => updateField('locationDescription', text)}
          />

          <Text style={styles.infoText}>Location Code:</Text>
          <TextInput
            style={styles.input}
            value={stylesData.locationCode}
            placeholderTextColor="#000"
            onChangeText={text => updateField('locationCode', text)}
          />

          <Text style={styles.infoText}>Phone Number *</Text>
          <TextInput
            style={getInputStyle('phoneNumber')}
            value={stylesData.phoneNumber ? String(stylesData.phoneNumber) : ''}
            onChangeText={text => updateField('phoneNumber', text)}
            keyboardType="numeric"
            placeholderTextColor="#000"
          />

          <Text style={styles.infoText}>Email ID:</Text>
          <TextInput
            style={styles.input}
            value={stylesData.emailId}
            placeholderTextColor="#000"
            onChangeText={text => updateField('emailId', text)}
          />

          <Text style={styles.infoText}>House Number:</Text>
          <TextInput
            style={styles.input}
            value={stylesData.houseNo}
            placeholderTextColor="#000"
            onChangeText={text => updateField('houseNo', text)}
          />

          <Text style={styles.infoText}>Street:</Text>
          <TextInput
            style={styles.input}
            value={stylesData.street}
            placeholderTextColor="#000"
            onChangeText={text => updateField('street', text)}
          />

          <Text style={styles.infoText}>Locality:</Text>
          <TextInput
            style={styles.input}
            value={stylesData.locality}
            placeholderTextColor="#000"
            onChangeText={text => updateField('locality', text)}
          />

          <Text style={styles.infoText}>City/Town:</Text>
          <TextInput
            style={styles.input}
            value={stylesData.cityOrTown}
            placeholderTextColor="#000"
            onChangeText={text => updateField('cityOrTown', text)}
          />

          <Text style={styles.infoText}>Country:</Text>
          <TextInput
            style={styles.input}
            value={stylesData.country}
            placeholderTextColor="#000"
            onChangeText={text => updateField('country', text)}
          />

          <Text style={styles.infoText}>State:</Text>
          <TextInput
            style={styles.input}
            value={stylesData.state}
            placeholderTextColor="#000"
            onChangeText={text => updateField('state', text)}
          />

          <Text style={styles.infoText}>Pincode *</Text>
          <TextInput
            style={getInputStyle('pincode')}
            value={stylesData.pincode ? String(stylesData.pincode) : ''}
            placeholderTextColor="#000"
            onChangeText={text => updateField('pincode', text)}
            keyboardType="numeric"
          />
        </View>
      )}
       <TouchableOpacity
                      onPress={handlePickLocation}
                      style={{
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 5,
                        marginHorizontal:10,
                        marginVertical:10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={{color: '#000'}}>Pick Location</Text>
                      <Image
                        style={{height: 25, width: 25}}
                        source={require('../../../assets/location-pin.png')}
                      />
                    </TouchableOpacity>
                    {confirmedLocation && (
                      <View style={{marginVertical: 5}}>
                        <Text style={{color: '#000',marginHorizontal:10}}>
                          Selected Address: {confirmedLocation.address}
                        </Text>
                        {/* <Text style={{color:'#000'}}>Latitude: {confirmedLocation.latitude}</Text>
          <Text style={{color:'#000'}}>Longitude: {confirmedLocation.longitude}</Text> */}
                      </View>
                    )}
       
    </ScrollView>
    <Modal visible={isLocationPickerVisible} animationType="slide">
          <SafeAreaView style={{flex: 1}}>
            <View
              style={{
                position: 'relative',
                alignItems: 'center',
                paddingVertical: 10,
              }}>
              {/* Back Button (Left Side) */}
              <TouchableOpacity
                onPress={() => setIsLocationPickerVisible(false)}
                style={{
                  position: 'absolute',
                  left: 10, // Ensures it's on the left
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Image
                  style={{height: 25, width: 25, marginTop: 10}}
                  source={require('../../../assets/back_arrow.png')}
                />
              </TouchableOpacity>

              {/* Centered Title */}
              <Text
                style={{
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: 17,
                  textAlign: 'center',
                }}>
                Pick Location
              </Text>
            </View>
            <GooglePlacesAutocomplete
              placeholder="Search for a location"
              fetchDetails={true}
              onPress={(data, details = null) => {
                if (details) {
                  const {lat, lng} = details.geometry.location;
                  setRegion({
                    ...region,
                    latitude: lat,
                    longitude: lng,
                  });
                  setMarker({latitude: lat, longitude: lng});
                  setAddress(details.formatted_address);
                }
              }}
              query={{
                key: 'AIzaSyDFkFf27LcYV5Fz6cjvAfEX1hsdXx4zE6Q',
                language: 'en',
              }}
              styles={{
                container: {flex: 0, zIndex: 1},
                textInput: {
                  height: 40,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  backgroundColor: '#fff',
                  color: '#000',
                },
                listView: {
                  backgroundColor: '#fff',
                },
                row: {
                  padding: 13,
                  height: 44,
                  flexDirection: 'row',
                },
                description: {
                  color: 'black', // 👈 This changes the suggestion text color
                },
                predefinedPlacesDescription: {
                  color: 'black',
                },
              }}
              textInputProps={{
                placeholderTextColor: 'black',
              }}
            />

            <MapView
              style={{flex: 1}}
              region={region}
              onPress={onMapPress}
              initialRegion={region}>
              {marker && <Marker coordinate={marker} />}
            </MapView>
         
            <TouchableOpacity
              onPress={handleConfirmLocation}
              style={{
                padding: 15,
                backgroundColor: 'blue',
                margin: 10,
                borderRadius: 10,
              }}>
              <Text style={{color: 'white', textAlign: 'center'}}>
                Confirm Location
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
    </SafeAreaView>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    detailshead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 5,
      alignItems: 'center',
    },
    headname: {
      color: '#000',
      fontSize: 20,
      fontWeight: 'bold',
      marginHorizontal: 5,
    },
    addButton: {
      backgroundColor: colors.color2,
      borderRadius: 5,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    disabledButton: {
      opacity: 0.7,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginHorizontal: 10,
      color: '#000',
    },
    radioGroup: {
      flexDirection: 'row',
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 10,
    },
    radioCircle: {
      height: 20,
      width: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: 'gray',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    selectedRb: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'gray',
    },
    radioText: {
      fontSize: 16,
    },
    infoContainer: {
      marginTop: 5,
    },
    inputError: {
      borderColor: 'red',
      borderWidth: 1,
      marginHorizontal: 10,
    },

    infoText: {
      fontSize: 16,
      marginBottom: 8,
      color: '#000',
      marginHorizontal: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
      marginBottom: 15,
      backgroundColor: '#fff',
      color: '#000',
      marginHorizontal: 10,
    },
    inputnoneditable: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
      marginBottom: 15,
      backgroundColor: '#fff',
      color: 'gray',
      marginHorizontal: 10,
    },
  });

export default LocationEdit;