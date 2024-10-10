import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Categories from '../bottom/Categories';
import Order from '../bottom/Order';
import CommonHeader from '../components/CommonHeader';
import Home from '../bottom/Home';

const Bottom = createBottomTabNavigator();

const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
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
              style={[styles.tabIconContainer, focused && styles.selectedTab]}>
              <Image
                source={icon}
                style={{
                  height: focused ? 30 : 25,
                  width: focused ? 30 : 25,
                  tintColor: '#1F74BA',
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
          const showHeader = route.name !== 'Home';
          return showHeader ? (
            <CommonHeader
              navigation={navigation}
              title={route.name}
              showDrawerButton={showDrawerButton}
              showMessageIcon={true}
              showCartIcon={true}
              showLocationIcon={true}
            />
          ) : null;
        },
        tabBarActiveTintColor: '#390050',
        tabBarInactiveTintColor: '#000',
        tabBarStyle: {
          borderRadius: 30,
          marginHorizontal: 10,
          marginBottom: 10,
          height: 60,
          position:"absolute"
        },
      })}>
      <Bottom.Screen
        name="Home"
        component={Home}
        options={{headerTitle: 'Home', headerShown: false,}}
      />
      <Bottom.Screen
        name="Categories"
        component={Categories}
        options={{headerTitle: 'Categories'}}
      />
      <Bottom.Screen
        name="Order"
        component={Order}
        options={{headerTitle: 'Order'}}
      />
    </Bottom.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor: 'transparent', 
    
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  selectedTab: {
    borderTopWidth: 4,
    borderTopColor: '#1F74BA',
    width: '70%',
  },
});

export default HomeScreen;
