import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Switch,
  SafeAreaView,
  PermissionsAndroid,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  addItemToCart,
  removeFromCart,
  setLoggedInUser,
  setUserRole,
  updateCartItem,
} from '../../redux/actions/Actions';
import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import ModalComponent from '../../components/ModelComponent';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ColorContext} from '../../components/colortheme/colorTheme';

import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const AddNewLocation = () => {
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

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

  const handleConfirmLocation = () => {
    if (marker) {
      const confirmedLocationData = {
        latitude: marker.latitude,
        longitude: marker.longitude,
        address: address,
      };

      setConfirmedLocation(confirmedLocationData);

      if (locationTriggeredBy === 'formModal') {
        setInputValues(prev => ({
          ...prev,
          locationLatLong: `${marker.latitude}, ${marker.longitude}`,
          locationDescription: address,
        }));
      } else if (locationTriggeredBy === 'locationModal') {
        setLocationInputValues(prev => ({
          ...prev,
          locationLatLong: `${marker.latitude}, ${marker.longitude}`,
          // locationDescription: address
        }));
      }

      setIsLocationPickerVisible(false);

      setTimeout(() => {
        if (locationTriggeredBy === 'formModal') {
          setIsModalVisible(true);
        } else if (locationTriggeredBy === 'locationModal') {
          setIsLocationModalVisible(true);
        }
        setLocationTriggeredBy(null);
      }, 300);
    }
  };

  const searchEnteredLocation = (locationDetails, isLocationModal = false) => {
    // Construct search query from the appropriate state
    const searchQuery = [
      locationDetails.locationName,
      locationDetails.locality,
      locationDetails.cityOrTown,
      locationDetails.state,
      locationDetails.pincode,
      locationDetails.country,
    ]
      .filter(Boolean)
      .join(', ');

    if (searchQuery) {
      Geocoder.from(searchQuery)
        .then(json => {
          const location = json.results[0].geometry.location;
          const fullAddress = json.results[0].formatted_address;

          setRegion({
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setMarker({
            latitude: location.lat,
            longitude: location.lng,
          });
          setAddress(fullAddress);

          // Update the appropriate state based on which modal triggered this
          if (isLocationModal) {
            setLocationInputValues(prev => ({
              ...prev,
              locality: locationDetails.locality || prev.locality,
              cityOrTown: locationDetails.cityOrTown || prev.cityOrTown,
              state: locationDetails.state || prev.state,
              pincode: locationDetails.pincode || prev.pincode,
              country: locationDetails.country || prev.country,
              locationDescription: fullAddress,
            }));
          } else {
            setInputValues(prev => ({
              ...prev,
              cityOrTown: locationDetails.cityOrTown || prev.cityOrTown,
              country: locationDetails.country || prev.country,
              pincode: locationDetails.pincode || prev.pincode,
              locationDescription: fullAddress,
            }));
          }
        })
        .catch(error => {
          console.warn('Geocoding error:', error);
          getCurrentLocation();
        });
    } else {
      getCurrentLocation();
    }
  };

  const {colors} = useContext(ColorContext);
  const style = getStyles(colors);
  const userRole = useSelector(state => state.userRole) || '';
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);
  const comp_flag = selectedCompany?.comp_flag;
  const hold_qty_flag = selectedCompany?.hold_qty_flag;
  const pdf_flag = useSelector(state => state.selectedCompany.pdf_flag);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValuess, setInputValuess] = useState({});
  const cartItems = useSelector(state => state.cartItems);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [comments, setComments] = useState('');
  const [shipDate, setShipDate] = useState(null);
  const [customerLocations, setCustomerLocations] = useState([]);
  const [distributorLocations, setDistributorLocations] = useState([]);
  const [fromToClicked, setFromToClicked] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState(null);
  const [shipFromToClicked, setShipFromToClicked] = useState(false);
  const [selectedShipLocation, setSelectedShipLocation] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedShipLocationId, setSelectedShipLocationId] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedDistributorDetails, setSelectedDistributorDetails] =
    useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const [modalItems, setModalItems] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);

  const [gstValues, setGstValues] = useState({});

  const [isSaving, setIsSaving] = useState(false);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [barcodeList, setBarcodeList] = useState([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isAlertShown, setIsAlertShown] = useState(false);

  const StylePublish = ['Style', 'Package'];

  const [selectedStatus, setSelectedStatus] = useState('Active'); // Default is 'Active'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(0);

  const [selectedStateId, setSelectedStateId] = useState(null); // Track only the stateId
  const [selectedState, setSelectedState] = useState(null); // Track the full state object
  const [states, setStates] = useState([]);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [filteredStates, setFilteredStates] = useState(states);

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState(null);

  useEffect(() => {
    if (stateSearchTerm === '') {
      setFilteredStates(states);
    } else {
      setFilteredStates(
        states.filter(state =>
          state.stateName.toLowerCase().includes(stateSearchTerm.toLowerCase()),
        ),
      );
    }
  }, [stateSearchTerm, states]);

  const getState = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_STATE}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('response.data.state===>', response.data);
        setStates(response.data); // Assuming the response contains the states
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const toggleStateDropdown = () => {
    setShowStateDropdown(prev => !prev);
  };

  // Handle state selection
  const handleSelectState = state => {
    setSelectedStateId(state.stateId); // Set the selected stateId
    setSelectedState(state); // Set the full state object
    setShowStateDropdown(false); // Hide the dropdown after selection
  };

  // Fetch states when the component mounts
  useEffect(() => {
    getState();
  }, []);
  const statusOptions = [
    {label: 'Active', value: 0},
    {label: 'Inactive', value: 1},
  ];

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleSelectStatus = status => {
    // Update selectedStatus with the label and selectedStatusId with the value
    setSelectedStatus(status.label);
    setSelectedStatusId(status.value);
    setShowStatusDropdown(false);
  };
  const [modalData, setModalData] = useState(null);

  const handleSaveItem = fetchedData => {
    console.log('Fetched Data:', fetchedData); // Log fetched data for debugging

    let itemsToUpdate = [];

    fetchedData.forEach(item => {
      const itemDetails = {
        packageId: item.packageId || null,
        styleId: item.styleId,
        styleName: item.styleDesc,
        colorName: item.colorName,
        colorId: item.colorId,
        sizeDesc: item.sizeDesc,
        sizeId: item.sizeId,
        quantity: item.qty || 1, // Default to 1 if quantity is not available
        dealerPrice: item.dealerPrice,
        retailerPrice: item.retailerPrice,
        mrp: item.mrp,
        price: item.unitPrice,
        gst: item.gst,
        imageUrls: item.imageUrls, // Add imageUrls to the cart item details
        sourceScreen: 'ModalComponent',
      };

      console.log('Item details to add/update:', itemDetails);

      // Check if the item already exists in the cart
      const existingItemIndex = cartItems.findIndex(
        cartItem =>
          cartItem.styleId === item.styleId &&
          cartItem.colorId === item.colorId &&
          cartItem.sizeDesc === item.sizeDesc,
      );

      if (existingItemIndex !== -1) {
        // Update the existing item's quantity and other details if needed
        const updatedItem = {
          ...cartItems[existingItemIndex],
          quantity:
            parseInt(cartItems[existingItemIndex].quantity, 10) +
            itemDetails.quantity, // Add the new quantity
          price: itemDetails.price,
          imageUrls: itemDetails.imageUrls, // Update images if necessary
        };

        console.log(
          `Updating existing item at index ${existingItemIndex}:`,
          updatedItem,
        );
        dispatch(updateCartItem(existingItemIndex, updatedItem));
      } else {
        // Add a new item to the list if it doesn't exist
        console.log('Adding new item:', itemDetails);
        itemsToUpdate.push(itemDetails);
      }
    });

    // Dispatch actions to update the cart
    if (itemsToUpdate.length > 0) {
      console.log('Items to be added to cart:', itemsToUpdate);
      itemsToUpdate.forEach(item => dispatch(addItemToCart(item)));
    } else {
      console.log('No items to add to cart.');
    }

    // Clear inputs and close modal
    console.log('Clearing input values and closing modal.');
    setInputValues({});
    setModalVisible(false);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setKeyboardSpace(event.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardSpace(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setModalItems([]);
  };

  const filteredCustomers = customers
    .filter(customer => customer !== null) // Filter out null values
    .filter(customer => {
      const fullName =
        `${customer.firstName} ${customer.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });

  const filteredDistributors = distributors
    .filter(distributor => distributor !== null) // Filter out null values
    .filter(distributor => {
      const full =
        `${distributor.firstName} ${distributor.distributorName}`.toLowerCase();
      return full.includes(searchQuery.toLowerCase());
    });

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

  useEffect(() => {}, [companyId]);

  useEffect(() => {
    // Fetch user role from AsyncStorage
    const fetchUserRole = async () => {
      try {
        const storedUserRole = await AsyncStorage.getItem('userRole');
        if (storedUserRole) {
          dispatch(
            setUserRole(
              typeof storedUserRole === 'string'
                ? storedUserRole
                : JSON.parse(storedUserRole),
            ),
          );
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  const [selectedCustomerLocationDetails, setSelectedCustomerLocationDetails] =
    useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isNavigatingToLocationModal, setIsNavigatingToLocationModal] =
    useState(false);

  const toggleLocationModal = () => {
    const nextModalLocationState = !isLocationModalVisible;

    // Only reset values if we're closing the modal AND not navigating to location picker
    if (!nextModalLocationState && !isNavigatingToLocationModal) {
      console.log('Clearing input values inside toggleLocationModal');
      setLocationInputValues({
        locationName: '',
        phoneNumber: '',
        locality: '',
        cityOrTown: '',
        state: '',
        pincode: '',
        country: '',
        locationLatLong: '',
      });
      setLocationErrorFields([]);
    }
    setIsNavigatingToLocation(false);
    setIsLocationModalVisible(nextModalLocationState);
  };

  const handleInputValueChange = (size, value) => {
    setInputValuess(prevState => ({
      ...prevState,
      [size]: value,
    }));
  };

  const [inputValues, setInputValues] = useState({
    firstName: '',
    phoneNumber: '',
    whatsappId: '',
    cityOrTown: '',
    country: '',
    pincode: '',
    locationName: '',
    locationDescription: '',
    locationLatLong: '',
  });

  const [errorFields, setErrorFields] = useState([]);

  const handleSaveButtonPress = () => {
    const mandatoryFields = [
      'firstName',
      'phoneNumber',
      'whatsappId',
      'cityOrTown',
      'country',
      'pincode',
      'locationName',
      'locationDescription',
      'locationLatLong',
    ];

    // Add state to mandatory fields if isEnabled (i.e., adding customer location details)
    if (isEnabled) {
      mandatoryFields.push('state');
    }

    setErrorFields([]);

    // Check if any mandatory fields are missing, including state
    const missingFields = mandatoryFields.filter(field => {
      // Check for mandatory fields that are not filled
      if (field === 'state') {
        // If isEnabled and state is not selected, it's a missing field
        return !selectedState; // Check if selectedState is null or undefined
      }
      return !inputValues[field];
    });

    if (missingFields.length > 0) {
      setErrorFields(missingFields);
      Alert.alert('Alert', 'Please fill in all mandatory fields');
      return;
    }

    const hasExactlyTenDigits = /^\d{10,12}$/;

    // Validate phone number format
    if (!hasExactlyTenDigits.test(Number(inputValues?.phoneNumber))) {
      Alert.alert('Alert', 'Please Provide a valid Phone Number');
      return;
    }

    // Validate whatsappId if provided
    if (inputValues?.whatsappId?.length > 0) {
      if (!hasExactlyTenDigits.test(inputValues?.whatsappId)) {
        Alert.alert('Alert', 'Please Provide a valid Whatsapp Number');
        return;
      }
    }

    // Set saving state to true to disable the button
    setIsSaving(true);

    // Call appropriate function based on isEnabled
    isEnabled ? getisValidCustomer() : getisValidDistributors();
  };

  useEffect(() => {
    // Fetch user data from AsyncStorage
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          // Dispatch action to set user data in Redux
          dispatch(setLoggedInUser(userData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [dispatch]);

  const [isNavigatingToLocation, setIsNavigatingToLocation] = useState(false);
  const [locationTriggeredBy, setLocationTriggeredBy] = useState(null);

  const handlePickLocation = () => {
    setIsNavigatingToLocation(true);
    setLocationTriggeredBy('formModal');

    // Pass form modal location details
    const enteredLocation = {
      locationName: inputValues.locationName,
      cityOrTown: inputValues.cityOrTown,
      country: inputValues.country,
      pincode: inputValues.pincode,
      locationDescription: inputValues.locationDescription,
    };

    setIsModalVisible(false);
    setTimeout(() => {
      setIsLocationPickerVisible(true);
      searchEnteredLocation(enteredLocation, false); // false for form modal
    }, 100);
  };

  const handleLocationModalPick = () => {
    setIsNavigatingToLocationModal(true);
    setLocationTriggeredBy('locationModal');

    // Pass location modal details
    const enteredLocation = {
      locationName: locationInputValues.locationName,
      locality: locationInputValues.locality,
      cityOrTown: locationInputValues.cityOrTown,
      state: locationInputValues.state,
      pincode: locationInputValues.pincode,
      country: locationInputValues.country,
    };

    setIsLocationModalVisible(false);
    setTimeout(() => {
      setIsLocationPickerVisible(true);
      searchEnteredLocation(enteredLocation, true); // true for location modal
    }, 100);
  };

  useEffect(() => {
    if (isModalVisible && !isNavigatingToLocation) {
      console.log('Modal opened (not from location), clearing state');
      setSelectedState(null);
      setSelectedStateId(null);
      setStateSearchTerm('');
    } else if (isModalVisible && isNavigatingToLocation) {
      console.log('Modal opened from location, keeping state');
    }
  }, [isModalVisible]);

  const toggleModal = () => {
    console.log('toggleModal called - current state:', isModalVisible);

    const nextModalState = !isModalVisible;
    setIsSaving(false);
    // If navigating to location, just toggle and exit
    if (isNavigatingToLocation) {
      console.log('Preserving values for location selection');
      setIsModalVisible(nextModalState);
      setIsNavigatingToLocation(false);
      return;
    }

    // If we are opening the modal (not closing)
    if (nextModalState) {
      console.log('Opening modal - clearing state');
      setSelectedState(null);
      setSelectedStateId(null);
      setStateSearchTerm('');
    } else {
      console.log('Closing modal - clearing input fields');
      setErrorFields([]);
      setInputValues({
        firstName: '',
        phoneNumber: '',
        whatsappId: '',
        cityOrTown: '',
        country: '',
        pincode: '',
        locationName: '',
        locationDescription: '',
        locationLatLong: '',
      });
      setSelectedState(null);
      setSelectedStateId(null);
    }

    setIsModalVisible(nextModalState);
    setIsNavigatingToLocation(false);
  };

  const resetModal = () => {
    console.log('Resetting modal state after save');
    setIsModalVisible(false);
    setErrorFields([]);
    setInputValues({
      firstName: '',
      phoneNumber: '',
      whatsappId: '',
      cityOrTown: '',
      country: '',
      pincode: '',
      locationName: '',
      locationDescription: '',
      locationLatLong: '',
    });
    setSelectedState(null);
    setSelectedStateId(null);
    setStateSearchTerm('');
    setIsNavigatingToLocation(false);
    setConfirmedLocation(null);
    setIsSaving(false);
  };

  const getisValidCustomer = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.VALIDATIONCUSTOMER}/${inputValues.firstName}/${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      // Check if the response indicates the distributor is valid
      if (response.data === true) {
        addCustomerDetails();
        resetModal();
        // Proceed to save distributor details
      } else {
        // Show an alert if the distributor name is already used
        Alert.alert(
          'crm.codeverse.co says',
          'A Customer/Retailer already exist with this name',
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'There was a problem checking the distributor validity. Please try again.',
      );
    }
  };
  const addCustomerDetails = () => {
    setIsSaving(true);
    const requestData = {
      firstName: inputValues.firstName,
      lastName: '',
      phoneNumber: inputValues.phoneNumber,
      whatsappId: inputValues.whatsappId,
      emailId: '',
      action: '',
      createBy: 1,
      createOn: new Date().toISOString(),
      modifiedBy: 1,
      modifiedOn: new Date().toISOString(),
      houseNo: '',
      street: '',
      locality: '',
      cityOrTown: inputValues.cityOrTown,
      // state: inputValues.state,
      state: selectedState?.stateName || '',
      stateId: selectedStateId,
      country: inputValues.country,
      pincode: inputValues.pincode,
      pan: '',
      gstNo: '',
      creditLimit: 0,
      paymentReminderId: 0,
      companyId: companyId,
      locationName: inputValues.locationName,
      locationCode: '',
      locationDescription: inputValues.locationDescription,
      linkType: 3,
      statusId: selectedStatusId,
      mobLatitude: confirmedLocation?.latitude || null,
      mobLongitude: confirmedLocation?.longitude || null,
      // userId:userId
    };
    console.log('requestData====>', requestData);
    axios
      .post(
        global?.userData?.productURL + API.ADD_CUSTOMER_DETAILS,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        },
      )
      .then(response => {
        const newCustomer = response.data.response.customerList[0];

        // Update the selected customer details and ID
        setSelectedCustomerDetails([newCustomer]);
        setSelectedCustomerId(newCustomer.customerId);

        // Fetch and set the customer locations for the new customer
        getCustomerLocations(newCustomer.customerId);

        // Close the modal
        setIsSaving(false);
        toggleModal();
      })
      .catch(error => {
        console.error('Error adding customer:', error);
        setIsSaving(false);
      });
  };

  const getisValidDistributors = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.VALIDATIONDISTRIBUTOR}/${inputValues.firstName}/${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      // Check if the response indicates the distributor is valid
      if (response.data === true) {
        addDistributorDetails();
        resetModal();
        // Proceed to save distributor details
      } else {
        // Show an alert if the distributor name is already used
        Alert.alert(
          'crm.codeverse.co says',
          'A Customer/Distributor already exist with this name',
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'There was a problem checking the distributor validity. Please try again.',
      );
    }
  };
  const addDistributorDetails = () => {
    setIsSaving(true);
    const requestData = {
      id: null,
      distributorName: inputValues.firstName,
      areaMasterId: 0,
      areaPincodeId: '',
      emailId: '',
      phoneNumber: inputValues.phoneNumber,
      whatsappId: inputValues.whatsappId,
      houseNo: '',
      street: '',
      locality: '',
      cityOrTown: inputValues.cityOrTown,
      state: selectedState?.stateName || '',
      stateId: selectedStateId,
      currencyId: 1,
      country: inputValues.country,
      pincode: inputValues.pincode,
      customerLevel: '',
      pan: '',
      gstNo: '',
      riskId: 0,
      myItems: '',
      creditLimit: 0,
      paymentReminderId: 26,
      // dayId: 0,
      // files: [],
      // remarks: '',
      // transport: 0,
      // mop: '',
      // markupDisc: 0,
      companyId: companyId,
      locationName: inputValues.locationName,
      locationCode: '',
      locationDescription: inputValues.locationDescription,
      linkType: 3,
      userId: userId,
      statusId: selectedStatusId,
      mobLatitude: confirmedLocation?.latitude || null,
      mobLongitude: confirmedLocation?.longitude || null,
    };
    console.log('requestDatafordis===>', requestData);

    axios
      .post(
        global?.userData?.productURL + API.ADD_DISTRIBUTOR_DETAILS,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global.userData.token.access_token}`,
          },
        },
      )
      .then(response => {
        const newDistributor = response.data.response.distributorList[0];

        // Update the selected distributor details and ID
        setSelectedDistributorDetails([newDistributor]);
        setSelectedDistributorId(newDistributor.id);

        // Fetch and set the distributor locations for the new customer
        getCustomerLocations(newDistributor.id);

        // Close the modal
        setIsSaving(false);
        toggleModal();
      })
      .catch(error => {
        console.error('Error adding Distributor:', error);
        setIsSaving(false);
      });
  };

  useEffect(() => {
    if (clicked) {
      {
        isEnabled ? getCustomersDetails() : getDistributorsDetails();
      }
    }
    setSelectedLocation('Billing to *');
    setSelectedShipLocation('Shipping to *');
    setSelectedLocationId('');
    setSelectedShipLocationId('');
    setCustomerLocations([]);
  }, [clicked, isEnabled]);

  const getCustomerLocations = customerId => {
    // const custometType = 1;
    let customerType;

    // Toggle logic based on switch status
    const switchStatus = isEnabled; // Assuming isEnabled controls the switch

    if (switchStatus) {
      customerType = 1; // Retailer
    } else {
      customerType = 3; // Distributor
    }

    if (!customerId) {
      console.error('customerId is undefined or null');
      return;
    }

    const apiUrl = `${global?.userData?.productURL}${API.GET_CUSTOMER_LOCATION}/${customerId}/${customerType}/${companyId}`;

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setCustomerLocations(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
        if (error.response && error.response.status === 401) {
        }
      });
  };

  const handleFromDropdownClick = () => {
    setFromToClicked(!fromToClicked);
    if (!fromToClicked) {
      // getCustomerLocations(selectedCustomerId);
      !isEnabled
        ? getCustomerLocations(selectedDistributorId)
        : getCustomerLocations(selectedCustomerId);
    }
  };

  const handleShipDropdownClick = () => {
    setShipFromToClicked(!shipFromToClicked);
    if (!shipFromToClicked) {
      // getCustomerLocations(selectedCustomerId);
      !isEnabled
        ? getCustomerLocations(selectedDistributorId)
        : getCustomerLocations(selectedCustomerId);
    }
  };

  const getCustomersDetails = () => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_CUSTOMER_LIST}/${companyId}`;
    setIsLoading(true); // Set loading to true before making the request
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setCustomers(response?.data?.response?.customerList || []);
        setIsLoading(false); // Set loading to false after receiving the response
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false); // Set loading to false in case of error
      });
  };

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
        // const distributorList = response?.data?.response?.distributorList || [];
        setDistributors(response?.data?.response?.distributorList || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const handleDropdownClick = () => {
    setClicked(!clicked);
    if (!clicked) {
      setSearchQuery(''); // Clear search query when opening the dropdown
    }
  };

  const [hasUserSelectedLocation, setHasUserSelectedLocation] = useState(false); // Flag to track manual selection

  const [
    hasUserSelectedLocationDistributor,
    setHasUserSelectedLocationDistributor,
  ] = useState(false); // Flag to track manual selection

  const handleLocationSelection = location => {
    setSelectedLocation(location.locationName);
    setSelectedLocationId(location.locationId);
    setHasUserSelectedLocation(true); // Set the flag to true when the user selects a location
    setHasUserSelectedLocationDistributor(true);
    setFromToClicked(false);
    console.log('Selected Location:', location.locationName);
  };

  const handleShipLocation = location => {
    setSelectedShipLocation(location.locationName);
    setSelectedShipLocationId(location.locationId);
    setShipFromToClicked(false);
  };

  useEffect(() => {
    // Watch for changes in customerLocations
    console.log('Updated customerLocations:', customerLocations);

    // Automatically select the first location if available and the user hasn't selected one
    if (customerLocations.length > 0 && !hasUserSelectedLocation) {
      console.log('First Location:', customerLocations[0]);
      setSelectedLocation(customerLocations[0].locationName);
      setSelectedLocationId(customerLocations[0].locationId);
    }
  }, [customerLocations]);

  useEffect(() => {
    // Watch for changes in customerLocations for shipping location
    console.log('Updated dis:', customerLocations);

    // Automatically select the first location for shipping if available and the user hasn't selected one
    if (customerLocations.length > 0 && !hasUserSelectedLocationDistributor) {
      console.log('First Location:', customerLocations[0]);
      setSelectedShipLocation(customerLocations[0].locationName);
      setSelectedShipLocationId(customerLocations[0].locationId);
    }
  }, [customerLocations]);

  useEffect(() => {
    // Watch for changes in customerLocations for shipping location
    console.log('Updated dis:', distributorLocations);

    // Automatically select the first location for shipping if available and the user hasn't selected one
    if (distributorLocations.length > 0 && !hasUserSelectedLocation) {
      console.log('First Location:', distributorLocations[0]);
      setSelectedShipLocation(distributorLocations[0].locationName);
      setSelectedShipLocationId(distributorLocations[0].locationId);
    }
  }, [distributorLocations]);

  const handleCustomerSelection = (firstName, lastName, customerId) => {
    setSelectedCustomer(`${firstName} ${lastName}`);
    setClicked(false);
    setSelectedCustomerId(customerId);
    setSelectedLocation(''); // Clear the location
    setSelectedShipLocation('');
    setSelectedLocationId('');
    setSelectedShipLocationId('');
    setHasUserSelectedLocation(false); // Reset the manual selection flag

    // Fetch locations for the customer
    console.log('Fetching customer locations for customerId:', customerId);
    getCustomerLocations(customerId);

    const selectedCustomer = customers.find(
      customer => customer.customerId === customerId,
    );
    setSelectedCustomerDetails([selectedCustomer]);
  };

  const handleDistributorSelection = (firstName, lastName, customerId) => {
    setSelectedDistributor(`${firstName} ${lastName}`);
    setClicked(false);
    setSelectedDistributorId(customerId);
    setSelectedLocation(''); // Clear the location
    setSelectedShipLocation('');
    setSelectedLocationId('');
    setSelectedShipLocationId('');
    setHasUserSelectedLocationDistributor(false); // Reset the manual selection flag

    // Fetch locations for the distributor
    console.log('Fetching distributor locations for customerId:', customerId);
    getCustomerLocations(customerId);

    const selectedDistributor = distributors.find(
      distributor => distributor.id === customerId,
    );
    setSelectedDistributorDetails([selectedDistributor]);
  };

  useEffect(() => {
    if (clicked) {
      isEnabled ? getCustomersDetails() : getDistributorsDetails();
    }
    setSelectedLocation('Billing to *');
    setSelectedShipLocation('Shipping to *');
    setSelectedLocationId('');
    setSelectedShipLocationId('');
    setCustomerLocations([]);
  }, [clicked, isEnabled]);

  const checkStyleAvailability = async cartItems => {
    const apiUrl = `${global?.userData?.productURL}${API.CHECKAVALABILITY}`;

    try {
      // Prepare the payload for the API request
      const payload = cartItems.map(item => ({
        style: item.styleName,
        colorName: item.colorName,
        sizeDesc: item.sizeDesc,
        styleId: item.styleId,
        sizeId: item.sizeId,
        locationId: selectedCompanyLocationId,
        qty: item.quantity,
      }));

      console.log('API URL:', apiUrl);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const headers = {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      };

      const response = await axios.post(apiUrl, payload, {headers});

      if (response.status === 200) {
        const data = response.data;
        if (data.message === 'true') {
          return {success: true, message: 'All items are available.'};
        } else {
          return {success: false, message: data.message};
        }
      } else {
        return {success: false, message: 'Failed to check availability.'};
      }
    } catch (error) {
      console.error(
        'Error checking availability:',
        error.response?.data || error.message,
      );
      return {
        success: false,
        message: 'An error occurred while checking availability.',
      };
    }
  };

  const PlaceAddOrder = async () => {
    let customerType;

    const switchStatus = isEnabled; // Assuming isEnabled controls the switch

    if (switchStatus) {
      customerType = 1; // Retailer
    } else {
      customerType = 2; // Distributor
    }

    if (isSubmitting) return;

    if (switchStatus) {
      if (!selectedCustomer) {
        Alert.alert('Alert', 'Please select a customer.');
        return;
      }
    } else {
      if (!selectedDistributor) {
        Alert.alert('Alert', 'Please select a Distributor.');
        return;
      }
    }

    if (!selectedLocationId) {
      Alert.alert('Alert', 'Please select a Billing to location.');
      return;
    }

    if (!selectedShipLocationId) {
      Alert.alert('Alert', 'Please select a Shipping to location.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Alert', 'No items selected. Please add items to the cart.');
      return;
    }

    if (!selectedCompanyLocationId && hold_qty_flag === 1) {
      Alert.alert('Alert', 'please select Company Location.');
      return;
    }
    // return;

    for (let i = 0; i < cartItems.length; i++) {
      const itemPrice = pdf_flag
        ? parseFloat(cartItems[i].mrp) || 0
        : isEnabled
        ? parseFloat(cartItems[i].retailerPrice) || 0
        : parseFloat(cartItems[i].dealerPrice) || 0;

      if (itemPrice === 0) {
        Alert.alert(
          'crm.codeverse.co says',
          'Style price is mandatory for creating an order.',
        );
        return;
      }
    }

    setIsSubmitting(true);

    if (hold_qty_flag === 1) {
      const availabilityCheck = await checkStyleAvailability(cartItems);

      if (!availabilityCheck.success) {
        Alert.alert('Alert', availabilityCheck.message);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);

    const d_pkg_flag = cartItems.some(
      item => item.sourceScreen === 'PackageDetail',
    )
      ? 1
      : 0;

    const selectedCustomerObj = customers.find(customer => {
      return `${customer.firstName} ${customer.lastName}` === selectedCustomer;
    });

    const customerId =
      userRole === 'admin'
        ? selectedCustomerObj
          ? selectedCustomerObj.customerId
          : ''
        : userRole === 'Distributor' || userRole === 'Retailer'
        ? roleId
        : '';

    const currentDate = new Date().toISOString().split('T')[0];

    const selectedShipDate = shipDate || currentDate;

    const requestData = {
      totalAmount: totalAmount,
      totalDiscount: '0',
      totalDiscountSec: '0',
      totalDiscountThird: '0',
      totalGst: totalGst,
      totalQty: totalQty.toString(),
      orderStatus: 'Open',
      comments: comments,
      customerId: isEnabled ? selectedCustomerId : selectedDistributorId,
      billingAddressId: selectedLocationId,
      shippingAddressId: selectedShipLocationId,
      shipDate: '',
      orderDate: currentDate,
      companyLocId: selectedCompanyLocationId,
      agentId: '0',
      subAgentId: '0',
      orderLineItems: cartItems.map((item, index) => ({
        qty: item.quantity.toString(),
        styleId: item.styleId,
        colorId: item.colorId,
        gscodeMapId: 42,
        sizeDesc: item.sizeDesc,
        gsCode: '8907536002462',
        availQty: item.quantity.toString(),
        // price: item.price.toString(),
        price: pdf_flag
          ? item?.mrp?.toString() // If pdf_flag is enabled, use mrp
          : isEnabled
          ? item?.retailerPrice?.toString() // Otherwise, use retailerPrice if isEnabled
          : item?.dealerPrice?.toString() || item?.price?.toString(),
        gross: lineItemTotals[index]?.toString() || '0',
        discountPercentage: '0',
        discountAmount: '0',
        gst: gstValues[index] !== undefined ? gstValues[index] : item.gst,
        total: (
          parseFloat(
            pdf_flag
              ? item?.mrp?.toString() // If pdf_flag is enabled, use mrp
              : isEnabled
              ? item?.retailerPrice?.toString() // If isEnabled is true, use retailerPrice
              : item?.dealerPrice?.toString(), // Otherwise, use dealerPrice
          ) ||
          parseFloat(item?.price?.toString()) * parseInt(item?.quantity, 10)
        ) // Fallback to price if other values are not available
          ?.toString(),
        itemStatus: 'OPEN',
        pcqty: '0',
        pack_qty: 0,
        sizeId: item.sizeId,
        packageId:
          item.sourceScreen === 'PackageDetail'
            ? item.packageId
              ? Number(item.packageId)
              : 0
            : 0,
        cedgeFlag: '0',
        cedgeStyleId: 0,
        discountPercentageSec: 0,
        discountPercentageThird:
          fixDiscValues[index] !== undefined
            ? fixDiscValues[index].toString()
            : item?.fixDisc?.toString() || '0', // Send fixedDisc as a string
        closeFlag: 0,
        statusFlag: 0,
        poId: 0,
        orgPrice: pdf_flag
          ? item?.mrp?.toString() // If pdf_flag is enabled, use mrp
          : isEnabled
          ? item?.retailerPrice?.toString() // If isEnabled is true, use retailerPrice
          : item?.dealerPrice?.toString() || item?.price?.toString(), // Otherwise, use dealerPrice or fallback to price
      })),
      comments: comments,
      customerType: customerType,
      distributorId: 0,
      invoiceNo: '',
      deliveryNote: '',
      mop: '',
      refNo: '',
      refDate: '',
      otherRefs: '',
      buyersNo: '',
      dispatchNo: '',
      delNoteDate: selectedShipDate,
      dispatch: 1,
      retailerId: '',
      tsiId: 0,
      approveFlag: 0,
      returnReasonId: 0,
      returnRemarks: '',
      appComments: '',
      gTranspExp: 0,
      gOtherExp: 0,
      companyId: companyId,
      d_pkg_flag: d_pkg_flag,
      barcodeList: barcodeList,
      // companyLocId: selectedCompanyLocationId,
      linkType: 3,
      currentCreditLimit: 0.0,
      orderType: 0,
      roundOff: roundOff,
      advancePayment: 0,
      paidAmount: 0,
      billNo: '',
    };

    // return;
    console.log('requestData======>', requestData);
    axios
      .post(global?.userData?.productURL + API.ADD_ORDER_DATA, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        // Handle success response
        dispatch({type: 'CLEAR_CART'});
        navigation.navigate('Home');
      })
      .catch(error => {
        console.error('Error placing order:', error);
        if (error.response) {
          console.error('Server responded with:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
          // Log the specific error message if available
          if (
            error.response.data.errors &&
            error.response.data.errors.length > 0
          ) {
            console.error(
              'Error message:',
              error.response.data.errors[0].message,
            );
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Request setup error:', error.message);
        }
      })
      .finally(() => {
        setBarcodeList([]);
        setIsSubmitting(false);
      });
  };

  const [locationInputValues, setLocationInputValues] = useState({
    locationName: '',
    phoneNumber: '',
    locality: '',
    cityOrTown: '',
    state: '',
    pincode: '',
    country: '',
  });

  const [locationErrorFields, setLocationErrorFields] = useState([]);

  // const handleSaveLocationButtonPress = () => {
  //   const mandatoryFields = [
  //     'locationName',
  //     'phoneNumber',
  //     'cityOrTown',
  //     'state',
  //     'pincode',
  //     'country',
  //     'locationLatLong',
  //   ];
  //   setLocationErrorFields([]);
  //   const missingFields = mandatoryFields.filter(
  //     field => !locationInputValues[field],
  //   );

  //   if (missingFields.length > 0) {
  //     setLocationErrorFields(missingFields);
  //     return; // Do not proceed with saving
  //   }

  //   const hasExactlyTenDigits = /^\d{10,12}$/;
  //   if (!hasExactlyTenDigits.test(Number(locationInputValues.phoneNumber))) {
  //     Alert.alert('Alert', 'Please Provide a valid Phone Number');
  //     return;
  //   }

  //   getisValidLocation();
  //   // toggleLocationModal();
  //   setConfirmedLocation(null);
  //   setIsNavigatingToLocationModal(false);
  // };

  const handleSaveLocationButtonPress = () => {
    const mandatoryFields = [
      'locationName',
      'phoneNumber',
      'cityOrTown',
      'state',
      'pincode',
      'country',
      'locationLatLong',
    ];
    setLocationErrorFields([]);
    const missingFields = mandatoryFields.filter(
      field => !locationInputValues[field],
    );
  
    if (missingFields.length > 0) {
      setLocationErrorFields(missingFields);
      return;
    }
  
    const hasExactlyTenDigits = /^\d{10,12}$/;
    if (!hasExactlyTenDigits.test(Number(locationInputValues.phoneNumber))) {
      Alert.alert('Alert', 'Please Provide a valid Phone Number');
      return;
    }
  
    // If all validations pass, proceed with saving
    getisValidLocation();
  
    // Reset input fields
    setLocationInputValues({
      locationName: '',
      phoneNumber: '',
      cityOrTown: '',
      state: '',
      pincode: '',
      country: '',
      locationLatLong: null,
    });
  
    setConfirmedLocation(null);
    setIsNavigatingToLocationModal(false);
  
    // Navigate to MasterLocation screen
    navigation.navigate('MasterLocation');
  };
  
  const getisValidLocation = async () => {
    const cusDisID = isEnabled ? selectedCustomerId : selectedDistributorId;
    const cusrDisType = isEnabled ? 1 : 3;
    const apiUrl = `${global?.userData?.productURL}${API.VALIDATIONLOACTION}/${locationInputValues.locationName}/${cusDisID}/${cusrDisType}/${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      // Check if the response indicates the distributor is valid
      if (response.data === true) {
        addCustomerLocationDetails();
        // Proceed to save distributor details
      } else {
        // Show an alert if the distributor name is already used
        Alert.alert(
          'crm.codeverse.co says',
          'This name has been used. Enter a new name.',
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'There was a problem checking the distributor validity. Please try again.',
      );
    }
  };
  const addCustomerLocationDetails = () => {
    const requestLocationData = {
      createBy: 1,
      createOn: '2024-05-08T08:31:06.285',
      modifiedBy: 1,
      modifiedOn: '2024-05-08T08:31:06.285',
      locationId: 66,
      locationName: locationInputValues?.locationName,
      locationCode: '',
      locationDescription: locationInputValues?.locationName,
      parentId: 0,
      customerId: isEnabled ? selectedCustomerId : selectedDistributorId,
      status: 0,
      phoneNumber: locationInputValues?.phoneNumber,
      emailId: '',
      houseNo: '',
      street: '',
      locality: locationInputValues?.locality,
      cityOrTown: locationInputValues?.cityOrTown,
      state: locationInputValues?.state,
      country: locationInputValues?.country,
      pincode: locationInputValues?.pincode,
      customerType: isEnabled ? 1 : 3,
      latitude: null,
      longitude: null,
      fullName: null,
      companyId: companyId,
      locationType: 0,
      userId: userId,
      linkType: 7,
      mobLatitude: confirmedLocation?.latitude || null,
      mobLongitude: confirmedLocation?.longitude || null,
    };

    console.log('requestLocationData====>', requestLocationData);

    axios
      .post(
        global?.userData?.productURL + API.ADD_CUSTOMER_LOCATION,
        requestLocationData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        },
      )
      .then(response => {
        setSelectedCustomerLocationDetails(response.data.response.locationList);
        toggleLocationModal();

        // Update selected location state
        setSelectedLocation(
          response.data.response.locationList[0].locationName,
        );
        setSelectedShipLocation(
          response.data.response.locationList[0].locationName,
        );
      })
      .catch(error => {
        console.error('Error adding customer:', error);
      });
  };
  const handleCloseModalDisRet = () => {
    setIsModalVisible(false);
    setInputValues([]); // Assuming inputValues should be an array too
    setErrorFields([]);
    setConfirmedLocation(null);
    setMarker(null);
    setAddress('');
  };

  const handleCloseModalLocation = () => {
    setIsLocationModalVisible(false);
    setLocationInputValues([]);
    setLocationErrorFields([]);
    setConfirmedLocation(null);
    setMarker(null);
    setAddress('');
  };

  useEffect(() => {}, []);

  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState);
    // Reset selected customer or distributor to fallback text when toggled
    if (!isEnabled) {
      setSelectedCustomerDetails([]); // Reset customer details
      setSelectedDistributorDetails([]); // Reset distributor details
    }
  };

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#fff'}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView>
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
          <View
            style={{
              marginVertical: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
        
            }}>
            <View style={style.switchContainer}>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 15,
                  color: '#000',
                  
                }}>
                Slide For Retailer
              </Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <View>
                <TouchableOpacity
                  style={{
                    width: '90%',
                    height: 50,
                    borderRadius: 10,
                    borderWidth: 0.5,
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: 15,
                    paddingRight: 15,
                    marginBottom: 8,
                  }}
                  onPress={handleDropdownClick}>
                  <Text style={{fontWeight: '600', color: '#000'}}>
                    {isEnabled
                      ? selectedCustomerDetails &&
                        selectedCustomerDetails.length > 0
                        ? `${selectedCustomerDetails[0].firstName} ${selectedCustomerDetails[0].lastName}`
                        : 'Retailer *'
                      : selectedDistributorDetails &&
                        selectedDistributorDetails.length > 0
                      ? `${selectedDistributorDetails[0].distributorName}`
                      : 'Distributor *'}
                  </Text>

                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>

                {clicked && (
                  <View
                    style={{
                      height: 230,
                      alignSelf: 'center',
                      width: '90%',
                      borderRadius: 10,
                      zIndex: 1, // Ensure stacking order
                      borderColor: 'gray', // Optional: Adds subtle border (for effect)
                      borderWidth: 1, // Optional: Adds subtle border (for effect)
                      marginBottom: 7,
                    }}>
                    <TextInput
                      style={{
                        marginTop: 10,
                        borderRadius: 10,
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        marginHorizontal: 10,
                        paddingLeft: 10,
                        marginBottom: 10,
                        color: '#000000',
                      }}
                      placeholderTextColor="#000"
                      placeholder="Search"
                      value={searchQuery}
                      onChangeText={text => setSearchQuery(text)}
                    />
                    {!isEnabled ? (
                      filteredDistributors.length === 0 && !isLoading ? (
                        <Text style={style.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        <ScrollView
                          style={style.scrollView}
                          nestedScrollEnabled={true}>
                          {filteredDistributors.map((item, index) => (
                            <TouchableOpacity
                              key={index}
                              style={{
                                width: '100%',
                                height: 50,
                                justifyContent: 'center',
                                borderBottomWidth: 0.5,
                                borderColor: '#8e8e8e',
                              }}
                              onPress={() =>
                                handleDistributorSelection(
                                  item?.firstName,
                                  item?.distributorName,
                                  item?.id,
                                )
                              }>
                              <Text
                                style={{
                                  fontWeight: '600',
                                  marginHorizontal: 15,
                                  color: '#000',
                                }}>
                                {item.firstName}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )
                    ) : filteredCustomers.length === 0 && !isLoading ? (
                      <Text style={style.noCategoriesText}>
                        Sorry, no results found!
                      </Text>
                    ) : (
                      <ScrollView
                        style={style.scrollView}
                        nestedScrollEnabled={true}>
                        {filteredCustomers.map((item, index) => (
                          <TouchableOpacity
                            key={index}
                            style={{
                              width: '100%',
                              height: 50,
                              justifyContent: 'center',
                              borderBottomWidth: 0.5,
                              borderColor: '#8e8e8e',
                            }}
                            onPress={() =>
                              handleCustomerSelection(
                                item?.firstName,
                                item?.lastName,
                                item?.customerId,
                              )
                            }>
                            <Text
                              style={{
                                fontWeight: '600',
                                marginHorizontal: 15,
                                color: '#000',
                              }}>
                              {item.firstName} {item.lastName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                )}

                {isLoading && ( // Show ActivityIndicator if isLoading is true
                  <ActivityIndicator
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginLeft: -20,
                      marginTop: -20,
                    }}
                    size="large"
                    color="#1F74BA"
                  />
                )}
              </View>
            </View>
            {/* )} */}
            <View style={{marginTop: 10, marginRight: 10}}>
              <TouchableOpacity onPress={toggleModal} style={style.plusButton}>
                <Image
                  style={{
                    height: 30,
                    width: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  source={require('../../../assets/plus.png')}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={style.modalContainerr}>
            <View style={style.modalContentt}>
              <View>
                <TextInput
                  style={[
                    style.input,
                    {color: '#000'},
                    locationErrorFields.includes('locationName')
                      ? style.errorBorder
                      : null,
                  ]}
                  placeholder="Location Name *"
                  placeholderTextColor="#000"
                  onChangeText={text =>
                    setLocationInputValues({
                      ...locationInputValues,
                      locationName: text,
                    })
                  }
                  value={locationInputValues.locationName}
                />
                {locationErrorFields.includes('locationName') && (
                  <Text style={style.errorText}>
                    Please Enter Location Name
                  </Text>
                )}

                <TextInput
                  style={[
                    style.input,
                    {color: '#000'},
                    errorFields.includes('state') ? style.errorBorder : null,
                    locationErrorFields.includes('phoneNumber')
                      ? style.errorBorder
                      : null,
                  ]}
                  placeholder="Phone Number *"
                  placeholderTextColor="#000"
                  onChangeText={text =>
                    setLocationInputValues({
                      ...locationInputValues,
                      phoneNumber: text,
                    })
                  }
                  value={locationInputValues.phoneNumber}
                />
                {locationErrorFields.includes('phoneNumber') && (
                  <Text style={style.errorText}>Please Enter Phone Number</Text>
                )}
                <TextInput
                  style={[style.input, {color: '#000'}]}
                  placeholder="Locality"
                  placeholderTextColor="#000"
                  onChangeText={text =>
                    setLocationInputValues({
                      ...locationInputValues,
                      locality: text,
                    })
                  }
                  value={locationInputValues.locality}
                />
                <TextInput
                  style={[
                    style.input,
                    {color: '#000'},
                    locationErrorFields.includes('cityOrTown')
                      ? style.errorBorder
                      : null,
                  ]}
                  placeholder="City or Town *"
                  placeholderTextColor="#000"
                  onChangeText={text =>
                    setLocationInputValues({
                      ...locationInputValues,
                      cityOrTown: text,
                    })
                  }
                  value={locationInputValues.cityOrTown}
                />
                {locationErrorFields.includes('cityOrTown') && (
                  <Text style={style.errorText}>Please Enter City Or Town</Text>
                )}
                <TextInput
                  style={[
                    style.input,
                    {color: '#000'},
                    locationErrorFields.includes('state')
                      ? style.errorBorder
                      : null,
                  ]}
                  placeholderTextColor="#000"
                  placeholder="State *"
                  onChangeText={text =>
                    setLocationInputValues({
                      ...locationInputValues,
                      state: text,
                    })
                  }
                  value={locationInputValues.state}
                />
                {locationErrorFields.includes('state') && (
                  <Text style={style.errorText}>Please Enter State</Text>
                )}
                <TextInput
                  style={[
                    style.input,
                    {color: '#000'},
                    locationErrorFields.includes('pincode')
                      ? style.errorBorder
                      : null,
                  ]}
                  placeholderTextColor="#000"
                  placeholder="Pincode *"
                  onChangeText={text =>
                    setLocationInputValues({
                      ...locationInputValues,
                      pincode: text,
                    })
                  }
                  value={locationInputValues.pincode}
                />
                {locationErrorFields.includes('pincode') && (
                  <Text style={style.errorText}>Please Enter Pincode</Text>
                )}
                <TextInput
                  style={[
                    style.input,
                    {color: '#000'},
                    locationErrorFields.includes('country')
                      ? style.errorBorder
                      : null,
                  ]}
                  placeholderTextColor="#000"
                  placeholder="Country *"
                  onChangeText={text =>
                    setLocationInputValues({
                      ...locationInputValues,
                      country: text,
                    })
                  }
                  value={locationInputValues.country}
                />
                {locationErrorFields.includes('country') && (
                  <Text style={style.errorText}>Please Enter Country</Text>
                )}

                <TouchableOpacity
                  onPress={handleLocationModalPick}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 5,
                    borderColor: locationErrorFields.includes('locationLatLong')
                      ? 'red'
                      : 'gray',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{color: '#000'}}>Pick Location</Text>
                  <Image
                    style={{height: 25, width: 25}}
                    source={require('../../../assets/location-pin.png')}
                  />
                </TouchableOpacity>

                {/* Show an error message if locationLatLong is missing */}
                {locationErrorFields.includes('locationLatLong') && (
                  <Text style={{color: 'red', marginTop: 5}}>
                    Please pick a location
                  </Text>
                )}

                {confirmedLocation && (
                  <View style={{marginTop: 20}}>
                    <Text style={{color: '#000'}}>
                      Selected Address: {confirmedLocation.address}
                    </Text>
                    {/* <Text style={{color:'#000'}}>Latitude: {confirmedLocation.latitude}</Text>
          <Text style={{color:'#000'}}>Longitude: {confirmedLocation.longitude}</Text> */}
                  </View>
                )}
                <TouchableOpacity
                  onPress={handleSaveLocationButtonPress}
                  style={style.saveButton}>
                  <Text style={style.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{backgroundColor: '#faf7f6'}}>
            <ModalComponent
              modalVisible={modalVisible}
              closeModal={closeModal}
              selectedItem={selectedItem}
              inputValuess={inputValuess}
              onInputValueChange={handleInputValueChange} // Pass the function to handle input value changes
            />
            <Modal
              animationType="fade"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={() => {
                toggleModal();
              }}>
              <View style={style.modalContainerrr}>
                <View style={style.modalContenttt}>
                  <View
                    style={{
                      backgroundColor: colors.color2,
                      borderRadius: 10,
                      marginHorizontal: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                      paddingVertical: 5,
                      width: '100%',
                      justifyContent: 'space-between',
                      marginBottom: 15,
                    }}>
                    <Text
                      style={[
                        style.modalTitle,
                        {textAlign: 'center', flex: 1},
                      ]}>
                      {isEnabled ? 'Retailer Details' : 'Distributor Details'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseModalDisRet}
                      style={{alignSelf: 'flex-end'}}>
                      <Image
                        style={{height: 30, width: 30, marginRight: 5}}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{width: '100%', height: '65%'}}>
                    <TextInput
                      style={[
                        style.input,
                        {color: '#000'},
                        errorFields.includes('firstName')
                          ? style.errorBorder
                          : null,
                      ]}
                      placeholder={
                        isEnabled ? 'Retailer Name *' : 'Distributor Name *'
                      }
                      placeholderTextColor="#000"
                      onChangeText={text =>
                        setInputValues({...inputValues, firstName: text})
                      }
                      value={inputValues.firstName}
                    />
                    {errorFields.includes('firstName') && (
                      <Text style={style.errorText}>
                        {isEnabled
                          ? 'Please Enter Retailer Name'
                          : 'Please Enter Distributor Name'}
                      </Text>
                    )}

                    <TextInput
                      style={[
                        style.input,
                        {color: '#000'},
                        errorFields.includes('phoneNumber')
                          ? style.errorBorder
                          : null,
                      ]}
                      placeholder="Phone Number *"
                      placeholderTextColor="#000"
                      onChangeText={text =>
                        setInputValues({...inputValues, phoneNumber: text})
                      }
                      value={inputValues.phoneNumber}
                    />
                    {errorFields.includes('phoneNumber') && (
                      <Text style={style.errorText}>
                        Please Enter Phone Number
                      </Text>
                    )}

                    <TextInput
                      style={[style.input, {color: '#000'}]}
                      placeholder="Whatsapp Number *"
                      placeholderTextColor="#000"
                      onChangeText={text =>
                        setInputValues({...inputValues, whatsappId: text})
                      }
                      value={inputValues.whatsappId}
                    />
                    {errorFields.includes('whatsappId') && (
                      <Text style={style.errorText}>
                        Please Enter Whatsapp Number
                      </Text>
                    )}
                    <TextInput
                      style={[
                        style.input,
                        {color: '#000'},
                        errorFields.includes('cityOrTown')
                          ? style.errorBorder
                          : null,
                      ]}
                      placeholder="City or Town *"
                      placeholderTextColor="#000"
                      onChangeText={text =>
                        setInputValues({...inputValues, cityOrTown: text})
                      }
                      value={inputValues.cityOrTown}
                    />
                    {errorFields.includes('cityOrTown') && (
                      <Text style={style.errorText}>
                        Please Enter City Or Town
                      </Text>
                    )}

                    <TextInput
                      style={[
                        style.input,
                        {color: '#000'},
                        errorFields.includes('country')
                          ? style.errorBorder
                          : null,
                      ]}
                      placeholderTextColor="#000"
                      placeholder="Country *"
                      onChangeText={text =>
                        setInputValues({...inputValues, country: text})
                      }
                      value={inputValues.country}
                    />
                    {errorFields.includes('country') && (
                      <Text style={style.errorText}>Please Enter Country</Text>
                    )}
                    <Text style={style.headerTxt}>
                      {isEnabled ? 'State *' : 'State'}{' '}
                      {/* Append '*' when isEnabled is true */}
                    </Text>

                    <View style={style.container1}>
                      <View style={style.container2}>
                        <TouchableOpacity
                          style={style.container3}
                          onPress={toggleStateDropdown}>
                          <Text style={{fontWeight: '600', color: '#000'}}>
                            {selectedState?.stateName || 'Select'}{' '}
                            {/* Display the stateName if selected, otherwise 'Select' */}
                          </Text>
                          <Image
                            source={require('../../../assets/dropdown.png')}
                            style={{width: 20, height: 20}}
                          />
                        </TouchableOpacity>

                        {/* Dropdown list */}
                        {showStateDropdown && (
                          <View style={style.dropdownContentstate}>
                            <TextInput
                              style={style.searchInputsearch}
                              placeholder="Search state..."
                              placeholderTextColor="#000"
                              value={stateSearchTerm}
                              onChangeText={text => setStateSearchTerm(text)}
                            />
                            <ScrollView
                              style={style.scrollView}
                              nestedScrollEnabled={true}>
                              {filteredStates.map(state => (
                                <TouchableOpacity
                                  key={state.stateId}
                                  style={style.dropdownItem}
                                  onPress={() => handleSelectState(state)}>
                                  <Text style={style.dropdownText}>
                                    {state.stateName}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>

                    <TextInput
                      style={[
                        style.input,
                        {color: '#000'},
                        errorFields.includes('pincode')
                          ? style.errorBorder
                          : null,
                      ]}
                      placeholderTextColor="#000"
                      placeholder="Pincode *"
                      onChangeText={text =>
                        setInputValues({...inputValues, pincode: text})
                      }
                      value={inputValues.pincode}
                    />
                    {errorFields.includes('pincode') && (
                      <Text style={style.errorText}>Please Enter Pincode</Text>
                    )}
                    <TextInput
                      style={[
                        style.input,
                        {color: '#000'},
                        errorFields.includes('locationName')
                          ? style.errorBorder
                          : null,
                      ]}
                      placeholderTextColor="#000"
                      placeholder="Location Name *"
                      onChangeText={text =>
                        setInputValues({...inputValues, locationName: text})
                      }
                      value={inputValues.locationName}
                    />
                    {errorFields.includes('locationName') && (
                      <Text style={style.errorText}>Please Enter Landmark</Text>
                    )}
                    <TextInput
                      style={[
                        style.input,
                        {color: '#000'},
                        errorFields.includes('locationDescription')
                          ? style.errorBorder
                          : null,
                      ]}
                      placeholderTextColor="#000"
                      placeholder="Landmark*"
                      onChangeText={text =>
                        setInputValues({
                          ...inputValues,
                          locationDescription: text,
                        })
                      }
                      value={inputValues.locationDescription}
                    />
                    {errorFields.includes('locationDescription') && (
                      <Text style={style.errorText}>Please Enter Landmark</Text>
                    )}

                    <Text style={style.headerTxt}>{'Status *'}</Text>
                    <View style={style.container1}>
                      <View style={style.container2}>
                        <TouchableOpacity
                          style={style.container3}
                          onPress={toggleStatusDropdown}>
                          <Text style={{fontWeight: '600', color: '#000'}}>
                            {selectedStatus}
                          </Text>
                          <Image
                            source={require('../../../assets/dropdown.png')}
                            style={{width: 20, height: 20}}
                          />
                        </TouchableOpacity>
                        {showStatusDropdown && (
                          <View style={style.dropdownContainersstatus}>
                            {statusOptions.map((status, index) => (
                              <TouchableOpacity
                                key={index}
                                style={style.dropdownItem}
                                onPress={() => handleSelectStatus(status)}>
                                <Text style={style.dropdownText}>
                                  {status.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={handlePickLocation}
                      style={{
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: errorFields.includes('locationLatLong')
                          ? 'red'
                          : 'gray',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={{color: '#000'}}>Pick Location</Text>
                      <Image
                        style={{height: 25, width: 25}}
                        source={require('../../../assets/location-pin.png')}
                      />
                    </TouchableOpacity>

                    {/* Show an error message if locationLatLong is missing */}
                    {errorFields.includes('locationLatLong') && (
                      <Text style={{color: 'red', marginTop: 5}}>
                        Please pick a location
                      </Text>
                    )}
                    {confirmedLocation && (
                      <View style={{marginTop: 20}}>
                        <Text style={{color: '#000'}}>
                          Selected Address: {confirmedLocation.address}
                        </Text>
                        {/* <Text style={{color:'#000'}}>Latitude: {confirmedLocation.latitude}</Text>
          <Text style={{color:'#000'}}>Longitude: {confirmedLocation.longitude}</Text> */}
                      </View>
                    )}
                    <TouchableOpacity
                      style={style.saveButton}
                      onPress={handleSaveButtonPress}
                      disabled={isSaving} // Disable button when saving
                    >
                      <Text style={style.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        </SafeAreaView>
      </ScrollView>
      <View style={{flex: 1, padding: 20}}>
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
                  const components = {};
                  details.address_components.forEach(component => {
                    component.types.forEach(type => {
                      components[type] = component.long_name;
                    });
                  });
                  if (locationTriggeredBy === 'formModal') {
                    setInputValues(prev => ({
                      ...prev,
                      cityOrTown:
                        components.locality ||
                        components.postal_town ||
                        prev.cityOrTown,
                      country: components.country || prev.country,
                      pincode: components.postal_code || prev.pincode,
                      locationDescription: details.formatted_address,
                    }));
                  } else if (locationTriggeredBy === 'locationModal') {
                    setLocationInputValues(prev => ({
                      ...prev,
                      locality:
                        components.locality ||
                        components.sublocality ||
                        prev.locality,
                      cityOrTown:
                        components.locality ||
                        components.postal_town ||
                        prev.cityOrTown,
                      state:
                        components.administrative_area_level_1 || prev.state,
                      pincode: components.postal_code || prev.pincode,
                      country: components.country || prev.country,
                      locationDescription: details.formatted_address,
                    }));
                  }
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
        <Modal
          transparent={true}
          visible={isPreviewVisible}
          onRequestClose={() => setIsPreviewVisible(false)}>
          <TouchableOpacity
            style={style.modalOverlayImage}
            activeOpacity={1}
            onPress={() => setIsPreviewVisible(false)}>
            <View style={style.modalContentImage}>
              <TouchableOpacity
                style={style.closeButtonImageModel}
                onPress={() => setIsPreviewVisible(false)}>
                <Image
                  style={{height: 30, width: 30, tintColor: '#000'}}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
              <Image
                style={style.fullscreenImage}
                source={
                  previewImageUri
                    ? {uri: previewImageUri}
                    : require('../../../assets/NewNoImage.jpg')
                }
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
    },
    header: {
      marginTop: 15,
    },
    txt: {
      color: '#000',
      fontSize: 15,
      fontWeight: 'bold',
      marginHorizontal: 5,
    },
    imgContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 10,
      marginVertical: 10,
    },
    itemContainer: {
      marginBottom: 20,
    },
    image: {
      width: 100,
      height: 100,
      marginRight: 10,
    },
    buttonsContainer: {
      flexDirection: 'row',
      marginLeft: 'auto',
      marginRight: 5,
    },
    buttonIcon: {
      width: 30,
      height: 30,
      marginLeft: 13,
    },
    bottomContainer: {
      alignItems: 'flex-start',
      paddingVertical: 3,
      backgroundColor: '#faf7f6',
      alignSelf: 'center',
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },

    label1: {
      color: '#000',
      minWidth: 100, // Adjust width for alignment
    },

    label2: {
      color: '#000',
      minWidth: 100, // Adjust width for alignment
    },

    label3: {
      color: '#000',
      minWidth: 100, // Adjust width for alignment
    },

    colon: {
      marginLeft: 5, // Space between label and colon
    },

    value: {
      marginLeft: 5, // Space between colon and value
    },

    value2: {
      marginLeft: 5, // Space between colon and value
    },

    value3: {
      marginLeft: 5, // Space between colon and value
    },

    value: {
      marginLeft: 30,
      color: '#000',
      marginRight: 5,
    },
    value2: {
      marginLeft: 30,
      color: '#000',
      marginRight: 5,
    },
    value3: {
      marginLeft: 30,
      color: '#000',
      marginRight: 5,
    },
    dateIconContainer: {
      justifyContent: 'center',
      paddingLeft: 20,
      marginHorizontal: 15,
    },

    dateIcon: {
      height: 25,
      width: 25,
    },
    temDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    itemDetails: {
      flexDirection: 'row',
      marginHorizontal: 10,
      marginBottom: 10,
      alignItems: 'center',
    },
    quantityInputContainer: {
      // Fixed width to prevent expansion
      alignItems: 'center',
    },

    quantityInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      flex: 0.5,
    },
    separator: {
      borderBottomWidth: 1,
      borderColor: 'gray',
      marginTop: 4,
    },
    separatorr: {
      borderBottomWidth: 1,
      borderColor: 'gray',
      marginTop: 4,
      marginBottom: 14,
    },
    modalContainerrr: {
      flex: 1,
      alignItems: 'center',
      marginTop: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContentt: {
      marginHorizontal: 18,
      // backgroundColor: '#fff',
      // padding: 20,
      // borderRadius: 10,
      // width: '80%',
      // alignItems: 'center',
      // elevation: 5, // Add elevation for shadow on Android
      // top: 10,
    },
    modalContenttt: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
      elevation: 5, // Add elevation for shadow on Android
      top: 40,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      // marginBottom: 20,
      color: '#000',
    },
    input: {
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 5,
      padding: Platform.OS === 'ios' ? 15 : 10,
      marginBottom: Platform.OS === 'ios' ? 10 : 5,
      width: '100%',
    },
    errorBorder: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
    },
    saveButton: {
      backgroundColor: colors.color2,
      padding: 10,
      borderRadius: 5,
      marginTop: 20,
      width: '100%',
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    plusButton: {},
    noCategoriesText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#000',
      fontWeight: '600',
    },
    noResultsLocation: {
      textAlign: 'center',
      paddingTop: 15,
      fontSize: 16,
      color: '#000',
      fontWeight: '600',
      elevation: 5,
      height: 175,
      alignSelf: 'center',
      width: '85%',
      backgroundColor: '#fff',
      borderRadius: 10,
    },
    modalContainer: {
      flexGrow: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#fff',
      maxHeight: '70%', // Adjust as needed
    },
    modalText: {
      fontSize: 16,
      marginBottom: 10,
      marginLeft: 10,
    },
    addqtytxt: {
      color: 'black',
      fontWeight: 'bold',
      marginLeft: 10,
    },
    sizehead: {
      padding: 1,
      backgroundColor: '#E7E7E7',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    sizetxt: {
      flex: 0.6,
      color: '#000',
      fontWeight: 'bold',
      marginLeft: 5,
    },
    quantitytxt: {
      color: '#000',
      fontWeight: 'bold',
      flex: 0.2,
    },
    quantityqty: {
      color: '#000',
      fontWeight: 'bold',
      flex: 0.5,
    },
    rowContainer: {
      flexDirection: 'row',
      marginHorizontal: 10,
      marginBottom: 10,
      alignItems: 'center',
    },
    labelContainer: {
      flex: 0.4,
    },
    label: {
      color: '#000',
      fontWeight: 'bold',
    },
    copyButton: {
      position: 'absolute',
      right: 0,
    },
    copyImage: {
      height: 20,
      width: 18,
      marginHorizontal: 5,
    },
    inputContainer: {
      flex: 0.3,
    },
    priceContainer: {
      flex: 0.2,
      alignItems: 'flex-end',
      marginRight: 10,
    },
    underline: {
      borderBottomWidth: 1,
      borderBottomColor: 'gray',
    },
    addqtyhead: {
      backgroundColor: colors.color2,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },

    quantityInputformodel: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      flex: 0.5,
    },
    switchContainer: {
      paddingLeft: 10, // Add padding if you want some space from the left edge
      flexDirection: 'row',
      marginVertical: 5,
      alignItems: 'center',
    },
    scrollView: {
      minHeight: 100,
      maxHeight: 150,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 25,
      paddingLeft: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
      flex: 1,
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderRadius: 25,
      paddingHorizontal: 15,
      color: '#000',
      // backgroundColor: '#f1f1f1',
      marginRight: 10,
    },

    searchInputsearch: {
      height: 40,
      borderWidth: 1,
      margin: 5,
      borderRadius: 10,
      borderColor: '#ccc',
      paddingHorizontal: 10,
      marginBottom: 5,
      color: '#000',
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: '#e6e6e6',
      borderRadius: 15,
    },
    dropdownIcon: {
      width: 15,
      height: 15,
      tintColor: '#000',
    },
    searchButton: {
      backgroundColor: colors.color2,
      borderRadius: 25,
      paddingHorizontal: 20,
      paddingVertical: 10,
      elevation: 3,
    },
    searchButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    dropdownContent1: {
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      elevation: 5,
      paddingVertical: 10,
      paddingHorizontal: 5,
      zIndex: 1,
      alignSelf: 'center',
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginBottom: 8,
    },
    dropdownOption: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f1f1',
    },
    dropdownItemText: {
      color: '#000',
    },
    headerTxt: {
      marginVertical: 3,
      color: '#000',
    },
    container1: {
      marginBottom: 5,
      flexDirection: 'row',
      // marginTop: 20,
      alignItems: 'center',
      width: '100%',
    },
    container2: {
      justifyContent: 'flex-start',
      width: '100%',
    },
    container3: {
      width: '100%',
      height: 37,
      borderRadius: 10,
      borderWidth: 0.5,
      alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 15,
      paddingRight: 15,
    },
    container4: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '10%',
    },
    dropdownItem: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      borderBottomWidth: 0.5,
      borderColor: '#8e8e8e',
    },

    dropdownContainersstatus: {
      elevation: 5,
      height: 100,
      alignSelf: 'center',
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray',
      borderWidth: 1,
      marginTop: 5,
    },
    dropdownText: {
      fontWeight: '600',
      marginHorizontal: 15,
      color: '#000',
    },
    dropdownContentstate: {
      elevation: 5,
      // height: 220,
      alignSelf: 'center',
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginHorizontal: 10,
      marginVertical: 3,
    },
    modalOverlayImage: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContentImage: {
      width: '90%',
      height: '60%',
      backgroundColor: '#fff',
      borderRadius: 10,
      overflow: 'hidden',
    },
    fullscreenImage: {
      width: '100%',
      height: '100%',
    },
    closeButtonImageModel: {
      backgroundColor: colors.color2,
      borderRadius: 5,
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 2,
    },
  });
export default AddNewLocation;
