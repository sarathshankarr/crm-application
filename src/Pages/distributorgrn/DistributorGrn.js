import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, TextInput, ScrollView, Alert, SafeAreaView } from 'react-native';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ColorContext } from '../../components/colortheme/colorTheme';

const DistributorGrn = () => {
  const { colors } = useContext(ColorContext);
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedSearchOption, setSelectedSearchOption] = useState('');
  const [searchKey, setSearchKey] = useState(0);
  const [filteredOrdersList, setFilteredOrdersList] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [searchFilterFlag, setsearchFilterFlag] = useState(false);

  const [filterFlag, setFilterFlag] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const selectedCompany = useSelector(state => state.selectedCompany);

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem('initialSelectedCompany');
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



  const companyId = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;

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
    // console.log("getAllOrders b ", customFrom, customTo);

    if (loading || loadingMore) return;
    setLoading(reset);

    if (reset) {
      setFrom(0); // Reset pagination
      setTo(20);
      setHasMoreTasks(true); // Reset hasMoreTasks for new fetch
    }

    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_GRN_LL
      }/${customFrom}/${customTo}/${companyId}`;

    console.log('getAllOrders A ', customFrom, customTo);

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      const newTasks = response.data.response.ordersList;
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
    const apiUrl = `${global?.userData?.productURL}${API.SEARCH_DISTRIBUTOR_GRN}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      from: customFrom,
      to: customTo,
      companyId: companyId
    }

    console.log('gettasksearch==> ', customFrom, customTo);

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response?.data?.response?.ordersList) {
        // setOrders(response.data.response.ordersList);

        const newOrders = response.data.response.ordersList.filter(order => order !== null);

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



  const gotoDistributorOrder = (orderId) => {
    navigation.navigate("DistributorOrder", { orderId });
  };

  const renderOrderItem = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity onPress={() => gotoDistributorOrder(item.orderId)} style={styles.orderItem}>
        <Text style={styles.orderIdText}>{item.orderNoWithPrefix}</Text>
        <Text style={styles.customerText}>{item.customerName}</Text>
        <Text style={styles.qtyText}>{item.shipQty || 0}</Text>
        <Text style={styles.statusText}>{item.orderStatus}</Text>
        <Text style={styles.dateText}>{item.orderDate}</Text>
      </TouchableOpacity>
    );
  };








  const searchOption = [
    // { label: 'Select', value: 0 },
    { label: 'Order No', value: 1 },
    { label: 'Customer', value: 2 },
    { label: 'Status', value: 3 },
    { label: 'Order Date', value: 4 }
  ];





  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      console.log("inside the handleSearchInputChange");
      onRefresh(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
  <View>
            <Text style={{color:"#000",fontSize:20,fontWeight:"bold",alignSelf:"center"}}>
            Distributor GRN
            </Text>
          </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[styles.searchInput, { color: '#000' }]}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            placeholder="Search"
            placeholderTextColor="#000"
          />
      
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={toggleDropdown}>
          <Text style={{ color: "#000" }}>{searchKey ? selectedSearchOption : 'Select'}</Text>
          <Image
            style={styles.image}
            source={require('../../../assets/dropdown.png')}
          />
        </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>
            Search
          </Text>
        </TouchableOpacity>
      </View>
      {dropdownVisible && (
        <View style={styles.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity style={styles.dropdownOption} key={`${option.value}_${index}`} onPress={() => handleDropdownSelect(option)}>
                <Text style={{ color: '#000' }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.orderIdText}>Id</Text>
        <Text style={styles.customerText}>Customer</Text>
        <Text style={styles.qtyText}>Total Qty</Text>
        <Text style={styles.statusText}>Status</Text>
        <Text style={styles.dateText}>Order Date</Text>
      </View>
      {loading ? (
      <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />
    ) : (filteredOrdersList.length === 0 || filteredOrdersList.every(item => item === null)) ? (
      <Text style={styles.noResultsText}>Sorry, no results found!</Text>
    ) : (
        <FlatList
          data={filteredOrdersList}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => `${item?.id}-${index}`}
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
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
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
    flex: 0.8,
    color: "#000"
  },
  customerText: {
    flex: 1.5,
    color: "#000"
  },
  qtyText: {
    flex: 0.9,
    textAlign: 'center',
    color: "#000"
  },
  statusText: {
    flex: 1.4,
    marginLeft: 10,
    color: "#000"
  },
  dateText: {
    flex: 1.5,
    textAlign: 'center',
    color: "#000"
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
    backgroundColor:  colors.color2,
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
    marginLeft:5
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
    marginBottom:5
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchIconContainer: {
    // padding: 10,
    // width: '25%',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
});

export default DistributorGrn;
