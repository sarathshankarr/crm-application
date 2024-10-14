import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToPending,
  removeFromCart,
  setLoggedInUser,
  setUserRole,
  updateCartItem,
} from '../../redux/actions/Actions';
import Clipboard from '@react-native-clipboard/clipboard';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import ModalComponent from '../../components/ModelComponent';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cart = () => {
  const userRole = useSelector(state => state.userRole) || '';
  const loggedInUser = useSelector(state => state.loggedInUser);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);
  const comp_flag = selectedCompany?.comp_flag;
  const [isLoading, setIsLoading] = useState(false);

  const [inputValuess, setInputValuess] = useState({});
  const cartItems = useSelector(state => state.cartItems);
  console.log("cartItems=====>", cartItems)
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
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedDistributorDetails, setSelectedDistributorDetails] =
    useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const [modalItems, setModalItems] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const [showCompanyLocationList, setShowCompanyLocationList] = useState(false);
  const [editCompanyLocation, setEditCompanyLocation] = useState(true);
  const [locationCompanyList, setLocationCompanyList] = useState([]);
  const [filteredCompanyLocationList, setFilteredCompanyLocationList] = useState([]);
  const [selectedCompanyLocation, setSelectedCompanyLocation] = useState('');
  const [selectedCompanyLocationId, setSelectedCompanyLocationId] = useState(0);
  const [gstValues, setGstValues] = useState({});

  const handleGstChange = (index, text) => {
    setGstValues(prevValues => ({
      ...prevValues,
      [index]: text, // Update GST value for the specific index/item
    }));
  };


  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

  const textInputStyle = {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    flex: 0.4,
    color: '#000', // Default text color
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

  const handleRemoveItem = index => {
    dispatch(removeFromCart(index));
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

  useEffect(() => {
  }, [companyId]);

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

  // const [locationInputValues, setLocationInputValues] = useState({});

  const toggleLocationModal = () => {
    setIsLocationModalVisible(!isLocationModalVisible);
    if (isLocationModalVisible) {
      // Reset locationInputValues and locationErrorFields when modal is closing
      setLocationInputValues({
        locationName: '',
        phoneNumber: '',
        locality: '',
        cityOrTown: '',
        state: '',
        pincode: '',
        country: '',
      });
      setLocationErrorFields([]);
    }
  };

  const [inputValues, setInputValues] = useState({
    firstName: '',
    phoneNumber: '',
    whatsappId: '',
    cityOrTown: '',
    state: '',
    country: '',
    pincode: '',
    locationName: '',
    locationDescription: ''


  });

  const [errorFields, setErrorFields] = useState([]);

  const handleSaveButtonPress = () => {
    const mandatoryFields = [
      'firstName',
      'phoneNumber',
      'whatsappId',
      'cityOrTown',
      'state',
      'country',
      'pincode',
      'locationName',
      'locationDescription'
    ];
    setErrorFields([]);
    const missingFields = mandatoryFields.filter(field => !inputValues[field]);

    if (missingFields.length > 0) {
      setErrorFields(missingFields);
      Alert.alert('Alert', 'Please fill in all mandatory fields');
      return;
    }

    const hasExactlyTenDigits = /^\d{10,12}$/;
    if (!hasExactlyTenDigits.test(Number(inputValues?.phoneNumber))) {
      Alert.alert('Alert', 'Please Provide a valid Phone Number');
      return;
    }

    if (inputValues?.whatsappId?.length > 0) {
      if (!hasExactlyTenDigits.test(inputValues?.whatsappId)) {
        Alert.alert('Alert', 'Please Provide a valid Whatsapp Number');
        return;
      }
    }

    isEnabled ? getisValidCustomer() : getisValidDistributors();
    toggleModal();
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

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
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
      state: inputValues.state,
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
      // userId:userId
    };

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
        toggleModal();
      })
      .catch(error => {
        console.error('Error adding customer:', error);
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
      state: inputValues.state,
      stateId: 0,
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
      userId: userId
    };

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
        toggleModal();
      })
      .catch(error => {
        console.error('Error adding Distributor:', error);
      });
  };

  const handleCommentsChange = text => {
    setComments(text);
  };
  const getLocations = () => {

    if (comp_flag === 0) {
      const apiUrl0 = `${global?.userData?.productURL}${API.GET_LOCATION_C0_LIST}`;
      setIsLoading(true);
      const requestData = {
        styleName: ""
      }
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

          const filteredLocationList = locationList?.filter(c =>
            c.customerType === 2 && c.customerId === companyId
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

  }

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
    setCustomerLocations([])

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

  const handleCustomerSelection = (firstName, lastName, customerId) => {
    setSelectedCustomer(`${firstName} ${lastName}`);
    setClicked(false);
    setSelectedCustomerId(customerId);
    setSelectedLocation('');
    setSelectedShipLocation('');
    setSelectedLocationId('');
    setSelectedShipLocationId('');
    getCustomerLocations(customerId);
    const selectedCustomer = customers.find(
      customer => customer.customerId === customerId,
    );
    setSelectedCustomerDetails([selectedCustomer]);
  };

  const handleDistributorSelection = (firstName, lastName, customerId) => {
    setSelectedDistributor(`${lastName}`);
    setClicked(false);
    setSelectedDistributorId(customerId);
    setSelectedLocation('');
    setSelectedShipLocation('');
    setSelectedShipLocationId('');
    setSelectedLocationId('');
    getCustomerLocations(customerId);
    const selectedDistributor = distributors.find(
      distributor => distributor.id === customerId,
    );
    setSelectedDistributorDetails([selectedDistributor]);
  };

  const handleLocationSelection = location => {
    setSelectedLocation(location.locationName);
    setSelectedLocationId(location.locationId);
    setFromToClicked(false);
  };
  const handleShipLocation = location => {
    setSelectedShipLocation(location.locationName);
    setSelectedShipLocationId(location.locationId);
    setShipFromToClicked(false);
  };

  const PlaceAddOrder = () => {
    let customerType;

    const switchStatus = isEnabled; // Assuming isEnabled controls the switch

    if (switchStatus) {
      customerType = 1; // Retailer
    } else {
      customerType = 2; // Distributor
    }

    if (isSubmitting) return;

    // if (userRole === 'admin') {
    //   if (!selectedCustomer || !selectedDistributor) {
    //     Alert.alert('Alert', 'Please select a customer.');
    //     return;
    //   }
    // } else if (userRole === 'Distributor' || userRole === 'Retailer') {
    //   // No alert for Distributor or Retailer
    // }

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
    // for (let i = 0; i < cartItems.length; i++) {
    //   if (!cartItems[i].price || parseFloat(cartItems[i].price) === 0) {
    //     Alert.alert(
    //       'crm.codeverse.co.says',
    //       'Style price is mandatory for creating an order..',
    //     );
    //     return;
    //   }
    // }

    if (!selectedLocationId) {
      Alert.alert('Alert', 'Please select a Billing to location.');
      return;
    }


    if (!selectedShipLocationId) {
      Alert.alert('Alert', 'Please select a Shipping to location.');
      return;
    }
    // if (!selectedCompanyLocationId) {
    //   Alert.alert('Alert', 'Please select a Company Location.');
    //   return;
    // }
    if (cartItems.length === 0) {
      Alert.alert('Alert', 'No items selected. Please add items to the cart.');
      return;
    }

    // return;

    setIsSubmitting(true);

    const d_pkg_flag = cartItems.some(item => item.sourceScreen === 'PackageDetail') ? 1 : 0;
    const pkg_id = cartItems.some(item => item.sourceScreen === 'PackageDetail')
    const colorId = cartItems.some(item => item.sourceScreen === 'PackageDetail')
      ? cartItems.find(item => item.sourceScreen === 'PackageDetail').colorId
      : cartItems[0]?.colorId || null; // Fallback to null if cartItems is empty

    // if (!loggedInUser || !userRole) {
    //   // Redirect to login screen or handle not logged in scenario
    //   return;
    // }


    // let roleId = ''; // Initialize roleId

    // Check if userRole is an array and not empty
    // if (Array.isArray(userRole) && userRole.length > 0) {
    //   roleId = userRole[0].id; // Using the first id from userRole array
    // } else {
    // }

    // Extract roleId from loggedInUser if userRole is not an array or is empty
    // if (!roleId && loggedInUser.role && loggedInUser.role.length > 0) {
    //   roleId = loggedInUser.role[0].id;
    // }

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
    // const gstRate = 5;
    // const totalGst = cartItems.reduce((acc, item) => {
    //   const itemTotalPrice = parseFloat(isEnabled ? item?.retailerPrice : item?.dealerPrice) * parseInt(item.quantity);
    //   const itemGst = (itemTotalPrice * gstRate) / 100;
    //   return acc + itemGst;
    // }, 0);

    const totalGst = cartItems.reduce((acc, item, index) => {
      const gstPercentage = parseFloat(gstValues[index] !== undefined ? gstValues[index] : item.gst); // Use updated GST if available
      const itemTotalPrice = parseFloat(isEnabled ? item?.retailerPrice : item?.dealerPrice) * parseInt(item.quantity, 10);
      const itemGst = (itemTotalPrice * gstPercentage) / 100;
      return acc + itemGst; // Sum GST
    }, 0).toFixed(2);
    

    // Calculate total amount
    const totalAmount = (parseFloat(totalPrice) + parseFloat(totalGst)).toFixed(2); // Total amount formatted to 2 decimal places


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
      companyLocId: '0',
      agentId: '0',
      subAgentId: '0',
      orderLineItems: cartItems.map((item, index) => ({
        qty: item.quantity.toString(),
        styleId: item.styleId,
        colorId: colorId,
        gscodeMapId: 42,
        sizeDesc: item.sizeDesc,
        gsCode: '8907536002462',
        availQty: item.quantity.toString(),
        // price: item.price.toString(),
        price: isEnabled ? item?.retailerPrice?.toString() : item?.dealerPrice?.toString() || item?.price?.toString(),
        gross: ((parseFloat(isEnabled ? item?.retailerPrice : item?.dealerPrice) * 1.05) * parseInt(item?.quantity || 1)).toString(),
        // gross: parseFloat((parseFloat(isEnabled ? item?.retailerPrice?.toString() : item?.dealerPrice?.toString()) + parseFloat(item.gst.toString())) * parseInt(item.quantity))?.toString(),
        // gross: (parseFloat(isEnabled ? item?.retailerPrice : item?.dealerPrice) || item?.price) * parseInt(item.quantity),
        discountPercentage: '0',
        discountAmount: '0',
        gst: gstValues[index] !== undefined ? gstValues[index] : item.gst,
        total: (parseFloat(isEnabled ? item?.retailerPrice?.toString() : item?.dealerPrice?.toString()) || item?.price?.toString() * parseInt(item.quantity))?.toString(),
        itemStatus: 'OPEN',
        pcqty: '0',
        pack_qty: 0,
        sizeId: item.sizeId,
        packageId: item.sourceScreen === 'PackageDetail' ? (item.packageId ? Number(item.packageId) : 0) : 0,
        cedgeFlag: '0',
        cedgeStyleId: 0,
        discountPercentageSec: 0,
        discountPercentageThird: 0,
        closeFlag: 0,
        statusFlag: 0,
        poId: 0,

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
      // companyLocId: selectedCompanyLocationId,
      linkType: 3,
      currentCreditLimit: 0.00
    };

    console.log("Req body ===> ", requestData);
    // return;

    console.log("requestData:", JSON.stringify(requestData, null, 2));
    axios
      .post(global?.userData?.productURL + API.ADD_ORDER_DATA, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        // Handle success response
        dispatch({ type: 'CLEAR_CART' });
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
    console.warn('A date has been picked: ', date);

    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns month from 0-11
    const year = date.getFullYear();

    // Format date as DD-MM-YYYY
    const formattedDate = `${day}-${month}-${year}`;

    setSelectedDate('Expected Delivery Date: ' + formattedDate);
    hideDatePicker();
    setShipDate(date.toISOString().split('T')[0]);
  };

  const handleQuantityChange = (index, text) => {
    const updatedItems = [...cartItems];
    const parsedQuantity = parseInt(text, 10);

    if (!isNaN(parsedQuantity) || text === '') {
      updatedItems[index].quantity = text === '' ? '' : parsedQuantity;
      dispatch(updateCartItem(index, updatedItems[index]));
    }
  };
  const handlePriceChange = (index, text) => {
    const updatedItems = [...cartItems];
    const parsedPrice = parseFloat(text);

    if (!isNaN(parsedPrice) || text === '') {

      if (isEnabled) {
        updatedItems[index].retailerPrice = text === '' ? '' : text;
      } else {
        updatedItems[index].dealerPrice = text === '' ? '' : text;
      }
      dispatch(updateCartItem(index, updatedItems[index]));
    }
  };

  const handleIncrementQuantityCart = index => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity =
      parseInt(updatedItems[index].quantity, 10) + 1;
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
    const { styleId, colorId, quantity } = item;

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
    const quantity = parseInt(item.quantity);
    if (!isNaN(quantity)) {
      return total + quantity;
    } else {
      return total; // Ignore invalid quantities
    }
  }, 0);

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
    for (let item of cartItems) {
      if (item.styleId === styleId && item.colorId === colorId) {
        totalPrice += (isEnabled ? item?.retailerPrice?.toString() : item?.dealerPrice?.toString() || item?.price?.toString()) * item.quantity;
      }
    }
    return totalPrice;
  };

  const uniqueSets = new Set(
    cartItems.map(item => `${item.styleId}-${item.colorId}-${item.sizeId}`),
  );
  const totalItems = uniqueSets.size;
  // Assuming cartItems and gstValues are defined properly
  const totalPrice = cartItems.reduce((total, item) => {
    // Parse price and quantity to floats and integers respectively
    const parsedPrice = parseFloat(isEnabled ? item?.retailerPrice?.toString() : item?.dealerPrice?.toString() || item?.price?.toString());
    const parsedQuantity = parseInt(item.quantity, 10);

    // Check if parsedPrice and parsedQuantity are valid numbers
    if (!isNaN(parsedPrice) && !isNaN(parsedQuantity)) {
      return total + parsedPrice * parsedQuantity;
    } else {
      return total; // Ignore invalid items
    }
  }, 0).toFixed(2); // Total price formatted to 2 decimal places

  // Calculate total GST based on the totalPrice and user input (gstValues)
  const totalGst = cartItems.reduce((acc, item, index) => {
    const gstPercentage = parseFloat(gstValues[index] !== undefined ? gstValues[index] : item.gst); // Use updated GST if available
    const itemTotalPrice = parseFloat(isEnabled ? item?.retailerPrice : item?.dealerPrice) * parseInt(item.quantity, 10);
    const itemGst = (itemTotalPrice * gstPercentage) / 100;
    return acc + itemGst; // Sum GST
  }, 0).toFixed(2);
  
  // Calculate total amount
  const totalAmount = (parseFloat(totalPrice) + parseFloat(totalGst)).toFixed(2); // Total amount formatted to 2 decimal places

  // Outputting the total values for debugging
  console.log("Total Price:", totalPrice);
  console.log("Total GST:", totalGst);
  console.log("Total Amount:", totalAmount);


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
      linkType: 7
    };

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
  };

  const handleCloseModalLocation = () => {
    setIsLocationModalVisible(false);
    setLocationInputValues([]); // Assuming inputValues should be an array too
    setLocationErrorFields([]);
  };

  useEffect(() => {
  }, []); // Run only once when component mounts


  const handleSelectLocation = (item) => {
    setSelectedCompanyLocation(item.locationName);
    setSelectedCompanyLocationId(item.locationId);
    setShowCompanyLocationList(false);
  }

  const filterLocation = text => {
    const filtered = locationCompanyList.filter((item) => item?.locationName?.toUpperCase().includes(text?.toUpperCase()));
    setFilteredCompanyLocationList(filtered);
  }

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ marginVertical: 10, backgroundColor: '#fff' }}>
          {/* <View style={{marginHorizontal: 10, marginVertical: 2}}>
            <Text style={{color: '#000', fontWeight: 'bold'}}>Customers</Text>
          </View> */}
          <View style={style.switchContainer}>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
            <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#000' }}>
              Slide For Retailer
            </Text>
          </View>
          <View>
            {/* {userRole &&
              userRole.toLowerCase &&
              userRole.toLowerCase() === 'admin' && ( */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                  }}
                  onPress={handleDropdownClick}>
                  <Text style={{ fontWeight: '600', color: "#000" }}>
                    {isEnabled ? (selectedCustomerDetails &&
                      selectedCustomerDetails.length > 0
                      ? `${selectedCustomerDetails[0].firstName} ${selectedCustomerDetails[0].lastName}`
                      : 'Retailer *') : (selectedDistributorDetails &&
                        selectedDistributorDetails.length > 0
                        ? `${selectedDistributorDetails[0].distributorName}`
                        : 'Distributor *')}
                  </Text>

                  <Image
                    source={require('../../../assets/dropdown.png')}
                    style={{ width: 20, height: 20 }}
                  />
                </TouchableOpacity>

                {clicked && (
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
                      value={searchQuery}
                      onChangeText={text => setSearchQuery(text)}
                    />
                    {!isEnabled ? (
                      filteredDistributors.length === 0 && !isLoading ? (
                        <Text style={style.noCategoriesText}>
                          Sorry, no results found!
                        </Text>
                      ) : (
                        <ScrollView>
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
                      <ScrollView>
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
              <View>
                <TouchableOpacity
                  onPress={toggleModal}
                  style={style.plusButton}>
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
            {/* )} */}
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
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
              <Text style={{ fontWeight: '600', color: "#000", }}>
                {selectedLocation.length > 0
                  ? `${selectedLocation}`
                  : 'Billing to *'}
              </Text>
              <Image
                source={require('../../../assets/dropdown.png')}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            {fromToClicked ?
              (customerLocations.length === 0 && !isLoading)
                ? (
                  <Text style={[style.noResultsLocation, { marginLeft: 15 }]}>
                    Sorry , no results found!
                  </Text>
                ) : (
                  <View
                    style={{
                      elevation: 5,
                      height: 175,
                      alignSelf: 'center',
                      width: '85%',
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      marginLeft: 15,
                    }}>
                    {/* Here you can render your dropdown content */}
                    <ScrollView>
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
                          <Text style={{ color: '#000' }}>
                            {location.locationName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
          </View>

          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={handleShipDropdownClick}
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
                marginLeft: 5,
              }}>
              {/* <Text>{selectedShipLocation.locationName || 'Shiping to *'}</Text> */}
              <Text style={{ fontWeight: '600', color: "#000" }}>
                {selectedShipLocation.length > 0
                  ? `${selectedShipLocation}`
                  : 'Shipping to *'}
              </Text>
              <Image
                source={require('../../../assets/dropdown.png')}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            {shipFromToClicked
              && (
                (customerLocations.length === 0 && !isLoading)
                  ? (
                    <Text style={[style.noResultsLocation, { marginRight: 17 }]}>
                      Sorry , no results found!
                    </Text>
                  ) : (
                    <View
                      style={{
                        elevation: 5,
                        height: 175,
                        alignSelf: 'center',
                        width: '85%',
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        marginRight: 17,
                      }}>
                      {/* Here you can render your dropdown content */}
                      <ScrollView>
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
                            <Text style={{ color: '#000' }}>
                              {location.locationName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  ))}
          </View>
          <View>
            <TouchableOpacity
              style={style.plusButton}
              onPress={() => toggleLocationModal()}>
              <Image
                style={{
                  height: 30,
                  width: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                  marginTop: 5,
                }}
                source={require('../../../assets/plus.png')}
              />
            </TouchableOpacity>
          </View>
        </View>


        {/* <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              style={{
                width: '82%',
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
              onPress={()=>setShowCompanyLocationList(!showCompanyLocationList)}>
              <Text style={{ fontWeight: '600', color: "#000" }}>
                {selectedCompanyLocationId ? selectedCompanyLocation : "Company Location*"}
              </Text>

              <Image
                source={require('../../../assets/dropdown.png')}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
          </View> */}
        {/* {showCompanyLocationList && editCompanyLocation && (
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
                      onPress={() => handleSelectLocation(item)
                      }>
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
          )} */}
        <View style={{ marginBottom: 10 }} />

        <ScrollView style={style.container}>
          {/* <View style={style.header}>
            <Text style={style.txt}>Total Items: {cartItems.length}</Text>
          </View> */}
          {cartItems.length === 0 ? (
            <Text style={{ marginLeft: 10, color: '#000' }}>
              No items in cart
            </Text>
          ) : (
            <View>
              {cartItems.map((item, index) => (
                <View
                  key={`${item.styleId}-${item.colorId}-${item.sizeId}-${index}`}>
                  <View
                    key={`${item.styleId}-${item.colorId}-${item.sizeId}-${index}`}
                    style={{ marginBottom: 20 }}>
                    {(index === 0 ||
                      item.styleId !== cartItems[index - 1].styleId ||
                      item.colorId !== cartItems[index - 1].colorId) && (
                        <View style={style.itemContainer}>
                          <View style={style.imgContainer}>
                            {item.imageUrls && item.imageUrls.length > 0 && (
                              <Image
                                source={{ uri: item.imageUrls[0] }}
                                style={{
                                  width: 100,
                                  height: 100,
                                  resizeMode: 'cover',
                                  margin: 5,
                                }}
                              />
                            )}

                            <View style={{ flex: 1 }}>
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
                              <TouchableOpacity onPress={() => openModal(item)}>
                                <Image
                                  style={style.buttonIcon}
                                  source={require('../../../assets/edit.png')}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View style={style.sizehead}>
                            <View style={{ flex: 0.5 }}>
                              <Text style={{ color: '#000', marginLeft: 10 }}>
                                SIZE
                              </Text>
                            </View>
                            <View style={{ flex: 0.8, marginLeft: 29 }}>
                              <Text style={{ color: '#000' }}>QUANTITY</Text>
                            </View>
                            <View style={{ flex: 0.5, marginLeft: 30 }}>
                              <Text style={{ color: '#000' }}>PRICE</Text>
                            </View>
                            <View style={{ flex: 0.4, marginLeft: 30 }}>
                              <Text style={{ color: '#000' }}>GST</Text>
                            </View>
                            <View style={{ flex: 0.5, marginLeft: 10, marginRight: 10 }}>
                              <Text style={{ color: '#000' }}>GROSS PRICE</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => copyValueToClipboard(index)}>
                              <Image
                                style={{ height: 25, width: 25, marginRight: 10 }}
                                source={require('../../../assets/copy.png')}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    <View style={style.itemDetails}>
                      <View style={{ flex: 0.3, }}>
                        <Text style={{ color: '#000' }}>{item.sizeDesc}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDecrementQuantityCart(index)}>
                        <Image
                          style={{
                            height: 23,
                            width: 23,
                            marginHorizontal: 10,
                          }}
                          source={require('../../../assets/sub1.png')}
                        />
                      </TouchableOpacity>
                      <View style={style.quantityInputContainer}>
                        <TextInput
                          placeholderTextColor="#000"
                          style={textInputStyle}
                          value={
                            item.quantity !== undefined
                              ? item.quantity.toString()
                              : ''
                          }
                          onChangeText={text =>
                            handleQuantityChange(index, text)
                          }
                          keyboardType="numeric" // Optional: Restricts input to numeric keyboard
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => handleIncrementQuantityCart(index)}>
                        <Image
                          style={{
                            height: 20,
                            width: 20,
                            marginHorizontal: 10,
                          }}
                          source={require('../../../assets/add1.png')}
                        />
                      </TouchableOpacity>
                      <View style={{ flex: 0.4, marginLeft: 10, borderBottomWidth: 1, borderColor: "#000" }}>
                        <TextInput
                          style={{ color: '#000', alignSelf: "center" }}
                          value={isEnabled ? item?.retailerPrice?.toString() : item?.dealerPrice?.toString() || item?.price?.toString()}
                          // value={item.price}
                          onChangeText={text => handlePriceChange(index, text)}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 0.2, marginLeft: 30, borderBottomWidth: 1, borderColor: "#000" }}>
                        <TextInput
                          style={{ color: '#000', alignSelf: "center" }}
                          value={gstValues[index] !== undefined ? gstValues[index] : item.gst.toString()} // Using gstValues if edited, otherwise item.gst
                          onChangeText={text => handleGstChange(index, text)} // Update gstValues state
                          keyboardType="numeric" // Numeric input
                        />
                      </View>

                      <View style={{ flex: 0.3, marginLeft: 30 }}>
                        <Text style={{ color: '#000' }}>
                          {(
                            Number(isEnabled ? item?.retailerPrice?.toString() : item?.dealerPrice?.toString() || item?.price?.toString()) * Number(item.quantity)
                          ).toString()}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                        <Image
                          style={style.buttonIcon}
                          source={require('../../../assets/del.png')}
                        />
                      </TouchableOpacity>
                    </View>
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
                          }}>
                          <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={{ color: '#000' }}>Total</Text>
                          </View>
                          <View style={{ flex: 1.5 }}>
                            <Text style={{ color: '#000' }}>
                              {' '}
                              {calculateTotalQty(item.styleId, item.colorId)}
                            </Text>
                          </View>
                          {/* <View style={{ flex: 1 }}>
                          <Text style={{color:"#000"}}>Total Set: {calculateTotalItems(item.styleId, item.colorId)}</Text>
                        </View> */}
                          <View style={{ flex: 0.9 }}>
                            <Text style={{ color: '#000' }}>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={showDatePicker}
              style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ marginLeft: 10, color: '#000' }}>
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
              marginTop: 10,
            }}></View>
          <View>
            <TextInput
              style={{
                marginLeft: 10,
                color: isDarkTheme ? '#fff' : 'black', // Change text color based on theme
              }}
              placeholder="Enter comments"
              value={comments}
              onChangeText={handleCommentsChange}
              placeholderTextColor={isDarkTheme ? '#fff' : '#000'} // Placeholder color
            />
          </View>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: 'gray',
              paddingVertical: 7,
            }}></View>
        </ScrollView>

        <View style={{ backgroundColor: '#faf7f6', borderTopWidth: 1 }}>
          <View style={style.bottomContainer}>
            <View style={style.row}>
              <Text style={style.label1}>Total Qty</Text>
              <Text style={style.value}>: {totalQty}</Text>
            </View>
            <View style={style.row}>
              <Text style={style.label2}>Total Items</Text>
              <Text style={style.value2}>: {totalItems}</Text>
            </View>
            <View style={style.row}>
              <Text style={style.label3}>Total Gst</Text>
              <Text style={style.value3}>: {totalGst}</Text>
            </View>
            <View style={style.row}>
              <Text style={style.label3}>Total Amt</Text>
              <Text style={style.value3}>: {totalAmount}</Text>
            </View>
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
                <View style={{
                  backgroundColor: '#1F74BA',
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
                  <Text style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}>{isEnabled ? "Retailer Details" : "Distributor Details"}</Text>
                  <TouchableOpacity onPress={handleCloseModalDisRet} style={{ alignSelf: 'flex-end' }} >
                    <Image
                      style={{ height: 30, width: 30, marginRight: 5 }}
                      source={require('../../../assets/close.png')}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ width: '100%', height: '65%' }}>

                  <TextInput
                    style={[
                      style.input,
                      { color: '#000' },
                      errorFields.includes('firstName')
                        ? style.errorBorder
                        : null,
                    ]}
                    placeholder={
                      isEnabled ? 'Retailer Name *' : 'Distributor Name *'
                    }
                    placeholderTextColor="#000"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, firstName: text })
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
                      { color: '#000' },
                      errorFields.includes('phoneNumber')
                        ? style.errorBorder
                        : null,
                    ]}
                    placeholder="Phone Number *"
                    placeholderTextColor="#000"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, phoneNumber: text })
                    }
                  />
                  {errorFields.includes('phoneNumber') && (
                    <Text style={style.errorText}>Please Enter Phone Number</Text>
                  )}

                  <TextInput
                    style={[style.input, { color: '#000' }]}
                    placeholder="Whatsapp Number *"
                    placeholderTextColor="#000"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, whatsappId: text })
                    }
                  />
                  {errorFields.includes('whatsappId') && (
                    <Text style={style.errorText}>
                      Please Enter Whatsapp Number
                    </Text>
                  )}
                  <TextInput
                    style={[
                      style.input,
                      { color: '#000' },
                      errorFields.includes('cityOrTown')
                        ? style.errorBorder
                        : null,
                    ]}
                    placeholder="City or Town *"
                    placeholderTextColor="#000"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, cityOrTown: text })
                    }
                  />
                  {errorFields.includes('cityOrTown') && (
                    <Text style={style.errorText}>Please Enter City Or Town</Text>
                  )}
                  <TextInput
                    style={[
                      style.input,
                      { color: '#000' },
                      errorFields.includes('state') ? style.errorBorder : null,
                    ]}
                    placeholderTextColor="#000"
                    placeholder="State *"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, state: text })
                    }
                  />
                  {errorFields.includes('state') && (
                    <Text style={style.errorText}>Please Enter State</Text>
                  )}
                  <TextInput
                    style={[
                      style.input,
                      { color: '#000' },
                      errorFields.includes('country') ? style.errorBorder : null,
                    ]}
                    placeholderTextColor="#000"
                    placeholder="Country *"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, country: text })
                    }
                  />
                  {errorFields.includes('country') && (
                    <Text style={style.errorText}>Please Enter Country</Text>
                  )}
                  <TextInput
                    style={[
                      style.input,
                      { color: '#000' },
                      errorFields.includes('pincode') ? style.errorBorder : null,
                    ]}
                    placeholderTextColor="#000"
                    placeholder="Pincode *"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, pincode: text })
                    }
                  />
                  {errorFields.includes('pincode') && (
                    <Text style={style.errorText}>Please Enter Pincode</Text>
                  )}
                  <TextInput
                    style={[
                      style.input,
                      { color: '#000' },
                      errorFields.includes('locationName') ? style.errorBorder : null,
                    ]}
                    placeholderTextColor="#000"
                    placeholder="Location Name *"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, locationName: text })
                    }
                  />
                  {errorFields.includes('locationName') && (
                    <Text style={style.errorText}>Please Enter Location Name</Text>
                  )}
                  <TextInput
                    style={[
                      style.input,
                      { color: '#000' },
                      errorFields.includes('locationDescription') ? style.errorBorder : null,
                    ]}
                    placeholderTextColor="#000"
                    placeholder="Location Description *"
                    onChangeText={text =>
                      setInputValues({ ...inputValues, locationDescription: text })
                    }
                  />
                  {errorFields.includes('locationDescription') && (
                    <Text style={style.errorText}>Please Enter Location Description</Text>
                  )}
                  <TouchableOpacity
                    style={style.saveButton}
                    onPress={handleSaveButtonPress}>
                    <Text style={style.saveButtonText}>Save</Text>
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
            date={new Date()}  // Default parameter for `date`
            onHide={() => { }}
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
                      backgroundColor: '#1F74BA',
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
                    <Text style={[style.modalTitle, { flex: 1, textAlign: 'center' }]}>Location Details</Text>

                    <TouchableOpacity onPress={handleCloseModalLocation}>
                      <Image
                        style={{ height: 30, width: 30, marginRight: 5 }}
                        source={require('../../../assets/close.png')}
                      />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={{ width: '100%', height: '65%' }}>
                    <TextInput
                      style={[
                        style.input,
                        { color: '#000' },
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
                        { color: '#000' },
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
                    />
                    {locationErrorFields.includes('phoneNumber') && (
                      <Text style={style.errorText}>
                        Please Enter Phone Number
                      </Text>
                    )}
                    <TextInput
                      style={[style.input, { color: '#000' }]}
                      placeholder="Locality"
                      placeholderTextColor="#000"
                      onChangeText={text =>
                        setLocationInputValues({
                          ...locationInputValues,
                          locality: text,
                        })
                      }
                    />
                    <TextInput
                      style={[
                        style.input,
                        { color: '#000' },
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
                    />
                    {locationErrorFields.includes('cityOrTown') && (
                      <Text style={style.errorText}>
                        Please Enter City Or Town
                      </Text>
                    )}
                    <TextInput
                      style={[
                        style.input,
                        { color: '#000' },
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
                    />
                    {locationErrorFields.includes('state') && (
                      <Text style={style.errorText}>Please Enter State</Text>
                    )}
                    <TextInput
                      style={[
                        style.input,
                        { color: '#000' },
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
                    />
                    {locationErrorFields.includes('pincode') && (
                      <Text style={style.errorText}>Please Enter Pincode</Text>
                    )}
                    <TextInput
                      style={[
                        style.input,
                        { color: '#000' },
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
                    />
                    {locationErrorFields.includes('country') && (
                      <Text style={style.errorText}>Please Enter Country</Text>
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
    </KeyboardAvoidingView>
  );
};

const style = StyleSheet.create({
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
  },
  buttonIcon: {
    width: 25,
    height: 25,
    marginLeft: 10,
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
    color: "#000"
  },
  label2: {
    color: "#000"

  },
  label3: {
    color: "#000"
  },
  value: {
    marginLeft: 35,
    color: "#000",
    marginRight: 5
  },
  value2: {
    marginLeft: 20,
    color: "#000",
    marginRight: 5
  },
  value3: {
    marginLeft: 30,
    color: "#000",
    marginRight: 5
  },
  dateIconContainer: {
    justifyContent: 'center',
    paddingLeft: 20,
    marginHorizontal: 15,
  },
  sizehead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    paddingVertical: 5,
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
    flex: 0.3,
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
    padding: 10,
    marginBottom: 5,
    width: '100%',
  },
  errorBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
  },
  saveButton: {
    backgroundColor: '#1F74BA',
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
  noResultsLocation: {
    textAlign: 'center',
    paddingTop: 15,
    fontSize: 16,
    color: "#000",
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
    backgroundColor: '#1F74BA',
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
    marginHorizontal: 10,
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center',
  },
  scrollView: {
    maxHeight: 150,
  },
});
export default Cart;
