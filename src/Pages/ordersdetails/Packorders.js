import React, {useEffect, useState, useCallback} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import axios from 'axios';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API} from '../../config/apiConfig';

const Packorders = () => {
  const [orders, setOrders] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [searchKey, setSearchKey] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const selectedCompany = useSelector(state => state.selectedCompany);

  const [filterFlag, setFilterFlag]=useState(false);


  const navigation = useNavigation();
  const handleGoBack = () => {
    navigation.goBack();
  };


  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     setSearchQuery('');
  //     setShowSearchInput(false);
  //   });
  //   return unsubscribe;
  // }, [navigation]);

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
      const unsubscribe = navigation.addListener('focus', () => {
        // Reset search query and visibility of search input
        setSearchQuery('');
        setShowSearchInput(false);
        // Reset orders and fetch new data
        setFrom(0); // Reset the starting index
        setTo(20); // Reset the ending index
        getAllOrders(true); // Fetch the first 20 orders
        setFilterFlag(false);
      });
      return unsubscribe;
    }, [navigation]);
  

    useEffect(() => {
      if (companyId) {
        getAllOrders(true, 0, 20);
      }
    }, [companyId]);

    const getAllOrders = async (reset = false, customFrom = from, customTo = to) => {
      // console.log("getAllOrders b ", customFrom, customTo);
  
      if (loading || loadingMore) return;
      setLoading(reset);
  
      if (reset) {
        setFrom(0); // Reset pagination
        setTo(20);
        setHasMoreTasks(true); // Reset hasMoreTasks for new fetch
      }
  
      const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_ORDER_LAZY}/${customFrom}/${customTo}/${companyId}/${2}`;
  
      console.log("getAllOrders A ", customFrom, customTo);
  
  
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
          setOrders((prevTasks) => [...(prevTasks || []), ...newTasks]);
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

    const gettasksearch = async (reset = false, customFrom = from, customTo = to) => {
      const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_ORDER_SEARCH}`;
      const requestBody = {
        dropdownId: searchKey,
        fieldvalue: searchQuery,
        from: customFrom,
        to: customTo,
        companyId: companyId,
        pdfFlag: 0,
      };
  
      console.log("gettasksearch==> ",customFrom,customTo);
  
      try {
        const response = await axios.post(apiUrl, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        });
  
        if (response.data.response.ordersList) {
          // setOrders(response.data.response.ordersList);
  
  
          const newOrders = response.data.response.ordersList.filter(order => order !== null);
  
          setOrders((prevDetails) =>
              reset ? newOrders : [...prevDetails, ...newOrders]
            );
            setHasMoreTasks(newOrders?.length >= 15)
  
  
          // setHasMoreTasks(false);
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
  
    const handleSearchInputChange = query => {
      setSearchQuery(query);
      if (query.trim() === '') {
        getAllOrders(true, 0, 20);
      }
    };

    const searchOption = [
      { label: 'Order No', value: 5 },
      { label: 'Retailer', value: 2 },
      { label: 'Distributor', value: 1 },
      { label: 'Order Date', value: 6 },
      { label: 'Order status', value: 7 },
      { label: 'Packing status', value: 8 },
    ];
  


  // useEffect(() => {
  //   if (firstLoad) {
  //     getAllOrders();
  //     setFirstLoad(false);
  //   }
  // }, [firstLoad, getAllOrders]);

  // useFocusEffect(
  //   useCallback(() => {
  //     if (!firstLoad) {
  //       getAllOrders();
  //     }
  //   }, [firstLoad, getAllOrders]),
  // );


  const handleOrderPress = item => {
    if (item.packedStts === 'YET TO PACK') {
      setSelectedOrder(item);
    } else {
      navigation.navigate('PackingOrders', {orderId: item.orderId});
    }
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const renderItem = ({item}) => {
    if (!item) return null;

    const customerTypeText =
      item.customerType === 1
        ? 'Retailer'
        : item.customerType === 2
        ? 'Distributor'
        : 'UNKNOWN';

    const getStatusColor = status => {
      switch (status.toLowerCase()) {
        case 'open':
          return 'yellow';
        case 'partially confirmed':
          return 'lightgreen';
        case 'confirmed':
          return 'darkgreen';
        case 'partially cancelled':
          return 'lightred';
        case 'cancelled':
          return 'red';
        case 'partially confirmed and partially cancelled':
          return 'orange';
        case 'fully returned':
          return '#FFC0CB';
        case 'partially returned':
          return '#FFD1DF';
        case 'delivered':
          return '#B026FF';
        case 'partially delivered':
          return '#CBC3E3';
        default:
          return 'grey'; // default color for unknown statuses
      }
    };

    return (
      <View style={style.container}>
        <TouchableOpacity
          style={style.header}
          onPress={() => handleOrderPress(item)}>
          <View style={style.ordheader}>
            <View style={style.orderidd}>
              <Text style={{color: '#000'}}>Order No : {item.orderNum}</Text>
              <Text style={{color: '#000'}}>ShipQty : {item.shipQty}</Text>
            </View>
            <View style={style.ordshpheader}>
              <Text style={{color: '#000'}}>Order Date : {item.orderDate}</Text>
              <Text style={{color: '#000'}}>Ship Date : {item.shipDate}</Text>
            </View>
            <View style={style.custtlheader}>
              <Text style={{flex: 0.9, color: '#000'}}>
                Customer Name : {item.customerName}
              </Text>
              <Text style={{color: '#000'}}>
                Customer Type: {customerTypeText}
              </Text>
            </View>
            <View style={style.PackedStatus}>
              <Text style={{fontWeight: 'bold', color: '#000', flex: 0.9}}>
                Packing status : {item.packedStts}
              </Text>
              <Text style={{color: '#000'}}>
                Total Amount : {item.totalAmount}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  textAlign: 'center',
                  backgroundColor: getStatusColor(item.orderStatus),
                  padding: 5,
                  color: '#000',
                  borderRadius: 5,
                  marginHorizontal: 10,
                  fontWeight: 'bold',
                }}>
                Order Status - {item.orderStatus}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const filteredOrders =
    orders &&
    Array.isArray(orders) &&
    orders.filter(item => {
      if (!item) return false;
      const customerName = item.customerName
        ? item.customerName.toLowerCase()
        : '';
      const orderNum = item.orderNum
        ? item.orderNum.toString().toLowerCase()
        : '';
      const query = searchQuery.toLowerCase();
      return customerName.includes(query) || orderNum.includes(query);
    });

  return (
    <View style={style.container}>
      <View style={style.searchContainer}>
        <View style={style.searchInputContainer}>
        <TextInput
            style={style.searchInput}
            placeholder="Search"
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={handleSearchInputChange}
          />

<TouchableOpacity style={style.dropdownButton} onPress={toggleDropdown}>
            <Text style={{ color: '#000' }}>
              {selectedSearchOption || 'Select'}
            </Text>
            <Image
              style={style.image}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={style.searchIconContainer}
          onPress={handleSearch}>
          <Text
            style={{
              color: '#fff',
              borderWidth: 1,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 25,
              // height: 40,
              alignItems: 'center',
              backgroundColor:'#1f74ba'
            }}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View style={style.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity
                style={style.dropdownOption}
                key={index}
                onPress={() => handleDropdownSelect(option)}>
                <Text style={{ color: '#000' }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {loading && orders.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#390050"
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        />
      ) : orders.length === 0 ? (
        <Text style={style.noCategoriesText}>Sorry, no results found! </Text>
      ) : (
        <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item?.orderId}-${index}`}
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
      {selectedOrder && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={style.modalContainer}>
            <View style={style.modalContent}>
              <View style={style.custtlheader}>
                <Text style={{color: '#000'}}>
                  Order No : {selectedOrder.orderNum}
                </Text>
                <Text style={{color: '#000'}}>
                  TotalQty :{selectedOrder.totalQty}
                </Text>
              </View>
              <View style={style.modelordshpheader}>
                <Text style={{color: '#000'}}>
                  Order Date : {selectedOrder.orderDate}
                </Text>
                <Text style={{color: '#000'}}>
                  Ship Date : {selectedOrder.shipDate}
                </Text>
              </View>
              <View style={style.custtlheader}>
                <Text style={{flex: 0.9, color: '#000'}}>
                  Customer Name : {selectedOrder.customerName}
                </Text>
                <Text style={{color: '#000'}}>
                  Customer Type:{' '}
                  {selectedOrder.customerType === 1
                    ? 'Retailer'
                    : selectedOrder.customerType === 2
                    ? 'Distributor'
                    : 'UNKNOWN'}
                </Text>
              </View>
              <View style={style.custtlheader}>
                <Text style={{flex: 0.9, color: '#000'}}>
                  Packing status : {selectedOrder.packedStts}
                </Text>
                <Text style={{color: '#000'}}>
                  Total Amount : {selectedOrder.totalAmount}
                </Text>
              </View>
              <View style={{marginLeft: 10}}>
                <Text style={{marginTop: 5, color: '#000'}}>
                  Order Status : {selectedOrder.orderStatus}{' '}
                </Text>
              </View>
              <TouchableOpacity
                style={style.closeButton}
                onPress={() => setSelectedOrder(null)}>
                <Text style={{color: '#fff'}}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    elevation: 5,
  },
  backButton: {
    marginLeft: 10,
  },
  header: {
    marginBottom: 10,
    borderWidth: 1,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  ordheader: {
    marginVertical: 5,
  },
  orderidd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  PackedStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  ordshpheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  modelordshpheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  custtlheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    width: '95%',
    padding: 5,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#F09120',
    padding: 10,
    borderRadius: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  backIcon: {
    height: 25,
    width: 25,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 7,
    backgroundColor: '#e6e6e6',
    borderRadius: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  searchInputActive: {
    color: '#000',
  },
  searchButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  image: {
    height: 20,
    width: 20,
    marginLeft: 10,
    marginRight: 5,
  },
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
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

export default Packorders;
