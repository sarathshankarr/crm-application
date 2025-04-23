import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  ScrollView,
  Keyboard,
  Alert,
  Switch,
  SafeAreaView,
  Modal,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import CheckBox from 'react-native-check-box';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatDateIntoDMY} from '../../Helper/Helper';
import CustomCheckBox from '../../components/CheckBox';
import { ColorContext } from '../../components/colortheme/colorTheme';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';


const NewCall = () => {
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

      setInputValues(prevValues => ({
        ...prevValues,
        locationLatLong: `${marker.latitude}, ${marker.longitude}`,
        // locationDescription: address,
      }));


      setErrorFields(prevErrors =>
        prevErrors.filter(field => field !== 'locationLatLong'),
      );
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
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isNavigatingToLocationModal, setIsNavigatingToLocationModal] =
    useState(false);
    
  const handlePickLocation = () => {
    setIsNavigatingToLocation(true);
    setLocationTriggeredBy('formModal');
    setIsModalVisible(false);

    setTimeout(() => {
      setIsLocationPickerVisible(true);
      getCurrentLocation();
    }, 100);
  };
  const { colors } = useContext(ColorContext);
  const styles = getStyles(colors);
  const route = useRoute();
  const userData = useSelector(state => state.loggedInUser);
  const userId=userData?.userId;

  const navigation = useNavigation();
  const callData = route.params?.call;
  console.log("callData==========>",callData)

  const {call} = route.params;
  const callId = route.params?.callId;
  const [isDatePickerVisibleUntil, setIsDatePickerVisibleUntil] =
    useState(false);
  const [selectedDateUntil, setSelectedDateUntil] = useState('Call Start Date');
  const [shipFromToClicked, setShipFromToClicked] = useState(false);
  const [shipFromToClickedUser, setShipFromToClickedUser] = useState(false);
  const [shipFromToClickedStatus, setShipFromToClickedStatus] = useState(false);
  const [selectedDropdownOption, setSelectedDropdownOption] = useState({
    label: '',
    value: '',
  });
  const [selectedUserOption, setSelectedUserOption] = useState('');
  const [selectedStatusOption, setSelectedStatusOption] = useState('');
  const [showDropdownRow, setShowDropdownRow] = useState(false);
  const [markHighPriority, setMarkHighPriority] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingg, setLoadingg] = useState(false);
  const [filteredCustomer, setFilteredCustomer] = useState([]);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
  const [shipFromToClickedCustomer, setShipFromToClickedCustomer] =
    useState(false);
  const [shipFromToClickedTime, setShipFromToClickedTime] = useState(false);
  const [selectedDropdownOptionTime, setSelectedDropdownOptionTime] =
    useState('');
  const [shipFromToClickedCallType, setShipFromToClickedCallType] =
    useState(false);
  const [selectedDropdownOptionCallType, setSelectedDropdownOptionCallType] =
    useState({
      label: '',
      value: '',
    });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [relatedTo, setRelatedTo] = useState('');
  const [agenda, setAgenda] = useState('');
  const [customers, setCustomers] = useState([]);
  const [callDescription, setCallDescription] = useState(
    callData ? callData.description : '',
  );
  
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loadinggg, setLoadinggg] = useState(false);
  const [distributor, setDistributor] = useState([]);
  const [filteredDistributor, setFilterdDistributor] = useState([]);
  const [shipFromToClickedDistributor, setShipFromToClickedDistributor] =
    useState(false);
  const [selectedDistributorOption, setSelectedDistributorOption] =
    useState(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState(null);

  const [customerLocations, setCustomerLocations] = useState([]);
  const [fromToClicked, setFromToClicked] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLocationId, setSelectedLocationiD] = useState('');
  const [showRemainder, setshowRemainder]=useState(true);
  const [filteredDropdownOptions, setFilteredDropdownOptions]=useState([
    {id:1 , label: '5 Mins', value: 5},
    {id:2 , label: '10 Mins', value: 10},
    {id:3 , label: '15 Mins', value: 15},
    {id:4 , label: '30 Mins', value: 30},
    {id:5 , label: '1 Hr', value: 60},
    {id:6 , label: '2 Hr', value: 120},
    {id:7 , label: '1 Day', value: 1440},
    {id:8 , label: '2 Day', value: 2880},
  ]);
  


  const [showFieldList, setShowFieldList] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [filteredFieldsList, setFilteredFieldsList] = useState([]);
  const [fieldsList, setfieldsList] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState();

  const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);


  const [distributors, setDistributors] = useState([]);
  const style = getStyles(colors);


  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedDistributorDetails, setSelectedDistributorDetails] =
    useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleSwitch = () => {
    setIsEnabled(previousState => {
      const newState = !previousState;
      console.log("isEnabled changing to:", newState); // Debugging log
      if (newState) {
        setSelectedCustomerDetails([]);
        setSelectedDistributorDetails([]);
      }
      return newState;
    });
  };
  
  // Log when isEnabled updates
  useEffect(() => {
    console.log("isEnabled changed:", isEnabled);
  }, [isEnabled]);
  
  
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
  
        if (newCustomer) {
          // Update the selected customer option and ID
          setSelectedCustomerOption(newCustomer.firstName);
          setSelectedCustomerId(newCustomer.customerId);
          setCustomers(prev => [...prev, newCustomer]); // Add new customer to list
  
          // Fetch and set locations for the new customer
          getCustomerLocations(newCustomer.customerId);
        }
  
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
  
        if (newDistributor) {
          // Update the dropdown and selection state
          setSelectedDistributorOption(newDistributor.distributorName);
          setSelectedDistributorId(newDistributor.id);
          setDistributor(prev => [...prev, newDistributor]); // Update the distributor list
  
          // Fetch locations for the new distributor
          getCustomerLocations(newDistributor.id);
        }
  
        // Close the modal
        setIsSaving(false);
        toggleModal();
      })
      .catch(error => {
        console.error('Error adding Distributor:', error);
        setIsSaving(false);
      });
  };

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
  const handleCloseModalDisRet = () => {
    setIsModalVisible(false);
    setInputValues([]); // Assuming inputValues should be an array too
    setErrorFields([]);
    setConfirmedLocation(null);
    setMarker(null);
    setAddress('');
  };

  const toggleModal = () => {
    setIsSaving(false);
    setIsModalVisible(!isModalVisible);
    setSelectedStatus('Active');
    if (!isModalVisible) {
      setSelectedState(null); // Reset selected state
      setSelectedStateId(null); // Reset selected stateId
    }
    // Reset error fields and input values when modal is closed
    if (isModalVisible) {
      setErrorFields([]);
      setInputValues({
        firstName: '',
        phoneNumber: '',
        cityOrTown: '',
        state: '',
        country: '',
        pincode: '',
        locationName: '',
        locationDescription: '',
        // Add other input fields if needed
      });
    }
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
  });

  const [errorFields, setErrorFields] = useState([]);


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


  const [selectedStatus, setSelectedStatus] = useState('Active'); // Default is 'Active'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(0);

  const [selectedStateId, setSelectedStateId] = useState(null); // Track only the stateId
  const [selectedState, setSelectedState] = useState(null); // Track the full state object
  const [states, setStates] = useState([]);
  const [showStateDropdown, setShowStateDropdown] = useState(false);


  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [filteredStates, setFilteredStates] = useState(states);


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
  const statusOptionss = [
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


  useEffect(() => {
    setSelectedLocation('Select');
    setCustomerLocations([]);
  }, [isEnabled]);

  const getCustomerLocations = async customerId => {
    if (!customerId) return;
  
    let customerType = isEnabled ? 1 : 3; // Retailer (1) or Distributor (3)
  
    const apiUrl = `${global?.userData?.productURL}${API.GET_CUSTOMER_LOCATION}/${customerId}/${customerType}/${companyId}`;
  
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
    
      console.log('Full API Response:', response);
    
      if (response.data.length > 0) {
        console.log('Fetched locations:', response.data);
        setCustomerLocations(response.data);
        setSelectedLocation(response.data[0].locationName);
        setSelectedLocationiD(response.data[0].locationId);
      } else {
        // console.warn(`No locations found for customerId: ${customerId}`);
        setCustomerLocations([]);
        setSelectedLocation('');
        setSelectedLocationiD('');
      }
    } catch (error) {
      console.error('Error fetching locations:', error?.response?.data || error);
      setCustomerLocations([]); // Ensure locations are reset on error
    }    
  };

  const getCustomersDetails = () => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_CUSTOMER_LIST}/${companyId}`;
    setLoadingg(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const customerList = response?.data?.response?.customerList || [];
        setCustomers(customerList);
        setFilteredCustomer(customerList);
        setLoadingg(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoadingg(false);
      });
  };

  const getDistributorsDetails = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTORS_DETAILS}/${companyId}`;
    setLoadinggg(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const distributorList = response?.data?.response?.distributorList || [];
        setDistributor(distributorList);
        setFilterdDistributor(distributorList);
        setLoadinggg(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoadinggg(false);
      });
  };
  const getFieldsList = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_Fields_List}`;
    setLoadinggg(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const FieldList = response.data || [];
        setfieldsList(FieldList);
        setFilteredFieldsList(FieldList);
        setLoadinggg(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoadinggg(false);
      });
  };

  const handleFromDropdownClick = () => {
    setFromToClicked(!fromToClicked);
    if (!fromToClicked) {
      getCustomerLocations();
    }
  };
  const handleLocationSelection = location => {
    // Check if the same location is selected again
    if (selectedLocationId === location.locationId) {
      // Reset selections if the same location is selected
      setSelectedLocation(''); // Reset location name
      setSelectedLocationiD(null); // Reset location ID
    } else {
      // Set selections for a new location
      setSelectedLocation(location.locationName); // Set location name
      setSelectedLocationiD(location.locationId); // Set location ID
    }
    // Optionally close the dropdown after selection
    setFromToClicked(false);
  };

  const handleShipDropdownClick = () => {
    setShipFromToClicked(!shipFromToClicked);
    if (!shipFromToClicked) {
      getCustomerLocations();
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

  const handleSearchCustomer = text => {
    const filtered = customers?.filter(customer =>
      customer?.firstName?.toLowerCase().includes(text?.toLowerCase()),
    );
    setFilteredCustomer(filtered);
  };

  const handlefilterfields = text => {
    const filtered = fieldsList?.filter(field =>
      field?.fieldName?.toLowerCase().includes(text?.toLowerCase()),
    );
    setFilteredFieldsList(filtered);
  };

  const handleShipDropdownClickCustomer = () => {
    if (!shipFromToClickedCustomer) {
      getCustomersDetails(); // Fetch data only when opening dropdown
    }
    setShipFromToClickedCustomer(prevState => !prevState);
  };
  
  
  const handledropdownField = () => {
    // if (!showFieldList) {
    //   if (customers.length === 0) {
    //     getFieldList();
    //   }
    // }
    setShowFieldList(!showFieldList);
  };

  // const handleDropdownSelectCustomer = customer => {
  //   if (selectedCustomerId === customer.customerId) {
  //     setSelectedCustomerOption(''); // Reset customer option
  //     setSelectedCustomerId(null); // Reset customer ID
  //   } else {
  //     setSelectedCustomerOption(customer.firstName); // Set customer option
  //     setSelectedCustomerId(customer.customerId); // Set customer ID
  //   }
  //   setShipFromToClickedCustomer(false); // Close Customer dropdown after selection (optional)
  // };
  


  const handleDropdownSelectCustomer = customer => {
    console.log('Selected customer object:', customer); // Debugging log
  
    if (!customer?.customerId) {
      console.error('Invalid customer object:', customer);
      return; // Exit if customer object is not valid
    }
  
    if (selectedCustomerId === customer.customerId) {
      setSelectedCustomerOption('');
      setSelectedCustomerId(null);
      setSelectedLocation('');
      setSelectedLocationiD('');
      setSelectedCustomerDetails([]);
      setCustomerLocations([]); // Reset locations when customer is deselected
    } else {
      setSelectedCustomerOption(customer.firstName || '');
      setSelectedCustomerId(customer.customerId); // Ensure using correct ID field
      setSelectedLocation('');
      setSelectedLocationiD('');
  
      console.log('Fetching customer locations for customerId:', customer.customerId);
      getCustomerLocations(customer.customerId); // Fetch locations
    }
  
    setShipFromToClickedCustomer(false);
  };
  
  // Automatically set the first available location when locations are fetched
  useEffect(() => {
    if (selectedCustomerId && customerLocations.length > 0) {
      console.log('Automatically setting first location:', customerLocations[0]);
      setSelectedLocation(customerLocations[0].locationName);
      setSelectedLocationiD(customerLocations[0].locationId);
    }
  }, [selectedCustomerId, customerLocations]);
  

  const handleShipDropdownClickDistributor = () => {
    if (!shipFromToClickedDistributor) {
      getDistributorsDetails(); // Fetch data every time dropdown opens
    }
    setShipFromToClickedDistributor(!shipFromToClickedDistributor);
  };
  
  const handleSearchDistributor = text => {
    // const filtered = distributor.filter(distributor =>
    //   distributor?.firstName?.toLowerCase()?.includes(text?.toLowerCase()),
    // );

    // setFilterdDistributor(filtered);

    if (text.trim().length > 0) {
      const filtered = distributor?.filter(distributor =>
        distributor?.firstName?.toLowerCase()?.includes(text?.toLowerCase()),
      );
      setFilterdDistributor(filtered);
    } else {
      setFilterdDistributor(distributor);
    }
  };




  const handleSelectField = field => {
    if (selectedFieldId === field.id) {
      setSelectedField('');
      setSelectedFieldId(null);
    } else {
      setSelectedField(field.fieldName);
      setSelectedFieldId(field.id);
    }
    setShowFieldList(false);
  };

  // const handleDropdownSelectDistributor = distributor => {
  //   if (selectedDistributorId === distributor.id) {
  //     setSelectedDistributorOption(''); // Reset distributor option
  //     setSelectedDistributorId(null); // Reset distributor ID
  //   } else {
  //     setSelectedDistributorOption(distributor.firstName); // Set distributor option
  //     setSelectedDistributorId(distributor.id); // Set distributor ID
  //   }
  //   setShipFromToClickedDistributor(false); // Close Distributor dropdown after selection (optional)
  // };

  

  const handleDropdownSelectDistributor = distributor => {
    if (selectedDistributorId === distributor.id) {
      setSelectedDistributorOption('');
      setSelectedDistributorId(null);
      setSelectedDistributorOption('');
      setSelectedLocation('');
      setSelectedLocationiD('');
      setSelectedDistributorDetails([]);
      setCustomerLocations([]); // Reset locations when distributor is deselected
    } else {
      setSelectedDistributorOption(distributor.firstName);
      setSelectedDistributorId(distributor.id);
      setSelectedDistributorOption(`${distributor.firstName}`);
      setSelectedLocation('');
      setSelectedLocationiD('');
  
      console.log('Fetching distributor locations for customerId:', distributor.id);
      getCustomerLocations(distributor.id); // Fetch locations first
    }
    setShipFromToClickedDistributor(false);
  };


  
  useEffect(() => {
    if (selectedDistributorId && customerLocations.length > 0) {
      console.log('Automatically setting first location:', customerLocations[0]);
      setSelectedLocation(customerLocations[0].locationName);
      setSelectedLocationiD(customerLocations[0].locationId);
    }
  }, [selectedDistributorId, customerLocations]); // Ensure both dependencies are watched
  
  
  

  useEffect(() => {
    if (route.params && route.params.task) {
      const {task} = route.params;
      // Populate state with task details if available
      setTaskName(task.taskName || '');
      setRelatedTo(task.relatedTo || '');
      setDesc(task.desc || '');
      setSelectedUserId(task.assign_to || null);
      setSelectedUserName(task.userName || '');
      setSelectedStatusOption(task.status || '');
      setSelectedCustomerOption(task.customer);
      setSelectedCustomerId(task.customerId);
      getdueDate(task.dueDate);
      getuntilDate(task.untilDate);
      getTaskRepeatRem(task.repeatRem);
      task.priority && setMarkHighPriority(true);
      task?.customerType && task?.customerType === 1
        ? setIsEnabled(true)
        : setIsEnabled(false);

      setIsDropdownDisabled(task.status === 'Completed');
    }
  }, [route.params]);

  // const getNameAndLocation = useCallback(
    
  //   async (
  //     call_customerType,
  //     call_customerId,
  //     call_locId,
  //     call_locationName,
  //   ) => {
  //     console.log(
  //       "Inside getNameAndLocation, received params:",
  //       call_customerType,
  //     call_customerId,
  //     call_locId,
  //     call_locationName,
  //     );
  //     if (call_customerType && call_customerType === 1) {
  //       setIsEnabled(true);

  //       if (call_customerId) {
  //         setSelectedCustomerId(call_customerId);
  //       }
  //       if (customers.length === 0) {
  //         await getCustomersDetails();
  //       }
  //       let foundItem = customers?.find(
  //         item => item?.customerId === call_customerId,
  //       );
  //       if (foundItem) {
  //         setSelectedCustomerOption(foundItem.firstName);
  //       }
  //     } else {

  //       if (call_customerId) {
  //         setSelectedDistributorId(call_customerId);
  //       }
  //       if (distributor.length === 0) {
  //         await getDistributorsDetails();
  //       }
  //       let foundItem = distributor?.find(item => item?.id === call_customerId);
  //       if (foundItem) {
  //         setSelectedDistributorOption(foundItem.firstName);
  //       }
  //     }

  //     if (call_locId) {
  //       setSelectedLocationiD(call_locId);
  //       await getCustomerLocations();
  //       let foundItem = customerLocations?.find(
  //         item => item.locationId === call_locId,
  //       );
  //       if (foundItem) {
  //         setSelectedLocation(foundItem.locationName);
  //       }
  //     } else if (call_locationName) {
  //       setSelectedLocation(call_locationName);
  //     }
  //   },
  //   [customers, distributor, customerLocations],
  // );

  const getNameAndLocation = useCallback(
    async (call_customerType, call_customerId, call_locId, call_locationName) => {
      console.log(
        "Inside getNameAndLocation, received params:",
        call_customerType, call_customerId, call_locId, call_locationName
      );
  
      if (call_customerType && call_customerType === 1) {
        setIsEnabled(true);
  
        if (call_customerId) {
          setSelectedCustomerId(call_customerId);
        }
        if (customers.length === 0) {
          await getCustomersDetails();
        }
  
        let foundCustomer = customers?.find(item => item?.customerId === call_customerId);
        if (foundCustomer) {
          setSelectedCustomerOption(foundCustomer.firstName);
        }
      } else {
        if (call_customerId) {
          setSelectedDistributorId(call_customerId);
        }
        if (distributor.length === 0) {
          await getDistributorsDetails();
        }
  
        let foundDistributor = distributor?.find(item => item?.id === call_customerId);
        if (foundDistributor) {
          setSelectedDistributorOption(foundDistributor.firstName);
        }
      }
  
      if (call_locId) {
        setSelectedLocationiD(call_locId);
        
        console.log("Fetching locations for customerId:", call_customerId);
        
        const locations = await getCustomerLocations(call_customerId); // Ensure locations are fetched
      
        if (!locations || locations.length === 0) {
          // console.warn(`No locations found for customerId: ${call_customerId}`);
          return;
        }
      
        let foundLocation = locations.find(
          item => Number(item.locationId) === Number(call_locId)
        );
      
        if (foundLocation) {
          console.log("Location found:", foundLocation);
          setSelectedLocation(foundLocation.locationName);
        } else {
          // console.warn(`Location ID ${call_locId} not found in updated list`, locations);
        }
      }
      
    },
    [customers, distributor] // Removed `customerLocations` to avoid unnecessary re-renders
  );
  
  useEffect(() => {
    if (selectedLocationId && customerLocations.length > 0) {
      let foundLocation = customerLocations.find(
        item => Number(item.locationId) === Number(selectedLocationId) // Ensure same type
      );
  
      if (foundLocation) {
        console.log("Updated selected location from new data:", foundLocation);
        setSelectedLocation(foundLocation.locationName);
      } else {
        // console.warn(`Location ID ${selectedLocationId} not found in updated list`, customerLocations);
      }
    }
  }, [customerLocations, selectedLocationId]);

  useEffect(() => {
    setSelectedLocation('Select');
    setCustomerLocations([]);
  }, [isEnabled]);

 
  useEffect(() => {
    if (route.params && route.params.call) {
      const {call} = route.params;
      setRelatedTo(call.relatedTo || '');
      setSelectedUserId(call.userId);
      setAgenda(call.agenda || '');
      // setSelectedUserOption(call.userName);
      setSelectedStatusOption(call.status);
      // setSelectedUserName(call.userName);
      call.startTime && setSelectedDropdownOptionTime(call?.startTime);
      setMarkHighPriority(call.markHighPriority);
      getDateFromCall(call.startDate);
      getRemainder(call.remTime);

      if(call?.startDate && call?.startTime){
        getTimeDiffandRemainder(call?.startDate, call?.startTime);
      }

      call.callType &&
        setSelectedDropdownOptionCallType(CallType[call.callType - 1]);
    }
  }, [route.params]);

  const getDateFromCall = date => {
    if (!date) return;
    const formattedDate = date.split('T')[0];
    setSelectedDateUntil(formattedDate);
  };

  const getTimeDiffandRemainder=(date, time)=>{
    minutesBetweenDates(date.split('T')[0], time);
  }

  const getRemainder = time => {
    if (!time) return;
    setShowDropdownRow(true);
    // setshowRemainder(true);
    setSelectedDropdownOption(dropdownOptions[time-1]);
  };

  const getUserRole = async role => {
    if (users.length === 0) {
      await getUsers();
    }

    let foundItem = await users?.find(item => item.userId === role);
    if (foundItem) {
      setSelectedUserOption(foundItem?.firstName);
    }
  };



  useEffect(() => {
    if (route.params && route.params.call) {
      const {call} = route.params;
      getUserRole(call.assignTo);
      getNameAndLocation(
        call.customerType,
        call.customerId,
        call.locId,
        call.locationName,
        call.userId,
        call.userName,
        call.remTime
      );
    }
  }, [route.params, users, customers, distributor]);

  // useEffect(() => {
  //   const keyboardDidShowListener = Keyboard.addListener(
  //     'keyboardDidShow',
  //     event => {
  //       setKeyboardSpace(event.endCoordinates.height);
  //     },
  //   );

  //   const keyboardDidHideListener = Keyboard.addListener(
  //     'keyboardDidHide',
  //     () => {
  //       setKeyboardSpace(0);
  //     },
  //   );

  //   return () => {
  //     keyboardDidShowListener.remove();
  //     keyboardDidHideListener.remove();
  //   };
  // }, []);

  const handleShipDropdownClickCallType = () => {
    setShipFromToClickedCallType(!shipFromToClickedCallType);
    setShipFromToClicked(false);
    setShipFromToClickedUser(false);
    setShipFromToClickedStatus(false);
  };




  


 
  

  useEffect(() => {
    if (users.length === 0) {
      getUsers();
    }
    if (customers.length == 0) {
      getCustomersDetails();
    }
    if (distributor.length === 0) {
      getDistributorsDetails();
    }
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShipDropdownClickk = () => {
    setShipFromToClicked(!shipFromToClicked);
    setShipFromToClickedUser(false); // Close User dropdown if open
    setShipFromToClickedStatus(false); // Close Status dropdown if open
  };

  const handleShipDropdownClickUser = () => {
    setShipFromToClickedUser(!shipFromToClickedUser);
    setShipFromToClicked(false); // Close main dropdown if open
    setShipFromToClickedStatus(false); // Close Status dropdown if open
  };

  const handleShipDropdownClickStatus = () => {
    setShipFromToClickedStatus(!shipFromToClickedStatus);
    setShipFromToClicked(false); // Close main dropdown if open
    setShipFromToClickedUser(false); // Close User dropdown if open
  };

  const handleCheckboxChange = () => {
    setShowDropdownRow(!showDropdownRow);
  };

  // const getUsers = () => {
  //   setLoading(true);
  //   const apiUrl = `${global?.userData?.productURL}${API.ADD_USERSDECS}`;
  //   axios
  //     .get(apiUrl, {
  //       headers: {
  //         Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //       },
  //     })
  //     .then(response => {
  //       if (
  //         response.data &&
  //         response.data.status &&
  //         response.data.status.success
  //       ) {
  //         setUsers(response.data.response.users);
  //         setFilteredUsers(response.data.response.users); // Initialize filtered users
  //       } else {
  //         console.error('Error fetching users:', response.data);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error fetching users:', error);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };


  const getUsers = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ADD_USERSDECS}`;
    
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        if (response.data?.status?.success) {
          const users = response.data.response.users;
          setUsers(users);
  
          // Apply filtering logic
          const filteredUsers = users.filter(u => ("," + u.companyId + ",").includes("," + companyId + ","));
          setFilteredUsers(filteredUsers);
          
          // console.log("Filtered Users ======>", filteredUsers);
        } else {
          console.error('Error fetching users:', response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDropdownSelectUser = (user) => {
    // If a user is already assigned and the same user is selected again
    if (selectedUserId === user.userId) {
      // Reset selections if the same user is selected
      setSelectedUserOption(''); // Reset user option
      setSelectedUserId(null); // Reset user ID
      setSelectedUserName(''); // Reset user name
      setSelectedStatusOption(''); // Reset status option
    } else {
      // Set selections for a new user
      setSelectedUserOption(user.firstName); // Set user option
      setSelectedUserId(user.userId); // Set user ID
      setSelectedUserName(user.firstName); // Set user name
      setSelectedStatusOption('Assigned'); // Set status to Assigned
    }
    // Optionally close the dropdown after selection
    setShipFromToClickedUser(false);
  };
  
  
  // Initializing state to avoid undefined values
  useEffect(() => {
    if (callData) {
      // Ensure state reflects the initial assignment
      setSelectedUserId(callData.assignTo || null);
      // Add additional state setup if needed
    }
  }, [callData]);
  

  const handleDropdownSelectStatus = (option) => {
    if (selectedStatusOption === option) {
      setSelectedStatusOption(''); // Reset status option
    } else {
      setSelectedStatusOption(option); // Set status option
    }
    setShipFromToClickedStatus(false);
  };

  const handleShipDropdownClickTime = () => {
    setShipFromToClickedTime(!shipFromToClickedTime);
    setShipFromToClicked(false);
    setShipFromToClickedUser(false);
    setShipFromToClickedStatus(false); // Close Status dropdown if open
  };

  const showDatePickerUntil = () => {
    setIsDatePickerVisibleUntil(true);
  };

  const hideDatePickerUntil = () => {
    setIsDatePickerVisibleUntil(false);
  };


  const handleDropdownSelectTime = option => {
    if(selectedDateUntil!=='Call Start Date'){
      minutesBetweenDates (selectedDateUntil ,option)
    }
    setSelectedDropdownOptionTime(option);
    setShipFromToClickedTime(false);
  };

  const handleDateConfirmUntil = date => {
    const formattedDate = date.toISOString().split('T')[0]; // Formats date to "YYYY-MM-DD"
    setSelectedDateUntil(formattedDate); // Set the state without additional text
    hideDatePickerUntil();
    

    if(selectedDropdownOptionTime!=='Call Start Time' &&  selectedDropdownOptionTime?.length>0){
      minutesBetweenDates (formattedDate, selectedDropdownOptionTime);
    }else{
      const defaultTime='11:59 PM'
      minutesBetweenDates (formattedDate, defaultTime);
    }

  };


  const handleSearch = text => {
    if (text.trim().length > 0) {
      const filtered = users.filter(user =>
        user.firstName.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  const dropdownOptionsTime = [
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:30 PM',
    '09:00 PM',
    '09:30 PM',
    '10:00 PM',
    '10:30 PM',
    '11:00 PM',
    '11:30 PM',
    '12:00 AM',
    '12:30 AM',
    '01:00 AM',
    '01:30 AM',
    '02:00 AM',
    '02:30 AM',
    '03:00 AM',
    '03:30 AM',
    '04:00 AM',
    '04:30 AM',
    '05:00 AM',
    '05:30 AM',
    '06:00 AM',
    '06:30 AM',
    '07:00 AM',
    '07:30 AM',
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
  ];
  const CallType = [
    {label: 'Outbond', value: '1'},
    {label: 'Inbound', value: '2'},
  ];
  const handleDropdownSelectCallType = option => {
    setSelectedDropdownOptionCallType(option);
    setShipFromToClickedCallType(false);
  };

  const dropdownOptions = [
    {id:1 , label: '5 Mins', value: 5},
    {id:2 , label: '10 Mins', value: 10},
    {id:3 , label: '15 Mins', value: 15},
    {id:4 , label: '30 Mins', value: 30},
    {id:5 , label: '1 Hr', value: 60},
    {id:6 , label: '2 Hr', value: 120},
    {id:7 , label: '1 Day', value: 1440},
    {id:8 , label: '2 Day', value: 2880},
  ];
  const handleDropdownSelect = option => {
    setSelectedDropdownOption(option);
    setShipFromToClicked(false); // Close dropdown after selection (optional)
  };
  // const statusOptions = [
  //   'Open',
  //   'Pending',
  //   'Assigned',
  //   'In Progress',
  //   'Completed',
  // ];

  const [statusOptions, setStatusOptions] = useState([]);
  
  const getStatusOption = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.STATUS_OPTION}/${companyId}`;
  
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        if (Array.isArray(response?.data)) {
          // Extract only the 'stts' field
          const statusList = response.data.map(item => item.stts.trim()); 
          setStatusOptions(statusList);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  useEffect(() => {
    getStatusOption();
  }, []);
  
  const handleSave = () => {
    if (!relatedTo.trim()) {
      Alert.alert('Alert', 'Please fill in all mandatory fields');
      return; // Exit the function early if any mandatory field is empty
    }

    if(showDropdownRow && (selectedDropdownOption?.label.length===0 || !selectedDropdownOption) ){
      Alert.alert('Alert', 'Please select before start time as u checked reminder');
      return; // Exit the function early if any mandatory field is empty
    }

    if (isButtonDisabled) return;
    setIsButtonDisabled(true);

    const formatCreatedOn = createdOnDate => {
      const date = new Date(createdOnDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const switchStatus = isEnabled; // Assuming isEnabled controls the switch
    const customerType = switchStatus ? 1 : 0; // 1 for Retailer, 3 for Distributor
    const customerId = switchStatus
      ? selectedCustomerId
      : selectedDistributorId;

    const customeroption = switchStatus
      ? selectedCustomerOption
      : selectedDistributorOption;

    const requestData = {
      id: callData ? callData.id : 0,
      customerId: customerId || null,
      startDate:
        selectedDateUntil !== 'Call Start Date'
          ? selectedDateUntil
          : callData?.startDate,
      startTime: selectedDropdownOptionTime || callData?.startTime,
      remTime: showDropdownRow && showRemainder
        ? selectedDropdownOption.id || callData?.remTime
        : null,
      callType: selectedDropdownOptionCallType.value || callData?.callType,
      relatedTo: relatedTo || callData?.relatedTo,
      agenda: agenda || callData?.agenda,
      t_company_id: companyId,
      customer: customeroption || callData?.customer,
      duration: callData?.duration || '',
      assignTo: selectedUserId || callData?.assignTo,
      status: selectedStatusOption || callData?.status,
      userName: selectedUserName || callData?.userName,
      created_on: callData?.created_on || new Date(),
      locId: selectedLocationId,
      assign_by: userData.userId,
      customerType: customerType,
      companyId:companyId,
      userId:userId,
      type: 2,
      created_by:callData?.created_by

    };
     console.log('requestData======>', requestData);

    axios
      .post(global?.userData?.productURL + API.ADD_NEW_CALL, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        navigation.goBack();
      })
      .catch(error => {
        console.error('Error adding Call:', error);
      })
      .finally(() => {
        setIsButtonDisabled(false); // Re-enable button after the process completes
      });
  };

  const renderCustomerDetails = () => (
    <View style={{}}>
      <Text style={{marginHorizontal: 10, marginVertical: 5, color: '#000'}}>
        Retailer
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>

      <TouchableOpacity
        onPress={handleShipDropdownClickCustomer}
        style={[styles.dropdownButton, { flex: 0.8 }]}>
        <Text style={{color: '#000'}}>
          {selectedCustomerOption || 'Select '}
        </Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleModal} style={[styles.plusButton, { flex: 0.2 }]}>
        <Image
          style={{ height: 30, width: 30 }}
          source={require('../../../assets/plus.png')}
        />
      </TouchableOpacity>
      </View>

      {shipFromToClickedCustomer.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        shipFromToClickedCustomer && (
          <View style={styles.dropdownContent1}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name..."
              onChangeText={handleSearchCustomer}
              placeholderTextColor="#000"
            />
            <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
              {(filteredCustomer.length === 0 || (filteredCustomer.length===1 && !filteredCustomer[0])) ? (
                <Text style={styles.noCategoriesText}>
                  Sorry, no results found!
                </Text>
              ) : (
                filteredCustomer?.map((customer, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDropdownSelectCustomer(customer)}
                    style={styles.dropdownOption}>
                    <Text style={{color: '#000'}}>{customer?.firstName}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )
      )}
    </View>
  );

  const renderDistributorDetails = () => (
    <View style={{}}>
      <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
        Distributor
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>

      <TouchableOpacity
        onPress={handleShipDropdownClickDistributor}
        style={[styles.dropdownButton, { flex: 0.8 }]}>
        <Text style={{color: '#000'}}>
          {selectedDistributorOption || 'Select'}
        </Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleModal} style={[styles.plusButton, { flex: 0.2 }]}>
        <Image
          style={{ height: 30, width: 30 }}
          source={require('../../../assets/plus.png')}
        />
      </TouchableOpacity>
      </View>

      {shipFromToClickedDistributor && (
        <View style={styles.dropdownContent1}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            onChangeText={handleSearchDistributor}
            placeholderTextColor="#000"
          />
          <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            {(filteredDistributor.length === 0 || (filteredDistributor.length===1 && !filteredDistributor[0])) ? (
              <Text style={styles.noCategoriesText}>
                Sorry, no results found!
              </Text>
            ) : (
              filteredDistributor?.map((distributor, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDropdownSelectDistributor(distributor)}
                  style={styles.dropdownOption}>
                  <Text style={{color: '#000'}}>{distributor?.firstName}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );


    function minutesBetweenDates(currentDate, selectedTime) {
  // Helper function to parse time in HH:MM AM/PM format
  function parseTime(timeStr) {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return { hours, minutes };
  }

  // Function to get the current time in IST
  function getISTDate() {
      const utcNow = new Date();
      const offset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
      return new Date(utcNow.getTime() + offset);
  }

  // Get the current date and time in IST
  const now = getISTDate();

  // Parse the current date
  const [year, month, day] = currentDate.split('-').map(Number);

  // Parse the selected time
  const { hours: selectedHours, minutes: selectedMinutes } = parseTime(selectedTime);

  // Create a Date object for the selected time with the provided date in IST
  const selectedDateTime = new Date(year, month - 1, day, selectedHours, selectedMinutes);

  // Convert both now and selectedDateTime to UTC for accurate comparison
  const nowUTC = new Date(now.toISOString());
  const selectedDateTimeUTC = new Date(Date.UTC(year, month - 1, day, selectedHours, selectedMinutes));

  // Calculate the difference in milliseconds
  const diffInMs = selectedDateTimeUTC - nowUTC;

  // Convert the difference to minutes
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));


    const filteredOptions = dropdownOptions.filter(o => o.value <= diffInMinutes);

        // Update the state or data source for the dropdown options
        setFilteredDropdownOptions(filteredOptions);

        if (diffInMinutes < 5) {
            setshowRemainder(false);
        } else {
          setshowRemainder(true);
        }
    }
  return (
    <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}> 
   <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            style={{height: 25, width: 25}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>New Call</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleSave}
          disabled={isButtonDisabled}>
          <Text style={styles.addButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>
    <ScrollView  style={{flex:1, backgroundColor:'#ffffff'}}>

    <View style={{flex: 1, backgroundColor: '#fff'}}>
   

      <View style={styles.section}>
        <Text style={styles.sectionText}>Basic Info</Text>
      </View>
      <View style={styles.switchContainer}>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <Text style={{fontWeight: 'bold', fontSize: 15, color: '#000'}}>
          Slide For Retailer
        </Text>
      </View>

      {isEnabled ? renderCustomerDetails() : renderDistributorDetails()}
      <Text style={{marginHorizontal: 10, marginVertical: 5, color: '#000'}}>
        Location
      </Text>
      <TouchableOpacity
        onPress={handleFromDropdownClick}
        style={styles.dropdownButton}>
        <Text style={{color: '#000'}}>
          {selectedLocation.length > 0 ? `${selectedLocation}` : 'Location'}
        </Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>
      {fromToClicked && (
        <View style={styles.dropdownContent1}>
          <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            {customerLocations.length === 0 ? (
              <Text style={styles.noCategoriesText}>
                Sorry, no results found!
              </Text>
            ) : (
              customerLocations.map(location => (
                <TouchableOpacity
                  style={styles.dropdownOption}
                  key={location.locationId}
                  onPress={() => handleLocationSelection(location)}>
                  <Text style={{color: '#000'}}>{location.locationName}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
      <Text style={{marginHorizontal: 10, marginVertical: 5, color: '#000'}}>
      Assign to
      </Text>

      <TouchableOpacity
        onPress={handleShipDropdownClickUser}
        style={{
          height: 35,
          borderRadius: 10,
          borderWidth: 0.5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: 15,
          paddingRight: 15,
          marginHorizontal: 10,
        }}>
        <Text style={{color: '#000'}}>{selectedUserOption || 'Users'}</Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>

      {shipFromToClickedUser && (
        <View style={styles.dropdownContent1}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            onChangeText={handleSearch}
            placeholderTextColor="#000"
          />
          <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            {filteredUsers.length === 0 ? (
              <Text style={styles.noCategoriesText}>
                Sorry, no results found!
              </Text>
            ) : (
              filteredUsers.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => handleDropdownSelectUser(user)}>
                  <Text style={{color: '#000'}}>{user.firstName}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
      <Text style={{marginHorizontal: 10, marginVertical: 5, color: '#000'}}>
        Related To *
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Related To *"
          placeholderTextColor="#000"
          value={relatedTo}
          onChangeText={setRelatedTo}
        />
      </View>
      <Text style={{marginHorizontal: 10, marginVertical: 5, color: '#000'}}>
        Call Agenda
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Call Agenda"
          placeholderTextColor="#000"
          value={agenda}
          onChangeText={setAgenda}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text
          style={{
            marginHorizontal: 10,
            marginVertical: 5,
            flex: 1,
            textAlign: 'left',
            color: '#000',
          }}>
          Call Start Date
        </Text>
        <Text
          style={{
            marginHorizontal: 20,
            marginVertical: 5,
            flex: 1,
            textAlign: 'right',
            color: '#000',
          }}>
          Call Start Time
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity
          onPress={showDatePickerUntil}
          style={{
            flex: 1,
            height: 35,
            borderRadius: 10,
            borderWidth: 0.5,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 15,
            paddingRight: 15,
            marginHorizontal: 10,
          }}>
          <Text style={{color: '#000'}}>
            {selectedDateUntil === 'Call Start Date'
              ? selectedDateUntil
              : formatDateIntoDMY(selectedDateUntil)}
          </Text>
          <Image
            style={styles.dateIcon}
            source={require('../../../assets/date.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShipDropdownClickTime}
          style={{
            flex: 1,
            height: 35,
            borderRadius: 10,
            borderWidth: 0.5,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 15,
            paddingRight: 15,
            marginHorizontal: 10,
          }}>
          <Text style={{color: '#000'}}>
            {selectedDropdownOptionTime || 'Call Start Time'}
          </Text>
          <Image
            source={require('../../../assets/dropdown.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
      </View>

      {shipFromToClickedTime && (
          <View style={styles.dropdownContent1}>
        <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            {dropdownOptionsTime.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownOption}
                onPress={() => handleDropdownSelectTime(option)}>
                <Text style={{color: '#000'}}>{option}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
          </View>
      )}
      
     { showRemainder &&
      <View
        style={{
          marginHorizontal: 10,
          marginVertical: 5,
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 10,
        }}>
        <CustomCheckBox
          isChecked={showDropdownRow}
          onToggle={handleCheckboxChange}
        />
        {/* <CheckBox isChecked={showDropdownRow} onClick={handleCheckboxChange} /> */}
        <Text style={{marginLeft: 5, color: '#000'}}>Remainder</Text>
      </View>
       } 
      {showDropdownRow  && showRemainder && (
        <View>
          <Text
            style={{marginHorizontal: 10, marginVertical: 5, color: '#000'}}>
            before start time
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 10,
            }}>
            <TouchableOpacity
              onPress={handleShipDropdownClickk}
              style={{
                flex: 1,
                height: 35,
                borderRadius: 10,
                borderWidth: 0.5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingLeft: 15,
                paddingRight: 15,
              }}>
              <Text style={{color:"#000"}}>
                {selectedDropdownOption?.label || 'before start time'}
              </Text>
              <Image
                source={require('../../../assets/dropdown.png')}
                style={{width: 20, height: 20}}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {shipFromToClicked && (
          <View style={styles.dropdownContent1}>
        <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            {filteredDropdownOptions.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={styles.dropdownOption}
                onPress={() => handleDropdownSelect(option) }>
                <Text style={{color:'#000'}}>{option.label}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
          </View>
      )}
      <Text style={{marginHorizontal: 10, marginVertical: 5, color: '#000'}}>
        Call Type
      </Text>
      <TouchableOpacity
        onPress={handleShipDropdownClickCallType}
        style={{
          height: 35,
          borderRadius: 10,
          borderWidth: 0.5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: 15,
          paddingRight: 15,
          marginHorizontal: 10,
        }}>
        <Text style={{color: '#000'}}>
          {selectedDropdownOptionCallType.label || 'Call Type'}
        </Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>
      {shipFromToClickedCallType && (
        <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
          <View style={{ elevation: 5,
                     // maxHeight: 450,
                     alignSelf: 'center',
                     width: '90%',
                     backgroundColor: '#fff',
                     borderRadius: 10,}}>
            {CallType.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={styles.dropdownOption}
                onPress={() => handleDropdownSelectCallType(option)}>
                <Text style={{color: '#000'}}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      <Text style={{marginHorizontal: 10, marginVertical: 5, color: '#000'}}>
        Status
      </Text>
      <TouchableOpacity
        onPress={handleShipDropdownClickStatus}
        style={{
          height: 35,
          borderRadius: 10,
          borderWidth: 0.5,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: 15,
          paddingRight: 15,
          marginHorizontal: 10,
        }}>
        <Text style={{color: '#000'}}>{selectedStatusOption || 'Status'}</Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>

      {shipFromToClickedStatus && (
            <View style={styles.dropdownContent1}>
          <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>

            {statusOptions.map((option, index) => (
              <TouchableOpacity
              key={index}
              style={styles.dropdownOption}
              onPress={() => handleDropdownSelectStatus(option)}>
                <Text style={{color: '#000'}}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
            </View>
      )}

      <View style={{marginBottom:50}}/>

      <DateTimePickerModal
        isVisible={isDatePickerVisibleUntil}
        mode="date"
        onConfirm={handleDateConfirmUntil}
        onCancel={hideDatePickerUntil}
      />
    </View>
    <Modal
              animationType="fade"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={() => {
                toggleModal();
              }}>
              <View style={style.modalContainerr}>
                <View style={style.modalContentt}>
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
                        style.inputt,
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
                        style.inputt,
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
                      style={[style.inputt, {color: '#000'}]}
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
                        style.inputt,
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
                        style.inputt,
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
                    {/* <TextInput
                    style={[
                      style.input,
                      {color: '#000'},
                      errorFields.includes('state') ? style.errorBorder : null,
                    ]}
                    placeholderTextColor="#000"
                    placeholder="State *"
                    onChangeText={text =>
                      setInputValues({...inputValues, state: text})
                    }
                  />
                  {errorFields.includes('state') && (
                    <Text style={style.errorText}>Please Enter State</Text>
                  )} */}

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
                          <View style={styles.dropdownContentstate}>
                            <TextInput
                              style={styles.searchInputsearch}
                              placeholder="Search state..."
                              placeholderTextColor="#000"
                              value={stateSearchTerm}
                              onChangeText={text => setStateSearchTerm(text)}
                            />
                            <ScrollView
                              style={styles.scrollView}
                              nestedScrollEnabled={true}>
                              {filteredStates.map(state => (
                                <TouchableOpacity
                                  key={state.stateId}
                                  style={styles.dropdownItem}
                                  onPress={() => handleSelectState(state)}>
                                  <Text style={styles.dropdownText}>
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
                        style.inputt,
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
                        style.inputt,
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
                      <Text style={style.errorText}>
                        Please Enter Landmark
                      </Text>
                    )}
                    <TextInput
                      style={[
                        style.inputt,
                        {color: '#000'},
                        errorFields.includes('locationDescription')
                          ? style.errorBorder
                          : null,
                      ]}
                      placeholderTextColor="#000"
                      placeholder="Landmark *"
                      onChangeText={text =>
                        setInputValues({
                          ...inputValues,
                          locationDescription: text,
                        })
                      }
                      value={inputValues.locationDescription}
                    />
                    {errorFields.includes('locationDescription') && (
                      <Text style={style.errorText}>
                        Please Enter Landmark
                      </Text>
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
                            {statusOptionss.map((status, index) => (
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

const getStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    // backgroundColor: '#390050',
    backgroundColor: colors.color2,
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  sectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  switchContainer: {
    marginHorizontal: 6,
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#000000',
    ...(Platform.OS === 'ios' && { marginVertical: 7 }), 
  },
  datecontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  dateIcon: {
    width: 25,
    height: 25,
  },
  dropdownContent: {
    position: 'absolute',
    zIndex: 1,
    width: '80%',
    maxHeight: 150,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // searchInput: {
  //   paddingHorizontal: 10,
  //   paddingVertical: 8,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#ccc',
  // },
  scrollView: {
  // height:150,
  minHeight:70,
  maxHeight:150

  },
  
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownButton: {
    height: 35,
    borderRadius: 10,
    borderWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    marginHorizontal: 10,
  },
  dropdownContent1: {
    // marginHorizontal: 10,
    // backgroundColor: '#fff',
    // borderRadius: 10,
    // padding: 10,
    // borderWidth: 0.5,
    // borderColor: '#ccc',
    //----------------
    elevation: 5,
    // maxHeight: 450,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
    borderWidth: 1,
    marginTop:5
  },
  searchInput: {
    // borderWidth: 1,
    // borderColor: '#ccc',
    // borderRadius: 5,
    // paddingHorizontal: 10,
    // paddingVertical: 8,
    // marginBottom: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
    // color:'#000000',
    //------------
    marginTop: 10,
    borderRadius: 10,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginHorizontal: 10,
    paddingLeft: 10,
    marginBottom: 10,
    color: '#000000',
  },
  noCategoriesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalContainerr: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentt: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 5, // Add elevation for shadow on Android
    top: 10,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  inputt: {
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
  plusButton: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  noCategoriesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
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
  scrollView: {
    minHeight: 70,
    maxHeight: 150,
  },
  addButton: {
    paddingHorizontal: 15,
    padding: 10,
    backgroundColor:colors.color2,
    borderRadius: 5,
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  head3: {
    alignItems: 'center',
    borderWidth: 1,
    padding: 6,
    borderRadius: 10,
    marginLeft: 5,
    backgroundColor: colors.color2,
  },
    txt3: {
    color: '#000',
    fontWeight: '500',
    alignSelf: 'center',
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
});

export default NewCall;
