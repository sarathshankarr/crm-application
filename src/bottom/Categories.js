import React, {useState, useEffect, useCallback} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {API} from '../config/apiConfig';

// const Categories = ({navigation}) => {
//   const [selectedDetails, setSelectedDetails] = useState([]);
//   const [showSearchInput, setShowSearchInput] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const selectedCompany = useSelector(state => state.selectedCompany);

//   useEffect(() => {
//     const fetchInitialSelectedCompany = async () => {
//       try {
//         const initialCompanyData = await AsyncStorage.getItem(
//           'initialSelectedCompany',
//         );
//         if (initialCompanyData) {
//           const initialCompany = JSON.parse(initialCompanyData);
//           setInitialSelectedCompany(initialCompany);
//         }
//       } catch (error) {
//         console.error('Error fetching initial selected company:', error);
//       }
//     };

//     fetchInitialSelectedCompany();
//   }, []);

//   const companyId = selectedCompany
//     ? selectedCompany.id
//     : initialSelectedCompany?.id;

//   useEffect(() => {
//     if (companyId) {
//       fetchCategories(companyId);
//     }
//   }, [companyId]);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       setSearchQuery('');
//       setShowSearchInput(false);
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchCategories(companyId);
//     setRefreshing(false);
//   }, [companyId]);

//   const fetchCategories = () => {
//     setLoading(true);
//     const apiUrl = `${global?.userData?.productURL}${API.ALL_CATEGORIES_DATA}/${companyId}`;
//     axios
//       .get(apiUrl, {
//         headers: {
//           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
//         },
//       })
//       .then(response => {
//         setSelectedDetails(response?.data || []);
//       })
//       .catch(error => {
//         console.error('Error:', error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   const toggleSearchInput = () => {
//     setShowSearchInput(!showSearchInput);
//     if (showSearchInput) {
//       setSearchQuery('');
//     }
//   };

//   const onChangeText = text => {
//     setSearchQuery(text);
//   };

//   const renderProductItem = ({item}) => {
//     const {category, imageUrls} = item;

//     return (
//       <TouchableOpacity
//         style={styles.productItem}
//         onPress={() => {
//           navigation.navigate('AllCategoriesListed', {
//             item,
//             categoryId: item.categoryId,
//             categoryDesc: category,
//           });
//         }}>
//         <View style={styles.productImageContainer}>
//           {imageUrls && imageUrls.length > 0 ? (
//             <Image style={styles.productImage} source={{uri: imageUrls[0]}} />
//           ) : (
//             <Image
//               style={styles.productImage}
//               resizeMode="contain"
//               source={require('../../assets/NewNoImage.jpg')}
//             />
//           )}
//           <View
//             style={{
//               borderColor: '#000',
//               backgroundColor: '#fff',
//             }}>
//             <Text
//               style={[
//                 styles.productName,
//                 {
//                   backgroundColor: 'rgba(0, 0, 0, 0.3)',
//                 },
//               ]}>
//               {category}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const filteredCategories =
//     selectedDetails &&
//     Array.isArray(selectedDetails) &&
//     selectedDetails.filter(item =>
//       item.category.toLowerCase().includes(searchQuery.toLowerCase()),
//     );

//   return (
//     <View style={styles.container}>
//       <View style={styles.searchContainer}>
//           <TextInput
//             style={[
//               styles.searchInput,
//               searchQuery.length > 0 && styles.searchInputActive,
//             ]}
//             autoFocus={false}
//             value={searchQuery}
//             onChangeText={onChangeText}
//             placeholder={searchQuery
//               ? searchQuery
//               : selectedDetails
//               ? selectedDetails.length + ' Categories Listed'
//               : ''}
//             placeholderTextColor="#000"
//           />
  
//         <View
//           style={styles.searchButton}>
//           <Image
//             style={styles.image}
//             source={ require('../../assets/search.png')}
//           />
//         </View>
//       </View>

//       {loading ? (
//         <ActivityIndicator
//           style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
//           size="large"
//           color="#390050"
//         />
//       ) : filteredCategories.length === 0 ? (
//         <Text style={styles.noCategoriesText}>Sorry, no results found! </Text>
//       ) : (
//         <FlatList
//           data={filteredCategories}
//           renderItem={renderProductItem}
//           keyExtractor={(item, index) => index.toString()}
//           numColumns={2}
//           contentContainerStyle={styles.productList}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={['#000', '#689F38']}
//             />
//           }
//         />
//       )}
//     </View>
//   );
// };

const Categories = ({ navigation }) => {
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  // const [from, setFrom] = useState(1);
  // const [to, setTo] = useState(15);
  const [pageFrom, setPageFrom] = useState(0);
  const [pageTo, setPageTo] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchFlag, setsearchFlag] = useState(false);


  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

  const [refreshing, setRefreshing] = useState(false);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15);
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



    const gettasksearch = async (
      reset = false,
      customFrom = from,
      customTo = to,
    ) => {
      const apiUrl = `${global?.userData?.productURL}${API.SEARCH_ALL_CATEGORIES_LL}`;
      const requestBody = {
        fieldvalue: searchQuery,
        from: customFrom,
        to: customTo,
        t_company_id: companyId,
        dropdownId :searchKey,
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
  
        if (response.data) {
          // setOrders(response.data.response.ordersList);
  
          const newOrders = response.data.filter(order => order !== null);
  
          setCategories(prevDetails =>
            reset ? newOrders : [...prevDetails, ...newOrders],
          );
          setHasMoreTasks(newOrders?.length >= 15);
  
          // setHasMoreTasks(false);
        } else {
          setCategories([]);
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
      setTo(15);
  
      gettasksearch(true, 0, 15);
    };
  
    const handleSearchInputChange = query => {
      setSearchQuery(query);
      if (query.trim() === '') {
        fetchCategories(true, 0, 15);
      }
    };


    const searchOption = [
      { label: 'Category', value: 1 },
      { label: 'Category Desc.', value: 2 },
    ];
  
  
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     // setShowSearchInput(false);
  //     console.log("navigation in Cat")
  //     onRefresh();
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset search query and visibility of search input
      setSearchQuery('');
      setShowSearchInput(false);
      setDropdownVisible(false);
      setSelectedSearchOption(null);
      // Reset orders and fetch new data
      setFrom(0); // Reset the starting index
      setTo(15); // Reset the ending index
      fetchCategories(true, 0, 15); // Fetch the first 20 orders
      setFilterFlag(false);
    });
    return unsubscribe;
  }, [navigation]);


  useEffect(() => {
    if (companyId) {
      fetchCategories(true, 0, 15);
    }
  }, [companyId]);


  
  const fetchCategories = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    // console.log("fetchCategories b ", customFrom, customTo);

    if (loading || loadingMore) return;
    setLoading(reset);

    if (reset) {
      setFrom(0); // Reset pagination
      setTo(15);
      setHasMoreTasks(true); // Reset hasMoreTasks for new fetch
    }

    const apiUrl = `${global?.userData?.productURL}${
      API.ALL_CATEGORIES_LL_LIST
    }/${customFrom}/${customTo}/${companyId}`;

    console.log('fetchCategories A ', customFrom, customTo);

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      const newTasks = response.data;
      // console.log("response.data====>",response.data)
      if (reset) {
        setCategories(newTasks);
      } else {
        setCategories(prevTasks => [...(prevTasks || []), ...newTasks]);
      }

      if (newTasks.length < 15) {
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
    const newTo = to + 15;
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
        await fetchCategories(false, newFrom, newTo);
      } catch (error) {
        console.error('Error while loading more orders:', error);
      } finally {
        setFrom(newFrom);
        setTo(newTo);
        setLoadingMore(false);
      }
    }
    // fetchCategories(); // Call fetchCategories here to fetch new data
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFrom(0);
    setTo(15);
    setSearchKey(0);
    setFilterFlag(false);

    setSearchQuery('');
    // setShowSearchInput(false);
    setSelectedSearchOption('');
    setHasMoreTasks(true);

    await fetchCategories(true, 0, 15);
    setRefreshing(false);
  };


 



  const onChangeText = text => {
    setSearchQuery(text);
  };

  const renderProductItem = ({ item }) => {
    const { category, imageUrls } = item;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          navigation.navigate('AllCategoriesListed', {
            item,
            categoryId: item.categoryId,
            categoryDesc: category, // Pass the category description
          });
        }}>
        <View style={styles.productImageContainer}>
          {imageUrls && imageUrls.length > 0 ? (
            <Image style={styles.productImage} source={{ uri: imageUrls[0] }} />
          ) : (
            <Image
              style={styles.productImage}
              resizeMode="contain"
              source={require('../../assets/NewNoImage.jpg')}
            />
          )}
          <View
            style={{
              borderColor: '#000',
              backgroundColor: '#fff',
            }}>
            <Text
              style={[
                styles.productName,
                {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                },
              ]}>
              {category}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };



  return (
    <View style={styles.container}>


      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginVertical: 10 }}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            placeholder="Search"
            placeholderTextColor="#000"
          />
          <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
            <Text style={{ color: "#000", marginRight: 5 }}>
              {searchKey ? selectedSearchOption : 'Select'}
            </Text>
            <Image
              style={styles.dropdownIcon}
              source={require('../../assets/dropdown.png')}
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
              <TouchableOpacity style={styles.dropdownOption} key={`${option.value}_${index}`} onPress={() => handleDropdownSelect(option)}>
                <Text style={{ color: '#000' }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#390050" />
      ) : categories.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        
      )} */}
       {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : categories.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
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
          contentContainerStyle={{ paddingBottom: 70 }}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f6',
  },
  // searchContainer: {
  //   // flexDirection: 'row',
  //   // alignItems: 'center',
  //   // paddingHorizontal: 20,
  //   // marginTop: 5,
  //   // borderWidth:1,
  //   // flexDirection: 'row',
  //   // alignItems: 'center',
  //   // paddingHorizontal: 20,
  //   // paddingVertical:4,
  //   // marginTop: 10,
  //   // borderRadius:30,
  //   // marginHorizontal:10,
  //   // // backgroundColor:'#f1e8e6',
  //   // backgroundColor:'white',
  //   // elevation:5
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 20,
  //   marginTop: 10,
  //   // marginBottom: 10,
  //   // borderWidth:1,
  //   borderRadius: 30,
  //   marginHorizontal: 10,
  //   // backgroundColor:'#f1e8e6',
  //   backgroundColor: 'white',
  //   elevation: 5,


  // },
  // searchInput: {
  //   flex: 1,
  //   height: 40,
  //   borderColor: 'gray',
  //   paddingHorizontal: 10,
  //   borderRadius: 5,
  // },
  // searchInputActive: {
  //   color: '#000',
  // },

  text: {
    fontSize: 16,
    marginRight: 'auto',
    color: '#000',
  },
  // searchButton: {
  //   marginLeft: 'auto',
  // },
  image: {
    height: 30,
    width: 30,
  },
  productList: {
    paddingTop: 10,
    paddingBottom: 70
  },
  productItem: {
    flex: 1,
    marginHorizontal: 4,
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
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
});

export default Categories;
