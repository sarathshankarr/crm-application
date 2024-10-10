import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import OrganizationInfo from '../organization/OrganizationInfo';
import PersonalInfo from '../personal/Personalinfo';
import { useNavigation, useRoute } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const Profile = () => {
  const CustomTabBar = ({ state, descriptors }) => {
    const navigation = useNavigation();
    const route = useRoute();

    const onPress = (routeName) => {
      navigation.navigate(routeName);
    };

    return (
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = route.name;
          const isFocused = route.key === state.routes[state.index].key;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onPress(route.name)}
              style={[styles.tabButton, isFocused && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, isFocused && styles.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Organization info" component={OrganizationInfo} />
      <Tab.Screen name="PersonalInfo" component={PersonalInfo} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#000', // Change to your desired active tab color
  },
  tabText: {
    fontSize: 16,
    color: '#000000',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
});

export default Profile;
