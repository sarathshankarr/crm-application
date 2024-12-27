import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  FlatList,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ColorContext} from '../components/colortheme/colorTheme';
import {API} from '../config/apiConfig';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {CLEAR_CART} from '../redux/ActionTypes';

const colorsList = [
  {
    label: 'Jungle Green',
    Colors: {
      color2: '#26A69A',
      lightcolor: '#9DE4DC',
      color3: '#DDD',
      color4: '#007167', // dark green
      color5: '#DDD',
      color6: '#DDD',
    },
  },
  {
    label: 'Cerulean Blue',
    Colors: {
      color2: '#1F74BA',
      lightcolor: '#9DE4DC',
      color3: '#DDD',
      color4: '#195c95', // Dark
      color5: '#DDD',
      color6: '#DDD',
    },
  },
  {
    label: 'Royal Blue',
    Colors: {
      color2: '#246EE9',
      lightcolor: '#9DE4DC',
      color3: '#DDD',
      color4: '#246EE9', // Dark
      color5: '#DDD',
      color6: '#DDD',
    },
  },
  {
    label: 'Scarlet Red',
    Colors: {
      color2: '#FF2400',
      lightcolor: '#9DE4DC',
      color3: '#DDD',
      color4: '#FF2400', // Dark
      color5: '#DDD',
      color6: '#DDD',
    },
  },
  {
    label: 'Mint green ',
    Colors: {
      color2: '#3EB489',
      lightcolor: '#9DE4DC',
      color3: '#DDD',
      color4: '#2E8968', // Dark
      color5: '#DDD',
      color6: '#DDD',
    },
  },
  {
    label: 'Bright Cyan ',
    Colors: {
      color2: '#009CDE',
      lightcolor: '#9DE4DC',
      color3: '#DDD',
      color4: '#1F74BA', // Dark
      color5: '#DDD',
      color6: '#DDD',
    },
  },
];

const SettingsScreen = ({navigation, route}) => {
  const [userName, setUserName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompanyList, setshowCompanyList] = useState(false);
  const [showColorList, setshowColorList] = useState(false);
  const [companyList, setcompanyList] = useState({});
  const [selectedCompanyName, setselectedCompanyName] = useState('');
  const [selectedCompanyId, setselectedCompanyId] = useState(0);
  const [query, setquery] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [roleMenus, setRoleMenus] = useState([]);
  const [roleMenusLoaded, setRoleMenusLoaded] = useState(false);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [userData, setUserData] = useState(null);
  const {colors, updateColor, updateAllColors} = useContext(ColorContext);

  const styles = getStyles(colors);
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

  const SettingItem = ({title, icon, onPress}) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Image source={icon} style={styles.settingIcon} />
      </View>
      <Text style={styles.settingText}>{title}</Text>
    </TouchableOpacity>
  );

  const filteredColorList = colorsList.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );
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
  const dispatch = useDispatch();
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

      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error clearing user data:', error);
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
  const handleGoBack = () => {
    navigation.goBack();
  };
  const handleSelectColor = async item => {
    console.log('selected color :', item.Colors);
    updateAllColors(item.Colors);
    setshowColorList(false);
    await AsyncStorage.setItem('ThemeColor', JSON.stringify(item));
  };


  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            style={styles.backButtonImage}
            source={require('../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <View style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={require('../../assets/profile.png')}
            style={styles.profileImage}
          />
          <View>
            {userData && (
              <Text style={styles.usertxt}>
                {userData.token.firstName} {userData.token.lastName}
              </Text>
            )}
            <Text style={styles.profileSubtext}>View Profile</Text>
          </View>
        </View>

        {/* Settings List */}
        <ScrollView style={styles.settingsContainer}>
          {selectedCompanyId ? (
            <SettingItem
              title={
                selectedCompanyName
                  ? selectedCompanyName
                  : 'No Company Selected'
              }
              icon={require('../../assets/close.png')}
              onPress={() => console.log('Current company')}
            />
          ) : null}
          {selectedCompanyId ? (
            <SettingItem
              title="Change Company"
              icon={require('../../assets/close.png')}
              onPress={() => setshowCompanyList(!showCompanyList)}
            />
          ) : null}
          {/* <SettingItem
          title="Change Password"
          icon={require('./../../../assets/images/png/key.png')}
          onPress={() => console.log('ChangePassword')}
        /> */}
          <SettingItem
            title="Notifications"
            icon={require('../../assets/bell.png')}
            onPress={() => navigation.navigate('Notifications')}
          />
          <SettingItem
            title="Appearance"
            icon={require('../../assets/color-palette.png')}
            // onPress={() => console.log('AppearanceSettings')}
            onPress={() => setshowColorList(!showColorList)}
          />
          <SettingItem
            title="Logout"
            icon={require('../../assets/logOut.png')}
            onPress={handleLogout}
          />
          <SettingItem
            title="Delete Account"
            icon={require('../../assets/bin.png')}
            onPress={() => setModalVisible(true)}
          />
        </ScrollView>

        {/* Delete Modal */}
        <Modal animationType="fade" transparent visible={modalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Are you sure you want to delete your account?
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => {
                    getUserInActive();
                    setDeleteModalVisible(false);
                  }}
                  style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showColorList}
          onRequestClose={() => setshowColorList(false)}>
          <TouchableWithoutFeedback onPress={() => setshowColorList(false)}>
            <View style={styles.companyModalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.colorModalContainer}>
            {/* Heading */}
            <View style={styles.companyModalHeader}>
              <View />
              <Text style={styles.companyModalHeaderText}>Colours List</Text>
              <TouchableOpacity
                onPress={() => {
                  setshowColorList(false);
                  setquery('');
                }}>
                <Image
                  source={require('../../assets/close.png')}
                  style={{width: 30, height: 30}}
                />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.companyModalSearchBarContainer}>
              <TextInput
                style={styles.companyModalSearchBar}
                placeholder="Search Colour."
                placeholderTextColor="#aaa"
                onChangeText={text => setquery(text)}
              />
            </View>

            {/* Color List */}
            <View style={styles.companyModalListContainer}>
              {filteredColorList.length === 0 ? (
                <Text style={styles.companyModalNoResultsText}>
                  No results found
                </Text>
              ) : (
                <FlatList
                  data={filteredColorList}
                  keyExtractor={item => item.label.toString()}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.companyModalDropdownItem}
                      onPress={() => handleSelectColor(item)}
                      key={item.label}>
                      <View style={styles.companyModalItemContent}>
                        <View style={[styles.colorModalCircle, {backgroundColor: item.Colors.color2}]}>
                          <Text style={styles.companyModalCircleText}>
                            {item.label.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.companyModalDropdownItemText}>
                          {item.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.companyModalSeparator} />
                  )}
                  contentContainerStyle={styles.companyModalFlatListContent}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// Reusable Setting Item Component

const getStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    header: {
      flexDirection: 'row',
      marginHorizontal: 10,
      marginVertical: 10,
    },
    backButton: {
      height: 25,
      width: 25,
    },
    backButtonImage: {
      height: 25,
      width: 25,
    },
    headerText: {
      marginLeft: 10,
      fontSize: 19,
      fontWeight: 'bold',
      color: '#000',
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.color2,
      padding: 20,
      borderRadius: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 4,
      elevation: 3,
    },
    profileImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
    },
    usertxt:{
color:"#fff",
fontSize:20
    },
    profileName: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '600',
    },
    profileSubtext: {
      color: '#fff',
      fontSize: 14,
    },
    settingsContainer: {
      marginTop: 10,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 4,
      elevation: 2,
    },
    settingIconContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#e9ecef',
      borderRadius: 20,
      marginRight: 15,
    },
    settingIcon: {
      width: 20,
      height: 20,
      tintColor: colors.color2,
    },
    settingText: {
      fontSize: 16,
      color: '#495057',
      fontWeight: '500',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 15,
    },
    modalContent: {
      width: '85%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: {width: 0, height: 4},
      shadowRadius: 10,
      elevation: 5,
    },
    modalText: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
      color: '#212529',
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: '#4CAF50',
      margin: 5,
    },
    cancelButton: {
      backgroundColor: '#d9534f',
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },

    companyModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    companyModalContainer: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 10,
      height: '70%',
      // overflow: 'hidden',
      paddingVertical: 8,
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    colorModalContainer: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 10,
      height: '60%',
      // overflow: 'hidden',
      paddingVertical: 8,
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    companyModalHeader: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    companyModalHeaderText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    companyModalSearchBarContainer: {
      marginVertical: 12,
    },
    companyModalSearchBar: {
      height: 40,
      backgroundColor: '#f2f2f2',
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: '#333',
      borderWidth: 1,
      borderColor: '#ddd',
    },
    companyModalListContainer: {
      flex: 1,
      marginTop: 8,
    },
    companyModalFlatListContent: {
      paddingVertical: 4,
    },
    companyModalNoResultsText: {
      color: '#000',
      fontWeight:"bold",
      textAlign: 'center',
      padding: 10,
      fontSize: 16,
    },
    companyModalDropdownItem: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 4,
      marginBottom: 4,
    },
    companyModalItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    companyModalCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.color2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 20,
    },
    colorModalCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 20,
    },
    companyModalCircleText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    companyModalDropdownItemText: {
      fontSize: 16,
      color: '#333',
    },
    companyModalSeparator: {
      height: 1,
      backgroundColor: '#ddd',
      marginVertical: 4,
    },
  });

export default SettingsScreen;
