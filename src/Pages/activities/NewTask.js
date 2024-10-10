import React, {useState, useEffect, useMemo, useCallback} from 'react';
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
import {useDispatch, useSelector} from 'react-redux';
import {API} from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatDateIntoDMY} from '../../Helper/Helper';
import CustomCheckBox from '../../components/CheckBox';

const NewTask = () => {
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
  const [customers, setCustomers] = useState([]);
  const [filteredCustomer, setFilteredCustomer] = useState([]);
  const [shipFromToClickedCustomer, setShipFromToClickedCustomer] =
    useState(false);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

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

  useEffect(() => {
    setSelectedLocation('Select');
    setCustomerLocations([]);
  }, [isEnabled]);

  const getCustomerLocations = () => {
    let customerType;

    // Toggle logic based on switch status
    const switchStatus = isEnabled; // Assuming isEnabled controls the switch

    if (switchStatus) {
      customerType = 1; // Retailer
    } else {
      customerType = 3; // Distributor
    }

    const customerId = switchStatus
      ? selectedCustomerId
      : selectedDistributorId;

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
          // Handle unauthorized error
        }
      });
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
      if (customers.length === 0) {
        getCustomersDetails();
      }
    }
    setShipFromToClickedCustomer(!shipFromToClickedCustomer);
  };
  const handledropdownField = () => {
    // if (!showFieldList) {
    //   if (customers.length === 0) {
    //     getFieldList();
    //   }
    // }
    setShowFieldList(!showFieldList);
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

  const handleShipDropdownClickDistributor = () => {
    if (!shipFromToClickedDistributor) {
      if (distributor.length === 0) {
        getDistributorsDetails();
      }
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
          setSelectedCustomerId(call_customerId);
        }
        if (customers.length === 0) {
          await getCustomersDetails();
        }
        let foundItem = customers?.find(
          item => item?.customerId === call_customerId,
        );
        if (foundItem) {
          setSelectedCustomerOption(foundItem.firstName);
        }
      } else {
        setIsEnabled(false);

        if (call_customerId) {
          setSelectedDistributorId(call_customerId);
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
        setSelectedLocationiD(call_locId);
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
    if (route.params && route.params.task) {
      const {task} = route.params;
      getUserRole(task.assign_to);
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
      setSelectedUserOption(foundItem.firstName);
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

  const handleDropdownSelectUser = user => {
    if (selectedUserId === user.userId) {
      setSelectedUserOption(''); // Reset user option
      setSelectedUserId(null); // Reset user ID
      setSelectedUserName(''); // Reset user name
      setSelectedStatusOption(''); // Reset status option
    } else {
      setSelectedUserOption(user.firstName); // Set user option
      setSelectedUserId(user.userId); // Set user ID
      setSelectedUserName(user.firstName); // Set user name
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
      created_on: formatCreatedOn(route.params.task.created_on || new Date()),
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
      created_by:task.created_by
    };
    // console.log('requestData======>', requestData);

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

  const statusOptions = [
    'Open',
    'Pending',
    'Assigned',
    'In Progress',
    'Completed',
  ];

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
  const renderCustomerDetails = () => (
    <View style={{}}>
      <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
        Retailer
      </Text>
      <TouchableOpacity
        onPress={handleShipDropdownClickCustomer}
        style={styles.dropdownButton}>
        <Text style={{color: '#000'}}>
          {selectedCustomerOption || 'Select'}
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
    <ScrollView style={{flex: 1, backgroundColor: '#ffffff'}}>
      <View style={{flex: 1, backgroundColor: '#fff'}}>
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
        <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
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
        <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
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
          <Text style={{color: '#000'}}>{selectedUserOption || 'Select'}</Text>
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
        <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
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
        <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
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
        <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
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
        <Text style={{marginHorizontal: 10, marginVertical: 3, color: '#000'}}>
          Due Date
        </Text>
        <View style={styles.datecontainer}>
          <TouchableOpacity onPress={showDatePickerDue}>
            <View style={{paddingVertical: 6}}>
              <Text style={{marginLeft: 10, color: '#000'}}>
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
              <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
                {filteredFieldsList.length === 0 ||
                (filteredFieldsList.length === 1 && !filteredFieldsList[0]) ? (
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  },
  datecontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
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
});

export default NewTask;
