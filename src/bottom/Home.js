// import React, {useState, useEffect, useContext} from 'react';
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   FlatList,
//   Modal,
// } from 'react-native';
// import {useNavigation} from '@react-navigation/native';
// import {useSelector, useDispatch} from 'react-redux';
// import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
// import HomeCategories from '../Pages/catogiries/HomeCategories';
// import HomeAllProducts from '../Pages/catogiries/HomeAllProducts';
// import {setLoggedInUser} from '../redux/actions/Actions';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {SET_SELECTED_COMPANY} from '../redux/ActionTypes';
// import CommenHeaderHomeScreen from '../components/CommenHeaderHomeScreen';
// import {API} from '../config/apiConfig';
// import axios from 'axios';
// import NewCategoryUi from '../Pages/newCategoriesUi/NewCategoryUi';
// import FastImage from 'react-native-fast-image';
// import { ColorContext } from '../components/colortheme/colorTheme';

// const Tab = createMaterialTopTabNavigator();

// const CustomTabBar = ({state, descriptors, route}) => {
//   const navigation = useNavigation();
//   const { colors } = useContext(ColorContext);
//   const styles = getStyles(colors);
//   const [dropdownVisible, setDropdownVisible] = useState(false);
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [companyLogo, setCompanyLogo] = useState(null);
//   const loggedInUser = useSelector(state => state.loggedInUser);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const storedUserData = await AsyncStorage.getItem('userData');
//         if (storedUserData) {
//           const userData = JSON.parse(storedUserData);
//           dispatch(setLoggedInUser(userData));
//           if (userData && userData.compList && userData.compList.length > 0) {
//             const initialCompany = userData.compList[0];
//             setSelectedCompany(initialCompany);
//             setCompanyLogo(initialCompany.companyLogo);
//             dispatch({type: SET_SELECTED_COMPANY, payload: initialCompany});
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };

//     fetchUserData();
//   }, [dispatch]);

//   const onPress = routeName => {
//     navigation.navigate(routeName);
//   };

//   const handleCompanySelect = company => {
//     setSelectedCompany({...company}); // Create a new object reference
//     setCompanyLogo(company.companyLogo); // Set the company logo
//     setDropdownVisible(false);
//     dispatch({type: SET_SELECTED_COMPANY, payload: company});
//   };

//   const toggleDropdown = () => {
//     if (
//       loggedInUser &&
//       loggedInUser.compList &&
//       loggedInUser.compList.length > 1
//     ) {
//       setDropdownVisible(!dropdownVisible);
//     }
//   };

//   const companyName = selectedCompany ? selectedCompany.companyName : '';
//   const companyCode = selectedCompany ? selectedCompany.companyCode : '';
//   const companysLogo = selectedCompany ? selectedCompany.companyLogo : '';

//   useEffect(() => {
//     if (selectedCompany && selectedCompany.id) {
//       getCompany(selectedCompany.id);
//     }
//   }, [selectedCompany]);



//   const getCompany = companyId => {
//     const apiUrl = `${global?.userData?.productURL}${API.GET_COMPANY}/${companyId}`;
//     axios
//       .get(apiUrl, {
//         headers: {
//           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
//         },
//       })
//       .then(response => {
//         const companyList = response.data.response.companyList;
//         // console.log("getCompany",response.data.response.companyList)
//         if (companyList && companyList.length > 0) {
//           const company = companyList[0];
//           setCompanyLogo(company.companyLogo);
//         } else {
//           console.log('No company data found');
//         }
//       })
//       .catch(error => {
//         console.error('Error:', error);
//         setCompanyLogo(null);
//       });
//   };

//   return (
//     <View style={{backgroundColor: '#fff', zIndex: 1}}>
//       {/* <View style={[styles.container, {zIndex: 100}]}>
//         <TouchableOpacity onPress={() => navigation.openDrawer()}>
//           <Image
//             resizeMode="contain"
//             source={require('../../assets/menu.png')}
//             style={{height: 30, width: 30, marginHorizontal: 5}}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={toggleDropdown}
//           style={{
//             flex: 1,
//             width: '50%',
//             borderRadius: 10,
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             marginLeft: 5,
//           }}>
//           <FastImage
//             source={
//               companyLogo
//                 ? {uri: `data:image/png;base64,${companyLogo}`}
//                 : require('../../assets/NewNoImage.jpg')
//             }
//             style={{height: 35, width: 50}}
//           />
//           <Text
//             style={{fontWeight: '600', color: '#000', flex: 1, marginLeft: 5}}>
//             {companyName} ({companyCode})
//           </Text>
//           {loggedInUser &&
//             loggedInUser.compList &&
//             loggedInUser.compList.length > 1 && (
//               <Image
//                 style={{
//                   height: 10,
//                   width: 15,
//                   marginRight: Platform.OS === 'ios' ? 30 : 5,
//                 }}
//                 source={require('../../assets/dropdown.png')}
//               />
//             )}
//         </TouchableOpacity>
//         <Modal
//           animationType="slide"
//           transparent={true}
//           visible={dropdownVisible}
//           onRequestClose={() => setDropdownVisible(false)}>
//           <TouchableOpacity
//             style={styles.modalBackground}
//             onPress={() => setDropdownVisible(false)}>
//             <View style={styles.modalContent}>
//               <FlatList
//                 data={loggedInUser?.compList}
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({item}) => (
//                   <TouchableOpacity
//                     onPress={() => handleCompanySelect(item)}
//                     style={{
//                       width: '100%',
//                       height: 35,
//                       borderBottomWidth: 0.5,
//                       borderColor: '#8e8e8e',
//                       flexDirection:"row",
//                       marginLeft:10,
//                       marginTop:5
//                     }}>
//                     <Text
//                       style={{
//                         fontWeight: '600',
                       
//                         color: '#000',
//                       }}>
//                       {item.companyName}
                       
//                     </Text>
//                     <Text
//                       style={{
//                         fontWeight: '600',
//                         marginHorizontal: 5,
//                         color: '#000',
//                       }}>
//                      ({item.companyCode})
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//               />
//             </View>
//           </TouchableOpacity>
//         </Modal>

//         <CommenHeaderHomeScreen
//           navigation={navigation}
//           showMessageIcon={true}
//           showCartIcon={true}
//           showLocationIcon={true}
//         />
//       </View> */}

//       <View style={styles.tabContainer}>
//         {state.routes.map((route, index) => {
//           const label = route.name;
//           const isFocused = route.key === state.routes[state.index].key;
//           return (
//             <TouchableOpacity
//               key={index}
//               onPress={() => onPress(route.name)}
//               style={[styles.tabButton, isFocused && styles.activeTabButton]}>
//               <Text style={[styles.tabText, isFocused && styles.activeTabText]}>
//                 {label}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// const getStyles = (colors) => StyleSheet.create({
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     backgroundColor: '#ffffff',
//     marginTop: 10,
//     marginHorizontal: 7,
//     borderRadius: 30,
//     borderColor: '#000',
//     borderWidth: 1,
//     elevation: 5,
//     zIndex: 1,
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//   },
//   activeTabButton: {
//     backgroundColor: colors.color2,
//     borderBottomColor: '#000',
//     borderTopLeftRadius: 25,
//     borderTopRightRadius: 25,
//     borderBottomRightRadius: 25,
//     borderBottomLeftRadius: 25,
//     elevation: 2,
//   },
//   tabText: {
//     fontSize: 16,
//     color: '#000000',
//   },
//   activeTabText: {
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 10,
//   },
//   dropdownContainer: {
//     position: 'absolute',
//     top: 40,
//     left: 70,
//     right: 0,
//     backgroundColor: '#fff',
//     elevation: 5,
//     maxHeight: 100,
//     width: '50%',
//     borderRadius: 10,
//     zIndex: 1000,
//   },
//   modalContainer: {
//     flex: 1,
//     top: 50,
//     alignItems: 'center',
//     maxHeight: 150,
//   },
//   modalContent: {
//     width: '70%',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     elevation: 5,
//     marginTop: Platform.OS === 'ios' ? 105 : 50,
//     position: 'absolute',
//     maxHeight: 130,
//   },
//   modalBackground: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   modalItem: {
//     height: 35,
//     justifyContent: 'center',
//     borderBottomWidth: 0.5,
//     borderColor: '#8e8e8e',
//   },
//   modalItemText: {
//     fontWeight: '600',
//     color: '#000',
//   },
// });

// function Home() {
//   return (
//     <Tab.Navigator tabBar={props => <CustomTabBar {...props} />}>
//       <Tab.Screen name="ALL CATEGORIES" component={HomeCategories} />
//       <Tab.Screen name="ALL PRODUCTS" component={HomeAllProducts} />
//     </Tab.Navigator>
//   );
// }

// export default Home;

import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setLoggedInUser } from '../redux/actions/Actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SET_SELECTED_COMPANY } from '../redux/ActionTypes';
import CommenHeaderHomeScreen from '../components/CommenHeaderHomeScreen';
import axios from 'axios';
import NewCategoryUi from '../Pages/newCategoriesUi/NewCategoryUi';
import { API } from '../config/apiConfig';

const CustomHeader = () => {
  const navigation = useNavigation();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);

  const loggedInUser = useSelector(state => state.loggedInUser);
  const dispatch = useDispatch();

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
            dispatch({ type: SET_SELECTED_COMPANY, payload: initialCompany });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [dispatch]);

  const handleCompanySelect = company => {
    setSelectedCompany(company);
    setCompanyLogo(company.companyLogo);
    setDropdownVisible(false);
    dispatch({ type: SET_SELECTED_COMPANY, payload: company });
  };

  const toggleDropdown = () => {
    if (
      loggedInUser &&
      loggedInUser.compList &&
      loggedInUser.compList.length > 1
    ) {
      setDropdownVisible(!dropdownVisible);
    }
  };

  const companyName = selectedCompany ? selectedCompany.companyName : '';

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
        if (companyList && companyList.length > 0) {
          const company = companyList[0];
          setCompanyLogo(company.companyLogo);
        } else {
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <View style={{ backgroundColor: '#fff', zIndex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
        </TouchableOpacity>
        {dropdownVisible &&
          loggedInUser &&
          loggedInUser.compList &&
          loggedInUser.compList.length > 1 && (
            <View style={styles.dropdownContainer}>
              <FlatList
                data={loggedInUser.compList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleCompanySelect(item)}
                    style={{
                      width: '100%',
                      height: 35,
                      justifyContent: 'center',
                      borderBottomWidth: 0.5,
                      borderColor: '#8e8e8e',
                    }}>
                    <Text
                      style={{
                        fontWeight: '600',
                        marginHorizontal: 15,
                        color: "#000"
                      }}>
                      {item.companyName}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
      
      </View>
    </View>
  );
};

const Home = () => {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader />
      <NewCategoryUi />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: 40,
    left: 70,
    right: 0,
    backgroundColor: '#fff',
    elevation: 5,
    maxHeight: 100,
    width: '50%',
    borderRadius: 10,
    zIndex: 1000,
  },
});

export default Home;
