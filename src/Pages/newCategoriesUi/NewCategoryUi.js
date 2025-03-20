import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API} from '../../config/apiConfig';
import {RefreshControl} from 'react-native';
import ModalComponent from '../../components/ModelComponent';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {ColorContext} from '../../components/colortheme/colorTheme';
import FastImage from 'react-native-fast-image';
// import NotificationModal from '../../components/NotificationModal';

const NewCategoryUi = () => {
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryProducts, setSearchQueryProducts] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // New state for total items
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);
  const companyId = selectedCompany
    ? selectedCompany.id
    : initialSelectedCompany?.id;

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

  useEffect(() => {
    if (companyId !== undefined && companyId !== null) {
      fetchCategories(companyId);
    }
  }, [companyId]);


  // useEffect(() => {
  //   if (pageNo > 1) {
  //     if (selectedCategory === 'All Products') {
  //       getAllProducts(companyId).finally(() => setIsFetching(false));
  //     } else {
  //       getSelectedCategoryAllProducts(activeCategoryId, companyId).finally(
  //         () => setIsFetching(false),
  //       );
  //     }
  //   }
  // }, [pageNo]);

  const [initialCategory, setInitialCategory] = useState(null);

  const [loading, setLoading] = useState(false);

  // const fetchCategories = async (
  //   reset = false,
  //   customFrom = from,
  //   customTo = to,
  // ) => {
  //   // console.log("fetchCategories b ", customFrom, customTo);

  //   if (loading || loadingMore) return;
  //   setLoading(reset);

  //   if (reset) {
  //     setFrom(0); // Reset pagination
  //     setTo(15);
  //     setHasMoreTasks(true); // Reset hasMoreTasks for new fetch
  //   }
  //   const apiUrl = `${global?.userData?.productURL}${API.ALL_CATEGORIES_LL_LIST}/${customFrom}/${customTo}/${companyId}`;

  //   try {
  //     const response = await axios.get(apiUrl, {
  //       headers: {
  //         Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //       },
  //     });
  
  //     const categories = response?.data || [];
  //     setSelectedDetails(categories);
  
  //     // Set "All Products" as default instead of the first category
  //     setSelectedCategory('All Products');
  //     setActiveCategoryId(null);
      
  //     // Fetch all products initially
  //     if (selectedCategory === 'All Products') {
  //       await getAllProducts(companyId);
  //     } else {
  //       await getSelectedCategoryAllProducts(activeCategoryId, companyId);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  

  const fetchCategories = async companyId => {
    setIsLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_CATEGORIES_LL_LIST}/${0}/${10000}/${companyId}`;
  
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
  
      const categories = response?.data || [];
      setSelectedDetails(categories);
  
      // Set "All Products" as default instead of the first category
      setSelectedCategory('All Products');
      setActiveCategoryId(null);
      
      // Fetch all products initially
      getAllProducts(companyId);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure products are fetched after category ID is set
  // useEffect(() => {
  //   if (activeCategoryId && companyId) {
  //     getSelectedCategoryAllProducts(activeCategoryId, companyId);
  //   }
  // }, [activeCategoryId, companyId]);

  const scrollViewRef = useRef(null);

  const handleCategory = category => {
    setIsLoading(true);
    setPageNo(1);

    if (activeCategoryId !== category?.categoryId) {
      setActiveCategoryId(category?.categoryId);
    }

    setSelectedCategory(category?.category);

    // Remove the line that modifies selectedDetails
    // setSelectedDetails(prevDetails => {
    //   const filtered = prevDetails.filter(
    //     item => item.categoryId !== category.categoryId,
    //   );
    //   return [category, ...filtered]; // Don't do this
    // });

    if (category?.categoryId && companyId) {
      setTimeout(() => {
        getSelectedCategoryAllProducts(category.categoryId, companyId);
      }, 100);
    } else {
      console.error('Invalid category or company ID');
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     if (initialCategory) {
  //       handleCategory(initialCategory); // Reset to the first category
  //     }
  //   }, [initialCategory]),
  // );

  // useFocusEffect(
  //   useCallback(() => {
  //     handleAllProducts(companyId); // Directly call the function to load "All"
  //   }, [companyId])
  // );
  

  const handleAllProducts = companyId => {
    setIsLoading(true);
    setPageNo(1);
    setSelectedCategory('All Products');
    setActiveCategoryId(null);
    getAllProducts(companyId);
  };

  const getSelectedCategoryAllProducts = async (categoryId, companyId) => {
    console.log('getSelectedCategoryAllProducts params:', {
      categoryId,
      companyId,
    });

    setIsLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA}`;
    try {
      const requestData = {
        pageNo: '1',
        pageSize: '100000000',
        categoryId: categoryId,
        companyId: companyId,
      };
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Search Response:', response.data.content);

      const data = response.data.content;

      setProductsList(data);
      setTotalItems(response.data.totalItems);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [stopLoad, setStopLoad] = useState(false);


      const getAllProducts = async (companyId, reset = false, page = 1) => {
        setIsLoading(true);
        setStopLoad(false);
        const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA}`;
    
        try {
          const userData = await AsyncStorage.getItem('userdata');
          const userDetails = JSON.parse(userData);
    
          const requestData = {
            pageNo: reset ? 1 : String(page),
            pageSize: '15',
            categoryId: '',
            companyId: companyId,
          };
    
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data.content;
      if (pageNo === 1) {
        setProductsList(data);
        setTotalItems(response.data.totalItems);
      } else {
        setProductsList(prev => [...prev, ...data]);
      }
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      // setIsFetching(false);
    }
  };

  const openModal = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [searchKey, setSearchKey] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filterFlag, setFilterFlag] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15);
  const [categories, setCategories] = useState([]);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [activeSearchCategoryId, setActiveSearchCategoryId] = useState(null);

  const gettasksearch = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    console.log('Calling gettasksearch with:', {
      searchQuery,
      searchKey,
      companyId,
      customFrom,
      customTo,
      apiUrl: `${global?.userData?.productURL}${API.SEARCH_ALL_CATEGORIES_LL}`,
    });

    const apiUrl = `${global?.userData?.productURL}${API.SEARCH_ALL_CATEGORIES_LL}`;
    const requestBody = {
      fieldvalue: searchQuery,
      from: customFrom,
      to: customTo,
      t_company_id: companyId,
      dropdownId: searchKey,
      companyId: companyId,
    };

    console.log(
      'Request body being sent:',
      JSON.stringify(requestBody, null, 2),
    );

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log('API Response:', response.data);

      if (response.data) {
        const newOrders = response.data.filter(order => order !== null);
        console.log('Filtered Orders:', newOrders);

        setCategories(reset ? newOrders : [...categories, ...newOrders]);

        if (newOrders.length > 0) {
          console.log('Setting active category ID:', newOrders[0].categoryId);
          console.log('Setting active category ID:', newOrders[0].categoryId);
          setActiveCategoryId(newOrders[0].categoryId);
          setSelectedCategory(newOrders[0].category); // Set the searched category

          // Scroll to selected category
          const index = newOrders.findIndex(
            item => item.categoryId === newOrders[0].categoryId,
          );
          if (index !== -1 && flatListRef.current) {
            setTimeout(() => {
              flatListRef.current.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5,
              });
            }, 300);
          }
        } else {
          console.log('No new orders found.');
        }

        setHasMoreTasks(newOrders?.length >= 15);
      } else {
        console.log('Response data is empty.');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response) {
        console.error('Response Error Data:', error.response.data);
        console.error('Response Status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchQuery('');
      setAppliedSearchQuery(''); // Reset applied search query
      setSearchValue('');
      setDropdownVisible(false);
      setMinPrice(''); // Reset min price
      setMaxPrice(''); // Reset max price
      setIsDropdownOpen(false);
      setFrom(0);
      setTo(15);
      setFilterFlag(false);
      // onRefresh();
    });

    return unsubscribe;
  }, [navigation, companyId, searchOption]);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const [appliedSearchQuery, setAppliedSearchQuery] = useState(''); // Stores search term on button click

  const handleSearch = async () => {
    console.log('Search Button Clicked');
    console.log('searchKey:', searchKey);
    console.log('searchQuery:', searchQuery);

    if (!searchKey) {
        Alert.alert(
            'Alert',
            'Please select an option from the dropdown before searching',
        );
        console.log('Search Key is missing');
        return;
    }

    if (!searchQuery.trim()) {
        Alert.alert('Alert', 'Please enter a search query before searching');
        console.log('Search Query is empty');
        return;
    }

    setAppliedSearchQuery(searchQuery);

    console.log('Setting initial states...');
    setFilterFlag(true);
    setFrom(0);
    setTo(15);

    setTimeout(async () => {
        console.log('Calling gettasksearch...');
        await gettasksearch(true);
        console.log('gettasksearch completed.');

        setActiveCategoryId(prevId => {
            console.log('Updated activeCategoryId:', prevId);

            if (prevId) {
                console.log(
                    'Fetching selected category products...',
                    prevId,
                    companyId,
                );
                getSelectedCategoryAllProducts(prevId, companyId);
            } else {
                console.log('Fetching all products...');
                handleCategory();
            }

            return prevId;
        });

        // Ensure scroll moves to the top
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    }, 0);
};


  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      onRefresh();
    }
  };

  const searchOption = [
    {label: 'Category', value: 1},
    {label: 'Category Desc.', value: 2},
  ];

  const renderProductItem = ({item, index}) => (
    <>
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('Details', {item})}>
        {/* Product Image */}
        <Image
          style={styles.productImage}
          source={
            item.imageUrls && item.imageUrls.length > 0
              ? {uri: item.imageUrls[0]}
              : require('../../../assets/NewNoImage.jpg')
          }
        />
        {/* Product Details */}
        <View style={styles.productDetails}>
        <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">{item.styleName}</Text>
        <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">{item.styleDesc}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{item.mrp}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openModal(item)}>
            <Text style={styles.addButtonText}>ADD</Text>
            <Image

                                style={{height: 20, width: 20, marginLeft: 10,tintColor:"#fff"}}
                                source={require('../../../assets/add1.png')}
                              />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {index === productsList.length - 1 && (
        <View style={{marginBottom: 100}} />
      )}
    </>
  );
  const [loadingMore, setLoadingMore] = useState(false); // Add this state

  const handleEndReached = () => {
    if (stopLoad || isFetching || loadingMore) return;
  
    console.log('handleEndReached triggered. Page:', pageNo, 'Total:', totalPages);
  
    setLoadingMore(true); // Start loading indicator
  
    if (searchFilterFlag) {
      if (pageNo < totalPages) {
        searchAPI(false, pageNo + 1)
          .then(() => setPageNo(prevPage => prevPage + 1))
          .finally(() => setLoadingMore(false)); // Stop loading
      } else {
        setLoadingMore(false);
      }
    } else {
      if (pageNo < totalPages) {
        setPageNo(prevPage => prevPage + 1);
        getAllProducts(companyId, false, pageNo + 1)
          .finally(() => setLoadingMore(false));
      } else {
        setLoadingMore(false);
      }
    }
  };
  


  const onRefresh = async () => {
    setPageNo(1);
    setRefreshing(true);
    setProductsList([]);
    if (selectedCategory === 'All Products') {
      await getAllProducts(companyId);
    } else {
      await getSelectedCategoryAllProducts(activeCategoryId, companyId);
    }
    setRefreshing(false);
  };

  const handleScroll = event => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };
  const [productList, setProductList] = useState([]);
  const [scrollYPosition, setScrollYPosition] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chosenFilterOption, setChosenFilterOption] = useState('');
  const [isFetchingStopped, setIsFetchingStopped] = useState(false);
  const activeCompany = useSelector(state => state.activeCompany);
  const [searchFilterFlag, setSearchFilterFlag] = useState(false);

  const [searchValue, setSearchValue] = useState(''); // For executeSearch
  const [minPrice, setMinPrice] = useState(''); // For executeSearch
  const [maxPrice, setMaxPrice] = useState(''); // For executeSearch
  const [selectedProduct, setSelectedProduct] = useState(null); // For executeSearch

  useEffect(() => {
    if (companyId) {
      getAllProducts(companyId, true, 0);
    }
  }, [companyId]);
  const fetchProducts = async (reset = false, page = 1, searchValue = '') => {
    const apiUrl = `${global?.userData?.productURL}${API.SEARCH_ALL_PRODUCTS}`;
    let requestBody = {
      pageNo: reset ? 1 : String(page),
      pageSize: '10000',
      categoryId: '',
      companyId: companyId,
      searchKey: selectedProduct,
      searchValue: searchValue,
    };

    console.log('fetchProducts API Call:', apiUrl, requestBody);

    try {
      setIsFetching(true);
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log('response data==> ', response?.data);
      const fetchedData = response?.data?.content || [];
      setProductsList(prevDetails =>
        reset ? fetchedData : [...prevDetails, ...fetchedData],
      );
      setTotalPages(response.data?.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsFetching(false);
      setIsFetchingStopped(true);
    }
  };

  const executeSearch = () => {
    if (selectedProduct === 0) {
      Alert.alert(
        'Please select an option from the dropdown before searching.',
      );
      return;
    }

    // Check if searchValue is empty and if both minPrice and maxPrice are empty
    if (searchValue?.trim()?.length === 0 && !minPrice && !maxPrice) {
      Alert.alert('Alert', 'Please enter a search query or price range.');
      return;
    }

    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      Alert.alert('Please enter a min value less than the max value.');
      return;
    }

    // Construct the searchValue based on minPrice and maxPrice
    let finalSearchValue = '';
    if (minPrice && maxPrice) {
      finalSearchValue = `${minPrice}-${maxPrice}`; // For example, "10-20"
    } else if (minPrice) {
      finalSearchValue = `${minPrice}-`; // For example, "10-"
    } else if (maxPrice) {
      finalSearchValue = `-${maxPrice}`; // For example, "-20"
    } else {
      finalSearchValue = searchValue; // Fallback to searchValue
    }

    // Set the search filter flag and reset page number
    setSearchFilterFlag(true);
    setPageNo(1);

    // Fetch products with the new searchValue
    fetchProducts(true, 1, finalSearchValue);
  };

  const filterOptions = [
    {label: 'Style Name', value: 1},
    {label: 'Color', value: 2},
    {label: 'Price', value: 3},
    {label: 'MRP', value: 4},
    {label: 'Size', value: 5},
    {label: 'Type', value: 6},
    {label: 'Fabric Quality', value: 7},
    {label: 'GSM', value: 8},
  ];

  const selectFilterOption = option => {
    setTimeout(() => {
      setChosenFilterOption(option.label);
      setSelectedProduct(option.value);
      setIsDropdownOpen(false);
      setSearchValue('');
      setMinPrice('');
      setMaxPrice('');
    }, 0);
  };

  useEffect(() => {
    if (filterOptions.length > 0) {
      setChosenFilterOption(filterOptions[0].label);
      setSelectedProduct(filterOptions[0].value);
    }
  }, []);

  const toggleFilterDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleSearchInputChangeProduct = value => {
    setSearchValue(value);
    if (value.trim() === '') {
      onRefresh();
    }
  };

  const updateMinPrice = value => {
    setMinPrice(value);
    if (value.trim() === '' && maxPrice.trim() === '') {
      onRefresh();
    }
  };

  const updateMaxPrice = value => {
    setMaxPrice(value);
    if (value.trim() === '' && minPrice.trim() === '') {
      onRefresh();
    }
  };

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
          marginVertical: 10,
        }}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            placeholder="Search"
            placeholderTextColor="#000"
          />
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
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.sidebar}
          nestedScrollEnabled={true}>
          {selectedDetails
            .slice()
            .sort((a, b) => {
              if (!appliedSearchQuery) {
                return 0; // Keep original order when there's no search query
              }

              const aMatches = a.category
                .toLowerCase()
                .includes(appliedSearchQuery.toLowerCase());
              const bMatches = b.category
                .toLowerCase()
                .includes(appliedSearchQuery.toLowerCase());

              if (aMatches && !bMatches) return -1; // Move matching categories up
              if (!aMatches && bMatches) return 1;

              return (
                selectedDetails.findIndex(
                  item => item.categoryId === a.categoryId,
                ) -
                selectedDetails.findIndex(
                  item => item.categoryId === b.categoryId,
                )
              );
            })

            .map((category, index) => (
              <View key={category.categoryId}>
                {index === 0 && (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      selectedCategory === 'All Products' &&
                        styles.activeCategoryButton,
                    ]}
                    onPress={() => handleAllProducts(companyId)}>
                    <View style={styles.categoryImage}>
                      <Image
                        source={require('../../../assets/img4.jpg')}
                        style={styles.categoryImage}
                        resizeMode='contain'
                                              />

                    
                    </View>
                     <Text
                    style={[
                      styles.productName,
                      {
                        // backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      },
                      selectedCategory === 'All Products'
                      ? styles.activeCategoryText
                      : styles.productName,
                    ]}>
                        All
                      </Text>
                  </TouchableOpacity>
                )}
<View style={{backgroundColor:"#fff"}}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    category.categoryId === activeCategoryId &&
                      styles.activeCategoryButton,
                  ]}
                  onPress={() => handleCategory(category)}>
                  {category.imageUrls && category.imageUrls.length > 0 ? (
                    <FastImage
                      style={styles.categoryImage}
                      source={{uri: category.imageUrls[0]}}
                       resizeMode='contain'
                    />
                  ) : (
                    <Image
                      style={styles.categoryImage}
                      resizeMode="contain"
                      source={require('../../../assets/NewNoImage.jpg')}
                    />
                  )}
                  <Text
                    style={[
                      styles.productName,
                      {
                        // backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      },
                      category.categoryId === activeCategoryId
                        ? styles.activeCategoryText
                        : styles.productName,
                    ]}>
                    {category.category}
                  </Text>
                  <View style={{
  borderWidth: 0.6,
  // borderColor: category.categoryId === activeCategoryId ? colors.color2 : 'lightgray', 
  borderColor:  'lightgray', 

  width: '80%'
}}>


                  </View>
                </TouchableOpacity>
               
                  </View>
                {index === selectedDetails.length - 1 && (
                  <View style={{marginBottom: 90}} />
                )}
              </View>
            ))}
        </ScrollView>

        {/* right Content */}
        <View style={styles.content}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={styles.searchContainerProduct}>
              {selectedProduct !== 3 && selectedProduct !== 4 && (
                <TextInput
                  style={styles.searchInput}
                  value={searchValue}
                  onChangeText={handleSearchInputChangeProduct}
                  placeholder="Search"
                  placeholderTextColor="#888"
                />
              )}
              {(selectedProduct === 3 || selectedProduct === 4) && (
                <View style={styles.minMaxContainer}>
                  <TextInput
                    placeholder="Min"
                    placeholderTextColor="#000"
                    style={styles.minMaxInput}
                    value={minPrice}
                    onChangeText={updateMinPrice}
                    keyboardType="numeric" // Optional: To show numeric keyboard
                  />
                  <TextInput
                    placeholder="Max"
                    placeholderTextColor="#000"
                    style={styles.MaxInput}
                    value={maxPrice}
                    onChangeText={updateMaxPrice}
                    keyboardType="numeric" // Optional: To show numeric keyboard
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleFilterDropdown}>
                <Text style={{color: '#000', marginRight: 5}}>
                  {selectedProduct ? chosenFilterOption : 'Select'}
                </Text>
                <Image
                  style={styles.dropdownIcon}
                  source={require('../../../assets/dropdown.png')}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.searchButtonProduct}
              onPress={executeSearch}>
              {/* <Text style={styles.searchButtonText}>S</Text> */}
              <Image
                style={{height: 15, width: 15, marginHorizontal: 10,tintColor:"#fff"}}
                source={require('../../../assets/search.png')}
              />
            </TouchableOpacity>
          </View>

          {isDropdownOpen && (
            <View style={styles.dropdownContent1}>
              <ScrollView>
                {filterOptions.map((option, index) => (
                  <TouchableOpacity
                    style={styles.dropdownOption}
                    key={`${option.value}_${index}`}
                    onPress={() => selectFilterOption(option)}>
                    <Text style={{color: '#000'}}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}


          {!isLoading && productsList.length === 0 ? (
            <View style={styles.noProductsContainer}>
              <Image source={require('../../../assets/noproduct.png')} />
              <Text style={styles.noProductsText}>
                There are no products available.
              </Text>
            </View>
          ) : (
            <FlatList
            data={productsList}
            renderItem={renderProductItem}
            numColumns={2}
            keyExtractor={(item, index) => `item.toString()+${index}`}
            contentContainerStyle={{ paddingBottom: 50 }} // Ensure footer is visible
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#000', '#689F38']}
              />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#0000ff" />
                  <Text style={{ color: '#000', marginTop: 5 }}>Loading more...</Text>
                </View>
              ) : null
            }
          />
          
          )}
        </View>
      </View>

      <ModalComponent
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        selectedItem={selectedItem}
      />
    </View>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: '27%',
      backgroundColor: '#fff',
     
     
    },
    categoryButton: {
      alignItems: 'center',
      // marginBottom: 15,
      backgroundColor: '#fff',
      borderRadius: 5,
      elevation: 3,
     
    },
    imageContainer: {},

    productName: {
      // position: 'absolute',
      // bottom: 0,
      // left: 0,
      // right: 0,
      color: '#000',
      fontSize: 9,
      fontWeight: 'bold',
      alignSelf:"center"
      // padding: 4,
    },
    categoryImage: {
      width: 40,
      height: 40,
      // borderRadius: 20,  
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.5)', // Light white with transparency
    },
    
    categoryText: {
      fontSize: 14,
      textAlign: 'center',
      // fontWeight: 'bold',
    },
    activeCategoryButton: {
      backgroundColor: '#fff',
      borderLeftWidth: 5,
      borderColor: colors.color2,
    },
    activeCategoryText: {
      color: colors.color2,
    },
    inactiveCategoryText: {
      color: '#000',
    },
    content: {
      width: '79%',
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    flatListContainer: {
      paddingHorizontal: 8,
    },
    productCard: {
      flex:1, 
      marginVertical: 8,
      marginHorizontal:5,
      padding: 10,
      borderRadius: 10,
      backgroundColor: '#fff',
      elevation: 3,
      shadowColor: colors.color2,
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    productImage: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
      alignSelf:"center",
      marginBottom:5
    },
    productDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    productTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 5,
    },
    productSize: {
      fontSize: 13,
      color: '#555',
      marginBottom: 5,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    productPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
    },
    addButton: {
      backgroundColor: colors.color2,
      borderRadius: 5,
      paddingVertical: 8,
      paddingHorizontal: 25,
      marginTop: 10,
      flexDirection:"row",
      alignItems:"center",
      alignSelf:"center"
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    noProductsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    noProductsText: {
      fontSize: 18,
      color: '#000',
      fontWeight: 'bold',
    },

    searchInputActive: {
      color: '#000',
    },
    image: {
      height: 30,
      width: 30,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
      flex: 1,
      marginRight: 10,
    },
    searchContainerProduct: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
      flex: 1,
      marginRight: 10,
      marginLeft: 10,
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
      backgroundColor: colors.color2,
      borderRadius: 25,
      paddingHorizontal: 20,
      paddingVertical: 10,
      elevation: 3,
    },
    searchButtonProduct: {
      backgroundColor: colors.color2,
      borderRadius: 25,
      paddingVertical: 5,
      elevation: 3,
      marginRight: 5,
      marginVertical: 15,
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
    minMaxInput: {
      borderRightWidth: 1,
      padding: 5,
      borderRadius: 10,
      width: 60,
      color: '#000',
      marginHorizontal: 10,
    },
    MaxInput: {
      borderRightWidth: 1,
      padding: 5,
      borderRadius: 10,
      width: 60,
      color: '#000',
      marginHorizontal: 10,
    },
    minMaxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
  });

export default NewCategoryUi;

// #1E88E5

