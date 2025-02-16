// import React from 'react';
// import {View, TouchableOpacity, Image, StyleSheet, SafeAreaView} from 'react-native';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import Categories from '../bottom/Categories';
// import Order from '../bottom/Order';
// import CommonHeader from '../components/CommonHeader';
// import Home from '../bottom/Home';

// const Bottom = createBottomTabNavigator();

// const HomeScreen = ({navigation}) => {
//   return (
//     <SafeAreaView style={styles.container}>
//     <Bottom.Navigator
//       screenOptions={({route}) => ({
//         tabBarIcon: ({color, size, focused}) => {
//           let icon;
//           if (route.name === 'Home') {
//             icon = require('../../assets/store.png');
//           } else if (route.name === 'Categories') {
//             icon = require('../../assets/categories.png');
//           } else if (route.name === 'Order') {
//             icon = require('../../assets/orderr.png');
//           }
//           return (
//             <View
//               style={[styles.tabIconContainer, focused && styles.selectedTab]}>
//               <Image
//                 source={icon}
//                 style={{
//                   height: focused ? 30 : 25,
//                   width: focused ? 30 : 25,
//                   tintColor: '#1F74BA',
//                 }}
//               />
//             </View>
//           );
//         },
//         headerShown: true,
//         headerTitle: route.name,
//         header: ({navigation, route}) => {
//           const showDrawerButton = !['Login', 'Main', 'Cart'].includes(
//             route.name,
//           );
//           const showHeader = route.name !== 'Home';
//           return showHeader ? (
//             <CommonHeader
//               navigation={navigation}
//               title={route.name}
//               showDrawerButton={showDrawerButton}
//               showMessageIcon={true}
//               showCartIcon={true}
//               showLocationIcon={true}
//             />
//           ) : null;
//         },
//         tabBarActiveTintColor: '#390050',
//         tabBarInactiveTintColor: '#000',
//         tabBarStyle: {
//           borderRadius: 30,
//           marginHorizontal: 10,
//           marginBottom: 10,
//           height: 60,
//           position:"absolute"
//         },
//       })}>
//       <Bottom.Screen
//         name="Home"
//         component={Home}
//         options={{headerTitle: 'Home', headerShown: false,}}
//       />
//       <Bottom.Screen
//         name="Categories"
//         component={Categories}
//         options={{headerTitle: 'Categories'}}
//       />
//       <Bottom.Screen
//         name="Order"
//         component={Order}
//         options={{headerTitle: 'Order'}}
//       />
//     </Bottom.Navigator>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container:{
//     flex:1,
//     backgroundColor: 'transparent',

//   },
//   tabIconContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: '100%',
//   },
//   selectedTab: {
//     borderTopWidth: 4,
//     borderTopColor: '#1F74BA',
//     width: '70%',
//   },
// });

// export default HomeScreen;

import React, {useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Categories from '../bottom/Categories';
import Order from '../bottom/Order';
import CommonHeader from '../components/CommonHeader';
import Home from '../bottom/Home';
import {ColorContext} from '../components/colortheme/colorTheme';
import CompanyDropdown from '../components/CompanyDropdown';
import CommenHeaderHomeScreen from '../components/CommenHeaderHomeScreen';

const Bottom = createBottomTabNavigator();

const HomeScreen = ({navigation}) => {
  const {colors} = useContext(ColorContext);
  const styles = getStyles(colors);
  return (
    <SafeAreaView style={styles.container}>
      <Bottom.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({color, size, focused}) => {
            let icon;
            if (route.name === 'Home') {
              icon = require('../../assets/store.png');
            } else if (route.name === 'Categories') {
              icon = require('../../assets/categories.png');
            } else if (route.name === 'Order') {
              icon = require('../../assets/orderr.png');
            }
            return (
              <View
                style={[
                  styles.tabIconContainer,
                  focused && styles.selectedTab,
                ]}>
                <Image
                  source={icon}
                  style={{
                    height: focused ? 30 : 25,
                    width: focused ? 30 : 25,
                    tintColor: focused ? colors.color2 : '#000',
                  }}
                />
              </View>
            );
          },
          headerShown: true,

          headerTitle: route.name,
          header: ({navigation, route}) => {
            const showDrawerButton = !['Login', 'Main', 'Cart'].includes(
              route.name,
            );

            return (
              <>
                <CommenHeaderHomeScreen
                  navigation={navigation}
                  title={route.name}
                  showDrawerButton={showDrawerButton}
                  showMessageIcon={true}
                  showCartIcon={true}
                  showLocationIcon={true}
                />
              </>
            );
          },
          tabBarActiveTintColor: colors.color2,
          tabBarInactiveTintColor: '#000',
          tabBarStyle: {
            borderRadius: 30,
            marginHorizontal: 10,
            marginBottom: 10,
            height: 60,
            position: 'absolute',
            paddingBottom: 5, // Adjusted for better alignment
          },
        })}>
       <Bottom.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: true,
            headerTitle: () => <CompanyDropdown title="Home" />,
          }}
        />


        <Bottom.Screen
          name="Categories"
          component={Categories}
          options={{
            headerShown: true,
            headerTitle: () => <CompanyDropdown title="Categories" />,
          }}
        />
        <Bottom.Screen
          name="Order"
          component={Order}
          options={{headerTitle: 'Order'}}
        />
      </Bottom.Navigator>
    </SafeAreaView>
  );
};

const getStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    tabIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 5, // Use padding instead of height
    },
    selectedTab: {
      borderTopWidth: 4,
      borderTopColor: colors.color2,
      width: '70%',
    },
  });

export default HomeScreen;
