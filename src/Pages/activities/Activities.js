import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import Tasks from './Tasks';
import Call from './Call';

const Tab = createMaterialTopTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {

  const handleGoBack = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.tabContainer}>
       <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            style={{height: 25, width: 25}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
      </View>
      {state.routes.map((route, index) => {
        const label = route.name;
        const isFocused = route.key === state.routes[state.index].key;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tabButton, isFocused && styles.activeTabButton]}>
            <Text style={[styles.tabText, isFocused && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Activities = () => {
    const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Tab.Navigator tabBar={props => <CustomTabBar {...props}  navigation={navigation}/>}>
        <Tab.Screen name="Tasks" component={Tasks} />
        <Tab.Screen name="Calls" component={Call} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff', 
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderRadius: 30,
    borderColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2, 
    borderBottomColor: '#000',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  tabText: {
    fontSize: 16,
    color: '#000',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#000',
  },
});

export default Activities;
