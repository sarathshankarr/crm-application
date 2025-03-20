import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
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
  Modal,
} from 'react-native';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ColorContext} from '../../components/colortheme/colorTheme';

const LocationInventory = () => {
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchKey, setSearchKey] = useState(1); // Default to "Type" or any other default
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [hasMoreInventory, setHasMoreInventory] = useState(true);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(20);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [searchFilterFlag, setsearchFilterFlag] = useState(false);


  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalVisible(true);
  };
  
  const closeModal = () => {
    setIsImageModalVisible(false);
    setSelectedImage(null);
  };

  const selectedCompany = useSelector(state => state.selectedCompany);
  const hold_flag = useSelector(state => state.selectedCompany.hold_qty_flag);
  const comp_flag = useSelector(state => state.selectedCompany.comp_flag);

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
    getLocationInventory(true, 0, 20);
  }, []);

  const getLocationInventory = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    if (loading || loadingMore) return;
    setLoading(reset);

    const apiUrl = `${global?.userData?.productURL}${API.ADD_LOCATION_INVENTORY_LAZY}`;

    console.log('getLocationInventory', customFrom, customTo);

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

      // console.log('API Response:', response.data);

      // Check if the response contains an array
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

  const gettasksearch = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_LOCATION_INVENTORY_SEARCH}`;
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

      if (response.data.gsCodesList) {
        const newOrders = response.data.gsCodesList.filter(
          order => order !== null,
        );

        setInventoryData(prevDetails =>
          reset ? newOrders : [...prevDetails, ...newOrders],
        );
        setHasMoreData(newOrders?.length >= 20);
      } else {
        setInventoryData([]);
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

    setsearchFilterFlag(true);
    setFrom(0);
    setTo(20);
    gettasksearch(true, 0, 20);
  };

  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      getLocationInventory(true, 0, 20);
      setFrom(0), setTo(20);
    }
  };

  const searchOption = [
    {label: 'Type', value: 1},
    {label: 'Customer Level', value: 2},
    {label: 'Location Name', value: 3},
    {label: 'Style Name', value: 4},
    {label: 'Size', value: 5},
    {label: 'Sku', value: 6},
  ];
  const onRefresh = async () => {
    setRefreshing(true);
    setsearchFilterFlag(false);
    setHasMoreData(true);
    setSearchQuery('');
    setFrom(0);
    // setSearchKey(0);
    // setSelectedSearchOption('');
    setTo(20);
    await getLocationInventory(true, 0, 20);
    setRefreshing(false);
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
        await getLocationInventory(false, newFrom, newTo);
      } catch (error) {
        console.error('Error while loading more orders:', error);
      } finally {
        setFrom(newFrom);
        setTo(newTo);
        setLoadingMore(false);
      }
    }
  };

  const renderItem = ({item}) => (
    <View>
      <View style={styles.inventoryItem}>
        <Text style={styles.itemText}> {item.locationName}</Text>
        <Text style={styles.itemText1}>{item.styleName}</Text>
        <TouchableOpacity onPress={() => openImageModal(item.imageUrls?.[0] || '')}>
        {item.imageUrls?.length > 0 && item.imageUrls[0] ? (
  <Image
    source={{ uri: item.imageUrls[0] }}
    style={{ width: 50, height: 50, }}
    resizeMode="contain"
  />
) : (
  <Text style={{ color: "#000",marginHorizontal:1 }}>No Image</Text>
)}
      </TouchableOpacity>
        <Text style={styles.itemText2}>{item.sizeCode}</Text>
        <Text style={styles.itemText3}>{item.availQty}</Text>
        {comp_flag && hold_flag ? (
          <Text style={styles.itemText4}>{item.holdQty}</Text>
        ) : null}
      </View>
      <View
        style={{borderBottomWidth: 1, borderBottomColor: 'lightgray'}}></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={{
            color: '#000',
            fontSize: 20,
            fontWeight: 'bold',
            alignSelf: 'center',
          }}>
          Location Inventory
        </Text>
      </View>
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
            <Text style={{color: '#000'}}>
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
              color: '#fff',
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
                <Text style={{color: '#000'}}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerText}>Location Name</Text>
        <Text style={styles.headerText1}>Style Name</Text>
        <Text style={styles.headerTextImage}>Image</Text>
        <Text style={styles.headerText2}>Size</Text>
        <Text style={styles.headerText3}>Avail Qty</Text>
        {comp_flag && hold_flag ? (
          <Text style={styles.headerText4}>Hold Qty</Text>
        ) : null}
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
         <Modal transparent={true} visible={isImageModalVisible} onRequestClose={closeModal} animationType="fade">
        <View style={styles.modalOverlayImage}>
       
          <View style={styles.modalContentImage}>
             <TouchableOpacity
                  style={styles.closeButtonImageModel}
                  onPress={closeModal}>
                  <Image
                    style={{height: 30, width: 30,}}
                    source={require('../../../assets/close.png')}
                  />
                </TouchableOpacity>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.modalImageImage} />}
            {/* <TouchableOpacity onPress={closeModal} style={styles.closeButtonImage}>
              <Text style={styles.closeButtonTextImage}>Close</Text>
            </TouchableOpacity> */}
        
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = colors =>
  StyleSheet.create({
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
      color: '#000',
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
      paddingHorizontal: 10,
      paddingVertical: 10,
      backgroundColor: '#f0f0f0',
    },
    headerText: {
      flex: 1.2,
      textAlign: 'center',
      color: '#000',
    },
    headerText1: {
      flex: 2.6,
      textAlign: 'center',
      color: '#000',
    },
    headerTextImage:{
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    headerText2: {
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    headerText3: {
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
    headerText4: {
      flex: 0.8,
      textAlign: 'center',
      color: '#000',
      marginLeft:10
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
      flex: 1.4,
      textAlign: 'center',
      color: '#000',
    },
    itemText1: {
      flex: 2,
      textAlign: 'center',
      marginLeft: 10,
      color: '#000',
    },
    itemText2: {
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    itemText3: {
      flex: 1,
      textAlign: 'center',
      color: '#000',
    },
    itemText4: {
      flex: 1,
      textAlign: 'center',
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
      backgroundColor: colors.color2,
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
    modalOverlayImage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContentImage: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalImageImage: {
      width: 320,
      height: 470,
      marginBottom: 15,
    },
    closeButtonImage: {
      padding: 10,
      backgroundColor: '#007bff',
      borderRadius: 5,
    },
    closeButtonTextImage: {
      color: '#fff',
      fontSize: 16,
    },
    closeButtonImageModel: {
      backgroundColor: 'lightgray',
      padding: 3,
      borderRadius: 5,
      alignSelf: 'flex-end',
      marginBottom: 10,
    },
  });

export default LocationInventory;
