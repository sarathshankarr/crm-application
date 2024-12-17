import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import {API} from './config/apiConfig';
import axios, {all} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {CLEAR_CART} from './redux/ActionTypes';

const Sidebar = ({navigation, route}) => {
  const userRole = useSelector(state => state.userRole) || '';
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState(require('../assets/profile.png'));
  const [userData, setUserData] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownVisiblee, setDropdownVisiblee] = useState(false); // Add state for second dropdown if needed
  const [dropdownVisiblePublish, setDropdownVisiblePublish] = useState(false); // Add state for second dropdown if needed
  const [dropdownVisibleProduct, setDropdownVisibleProduct] = useState(false);
  const [dropdownVisibleOrder, setdropdownVisibleOrder] = useState(false);
  const [dropdownVisibleStyle, setDropdownVisibleeStyel] = useState(false); // Add state for second dropdown if needed
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [roleMenu, setRoleMenu] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleMenus, setRoleMenus] = useState([]);

  const dispatch = useDispatch();

  const loginuser = useSelector(state => state.loggedInUser);
  // console.log('loginuser============>', loginuser);
  const isAdmin = loginuser?.role?.some(
    role => role.role.toLowerCase() === 'admin',
  );
  const isDistributor = loginuser?.role?.some(
    role => role.role.toLowerCase() === 'distributor',
  );

  // console.log('isAdmin============>', isAdmin);
  // console.log('isDistributor============>', isDistributor);
  // console.log('userRole==========>', userRole);
  useEffect(() => {
    const {params} = route ?? {};
    if (params && params.userData) {
      setUserData(params.userData);
    } else {
      getUserDataFromStorage();
    }
  }, [route]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getUserDataFromStorage();
    });
    return unsubscribe;
  }, [navigation]);

  const getUserDataFromStorage = async () => {
    const userToken = await AsyncStorage.getItem('userdata');
    if (userToken) {
      setUserData(JSON.parse(userToken));
    }
  };

  const getUserInActive = () => {
    if (!userData) return;

    const apiUrl = `${userData.productURL}${API.GET_USER_IN_ACTIVE}/${userData.token.userId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${userData.token.access_token}`,
        },
      })
      .then(response => {
        if (response.data === true) {
          // Navigate to login screen
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        } else {
          console.error('Account not inactive. Could not delete.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setDropdownVisiblee(false);
    setDropdownVisiblePublish(false);
    setDropdownVisibleProduct(false);
    setdropdownVisibleOrder(false);
    setDropdownVisibleeStyel(false);
  };

  const toggleDropdownSecond = () => {
    setDropdownVisiblee(!dropdownVisiblee);
    setDropdownVisible(false);
    setDropdownVisiblePublish(false);
    setDropdownVisibleProduct(false);
    setdropdownVisibleOrder(false);
    setDropdownVisibleeStyel(false);
  };

  const toggleDropdownStyle = () => {
    setDropdownVisibleeStyel(!dropdownVisibleStyle);
    setDropdownVisible(false);
    setDropdownVisiblePublish(false);
    setDropdownVisibleProduct(false);
    setdropdownVisibleOrder(false);
  };

  const toggleDropdownthird = () => {
    setDropdownVisiblePublish(!dropdownVisiblePublish);
    setDropdownVisible(false);
    setDropdownVisiblee(false);
    setDropdownVisibleProduct(false);
    setdropdownVisibleOrder(false);
    setDropdownVisibleeStyel(false);
  };

  const toggleDropdownfourth = () => {
    setDropdownVisibleProduct(!dropdownVisibleProduct);
    setDropdownVisible(false);
    setDropdownVisiblee(false);
    setDropdownVisiblePublish(false);
    setdropdownVisibleOrder(false);
    setDropdownVisibleeStyel(false);
  };

  const toggleDropdownOrder = () => {
    setdropdownVisibleOrder(!dropdownVisibleOrder);
    setDropdownVisible(false);
    setDropdownVisiblee(false);
    setDropdownVisiblePublish(false);
    setDropdownVisibleProduct(false);
    setDropdownVisibleeStyel(false);
  };

  const goToHome = () => {
    navigation.navigate('Home');
  };

  const goToCategories = () => {
    navigation.navigate('Categories');
  };

  const goToOrder = () => {
    navigation.navigate('Order');
  };

  const goToPackOrder = () => {
    navigation.navigate('Packing orders');
  };
  const goToProductInventory = () => {
    navigation.navigate('ProductInventory');
  };

  const goToLocationInventory = () => {
    navigation.navigate('LocationInventory');
  };
  const goToDistributorInventory = () => {
    navigation.navigate('DistributorInventory');
  };
  const goToDistributorGrn = () => {
    navigation.navigate('Distributor GRN');
  };

  const goToEditProfile = () => {
    navigation.navigate('Profile');
  };

  const goToActivities = () => {
    navigation.navigate('Activities');
  };
  const goToCosting = () => {
    navigation.navigate('Costing');
  };
  const goToPublish = () => {
    navigation.navigate('ProductPackagePublish');
  };
  const goToProduct = () => {
    navigation.navigate('ProductsStyles');
  };
  const goToPackages = () => {
    navigation.navigate('Packages');
  };
  const goToCustomerLocation = () => {
    navigation.navigate('CustomerLocation');
  };
  const goToAttendence = () => {
    navigation.navigate('Attendence');
  };

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then(image => {
        setImage({uri: image.path});
        setModalVisible(false);
      })
      .catch(error => {
        setModalVisible(false);
      });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then(image => {
        setImage({uri: image.path});
        setModalVisible(false);
      })
      .catch(error => {
        setModalVisible(false);
      });
  };

  const LogoutAudit = () => {
    const globalUserData = global?.userData;

    const userId = globalUserData?.token?.userId;
    const companyId = globalUserData?.token?.companyId;

    const apiUrl = `${global?.userData?.productURL}${
      API.LOGINAUDIT
    }/${userId}/${companyId}/${1}/${2}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {})
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleLogout = async () => {
    await LogoutAudit();
    try {
      await AsyncStorage.removeItem('userdata'); // Remove the user data from AsyncStorage
      await AsyncStorage.removeItem('userRole'); // Remove the user role from AsyncStorage
      await AsyncStorage.removeItem('userRoleId'); // Remove the user role ID from AsyncStorage
      await AsyncStorage.removeItem('loggedInUser'); // Remove the logged-in user data from AsyncStorage
      await AsyncStorage.removeItem('selectedCompany'); // Remove the logged-in user data from AsyncStorage
      dispatch({type: CLEAR_CART});

      navigation.closeDrawer(); // Close the drawer
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const getRoleMenus = async () => {
    try {
      const storedRoleMenu = await AsyncStorage.getItem('roleMenu');
      if (storedRoleMenu) {
        setRoleMenus(JSON.parse(storedRoleMenu));
      }
    } catch (err) {
      console.error('Error retrieving role menus:', err.message);
    }
  };

  // Fetch all mobile menus
  const getAllMobileMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_THE_MENUS_FOR_MOBILE}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      const allMenus = response.data.response.menuList;
      setAllMenus(allMenus);
    } catch (err) {
      setError(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter menus based on roleMenus
  useEffect(() => {
    if (roleMenus.length > 0 && allMenus.length > 0) {
      const roleMenuIds = roleMenus.map(menu => menu?.menuId); // Extract menuId from roleMenus
      const filtered = allMenus.filter(menu =>
        roleMenuIds.includes(menu?.menuId),
      ); // Filter allMenus
      setFilteredMenus(filtered);
    }
  }, [roleMenus, allMenus]);

  // Fetch menus on component mount
  useEffect(() => {
    getRoleMenus();
    getAllMobileMenus();
  }, []);

  // Map menus to variables based on menuId
  const menuMap = {};
  filteredMenus.forEach(menu => {
    menuMap[menu.menuId] = menu;
  });

  const home = menuMap[1]; // Home menu
  const Categories = menuMap[2]; // Categories menu
  const Productstyle = menuMap[3];
  const Packages = menuMap[4];
  const productpublish = menuMap[14];
  const orders = menuMap[5];
  const packingorders = menuMap[6];
  const ProductInventory = menuMap[7];
  const locationwiseinventory = menuMap[8];
  const distributorwiseinventory = menuMap[9];
  const distributorgrn = menuMap[10];
  const Activities = menuMap[11];
  const LocationTask = menuMap[12];
  const attendance = menuMap[13];

  const hasDropdownhome = home;
  const hasDropdowncategories = Categories;
  const hasDropdownProductstyle = Productstyle;
  const hasDropdownPackages = Packages;
  const hasDropdownproductpublish = productpublish;
  const hasDropdownorders = orders;
  const hasDropdownpackingorders = packingorders;
  const hasDropdownProductInventory = ProductInventory;
  const hasDropdownlocationwiseinventory = locationwiseinventory;
  const hasDropdowndistributorwiseinventory = distributorwiseinventory;
  const hasDropdowndistributorgrn = distributorgrn;
  const hasDropdownActivities = Activities;
  const hasDropdownLocationTask = LocationTask;
  const hasDropdownattendance = attendance;

  const hasDropdownItemsprodust = Productstyle || Packages || productpublish;
  const hasDropdownItemsOrders = orders || packingorders;
  const hasDropdownItemsInvetory =
    ProductInventory || locationwiseinventory || distributorwiseinventory;
  const hasDropdowncompaign = Activities;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={{backgroundColor: '#1F74BA'}}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image style={[styles.img, {borderRadius: 30}]} source={image} />
            </TouchableOpacity>
            <Text style={{color: '#fff', fontSize: 20}}>Profile</Text>
          </View>
          <View>
            {userData && (
              <Text style={styles.usertxt}>
                Name : {userData.token.firstName} {userData.token.lastName}
              </Text>
            )}
          </View>
        </View>
        {hasDropdownhome && (
          <TouchableOpacity onPress={goToHome} style={styles.homeheader}>
            <Image
              style={styles.homeimg}
              source={require('../assets/store.png')}
            />

            <Text style={styles.hometxt}>{home?.menuName}</Text>
          </TouchableOpacity>
        )}
        {hasDropdowncategories && (
          <TouchableOpacity
            onPress={goToCategories}
            style={styles.categorieshead}>
            <Image
              style={styles.categoriesimg}
              source={require('../assets/menu-1.png')}
            />
            <Text style={styles.categoriestxt}>{Categories?.menuName}</Text>
          </TouchableOpacity>
        )}
        {!isDistributor && hasDropdownItemsprodust && (
          <TouchableOpacity
            style={styles.inventoryhead}
            onPress={toggleDropdownfourth}>
            <Image
              style={styles.orderimg}
              source={require('../assets/box.png')}
            />
            <Text style={styles.ordertxt}>Products</Text>
            <View style={{marginLeft: 'auto'}}>
              <Image
                source={require('../assets/dropdown.png')}
                style={{width: 20, height: 20}}
              />
            </View>
          </TouchableOpacity>
        )}
        {dropdownVisibleProduct && (
          <View style={styles.dropdown}>
            {hasDropdownProductstyle && (
              <TouchableOpacity
                style={styles.inventoryhead}
                onPress={goToProduct}>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/package.png')}
                />
                <Text style={styles.dropdownItem}>
                  {Productstyle?.menuName}
                </Text>
              </TouchableOpacity>
            )}
            {hasDropdownPackages && (
              <TouchableOpacity
                style={styles.inventoryhead}
                onPress={goToPackages}>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/package.png')}
                />
                <Text style={styles.dropdownItem}>{Packages?.menuName}</Text>
              </TouchableOpacity>
            )}
            {hasDropdownproductpublish && (
              <TouchableOpacity
                style={styles.inventoryhead}
                onPress={goToPublish}>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/package.png')}
                />
                <Text style={styles.dropdownItem}>
                  {productpublish?.menuName}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {hasDropdownItemsOrders && (
          <TouchableOpacity
            style={styles.inventoryhead}
            onPress={toggleDropdownOrder}>
            <Image
              style={styles.orderimg}
              source={require('../assets/orderr.png')}
            />
            <Text style={styles.ordertxt}>Orders and Returns</Text>
            <View style={{marginLeft: 'auto'}}>
              <Image
                source={require('../assets/dropdown.png')}
                style={{width: 20, height: 20}}
              />
            </View>
          </TouchableOpacity>
        )}
        {dropdownVisibleOrder && (
          <View style={styles.dropdown}>
            {hasDropdownorders && (
              <TouchableOpacity onPress={goToOrder} style={styles.orderhead}>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/packing.png')}
                />
                <Text style={styles.dropdownItem}>{orders?.menuName}</Text>
              </TouchableOpacity>
            )}
            {hasDropdownpackingorders && (
              <TouchableOpacity
                style={styles.inventoryhead}
                onPress={goToPackOrder}>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/packing.png')}
                />
                <Text style={styles.dropdownItem}>
                  {packingorders?.menuName}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {hasDropdownItemsInvetory && (
          <TouchableOpacity
            style={styles.inventoryhead}
            onPress={toggleDropdown}>
            <Image
              style={styles.orderimg}
              source={require('../assets/inventory.png')}
            />
            <Text style={styles.ordertxt}>Inventory</Text>
            <View style={{marginLeft: 'auto'}}>
              <Image
                source={require('../assets/dropdown.png')}
                style={{width: 20, height: 20}}
              />
            </View>
          </TouchableOpacity>
        )}
        {dropdownVisible && (
          <View style={styles.dropdown}>
            {!isDistributor && hasDropdownProductInventory && (
              <TouchableOpacity
                style={styles.inventoryhead}
                onPress={() => goToProductInventory('Product Inventory')}>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/product-management.png')}
                />
                <Text style={styles.dropdownItem}>
                  {ProductInventory?.menuName}
                </Text>
              </TouchableOpacity>
            )}
            {!isDistributor && hasDropdownlocationwiseinventory && (
              <TouchableOpacity
                style={styles.inventoryhead}
                onPress={() =>
                  goToLocationInventory('Location Wise Inventory')
                }>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/locationinv.png')}
                />
                <Text style={styles.dropdownItemm}>
                  {locationwiseinventory?.menuName}
                </Text>
              </TouchableOpacity>
            )}
            {hasDropdowndistributorwiseinventory && (
              <TouchableOpacity
                style={styles.inventoryhead}
                onPress={() =>
                  goToDistributorInventory('Distributor Inventory')
                }>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/disinventory.png')}
                />
                <Text style={styles.dropdownItemm}>
                  {distributorwiseinventory?.menuName}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {hasDropdowndistributorgrn && (
          <TouchableOpacity
            onPress={goToDistributorGrn}
            style={styles.distributorhead}>
            <Image
              style={styles.distributorimg}
              source={require('../assets/distributor.png')}
            />
            <Text style={styles.ordertxt}>{distributorgrn?.menuName}</Text>
          </TouchableOpacity>
        )}
        {!isDistributor && hasDropdowncompaign && (
          <TouchableOpacity
            style={styles.inventoryhead}
            onPress={toggleDropdownSecond}>
            <Image
              style={styles.orderimg}
              source={require('../assets/activity.png')}
            />
            <Text style={styles.ordertxt}>Campaign Management</Text>
            <View style={{marginLeft: 'auto'}}>
              <Image
                source={require('../assets/dropdown.png')}
                style={{width: 20, height: 20}}
              />
            </View>
          </TouchableOpacity>
        )}
        {dropdownVisiblee && (
          <View style={styles.dropdown}>
            {hasDropdownActivities && (
              <TouchableOpacity
                style={styles.inventoryhead}
                onPress={goToActivities}>
                <Image
                  style={styles.prodimg}
                  source={require('../assets/acticityone.png')}
                />
                <Text style={styles.dropdownItem}>{Activities?.menuName}</Text>
              </TouchableOpacity>
            )}
            {/* Add more dropdown items here */}
          </View>
        )}
        {/* <TouchableOpacity
            style={styles.inventoryhead}
            onPress={toggleDropdownStyle}>
            <Image
              style={styles.orderimg}
              source={require('../assets/style.png')}
            />
            <Text style={styles.ordertxt}>Styles</Text>
            <View style={{marginLeft: 'auto'}}>
              <Image
                source={require('../assets/dropdown.png')}
                style={{width: 20, height: 20}}
              />
            </View>
          </TouchableOpacity> */}
        {dropdownVisibleStyle && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.inventoryhead}
              onPress={goToCosting}>
              <Image
                style={styles.prodimg}
                source={require('../assets/dollar.png')}
              />
              <Text style={styles.dropdownItem}>Costing</Text>
            </TouchableOpacity>
            {/* Add more dropdown items here */}
          </View>
        )}
        {!isDistributor && hasDropdownLocationTask && (
          <TouchableOpacity
            onPress={goToCustomerLocation}
            style={styles.inventoryhead}>
            <Image
              style={styles.locimg}
              source={require('../assets/location-pin.png')}
            />
            <Text style={styles.ordertxt}>{LocationTask?.menuName}</Text>
          </TouchableOpacity>
        )}
        {!isDistributor && attendance && (
          <TouchableOpacity
            onPress={goToAttendence}
            style={styles.inventoryhead}>
            <Image
              style={styles.locimg}
              source={require('../assets/attendence.png')}
            />
            <Text style={styles.ordertxt}>{attendance?.menuName}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutbox}>
          <Image
            resizeMode="contain"
            style={[
              styles.logoutimg,
              {tintColor: '#fff', height: 20, width: 20},
            ]}
            source={require('../assets/logout.png')}
          />
          <Text style={styles.logouttxt}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.orderhead1}
          onPress={() => setDeleteModalVisible(true)}>
          <Image
            style={{height: 25, width: 25, tintColor: 'red'}}
            source={require('../assets/delete.png')}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
              marginLeft: 8,
              color: 'red',
            }}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={takePhotoFromCamera}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={choosePhotoFromLibrary}>
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={{color: 'white'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalMessage}>
              User information will be deleted.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton1}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton1, styles.modalDeleteButton]}
                onPress={() => {
                  getUserInActive();
                  setDeleteModalVisible(false);
                }}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  img: {
    height: 60,
    width: 60,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  usertxt: {
    marginLeft: 20,
    fontSize: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    color: '#fff',
  },
  homeheader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 25,
  },
  homeimg: {
    height: 30,
    width: 30,
    // tintColor:'#1F74BA',
    tintColor: '#5177c0',
  },
  hometxt: {
    fontSize: 16,
    marginLeft: 10,
    color: '#000',
  },
  categorieshead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 25,
  },
  categoriesimg: {
    height: 25,
    width: 25,
    tintColor: '#5177c0',
  },
  categoriestxt: {
    fontSize: 16,
    marginLeft: 10,
    color: '#000',
  },
  orderhead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 25,
  },
  orderhead1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 7,
    justifyContent: 'center',
  },
  inventoryhead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 20,
  },
  distributorhead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 25,
  },
  orderimg: {
    height: 30,
    width: 30,
    tintColor: '#5177c0',
  },
  prodimg: {
    height: 30,
    width: 30,
    marginLeft: 40,
    tintColor: '#5177c0',
  },
  distributorimg: {
    height: 35,
    width: 35,
    tintColor: '#5177c0',
  },
  locimg: {
    height: 30,
    width: 30,
    tintColor: '#5177c0',
  },
  ordertxt: {
    fontSize: 16,
    marginLeft: 10,
    color: '#000',
  },
  dropdownItem: {
    fontSize: 16,
    marginHorizontal: 10,
    marginTop: 10,
    color: '#000',
  },
  dropdownItemm: {
    fontSize: 16,
    marginHorizontal: 10,
    marginTop: 15,
    color: '#000',
  },
  logoutContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,

    borderColor: '#ddd',
  },
  logoutbox: {
    borderWidth: 1,
    borderColor: '#f55951',
    backgroundColor: '#1F74BA',
    // backgroundColor: '#543c52',
    borderRadius: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    marginHorizontal: 30,
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoutbox1: {
    borderWidth: 1,
    borderColor: '#f55951',
    backgroundColor: '#f55951',
    borderRadius: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    marginHorizontal: 30,
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoutimg: {
    height: 20,
    width: 15,
    marginRight: 8,
  },
  logouttxt: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalCancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'red',
    borderRadius: 10,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#000',
  },
  modalButton1: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#000',
  },

  modalDeleteButton: {
    backgroundColor: 'red',
  },
});

export default Sidebar;
