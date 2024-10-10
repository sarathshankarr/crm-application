// src/config/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CUSTOMER_URL } from './apiConfig';

let ApiClient = axios.create({
  baseURL: CUSTOMER_URL,
  timeout: 10000,
});

ApiClient.interceptors.request.use(
  async (config) => {
    const newUserData = await AsyncStorage.getItem('userData');
    global.userData = JSON.parse(newUserData);
    if (global.userData && global?.userData?.token?.access_token) {
      config.headers.Authorization = `Bearer ${global?.userData?.token?.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default ApiClient;
