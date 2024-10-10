import React, {useState, useEffect, useCallback} from 'react';
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


const NewCall = () => {
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
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
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
  

  useEffect(() => {
    setSelectedLocation('Select');
    setCustomerLocations([]);
  }, [isEnabled]);

  const getCustomerLocations = () => {
    let customerType;

    const switchStatus = isEnabled;

    if (switchStatus) {
      customerType = 1; // Retailer
    } else {
      customerType = 3; // Distributor
    }


    const customerId = switchStatus
      ? selectedCustomerId
      : selectedDistributorId;
    // if(!customerId) return;

    const text = isEnabled
      ? 'customerId in getCustomerLocations :===>'
      : 'dtributorId in getCustomerLocations :===>';

    if (!customerId) return;

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
      getCustomerLocations();
    }
  };
  const handleLocationSelection = (location) => {
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

  const getNameAndLocation = useCallback(
    async (
      call_customerType,
      call_customerId,
      call_locId,
      call_locationName,
    ) => {
      if (call_customerType && call_customerType === 1) {
        setIsEnabled(true);

        if (call_customerId) {
          await setSelectedCustomerId(call_customerId);
        }
        if (customers.length === 0) {
          await getCustomersDetails();
        }
        let foundItem = customers?.find(
          item => item?.customerId === call_customerId,
        );
        if (foundItem) {
          setSelectedCustomerOption(foundItem?.firstName);
        }
      } else {
        setIsEnabled(false);

        if (call_customerId) {
          await setSelectedDistributorId(call_customerId);
        }
        if (distributor.length === 0) {
          await getDistributorsDetails();
        }
        let foundItem = distributor?.find(item => item?.id === call_customerId);
        if (foundItem) {
          setSelectedDistributorOption(foundItem.firstName);
        }
      }

      if (call_locId) {
        await setSelectedLocationiD(call_locId);
        await getCustomerLocations();
        let foundItem = customerLocations?.find(
          item => item.locationId === call_locId,
        );
        if (foundItem) {
          setSelectedLocation(foundItem.locationName);
        }
      } else if (call_locationName) {
        setSelectedLocation(call_locationName);
      }
    },
    [customers, distributor, customerLocations],
  );

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

  const handleSearchCustomer = text => {
    const filtered = customers.filter(customer =>
      customer?.firstName.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredCustomer(filtered);
  };

  const handleShipDropdownClickCustomer = () => {
    if (!shipFromToClickedCustomer) {
      if (customers.length === 0) {
        getCustomersDetails();
      }
    }
    setShipFromToClickedCustomer(!shipFromToClickedCustomer);
  };

  const handleDropdownSelectCustomer = customer => {
    if (selectedCustomerId === customer.customerId) {
      setSelectedCustomerOption(''); // Reset customer option
      setSelectedCustomerId(null); // Reset customer ID
    } else {
      setSelectedCustomerOption(customer.firstName); // Set customer option
      setSelectedCustomerId(customer.customerId); // Set customer ID
    }
    setShipFromToClickedCustomer(false); // Close Customer dropdown after selection (optional)
  };
  

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

  const handleShipDropdownClickDistributor = () => {
    if (!shipFromToClickedDistributor) {
      if (distributor.length === 0) {
        getDistributorsDetails();
      }
    }
    setShipFromToClickedDistributor(!shipFromToClickedDistributor);
  };
  const handleSearchDistributor = text => {
    const filtered = distributor.filter(distributor =>
      distributor?.firstName.toLowerCase().includes(text.toLowerCase()),
    );
    // setShipFromToClickedDistributor(filtered);
    setFilterdDistributor(filtered);
  };

  const handleDropdownSelectDistributor = distributor => {
    if (selectedDistributorId === distributor.id) {
      setSelectedDistributorOption(''); // Reset distributor option
      setSelectedDistributorId(null); // Reset distributor ID
    } else {
      setSelectedDistributorOption(distributor.firstName); // Set distributor option
      setSelectedDistributorId(distributor.id); // Set distributor ID
    }
    setShipFromToClickedDistributor(false); // Close Distributor dropdown after selection (optional)
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

  const getUsers = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ADD_USERS}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        if (
          response.data &&
          response.data.status &&
          response.data.status.success
        ) {
          setUsers(response.data.response.users);
          setFilteredUsers(response.data.response.users); // Initialize filtered users
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
  const statusOptions = [
    'Open',
    'Pending',
    'Assigned',
    'In Progress',
    'Completed',
  ];

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
      created_on: formatCreatedOn(callData?.created_on) || new Date(),
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
      <TouchableOpacity
        onPress={handleShipDropdownClickCustomer}
        style={styles.dropdownButton}>
        <Text style={{color: '#000'}}>
          {selectedCustomerOption || 'Select '}
        </Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>

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
      <TouchableOpacity
        onPress={handleShipDropdownClickDistributor}
        style={styles.dropdownButton}>
        <Text style={{color: '#000'}}>
          {selectedDistributorOption || 'Select'}
        </Text>
        <Image
          source={require('../../../assets/dropdown.png')}
          style={{width: 20, height: 20}}
        />
      </TouchableOpacity>

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
    <ScrollView  style={{flex:1, backgroundColor:'#ffffff'}}>

    <View style={{flex: 1, backgroundColor: '#fff'}}>
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
        Users
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#1F74BA',
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
});

export default NewCall;
