// import React, { useState } from 'react';
// import {
//   View,
//   TouchableOpacity,
//   Image,
//   Text,
//   StyleSheet,
// } from 'react-native';
// import { useSelector } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';

// const CommenHeaderHomeScreen = ({
//   title,
//   showDrawerButton,
//   showMessageIcon,
//   showLocationIcon,
//   showCartIcon,
// }) => {
//   const navigation = useNavigation();
//   const cartItems = useSelector(state => state.cartItems);

//   const goToCart = () => {
//     navigation.navigate('Cart');
//   };

//   const cartItemCount = cartItems.length;

//   return (
//     <View style={styles.header}>
//       {showDrawerButton && (
//         <TouchableOpacity onPress={() => navigation.openDrawer()}>
//           <Image
//             resizeMode="contain"
//             source={require('../../assets/menu.png')}
//             style={styles.menuimg}
//           />
//         </TouchableOpacity>
//       )}
//       <View style={styles.rightContainer}>
//         {showLocationIcon && (
//           <TouchableOpacity style={styles.iconWrapper}>
//             <Image
//               resizeMode="contain"
//               style={styles.locationimg}
//               source={require('../../assets/location-pin.png')}
//             />
//           </TouchableOpacity>
//         )}
//         {showMessageIcon && (
//           <TouchableOpacity style={styles.iconWrapper}>
//             <Image
//               style={styles.msgimg}
//               source={require('../../assets/bell.png')}
//             />
//           </TouchableOpacity>
//         )}
//         {showCartIcon && (
//           <TouchableOpacity style={styles.iconWrapper} onPress={goToCart}>
//             <View style={styles.cartContainer}>
//               <Image
//                 resizeMode="contain"
//                 style={styles.cartimg}
//                 source={require('../../assets/grocery-store.png')}
//               />
//               {cartItemCount > 0 && (
//                 <Text style={styles.cartItemCount}>{cartItemCount}</Text>
//               )}
//             </View>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     backgroundColor: '#fff',
//   },
//   rightContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 5,
//   },
//   iconWrapper: {
//     marginHorizontal: 5,
//   },
//   locationimg: {
//     height: 22,
//     width: 22,
//     // tintColor:'#1F74BA'
//   },
//   msgimg: {
//     height: 22,
//     width: 22,
//     // tintColor:'#1F74BA'
//   },
//   cartContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   cartimg: {
//     height: 25,
//     width: 25,
//     // tintColor:'#1F74BA'
//   },
//   cartItemCount: {
//     position: 'absolute',
//     bottom: 14,
//     left: 19,
//     backgroundColor: '#E12948',
//     color: 'white',
//     borderRadius: 10,
//     paddingHorizontal: 5,
//     fontSize: 12,
//   },
//   menuimg: {
//     height: 30,
//     width: 30,
//     marginHorizontal: 5,
//     // tintColor:'#1F74BA',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000000'
//   },
// });

// export default CommenHeaderHomeScreen;

import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Text,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import NotificationModal from './NotificationModal';
import {API} from '../config/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setLoggedInUser} from '../redux/actions/Actions';
import FastImage from 'react-native-fast-image';
import {SET_SELECTED_COMPANY} from '../redux/ActionTypes';

const {width} = Dimensions.get('window');

const CommenHeaderHomeScreen = ({
  title,
  showDrawerButton,
  showMessageIcon,
  showLocationIcon,
  showCartIcon,
}) => {
  const navigation = useNavigation();
  const cartItems = useSelector(state => state.cartItems);
  const [isModalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // State for unread count

  const userId = useSelector(state => state?.loggedInUser?.userId);
  const roleId = useSelector(state => state?.loggedInUser?.roleId);
  const companyId = useSelector(state => state?.selectedCompany?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const dispatch = useDispatch();
  const loggedInUser = useSelector(state => state.loggedInUser);
  const selectedCompany = useSelector(state => state.selectedCompany);

  // Fetch notifications whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId && roleId && companyId) {
        // Ensure these variables are available
        getNotificationsList();
      }
      return () => {
        // Cleanup if needed when screen loses focus
      };
    }, [userId, roleId, companyId]), // Ensure dependencies are properly set
  );

  // Fetch notifications from API
  const getNotificationsList = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_NOTIFICATION_LIST}/${userId}/${roleId}/${companyId}/1`;
    console.log('Fetching notifications from: ', apiUrl); // Debugging

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        // console.log("Fetched notifications:", response.data);
        setNotifications(response.data || []);

        const unreadNotifications = response.data.filter(
          notification => notification.m_read === 0,
        );
        setUnreadCount(unreadNotifications.length); // Update unread count
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
      });
  };

  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter(
      notification => notification.m_read === 0,
    );

    unreadNotifications.forEach(notification => {
      updateRead(notification.id); // Mark each notification as read
    });

    // After marking them all as read, update the state
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      m_read: 1, // Mark all as read
    }));

    setNotifications(updatedNotifications); // Update local state
    setUnreadCount(0); // Clear the unread count
  };
  const updateRead = latestId => {
    const flag = 1;
    const apiUrl = `${global?.userData?.productURL}${API.UPDATE_READ_MSG}/${latestId}/${userId}/${roleId}/${companyId}/${flag}`;

    setIsLoading(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('INSIDE updateRead  ===> ', response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const toggleModal = () => {
    if (!isModalVisible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  };

  const goToCart = () => {
    navigation.navigate('Cart');
  };
  const goToLocation = () => {
    navigation.navigate('CustomerLocation');
  };

  const cartItemCount = cartItems.length;

  const notification = [
    {id: 1, icon: '🔔', message: 'Notification 1'},
    {id: 2, icon: '🔔', message: 'Notification 2'},
    {id: 3, icon: '🔔', message: 'Notification 3'},
    {id: 4, icon: '🔔', message: 'Notification 4'},
    {id: 5, icon: '🔔', message: 'Notification 5'},
    {id: 6, icon: '🔔', message: 'Notification 6'},
  ];
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          dispatch(setLoggedInUser(userData));

          // Check if compList exists and is not empty
          if (userData?.compList?.length > 0) {
            // Optionally set a default logo or leave it blank initially
            setCompanyLogo(null);
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

  const toggleDropdown = () => {
    if (loggedInUser?.compList?.length > 1) {
      setDropdownVisible(!dropdownVisible);
    }
  };

  const handleCompanySelect = company => {
    console.log('Selected Company:', company); // Debugging
    setCompanyLogo(company.companyLogo);
    dispatch({type: SET_SELECTED_COMPANY, payload: company});
    setDropdownVisible(false);
    navigation.navigate('Home', {companyId: company.id});
  };
  if (userData?.compList?.length > 0) {
    const initialCompany = userData.compList[0];
    setCompanyLogo(initialCompany.companyLogo);
    dispatch({type: SET_SELECTED_COMPANY, payload: initialCompany});
  }
  return (
    <SafeAreaView style={styles.header}>
      {showDrawerButton ? (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/menu.png')}
            style={styles.menuimg}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/back_arrow.png')}
            style={styles.menuimg}
          />
        </TouchableOpacity>
      )}
      <View style={{backgroundColor: '#fff'}}>
        <TouchableOpacity
          onPress={toggleDropdown}
          style={styles.dropdownButton}>
         <View style={{ alignItems: 'center', flexWrap: 'wrap', maxWidth: 150 }}>
  <FastImage
    source={
      companyLogo
        ? { uri: `data:image/png;base64,${companyLogo}` }
        : require('../../assets/NewNoImage.jpg')
    }
    resizeMode="contain"
    style={{ height: 35, width: 80 }}
  />
  
</View>
<Text style={[styles.text, { flexShrink: 1 }]}>
    {selectedCompany?.companyName.length > 10
      ? `${selectedCompany?.companyName.slice(0, 10)}...`
      : selectedCompany?.companyName}
    ({selectedCompany?.companyCode.slice(0, 5)}...)
  </Text>
          {loggedInUser?.compList?.length > 1 && (
            <Image
              source={require('../../assets/dropdown.png')}
              style={styles.icon}
            />
          )}
        </TouchableOpacity>
        <Modal
          transparent
          visible={dropdownVisible}
          onRequestClose={() => setDropdownVisible(false)}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setDropdownVisible(false)}>
            <View style={styles.modalContent}>
              <FlatList
                data={loggedInUser?.compList}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => handleCompanySelect(item)}
                    style={styles.companyItem}>
                    <Text style={styles.companyName}>{item.companyName}</Text>
                    <Text style={styles.companyCode}>({item.companyCode})</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
      <View style={styles.rightContainer}>
        {showLocationIcon && (
          <TouchableOpacity style={styles.iconWrapper} onPress={goToLocation}>
            <Image
              resizeMode="contain"
              style={styles.locationimg}
              source={require('../../assets/location-pin.png')}
            />
          </TouchableOpacity>
        )}
        {showMessageIcon && (
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => {
              markAllAsRead(); // Call the function to mark all notifications as read
              navigation.navigate('Notifications'); // Navigate to the Notifications screen
            }}>
            <View style={styles.notificationIconWrapper}>
              <Image
                style={styles.msgimg}
                source={require('../../assets/bell.png')}
              />
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCountText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        {showCartIcon && (
          <TouchableOpacity style={styles.iconWrapper} onPress={goToCart}>
            <View style={styles.cartContainer}>
              <Image
                resizeMode="contain"
                style={styles.cartimg}
                source={require('../../assets/grocery-store.png')}
              />
              {cartItemCount > 0 && (
                <Text style={styles.cartItemCount}>{cartItemCount}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      <NotificationModal
        isModalVisible={isModalVisible}
        toggleModal={toggleModal}
        slideAnim={slideAnim}
        notifications={notification}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  iconWrapper: {
    marginRight: 10,
  },
  locationimg: {
    height: 22,
    width: 22,
  },
  msgimg: {
    height: 22,
    width: 22,
  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cartimg: {
    height: 25,
    width: 25,
  },
  cartItemCount: {
    position: 'absolute',
    bottom: 14,
    left: 19,
    backgroundColor: '#E12948',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 3,
    fontSize: 12,
  },
  menuimg: {
    height: 30,
    width: 30,
    marginHorizontal: 5,
  },
  notificationIconWrapper: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 1,
    minWidth: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdownButton: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logo: {
    height: 35,
    width: 50,
    marginHorizontal: 5,
  },
  text: {
    fontWeight: '600',
    color: '#000',
  },
  icon: {
    height: 10,
    width: 15,
    marginHorizontal: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    marginTop: Platform.OS === 'ios' ? 105 : 50,
    position: 'absolute',
    maxHeight: 130,
    marginHorizontal: 20,
  },
  companyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: '#8e8e8e',
    flexWrap: 'wrap', // Allow content to wrap
  },

  companyName: {
    fontWeight: '600',
    color: '#000',
    flex: 1, // Allow the company name to take available space
    flexWrap: 'wrap', // Ensure the text wraps within the available space
    marginRight: 10, // Add some spacing between the name and the code
  },

  companyCode: {
    marginLeft: 10,
    color: '#000',
  },
});

export default CommenHeaderHomeScreen;
