import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  PureComponent,
} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PRODUCT_DETAILS} from '../../components/ProductDetails';
import ModalComponent from '../../components/ModelComponent';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {RefreshControl} from 'react-native';
import FastImage from 'react-native-fast-image';

class ProductItem extends PureComponent {
  render() {
    const {item, navigation, openModal} = this.props;
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() =>
          navigation.navigate(
            item.categoryId === PRODUCT_DETAILS
              ? 'AllCategoriesListed'
              : 'Details',
            {
              item,
            },
          )
        }>
        <View style={styles.productImageContainer}>
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <FastImage
              style={styles.productImage}
              source={{uri: item.imageUrls[0]}}
            />
          ) : (
            <Image
              style={styles.productImage}
              source={require('../../../assets/NewNoImage.jpg')}
            />
          )}
          <Text
            style={[
              styles.productName,
              {backgroundColor: 'rgba(0, 0, 0, 0.2)'},
            ]}>
            {item.styleName}
          </Text>
        </View>

        <View style={styles.additionalDetailsContainer}>
          <Text style={{color: '#000'}} numberOfLines={1} ellipsizeMode="tail">
            Color Name: {item.colorName}
          </Text>
          <View style={styles.notesContainer}>
            <Text
              style={{color: '#000'}}
              numberOfLines={1}
              ellipsizeMode="tail">
              Description: {item.styleDesc}
            </Text>
            <Text style={{color: '#000'}}>Price: {item.mrp}</Text>
            <TouchableOpacity
              onPress={() => openModal(item)}
              style={styles.buttonqty}>
              <Text style={{color: '#ffffff'}}>ADD QTY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const AllCategoriesListed = ({navigation,route}) => {
  const { categoryId } = route.params;
  const [pageSize, setPageSize] = useState(10);
  console.log("categoryId=====>",categoryId)
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const flatListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [searchKey, setSearchKey] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedSearchOption, setSelectedSearchOption] = useState('');
  const [stopLoad, setStopLoad] = useState(false);
  const [searchFilterFlag, setSearchFilterFlag] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const selectedCompany = useSelector(state => state.selectedCompany);
  const [refreshing, setRefreshing] = useState(false);

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
      getAllProducts(companyId, true, 0);
    }
  }, [companyId]);

  const onRefresh = async () => {
    console.log('Refreshing in prod ..........');
    setRefreshing(true);
    setPageNo(1);
    setSearchKey(0);
    setSearchQuery('');
    setMinPrice(''); // Reset min price
    setMaxPrice(''); // Reset max price
    setSelectedSearchOption('');
    setSearchFilterFlag(false);
    if (companyId) {
      await getAllProducts(companyId, true);
    }
    setRefreshing(false);
  };

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     // setShowSearchInput(false);
  //     console.log("navigation in prod")
  //     onRefresh();
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchQuery('');
      setMinPrice(''); // Reset min price
      setMaxPrice(''); // Reset max price
      setShowSearchInput(false);
      // setSelectedSearchOption(null);
      setDropdownVisible(false);
      setPageNo(1);
      setIsLoading(true); // Ensure loading state is set before fetching

      if (companyId) {
        getAllProducts(companyId, true, 0).finally(() => {
          setIsLoading(false); // Set loading to false after fetch completes
        });
      }

      setSearchFilterFlag(false);

      // Scroll to the top when coming back to this screen
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({offset: 0, animated: false});
      }
    });
    return unsubscribe;
  }, [navigation, companyId]);

  const searchAPI = async (reset = false, page = 1, searchQuery = '') => {
    const apiUrl = `${global?.userData?.productURL}${API.SEARCH_ALL_PRODUCTS}`;
    let requestBody = {
      pageNo: reset ? 1 : String(page),
      pageSize: String(pageSize),
      categoryId: categoryId,
      companyId: companyId,
      searchKey: searchKey,
      searchValue: searchQuery,
    };

    console.log('searchAPI===> ', apiUrl, requestBody);

    try {
      setIsLoading(true);
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log('response data==> ', response?.data);
      const fetchedData = response?.data?.content || [];
      setSelectedDetails(prevDetails =>
        reset ? fetchedData : [...prevDetails, ...fetchedData],
      );
      setTotalPages(response.data?.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setStopLoad(true); // Stop loading once the search is completed
    }
  };

  const getAllProducts = async (companyId, reset = false, page = 1) => {
    setIsLoading(true);
    setStopLoad(false);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA}`;

    try {
      const userData = await AsyncStorage.getItem('userdata');
      const userDetails = JSON.parse(userData);

      const requestData = {
        pageNo: reset ? 1 : String(page),
        pageSize: String(pageSize),
        categoryId: categoryId,
        companyId: companyId,
      };

      console.log('fetch products ==> ', requestData?.pageNo);
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response?.data?.content;
      console.log('fetch products ==> ', response?.data?.content);

      const uniqueData = removeDuplicates(data, 'styleId');

      if (reset) {
        setSelectedDetails(uniqueData);
        setTotalItems(response.data.totalItems);
        setTotalPages(response.data.totalPages);
      } else {
        setSelectedDetails(prev =>
          removeDuplicates([...prev, ...uniqueData], 'styleId'),
        );
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeDuplicates = (array, key) => {
    const seen = new Set();
    return array?.filter(item => {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
      return true;
    });
  };

  const openModal = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderProductItem = useCallback(
    ({item}) => (
      <ProductItem item={item} navigation={navigation} openModal={openModal} />
    ),
    [navigation],
  );

  const handleEndReached = () => {
    if (stopLoad || isFetching) return;
    console.log('handleEndReached', pageNo, totalPages);
    if (searchFilterFlag) {
      if (pageNo < totalPages) {
        searchAPI(false, pageNo + 1);
        setPageNo(prevPage => prevPage + 1);
      }
    } else {
      if (pageNo < totalPages) {
        setPageNo(prevPage => prevPage + 1);
        getAllProducts(companyId, false, pageNo + 1);
      }
    }
  };

  const handleSearch = () => {
    if (searchKey === 0) {
      Alert.alert(
        'Please select an option from the dropdown before searching.',
      );
      return;
    }

    // Check if searchQuery is empty and if both minPrice and maxPrice are empty
    if (searchQuery?.trim()?.length === 0 && !minPrice && !maxPrice) {
      return;
    }

    setSearchFilterFlag(true);
    setPageNo(1);
    setStopLoad(false); // Start loading

    // Construct the searchValue based on minPrice and maxPrice
    let searchValue = '';
    if (minPrice && maxPrice) {
      searchValue = `${minPrice}-${maxPrice}`; // For example, "10-20"
    } else if (minPrice) {
      searchValue = `${minPrice}-`; // For example, "10-"
    } else if (maxPrice) {
      searchValue = `-${maxPrice}`; // For example, "-20"
    } else {
      searchValue = searchQuery; // Fallback to searchQuery
    }

    // Update request body with searchValue
    searchAPI(true, 1, searchValue);
  };

  const handleScroll = event => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  const searchOption = [
    // { label: 'Select', value: 0 },
    {label: 'Style Name', value: 1},
    {label: 'Color', value: 2},
    {label: 'Price', value: 3},
    {label: 'MRP', value: 4},
    {label: 'Size', value: 5},
    {label: 'Type', value: 6},
    {label: 'Fabric Quality', value: 7},
    {label: 'GSM', value: 8},
  ];

  // const handleDropdownSelect = option => {
  //   setSelectedSearchOption(option.label);
  //   setSearchKey(option.value);
  //   setDropdownVisible(false);
  //   setSearchQuery('');  // Clear search query
  //   setMinPrice('');     // Clear min price
  //   setMaxPrice('');     // Clear max price
  //   // console.log("handleDropdownSelect");
  // };

  const handleDropdownSelect = option => {
    // Trigger the refresh first
    onRefresh();
  
    // After refresh, set the selected values
    setTimeout(() => {
      setSelectedSearchOption(option.label); // Update selected option label
      setSearchKey(option.value);           // Update search key
      setDropdownVisible(false);            // Close the dropdown
      setSearchQuery('');                   // Clear search query
      setMinPrice('');                      // Clear min price
      setMaxPrice('');                      // Clear max price
      
      console.log("Selected option:", option.label);
    }, 0); // Ensure it runs immediately after the refresh is triggered
  };

  
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  

  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      onRefresh();
    }
  };
  const handleMinPriceChange = value => {
    setMinPrice(value);
    if (value.trim() === '' && maxPrice.trim() === '') {
      onRefresh();
    }
  };
  
  const handleMaxPriceChange = value => {
    setMaxPrice(value);
    if (value.trim() === '' && minPrice.trim() === '') {
      onRefresh();
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
          marginVertical: 10,
        }}>
        <View style={styles.searchContainer}>
          {searchKey !== 3 && searchKey !== 4 && (
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              placeholder="Search"
              placeholderTextColor="#888"
            />
          )}
          {(searchKey === 3 || searchKey === 4) && (
            <View style={styles.minMaxContainer}>
              <TextInput
                placeholder="Min"
                placeholderTextColor="#000"
                style={styles.minMaxInput}
                value={minPrice}
                onChangeText={handleMinPriceChange}
                keyboardType="numeric" // Optional: To show numeric keyboard
              />
              <TextInput
                placeholder="Max"
                placeholderTextColor="#000"
                style={styles.MaxInput}
                value={maxPrice}
                onChangeText={handleMaxPriceChange}
                keyboardType="numeric" // Optional: To show numeric keyboard
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={toggleDropdown}>
            <Text style={{color: '#000', marginRight: 5}}>
              {searchKey ? selectedSearchOption : 'Select'}
            </Text>
            <Image
              style={styles.dropdownIcon}
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
      {/* <View style={{}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {searchOption.map((option, index) => (
              <TouchableOpacity
                style={styles.dropdownOption}
                key={`${option.value}_${index}`}
                onPress={() => handleDropdownSelect(option)}>
                <Text style={{color: '#000', backgroundColor:'#fff', padding:10, paddingHorizontal:20, borderRadius:20, elevation:5 }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}

      {isLoading && selectedDetails?.length === 0 ? (
        <ActivityIndicator
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          size="large"
          color="#390050"
        />
      ) : selectedDetails?.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          ref={flatListRef}
          data={selectedDetails}
          renderItem={renderProductItem}
          keyExtractor={item => item.styleId.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={100}
          windowSize={7}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: 350,
            offset: 350 * index,
            index,
          })}
          onContentSizeChange={() => {
            if (scrollPosition !== 0) {
              flatListRef.current.scrollToOffset({
                offset: scrollPosition,
                animated: false,
              });
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000', '#689F38']}
            />
          }
          // ListFooterComponent={
          //   !stopLoad ? (
          //     <ActivityIndicator size="small" color="#0000ff" />
          //   ) : null
          // }
        />
      )}

      <ModalComponent
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        selectedItem={selectedItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingLeft: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 25,
    paddingHorizontal: 15,
    color: '#000',
    // backgroundColor: '#f1f1f1',
    marginRight: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#e6e6e6',
    borderRadius: 15,
  },
  dropdownIcon: {
    width: 15,
    height: 15,
    tintColor: '#000',
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
  dropdownContent1: {
    position: 'absolute',
    top: 60,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    zIndex: 1,
    alignSelf: 'center',
    borderColor: 'lightgray', // Optional: Adds subtle border (for effect)
    borderWidth: 1,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  productList: {
    paddingTop: 10,
    paddingBottom: 70,
  },
  productItem: {
    flex: 1,
    marginHorizontal: 2,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  productName: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    padding: 5,
  },
  additionalDetailsContainer: {
    paddingTop: 5,
  },
  notesContainer: {},
  buttonqty: {
    marginHorizontal: 3,
    marginVertical: 3,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F09120',
    // backgroundColor:'#fc9c04',
  },
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
  minMaxInput: {
    borderRightWidth: 1,
    padding: 5,
    width: 50,
    borderRadius: 10,
    width: 80,
    color:"#000",
    marginHorizontal:10
  },
  MaxInput: {
    borderRightWidth: 1,
    padding: 5,
    width: 50,
    borderRadius: 10,
    width: 80,
    color:"#000",
    marginHorizontal:10
  },
  minMaxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex:1
  },
});

export default AllCategoriesListed;
