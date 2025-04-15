import React, {useContext, useEffect} from 'react';
import {Provider, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import store from './src/redux/store/Store';
import Routes from './src/navigation/Routes';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {CLEAR_CART} from './src/redux/ActionTypes';
import {
  ColorContext,
  ColorProvider,
} from './src/components/colortheme/colorTheme';
import {StatusBar, View, Platform} from 'react-native';
import {encode as base64Encode} from 'base-64';
import {API, USER_ID, USER_PASSWORD} from './src/config/apiConfig';
import Geocoder from 'react-native-geocoding';
import 'react-native-get-random-values';

const App = () => {
  Geocoder.init('AIzaSyDFkFf27LcYV5Fz6cjvAfEX1hsdXx4zE6Q');
  return (
    <Provider store={store}>
      <ColorProvider>
        <NavigationContainer>
          <MainApp />
        </NavigationContainer>
      </ColorProvider>
    </Provider>
  );
};

const MainApp = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {colors} = useContext(ColorContext);

  // Handle the axios interceptor for 401 errors
  // useEffect(() => {
  //   const interceptor = axios.interceptors.response.use(
  //     response => response,
  //     async error => {
  //       if (error.response && error.response.status === 401) {
  //         await AsyncStorage.multiRemove([
  //           'userdata',
  //           'loggedIn',
  //           'userRole',
  //           'userRoleId',
  //           'loggedInUser',
  //           'selectedCompany',
  //         ]);
  //         dispatch({type: CLEAR_CART});
  //         navigation.reset({
  //           index: 0,
  //           routes: [{name: 'Login'}],
  //         });

  //         return Promise.reject(error);
  //       }
  //       return Promise.reject(error);
  //     },
  //   );

  //   return () => {
  //     axios.interceptors.response.eject(interceptor);
  //   };
  // }, [navigation]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const newTokenData = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newTokenData.token.access_token}`;
            return axios(originalRequest);
          } catch (refreshError) {
            await AsyncStorage.multiRemove([
              'userdata',
              'loggedIn',
              'userRole',
              'userRoleId',
              'loggedInUser',
              'selectedCompany',
            ]);
            dispatch({type: CLEAR_CART});
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigation]);

  const refreshToken = async () => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem('userdata'));
      const refreshToken = userData?.token?.refresh_token;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const postData = new URLSearchParams();
      postData.append('grant_type', 'refresh_token');
      postData.append('refresh_token', refreshToken);

      const credentials = base64Encode(`${USER_ID}:${USER_PASSWORD}`);

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      };

      const response = await axios.post(
        userData.productURL + API.LOGIN,
        postData.toString(),
        {headers},
      );

      if (response.data) {
        const newExpiryTime =
          new Date().getTime() + response.data.expires_in * 1000;
        const newTokenData = {
          token: response.data,
          productURL: userData.productURL,
          expiryTime: newExpiryTime,
        };

        await AsyncStorage.setItem('userdata', JSON.stringify(newTokenData));
        global.userData = newTokenData;

        // Schedule next token refresh
        scheduleTokenRefresh(newExpiryTime);

        return newTokenData;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  };

  const scheduleTokenRefresh = expiryTime => {
    const currentTime = new Date().getTime();
    const refreshTime = expiryTime - 60000; // Refresh 1 minute before expiry

    if (refreshTime > currentTime) {
      setTimeout(refreshToken, refreshTime - currentTime);
    }
  };

  useEffect(() => {
    const checkTokenExpiry = async () => {
      const userData = JSON.parse(await AsyncStorage.getItem('userdata'));
      if (userData?.expiryTime) {
        const currentTime = new Date().getTime();
        if (currentTime >= userData.expiryTime - 60000) {
          // Refresh token 1 minute before expiry
          await refreshToken();
        } else {
          scheduleTokenRefresh(userData.expiryTime);
        }
      }
    };

    checkTokenExpiry();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      console.log('Setting StatusBar for iOS');
      StatusBar.setBarStyle('light-content');
    } else if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.color2);
    }
  }, [colors]);

  return (
    <View style={{flex: 1, backgroundColor: colors.color2}}>
      {Platform.OS === 'ios' && (
        <View
          style={{
            height: 60,
            backgroundColor: colors.color2,
          }}
        />
      )}
      <StatusBar
        translucent={false}
        barStyle="light-content"
        backgroundColor={colors.color2}
      />
      <Routes />
    </View>
  );
};

export default App;
