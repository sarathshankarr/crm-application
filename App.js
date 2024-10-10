import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import store from './src/redux/store/Store';
import Routes from './src/navigation/Routes';
import 'react-native-gesture-handler';
import { NavigationContainer, useNavigation } from '@react-navigation/native'; 
import { CLEAR_CART } from './src/redux/ActionTypes';

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer> 
        <MainApp />
      </NavigationContainer>
    </Provider>
  );
};

const MainApp = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          await AsyncStorage.multiRemove([
            'userdata', 
            'loggedIn', 
            'userRole', 
            'userRoleId', 
            'loggedInUser', 
            'selectedCompany'
          ]);
          dispatch({ type: CLEAR_CART });
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });

          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigation]);

  return <Routes />;
};

export default App;
