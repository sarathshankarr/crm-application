import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import {RadioGroup} from 'react-native-radio-buttons-group';
import {API} from '../../config/apiConfig';
import CustomCheckBox from '../../components/CheckBox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';

const ProductPackagePublish = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryStylesData, setSearchQueryStylesData] = useState('');

  const [selectedId, setSelectedId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [stylesData, setStylesData] = useState([]);
  const [checkedId, setCheckedId] = useState(null);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0); // Track scroll position
  const [checkedStyleIds, setCheckedStyleIds] = useState([]);
  const [checkedModalIds, setCheckedModalIds] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const colorScheme = useColorScheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedDistributorDetails, setSelectedDistributorDetails] =
    useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllModel, setSelectAllModel] = useState(false);

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [searchKey, setSearchKey] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const userData=useSelector(state=>state.loggedInUser);
  const userId=userData?.userId;

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
        pincode:'',
        locationName:'',
        locationDescription:'',
      });
      setSearchQuery('');
      setSearchQueryStylesData('');
    }
  };
  const [inputValues, setInputValues] = useState({
    firstName: '',
    phoneNumber: '',
    whatsappId: '',
    cityOrTown: '',
    state: '',
    country: '',
    pincode:'',
    locationName:'',
    locationDescription:'',
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

    selectedId === '1' ? getisValidDistributors() : getisValidCustomer();
    toggleModal();
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
      pincode: '',
      pan: '',
      gstNo: '',
      creditLimit: 0,
      paymentReminderId: 0,
      companyId: companyId,
      locationName: inputValues.locationName,
      locationCode: '',
      locationDescription: inputValues.locationDescription,
      userId:userId,
      linkType: 3
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
      currencyId: 9,
      country: inputValues.country,
      pincode: inputValues.pincode,
      customerLevel: '',
      pan: '',
      gstNo: '',
      riskId: 0,
      myItems: '',
      creditLimit: 0,
      paymentReminderId: 26,
      dayId: 0,
      files: [],
      remarks: '',
      transport: 0,
      mop: '',
      markupDisc: 0,
      companyId: companyId,
      locationName: inputValues.locationName,
      locationCode: '',
      locationDescription:inputValues.locationDescription,
      userId:userId,
      linkType: 3
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
        // Close the modal
        toggleModal();
      })
      .catch(error => {
        console.error('Error adding Distributor:', error);
      });
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

  const handleEndReached = () => {
    if (pageNo < totalPages && !isFetching) {
      setPageNo(prevPageNo => prevPageNo + 1);
    }
  };

  const handleScroll = event => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  const radioButtons = [
    {
      id: '1',
      label: 'Distributor',
      value: 'distributor',
      labelStyle: {color: '#000'},
      color: '#1F74BA',
    },
    {
      id: '2',
      label: 'Retailer',
      value: 'retailer',
      labelStyle: {color: '#000'},
      color: '#1F74BA',
    },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };
  // const getAllProducts = async companyId => {
  //   setLoading(true);
  //   const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA_NEW}/${companyId}`;
  //   axios
  //     .get(apiUrl, {
  //       headers: {
  //         Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //       },
  //     })
  //     .then(response => {
  //       setStylesData(response?.data?.response?.stylesList || []);
  //     })
  //     .catch(error => {
  //       console.error('Error:', error);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  const getAllProducts = async (reset = false) => {
    if (loading || loadingMore) return; 
    setLoading(reset); 

    const apiUrl = `${global?.userData?.productURL}${
      API.GET_ALL_PRODUCT_PUBLISH_LAZY
    }/${from}/${to}/${companyId}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      const newTasks = response?.data?.response?.stylesList; 
      if (reset) {
        setStylesData(newTasks);
      } else {
        setStylesData(prevTasks => [...prevTasks, ...newTasks]);
      }

      if (newTasks.length < 15) {
        setHasMoreTasks(false); 
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTasks = () => {
    if (!hasMoreTasks || loadingMore) return; 

    setLoadingMore(true);
    const newFrom = from + 15;
    const newTo = to + 15;
    setFrom(newFrom);
    setTo(newTo);

    getAllProducts(false); 
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFrom(0);
    setTo(15);
    setHasMoreTasks(true);
    await getAllProducts(true); 
    setRefreshing(false);
  };


  const gettasksearch = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.SEARCH_ALL_PRODUCT_PUBLISH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      companyId: companyId,
      from: 0,
      to: 100,
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response?.data?.response?.stylesList) {
        setStylesData(response?.data?.response?.stylesList); 
        setHasMoreTasks(false); 
      } else {
        setStylesData([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDropdownSelect = option => {
    setSelectedSearchOption(option.label); 
    setSearchKey(option.value); 
    setDropdownVisible(false); 
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSearch = () => {
    if (!searchKey) {
      Alert.alert('Alert', 'Please select an option from the dropdown before searching');
      return; // Exit the function if no search key is selected
    }
    
    if (!searchQuery.trim()) {
      Alert.alert('Alert', 'Please select an option from the dropdown before searching');
      return; // Exit if the search query is empty
    }
  
    gettasksearch(); // Call the search function if the dropdown and query are valid
  };
  

  const handleSearchInputChange = query => {
    setSearchQuery(query);
  
    // If query is cleared, reset tasks and fetch all
    if (query.trim() === '') {
      getAllProducts(true); // Call the fetchTasks function to load all tasks
    }
  };

  const searchOption = [
    {label: 'id', value: 1},
    {label: 'Sty Nme', value: 3},
    {label: 'Sty Des', value: 4},
    {label: 'Color', value: 5},
  ];

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

  const generateCatelog = async () => {
    if (isGenerating) return; // Prevent duplicate requests

    setIsGenerating(true); // Set loading state to true

    const customerIdOrDistributorId =
      selectedId === '2' ? selectedCustomerId : selectedDistributorId;

    const getWhatsappId = (id, isCustomer) => {
      if (isCustomer) {
        const customer = customers.find(cust => cust.customerId === id);
        return customer ? customer.whatsappId : '';
      } else {
        const distributor = distributors.find(dist => dist.id === id);
        return distributor ? distributor.whatsappId : '';
      }
    };
    

    const requestData = {
      stylesPublishList: checkedStyleIds.flatMap(styleId => 
        checkedModalIds.map(customerId => ({
          styleId: styleId,
          customerId: customerId,
          phoneNo: getWhatsappId(customerId, selectedId === '2'),
          messageStts: 'Pending',
          customerTypes: selectedId === '2' ? 1 : 2,
        }))
      ),
      loggedInUserWhatsappNumber: '', // Set this to the appropriate value if available
      companyId: companyId,
      userId:userId,
      linkType: 3,
    };

    try {
      const apiUrl =`${global?.userData?.productURL}${API.GENERATE_CATE_LOG}`;
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });


      // Show success alert and reset checkbox selection
      Alert.alert(
        'Success',
        'Styles published successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setCheckedStyleIds([]);
            },
          },
        ],
        {cancelable: false},
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error generating catalog:', error);
      // Optionally show an error alert here
      Alert.alert(
        'Error',
        'An error occurred while publishing styles. Please try again.',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } finally {
      setIsGenerating(false); // Set loading state to false
      setModalVisible(false); // Close the modal
    }
  };

  const handlePublish = () => {
    if (selectedId === '1') {
      getDistributorsDetails();
    } else if (selectedId === '2') {
      getCustomersDetails();
    }
    setModalVisible(true);
  };

  useEffect(() => {
    if (companyId) {
      getAllProducts(companyId);
    }
  }, [companyId, pageNo]);

  const isAnyCheckboxSelected = () => {
    return checkedStyleIds.length > 0 || checkedModalIds.length > 0;
  };

  const handleCheckBoxToggleStyle = styleId => {
    setCheckedStyleIds(
      prevIds =>
        prevIds.includes(styleId)
          ? prevIds.filter(id => id !== styleId) // Uncheck if already checked
          : [...prevIds, styleId], // Check if not checked
    );
  };

  const handleCheckBoxToggleModal = (id, item) => {
    setCheckedModalIds(prevIds =>
      prevIds.includes(id)
        ? prevIds.filter(item => item !== id)
        : [...prevIds, id],
    );
  };
  const handleSelectAllToggle = () => {
    if (selectAll) {
      // Uncheck all checkboxes
      setCheckedStyleIds([]);
    } else {
      // Check all checkboxes
      const allStyleIds = stylesData.map(item => item.styleId);
      setCheckedStyleIds(allStyleIds);
    }
    setSelectAll(!selectAll);
  };
  const handleCloseModal = () => {
    // Reset checkbox state
    setCheckedModalIds([]);
    setSelectAllModel(false);
    setSearchQuery(''); // Clear search query
    setSearchQueryStylesData(''); // Clear search query for styles data
    setModalVisible(false);
  };

  const handleCloseModalDisRet = () => {
    setIsModalVisible(false);
    setInputValues([]); // Assuming inputValues should be an array too
    setErrorFields([]); // Reset errorFields to an empty array
  };

  const handleSelectAllToggleModal = () => {
    setSelectAllModel(prevState => {
      const newState = !prevState; // Toggle selectAllModel

      if (newState) {
        // Determine which IDs to select based on selectedId
        if (selectedId === '1') {
          // Select all distributors
          const allDistributorsIds = distributors.map(item => item.id);
          setCheckedModalIds(prevIds => [
            ...new Set([...prevIds, ...allDistributorsIds]),
          ]); // Ensure no duplicates
        } else if (selectedId === '2') {
          // Select all customers
          const allCustomersIds = customers.map(item => item.customerId);
          setCheckedModalIds(prevIds => [
            ...new Set([...prevIds, ...allCustomersIds]),
          ]); // Ensure no duplicates
        }
      } else {
        // Uncheck all checkboxes
        setCheckedModalIds(prevIds => {
          if (selectedId === '1') {
            // Remove all distributors IDs
            return prevIds.filter(
              id => !distributors.map(item => item.id).includes(id),
            );
          } else if (selectedId === '2') {
            // Remove all customers IDs
            return prevIds.filter(
              id => !customers.map(item => item.customerId).includes(id),
            );
          }
          return prevIds;
        });
      }

      return newState; // Update the selectAllModel state
    });
  };

  const filteredStylesData = () => {
    if (!searchQueryStylesData) return stylesData;
    return stylesData.filter(
      item =>
        item.styleName
          .toLowerCase()
          .includes(searchQueryStylesData.toLowerCase()) ||
        item.colorName
          .toLowerCase()
          .includes(searchQueryStylesData.toLowerCase()),
    );
  };

  const filteredModalData = data => {
    if (!searchQuery) return data;
    return data.filter(item => {
      const searchString = searchQuery.toLowerCase();
      const nameField =
        selectedId === '1' ? item.distributorName : item.firstName;
      return (
        nameField.toLowerCase().includes(searchString) ||
        (item.whatsappId &&
          item.whatsappId.toLowerCase().includes(searchString)) ||
        (item.emailId && item.emailId.toLowerCase().includes(searchString))
      );
    });
  };

  const renderItem = ({item}) => (
    <View style={styles.row}>
      {item?.styleId && <CustomCheckBox
        isChecked={checkedStyleIds.includes(item?.styleId)}
        onToggle={() => handleCheckBoxToggleStyle(item?.styleId)}
      />}
      <Text style={styles.cell1}>{item?.styleName}</Text>
      <Text style={styles.cell2}>{item?.colorName}</Text>
      <Text style={styles.cell3}>{item?.mrp}</Text>
    </View>
  );

  const renderModalContent = () => {
    const modalData =
      selectedId === '1'
        ? filteredModalData(distributors)
        : filteredModalData(customers);

    return (
      <FlatList
        data={modalData}
        keyExtractor={item =>
          item?.id ? item?.id.toString() : Math.random().toString()
        }
        renderItem={({item}) => (
          <View style={styles.modalItem}>
            <View style={{marginLeft: 10}}>
              <CustomCheckBox
                isChecked={checkedModalIds.includes(
                  selectedId === '1' ? item?.id : item?.customerId,
                )}
                onToggle={() =>
                  handleCheckBoxToggleModal(
                    selectedId === '1' ? item?.id : item?.customerId,
                    item,
                  )
                }
              />
            </View>
            <Text style={{flex: 1, color: '#000', marginLeft: 5}}>
              {selectedId === '1' ? item?.distributorName : item?.firstName}
            </Text>
            <Text style={{flex: 0.8, color: '#000', marginRight: 3}}>
              {item?.emailId}
            </Text>
            <Text style={{flex: 0.9, color: '#000'}}>{item?.whatsappId}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noDataText}>Sorry, no results found!</Text>
        }
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.head1}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            style={{height: 25, width: 25, marginLeft: 2}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.txt1}>Product Publish</Text>
        <View style={styles.flexSpacer} />
        {selectedId === '1' && (
          <TouchableOpacity onPress={toggleModal} style={styles.head3}>
            <Image
              style={{height: 20, width: 20}}
              source={require('../../../assets/add1.png')}
            />
          </TouchableOpacity>
        )}
        {selectedId === '2' && (
          <TouchableOpacity onPress={toggleModal} style={styles.head3}>
            <Image
              style={{height: 20, width: 20}}
              source={require('../../../assets/add1.png')}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.head2,
            {
              backgroundColor: isAnyCheckboxSelected() ? '#1F74BA' : '#f0f0f0', // Example colors
              opacity: isAnyCheckboxSelected() ? 1 : 1,
            },
          ]}
          onPress={handlePublish}
          disabled={!isAnyCheckboxSelected()}>
          <Text style={styles.txt2}>Publish</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 5,
          marginTop: 10,
        }}>
        <View style={styles.searchContainer}>
          {/* <TextInput
            style={[
              styles.searchInput,
              {color: colorScheme === 'dark' ? '#000' : '#000'}, // Adjust text color based on theme
            ]}
            placeholder="Search"
            value={searchQueryStylesData}
            onChangeText={handleSearchInputChange}
            placeholderTextColor={colorScheme === 'dark' ? '#000' : '#000'} // Adjust placeholder color based on theme
          /> */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={handleSearchInputChange}
          />
          
          <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleDropdown}>
            <Text style={{color: '#000'}}>
              {selectedSearchOption || 'Select'}
            </Text>
            <Image
              style={styles.image}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSearch}>
          <Image
            style={styles.searchIcon}
            source={require('../../../assets/search.png')}
          />
        </TouchableOpacity>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={setSelectedId}
          selectedId={selectedId}
          containerStyle={styles.radioGroup}
        />
      </View>
      {dropdownVisible && (
        <View style={styles.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity
                style={styles.dropdownOption}
                key={index}
                onPress={() => handleDropdownSelect(option)}>
                <Text style={{color: '#000'}}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <View style={styles.topheader}>
        <View style={{marginLeft: 10}}>
          <CustomCheckBox
            isChecked={selectAll}
            onToggle={handleSelectAllToggle}
          />
        </View>
        <Text style={styles.txt4}>Style Name</Text>
        <Text style={styles.txt5}>Color</Text>
        <Text style={styles.txt6}>Price</Text>
      </View>
      {loading && pageNo === 1 ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (stylesData?.length===1 && stylesData[0]===null) || stylesData?.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found! </Text>
      ) : (
        // <FlatList
        //   data={stylesData}
        //   keyExtractor={item => item.styleId?.toString()} // Ensure styleId is unique
        //   renderItem={renderItem}
        //   onEndReached={handleEndReached}
        //   onEndReachedThreshold={0.1}
        //   onScroll={handleScroll}
        //   ListEmptyComponent={
        //     <Text style={styles.noDataText}>Sorry, no results found!</Text>
        //   }
        //   ListFooterComponent={
        //     loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        //   }
        // />
        <FlatList
        data={stylesData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.styleId}-${index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreTasks} // Load more when scrolled to the end
        onEndReachedThreshold={0.2} // Adjust this value to control when to load more
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : null
        }
      />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => handleCloseModal}>
        <View style={styles.modalContainer1}>
          <View style={styles.modalContent1}>
            <View
              style={{
                backgroundColor: '#1F74BA',
                borderRadius: 10,
                marginHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center', // Ensure vertical alignment
                justifyContent: 'space-between', // Space between text and close button
                flexDirection: 'row',
                alignItems: 'center', // Ensure vertical alignment
                justifyContent: 'space-between', // Space between text and close button
                marginTop: 10,
                paddingVertical: 5,
                paddingVertical: 5,
              }}>
              {selectedId === '1' && (
                <Text style={[styles.txt3, {flex: 1, textAlign: 'center'}]}>
                  All Distributors
                </Text>
              )}
              {selectedId === '2' && (
                <Text style={[styles.txt3, {flex: 1, textAlign: 'center'}]}>
                  All Retailer
                </Text>
              )}
              <TouchableOpacity
                onPress={handleCloseModal}
                style={{paddingHorizontal: 10}}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainerone}>
              <TextInput
                style={[
                  styles.searchInput1,
                  {color: colorScheme === 'dark' ? '#000' : '#000'}, // Adjust text color based on theme
                ]}
                onChangeText={text => setSearchQuery(text)}
                placeholder="Search"
                placeholderTextColor={colorScheme === 'dark' ? '#000' : '#000'} // Adjust placeholder color based on theme
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#f0f0f0',
                paddingVertical: 10, // Add padding if needed
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 10,
              }}>
              <View style={{marginLeft: 10}}>
                <CustomCheckBox
                  isChecked={selectAllModel}
                  onToggle={handleSelectAllToggleModal}
                />
              </View>

              <Text style={{flex: 0.9, color: '#000', marginLeft: 3}}>
                Name
              </Text>
              <Text style={{flex: 0.7, color: '#000'}}>Email</Text>
              <Text style={{flex: 0.7, color: '#000'}}>Whatsapp Number</Text>
            </View>
            {renderModalContent()}
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={generateCatelog}
                style={[
                  styles.closeButton,
                  isGenerating && styles.closeButtonDisabled,
                ]}
                disabled={isGenerating}>
                <Text style={styles.closeButtonText}>
                  {isGenerating ? 'Processing...' : 'ADD'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          toggleModal();
        }}>
        <View style={styles.modalContainerr}>
          <View style={styles.modalContentt}>
            {/* <View style={{backgroundColor: '#1F74BA',
                borderRadius: 10,
                marginHorizontal: 10,
                marginTop: 10,
                flexDirection:'row',
                // justifyContent:'space-between',
                // alignItems:'center',
                width:'100%',
                marginBottom:10
                }}>
              <View>
            <Text style={[styles.txt3, {marginLeft:10, paddingVertical:5, fontSize:16, alignSelf:'center'}]}>
              {selectedId === '1' ? 'Distributor Details' : ' Retailer Details'}
            </Text>
              </View>
            <View
              style={{ marginRight: 10, alignSelf:'flex-end'}}>

          <TouchableOpacity onPress={handleCloseModalDisRet}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
              </View>
            </View> */}
            <View
              style={{
                backgroundColor: '#1F74BA',
                borderRadius: 10,
                // marginHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center', // Ensure vertical alignment
                justifyContent: 'space-between', // Space between text and close button
                marginTop: 10,
                paddingVertical: 5,
                marginBottom: 15,
              }}>
              {selectedId === '1' && (
                <Text style={[styles.txt3, {flex: 1, textAlign: 'center'}]}>
                  Distributors Details
                </Text>
              )}
              {selectedId === '2' && (
                <Text style={[styles.txt3, {flex: 1, textAlign: 'center'}]}>
                  Retailer Details
                </Text>
              )}
              <TouchableOpacity
                onPress={handleCloseModalDisRet}
                style={{paddingHorizontal: 10}}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={{width:'100%', height:'80%'}}>

            <TextInput
              style={[
                styles.input,
                {color: '#000'},
                errorFields.includes('firstName') ? styles.errorBorder : null,
              ]}
              placeholder={
                selectedId === '1' ? 'Distributor Name *' : 'Retailer Name *'
              }
              placeholderTextColor="#000"
              onChangeText={text =>
                setInputValues({...inputValues, firstName: text})
              }
              value={inputValues.firstName}
            />
            {errorFields.includes('firstName') && (
              <Text style={styles.errorText}>
                {selectedId === '1'
                  ? 'Please Enter Distributor Name'
                  : 'Please Enter Retailer Name'}
              </Text>
            )}

            <TextInput
              style={[
                styles.input,
                {color: '#000'},
                errorFields.includes('phoneNumber') ? styles.errorBorder : null,
              ]}
              placeholder="Phone Number *"
              placeholderTextColor="#000"
              onChangeText={text =>
                setInputValues({...inputValues, phoneNumber: text})
              }
            />
            {errorFields.includes('phoneNumber') && (
              <Text style={styles.errorText}>Please Enter Phone Number</Text>
            )}

            <TextInput
              style={[styles.input, {color: '#000'}]}
              placeholder="Whatsapp Number *"
              placeholderTextColor="#000"
              onChangeText={text =>
                setInputValues({...inputValues, whatsappId: text})
              }
            />
            {errorFields.includes('whatsappId') && (
              <Text style={styles.errorText}>Please Enter Whatsapp Number</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {color: '#000'},
                errorFields.includes('cityOrTown') ? styles.errorBorder : null,
              ]}
              placeholder="City or Town *"
              placeholderTextColor="#000"
              onChangeText={text =>
                setInputValues({...inputValues, cityOrTown: text})
              }
            />
            {errorFields.includes('cityOrTown') && (
              <Text style={styles.errorText}>Please Enter City Or Town</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {color: '#000'},
                errorFields.includes('state') ? styles.errorBorder : null,
              ]}
              placeholderTextColor="#000"
              placeholder="State *"
              onChangeText={text =>
                setInputValues({...inputValues, state: text})
              }
            />
            {errorFields.includes('state') && (
              <Text style={styles.errorText}>Please Enter State</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {color: '#000'},
                errorFields.includes('country') ? styles.errorBorder : null,
              ]}
              placeholderTextColor="#000"
              placeholder="Country *"
              onChangeText={text =>
                setInputValues({...inputValues, country: text})
              }
            />
            {errorFields.includes('country') && (
              <Text style={styles.errorText}>Please Enter Country</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {color: '#000'},
                errorFields.includes('pincode') ? styles.errorBorder : null,
              ]}
              placeholderTextColor="#000"
              placeholder="Pincode *"
              onChangeText={text =>
                setInputValues({...inputValues, pincode: text})
              }
            />
            {errorFields.includes('pincode') && (
              <Text style={styles.errorText}>Please Enter Pincode</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {color: '#000'},
                errorFields.includes('locationName') ? styles.errorBorder : null,
              ]}
              placeholderTextColor="#000"
              placeholder="Location Name *"
              onChangeText={text =>
                setInputValues({...inputValues, locationName: text})
              }
            />
            {errorFields.includes('locationName') && (
              <Text style={styles.errorText}>Please Enter Location Name</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {color: '#000'},
                errorFields.includes('locationDescription') ? styles.errorBorder : null,
              ]}
              placeholderTextColor="#000"
              placeholder="Location Description *"
              onChangeText={text =>
                setInputValues({...inputValues, locationDescription: text})
              }
            />
            {errorFields.includes('locationDescription') && (
              <Text style={styles.errorText}>Please Enter Location Description</Text>
            )}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveButtonPress}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            </ScrollView>
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
  },
  txt1: {
    color: '#000',
    fontSize: 20,
    fontWeight: '500',
    marginHorizontal: 10,
  },
  head1: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexSpacer: {
    flex: 1,
  },
  head2: {
    alignItems: 'center',
    borderWidth: 1,
    padding: 6,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  head3: {
    alignItems: 'center',
    borderWidth: 1,
    padding: 6,
    borderRadius: 10,
    marginLeft: 5,
    backgroundColor: '#1F74BA',
  },
  txt2: {
    color: '#000',
    fontWeight: '500',
  },
  txt3: {
    color: '#000',
    fontWeight: '500',
    alignSelf: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
   
    flex: 1,
  },
  searchButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000',
  },
  searchInput: {},
  image: {
    height: 20,
    width: 20,
    marginLeft:2,
    marginRight:2
  },
  searchIcon: {
    width: 25,
    height: 25,
    marginLeft:2
  },
  dropdownContent1: {
    elevation: 5,
    // height: 220,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  radioGroup: {
    flexDirection: 'row',
  },
  topheader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  txt4: {
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginLeft: 30,
  },
  txt5: {
    fontWeight: 'bold',
    color: '#000',
    flex: 0.8,
  },
  txt6: {
    fontWeight: 'bold',
    color: '#000',
    flex: 0.4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell1: {
    flex: 1,
    color: '#000',
    marginLeft: 10,
  },
  cell2: {
    flex: 0.8,
    color: '#000',
  },
  cell3: {
    flex: 0.4,
    color: '#000',
  },
  modalContainer1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent1: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalItem: {
    paddingVertical: 10,
    flexDirection: 'row',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#1F74BA',
    borderRadius: 5,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: '500',
  },
  searchContainerone: {
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalContainerr: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentt: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 5, // Add elevation for shadow on Android
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
});

export default ProductPackagePublish;
