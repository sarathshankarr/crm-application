import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductInventory = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryData, setInventoryData] = useState([]);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchKey, setSearchKey] = useState(1); 
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(0); 
  const [to, setTo] = useState(20); 
  const [searchFilterFlag, setsearchFilterFlag] = useState(false);


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
    getProductInventory(true, 0, 20);
  }, []);


  const getProductInventory = async (reset = false, customFrom = from, customTo = to) => {
    if (loading || loadingMore) return;
    setLoading(reset);

    const apiUrl = `${global?.userData?.productURL}${API.ADD_ALL_INVENTORY_LAZY}`;

    console.log("getProductInventory", customFrom, customTo);

    try {
      const response = await axios.post(
        apiUrl,
        {
          companyId: companyId,
          styleName: '',
          from: customFrom,
          to: customTo,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        },
      );


      const newTasks = response.data.gsCodesList;

      if (reset) {
        setInventoryData(newTasks);
      } else {
        setInventoryData(prevTasks => [...prevTasks, ...newTasks]);
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
        await getProductInventory(false, newFrom, newTo);
      } catch (error) {
        console.error('Error while loading more orders:', error);
      } finally {
        setFrom(newFrom);
        setTo(newTo);
        setLoadingMore(false);
      }
    }

    // getProductInventory(false); 
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setsearchFilterFlag(false);
    // setHasMoreInventory(true); 
    setHasMoreData(false);
    setSearchQuery('');
    setFrom(0);
    setSearchKey(0);
    setSelectedSearchOption('');
    setTo(20);
    await getProductInventory(true, 0, 20);
    setRefreshing(false);
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

    setsearchFilterFlag(true);
    setFrom(0);
    setTo(20);
    gettasksearch(true, 0, 20);
  };

  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      getProductInventory(true, 0, 20);
      setFrom(0);
      setTo(20);
      setSearchKey(0);
      setSelectedSearchOption('');
      setsearchFilterFlag(true);

    }
  };

  const searchOption = [
    { label: 'Style Name', value: 3 },
    { label: 'Size', value: 4 },
    { label: 'Type', value: 1 },
    { label: 'Customer Level', value: 2 },
    { label: 'SKU', value: 5 },
  ];

  const gettasksearch = async (reset = false, customFrom = from, customTo = to) => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_INVENTORY_SEARCH}`;
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

      if (response?.data?.gsCodesList) {
        const newOrders = response.data.gsCodesList.filter(order => order !== null);

        setInventoryData((prevDetails) =>
          reset ? newOrders : [...prevDetails, ...newOrders]
        );
        setHasMoreData(newOrders?.length >= 20);
      } else {
        setInventoryData([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };


  const renderItem = ({ item }) => (
    <View>
      <View style={styles.inventoryItem}>
        <View style={{ flex: 3 }}>
          <Text style={styles.itemText1}>{item.styleName}</Text>
          <Text style={styles.itemText1}>
            <Text style={{ color: '#000', fontWeight: 500 }}>{'SKU  :  '}</Text>
            {item.gsCode}
          </Text>
        </View>
        <Text style={styles.itemText}>{item.sizeCode}</Text>
        <Text style={styles.itemText}>{item.availQty}</Text>
      </View>
      <View
        style={{ borderBottomWidth: 1, borderBottomColor: 'lightgray' }}></View>
    </View>
  );

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
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}>
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
        <View style={{ flex: 3 }}>
          <Text style={styles.headerText1}>Style Name</Text>
        </View>
        <Text style={styles.headerText}>Size</Text>
        <Text style={styles.headerText}>Avail Qty</Text>
      </View>

      {loading && !inventoryData.length ? (
        <ActivityIndicator size="large" color="#000" />
      ) : inventoryData.length === 0 ? (
        <Text style={styles.noResultsText}>No results found!</Text>
      ) : (
        <FlatList
          data={inventoryData}
          renderItem={renderItem}
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
    flex: 1,
    backgroundColor: '#fff',
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
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color:'#000'
  },
  searchIconContainer: {
    padding: 10,
  },
  searchIcon: {
    height: 20,
    width: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    color: '#000',
  },
  noResultsText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    padding: 5,
  },
  headerText1: {
    flex: 3,
    textAlign: 'left',
    color: '#000',
  },

  listContainer: {
    paddingHorizontal: 20,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  itemText: {
    flex: 1,
    textAlign: 'center',
    color: '#000',
  },
  itemText1: {
    flex: 3,
    textAlign: 'left',
    color: '#000',
  },
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
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
    marginRight: 10,
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

export default ProductInventory;
