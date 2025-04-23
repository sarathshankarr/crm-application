import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import {API} from './config/apiConfig';
import axios, {all} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {CLEAR_CART, SET_SELECTED_COMPANY} from './redux/ActionTypes';
import {ColorContext, ColorProvider} from './components/colortheme/colorTheme';
import FastImage from 'react-native-fast-image';
import { setLoggedInUser } from './redux/actions/Actions';

const Sidebar = ({navigation, route}) => {
  const userRole = useSelector(state => state.userRole) || '';
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState(require('../assets/profile.png'));
  const [userData, setUserData] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [allMenus, setAllMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roleMenus, setRoleMenus] = useState([]);

  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [roleMenusLoaded, setRoleMenusLoaded] = useState(false);

  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [selectedDropdown, setSelectedDropdown] = useState(null);
  const [tempBackgroundEffect, setTempBackgroundEffect] = useState({});

  const companyName = selectedCompany ? selectedCompany.companyName : '';
  const companyCode = selectedCompany ? selectedCompany.companyCode : '';
  const [selectedCompanyy, setSelectedCompany] = useState(null);


  const [companyLogo, setCompanyLogo] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          dispatch(setLoggedInUser(userData));
          if (userData && userData.compList && userData.compList.length > 0) {
            const initialCompany = userData.compList[0];
            setSelectedCompany(initialCompany);
            setCompanyLogo(initialCompany.companyLogo);
            dispatch({type: SET_SELECTED_COMPANY, payload: initialCompany});
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [dispatch]);

  useEffect(() => {
    if (selectedCompany && selectedCompany.id) {
      getCompany(selectedCompany.id);
    }
  }, [selectedCompany]);



  const getCompany = companyId => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_COMPANY}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        const companyList = response.data.response.companyList;
        // console.log("getCompany",response.data.response.companyList)
        if (companyList && companyList.length > 0) {
          const company = companyList[0];
          setCompanyLogo(company.companyLogo);
        } else {
          console.log('No company data found');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setCompanyLogo(null);
      });
  };

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

  useEffect(() => {
    fetchInitialSelectedCompany();
  }, []);

  const companyId = selectedCompany
    ? selectedCompany.id
    : initialSelectedCompany?.id;

  const dispatch = useDispatch();

  const loginuser = useSelector(state => state.loggedInUser);
  // console.log('loginuser============>', loginuser);
  const isAdmin = loginuser?.role?.some(
    role => role.role.toLowerCase() === 'admin',
  );

  // const isDistributor = loginuser?.role?.some(
  //   role => role.role.toLowerCase() === 'distributor',
  // );
  // isDistributor! &&

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


  const toggleDropdown = key => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };


  const goToHome = () => {
    navigation.navigate('Home');
  };

  const goToCategories = () => {
    navigation.navigate('Categories');
  };


  const goToDistributorGrn = () => {
    navigation.navigate('Distributor GRN');
  };

  const goToCustomerLocation = () => {
    navigation.navigate('CustomerLocation');
  };
  const goToAttendence = () => {
    navigation.navigate('Attendence');
  };

  const goToSettingsScreen = () => {
    navigation.navigate('SettingsScreen');
  };

  // const takePhotoFromCamera = () => {
  //   ImagePicker.openCamera({
  //     width: 300,
  //     height: 400,
  //     cropping: true,
  //     compressImageQuality: 0.7,
  //   })
  //     .then(image => {
  //       setImage({uri: image.path});
  //       setModalVisible(false);
  //     })
  //     .catch(error => {
  //       setModalVisible(false);
  //     });
  // };
  
  const takePhotoFromCamera = () => {
    navigation.navigate('CameraScreen', {
      onImageCaptured: image => {
        setImage({ uri: image.path });
        setModalVisible(false);
      },
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
      await AsyncStorage.removeItem('roleMenu');

      dispatch({type: CLEAR_CART});

      // Reset companyIdrollmenu

      // Optionally, fetch initial selected company (if needed)
      await fetchInitialSelectedCompany();

      navigation.closeDrawer(); // Close the drawer
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  useEffect(() => {
    getRoleMenus(); // Fetch role menus first
  }, []);

  const getRoleMenus = async () => {
    try {
      const storedRoleMenu = await AsyncStorage.getItem('roleMenu');
      if (storedRoleMenu) {
        setRoleMenus(JSON.parse(storedRoleMenu));
        setRoleMenusLoaded(true); // Mark roleMenus as loaded
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
      const allMenusData = response.data.response.menuList;
      setAllMenus(allMenusData);
    } catch (err) {
      setError(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter menus based on roleMenus
  useEffect(() => {
    if (roleMenusLoaded) {
      getAllMobileMenus(); // Only fetch mobile menus after roleMenus are loaded
    }
  }, [roleMenusLoaded]); // Trigger this when roleMenusLoaded changes to true

  // Filter menus based on role menu ids
  useEffect(() => {
    if (roleMenus.length > 0 && allMenus.length > 0) {
      const roleMenuIds = roleMenus.map(menu => menu?.menuId); // Extract menuId from roleMenus
      const filtered = allMenus.filter(menu =>
        roleMenuIds.includes(menu?.menuId),
      ); // Filter allMenus
      setFilteredMenus(filtered);
    }
  }, [roleMenus, allMenus]);

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
  const costing = menuMap[15];
  const PickList = menuMap[16];
  const Location = menuMap[17];

  const hasDropdownhome = home;
  const hasDropdowncategories = Categories;

  const hasDropdowndistributorgrn = distributorgrn;
  const hasDropdownLocationTask = LocationTask;
  const hasDropdownattendance = attendance;
  const dropdownMenus = useMemo(() => {
    const hasProductStyle = Productstyle?.menuName;
    const hasPackages = Packages?.menuName;
    const hasProductPublish = productpublish?.menuName;
    const hasOrders = orders?.menuName || packingorders?.menuName || PickList?.menuName;
    const hasProductInventory = ProductInventory?.menuName;
    const hasLocationwiseInventory = locationwiseinventory?.menuName;
    const hasDistributorwiseInventory = distributorwiseinventory?.menuName;
    const hasActivities = Activities?.menuName; // Campaign Management
    const hasCosting = costing?.menuName; // Styles
    const hacPickList = PickList?.menuName;
    const hasLocation = Location?.menuName;
    return {
      style: {
        label:
          hasProductStyle || hasPackages || hasProductPublish
            ? 'Products'
            : null,
        icon:
          hasProductStyle || hasPackages || hasProductPublish
            ? require('../assets/box.png')
            : null,
        style: [
          hasProductStyle
            ? {
                label: Productstyle.menuName,
                route: 'ProductsStyles',
                src: require('../assets/package.png'),
              }
            : null,
          hasPackages
            ? {
                label: Packages.menuName,
                route: 'Packages',
                src: require('../assets/package.png'),
              }
            : null,
          hasProductPublish
            ? {
                label: productpublish.menuName,
                route: 'ProductPackagePublish',
                src: require('../assets/package.png'),
              }
            : null,
        ].filter(Boolean),
      },
      ordersAndReturns: {
        label: hasOrders ? 'Orders' : null,
        icon: hasOrders ? require('../assets/orderr.png') : null,
        style: [
          orders
            ? {
                label: orders.menuName,
                route: 'Order',
                src: require('../assets/orderr.png'),
              }
            : null,
          packingorders
            ? {
                label: packingorders.menuName,
                route: 'Packing orders',
                src: require('../assets/packing.png'),
              }
            : null,
            PickList
            ? {
                label: PickList.menuName,
                route: 'PickList',
                src: require('../assets/material-management.png'),
              }
            : null,
        ].filter(Boolean),
      },
      inventory: {
        label:
          hasProductInventory ||
          hasLocationwiseInventory ||
          hasDistributorwiseInventory
            ? 'Inventory'
            : null,
        icon:
          hasProductInventory ||
          hasLocationwiseInventory ||
          hasDistributorwiseInventory
            ? require('../assets/inventory.png')
            : null,
        style: [
          hasProductInventory
            ? {
                label: ProductInventory.menuName,
                route: 'ProductInventory',
                src: require('../assets/product-management.png'),
              }
            : null,
          hasLocationwiseInventory
            ? {
                label: locationwiseinventory.menuName,
                route: 'LocationInventory',
                src: require('../assets/locationinv.png'),
              }
            : null,
          hasDistributorwiseInventory
            ? {
                label: distributorwiseinventory.menuName,
                route: 'DistributorInventory',
                src: require('../assets/disinventory.png'),
              }
            : null,
        ].filter(Boolean),
      },
      campaignManagement: {
        label: hasActivities ? 'Campaign Management' : null,
        icon: hasActivities ? require('../assets/activity.png') : null,
        style: [
          hasActivities
            ? {
                label: Activities.menuName,
                route: 'Activities',
                src: require('../assets/acticityone.png'),
              }
            : null,
        ].filter(Boolean),
      },
      styles: {
        label: hasCosting ? 'Styles' : null,
        icon: hasCosting ? require('../assets/style.png') : null,
        style: [
          hasCosting
            ? {
                label: costing.menuName,
                route: 'Costing',
                src: require('../assets/dollar.png'),
              }
            : null,
        ].filter(Boolean),
      },
      masters: {
        label: hasLocation ? 'Master' : null,
        icon: hasLocation ? require('../assets/shopping.png') : null,
        style: [
          hasLocation
            ? {
                label: Location.menuName,
                route: 'MasterLocartion',
                src: require('../assets/location-pin.png'),
              }
            : null,
        ].filter(Boolean),
      },
    };
  }, [
    Productstyle,
    Packages,
    productpublish,
    orders,
    packingorders,
    ProductInventory,
    locationwiseinventory,
    distributorwiseinventory,
    Activities,
    costing,
    Location
  ]);

  const renderDropdown = (key, menu) => {
    const isSelected = selectedDropdown === key;
    const hasTempBackgroundEffect = tempBackgroundEffect[key];
    const animationValue = useRef(new Animated.Value(0)).current;

    const handleDropdownPress = () => {
      setSelectedDropdown(isSelected ? null : key);
      toggleDropdown(key);

      // Trigger background color effect for this dropdown
      setTempBackgroundEffect({[key]: true});
      setTimeout(() => setTempBackgroundEffect({[key]: false}), 2000);

      // console.log("slected dropdown ====> ", menu.style[0].label==="Location Wise Style Inventory");
      // Animate dropdown height
      Animated.timing(animationValue, {
        toValue: isSelected
          ? 0
          : menu.style[0]?.label === 'Location Wise Style Inventory'
          ? menu.style.length * 80
          : menu.style.length * 60,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    return (
      <View>
        {/* Parent Dropdown */}
        {(menu.label || menu.icon) && (
          <TouchableOpacity
            style={[
              styles.dropdownHeader,
              isSelected && styles.selectedDropdownHeader,
              hasTempBackgroundEffect && styles.tempBackgroundEffect,
              !menu.label && {display: 'none'}, // Hide the dropdown if there's no label
            ]}
            onPress={handleDropdownPress}>
            <View style={styles.dropdownTitle}>
              <View style={styles.navIconContainer}>
                {menu.icon && (
                  <Image
                    style={[styles.navIcon, isSelected && styles.selectedIcon]}
                    source={menu.icon}
                  />
                )}
              </View>
              {menu.label && (
                <Text
                  style={[styles.navText, isSelected && styles.selectedText]}>
                  {menu.label}
                </Text>
              )}
            </View>
            {menu.label && (
              <View style={{marginLeft: -10}}>
                <Image
                  style={styles.dropdownIcon}
                  source={
                    openDropdown === key
                      ? require('../assets/down-arrow.png')
                      : require('../assets/chevron.png')
                  }
                />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Child Items */}
        {openDropdown === key && (
          <Animated.View
            style={[
              styles.animatedDropdownContent,
              {height: animationValue},
              styles.dropdownContent,
            ]}>
            {menu.style.map((item, index) => (
              <TouchableOpacity
                key={`${index}-${item?.route}`}
                style={styles.dropdownItem}
                onPress={() => navigation.navigate(item.route)}>
                <View style={styles.navIconContainer}>
                  <Image style={styles?.navIcon} source={item?.src} />
                </View>
                <Text style={styles.navText}>{item?.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>
    );
  };

  const NavItem = ({title, icon, onPress}) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <View style={styles.navIconContainer}>
        <Image style={styles.navIcon} source={icon} />
      </View>
      <Text style={styles.navText}>{title}</Text>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image style={[styles.img, {borderRadius: 30}]} source={image} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Profile</Text>
              {userData && (
                <Text style={styles.usertxt}>
                  {userData.token.firstName} {userData.token.lastName}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.companyInfo}>
          <FastImage
            source={
              companyLogo
                ? {uri: `data:image/png;base64,${companyLogo}`}
                : require('../assets/NewNoImage.jpg')
            }
            resizeMode='contain'
            style={{height: 30, width: 100}}
          />
            <Text style={styles.headerSubtitle}>{companyName} ({companyCode})</Text>
          </View>
        </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {hasDropdownhome && (
          <View style={styles.navContainer}>
            <NavItem
              title={home?.menuName}
              icon={require('../assets/store.png')}
              onPress={goToHome}
            />
          </View>
        )}
        {hasDropdowncategories && (
          <View style={styles.navContainer}>
            <NavItem
              title={Categories?.menuName}
              icon={require('../assets/menu-1.png')}
              onPress={goToCategories}
            />
          </View>
        )}
        {Object.entries(dropdownMenus).map(([key, menu], index) => (
          <View key={index}>{renderDropdown(key, menu)}</View>
        ))}
        {hasDropdowndistributorgrn && (
          <View style={styles.navContainer}>
            <NavItem
              title={distributorgrn?.menuName}
              icon={require('../assets/distributor.png')}
              onPress={goToDistributorGrn}
            />
          </View>
        )}   
        {hasDropdownLocationTask && (
          <View style={styles.navContainer}>
            <NavItem
              title={LocationTask?.menuName}
              icon={require('../assets/location-pin.png')}
              onPress={goToCustomerLocation}
            />
          </View>
        )}
        {hasDropdownattendance && (
          <View style={styles.navContainer}>
            <NavItem
              title={attendance?.menuName}
              icon={require('../assets/attendence.png')}
              onPress={goToAttendence}
            />
          </View>
        )}
      </ScrollView>
      <TouchableOpacity onPress={goToSettingsScreen} style={styles.logoutbox}>
        <Image
          resizeMode="contain"
          style={[styles.logoutimg, {tintColor: '#fff', height: 20, width: 20}]}
          source={require('../assets/settings.png')}
        />
        <Text style={styles.logouttxt}>Settings</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainerProfile}>
          <View style={styles.modalContentProfile}>
            <TouchableOpacity
              style={styles.modalButtonProfile}
              onPress={takePhotoFromCamera}>
              <Text style={styles.modalButtonTextProfile}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonProfile}
              onPress={choosePhotoFromLibrary}>
              <Text style={styles.modalButtonTextProfile}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButtonProfile}
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
        <View style={styles.modalContainerProfile}>
          <View style={styles.modalContentProfile}>
            <Text style={styles.modalTitleProfile}>Are you sure?</Text>
            <Text style={styles.modalMessageProfile}>
              User information will be deleted.
            </Text>
            <View style={styles.modalButtonContainerProfile}>
              <TouchableOpacity
                style={styles.modalButtonProfilecancel}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalButtonProfileCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton1Profile,
                  styles.modalDeleteButtonProfile,
                ]}
                onPress={() => {
                  getUserInActive();
                  setDeleteModalVisible(false);
                }}>
                <Text style={styles.modalButtonTextProfile}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = colors =>
  StyleSheet.create({
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
    usertxt: {
      fontSize: 20,
      color: '#fff',
      marginBottom:5,
      marginTop:3
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
      backgroundColor: colors.color2,
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
    modalContainerProfile: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContentProfile: {
      backgroundColor: '#fff',
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalButtonProfile: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      borderRadius: 10,
    },
    modalButtonProfilecancel: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      borderRadius: 10,
      backgroundColor: 'gray',
    },
    modalButtonProfileCancel: {
      paddingHorizontal: 35,
      marginRight: 40,
    },
    modalCancelButtonProfile: {
      paddingVertical: 15,
      alignItems: 'center',
      backgroundColor: colors.color2,
      borderRadius: 10,
      marginTop: 10,
    },
    modalTitleProfile: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#000',
    },
    modalMessageProfile: {
      fontSize: 16,
      marginBottom: 20,
      color: '#000',
    },
    modalButtonContainerProfile: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      color: '#000',
      marginHorizontal: 10,
    },
    modalButton1Profile: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    modalButtonTextProfile: {
      color: '#000',
    },

    modalDeleteButtonProfile: {
      backgroundColor: 'red',
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
      paddingVertical: 3,
      marginLeft: 25,
    },

    profileImage: {width: 50, height: 50, marginRight: 15, borderRadius: 25},
    userName: {fontSize: 18, fontWeight: 'bold', color: '#fff'},
    navContainer: {marginTop: 3, paddingHorizontal: 15},
    dropdownTitle: {flexDirection: 'row', alignItems: 'center'},
    navIconContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#e9ecef',
      borderRadius: 20,
      marginRight: 15,
    },
    headerContainer: {
      backgroundColor: colors.color2,
      paddingVertical: 5,
      paddingHorizontal: 15,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      margin: 15,
      // borderRadius:5,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 7,
    },
    img: {
      height: 50,
      width: 50,
      borderRadius: 25,
      marginRight: 15,
      backgroundColor: '#ffffff50',
      borderWidth: 1,
      borderColor: '#fff',
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '600',
    },
    headerSubtitle: {
      color: '#fff',
      fontSize: 14,
      marginTop: 2,
      fontWeight: '600',
    },
    companyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 5,
      paddingBottom: 2,
      borderTopWidth: 1,
      justifyContent: 'center',
      borderTopColor: '#ffffff50',
      marginTop: 2,
      paddingHorizontal: 15,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      borderRadius: 5,
      marginVertical: 5,
      borderBottomWidth: 1,
      borderColor: '#EAEAEA',
    },
    navIcon: {width: 20, height: 20, tintColor: colors.color2},
    dropdownIcon: {
      width: 15,
      height: 15,
    },
    navText: {
      fontSize: 16,
      color: '#333',
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
      textAlign: 'left',
    },
    bottomSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 'auto',
      padding: 20,
    },
    logoutButton: {alignItems: 'center'},
    logoutIcon: {width: 30, height: 30, tintColor: colors.color2},
    logoutText: {color: '#333', marginTop: 5, fontSize: 14},
    deleteButton: {alignItems: 'center'},
    deleteIcon: {width: 30, height: 30, tintColor: colors.color2},
    deleteText: {color: '#f00', marginTop: 5, fontSize: 14},
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: 300,
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalText: {fontSize: 16, marginBottom: 20, textAlign: 'center'},
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      borderRadius: 5,
      backgroundColor: '#4CAF50',
      margin: 5,
    },
    cancelButton: {backgroundColor: '#d9534f'},
    modalButtonText: {color: '#fff', fontSize: 14, fontWeight: 'bold'},

    dropdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 5,
      paddingHorizontal: 15,
      // backgroundColor: '#f7f7f7',
      borderRadius: 5,
      marginVertical: 5,
      borderBottomWidth: 1,
      borderColor: '#EAEAEA',
    },
    selectedDropdownHeader: {
      borderLeftWidth: 5,
      borderColor: colors.color2,
      elevation: 5,
      backgroundColor: '#fff',
    },
    tempBackgroundEffect: {
      backgroundColor: '#f7f7f7',
    },
    selectedIcon: {
      tintColor: colors.color2,
    },

    selectedText: {
      color: colors.color2,
    },
    animatedDropdownContent: {
      overflow: 'hidden', // Ensures content is clipped during animation
      backgroundColor: '#fff', // Optional: Subtle background color
      borderRadius: 5, // Optional: Rounded edges for dropdown
      marginTop: 5,
    },
  });

export default Sidebar;
