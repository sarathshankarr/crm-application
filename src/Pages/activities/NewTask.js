import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react';
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
  Modal,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import CheckBox from 'react-native-check-box';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {API} from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatDateIntoDMY} from '../../Helper/Helper';
import CustomCheckBox from '../../components/CheckBox';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ColorContext} from '../../components/colortheme/colorTheme';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const NewTask = () => {
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
          // locationDescription: address
        }));
      }
      setIsLocationPickerVisible(false);

      setTimeout(() => {
        if (locationTriggeredBy === 'formModal') {
          setIsModalVisible(true);
        }
        setLocationTriggeredBy(null);
      }, 300);
    }
  };

  const [isNavigatingToLocation, setIsNavigatingToLocation] = useState(false);
  const [locationTriggeredBy, setLocationTriggeredBy] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isNavigatingToLocationModal, setIsNavigatingToLocationModal] =
    useState(false);

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

  const invFormats = [
    {id: 0, value: 'Default Invoice'},
    {id: 1, value: 'V-mart Invoice'},
    {id: 2, value: 'Tax invoice (Description wise)'},
  ];

  const [selectedInvoiceFormat, setSelectedInvoiceFormat] = useState(
    invFormats[0],
  );
  const [invDeclaration, setInvDeclaration] = useState('');
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);

  const toggleInvoiceDropdown = () => {
    setShowInvoiceDropdown(!showInvoiceDropdown);
  };

  const handleSelectInvoiceFormat = format => {
    setSelectedInvoiceFormat(format);
    setShowInvoiceDropdown(false);

    if (format.id === 0) {
      setInvDeclaration(''); // Reset if default
    }
  };

  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const dispatch = useDispatch(); // Get dispatch function from useDispatch hook
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

  const navigation = useNavigation();
  const route = useRoute();
  const {task} = route.params;
  // console.log("task==========>",task)
  const callData = route.params?.call;
  const [isDatePickerVisibleDue, setDatePickerVisibilityDue] = useState(false);
  const [selectedDateDue, setSelectedDateDue] = useState('Due Date');
  const [isDatePickerVisibleUntil, setDatePickerVisibilityUntil] =
    useState(false);
  const [selectedDateUntil, setSelectedDateUntil] = useState('Until Date');

  const [shipFromToClicked, setShipFromToClicked] = useState(false);
  const [shipFromToClickedUser, setShipFromToClickedUser] = useState(false); // State for the User dropdown
  const [shipFromToClickedStatus, setShipFromToClickedStatus] = useState(false); // State for the Status dropdown

  const [selectedDropdownOption, setSelectedDropdownOption] = useState({
    label: '',
    value: '',
  });
  const [selectedUserOption, setSelectedUserOption] = useState('');
  const [selectedStatusOption, setSelectedStatusOption] = useState('');
  const [showDropdownRow, setShowDropdownRow] = useState(false); // State to manage visibility of the main dropdown row
  const [markHighPriority, setMarkHighPriority] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [taskName, setTaskName] = useState('');
  const [relatedTo, setRelatedTo] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null); // State to hold selected user's userId
  const [selectedUserName, setSelectedUserName] = useState(''); // State to hold selected user's userName
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // New state for button disabled
  const [loadingg, setLoadingg] = useState(false);
  const [filteredCustomer, setFilteredCustomer] = useState([]);
  const [shipFromToClickedCustomer, setShipFromToClickedCustomer] =
    useState(false);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const [isEnabled, setIsEnabled] = useState(false);
  const [loadinggg, setLoadinggg] = useState(false);
  const [distributor, setDistributor] = useState([]);
  const [filteredDistributor, setFilterdDistributor] = useState([]);
  const [shipFromToClickedDistributor, setShipFromToClickedDistributor] =
    useState(false);
  const [selectedDistributorOption, setSelectedDistributorOption] =
    useState(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [customerLocations, setCustomerLocations] = useState([]);
  const [fromToClicked, setFromToClicked] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLocationId, setSelectedLocationiD] = useState('');

  const [showFieldList, setShowFieldList] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [filteredFieldsList, setFilteredFieldsList] = useState([]);
  const [fieldsList, setfieldsList] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState();

  const [isDropdownDisabled, setIsDropdownDisabled] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const style = getStyles(colors);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedDistributorDetails, setSelectedDistributorDetails] =
    useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [statusOptions, setStatusOptions] = useState([]);
  const toggleSwitch = () => {
    setIsEnabled(previousState => {
      const newState = !previousState;
      console.log('isEnabled changing to:', newState); // Debugging log
      if (newState) {
        setSelectedCustomerDetails([]);
        setSelectedDistributorDetails([]);
      }
      return newState;
    });
  };

  // Log when isEnabled updates
  useEffect(() => {
    console.log('isEnabled changed:', isEnabled);
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
      invoiceFormat: selectedInvoiceFormat.id,
      invDeclaration: invDeclaration || '',
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
      invoiceFormat: selectedInvoiceFormat.id,
      invDeclaration: invDeclaration || '',
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
    setSelectedInvoiceFormat(invFormats[0]);

    if (!isModalVisible) {
      setInvDeclaration('');
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
      console.error(
        'Error fetching locations:',
        error?.response?.data || error,
      );
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

      console.log(
        'Fetching customer locations for customerId:',
        customer.customerId,
      );
      getCustomerLocations(customer.customerId); // Fetch locations
    }

    setShipFromToClickedCustomer(false);
  };

  // Automatically set the first available location when locations are fetched
  useEffect(() => {
    if (selectedCustomerId && customerLocations.length > 0) {
      console.log(
        'Automatically setting first location:',
        customerLocations[0],
      );
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

      console.log(
        'Fetching distributor locations for customerId:',
        distributor.id,
      );
      getCustomerLocations(distributor.id); // Fetch locations first
    }
    setShipFromToClickedDistributor(false);
  };

  useEffect(() => {
    if (selectedDistributorId && customerLocations.length > 0) {
      console.log(
        'Automatically setting first location:',
        customerLocations[0],
      );
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
    async (
      call_customerType,
      call_customerId,
      call_locId,
      call_locationName,
    ) => {
      console.log(
        'Inside getNameAndLocation, received params:',
        call_customerType,
        call_customerId,
        call_locId,
        call_locationName,
      );

      if (call_customerType && call_customerType === 1) {
        setIsEnabled(true);

        if (call_customerId) {
          setSelectedCustomerId(call_customerId);
        }
        if (customers.length === 0) {
          await getCustomersDetails();
        }

        let foundCustomer = customers?.find(
          item => item?.customerId === call_customerId,
        );
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

        let foundDistributor = distributor?.find(
          item => item?.id === call_customerId,
        );
        if (foundDistributor) {
          setSelectedDistributorOption(foundDistributor.firstName);
        }
      }

      if (call_locId) {
        setSelectedLocationiD(call_locId);

        console.log('Fetching locations for customerId:', call_customerId);

        const locations = await getCustomerLocations(call_customerId); // Ensure locations are fetched

        if (!locations || locations.length === 0) {
          // console.warn(`No locations found for customerId: ${call_customerId}`);
          return;
        }

        let foundLocation = locations.find(
          item => Number(item.locationId) === Number(call_locId),
        );

        if (foundLocation) {
          console.log('Location found:', foundLocation);
          setSelectedLocation(foundLocation.locationName);
        } else {
          // console.warn(`Location ID ${call_locId} not found in updated list`, locations);
        }
      }
    },
    [customers, distributor], // Removed `customerLocations` to avoid unnecessary re-renders
  );

  useEffect(() => {
    if (selectedLocationId && customerLocations.length > 0) {
      let foundLocation = customerLocations.find(
        item => Number(item.locationId) === Number(selectedLocationId), // Ensure same type
      );

      if (foundLocation) {
        console.log('Updated selected location from new data:', foundLocation);
        setSelectedLocation(foundLocation.locationName);
      } else {
        // console.warn(`Location ID ${selectedLocationId} not found in updated list`, customerLocations);
      }
    }
  }, [customerLocations, selectedLocationId]);
  // useEffect(() => {
  //   if (route.params && route.params.task) {
  //     const {task} = route.params;
  //     getUserRole(task.assign_to);
  //     getNameAndLocation(
  //       task.customerType,
  //       task.customerId,
  //       task.locId,
  //       task.locationName,
  //     );
  //   }
  // }, [route.params, users, customers, distributor]);

  useEffect(() => {
    if (route.params && route.params.task) {
      const {task} = route.params;

      console.log('Task received in useEffect:', task); // Check if task is received correctly

      console.log('Calling getUserRole with assign_to:', task.assign_to);
      getUserRole(task.assign_to);

      console.log(
        'Calling getNameAndLocation with params:',
        task.customerType,
        task.customerId,
        task.locId,
        task.locationName,
      );
      getNameAndLocation(
        task.customerType,
        task.customerId,
        task.locId,
        task.locationName,
      );
    }
  }, [route.params, users, customers, distributor]);

  const getdueDate = date => {
    if (!date) return;
    const formattedDate = date.split('T')[0]; // Formats date to "YYYY-MM-DD"
    setSelectedDateDue(formattedDate);
  };
  const getuntilDate = date => {
    if (!date) return;
    setShowDropdownRow(true);
    const formattedDate = date.split('T')[0]; // Formats date to "YYYY-MM-DD"
    setSelectedDateUntil(formattedDate);
  };

  useEffect(() => {
    if (route.params && route.params.task) {
      const {task} = route.params;
      task.field && getFieldName(task.field);
    }
  }, [route.params, fieldsList]);

  const getFieldName = id => {
    setSelectedFieldId(id);
    if (fieldsList?.length > 0) {
      const foundItem = fieldsList.filter(item => item.id === id);
      setSelectedField(foundItem[0]?.fieldName);
    }
  };

  const getTaskRepeatRem = repeatRem => {
    if (!repeatRem) return;
    setShowDropdownRow(true);
    setSelectedDropdownOption(dropdownOptions[repeatRem - 1]);
  };

  const getUserRole = async role => {
    if (users.length === 0) {
      await getUsers();
    }

    let foundItem = await users?.find(item => item.userId === role);
    if (foundItem) {
      setSelectedUserOption(foundItem.fullName);
    }
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
    if (fieldsList.length === 0) {
      getFieldsList();
    }
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShipDropdownClickUser = () => {
    setShipFromToClickedUser(!shipFromToClickedUser);
    setShipFromToClicked(false); // Close main dropdown if open
    setShipFromToClickedStatus(false); // Close Status dropdown if open
  };

  const handleCheckboxChange = () => {
    setShowDropdownRow(!showDropdownRow);
  };

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
          const filteredUsers = users.filter(u =>
            (',' + u.companyId + ',').includes(',' + companyId + ','),
          );
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

  const handleDropdownSelectUser = user => {
    if (selectedUserId === user.userId) {
      setSelectedUserOption(''); // Reset user option
      setSelectedUserId(null); // Reset user ID
      setSelectedUserName(''); // Reset user name
      setSelectedStatusOption(''); // Reset status option
    } else {
      setSelectedUserOption(user.fullName); // Set user option
      setSelectedUserId(user.userId); // Set user ID
      setSelectedUserName(user.fullName); // Set user name
      setSelectedStatusOption('Assigned'); // Set status to Assigned
    }
    setShipFromToClickedUser(false); // Close User dropdown after selection (optional)
  };

  const handleShipDropdownClickk = () => {
    setShipFromToClicked(!shipFromToClicked);
    setShipFromToClickedUser(false); // Close User dropdown if open
    setShipFromToClickedStatus(false); // Close Status dropdown if open
  };

  const handleDropdownSelectStatus = option => {
    if (selectedStatusOption === option) {
      setSelectedStatusOption(''); // Reset status option
    } else {
      setSelectedStatusOption(option); // Set status option
    }
    setShipFromToClickedStatus(false);
  };

  const showDatePickerUntil = () => {
    setDatePickerVisibilityUntil(true);
  };

  const handleCheckPriority = () => {
    setMarkHighPriority(!markHighPriority); // Toggle checkbox state
  };

  const showDatePickerDue = () => {
    setDatePickerVisibilityDue(true);
  };

  const hideDatePickerDue = () => {
    setDatePickerVisibilityDue(false);
  };

  const hideDatePickerUntil = () => {
    setDatePickerVisibilityUntil(false);
  };

  const handleShipDropdownClickStatus = () => {
    setShipFromToClickedStatus(!shipFromToClickedStatus);
    setShipFromToClicked(false); // Close main dropdown if open
    setShipFromToClickedUser(false); // Close User dropdown if open
  };

  const handleDateConfirmDue = date => {
    const formattedDate = date.toISOString().split('T')[0]; // Formats date to "YYYY-MM-DD"
    setSelectedDateDue(formattedDate); // Set the state without additional text
    hideDatePickerDue();
  };

  const handleDateConfirmUntil = date => {
    const formattedDate = date.toISOString().split('T')[0]; // Formats date to "YYYY-MM-DD"
    setSelectedDateUntil(formattedDate); // Set the state without additional text
    hideDatePickerUntil();
  };

  const handleSave = () => {
    if (!taskName.trim() || !relatedTo.trim()) {
      Alert.alert('Alert', 'Please fill in all mandatory fields');
      return; // Exit the function early if any mandatory field is empty
    }

    if (
      showDropdownRow &&
      (selectedDropdownOption?.label.length === 0 || !selectedDropdownOption)
    ) {
      Alert.alert(
        'Alert',
        'Please select before start time as u checked reminder',
      );
      return; // Exit the function early if any mandatory field is empty
    }

    if (isButtonDisabled) return;
    setIsButtonDisabled(true);
    const switchStatus = isEnabled; // Assuming isEnabled controls the switch
    const customerType = switchStatus ? 1 : 0; // 1 for Retailer, 3 for Distributor

    const customerId = switchStatus
      ? selectedCustomerId
      : selectedDistributorId;

    const customeroption = switchStatus
      ? selectedCustomerOption
      : selectedDistributorOption;

    const getCurrentDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
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

    // Set complete_date if conditions are met
    const complete_date =
      selectedStatusOption === 'Completed' ? getCurrentDateTime() : null;

    console.log('Complete Date:', complete_date); // Debugging log

    const requestData = {
      id: route.params.task.id || 0,
      customerId: customerId || 0,
      customer: customeroption || task?.customer,
      created_on: route.params.task.created_on || new Date(),
      taskName: taskName || null,
      dueDate: selectedDateDue !== 'Due Date' ? selectedDateDue : null,
      repeatRem: showDropdownRow ? selectedDropdownOption.value : null,
      untilDate: showDropdownRow
        ? selectedDateUntil !== 'Until Date'
          ? selectedDateUntil
          : null
        : null,
      relatedTo: relatedTo || null,
      desc: desc || null,
      completed: 0,
      priority: markHighPriority ? 1 : 0,
      assign_to: selectedUserId,
      assign_by: userData.userId,
      t_company_id: companyId,
      // unique_id: null,
      status: selectedStatusOption,
      userName: selectedUserName,
      locId: selectedLocationId,
      customerType: customerType || null,
      field: selectedFieldId || null,
      userId: userId,
      companyId: companyId,
      type: 2,
      complete_date: complete_date,
      del_stts: task.del_stts,
      created_by: task.created_by,
    };
    console.log('requestData======>', requestData);

    axios
      .post(global?.userData?.productURL + API.ADD_UPDATE_TASK, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('API Response Data:', response.data); // Log the API response data
        navigation.goBack();
      })
      .catch(error => {
        console.error('Error adding task:', error);
        console.log('API Error Response:', error.response?.data); // Log error response details
      })
      .finally(() => {
        setIsButtonDisabled(false); // Re-enable button after the process completes
      });
  };

  const dropdownOptions = [
    {label: 'Every Day', value: '1'},
    {label: 'Every Week', value: '2'},
    {label: 'Every Month', value: '3'},
    {label: 'Every Year', value: '4'},
  ];
  const handleDropdownSelect = option => {
    setSelectedDropdownOption(option); // Assuming `option` is an object { label: '...', value: '...' }
    setShipFromToClicked(false); // Close dropdown after selection (optional)
  };

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

  const handleSearch = text => {
    if (text.trim().length > 0) {
      const filtered = users.filter(user =>
        user.fullName.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };
  const renderCustomerDetails = () => (
    <View style={{}}>
      <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
        Retailer
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={handleShipDropdownClickCustomer}
          style={[styles.dropdownButton, {flex: 0.8}]}>
          <Text style={{color: '#000'}}>
            {selectedCustomerOption || 'Select'}
          </Text>
          <Image
            source={require('../../../assets/dropdown.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleModal}
          style={[styles.plusButton, {flex: 0.2}]}>
          <Image
            style={{height: 30, width: 30}}
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
              placeholderTextColor="#000"
              onChangeText={handleSearchCustomer}
            />
            <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
              {filteredCustomer.length === 0 ||
              (filteredCustomer.length === 1 && !filteredCustomer[0]) ? (
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
    <View style={{marginBottom: 2}}>
      <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
        Distributor
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {/* Dropdown (90%) */}
        <TouchableOpacity
          onPress={handleShipDropdownClickDistributor}
          style={[styles.dropdownButton, {flex: 0.8}]} // 90% Width
        >
          <Text style={{color: '#000'}}>
            {selectedDistributorOption || 'Select'}
          </Text>
          <Image
            source={require('../../../assets/dropdown.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>

        {/* Plus Button (10%) */}
        <TouchableOpacity
          onPress={toggleModal}
          style={[styles.plusButton, {flex: 0.2}]}>
          <Image
            style={{height: 30, width: 30}}
            source={require('../../../assets/plus.png')}
          />
        </TouchableOpacity>
      </View>

      {shipFromToClickedDistributor.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        shipFromToClickedDistributor && (
          <View style={styles.dropdownContent1}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name..."
              onChangeText={handleSearchDistributor}
              placeholderTextColor="#000"
            />
            <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
              {filteredDistributor.length === 0 ||
              (filteredDistributor.length === 1 && !filteredDistributor[0]) ? (
                <Text style={styles.noCategoriesText}>
                  Sorry, no results found!
                </Text>
              ) : (
                filteredDistributor?.map((distributor, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDropdownSelectDistributor(distributor)}
                    style={styles.dropdownOption}>
                    <Text style={{color: '#000'}}>
                      {distributor?.firstName}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )
      )}
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            style={{height: 25, width: 25}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>New Task</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleSave}
          disabled={isButtonDisabled}>
          <Text style={styles.addButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{flex: 1, backgroundColor: '#ffffff'}}>
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
          <Text
            style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
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
                      <Text style={{color: '#000'}}>
                        {location.locationName}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
          <Text
            style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
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
            <Text style={{color: '#000'}}>
              {selectedUserOption || 'Select'}
            </Text>
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
                      <Text style={{color: '#000'}}>{user.fullName}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
          <Text
            style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
            Task Name *
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Task Name *"
              placeholderTextColor="#000"
              value={taskName}
              onChangeText={setTaskName}
            />
          </View>
          <Text
            style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
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
          <Text
            style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
            Description
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#000"
              value={desc}
              onChangeText={setDesc}
            />
          </View>
          <Text
            style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
            Due Date
          </Text>
          <View style={styles.datecontainer}>
            <TouchableOpacity onPress={showDatePickerDue}>
              <View>
                <Text style={styles.datetxt}>
                  {selectedDateDue !== 'Due Date'
                    ? formatDateIntoDMY(selectedDateDue)
                    : selectedDateDue}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
              }}
              onPress={showDatePickerDue}>
              <Image
                style={styles.dateIcon}
                source={require('../../../assets/date.png')}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 10,
            }}>
            <CustomCheckBox
              isChecked={showDropdownRow}
              onToggle={handleCheckboxChange}
            />
            {/* <CheckBox isChecked={showDropdownRow} onClick={handleCheckboxChange} /> */}
            <Text style={{marginLeft: 5, marginVertical: 5, color: '#000'}}>
              Repeat
            </Text>
          </View>

          {showDropdownRow && (
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
                  marginRight: 5,
                }}>
                <Text style={{color: '#000'}}>
                  {selectedDropdownOption.label || 'Select'}
                </Text>
                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{width: 20, height: 20}}
                />
              </TouchableOpacity>

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
                  marginLeft: 5,
                }}>
                <Text style={{color: '#000'}}>
                  {selectedDateUntil !== 'Until Date'
                    ? formatDateIntoDMY(selectedDateUntil)
                    : selectedDateUntil}
                </Text>
                <Image
                  style={styles.dateIcon}
                  source={require('../../../assets/date.png')}
                />
              </TouchableOpacity>
            </View>
          )}

          {shipFromToClicked && (
            <View style={styles.dropdownContent1}>
              <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
                {dropdownOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleDropdownSelect(option)}
                    style={styles.dropdownOption}>
                    <Text style={{color: '#000'}}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View
            style={{
              marginHorizontal: 10,
              flexDirection: 'row',
              marginVertical: 7,
            }}>
            <CustomCheckBox
              isChecked={markHighPriority}
              onToggle={handleCheckPriority}
            />
            {/* <CheckBox isChecked={markHighPriority} onClick={handleCheckPriority} /> */}
            <Text style={{color: '#000'}}>Mark as High Priority</Text>
          </View>

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
              marginVertical: 1,
              backgroundColor: isDropdownDisabled ? '#f0f0f0' : '#fff',
            }}
            disabled={isDropdownDisabled}>
            <Text style={{color: '#000'}}>
              {selectedStatusOption || 'Status'}
            </Text>
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

          <View style={{marginTop: 5}}>
            <Text
              style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
              Task Type
            </Text>
            <TouchableOpacity
              onPress={handledropdownField}
              style={styles.dropdownButton}>
              <Text style={{color: '#000'}}>{selectedField || 'Select'}</Text>
              <Image
                source={require('../../../assets/dropdown.png')}
                style={{width: 20, height: 20}}
              />
            </TouchableOpacity>
            {showFieldList && (
              <View style={styles.dropdownContent1}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor="#000"
                  onChangeText={handlefilterfields}
                />
                <ScrollView
                  style={styles.scrollView}
                  nestedScrollEnabled={true}>
                  {filteredFieldsList.length === 0 ||
                  (filteredFieldsList.length === 1 &&
                    !filteredFieldsList[0]) ? (
                    <Text style={styles.noCategoriesText}>
                      Sorry, no results found!
                    </Text>
                  ) : (
                    filteredFieldsList?.map((field, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSelectField(field)}
                        style={styles.dropdownOption}>
                        <Text style={{color: '#000'}}>{field?.fieldName}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisibleDue}
            mode="date"
            onConfirm={handleDateConfirmDue}
            onCancel={hideDatePickerDue}
          />
          <View style={{marginBottom: 50}} />

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
                  style={[style.modalTitle, {textAlign: 'center', flex: 1}]}>
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
                  <Text style={style.errorText}>Please Enter Phone Number</Text>
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
                  <Text style={style.errorText}>Please Enter City Or Town</Text>
                )}
                <TextInput
                  style={[
                    style.inputt,
                    {color: '#000'},
                    errorFields.includes('country') ? style.errorBorder : null,
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
                    errorFields.includes('pincode') ? style.errorBorder : null,
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
                  <Text style={style.errorText}>Please Enter Landmark</Text>
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
                <Text style={style.headerTxt}>{'Invoice Format'}</Text>
                <View style={style.container1}>
                  <View style={style.container2}>
                    <TouchableOpacity
                      style={style.container3}
                      onPress={toggleInvoiceDropdown}>
                      <Text style={{fontWeight: '600', color: '#000'}}>
                        {selectedInvoiceFormat.value}
                      </Text>
                      <Image
                        source={require('../../../assets/dropdown.png')}
                        style={{width: 20, height: 20}}
                      />
                    </TouchableOpacity>

                    {showInvoiceDropdown && (
                      <ScrollView
                        style={style.dropdownContainersstatusinvoice}
                        nestedScrollEnabled={true}>
                        {invFormats.map((format, index) => (
                          <TouchableOpacity
                            key={index}
                            style={style.dropdownItem}
                            onPress={() => handleSelectInvoiceFormat(format)}>
                            <Text style={style.dropdownText}>
                              {format.value}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>

                {selectedInvoiceFormat?.id !== 0 && (
                  <>
                    <Text style={style.headerTxt}>{'Declaration'}</Text>
                    <TextInput
                      style={[style.inputt, {color: '#000'}]}
                      placeholderTextColor="#000"
                      placeholder="Declaration"
                      onChangeText={text => setInvDeclaration(text)}
                      value={invDeclaration}
                    />
                  </>
                )}

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
    </SafeAreaView>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    modalContainer: {
      backgroundColor: '#fff',
      flex: 1,
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
    },
    sectionText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
    },
    switchContainer: {
      marginHorizontal: 6,
      flexDirection: 'row',
      marginVertical: 3,
      alignItems: 'center',
    },
    inputContainer: {
      borderWidth: 1,
      borderColor: '#000',
      borderRadius: 5,
      marginHorizontal: 10,
      marginBottom: 3,
      marginTop: 3,
    },
    input: {
      fontSize: 16,
      paddingHorizontal: 10,
      color: '#000000',
      ...(Platform.OS === 'ios' && {marginVertical: 7}), // Only apply for iOS
    },
    datecontainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderRadius: 5,
    },
    datetxt: {
      fontSize: 16,
      color: '#000000',
      ...(Platform.OS === 'ios' && {marginVertical: 7}), // Only apply for iOS
      marginLeft: 10,
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
    searchInput: {
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
    scrollView: {
      minHeight: 70,
      maxHeight: 150,
    },
    dropdownOption: {
      paddingHorizontal: 10,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    dropdownContent1: {
      elevation: 5,
      // height: 220,
      alignSelf: 'center',
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
      borderWidth: 1,
      marginTop: 5,
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
    dropdownContainersstatusinvoice: {
      elevation: 5,
      height: 150,
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
      backgroundColor: colors.color2,
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

export default NewTask;
