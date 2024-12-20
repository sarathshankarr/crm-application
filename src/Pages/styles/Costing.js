import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Costing = () => {
  const navigation = useNavigation(); // Use the useNavigation hook
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
  const [addedCostingDetails, setAddedCostingDetails] = useState(null);


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

  const getAllOrders = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    if (loading || loadingMore) return;
    setLoading(reset);

    if (reset) {
      setFrom(0);
      setTo(20);
      setHasMoreTasks(true);
    }

    const apiUrl = `${global?.userData?.productURL}${API.GET_COSTING}/${customFrom}/${customTo}/${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      const newTasks = response?.data?.response?.costingRequest || [];

        console.log('response.data costingg====>', response?.data?.response?.costingRequest);

      if (reset) {
        setFilteredOrdersList(newTasks);
      } else {
        setFilteredOrdersList(prevTasks => [...(prevTasks || []), ...newTasks]);
      }
      newTasks.forEach(task => {
        if (task.costId) {
          getAlladdedCostinDetails(task.costId);
        }
      });
      
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

  const getAlladdedCostinDetails = async (costingId) => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_ADDED_COSTING_DETAILSL}/${costingId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
  
      if (response?.data?.response) {
        console.log('Added costing details:', response?.data?.response);
        return response?.data?.response;  // Return the data immediately
      } else {
        console.log(`No added costing details found for costId: ${costingId}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching added costing details:', error);
      return null;
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
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFrom(0);
    setTo(20);
    setSearchKey(0);
    setFilterFlag(false);
    setSearchQuery('');
    setSelectedSearchOption('');
    setHasMoreTasks(true);
    await getAllOrders(true, 0, 20);
    setRefreshing(false);
  };

  const gettasksearch = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    const apiUrl = `${global?.userData?.productURL}${API.SEARCH_COSTING}`;
    const requestBody = {
      searchKey: searchKey,
      searchValue: searchQuery,
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

      if (response?.data?.response?.costingRequest) {
        const newOrders = response?.data?.response?.costingRequest.filter(
          order => order !== null,
        );

        setFilteredOrdersList(prevDetails =>
          reset ? newOrders : [...prevDetails, ...newOrders],
        );
        setHasMoreTasks(newOrders?.length >= 15);
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

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSearch = () => {
    if (!searchKey) {
      Alert.alert(
        'Alert',
        'Please select an option from the dropdown before searching',
      );
      return;
    }
    if (!searchQuery.trim()) {
      Alert.alert(
        'Alert',
        'Please select an option from the dropdown before searching',
      );
      return;
    }
    setFilterFlag(true);
    setFrom(0);
    setTo(20);

    gettasksearch(true, 0, 20);
  };

  const searchOption = [
    {label: 'Created By', value: 1},
    {label: 'Created Date', value: 2},
  ];

  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      console.log('inside the handleSearchInputChange');
      onRefresh(true);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };
  const goToAddNewCosting = () => {
    navigation.navigate('NewCosting');
  };

  
  const renderOrderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={async () => {
          try {
            if (item.costId) {
              const fetchedAddedCostingDetails = await getAlladdedCostinDetails(item.costId);
  
              if (fetchedAddedCostingDetails) {
                // Log the fetched details for debugging
                console.log('Fetched costing details:', fetchedAddedCostingDetails);
  
                // Extract the checkBox value from the first element of costingRequest
                const checkBoxValue = fetchedAddedCostingDetails?.costingRequest?.[0]?.checkBox;
  
                console.log('Navigating based on checkBox:', checkBoxValue);
  
                // Navigate based on the checkBox value
                if (checkBoxValue === 1) {
                  navigation.navigate('NewCosting', {
                    costingRequest: fetchedAddedCostingDetails,
                    costId: item.costId,
                  });
                } else if (checkBoxValue === 2) {
                  navigation.navigate('Cushion', {
                    costingRequest: fetchedAddedCostingDetails,
                    costId: item.costId,
                  });
                } else {
                  Alert.alert('Error', 'Invalid or missing checkBox value.');
                }
              } else {
                console.log(`No added costing details found for costId: ${item.costId}`);
              }
            }
          } catch (error) {
            console.error('Error fetching costing details:', error);
          }
        }}
      >
        <Text style={styles.orderIdText}>{item.costId}</Text>
        <Text style={styles.customerText}>{item.userName}</Text>
        <Text style={styles.qtyText}>{item.createdDate}</Text>
      </TouchableOpacity>
    );
  };
  
  
  
  
  
  
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.Topheader}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              style={styles.backImage}
              source={require('../../../assets/back_arrow.png')}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Costing</Text>
        </View>
        <TouchableOpacity
          onPress={goToAddNewCosting}
          style={styles.rightSection}>
          <Text style={styles.addCostingText}>ADD NEW COSTING</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[styles.searchInput, {color: '#000'}]}
            value={searchQuery}
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
      <View style={styles.header}>
        <Text style={styles.orderIdText}>S.No</Text>
        <Text style={styles.customerText}>Created By</Text>
        <Text style={styles.qtyText}>Created Date</Text>
      </View>
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
        <FlatList
          data={filteredOrdersList}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => `${item?.id}-${index}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMoreTasks}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  Topheader: {
    flexDirection: 'row',
    alignItems: 'center', // Vertical alignment for items
    justifyContent: 'space-between', // Space left and right sections
    marginHorizontal: 10,
    marginVertical: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically align back button and "Costing" text
  },
  backButton: {
    marginRight: 10, // Add spacing between back button and "Costing" text
  },
  backImage: {
    height: 25,
    width: 25,
  },
  headerText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#000',
  },
  rightSection: {
    borderWidth: 1,
    justifyContent: 'flex-end',
    marginHorizontal: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'lightgray',
  },
  addCostingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // Adjust color if needed
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
    backgroundColor: '#1F74BA',
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
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: 'lightgray',
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderIdText: {
    flex: 0.8,
    color: '#000',
  },
  customerText: {
    flex: 1.5,
    color: '#000',
  },
  qtyText: {
    flex: 0.9,
    textAlign: 'center',
    color: '#000',
  },
});

export default Costing;
