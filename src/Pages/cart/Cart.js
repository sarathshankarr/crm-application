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
  addToPending,
  removeFromCart,
  setLoggedInUser,
  setUserRole,
  updateCartItem,
} from '../../redux/actions/Actions';
import Clipboard from '@react-native-clipboard/clipboard';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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

const Cart = () => {
  const mobile_unorderqty_flag = useSelector(
    state => state.selectedCompany?.mobile_unorderqty_flag,
  );

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

  const [priceListOptions, setPriceListOptions] = useState([]);
  const [selectedPriceList, setSelectedPriceList] = useState('');
  const [selectedPriceListId, setSelectedPriceListId] = useState(null);
  const [showPriceListDropdown, setShowPriceListDropdown] = useState(false);

  const togglePriceListDropdown = () => {
    setShowPriceListDropdown(!showPriceListDropdown);
  };

  const handleSelectPriceList = item => {
    setSelectedPriceList(item.priceListName); // <== NOT item.label
    setSelectedPriceListId(item.priceListId); // <== NOT item.value
    setShowPriceListDropdown(false);
  };

  useEffect(() => {
    getPriceList();
  }, []);
  const getPriceList = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_PRICE_LIST}/${companyId}/{desc}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log(
          'response.data.priceList ===>',
          response.data?.response?.priceLIsts,
        );

        setPriceListOptions(response.data?.response?.priceLIsts); // Save the list for dropdown
      })
      .catch(error => {
        console.error('Error fetching price list:', error);
      });
  };

  const invFormats = [
    {id: 0, value: 'Default Invoice'},
    {id: 1, value: 'V-mart Invoice'},
    {id: 2, value: 'Tax invoice (Description wise)'},
  ];

  const [isCorrEnabled, setIsCorrEnabled] = useState(false);

  const toggleCorrSwitch = () => {
    if (isSubmitting) return;
  
    // Block toggle if already enabled and cart is not empty
    if (isCorrEnabled && cartItems.length > 0) {
      // Do nothing (just return silently)
      return;
    }
  
    const switchStatuscor = isEnabled;
  
    if (switchStatuscor && !selectedCustomer) {
      Alert.alert('Alert', 'Please select a customer.');
      return;
    }
    if (!switchStatuscor && !selectedDistributor) {
      Alert.alert('Alert', 'Please select a Distributor.');
      return;
    }
  
    const newCorr = !isCorrEnabled;
    setIsCorrEnabled(newCorr);
  
    if (isEnabled && selectedCustomerDetails.length > 0) {
      const selectedCustomer = selectedCustomerDetails[0];
      if (selectedCustomer?.priceType !== undefined) {
        getStylesOnDistributorChanged(
          selectedCustomer.priceType,
          isEnabled,
          pdf_flag,
          newCorr,
          selectedCustomer.customerId
        );
      }
    } else if (!isEnabled && selectedDistributorDetails.length > 0) {
      const selectedDistributor = selectedDistributorDetails[0];
      if (selectedDistributor?.priceType !== undefined) {
        getStylesOnDistributorChanged(
          selectedDistributor.priceType,
          isEnabled,
          pdf_flag,
          newCorr,
          selectedDistributor.id
        );
      }
    }
  };
  
  
  
  
  const getStylesOnDistributorChanged = (
    priceType,
    isEnabled,
    pdf_flag,
    isCorrEnabled,
    customerId
  ) => {
    let secondParam = '';
  
    if (isCorrEnabled) {
      secondParam = 'CORRATE';
    } else if (pdf_flag) {
      secondParam = 'MRP';
    } else if (isEnabled) {
      secondParam = 'RETAILER';
    } else {
      secondParam = 'DEALER';
    }
  
    const customerType = isEnabled ? 1 : 2; // 1: Retailer, 2: Distributor
  
    const apiUrl0 = `${global?.userData?.productURL}${API.GET_STYLES_ON_DISTRIBUTOR_CHANGED}/${priceType}/${secondParam}/${companyId}?customerType=${customerType}&customerId=${customerId}`;
  
    console.log("apiUrl0=====>", apiUrl0);
  
    const requestData = cartItems.map(item => ({
      styleId: item.styleId,
      sizeId: item.sizeId
    }));

    console.log("requestDataDistributorChange==>",requestData)
  
    axios
    .post(apiUrl0, requestData, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      console.log("MRP Response Data:", JSON.stringify(response.data, null, 2));
      
      // Alternative: Update each cart item individually
      cartItems.forEach((cartItem, index) => {
        // Find matching item in API response
        const responseItem = response.data.find(apiItem => 
          apiItem.styleId === cartItem.styleId && 
          apiItem.sizeId === cartItem.sizeId
        );
        
        if (responseItem) {
          // Update only MRP for this specific cart item
          const updatedItem = {
            ...cartItem,
            mrp: responseItem.mrp,
            price: responseItem.mrp, // Set price equal to MRP
          };
          
          dispatch(updateCartItem(index, updatedItem));
        }
      });
      
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false);
    });
};
  
  

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
  const style = getStyles(colors);
  const userRole = useSelector(state => state.userRole) || '';
  const loggedInUser = useSelector(state => state.loggedInUser);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);
  const comp_flag = selectedCompany?.comp_flag;
  const package_barcode_flag = selectedCompany?.package_barcode_flag;
  const hold_qty_flag = selectedCompany?.hold_qty_flag;
  const pdf_flag = useSelector(state => state.selectedCompany.pdf_flag);
  // console.log('package_barcode_flag', package_barcode_flag);
  const [isLoading, setIsLoading] = useState(false);

  const [inputValuess, setInputValuess] = useState({});

  const cartItems = useSelector(state => state.cartItems);
  console.log('cartItems======>', cartItems);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selatedDate, setSelectedDate] = useState('Expected delivery date');

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
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState([]);
  const [selectedDistributorDetails, setSelectedDistributorDetails] =
    useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const [modalItems, setModalItems] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const [showCompanyLocationList, setShowCompanyLocationList] = useState(false);
  const [editCompanyLocation, setEditCompanyLocation] = useState(true);
  const [locationCompanyList, setLocationCompanyList] = useState([]);
  const [filteredCompanyLocationList, setFilteredCompanyLocationList] =
    useState([]);
  const [selectedCompanyLocation, setSelectedCompanyLocation] = useState('');
  const [selectedCompanyLocationId, setSelectedCompanyLocationId] = useState(0);
  const [gstValues, setGstValues] = useState({});

  const [isSaving, setIsSaving] = useState(false);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchQueryCode, setSearchQueryCode] = useState('');
  const [selectedOption, setSelectedOption] = useState('Style');
  const [fetchedData, setFetchedData] = useState([]); // To store API response
  const [fetchedPakageData, setFetchedPakageData] = useState([]); // To store API response
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState(null); // To handle errors
  const [stylesData, setStylesData] = useState([]);
  const currentScreen = useSelector(
    state => state.cartItems.currentSourceScreen,
  );

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

  const toggleSearchVisibility = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleOptionSelect = option => {
    setSelectedOption(option);
    setSearchQueryCode('');
    setIsDropdownVisible(false);
  };

  const getStyle = query => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError('Please enter a barcode.');
      return;
    }

    const apiUrl = `${global?.userData?.productURL}${API.GET_STYLE_ITEMS}/${trimmedQuery}/${companyId}/0/${comp_flag}`;

    setLoading(true);
    setError(null);

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('Fetched Data:', response.data);
        const data = response?.data || [];

        if (
          data.length === 0 &&
          (trimmedQuery.length === 11 || trimmedQuery.length === 13)
        ) {
          Alert.alert(
            'No Package Found',
            'No package found for the given barcode. Please check and try again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setSearchQueryCode(''); // Clear the search query when "OK" is pressed
                },
              },
            ],
          );
        } else {
          setFetchedData(data); // Store fetched data if needed elsewhere
          handleSaveItem(data); // Save items to the cart
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('Failed to fetch data.');
      })
      .finally(() => {
        setLoading(false);
      });
  };


  const handleSaveItem = fetchedData => {
    console.log('Fetched Data:', fetchedData);

    let itemsToUpdate = [];

    fetchedData.forEach(item => {
      const isMatchingBarcode = item.gsCode === searchQueryCode; // Match scanned barcode

      const itemDetails = {
        packageId: item.packageId || null,
        styleId: item.styleId,
        styleName: item.styleDesc,
        colorName: item.colorName,
        colorId: item.colorId,
        sizeDesc: item.sizeDesc,
        sizeId: item.sizeId,
        quantity: isMatchingBarcode ? 1 : 0, // ✅ 1 for matching item, 0 for others
        dealerPrice: item.dealerPrice,
        retailerPrice: item.retailerPrice,
        mrp: item.mrp,
        price: item.unitPrice,
        gst: item.gst,
        imageUrls: item.imageUrls,
        sourceScreen: 'ModalComponent',
      };

      console.log('Item details to add/update:', itemDetails);

      const existingItemIndex = cartItems.findIndex(
        cartItem =>
          cartItem.styleId === item.styleId &&
          cartItem.colorId === item.colorId &&
          cartItem.sizeDesc === item.sizeDesc,
      );

      if (existingItemIndex !== -1) {
        // ✅ Update quantity only for the matching barcode
        const updatedQuantity =
          parseInt(cartItems[existingItemIndex].quantity, 10) +
          (isMatchingBarcode ? 1 : 0);

        const updatedItem = {
          ...cartItems[existingItemIndex],
          quantity: updatedQuantity,
          price: itemDetails.price,
          imageUrls: itemDetails.imageUrls,
        };

        dispatch(updateCartItem(existingItemIndex, updatedItem));
      } else {
        // ✅ Always add all styles, even if quantity = 0
        itemsToUpdate.push(itemDetails);
      }
    });

    if (itemsToUpdate.length > 0) {
      itemsToUpdate.forEach(item => dispatch(addItemToCart(item)));
    }

    setInputValues({});
    setModalVisible(false);
  };

  const getPackage = async query => {
    const trimmedQuery = typeof query === 'string' ? query.trim() : '';

    if (!trimmedQuery) {
      setError('Please enter a valid barcode.');
      return;
    }

    if (barcodeList.includes(trimmedQuery) && !isAlertVisible) {
      console.log('Duplicate barcode detected. Showing alert.');
      setIsAlertVisible(true); // Set the flag to true when the alert is triggered
      Alert.alert(
        'Barcode',
        'This barcode has already been scanned or entered. Kindly verify.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsAlertVisible(false); // Reset flag when the alert is dismissed
              setSearchQueryCode('');
              console.log('OK Pressed');
            },
          },
        ],
        {cancelable: true},
      );
      return; // Exit early to prevent further code execution
    }

    const apiUrl = `${global?.userData?.productURL}${API.GET_PACKAGES_ITEMS}/${trimmedQuery}`;
    console.log('API URL:', apiUrl);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data?.status?.success) {
        const packagesList = response.data?.response?.packagesList || [];
        console.log('Fetched Package List:', packagesList);

        if (packagesList.length === 0) {
          setError('No packages found for the given barcode.');
          return;
        }

        console.log('Checking condition for alert...');
        console.log('trimmedQuery:', trimmedQuery);
        console.log('packagesList:', packagesList);

        // Check if the trimmedQuery is exactly 11 digits long
        if (
          (trimmedQuery.trim().length === 11 ||
            trimmedQuery.trim().length === 13) &&
          packagesList.some(pkg => pkg.packageId === 0)
        ) {
          console.log('Alert conditions met, showing alert');

          // Show the alert
          Alert.alert(
            'No Package Found',
            'No package found for the given barcode. Please check and try again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setSearchQueryCode(''); // Clear the search query when "OK" is pressed
                },
              },
            ],
          );

          return; // Stop further execution
        }

        // Check package validity and update barcode list
        const validPackages = packagesList.filter(
          pkg => pkg.packageId && pkg.packageId !== 0,
        );
        if (validPackages.length > 0) {
          setStylesData(validPackages); // Store the data for use in your component
          handleSaveItemPackage(validPackages); // Handle all the valid packages

          // Add barcode to the list if not already present
          setBarcodeList(prevList => {
            const newBarcode = trimmedQuery.trim();
            if (newBarcode && !prevList.includes(newBarcode)) {
              const updatedList = [...prevList.filter(Boolean), newBarcode]; // Filter out undefined/null
              console.log('Updated barcodeList:', updatedList);
              return updatedList;
            }
            console.log('Barcode already exists or is invalid:', newBarcode);
            return prevList;
          });
        } else {
          setError('Package ID is invalid or zero. Package cannot be added.');
        }
      } else {
        setError('Failed to fetch package details.');
      }
    } catch (error) {
      console.error('Error fetching package data:', error);
      setError('An error occurred while fetching the package.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItemPackage = packagesList => {
    console.log('Received Packages List:', packagesList);

    // Ensure we have packages to process
    if (!packagesList || packagesList.length === 0) {
      console.error('No packages to process.');
      return;
    }

    packagesList.forEach(modalData => {
      console.log('Processing Package:', modalData);

      if (!modalData?.lineItems) {
        console.error('Missing lineItems in package data.');
        return;
      }

      modalData.lineItems.forEach(item => {
        // Get the input value for the current item, fall back to '1' if invalid
        const inputValue = inputValues[item.styleId] || '1'; // Default to '1' instead of '0'
        console.log(
          `Processing Line Item for Style ID ${item.styleId}: Input Value = ${inputValue}`,
        );

        // Ensure that input value is valid and proceed with adding to cart
        if (parseInt(inputValue, 10) > 0) {
          const itemBaseDetails = {
            packageId: modalData.packageId,
            styleId: item.styleId,
            styleName: item.styleName,
            colorName: item.colorName,
            sizeId: item.sizeId,
            colorId: item.colorId,
            sizeDesc: item.size,
            quantity: inputValue,
            dealerPrice: modalData?.price || 0,
            retailerPrice: modalData?.retailerPrice || 0,
            mrp: modalData.mrp || 0,
            price: modalData?.price || 0,
            gst: item.gst || 0,
            sourceScreen: 'PackageDetail',
          };

          console.log('Adding Item to Cart:', itemBaseDetails);
          dispatch(addItemToCart(itemBaseDetails));
        } else {
          // Handle invalid or zero input value, provide feedback if necessary
          console.warn(
            `Input value for Style ID ${item.styleId} is zero or invalid. You might want to allow a default value or display a message.`,
          );
        }
      });
    });
  };


  const handleGstChange = (index, text) => {
    // Allow only whole numbers (no decimals)
    const isValidInput = /^\d*$/.test(text);

    if (isValidInput) {
      // Convert to integer, default to '0' if empty
      let validGst = text.trim() === '' ? '0' : parseInt(text, 10).toString();

      // Check if GST is more than 100
      if (parseInt(validGst, 10) > 100) {
        Alert.alert(
          'crm.codeverse.co says', // Title of the alert
          'GST % cannot be more than 100', // Message
        );
        return; // Prevent updating the state
      }

      setGstValues(prevValues => ({
        ...prevValues,
        [index]: validGst, // Update GST value for the specific index/item
      }));
    }
  };
  const [fixDiscValues, setFixDiscValues] = useState({});

  // };
  const handleFixDiscChange = (index, text) => {
    // Allow numbers with optional decimals (e.g., 1, 1.1, 10.50)
    const isValidInput = /^\d*\.?\d*$/.test(text);

    if (isValidInput) {
      setFixDiscValues(prevValues => ({
        ...prevValues,
        [index]: text, // Keep the exact text entered by the user
      }));
    }
  };


  const grossPrices = cartItems.map((item, index) => {
    if (!item || !item.quantity) return 0; // Ensure item and quantity exist

    // Determine the price based on pdf_flag and isEnabled
    // let price = pdf_flag
    //   ? item?.mrp || 0 // If pdf_flag is enabled, use MRP
    //   : isEnabled
    //   ? item?.retailerPrice || 0 // If enabled, use retailerPrice
    //   : item?.dealerPrice || item?.price || 0; // Otherwise, use dealerPrice or price

    let price = item?.mrp || 0;

    // If pdf_flag is enabled, use price directly
    if (pdf_flag) {
      return parseFloat(
        (Number(price) * Number(item?.quantity || 0)).toFixed(2),
      );
    }

    // Get updated fixDisc value from state, fallback to item.fixDisc
    let updatedFixDisc =
      fixDiscValues[index] !== undefined
        ? Number(fixDiscValues[index])
        : Number(item.fixDisc || 0);

    // Ensure fixedPrice does not go negative
    let fixedPrice = Math.max(price - updatedFixDisc, 0);

    // Calculate gross price
    const grossPrice = (fixedPrice * Number(item?.quantity || 0)).toFixed(2);

    return parseFloat(grossPrice); // Convert to float for accurate display
  });

  // Calculate the total gross price
  const totalGrossPrice = grossPrices
    .reduce((acc, grossPrice) => acc + grossPrice, 0)
    .toFixed(2);

  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

  const textInputStyle = {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    width: '100%', // Ensures the input stays within the fixed container
    color: '#000',
    textAlign: 'center',
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


  // const handleRemoveItem = index => {
  //   // Remove item from the cart
  //   dispatch(removeFromCart(index));

  //   // Update barcodeList to remove the corresponding barcode
  //   setBarcodeList(prevList => {
  //     const updatedList = [...prevList]; // Clone the current list
  //     updatedList.splice(index, 1); // Remove the barcode at the given index
  //     console.log('Updated barcodeList after removal:', updatedList);
  //     return updatedList; // Return the updated list
  //   });
  // };

  const handleRemoveItem = index => {
    dispatch(removeFromCart(index));
  
    setBarcodeList(prevList => {
      const updatedList = [...prevList];
      updatedList.splice(index, 1);
  
      const updatedCart = [...cartItems];
      updatedCart.splice(index, 1);
  
      if (updatedCart.length === 0) {
        setIsCorrEnabled(false); // Allow switch to be used again
      }
  
      return updatedList;
    });
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
    getLocations();
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
      setSelectedPriceList('');
      setSelectedPriceListId(null);
      setStateSearchTerm('');
      setSelectedInvoiceFormat(invFormats[0]); // reset to default invoice format
      setInvDeclaration(''); // clear declaration text
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
    setSelectedPriceList('');
    setSelectedPriceListId(null);
    setStateSearchTerm('');
    setIsNavigatingToLocation(false);
    setConfirmedLocation(null);
    setIsSaving(false);
    setSelectedInvoiceFormat(invFormats[0]); // reset to default invoice format
    setInvDeclaration(''); // clear declaration text
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
      invoiceFormat: selectedInvoiceFormat.id,
      invDeclaration: invDeclaration || '',
      priceType: selectedPriceListId,
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
      invoiceFormat: selectedInvoiceFormat.id,
      invDeclaration: invDeclaration || '',
      priceType: selectedPriceListId,

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

  const handleCommentsChange = text => {
    console.log('Comments changed:', text);
    setComments(text);
  };

  const getLocations = () => {
    if (comp_flag === 0) {
      const apiUrl0 = `${global?.userData?.productURL}${API.GET_LOCATION_C0_LIST}`;
      setIsLoading(true);
      const requestData = {
        styleName: '',
        companyId: companyId,
      };
      axios
        .post(apiUrl0, requestData, {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        })
        .then(response => {
          setLocationCompanyList(response?.data?.locationList || []);
          setFilteredCompanyLocationList(response?.data?.locationList || []);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setIsLoading(false);
        });
    } else if (comp_flag === 1) {
      const apiUrl1 = `${global?.userData?.productURL}${API.GET_LOCATION_C1_LIST}${companyId}`;
      setIsLoading(true);
      axios
        .get(apiUrl1, {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        })
        .then(response => {
          const locationList = response?.data?.response?.locationList || [];

          const filteredLocationList = locationList?.filter(
            c => c.customerType === 2 && c.customerId === companyId,
          );

          setLocationCompanyList(filteredLocationList);
          setFilteredCompanyLocationList(filteredLocationList);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setIsLoading(false); // Set loading to false in case of error
        });
    }
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
        console.log("distributorList",response?.data?.response?.distributorList )
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

    if (selectedCustomer?.priceType !== undefined) {
      getStylesOnDistributorChanged(
        selectedCustomer.priceType,
        isEnabled,
        pdf_flag,
        isCorrEnabled,
        selectedCustomer.customerId
      );
    }
    else {
      console.warn('PriceType not found for selected distributor');
    }
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
    console.log("selectedDistributor",selectedDistributor)
    setSelectedDistributorDetails([selectedDistributor]);
    if (selectedDistributor?.priceType !== undefined) {
      getStylesOnDistributorChanged(
        selectedDistributor.priceType,
        isEnabled,
        pdf_flag,
        isCorrEnabled,
        selectedDistributor.id
      );
    }
     else {
      console.warn('PriceType not found for selected distributor');
    }
  };

  // useEffect(() => {
  //   if (clicked) {
  //     isEnabled ? getCustomersDetails() : getDistributorsDetails();
  //   }
  //   setSelectedLocation('Billing to *');
  //   setSelectedShipLocation('Shipping to *');
  //   setSelectedLocationId('');
  //   setSelectedShipLocationId('');
  //   setCustomerLocations([]);
  // }, [clicked, isEnabled]);


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
      const itemPrice =  parseFloat(cartItems[i].mrp) || 0


      if (itemPrice === 0) {
        Alert.alert(
          'crm.codeverse.co says',
          'Style price is mandatory for creating an order.',
        );
        return;
      }
    }

    for (let i = 0; i < cartItems.length; i++) {
      if (!cartItems[i].quantity || parseInt(cartItems[i].quantity) <= 0) {
        Alert.alert(
          'crm.codeverse.co says',
          'A valid item quantity (greater than 0) is required to proceed with the order create.',
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
    const pkg_id = cartItems.some(
      item => item.sourceScreen === 'PackageDetail',
    );
    const colorId = cartItems.some(
      item => item.sourceScreen === 'PackageDetail',
    )
      ? cartItems.find(item => item.sourceScreen === 'PackageDetail').colorId
      : cartItems[0]?.colorId || null; // Fallback to null if cartItems is empty



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

    const billingAddressId =
      selectedLocation && selectedLocation.locationId
        ? selectedLocation.locationId
        : '';

    const shippingAddressId =
      selectedShipLocation && selectedShipLocation.locationId
        ? selectedShipLocation.locationId
        : '';

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
        price: item?.mrp?.toString() ||item?.price?.toString(),
        // pdf_flag
        //   ? item?.mrp?.toString() // If pdf_flag is enabled, use mrp
        //   : isEnabled
        //   ? item?.retailerPrice?.toString() // Otherwise, use retailerPrice if isEnabled
        //   : item?.dealerPrice?.toString() || item?.price?.toString(),
        gross: lineItemTotals[index]?.toString() || '0',
        discountPercentage: '0',
        discountAmount: '0',
        gst: gstValues[index] !== undefined ? gstValues[index] : item.gst,
        total: (
          parseFloat(         
            item?.mrp?.toString() // If pdf_flag is enabled, use mrp
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
        orgPrice: item?.mrp?.toString() ||item?.price?.toString(),
        // orgPrice: 
        // pdf_flag
        //   ? item?.mrp?.toString() // If pdf_flag is enabled, use mrp
        //   : isEnabled
        //   ? item?.retailerPrice?.toString() // If isEnabled is true, use retailerPrice
        //   : item?.dealerPrice?.toString() || item?.price?.toString(), // Otherwise, use dealerPrice or fallback to price
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

  const openModal = item => {
    setSelectedItem(item);

    // Create a map to store the initial quantities for each item
    const updatedInputValues = {};

    // Loop through cartItems to set initial quantity for each item
    cartItems.forEach(cartItem => {
      // Construct a unique key for each cart item
      const key = `${cartItem.styleId}-${cartItem.colorId}-${cartItem.sizeId}`;

      // Set the initial quantity to the current quantity in cartItems
      updatedInputValues[key] = {
        ...cartItem.inputValue,
        quantity: cartItem.quantity.toString(), // Convert to string if necessary
      };
    });

    setInputValuess(updatedInputValues);
    setModalVisible(true);
  };

  useEffect(() => {
    if (selectedItem) {
      setInputValuess(selectedItem.inputValue || {}); // Set to an empty object if selectedItem.inputValue is empty
    }
  }, [selectedItem]);

  const handleInputValueChange = (size, value) => {
    setInputValuess(prevState => ({
      ...prevState,
      [size]: value,
    }));
  };
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };


  const handleDateConfirm = date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for comparison

    if (date < today) {
      Alert.alert(
        'Invalid Date',
        "Please select today's date or a future date.",
      );
      hideDatePicker();
      return;
    }

    console.warn('A date has been picked: ', date);

    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns month from 0-11
    const year = date.getFullYear();

    // Format date as DD-MM-YYYY
    const formattedDate = `${day}-${month}-${year}`;

    setSelectedDate('Expected Delivery Date: ' + formattedDate);
    setShipDate(date); // Store selected date
    hideDatePicker();
  };


  const handleQuantityChange = (index, text) => {
    const updatedItems = [...cartItems];

    // Validate the input to allow only numbers and a single decimal point
    const isValidInput = /^\d*\.?\d*$/.test(text);

    if (isValidInput) {
      // Parse integer part only if no decimal point, otherwise preserve the input
      const parsedQuantity = text.includes('.')
        ? text // Preserve the input if it contains a decimal point
        : text === ''
        ? '' // Keep as empty string for empty input
        : parseInt(text, 10); // Parse to integer for whole numbers

      updatedItems[index].quantity = parsedQuantity;
      dispatch(updateCartItem(index, updatedItems[index]));
    }
  };


  const handleIncrementQuantityCart = index => {
    const updatedItems = [...cartItems];

    // Ensure quantity is a number, default to 0 if empty or invalid
    let currentQuantity = parseInt(updatedItems[index].quantity, 10);
    if (isNaN(currentQuantity)) {
      currentQuantity = 0; // Default to 0 when input is empty
    }

    updatedItems[index].quantity = currentQuantity + 1;
    dispatch(updateCartItem(index, updatedItems[index]));
  };

  // Function to handle decrementing quantity in cartItems
  const handleDecrementQuantityCart = index => {
    const updatedItems = [...cartItems];
    if (updatedItems[index].quantity > 1) {
      updatedItems[index].quantity -= 1;
      dispatch(updateCartItem(index, updatedItems[index]));
    }
  };
  const copyValueToClipboard = index => {
    const item = cartItems[index];
    const {styleId, colorId, quantity} = item;

    // Check if quantity is 0 or falsy
    if (!quantity) {
      Alert.alert('Please enter a valid quantity.');
      return;
    }

    const updatedItems = cartItems.map(cartItem => {
      if (cartItem.styleId === styleId && cartItem.colorId === colorId) {
        return {
          ...cartItem,
          quantity,
        };
      }
      return cartItem;
    });

    const copiedText = updatedItems
      .filter(
        cartItem =>
          cartItem.styleId === styleId && cartItem.colorId === colorId,
      )
      .map(updatedItem => `${updatedItem.sizeDesc}-${updatedItem.quantity}`)
      .join(', ');

    Clipboard.setString(copiedText);

    updatedItems.forEach((updatedItem, updatedIndex) => {
      if (updatedItem.styleId === styleId && updatedItem.colorId === colorId) {
        dispatch(updateCartItem(updatedIndex, updatedItem));
      }
    });
  };


  const totalQty = cartItems.reduce((total, item) => {
    // Ensure item.quantity is defined and not NaN before adding to total
    const quantity = parseFloat(item.quantity); // Use parseFloat to handle decimals
    if (!isNaN(quantity)) {
      return total + quantity;
    } else {
      return total; // Ignore invalid quantities
    }
  }, 0);
  const formattedTotalQty =
    totalQty !== 0 ? parseFloat(totalQty.toFixed(5)) : '0';

  const calculateTotalQty = (styleId, colorId) => {
    let totalQty = 0;
    for (let item of cartItems) {
      if (item.styleId === styleId && item.colorId === colorId) {
        totalQty += Number(item.quantity);
      }
    }
    return totalQty.toString();
  };

  const calculateTotalItems = (styleId, colorId) => {
    let totalItems = 0;
    for (let item of cartItems) {
      if (item.styleId === styleId && item.colorId === colorId) {
        totalItems++;
      }
    }
    return totalItems;
  };

  
  const calculateTotalPrice = (styleId, colorId) => {
    let totalPrice = 0;

    cartItems.forEach((item, index) => {
      if (item.styleId === styleId && item.colorId === colorId) {
        // let price = pdf_flag
        //   ? item?.mrp || 0 // If pdf_flag is enabled, use MRP
        //   : isEnabled
        //   ? item?.retailerPrice || 0 // If enabled, use retailerPrice
        //   : item?.dealerPrice || item?.price || 0; // Otherwise, use dealerPrice or price

        let price = item?.mrp || 0;
        // If pdf_flag is enabled, use price directly
        if (pdf_flag) {
          totalPrice += price * (item?.quantity || 0);
          return;
        }

        // Get updated fixDisc value from state, fallback to item.fixDisc
        let updatedFixDisc =
          fixDiscValues[index] !== undefined
            ? Number(fixDiscValues[index])
            : Number(item.fixDisc || 0);

        // Ensure fixedPrice does not go negative
        let fixedPrice = Math.max(price - updatedFixDisc, 0);

        // Add to total price
        totalPrice += fixedPrice * (item?.quantity || 0);
      }
    });

    return totalPrice.toFixed(2); // Format result to 2 decimal places
  };

  const lineItemTotals = cartItems.map((item, index) => {
    if (!item || !item.quantity) return 0; // Ensure item and quantity exist

    // let price = pdf_flag
    //   ? item?.mrp || 0
    //   : isEnabled
    //   ? item?.retailerPrice || 0
    //   : item?.dealerPrice || item?.price || 0;
    let price = item?.mrp || 0;

    let quantity = Number(item?.quantity || 0);
    let updatedFixDisc =
      fixDiscValues[index] !== undefined
        ? Number(fixDiscValues[index])
        : Number(item.fixDisc || 0);

    let fixedPrice = Math.max(price - updatedFixDisc, 0);

    let discountAmount = Number(item?.discountAmount || 0);
    let discountAmountSec = Number(item?.discountAmountSec || 0);
    let discountPercentageSec = Number(item?.discountPercentageSec || 0);
    let gstRate = Number(item?.gst || 0);

    // Calculate gstAmnt based on pdf_flag
    let gstAmnt = pdf_flag
      ? ((quantity * discountAmount - discountAmountSec) * gstRate) / 100 || 0
      : ((quantity * fixedPrice - discountAmount - discountAmountSec) *
          gstRate) /
          100 || 0;

    // Calculate lineTotal based on pdf_flag
    let lineTotal = pdf_flag
      ? quantity * discountAmount -
        (quantity * discountAmount * discountPercentageSec) / 100 +
        gstAmnt
      : quantity * fixedPrice - discountAmount - discountAmountSec + gstAmnt;

    return parseFloat(lineTotal.toFixed(2)); // Convert to float with 2 decimal places
  });

  console.log(lineItemTotals); // Array of totals per line item

  const uniqueSets = new Set(
    cartItems.map(item => `${item.styleId}-${item.colorId}-${item.sizeId}`),
  );
  const totalItems = uniqueSets.size;
  // Assuming cartItems and gstValues are defined properly
  const totalPrice = cartItems
    .reduce((total, item) => {
      // Parse price and quantity to floats and integers respectively
      const parsedPrice = parseFloat(
        item?.mrp?.toString()
        // pdf_flag
        //   ? item?.mrp?.toString() // If pdf_flag is enabled, use mrp
        //   : isEnabled
        //   ? item?.retailerPrice?.toString() // If isEnabled is true, use retailerPrice
        //   : item?.dealerPrice?.toString() || item?.price?.toString(), // Otherwise, use dealerPrice or price
      );
      const parsedQuantity = parseInt(item.quantity, 10);

      // Check if parsedPrice and parsedQuantity are valid numbers
      if (!isNaN(parsedPrice) && !isNaN(parsedQuantity)) {
        return total + parsedPrice * parsedQuantity;
      } else {
        return total; // Ignore invalid items
      }
    }, 0)
    .toFixed(2); // Total price formatted to 2 decimal places

  const totalGst = cartItems
    .reduce((acc, item, index) => {
      // Parse GST percentage as a float
      const gstPercentage = parseFloat(
        gstValues[index] !== undefined ? gstValues[index] : item.gst,
      ); // Use updated GST if available

      // Parse price and quantity for accurate calculations
      // let price = pdf_flag
      //   ? parseFloat(item?.mrp) || 0 // Use MRP if pdf_flag is enabled
      //   : isEnabled
      //   ? parseFloat(item?.retailerPrice) || 0 // Use retailerPrice if isEnabled
      //   : parseFloat(item?.dealerPrice) || parseFloat(item?.price) || 0; // Otherwise, use dealerPrice or price
      let price = item?.mrp || 0;
      // If pdf_flag is disabled, adjust price using fixDisc
      if (!pdf_flag) {
        let updatedFixDisc =
          fixDiscValues[index] !== undefined
            ? parseFloat(fixDiscValues[index])
            : parseFloat(item.fixDisc || 0);

        // Ensure fixedPrice does not go negative
        price = Math.max(price - updatedFixDisc, 0);
      }

      // Calculate GST Amount
      const itemGst =
        ((parseFloat(item.quantity) * price -
          parseFloat(item.discountAmount || 0) -
          parseFloat(item.discountAmountSec || 0)) *
          gstPercentage) /
        100;

      // Accumulate GST
      return acc + itemGst;
    }, 0) // Initial accumulator is 0
    .toFixed(2); // Round the final sum to 2 decimal places


  const [totalAmount, setTotalAmount] = useState(0); // Updated to hold a number value
  const [roundOff, setRoundOff] = useState('');

  // Function to calculate round-off value
  const calculateRoundOff = amount => {
    const decimal = parseFloat((amount - Math.floor(amount)).toFixed(2));

    let roundOff = 0; // Default to 0 if there's no rounding required

    if (decimal >= 0.5) {
      roundOff = (Math.ceil(amount) - amount).toFixed(2); // Positive round-off
      roundOff = `+${roundOff}`; // Add "+" sign for positive values
    } else if (decimal > 0) {
      roundOff = (amount - Math.floor(amount)).toFixed(2); // Negative round-off
      roundOff = `-${roundOff}`;
    }

    // Ensure "-0.00" or "+0.00" is returned as "0.00"
    return parseFloat(roundOff) === 0 ? '0.00' : roundOff;
  };

  useEffect(() => {
    const totalAmount =
      (parseFloat(totalGst) || 0) + (parseFloat(totalGrossPrice) || 0);
    const roundOff = calculateRoundOff(totalAmount);

    // Round the total amount to the nearest integer (so it reflects rounded value)
    const roundedTotal = Math.round(totalAmount);

    // Update state variables for totalAmount and roundOff
    setTotalAmount(roundedTotal);
    setRoundOff(roundOff);
  }, [totalGst, totalGrossPrice]); // Recalculate whenever totalGst or totalGrossPrice change


  const [gstSlotData, setGstSlotData] = useState([]); // Store GST slot data

  useEffect(() => {
    getGstSlot();
  }, []); // Fetch GST data on mount

  const getGstSlot = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_GST_SLOT}/${companyId}`;
    console.log('API URL:', apiUrl);

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const gstList = response?.data?.response?.gstList || [];
        setGstSlotData(gstList);
      })
      .catch(error => {
        console.error('Error fetching GST slot data:', error);
      });
  };

  const handlePriceChange = (index, text) => {
    if (/^\d*\.?\d*$/.test(text)) {
      const parsedPrice = text.includes('.')
        ? text
        : parseInt(text, 10).toString();
      const formattedPrice = text === '' ? '0' : parsedPrice;
  
      const updatedItem = {
        ...cartItems[index],
        mrp: formattedPrice, // Only update MRP
        price: parseFloat(formattedPrice) || 0, // Also update price for calculations
      };
  
      // Recalculate GST dynamically
      const gstSlot = gstSlotData.find(
        c => c.id === Number(updatedItem.gstSlotId),
      );
      if (gstSlot) {
        const {greterAmount, smalestAmount, greterPercent, smalestPercent} =
          gstSlot;
        updatedItem.gst =
          updatedItem.price >= greterAmount
            ? greterPercent
            : updatedItem.price <= smalestAmount
            ? smalestPercent
            : 0;
      } else {
        updatedItem.gst = 0;
      }
  
      // Update Redux store
      dispatch(updateCartItem(index, updatedItem));
    }
  };

  useEffect(() => {
    getGstSlot();
  }, []);

  useEffect(() => {
    if (gstSlotData.length > 0) {
      // Update each cart item with the correct GST
      const updatedCartItems = cartItems.map(item => {
        const gstSlot = gstSlotData.find(c => c?.id === Number(item.gstSlotId));
        if (gstSlot) {
          const {greterAmount, smalestAmount, greterPercent, smalestPercent} =
            gstSlot;
          item.gst =
            item.price >= greterAmount
              ? greterPercent
              : item.price <= smalestAmount
              ? smalestPercent
              : 0;
        } else {
          item.gst = 0;
        }
        return item;
      });

      // Update Redux store or state
      dispatch(updateCartItem(updatedCartItems));
    }
  }, [gstSlotData]); // Re-run when gstSlotData is updated

  // ✅ Calculate GST Based on Price
  const calculateGST = () => {
    const updatedCart = cartItems.map((item, index) => {
      const gstSlot = gstSlotData.find(c => c.id === Number(item.gstSlotId)); // Find matching GST slot

      let gstPercent = 0;
      if (gstSlot) {
        const {greterAmount, smalestAmount, greterPercent, smalestPercent} =
          gstSlot;
        gstPercent =
          item.price >= greterAmount
            ? greterPercent
            : item.price <= smalestAmount
            ? smalestPercent
            : 0;
      }

      return {...item, gst: gstValues[index] ?? gstPercent}; // Use manual GST if available
    });

    dispatch(updateCartItems(updatedCart)); // Update Redux state
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
      return; // Do not proceed with saving
    }

    const hasExactlyTenDigits = /^\d{10,12}$/;
    if (!hasExactlyTenDigits.test(Number(locationInputValues.phoneNumber))) {
      Alert.alert('Alert', 'Please Provide a valid Phone Number');
      return;
    }

    getisValidLocation();
    toggleLocationModal();
    setConfirmedLocation(null);
    setIsNavigatingToLocationModal(false);
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

  const handleSelectLocation = item => {
    setSelectedCompanyLocation(item.locationName);
    setSelectedCompanyLocationId(item.locationId);
    setShowCompanyLocationList(false);
  };

  const filterLocation = text => {
    const filtered = locationCompanyList.filter(item =>
      item?.locationName?.toUpperCase().includes(text?.toUpperCase()),
    );
    setFilteredCompanyLocationList(filtered);
  };

  useEffect(() => {
    if (locationCompanyList && locationCompanyList.length > 0) {
      const defaultLocation = locationCompanyList[0];
      setSelectedCompanyLocation(defaultLocation.locationName);
      setSelectedCompanyLocationId(defaultLocation.locationId);
    }
  }, [locationCompanyList]);

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
  
    if (!newValue) {
      setSelectedCustomerDetails([]);
      setSelectedDistributorDetails([]);
    }
  
    // Trigger API again with new switch state
    if (newValue && selectedCustomerDetails.length > 0) {
      const selectedCustomer = selectedCustomerDetails[0];
      if (selectedCustomer?.priceType !== undefined) {
        getStylesOnDistributorChanged(
          selectedCustomer.priceType,
          newValue,
          pdf_flag,
          isCorrEnabled,
        );
      }
    } else if (!newValue && selectedDistributorDetails.length > 0) {
      const selectedDistributor = selectedDistributorDetails[0];
      if (selectedDistributor?.priceType !== undefined) {
        getStylesOnDistributorChanged(
          selectedDistributor.priceType,
          newValue,
          pdf_flag,
          isCorrEnabled,
        );
      }
    }
  };
  

  const OrderDetailRow = ({label, value}) => (
    <View style={{flexDirection: 'row'}}>
      <Text
        style={{
          width: 155,
          textAlign: 'right',
          color: '#000',
          marginVertical: 3,
        }}>
        {label}
      </Text>
      <Text
        style={{width: 50, textAlign: 'center', color: '#000', marginLeft: 20}}>
        :
      </Text>
      <Text
        style={{width: 80, textAlign: 'right', color: '#000'}}
        adjustsFontSizeToFit
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

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
              marginLeft: 10,
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
                  marginLeft: 10,
                }}>
                Slide For Retailer
              </Text>
            </View>
            {package_barcode_flag !== 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 2,
                }}>
                <Text
                  style={{
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: 15,
                    color: '#000',
                  }}>
                  Qr-Scanner
                </Text>

                <TouchableOpacity
                  style={{marginHorizontal: 10, alignItems: 'center'}}
                  onPress={toggleSearchVisibility}>
                  <Image
                    style={{height: 20, width: 20}}
                    source={require('../../../assets/dropdown.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('QRCodeScanner', {
                      onRead: scannedCode => {
                        if (scannedCode) {
                          setSearchQueryCode(scannedCode); // Set the scanned code in the search input
                          if (selectedOption === 'Style') {
                            getStyle(scannedCode); // Fetch style data based on the scanned code
                          } else if (selectedOption === 'Package') {
                            getPackage(scannedCode); // Fetch package data based on the scanned code
                          }
                        }
                      },
                    })
                  }
                  style={{
                    marginHorizontal: 11,
                  }}>
                  <Image
                    style={{height: 27, width: 27}}
                    source={require('../../../assets/qr-scan.png')}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          {isSearchVisible && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  marginVertical: 10,
                }}>
                <View style={style.searchContainer}>
                  <TextInput
                    style={style.searchInput}
                    value={searchQueryCode}
                    onChangeText={text => {
                      setSearchQueryCode(text);
                      console.log('TextInput Value:', text);
                      if (text.trim()) {
                        if (selectedOption === 'Style') {
                          console.log('Calling getStyle...');
                          getStyle(text); // Call getStyle when there is input
                        } else if (selectedOption === 'Package') {
                          console.log('Calling getPackage...');
                          getPackage(text); // Call getPackage when there is input
                        }
                      }
                    }}
                    onSubmitEditing={() => {
                      console.log(
                        'Submit Editing triggered with:',
                        searchQueryCode,
                      );
                      if (searchQueryCode.trim()) {
                        if (selectedOption === 'Style') {
                          console.log('Calling getStyle on Submit...');
                          getStyle(searchQueryCode); // Call getStyle on Enter key
                        } else if (selectedOption === 'Package') {
                          console.log('Calling getPackage on Submit...');
                          getPackage(searchQueryCode); // Call getPackage on Enter key
                        }
                      }
                    }}
                    placeholder="Search"
                    placeholderTextColor="#000"
                    returnKeyType="search" // Changes the keyboard 'Enter' button to 'Search'
                  />

                  <TouchableOpacity
                    style={style.dropdownButton}
                    onPress={toggleDropdown}>
                    <Text style={{color: '#000', marginRight: 5}}>
                      {selectedOption}
                    </Text>
                    <Image
                      style={style.dropdownIcon}
                      source={require('../../../assets/dropdown.png')}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {isDropdownVisible && (
                <View style={style.dropdownContent1}>
                  {StylePublish.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={style.dropdownOption}
                      onPress={() => handleOptionSelect(option)}>
                      <Text style={style.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            {/* {userRole &&
              userRole.toLowerCase &&
              userRole.toLowerCase() === 'admin' && ( */}
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

          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                onPress={handleFromDropdownClick}
                style={{
                  width: '90%',
                  height: 50,
                  borderRadius: 10,
                  borderWidth: 0.5,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: 15,
                  paddingRight: 15,
                  marginLeft: 18,
                }}>
                {/* <Text>{selectedLocation.locationName || 'Billing to *'}</Text> */}
                <Text style={{fontWeight: '600', color: '#000'}}>
                  {selectedLocation.length > 0
                    ? `${selectedLocation}`
                    : 'Billing to *'}
                </Text>
                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{width: 20, height: 20}}
                />
              </TouchableOpacity>
              {fromToClicked ? (
                customerLocations.length === 0 && !isLoading ? (
                  <Text style={[style.noResultsLocation, {marginLeft: 15}]}>
                    Sorry , no results found!
                  </Text>
                ) : (
                  <View
                    style={{
                      height: 175,
                      alignSelf: 'center',
                      width: '85%',
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      marginLeft: 15,
                      borderColor: 'gray', // Optional: Adds subtle border (for effect)
                      borderWidth: 1,
                      marginTop: 5,
                    }}>
                    {/* Here you can render your dropdown content */}
                    <ScrollView
                      style={style.scrollView}
                      nestedScrollEnabled={true}>
                      {customerLocations.map(location => (
                        <TouchableOpacity
                          key={location.locationId}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: '#ccc',
                          }}
                          onPress={() => handleLocationSelection(location)}>
                          <Text style={{color: '#000'}}>
                            {location.locationName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )
              ) : null}
            </View>

            <View style={{flex: 1}}>
              <TouchableOpacity
                onPress={handleShipDropdownClick}
                style={{
                  width: '86%',
                  height: 50,
                  borderRadius: 10,
                  borderWidth: 0.5,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: 15,
                  paddingRight: 15,
                  marginLeft: 5,
                }}>
                {/* <Text>{selectedShipLocation.locationName || 'Shiping to *'}</Text> */}
                {/* <Text style={{fontWeight: '600', color: '#000'}}>
                {selectedShipLocation.length > 0
                  ? `${selectedShipLocation}`
                  : 'Shipping to *'}
              </Text> */}

                <Text style={{fontWeight: '600', color: '#000'}}>
                  {selectedShipLocation.length > 0
                    ? `${selectedShipLocation}`
                    : 'Shipping to *'}
                </Text>
                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{width: 20, height: 20}}
                />
              </TouchableOpacity>
              {shipFromToClicked &&
                (customerLocations.length === 0 && !isLoading ? (
                  <Text style={[style.noResultsLocation, {marginRight: 17}]}>
                    Sorry , no results found!
                  </Text>
                ) : (
                  <View
                    style={{
                      height: 175,
                      alignSelf: 'center',
                      width: '85%',
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      marginRight: 17,
                      borderColor: 'gray', // Optional: Adds subtle border (for effect)
                      borderWidth: 1,
                      marginTop: 5,
                    }}>
                    {/* Here you can render your dropdown content */}
                    <ScrollView
                      style={style.scrollView}
                      nestedScrollEnabled={true}>
                      {customerLocations.map(location => (
                        <TouchableOpacity
                          key={location.locationId}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: '#ccc',
                          }}
                          onPress={() => handleShipLocation(location)}>
                          <Text style={{color: '#000'}}>
                            {location.locationName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}
            </View>
            <View style={{marginRight: 10, marginTop: 5}}>
              <TouchableOpacity
                style={style.plusButton}
                onPress={() => toggleLocationModal()}>
                <Image
                  style={{
                    height: 30,
                    width: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                  }}
                  source={require('../../../assets/plus.png')}
                />
              </TouchableOpacity>
            </View>
          </View>
          {hold_qty_flag === 1 && (
            <View style={{flexDirection: 'row', marginTop: 10}}>
              <TouchableOpacity
                style={{
                  width: '81%',
                  height: 50,
                  borderRadius: 10,
                  borderWidth: 0.5,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: 15,
                  paddingRight: 15,
                  marginHorizontal: 20,
                  backgroundColor: editCompanyLocation ? '#fff' : '#f1e8e6',
                }}
                onPress={() =>
                  setShowCompanyLocationList(!showCompanyLocationList)
                }>
                <Text style={{fontWeight: '600', color: '#000'}}>
                  {selectedCompanyLocationId
                    ? selectedCompanyLocation
                    : 'Company Location*'}
                </Text>

                <Image
                  source={require('../../../assets/dropdown.png')}
                  style={{width: 20, height: 20}}
                />
              </TouchableOpacity>
            </View>
          )}
          {showCompanyLocationList && editCompanyLocation && (
            <View
              style={{
                elevation: 5,
                height: 300,
                alignSelf: 'center',
                width: '90%',
                backgroundColor: '#fff',
                borderRadius: 10,
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
                onChangeText={filterLocation}
              />

              {filteredCompanyLocationList.length === 0 && !isLoading ? (
                <Text style={style.noCategoriesText}>
                  Sorry, no results found!
                </Text>
              ) : (
                <ScrollView nestedScrollEnabled={true}>
                  {filteredCompanyLocationList?.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        width: '100%',
                        height: 50,
                        justifyContent: 'center',
                        borderBottomWidth: 0.5,
                        borderColor: '#8e8e8e',
                      }}
                      onPress={() => handleSelectLocation(item)}>
                      <Text
                        style={{
                          fontWeight: '600',
                          marginHorizontal: 15,
                          color: '#000',
                        }}>
                        {item?.locationName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          <View style={{marginBottom: 10}} />

     

<View style={style.switchContainercorrate}>
<Switch
  trackColor={{
    false: '#767577',
    true: cartItems.length > 0 ? '#ccc' : '#81b0ff' // Gray when locked
  }}
  thumbColor={
    isCorrEnabled
      ? cartItems.length > 0
        ? '#999' // Gray thumb when locked
        : '#f5dd4b'
      : '#f4f3f4'
  }
  ios_backgroundColor="#3e3e3e"
  onValueChange={toggleCorrSwitch}
  value={isCorrEnabled}
/>


              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 15,
                  color: '#000',
                  marginLeft: 10,
                }}>
               Slide for Cor. Order
              </Text>
            </View>
          {/* <View style={style.header}>
            <Text style={style.txt}>Total Items: {cartItems.length}</Text>
          </View> */}
          <ScrollView
            horizontal
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {cartItems.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginVertical: 50,
                }}>
                <Image
                  style={{width: 150, height: 150, tintColor: 'black'}}
                  resizeMode="contain"
                  source={require('../../../assets/no-cart-product.png')}
                />
                <Text
                  style={{
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: 20,
                    textAlign: 'center',
                    marginTop: 10,
                  }}>
                  No items in cart
                </Text>
              </View>
            ) : (
              <View>
                {cartItems.map((item, index) => (
                  <View
                    key={`${item.styleId}-${item.colorId}-${item.sizeId}-${index}`}>
                    <View
                      key={`${item.styleId}-${item.colorId}-${item.sizeId}-${index}`}
                      style={{
                        marginBottom: 20,
                      }}>
                      {(index === 0 ||
                        item.styleId !== cartItems[index - 1].styleId ||
                        item.colorId !== cartItems[index - 1].colorId) && (
                        <View style={style.itemContainer}>
                          <View style={style.imgContainer}>
                            {item.imageUrls && item.imageUrls.length > 0 && (
                              <TouchableOpacity
                                onPress={() => {
                                  setPreviewImageUri(item.imageUrls[0]);
                                  setIsPreviewVisible(true);
                                  console.log(
                                    'Clicked Image URI:',
                                    item.imageUrls[0],
                                  ); // ✅ Add this
                                }}>
                                <Image
                                  source={{uri: item.imageUrls[0]}}
                                  style={{
                                    width: 100,
                                    height: 100,
                                    resizeMode: 'cover',
                                    margin: 5,
                                  }}
                                />
                              </TouchableOpacity>
                            )}
                         

                            <View style={{flex: 1}}>
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: 'bold',
                                  marginLeft: 5,
                                  color: '#000',
                                }}>
                                {item.styleName}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: 'bold',
                                  marginLeft: 5,
                                  color: '#000',
                                }}>
                                {item.styleDesc}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: 'bold',
                                  marginLeft: 5,
                                  color: '#000',
                                }}>
                                Color Name - {item.colorName}
                              </Text>
                            </View>
                            
                            <View style={style.buttonsContainer}>
                              <TouchableOpacity
                                onPress={() => openModal(item)}
                                disabled={
                                  item.sourceScreen === 'PackageDetail'
                                }>
                                <Image
                                  style={style.buttonIcon}
                                  source={require('../../../assets/edit.png')}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                      
                          <View style={style.sizehead}>
                            <View style={{flex: 2, marginLeft: 10}}>
                              <Text
                                style={{color: '#000', alignSelf: 'center'}}>
                                SIZE
                              </Text>
                            </View>
                            <View style={{flex: 2, marginLeft: 48}}>
                              <Text style={{color: '#000'}}>QUANTITY </Text>
                            </View>
                            {mobile_unorderqty_flag ? (
                              <View style={{flex: 2, marginLeft: 18}}>
                                <Text style={{color: '#000'}}>UNORDQTY </Text>
                              </View>
                            ) : null}
                            <View
                              style={{
                                flex: 2,
                                marginLeft: mobile_unorderqty_flag ? 18 : 45,
                              }}>
                              <Text style={{color: '#000'}}>
                                {pdf_flag ? 'MRP' : 'PRICE'}
                              </Text>
                            </View>

                            <View style={{flex: 2, marginLeft: 29}}>
                              <Text style={{color: '#000'}}>GST</Text>
                            </View>
                            {!pdf_flag && (
                              <View style={{width: 50, marginLeft: 30}}>
                                <Text style={{color: '#000'}}>Fixed Disc</Text>
                              </View>
                            )}
                            <View
                              style={{
                                width: 50,
                                marginLeft: 10,
                                marginRight: 22,
                              }}>
                              <Text style={{color: '#000'}}>Gross Price</Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => copyValueToClipboard(index)}>
                              <Image
                                style={{height: 25, width: 25, marginRight: 20}}
                                source={require('../../../assets/copy.png')}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                      <TouchableOpacity
                        onLongPress={() =>
                          Alert.alert(
                            'Alert',
                            'Do you want to remove this item?',
                            [
                              {text: 'Cancel', style: 'cancel'},
                              {
                                text: 'Yes',
                                onPress: () => handleRemoveItem(index),
                              },
                            ],
                          )
                        }
                        activeOpacity={0.1}>
                        <View
                          style={[
                            style.itemDetails,
                            {alignItems: 'center', paddingVertical: 5},
                          ]}>
                          {/* Size Description */}
                          <View style={{width: 50, marginRight: 5}}>
                            <Text style={{color: '#000', fontWeight: 'bold'}}>
                              {item.sizeDesc}
                            </Text>
                          </View>

                          {/* Decrease Quantity */}
                          <TouchableOpacity
                            onPress={() => handleDecrementQuantityCart(index)}>
                            <Image
                              style={{
                                height: 23,
                                width: 23,
                                marginHorizontal: 5,
                              }}
                              source={require('../../../assets/sub1.png')}
                            />
                          </TouchableOpacity>

                          {/* Quantity Input */}
                          <View
                            style={[style.quantityInputContainer, {width: 50}]}>
                            <TextInput
                              placeholderTextColor="#000"
                              style={[
                                textInputStyle,
                                {textAlign: 'center', width: '100%'},
                              ]}
                              value={
                                item.quantity !== undefined
                                  ? item.quantity.toString()
                                  : ''
                              }
                              onChangeText={text =>
                                handleQuantityChange(index, text)
                              }
                              keyboardType="numeric"
                            />
                          </View>

                          {/* Increase Quantity */}
                          <TouchableOpacity
                            onPress={() => handleIncrementQuantityCart(index)}>
                            <Image
                              style={{
                                height: 20,
                                width: 20,
                                marginLeft: 5,
                                marginRight: 10,
                              }}
                              source={require('../../../assets/add1.png')}
                            />
                          </TouchableOpacity>
                          {mobile_unorderqty_flag ? (
                            <View style={{width: 58, marginHorizontal: 5}}>
                              <Text style={{color: '#000', fontSize: 14}}>
                                {item.unOrderdQty}
                              </Text>
                            </View>
                          ) : null}

                          {/* Price Input */}
                          <View
                            style={{
                              width: 65,
                              marginLeft: Platform.select({
                                ios: 20,
                                android: 13,
                              }),
                            }}>
                            {/* <TextInput
                              style={{
                                borderWidth: 1,
                                borderColor: '#000',
                                borderRadius: 5,
                                width: '100%', // Ensures the input stays within the fixed container
                                color: '#000',
                                textAlign: 'center',
                              }}
                              value={
                                pdf_flag
                                  ? item?.mrp?.toString() || ''
                                  : isEnabled
                                  ? item?.retailerPrice?.toString() || ''
                                  : item?.dealerPrice?.toString() || ''
                              }
                              onChangeText={text =>
                                handlePriceChange(index, text)
                              }
                              keyboardType="numeric"
                            /> */}
                            <TextInput
  style={{
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    width: '100%',
    color: '#000',
    textAlign: 'center',
  }}
  value={item?.mrp?.toString() || ''} // Always use MRP from response
  onChangeText={text => handlePriceChange(index, text)}
  keyboardType="numeric"
/>
                          </View>

                          {/* GST Input */}
                          <View style={{width: 50, marginHorizontal: 5}}>
                            <TextInput
                              style={{
                                borderWidth: 1,
                                borderColor: '#000',
                                borderRadius: 5,
                                width: '100%', // Ensures the input stays within the fixed container
                                color: '#000',
                                textAlign: 'center',
                              }}
                              value={
                                gstValues[index] !== undefined
                                  ? gstValues[index]
                                  : item?.gst?.toString()
                              }
                              onChangeText={text =>
                                handleGstChange(index, text)
                              }
                              keyboardType="numeric"
                            />
                          </View>

                          {/* Fixed Discount (if applicable) */}
                          {!pdf_flag && (
                            <View style={{width: 50, marginHorizontal: 5}}>
                              <TextInput
                                style={{
                                  borderWidth: 1,
                                  borderColor: '#000',
                                  borderRadius: 5,
                                  width: '100%', // Ensures the input stays within the fixed container
                                  color: '#000',
                                  textAlign: 'center',
                                }}
                                value={
                                  fixDiscValues[index] !== undefined
                                    ? fixDiscValues[index]
                                    : item?.fixDisc?.toString()
                                }
                                onChangeText={text =>
                                  handleFixDiscChange(index, text)
                                }
                                keyboardType="numeric"
                              />
                            </View>
                          )}

                          {/* Gross Price */}
                          <View style={{width: 50, marginLeft: 13}}>
                            <Text style={{color: '#000'}}>
                              {grossPrices[index]}
                            </Text>
                          </View>

                          {/* Delete Button */}
                          <TouchableOpacity
                            onPress={() => handleRemoveItem(index)}>
                            <Image
                              style={style.buttonIcon}
                              source={require('../../../assets/del.png')}
                            />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>

                      {/* <View style={style.separator} /> */}
                    </View>
                    {(index === cartItems.length - 1 ||
                      item.styleId !== cartItems[index + 1]?.styleId ||
                      item.colorId !== cartItems[index + 1]?.colorId) && (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'lightgray',
                            paddingVertical: 10,
                            borderRadius: 20,
                            flex: 1,
                            justifyContent: 'space-between',
                          }}>
                          <View style={{width: 50, marginLeft: 18}}>
                            <Text style={{color: '#000'}}>Total</Text>
                          </View>
                          {/* <View
                          style={{flex: 2.1, marginLeft: 10, marginRight: 20}}>
                          <Text style={{color: '#000'}}>
                            {' '}
                            {calculateTotalQty(item.styleId, item.colorId)}
                          </Text>
                        </View> */}
                          <View
                            style={{
                              width: 50,

                              marginRight: 170,
                            }}>
                            <Text style={{color: '#000'}}>
                              {calculateTotalQty(item.styleId, item.colorId) !==
                              undefined
                                ? Number(
                                    calculateTotalQty(
                                      item.styleId,
                                      item.colorId,
                                    ),
                                  ).toFixed(2)
                                : '0'}
                            </Text>
                          </View>

                          {/* <View style={{ flex: 1 }}>
                          <Text style={{color:"#000"}}>Total Set: {calculateTotalItems(item.styleId, item.colorId)}</Text>
                        </View> */}
                          <View style={{width: 50, marginRight: 60}}>
                            <Text style={{color: '#000'}}>
                              {calculateTotalPrice(item.styleId, item.colorId)}
                            </Text>
                          </View>
                        </View>
                        {/* <View style={style.separatorr} /> */}
                        <View />
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          <View>
            {/* <TextInput
  ref={inputRef}
  style={{
    marginLeft: 10,
    marginTop: Platform.OS === 'ios' ? 10 : 0,
    color: isDarkTheme ? '#fff' : 'black', // Change text color based on theme
  }}
  placeholder="Enter comments"
  value={comments}
  onChangeText={handleCommentsChange}
  placeholderTextColor={isDarkTheme ? '#fff' : '#000'}
/> */}

            <TextInput
              style={{
                marginLeft: 10,
                marginTop: Platform.OS === 'ios' ? 10 : 0,
                color: isDarkTheme ? '#fff' : 'black',
              }}
              placeholder="Enter comments"
              value={comments}
              onFocus={() => console.log('TextInput focused')}
              onBlur={() => console.log('TextInput blurred')}
              onChangeText={handleCommentsChange}
              placeholderTextColor={isDarkTheme ? '#fff' : '#000'}
            />
          </View>

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: 'gray',
              marginTop: 10,
            }}></View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
              onPress={showDatePicker}
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{paddingVertical: 10}}>
                <Text style={{marginLeft: 10, color: '#000'}}>
                  {selatedDate}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
              }}
              onPress={showDatePicker}>
              <Image
                style={style.dateIcon}
                source={require('../../../assets/date.png')}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: 'gray',
              paddingVertical: 7,
            }}></View>

          <View style={{backgroundColor: '#faf7f6', borderTopWidth: 1}}>
            {/* <View style={style.bottomContainer}>
            <View style={style.row}>
              <Text style={style.label1}>Total Qty</Text>
              <Text style={style.colon}>:</Text>
              <Text style={style.value}>{totalQty}</Text>
            </View>
            <View style={style.row}>
              <Text style={style.label2}>Total Items</Text>
              <Text style={style.colon}>:</Text>
              <Text style={style.value2}>{totalItems}</Text>
            </View>
            <View style={style.row}>
              <Text style={style.label3}>Total Gst</Text>
              <Text style={style.colon}>:</Text>
              <Text style={style.value3}>{totalGst}</Text>
            </View>
            <View style={style.row}>
              <Text style={style.label3}>Total Amt</Text>
              <Text style={style.colon}>:</Text>
              <Text style={style.value3}>{totalAmount}</Text>
            </View>
          </View> */}

            <View
              style={{
                marginHorizontal: 15,
                marginBottom: 15,
                marginVertical: 25,
              }}>
              <OrderDetailRow label="Total Qty" value={formattedTotalQty} />
              <OrderDetailRow label="Total Items" value={totalItems} />
              <OrderDetailRow label="Total Gst" value={totalGst} />
              <OrderDetailRow label="Round Off" value={roundOff} />
              <OrderDetailRow label="Total Amt" value={totalAmount} />
            </View>

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

                    <Text style={style.headerTxt}>{'Price Type '}</Text>
                    <View style={style.container1}>
                      <View style={style.container2}>
                        <TouchableOpacity
                          style={style.container3}
                          onPress={togglePriceListDropdown}>
                          <Text style={{fontWeight: '600', color: '#000'}}>
                            {selectedPriceList || 'Select'}
                          </Text>
                          <Image
                            source={require('../../../assets/dropdown.png')}
                            style={{width: 20, height: 20}}
                          />
                        </TouchableOpacity>
                        {showPriceListDropdown && (
                          <View style={style.dropdownContentstate}>
                            <ScrollView
                              style={style.scrollView}
                              nestedScrollEnabled={true}>
                              {priceListOptions.map((item, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={style.dropdownItem}
                                  onPress={() => handleSelectPriceList(item)}>
                                  <Text style={style.dropdownText}>
                                    {item.priceListName}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>

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
                                onPress={() =>
                                  handleSelectInvoiceFormat(format)
                                }>
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

            {/* <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
          /> */}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
              date={shipDate ? new Date(shipDate) : new Date()} // Use the previously selected date
              onHide={() => {}}
            />
            <View>
              <Modal
                animationType="fade"
                transparent={true}
                visible={isLocationModalVisible}
                onRequestClose={() => {
                  toggleLocationModal();
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
                          {flex: 1, textAlign: 'center'},
                        ]}>
                        Location Details
                      </Text>

                      <TouchableOpacity onPress={handleCloseModalLocation}>
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
                          errorFields.includes('state')
                            ? style.errorBorder
                            : null,
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
                        <Text style={style.errorText}>
                          Please Enter Phone Number
                        </Text>
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
                        <Text style={style.errorText}>
                          Please Enter City Or Town
                        </Text>
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
                        <Text style={style.errorText}>
                          Please Enter Pincode
                        </Text>
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
                        <Text style={style.errorText}>
                          Please Enter Country
                        </Text>
                      )}

                      <TouchableOpacity
                        onPress={handleLocationModalPick}
                        style={{
                          padding: 10,
                          borderWidth: 1,
                          borderRadius: 5,
                          borderColor: locationErrorFields.includes(
                            'locationLatLong',
                          )
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
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </View>
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
      <TouchableOpacity
        onPress={PlaceAddOrder}
        disabled={isSubmitting} // Disable button when submitting
        style={{
          borderWidth: 1,
          // backgroundColor: '#f55951',
          backgroundColor: '#F09120',
          paddingVertical: 15,
          paddingHorizontal: 20,
          opacity: isSubmitting ? 0.5 : 1, // Dim button when submitting
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
          }}>
          {isSubmitting ? 'Placing Order...' : 'PLACE ORDER'}
        </Text>
      </TouchableOpacity>
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
    switchContainercorrate: {
      paddingLeft: 10, // Add padding if you want some space from the left edge
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:"flex-end",
      marginHorizontal:5
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
    inputt: {
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 5,
      padding: Platform.OS === 'ios' ? 15 : 10,
      marginBottom: Platform.OS === 'ios' ? 10 : 5,
      width: '100%',
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
export default Cart;
