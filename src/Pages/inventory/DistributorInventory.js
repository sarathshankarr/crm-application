import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const DistributorInventory = () => {
  const navigation = useNavigation();
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dropdownId, setDropdownId] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);

  const [hasMoreData, setHasMoreData] = useState(true);

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);

  const [searchKey, setSearchKey] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [searchFilterFlag, setsearchFilterFlag] = useState(false);



  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem(
          'initialSelectedCompany',
        );
        if (initialCompanyData) {
          setInitialSelectedCompany(JSON.parse(initialCompanyData));
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
    getDistributorInventory(true, 0, 20);
  }, [companyId]);

  const getDistributorInventory = async (reset = false, customFrom = from, customTo = to) => {
    if (loading || loadingMore) return;

    setLoading(reset);

    console.log("getDistributorInventory", customFrom, customTo);

    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_INVENTORY}/${customFrom}/${customTo}/${companyId}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      const newTasks = response.data.response.ordersList;

      if (reset) {
        setOrders(newTasks);

      } else {
        setOrders(prevTasks => [...prevTasks, ...newTasks]);
      }

      if (newTasks.length < 20) {
        setHasMoreData(false);
      } else {
        setHasMoreData(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTasks = async () => {
    if (!hasMoreData || loadingMore) return;

    setLoadingMore(true);
    const newFrom = to + 1;
    const newTo = to + 20;
    if (searchFilterFlag) {
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
        await getDistributorInventory(false, newFrom, newTo);
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
    setSearchQuery('');
    setFrom(0);
    setSearchKey(0);
    setSelectedSearchOption('');
    setTo(20);
    setsearchFilterFlag(false);
    await getDistributorInventory(true, 0, 20);
    setRefreshing(false);
  };

  const gettasksearch = async (reset = false, customFrom = from, customTo = to) => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_INVENTORY_SEARCH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      from: customFrom,
      to: customTo,
      companyId: companyId,
    };
    console.log("gettasksearch==> ", customFrom, customTo);
    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data.response.ordersList) {

        const newOrders = response.data.response.ordersList.filter(order => order !== null);

        setOrders((prevDetails) =>
          reset ? newOrders : [...prevDetails, ...newOrders]
        );
        setHasMoreData(newOrders?.length >= 20);

        // setOrders(response.data.response.ordersList);
        // setHasMoreData(false);
      } else {
        setOrders([]);
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

    setsearchFilterFlag(true);
    setFrom(0);
    setTo(20)
    gettasksearch(true, 0, 20);
  };

  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      getDistributorInventory(true, 0, 20);
      setFrom(0),
        setTo(20);
      setSearchKey(0);
    }
  };

  const searchOption = [
    { label: 'Type', value: 1 },
    { label: 'Customer Level', value: 2 },
    { label: 'Distributor Name', value: 3 },
    { label: 'Location', value: 4 },
    { label: 'Style', value: 5 },
    { label: 'Size', value: 6 },
  ];

  const renderOrderItem = ({ item }) => {
    if (!item) return null;
    return (
      <TouchableOpacity style={styles.orderItem}>
        <Text style={styles.orderIdText}>{item.distributorName}</Text>
        <Text style={styles.customerText}>{item.shippingLocality}</Text>
        <Text style={styles.qtyText}>{item.styleName}</Text>
        <Text style={styles.dateText}>{item.size}</Text>
        <Text style={styles.dateText}>{item.availQty}</Text>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={handleSearchInputChange}
          />
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={toggleDropdown}>
            <Text style={{ color: '#000' }}>
              {selectedSearchOption || 'Select'}
            </Text>
            <Image
              style={styles.image}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text
            style={{
              color: '#000',
            }}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View style={styles.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity
                style={styles.dropdownOption}
                key={index}
                onPress={() => handleDropdownSelect(option)}>
                <Text style={{ color: '#000' }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.orderIdText}>Distributor Name</Text>
        <Text style={styles.customerText}>Location</Text>
        <Text style={styles.qtyText}>Style</Text>
        <Text style={styles.dateText}>Size</Text>
        <Text style={styles.dateText}>Avail Qty</Text>
      </View>


      {loading && !orders.length ? (
        <ActivityIndicator size="large" color="#000" />
      ) : orders.length === 0 ? (
        <Text style={styles.noResultsText}>No results found!</Text>
      ) : (<FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => index.toString()}
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


      {loadingMore && !hasMoreData && (
        <ActivityIndicator size="large" color="#000" />
      )}



    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
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
    flex: 1.8,
    color: '#000',
  },
  customerText: {
    flex: 1.3,
    color: '#000',
  },
  qtyText: {
    flex: 1.5,
    textAlign: 'center',
    color: '#000',
  },
  statusText: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
  },
  dateText: {
    flex: 1,
    textAlign: 'center',
    color: '#000',
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
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    paddingHorizontal: 10,
    borderRadius: 5,
    color:'#000'
  },
  searchInputActive: {
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
  searchButton: {
    backgroundColor: '#1F74BA',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
  },
  image: {
    height: 20,
    width: 20,
    marginLeft: 10,
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
});

export default DistributorInventory;
