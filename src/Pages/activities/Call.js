import React, { useState, useEffect, useContext } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { API } from '../../config/apiConfig';
import { formatDateIntoDMY } from '../../Helper/Helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { ColorContext } from '../../components/colortheme/colorTheme';

const Call = () => {
  const { colors } = useContext(ColorContext);
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [hasMoreCalls, setHasMoreCalls] = useState(true);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

  const [tasks, setTasks] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [searchKey, setSearchKey] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filterFlag, setFilterFlag] = useState(false);

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


  const gettasksearch = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_CALL_SEARCH}`;
    const requestBody = {
      searchKey: searchKey,
      searchValue: searchQuery,
      from: customFrom,
      to: customTo,
      t_company_id: companyId,
      customerId: 0,
      customerType: 0,
    };

    console.log('gettasksearch==> ', customFrom, customTo);

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data) {
        // setOrders(response.data.response.ordersList);

        const newOrders = response.data.filter(
          order => order !== null,
        );

        setTasks(prevDetails =>
          reset ? newOrders : [...prevDetails, ...newOrders],
        );
        setHasMoreTasks(newOrders?.length >= 15);

        // setHasMoreTasks(false);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };





  // const handleDropdownSelect = option => {
  //   setSelectedSearchOption(option.label);
  //   setSearchKey(option.value);
  //   setDropdownVisible(false);
  //   setSearchQuery(''); 
  // };


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
    if (searchOptions.length > 0) {
      setSelectedSearchOption(searchOptions[0].label);
      setSearchKey(searchOptions[0].value);
    }
  }, [searchOptions]); // This will run whenever searchOption changes


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

  const searchOptions = [
    { label: 'Distributor/Retailer', value: 1 },
    { label: 'Date', value: 2 },
    { label: 'Related To', value: 3 },
    { label: 'Status', value: 4 },
  ];

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

    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_CALL_LAZY}/${customFrom}/${customTo}/${companyId}/${0}/${0}`;

    console.log("getAllOrders A ", customFrom, customTo);


    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });


      const newTasks = response.data;
      // console.log("response.data",response.data)
      if (reset) {
        setTasks(newTasks);
      } else {
        setTasks((prevTasks) => [...(prevTasks || []), ...newTasks]);
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





  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     console.log("Screen focused, clearing search");
  //     setSearchQuery('');
  //     setSelectedSearchOption(null);
  //     setSearchKey(null);
  //     setDropdownVisible(false);

  //     getAllOrders(true); // Re-fetch tasks, if necessary
  //   });

  //   return unsubscribe;
  // }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // setShowSearchInput(false);
      console.log("navigation in tas")
      onRefresh();
      if (searchOptions.length > 0) {
        setSelectedSearchOption(searchOptions[0].label);
        setSearchKey(searchOptions[0].value);
      }
    });
    return unsubscribe;
  }, [navigation,searchOptions]);


  const fetchCallById = async (callId) => {
    setLoading(true);
  
    const apiUrl = `${global?.userData?.productURL}${API.GET_CALL_BY_ID}/${callId}`;
  
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
  
      if (response.data) {
        navigation.navigate('NewCall', {
          call: response.data, // Pass the fetched call details
        });
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching call details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdd = () => {
    navigation.navigate('NewCall', { call: {} });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.callItem} onPress={() => fetchCallById(item.id)}>
      <Text style={{ flex: 1.3, marginLeft: 10, color: "#000" }}>{item.customer}</Text>
      <Text style={{ flex: 1, color: "#000" ,marginRight:20}}>{item.relatedTo}</Text>
      <Text style={{ flex: 0.7, color: "#000" }}>{item.status}</Text>
      <Text style={{ flex: 0.9, marginRight: 5, color: "#000" }}>{item.created_on}</Text>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={handleSearchInputChange}
          />
          <TouchableOpacity style={styles.searchButton} onPress={toggleDropdown}>
            <Text style={{ color: '#000' }}>{selectedSearchOption || 'Select'}</Text>
            <Image
              style={styles.image}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSearch} style={{ backgroundColor: 'lightgray', elevation: 5, borderRadius: 30, padding: 5 }}>
          <Image
            style={styles.searchIcon}
            source={require('../../../assets/search.png')}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
          {/* <Image
            style={{
              height: 30,
              width: 30,
              justifyContent: 'center',
              alignItems: 'center',

            }}
            source={require('../../../assets/plus.png')}
          /> */}
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View style={styles.dropdownContent1}>
          <ScrollView>
            {searchOptions.map((option, index) => (
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

      <View style={styles.listHeader}>
        <Text style={styles.headerText}>Distributor Name</Text>
        <Text style={styles.headerText1}>Related To</Text>
        <Text style={styles.headerText2}>Status</Text>
        <Text style={styles.headerText3}>Date</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : tasks.length === 0 ? (
        <Text style={styles.noCategoriesText}>No calls found!</Text>
      ) : (
        // <FlatList
        //   data={calls}
        //   renderItem={renderItem}
        //   keyExtractor={(item, index) => `${item.id}-${index}`}
        //   refreshControl={
        //     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        //   }
        //   onEndReached={loadMoreCalls}
        //   onEndReachedThreshold={0.2}
        //   ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#0000ff" /> : null}
        // />
        <FlatList
          data={tasks}
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
    </SafeAreaView>
  );
};



const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: 5,
    marginVertical: 10,

  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 7,
    backgroundColor: '#e6e6e6',
    borderRadius: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000',
  },
  searchIcon: {
    width: 25,
    height: 25,
  },
  addButton: {
    paddingHorizontal: 15,
    marginLeft: 10,
    padding: 10,
    backgroundColor: colors.color2,
    borderRadius: 5,

  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: "#000",
    flex: 1
  },
  headerText1: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 20,
    color: "#000",
    flex: 0.,
  },
  headerText2: {
    fontWeight: 'bold',
    fontSize: 16,
    color: "#000",
    flex: 0.7,
    marginLeft:10
  },
  headerText3: {
    fontWeight: 'bold',
    fontSize: 16,
    color: "#000",
    flex: 0.5,
    marginRight:20
  },
  callItem: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  callText: {
    fontSize: 14,
  },
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
  image: {
    height: 15,
    width: 10,
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
});

export default Call;
