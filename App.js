import React, { useContext, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import store from './src/redux/store/Store';
import Routes from './src/navigation/Routes';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { CLEAR_CART } from './src/redux/ActionTypes';
import { ColorContext, ColorProvider } from './src/components/colortheme/colorTheme';
import { View } from 'react-native';
// import { ColorProvider, ColorContext } from './src/components/colorTheme/colorTheme'; // Import ColorProvider


const App = () => {
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
  const { colors } = useContext(ColorContext); // Access colors from ColorContext

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
            'selectedCompany',
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.color2 }}>
      <Routes />
    </View>
  );
};

export default App;
