import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {ColorContext} from '../../components/colortheme/colorTheme';
import ReactNativeBlobUtil from 'react-native-blob-util';

const MasterLocation = () => {
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedSearchOption, setSelectedSearchOption] = useState('');
  const [searchKey, setSearchKey] = useState(0);
  const [filteredOrdersList, setFilteredOrdersList] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filterFlag, setFilterFlag] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  console.log('pdfFlag=====>', pdf_flag);
  const pdf_flag = useSelector(state => state.selectedCompany.pdf_flag);
  const compFlag = useSelector(state => state.selectedCompany.comp_flag);

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

  useEffect(() => {
    if (companyId) {
      getAllOrders(true, 0, 20);
    }
  }, [companyId]);


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchQuery('');
      if (companyId) {
        getAllOrders(true, 0, 20);
      }
    });
    return unsubscribe;
  }, [navigation, companyId,searchOption]);
  
  
  const getAllOrders = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    // console.log("getAllOrders b ", customFrom, customTo);

    if (loading || loadingMore) return;
    setLoading(reset);

    if (reset) {
      setFrom(0); // Reset pagination
      setTo(20);
      setHasMoreTasks(true); // Reset hasMoreTasks for new fetch
    }

    const apiUrl = `${global?.userData?.productURL}${
      API.MASTER_LOCATION
    }/${customFrom}/${customTo}/${companyId}`;

    console.log('getAllOrders A ', customFrom, customTo);

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      const newTasks = response.data.response.locationList;
      // console.log("response.data====>",response.data)
      if (reset) {
        setFilteredOrdersList(newTasks);
      } else {
        setFilteredOrdersList(prevTasks => [...(prevTasks || []), ...newTasks]);
      }

      if (newTasks.length < 20) {
        setHasMoreTasks(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTasks = async () => {
    if (!hasMoreTasks || loadingMore) return;

    setLoadingMore(true);
    const newFrom = to + 1;
    const newTo = to + 20;
    setFrom(newFrom);
    setTo(newTo);

    if (filterFlag) {
      try {
        await gettasksearch(false, newFrom, newTo);
      } catch (error) {
        console.error('Error while loading more orders:', error);
      } finally {
        setFrom(newFrom);
        setTo(newTo);
        setLoadingMore(false);
      }
    } else {
      try {
        await getAllOrders(false, newFrom, newTo);
      } catch (error) {
        console.error('Error while loading more orders:', error);
      } finally {
        setFrom(newFrom);
        setTo(newTo);
        setLoadingMore(false);
      }
    }
    // getAllOrders(); // Call getAllOrders here to fetch new data
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFrom(0);
    setTo(20);
    // setSearchKey(0);
    setFilterFlag(false);

    setSearchQuery('');
    // setShowSearchInput(false);
    // setSelectedSearchOption('');
    setHasMoreTasks(true);

    await getAllOrders(true, 0, 20);
    setRefreshing(false);
  };

  const gettasksearch = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    const apiUrl = `${global?.userData?.productURL}${API.MASTER_LOCATION_SEARCH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      from: customFrom,
      to: customTo,
      companyId: companyId,
    };

    console.log('gettasksearch==> ', customFrom, customTo);

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response?.data?.response?.locationList) {
        // setOrders(response.data.response.ordersList);

        const newOrders = response.data.response.locationList.filter(
          order => order !== null,
        );

        setFilteredOrdersList(prevDetails =>
          reset ? newOrders : [...prevDetails, ...newOrders],
        );
        setHasMoreTasks(newOrders?.length >= 15);

        // setHasMoreTasks(false);
      } else {
        setFilteredOrdersList([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDropdownSelect = option => {
    onRefresh();
    setTimeout(() => {
      setSelectedSearchOption(option.label);
      setSearchKey(option.value);
      setDropdownVisible(false);
      setSearchQuery('');
    }, 0);
  };
  useEffect(() => {
    if (searchOption.length > 0) {
      setSelectedSearchOption(searchOption[0].label);
      setSearchKey(searchOption[0].value);
    }
  }, [searchOption]); // This will run whenever searchOption changes

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSearch = () => {
    if (!searchKey) {
      Alert.alert(
        'Alert',
        'Please select an option from the dropdown before searching',
      );
      return; // Exit the function if no search key is selected
    }

    if (!searchQuery.trim()) {
      Alert.alert(
        'Alert',
        'Please select an option from the dropdown before searching',
      );
      return; // Exit if the search query is empty
    }

    setFilterFlag(true);
    setFrom(0);
    setTo(20);

    gettasksearch(true, 0, 20);
  };


  const renderOrderItem = ({ item }) => {
    if (!item) return null;
  
    const customerTypeMap = {
      1: 'Retailor',
      2: 'Company',
      3: 'Distributor',
    };
  
    const customerTypeText = customerTypeMap[item.customerType] || 'UNKNOWN';
  
    return (
        <TouchableOpacity
        style={styles.orderItem}
        onPress={() => {
          console.log('Clicked locationId:', item.locationId); 
          navigation.navigate('LocationEdit', {
            locationId: item.locationId,
            customerType: item.customerType, // Pass this too
          });
        }}
      >
        <Text style={styles.orderIdText}>{customerTypeText}</Text>
        <Text style={styles.customerText}>{item.fullName}</Text>
        <Text style={styles.qtyText}>{item.locationName}</Text>
        <Text style={styles.qtyText}>{item.userName}</Text>
      </TouchableOpacity>
    );
  };
  

  const searchOption = [
    {label: 'Name', value: 1},
    {label: 'Location', value: 2},
    {label: 'Created By', value: 3},
  ];

  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      console.log('inside the handleSearchInputChange');
      onRefresh(true);
    }
  };

  const AddNewLocationPage =()=>{
    navigation.navigate('AddNewLocation')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginHorizontal:10}}>
        <Text
          style={{
            color: '#000',
            fontSize: 20,
            marginLeft:7,
            fontWeight: 'bold',
            alignSelf: 'center',
          }}>
          Location Master
        </Text>
        {/* <TouchableOpacity onPress={AddNewLocationPage}  style={styles.addnewlochead}>
        <Text style={{
            color: '#000',
            fontSize: 18,
            paddingVertical:4,
            paddingHorizontal:10,
            fontWeight: 'bold',
            alignSelf: 'center',
            color:"#fff"
          }}>Add New Location</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[styles.searchInput, {color: '#000'}]}
            value={searchQuery}
            // onChangeText={text => {
            //   setSearchQuery(text);
            // }}
            onChangeText={handleSearchInputChange}
            placeholder="Search"
            placeholderTextColor="#000"
          />

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={toggleDropdown}>
            <Text style={{color: '#000'}}>
              {searchKey ? selectedSearchOption : 'Select'}
            </Text>
            <Image
              style={styles.image}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {dropdownVisible && (
        <View style={styles.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity
                style={styles.dropdownOption}
                key={`${option.value}_${index}`}
                onPress={() => handleDropdownSelect(option)}>
                <Text style={{color: '#000'}}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <ScrollView horizontal={true}>
        <View>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.orderIdText}>Distributor/Retailer/Company</Text>
            <Text style={styles.customerText}>Name</Text>
            <Text style={styles.qtyText}>Location</Text>
            <Text style={styles.qtyText}>Created By</Text>
          </View>

          {/* Content */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.activityIndicator}
            />
          ) : filteredOrdersList.length === 0 ||
            filteredOrdersList.every(item => item === null) ? (
            <Text style={styles.noResultsText}>Sorry, no results found!</Text>
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onMomentumScrollEnd={loadMoreTasks}>
              {filteredOrdersList.map((item, index) => (
                <View key={item?.id || index}>
                  {renderOrderItem({item, index})}
                </View>
              ))}
              {loadingMore && (
                <ActivityIndicator size="small" color="#0000ff" />
              )}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    container: {
      backgroundColor: 'white',
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      paddingVertical: 10,
      backgroundColor: '#f0f0f0',
    },
    orderItem: {
      flexDirection: 'row',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: 'lightgray',
    },
    borderBottomColor: '#f0f0f0',
    orderIdText: {
      width: 85, // Fixed width for each column
      textAlign: 'center',
      color: '#000',
    },
    customerText: {
      width: 130,
      textAlign: 'center',
      color: '#000',
    },
    qtyText: {
      width: 85,
      textAlign: 'center',
      color: '#000',
    },
    statusText: {
      width: 100,
      textAlign: 'center',
      color: '#000',
    },
    dateText: {
      width: 100,
      textAlign: 'center',
      color: '#000',
    },

    pdfText: {
      width: 30,
      textAlign: 'center',
      color: '#000',
    },
    pdfimg: {
      height: 30,
      width: 30,
    },
    activityIndicator: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noResultsText: {
      textAlign: 'center',
      color: '#000000',
      fontSize: 20,
      fontWeight: 'bold',
      padding: 20,
    },
    addnewlochead:{
borderWidth:1,
paddingHorizontal:5,
borderRadius:10,
backgroundColor: colors.color2,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      marginVertical: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderColor: 'gray',
      paddingHorizontal: 10,
      // borderRadius: 5,
    },
    searchInputActive: {
      color: '#000',
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 7,
      backgroundColor: '#e6e6e6',
      borderRadius: 15,
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
    image: {
      height: 20,
      width: 20,
      alignSelf: 'center',
      marginLeft: 5,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'lightgray',
      borderRadius: 15,
      marginHorizontal: 10,
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
      marginBottom: 5,
    },
    dropdownOption: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    searchIconContainer: {
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
  });

export default MasterLocation;
