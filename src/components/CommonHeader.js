import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import NotificationModal from './NotificationModal';
import axios from 'axios'; // Ensure axios is imported correctly
import { API } from '../config/apiConfig';

const { width } = Dimensions.get('window');

const CommonHeader = ({
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

  //Fetch notifications whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId && roleId && companyId) { // Ensure these variables are available
        getNotificationsList();
      }
      return () => {
        // Cleanup if needed when screen loses focus
      };
    }, [userId, roleId, companyId]) // Ensure dependencies are properly set
  );

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     getNotificationsList(); 
  //   }, 300000); 
  
  //   return () => clearInterval(interval); 
  // }, []);

  // Fetch notifications from API
  const getNotificationsList = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_NOTIFICATION_LIST}/${userId}/${roleId}/${companyId}/1`;
    console.log("Fetching notifications from: ", apiUrl); // Debugging

    axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${global?.userData?.token?.access_token}`,
      },
    })
    .then(response => {
      // console.log("Fetched notifications:", response.data);
      setNotifications(response.data || []);

      const unreadNotifications = response.data.filter(notification => notification.m_read === 0);
      setUnreadCount(unreadNotifications.length); // Update unread count
    })
    .catch(error => {
      console.error('Error fetching notifications:', error);
    });
  };
  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter(notification => notification.m_read === 0);
  
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
      Animated?.timing(slideAnim, {
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

  const truncateTitle = (title, wordLimit = 3) => {
    const words = title.trim().replace(/\s+/g, ' ').split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return title.trim();
  };

  return (
    <View style={styles.header}>
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
      <Text style={styles.title}>{truncateTitle(title)}</Text>
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
           }}
         >
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
        notifications={notifications} // Make sure you pass fetched notifications here
      />
    </View>
  );
};
// #1F74BA

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
    elevation: 5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'left',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    marginHorizontal: 5,
  },
  locationimg: {
    height: 20,
    width: 20,
  },
  msgimg: {
    height: 20,
    width: 20,

  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cartimg: {
    height: 23,
    width: 23,
  },
  cartItemCount: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: '#E12948',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 5,
    fontSize: 12,
  },
  menuimg: {
    height: 30,
    width: 30,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#000"

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
  }
});

export default CommonHeader;







