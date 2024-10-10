import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';
import {API} from '../../config/apiConfig';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {debounce} from 'lodash';
import ImageSlider from '../../components/ImageSlider';

const Packages = ({navigation}) => {
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stylesData, setStylesData] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
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
  const [filterFlag, setFilterFlag] = useState(false);

  const [imageUrls, setImageUrls] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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

  const getAllImages = packageId => {
    const apiUrl = `${global?.userData?.productURL}${
      API.GET_ALL_IMAGES_PACKAGE
    }/${packageId}/${0}`;
    console.log('apiUrl=====>', apiUrl);
    setImageLoading(true); // Set loading to true before API call
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const images =
          response.data?.response?.packagesList?.[0]?.imageUrls || [];
        console.log(
          'response.data?.imageUrls=====>',
          response.data?.response?.packagesList,
        );
        setImageUrls(images);
        setIsModalVisible(true); // Show modal after getting images
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setImageLoading(false); // Set loading to false after API call completes
      });
  };

  const renderImage = ({item}) => {
    return (
      <Image
        source={{uri: item}}
        style={styles.imageInModal}
        resizeMode="contain"
      />
    );
  };

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

    const apiUrl = `${global?.userData?.productURL}${API.GET_PACKAGES}/${customFrom}/${customTo}/${companyId}`;

    console.log('getAllOrders A ', customFrom, customTo);

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      const newTasks = response.data?.response?.packagesList;
      console.log('response.data====>', response.data?.response?.packagesList);
      if (reset) {
        setStylesData(newTasks);
      } else {
        setStylesData(prevTasks => [...(prevTasks || []), ...newTasks]);
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

  const gettasksearch = async (
    reset = false,
    customFrom = from,
    customTo = to,
  ) => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_PACKAGES_SERACH}`;
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

      if (response.data.response.packagesList) {
        // setOrders(response.data.response.ordersList);

        const newOrders = response.data.response.packagesList.filter(
          order => order !== null,
        );

        setStylesData(prevDetails =>
          reset ? newOrders : [...prevDetails, ...newOrders],
        );
        setHasMoreTasks(newOrders?.length >= 15);

        // setHasMoreTasks(false);
      } else {
        setStylesData([]);
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
    {label: 'Package Name', value: 1},
    {label: 'Dealer Price', value: 2},
    {label: 'Retailer Price', value: 3},
    {label: 'MRP', value: 4},
  ];

  const renderProductItem = ({item}) => {
    const {packageName, imageUrls, packageId} = item;
    const handleViewImages = async () => {
      setIsModalVisible(true); // Show modal immediately
      // Fetch images in the background
      await getAllImages(packageId);
    };
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          navigation.navigate('PackageDetail', {
            packageId: packageId,
            packageDetails: item, // Pass package details
          });
        }}>
        <View style={styles.productImageContainer}>
          {imageUrls && imageUrls.length > 0 ? (
            <Image style={styles.productImage} source={{uri: imageUrls[0]}} />
          ) : (
            <Image
              style={styles.productImage}
              resizeMode="contain"
              source={require('../../../assets/NewNoImage.jpg')}
            />
          )}
          {/* Overlay Text */}
          <View style={styles.packageNameOverlay}>
            <Text style={styles.packageNameText}>{packageName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleViewImages}>
          <View style={{flexDirection:"row",marginVertical:2}}>
            <Text style={{color:"#000",fontWeight:"500"}}>View Images</Text>
            <Image
              style={{height:25, width: 25,marginHorizontal:5}}
              source={require('../../../assets/view.png')}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
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
          <Text style={styles.searchButtonText}>Search</Text>
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
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : stylesData.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          data={stylesData}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => `${item.packageId}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
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

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {imageLoading ? ( // Show ActivityIndicator while loading images
              <ActivityIndicator size="large" color="#0000ff" />
            ) : imageUrls.length > 0 ? ( // Check if imageUrls is not empty
              <ImageSlider imageUrls={imageUrls} />
            ) : (
              <Image
                style={{height: '90%'}}
                resizeMode="contain"
                source={require('../../../assets/NewNoImage.jpg')}
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-around',
  },
  productItem: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  productImageContainer: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    position: 'relative', // Add relative positioning for the overlay
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  packageNameOverlay: {
    position: 'absolute', // Position the text overlay
    bottom: 0, // Align to the bottom of the image
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    padding: 5,
  },
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    padding: 5,
  },
  packageNameText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
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
    borderColor: 'gray',
    textAlign: 'left',
    paddingVertical: 5,
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
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    height: 20,
    width: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  searchIcon: {
    width: 25,
    height: 25,
    marginHorizontal: 5, // Add margin to properly separate icon from input
  },

  imagee: {
    height: 25,
    width: 25,
    marginLeft: 10,
  },
  dropdownContent1: {
    elevation: 5,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalContainer: {
    marginVertical: 120,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  modalContent: {
    marginVertical: 50,
  },
  modalImage: {
    width: 300,
    height: 300,
    marginHorizontal: 10,
  },
  closeButton: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  closeButtonText: {
    color: 'white', // Close button text color
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

export default Packages;
