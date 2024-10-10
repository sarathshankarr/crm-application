import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, TextInput, ScrollView, Alert } from 'react-native';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const DistributorGrn = () => {
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

    const apiUrl = `${global?.userData?.productURL}${
      API.GET_DISTRIBUTOR_GRN_LL
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
    setSearchKey(0);
    setFilterFlag(false);

    setSearchQuery('');
    // setShowSearchInput(false);
    setSelectedSearchOption('');
    setHasMoreTasks(true);

    await getAllOrders(true, 0, 20);
    setRefreshing(false);
  };

  // useEffect(() => {
  //   if (companyId) {
  //     getDistributorGrn(true, 0, 15);
  //   }
  // }, [companyId]);




  // const getDistributorGrn = async (reset = false, customFrom = from, customTo = to) => {
  //   setLoading(true);
  //   if (loading || loadingMore) return;
  //   reset ? setLoading(true) : setLoadingMore(true);

  //   const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_GRN_LL}/${customFrom}/${customTo}/${companyId}`;
  //   console.log("getDistributorGrn List==> ", customFrom, customTo);
  //   try {
  //     const response = await axios.get(apiUrl, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //       },
  //     });

  //     if (response.data.status.success) {
  //       const newOrders = response.data.response.ordersList.filter(order => order !== null);

  //       if (reset) {
  //         setFilteredOrdersList(newOrders);
  //       } else {
  //         setFilteredOrdersList(prevOrders => [...prevOrders, ...newOrders]);
  //       }
  //       setHasMoreOrders(newOrders?.length >= 15)
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   } finally {
  //     setLoading(false);
  //     setLoadingMore(false);
  //   }
  // };


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
    setSelectedSearchOption(option.label);
    setSearchKey(option.value);
    setDropdownVisible(false);
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

  // const searchAPI = async (reset = false, customFrom = from, customTo = to) => {
  //   const apiUrl = `${global?.userData?.productURL}${API.SEARCH_DISTRIBUTOR_GRN}`;
  //   let requestBody = {
  //     dropdownId: searchKey,
  //     fieldvalue: searchQuery,
  //     from: customFrom,
  //     to: customTo,
  //     companyId: companyId
  //   };

  //   console.log("searchAPI===> ", apiUrl, requestBody);

  //   try {
  //     setLoading(true);
  //     const response = await axios.post(
  //       apiUrl,
  //       requestBody,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //         },
  //       },
  //     );
  //     console.log("response.data==> ", response?.data?.response?.ordersList);
  //     if (response?.data?.response?.ordersList && response?.data?.response?.ordersList.length > 0) {

  //       if (response?.data?.response?.ordersList.length === 1 && !response?.data?.response?.ordersList[0]) {
  //         setFilteredOrdersList([]);
  //       } else {
  //         // const fetchedData = response?.data?.response?.ordersList || [];
  //         const newOrders = response.data.response.ordersList.filter(order => order !== null);

  //         setFilteredOrdersList((prevDetails) =>
  //           reset ? newOrders : [...prevDetails, ...newOrders]
  //         );
  //         setHasMoreOrders(newOrders?.length >= 15)
  //       }
  //     } else {
  //       console.log("Setting 0");
  //       setFilteredOrdersList([]);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const gotoDistributorOrder = (orderId) => {
    navigation.navigate("DistributorOrder", { orderId });
  };

  const renderOrderItem = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity onPress={() => gotoDistributorOrder(item.orderId)} style={styles.orderItem}>
        <Text style={styles.orderIdText}>{item.orderNum}</Text>
        <Text style={styles.customerText}>{item.customerName}</Text>
        <Text style={styles.qtyText}>{item.shipQty || 0}</Text>
        <Text style={styles.statusText}>{item.orderStatus}</Text>
        <Text style={styles.dateText}>{item.orderDate}</Text>
      </TouchableOpacity>
    );
  };







  // const toggleDropdown = () => {
  //   setDropdownVisible(!dropdownVisible);
  // };

  // const handleDropdownSelect = option => {
  //   setSelectedSearchOption(option.label);
  //   setSearchKey(option.value);
  //   setDropdownVisible(false);
  //   console.log("handleDropdownSelect")
  // };

  const searchOption = [
    // { label: 'Select', value: 0 },
    { label: 'Order No', value: 1 },
    { label: 'Customer', value: 2 },
    { label: 'Status', value: 3 },
    { label: 'Order Date', value: 4 }
  ];




  // const handleSearch = () => {
  //   setsearchFilterFlag(true);
  //   if (searchKey === 0) {
  //     Alert.alert('Please select an option from the dropdown before searching.');
  //     return;
  //   }
   
  //   if (searchQuery.trim().length > 0 && searchKey > 0) {
  //     searchAPI(true, 0, 15);
  //     setFrom(0);
  //     setTo(15);
  //   }

  // };

  const handleSearchInputChange = query => {
    setSearchQuery(query);
      if (query.trim().length === 0) {
        console.log("inside the handleSearchInputChange");
      onRefresh(true);
    }
  };

  return (
    <View style={styles.container}>

      <View style={{ flexDirection: 'row', justifyContent:'space-between' }}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={[styles.searchInput, { color: '#000' }]}
              value={searchQuery}
              // onChangeText={text => {
              //   setSearchQuery(text);
              // }}
              onChangeText={handleSearchInputChange}
              placeholder="Search"
              placeholderTextColor="#000"
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleDropdown}>
            <Text style={{ color: "#000" }}>{searchKey ? selectedSearchOption : 'Select'}</Text>
            <Image
              style={styles.image}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
          <Text
            style={{
              color: '#000',
              // borderWidth: 1,
              marginHorizontal: 5,
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: '#fff',
              elevation: 5,
            }}>
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
      ) : filteredOrdersList.length === 0 ? (
        <Text style={styles.noResultsText}>Sorry, no results found!</Text>
      ) : (
        // <FlatList
        //   data={filteredOrdersList}
        //   renderItem={renderOrderItem}
        //   // keyExtractor={(item, index) => item ? item.orderId.toString() : index.toString()}
        //   keyExtractor={(item, index) =>
        //     item ? `${item.orderId.toString()}_${Date.now()}` : `${index.toString()}_${Date.now()}`
        //   }
        //   refreshControl={
        //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        //   }
        //   onEndReached={loadMoreOrders}
        //   onEndReachedThreshold={0.2}
        //   ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#0000ff" /> : null}
        // />
        <FlatList
        data={filteredOrdersList}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
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
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    // borderWidth:1,
    // borderRadius: 30,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,

    marginHorizontal: 10,
    // backgroundColor:'#f1e8e6',
    backgroundColor: 'white',
    elevation: 5,
    width: '70%'
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
  searchButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderLeftWidth: 1,

  },
  image: {
    height: 20,
    width: 20,
    alignSelf: 'center'
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'lightgray',
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
