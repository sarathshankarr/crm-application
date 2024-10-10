import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux'; // Import these for Redux actions
import {
  addItemToCart,
  setSourceScreen,
  updateCartItem,
} from '../../redux/actions/Actions';

const PackageDetail = ({route}) => {
  const {packageId} = route.params;
  const [stylesData, setStylesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const cartItems = useSelector(state => state.cartItems);
  const dispatch = useDispatch(); // Initialize the dispatch function
  const currentScreen = useSelector(
    state => state.cartItems.currentSourceScreen,
  );

  // In PackageDetail component
  useEffect(() => {
    dispatch(setSourceScreen('PackageDetail')); // Track the current screen
    return () => {
      dispatch(setSourceScreen(null)); // Reset screen on unmount
    };
  }, [dispatch]);

  const getAllPackages = async () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_PACKAGES_DETAILS}/${packageId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data?.status?.success) {
        setStylesData(response.data?.response?.packagesList || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllPackagesModel = async () => {
    const apiUrl = `${global?.userData?.productURL}${
      API.GET_PACKAGES_MODEL
    }/${packageId}/${2}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data?.status?.success) {
        const packageDetails = response.data.response.packagesList[0];
        if (packageDetails) {
          setModalData(packageDetails);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = async () => {
    await getAllPackagesModel();  // Fetch data before showing the modal
    setModalVisible(true);  // Open the modal only after data has been fetched
  };
  

  useEffect(() => {
    getAllPackages();  // This fetches packages on screen load
    getAllPackagesModel();  // Preload modal data when the component mounts
  }, [packageId]);

  const handleSaveItem = () => {
    if (!modalData) return;

    // Check if there are any items from a different screen
    const existingItemFromOtherScreen = cartItems.find(
      item => item.sourceScreen && item.sourceScreen !== 'PackageDetail',
    );

    if (existingItemFromOtherScreen) {
      Alert.alert('Cannot add items from two screens simultaneously.');
      return;
    }

    let itemsToUpdate = [];

    modalData.lineItems.forEach(item => {
      const inputValue = inputValues[item.styleId] || '0';

      if (parseInt(inputValue, 10) > 0) {
        const itemBaseDetails = {
          packageId:item.packageId,
          styleId: item.styleId,
          styleName: item.styleName,
          colorName: item.colorName,
          colorId:item.colorId,
          sizeDesc: item.size,
          quantity: inputValue,
          dealerPrice: modalData?.dealerPrice,
          retailerPrice: modalData?.retailerPrice,
          price: modalData?.price,
          sourceScreen: 'PackageDetail',
        };

        const existingItemIndex = cartItems.findIndex(
          cartItem => cartItem.styleId === item.styleId,
        );

        if (existingItemIndex !== -1) {
          const updatedQuantity = parseInt(inputValue, 10);
          const updatedItem = {
            ...cartItems[existingItemIndex],
            quantity: updatedQuantity.toString(),
            price: modalData?.price,
          };
          dispatch(updateCartItem(existingItemIndex, updatedItem));
        } else {
          itemsToUpdate.push(itemBaseDetails);
        }
      }
    });

    if (itemsToUpdate.length > 0) {
      itemsToUpdate.forEach(item => dispatch(addItemToCart(item)));
    }

    setInputValues({});
    setModalVisible(false);
  };

  const isSaveButtonEnabled = () => {
    return Object.values(inputValues).some(value => parseInt(value, 10) > 0);
  };

  const renderSizeItem = ({item}) => (
    <View style={styles.sizeItem}>
      <Text style={styles.txt}>Size: {item.sizeDesc}</Text>
      <Text style={styles.txt}>Available Qty: {item.qty}</Text>
    </View>
  );

  const renderStyleItem = ({item}) => {
    const {styleName, imageUrls, sizeList} = item;
    const imageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

    return (
      <View style={styles.styleContainer}>
        <Text style={styles.styleName}>{styleName}</Text>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image style={styles.styleImage} source={{uri: imageUrl}} />
          ) : (
            <Image
              style={styles.styleImage}
              resizeMode="contain"
              source={require('../../../assets/NewNoImage.jpg')}
            />
          )}
        </View>
        <View style={styles.sizeListContainer}>
          <FlatList
            data={sizeList}
            renderItem={renderSizeItem}
            keyExtractor={sizeItem =>
              sizeItem.sizeId
                ? sizeItem.sizeId.toString()
                : Math.random().toString()
            }
            nestedScrollEnabled={true}
          />
        </View>
      </View>
    );
  };

  const renderProductItem = ({item}) => {
    const {styleList} = item;

    return (
      <TouchableOpacity style={styles.productItem}>
        <FlatList
          data={styleList}
          renderItem={renderStyleItem}
          keyExtractor={styleItem =>
            styleItem.styleId
              ? styleItem.styleId.toString()
              : Math.random().toString()
          }
          nestedScrollEnabled={true}
          numColumns={2}
          contentContainerStyle={styles.innerFlatList}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stylesData}
        renderItem={renderProductItem}
        keyExtractor={item => item.packageId.toString()}
        numColumns={1}
      />
      <View>
        <TouchableOpacity style={styles.addqtyheader} onPress={openModal}>
          <Text style={{color: '#000'}}>ADD QTY</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.headerRow}>
              {[
                'Name',
                'Size',
                'Qty.Box',
                'Box (pc)',
                'Qty (pc)',
                'Price',
                'Ret Price',
              ].map((title, index) => (
                <Text key={index} style={styles.txtt}>
                  {title}
                </Text>
              ))}
            </View>
            {modalData &&
            modalData.lineItems &&
            modalData.lineItems.length > 0 ? (
              modalData.lineItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.stylenametxt}>{item.styleName}</Text>
                  <Text style={styles.stylenametxt}>{item.size}</Text>
                  <TextInput
                    style={styles.stylenametxt}
                    keyboardType="numeric"
                    value={
                      inputValues[item.styleId] !== undefined
                        ? inputValues[item.styleId]
                        : '0'
                    }
                    onChangeText={value => {
                      setInputValues(prev => ({
                        ...prev,
                        [item.styleId]: value === '' ? '' : value,
                      }));
                    }}
                  />
                  <Text style={styles.stylenametxt}>{item.boxQty}</Text>
                  <Text style={styles.stylenametxt}>
                    {item.boxQty * (parseInt(inputValues[item.styleId]) || 0)}
                  </Text>
                  <Text style={styles.stylenametxt}>{modalData?.price}</Text>
                  <Text style={styles.stylenametxt}>
                    {modalData?.retailerPrice}
                  </Text>
                </View>
              ))
            ) : (
              <Text>No items available</Text>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={handleSaveItem} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Save</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={isSaveButtonEnabled() ? handleSaveItem : null}
                disabled={!isSaveButtonEnabled()}
                style={[
                  styles.closeButton,
                  {backgroundColor: isSaveButtonEnabled() ? '#F09120' : 'gray'},
                ]}>
                <Text style={styles.closeButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productItem: {
    flex: 1,
    margin: 10,
  },
  styleContainer: {
    flex: 1,
  },
  styleName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginVertical: 3,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeItem: {
    marginLeft: 10,
  },
  txt: {
    color: '#000',
  },
  txtt: {
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  stylenametxt: {
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  styleImage: {
    width: 180,
    height: 180,
    marginBottom: 5,
  },
  innerFlatList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addqtyheader: {
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 10,
    marginHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor:"#F09120"
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '95%',
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

export default PackageDetail;
