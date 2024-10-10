import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../config/apiConfig';
import { RefreshControl } from 'react-native';
import ModalComponent from '../../components/ModelComponent';
import { useNavigation } from '@react-navigation/native';
// import NotificationModal from '../../components/NotificationModal';

const NewCategoryUi = () => {
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
  const companyId = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;

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

  useEffect(() => {
    if (companyId) {
      fetchCategories(companyId);
    }
  }, [companyId]);

  useEffect(() => {
    if (pageNo > 1) {
      if (selectedCategory === "All Products") {
        getAllProducts(companyId).finally(() => setIsFetching(false));
      } else {
        getSelectedCategoryAllProducts(activeCategoryId, companyId).finally(() => setIsFetching(false));

      }
    }
  }, [pageNo]);

  const fetchCategories = (companyId) => {
    setIsLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_CATEGORIES_DATA}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setSelectedDetails(response?.data || []);
        handleCategory(response?.data[0]);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCategory = (category) => {
    setIsLoading(true);
    setPageNo(1);
    setProductsList([]);
    setSelectedCategory(category.category);
    setActiveCategoryId(category.categoryId);

    if (category.categoryId && category.companyId) {
      getSelectedCategoryAllProducts(category.categoryId, category.companyId);
    } else {
      console.error('Invalid category or company ID');
    }
  };

  const handleAllProducts = (companyId) => {
    // setIsLoading(true);
    setPageNo(1);
    setSelectedCategory("All Products");
    setActiveCategoryId(null);
    setProductsList([]);
    getAllProducts(companyId);
  };

  const getSelectedCategoryAllProducts = async (categoryId, companyId) => {
    setIsLoading(true)
    const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA}`;
    try {
      const userData = await AsyncStorage.getItem('userdata');
      const userDetails = JSON.parse(userData);

      const requestData = {
        pageNo: String(pageNo),
        pageSize: "10",
        categoryId: categoryId,
        companyId: companyId,
      };
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data.content;
      setProductsList(data);
      setTotalItems(response.data.totalItems);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    };

  };

  const getAllProducts = async (companyId) => {
    setIsLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA}`;

    try {
      const userData = await AsyncStorage.getItem('userdata');
      const userDetails = JSON.parse(userData);

      const requestData = {
        pageNo: String(pageNo),
        pageSize: '20',
        categoryId: '',
        companyId: companyId,
      };
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json'
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

  const renderProductItem = ({ item, index }) => (
    <>
      <TouchableOpacity style={styles.productCard} onPress={() => navigation.navigate('Details', { item })}>
        {/* Product Image */}
        <Image
          style={styles.productImage}
          source={item.imageUrls && item.imageUrls.length > 0 ? { uri: item.imageUrls[0] } : require('../../../assets/NewNoImage.jpg')}
        />
        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.productTitle}>{item.styleName}</Text>
          <Text style={styles.productTitle}>{item.styleDesc}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{item.mrp}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => openModal(item)}>
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {index === productsList.length - 1 && (
        <View style={{ marginBottom: 100 }} />
      )}
    </>
  );


  const handleEndReached = () => {
    if (pageNo < totalPages && !isFetching) {
      setIsFetching(true);
      setPageNo(prevPageNo => prevPageNo + 1);
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

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.searchContainer, { paddingHorizontal: 20 }]}>
        <TextInput
          style={[
            styles.searchInput,
            searchQuery.length > 0 && styles.searchInputActive,
          ]}
          autoFocus={false}
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          placeholder={searchQuery
            ? searchQuery
            : selectedDetails
              ? selectedDetails?.length + ' Categories Listed'
              : 'Search'}
          placeholderTextColor="#000"
        />

        <TouchableOpacity
          style={styles.searchButton}>
          {/* onPress={toggleSearchInput}> */}
          <Image
            style={styles.image}
            source={require('../../../assets/search.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {/* left content */}
        <ScrollView style={styles.sidebar} nestedScrollEnabled={true}>
          {selectedDetails.map((category, index) => (
            // <View key={index}>
            //   {index === 0 && (
            //     <TouchableOpacity
            //     style={[
            //       styles.categoryButton,
            //       category.categoryId === activeCategoryId && styles.activeCategoryButton
            //     ]}
            //       onPress={() => handleAllProducts(companyId)}
            //     >
            //       <Image source={require('../../../assets/img4.jpg')} style={styles.categoryImage} />
            //       <Text style={styles.categoryText}>All</Text>
            //     </TouchableOpacity>
            //   )}
            //   <TouchableOpacity
            //     style={[
            //       styles.categoryButton,
            //       category.categoryId === activeCategoryId && styles.activeCategoryButton
            //     ]}
            //     onPress={() => handleCategory(category)}
            //   >
            //     <Image source={require('../../../assets/img5.jpg')} style={styles.categoryImage} />
            //     <Text style={[
            //       styles.categoryText,
            //       category.categoryId === activeCategoryId ? styles.activeCategoryText : styles.inactiveCategoryText
            //     ]}>
            //       {category.category}
            //     </Text>
            //   </TouchableOpacity>
            //   {index === selectedDetails.length - 1 && (
            //     <View style={{ marginBottom: 90 }} />
            //   )}
            // </View>
            <View key={index}>
              {index === 0 && (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory === "All Products" && styles.activeCategoryButton
                  ]}
                  onPress={() => handleAllProducts(companyId)}
                >
                  <Image source={require('../../../assets/img4.jpg')} style={styles.categoryImage} />
                  <Text style={styles.categoryText}>All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  category.categoryId === activeCategoryId && styles.activeCategoryButton
                ]}
                onPress={() => handleCategory(category)}
              >
                <Image source={require('../../../assets/img5.jpg')} style={styles.categoryImage} />
                <Text style={[
                  styles.categoryText,
                  category.categoryId === activeCategoryId ? styles.activeCategoryText : styles.inactiveCategoryText
                ]}>
                  {category.category}
                </Text>
              </TouchableOpacity>
              {index === selectedDetails.length - 1 && (
                <View style={{ marginBottom: 90 }} />
              )}
            </View>

          ))}
        </ScrollView>

        {/* right Content */}
        <View style={styles.content}>
          {!showSearchBar ?
            (<View style={{ flexDirection: 'row' }}>
              <Text style={styles.title}>{selectedCategory}</Text>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearchBar(!showSearchBar)}>
                <Image
                  style={styles.image}
                  source={require('../../../assets/search.png')}
                />
              </TouchableOpacity>
            </View>) : (
              <View style={[styles.searchContainer, { paddingHorizontal: 10 }]}>
                <TextInput
                  style={[
                    styles.searchInput,
                    searchQueryProducts.length > 0 && styles.searchInputActive,
                  ]}
                  autoFocus={false}
                  value={searchQueryProducts}
                  onChangeText={text => setSearchQueryProducts(text)}
                  placeholder={
                    searchQueryProducts
                      ? searchQueryProducts
                      : totalItems
                        ? totalItems + ' Products Listed'
                        : "Search"
                  }
                  placeholderTextColor="#000"
                />

                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => setShowSearchBar(!showSearchBar)}>
                  <Image
                    style={styles.image}
                    source={require('../../../assets/close.png')}
                  />
                </TouchableOpacity>
              </View>)}

          {isLoading && <ActivityIndicator
            style={{
              position: 'absolute',
              top: 200,
              left: '50%',
              marginLeft: -20,
              marginTop: -20,
              zIndex: 100,
            }}
            size="large"
            color="#1F74BA"
          />}
          {productsList.length === 0 && !isLoading ? (
            <View style={styles.noProductsContainer}>
              <Text style={styles.noProductsText}>There are no products available.</Text>
            </View>) :
            // <FlatList
            //   ref={flatListRef}
            //   data={productsList}
            //   renderItem={renderProductItem}
            //   keyExtractor={(item, index) => `item.toString()+${index}`}
            //   contentContainerStyle={styles.flatListContainer}
            //   removeClippedSubviews={true}
            //   initialNumToRender={10}
            //   maxToRenderPerBatch={10}
            //   updateCellsBatchingPeriod={100}
            //   windowSize={7}
            //   onEndReached={handleEndReached}
            //   onEndReachedThreshold={0.5}
            //   // onScroll={handleScroll}
            //   // scrollEventThrottle={16}
            //   // getItemLayout={(data, index) => ({
            //   //   length: 350,
            //   //   offset: 350 * index,
            //   //   index,
            //   // })}
            //   // onContentSizeChange={() => {
            //   //   if (scrollPosition !== 0) {
            //   //     flatListRef.current.scrollToOffset({
            //   //       offset: scrollPosition,
            //   //       animated: false,
            //   //     });
            //   //   }
            //   // }}
            //   refreshControl={
            //     <RefreshControl
            //       refreshing={refreshing}
            //       onRefresh={onRefresh}
            //       colors={['#000', '#689F38']}
            //     />
            //   }
            // />

            <FlatList
              data={productsList}
              renderItem={renderProductItem}
              keyExtractor={(item, index) => `item.toString()+${index}`}
              contentContainerStyle={styles.flatListContainer}

              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#000', '#689F38']}
                />}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.1}
            />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '27%',
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  categoryButton: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 3,
    paddingTop: 2,
  },
  categoryImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
    // fontWeight: 'bold',
  },
  activeCategoryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1F74BA',
  },
  activeCategoryText: {
    color: '#000',
  },
  inactiveCategoryText: {
    color: '#000',
  },
  content: {
    width: '73%',
    padding: 20,
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
    flexDirection: 'row',
    marginVertical: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  productSize: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#F09120',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: "flex-start",
    marginTop: 20,
  },
  noProductsText: {
    fontSize: 18,
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 30,
    marginHorizontal: 10,
    backgroundColor: 'white',
    elevation: 5,
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
  },
  image: {
    height: 30,
    width: 30,
  },
});

export default NewCategoryUi;


// #1E88E5



