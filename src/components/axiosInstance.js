// axiosConfig.js
import axios from 'axios';
import { Alert } from 'react-native';

// Create an axios instance
const axiosInstance = axios.create({
  // You can set base URL or other default config options here
});

// Add a response interceptor to handle network errors
axiosInstance.interceptors.response.use(
  response => response, // If the response is successful, return it
  error => {
    // Check if the error is a network error (no internet connection)
    if (!error.response) {
      Alert.alert('No Internet!', 'Please Check your Internet Connection');
    }

    // Return the rejected promise with the error object
    return Promise.reject(error);
  }
);

export default axiosInstance;
    