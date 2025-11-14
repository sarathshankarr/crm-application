import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {encode as base64Encode} from 'base-64';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isValidString} from '../../Helper/Helper';
import {
  API,
  CUSTOMER_URL,
  USER_ID,
  USER_PASSWORD,
} from '../../config/apiConfig';
import {setLoggedInUser, setUserRole} from '../../redux/actions/Actions';
import CustomCheckBox from '../../components/CheckBox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import useOnlineStatus from '../../utils/hooks/online/useOnlineStatus';
import store from '../../redux/store/Store';
import { ColorContext } from '../../components/colortheme/colorTheme';

const Login = () => {
  const { colors } = useContext(ColorContext);
  const styles = getStyles(colors);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const onlineStatus = useOnlineStatus();

  const [roleMenu, setRoleMenu] = useState(null);
  const [mobileMenus, setMobileMenus] = useState(null);
  const [error, setError] = useState(null);

  const globalUserData = global?.userData;
  const companyIdd = useSelector(state => state?.loggedInUser?.companyId);
  const roleIdd = useSelector(state => state?.loggedInUser?.roleId);
  
  console.log('roleId', roleIdd);

  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [companyIdrollmenu, setCompanyIdrollmenu] = useState(null);

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem(
          'initialSelectedCompany',
        );
        if (initialCompanyData) {
          const initialCompany = JSON.parse(initialCompanyData);
          setInitialSelectedCompany(initialCompany);
        }
      } catch (error) {
        console.error('Error fetching initial selected company:', error);
      }
    };

    fetchInitialSelectedCompany();
  }, []);

 useEffect(() => {
  const id = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;
  setCompanyIdrollmenu(id);
}, [selectedCompany, initialSelectedCompany]);

  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const storedCredentials = await AsyncStorage.getItem('credentials');
        if (storedCredentials) {
          setUsernameSuggestions(JSON.parse(storedCredentials));
        }
      } catch (error) {
        console.error('Error loading stored credentials:', error);
      }
    };
    loadStoredCredentials();
  }, []);
  console.log('companyId,', companyIdrollmenu);

  const handleUsernameChange = async text => {
    setUsername(text);
    if (text.length > 0) {
      try {
        const storedCredentials = await AsyncStorage.getItem('credentials');
        const parsedCredentials = storedCredentials
          ? JSON.parse(storedCredentials)
          : [];
        const uniqueCredentials = parsedCredentials.filter(
          (credential, index, self) =>
            index === self.findIndex(c => c.username === credential.username),
        );
        const filteredSuggestions = uniqueCredentials.filter(credential =>
          credential.username.toLowerCase().includes(text.toLowerCase()),
        );
        setUsernameSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error parsing stored credentials:', error);
        setUsernameSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = suggestion => {
    setUsername(suggestion.username);
    setPassword(suggestion.password);
    // setCode(suggestion.code);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const storedCredentials = await AsyncStorage.getItem('credentials');
        if (storedCredentials) {
          const credentials = JSON.parse(storedCredentials);
          const lastCredential = credentials[credentials.length - 1]; // Get the most recent credential
          if (lastCredential) {
            setUsername(lastCredential.username);
            setPassword(lastCredential.password);
            setCode(lastCredential.code);
            setIsChecked(true); // Check the remember me checkbox
          }
        }
      } catch (error) {
        console.error('Error loading stored credentials:', error);
      }
    };
    loadStoredCredentials();
  }, []);

  const getCustomerUrl = async () => {
    if (!onlineStatus) {
      Alert.alert('No Internet !', 'Please Check your Internet Connection');
      return;
    }

    setLoading(true);
    handleEmptyInputs();
    try {
      const response = await axios.get(CUSTOMER_URL + code);
      setLoading(false);
      console.log('API Response:', response.data.response.url);
      if (isValidString(response?.data?.response?.url)) {
        handleLogin(response?.data?.response?.url);
      } else {
        Alert.alert('Invalid Code', 'Please enter a valid customer code.');
      }
      // handleLogin('https://us.codeverse.co/')
    } catch (error) {
      console.log('error======>',error)
      setLoading(false);
      if (error.response && error.response.status === 400) {
        Alert.alert('Invalid Code', 'Please enter a valid customer code.');
      } else if (
        error.response &&
        (error.response.status === 502 || error.response.status === 404)
      ) {
        Alert.alert(
          'Alert',
          'Woof! There seems to be a problem. Please try after sometime.',
        );
      } else {
        Alert.alert('Alert', 'please Enter the code.');
      }
    }
  };

  const LoginAudit = () => {
    const globalUserData = global?.userData;

    // Extract userId and companyId from global user data
    const userId = globalUserData?.token?.userId;
    const companyId = globalUserData?.token?.companyId;

    const apiUrl = `${global?.userData?.productURL}${
      API.LOGINAUDIT
    }/${userId}/${companyId}/${0}/${2}`;
    console.log('Constructed API URL:', apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('Logged in user:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleEmptyInputs = () => {
    setErrorMsg([]);

    if (code.trim().length === 0) {
      setErrorMsg(prevErrors => [...prevErrors, 'no_Code']);
    }

    if (username.trim().length === 0) {
      setErrorMsg(prevErrors => [...prevErrors, 'no_Username']);
    }

    // Check for empty password
    if (password.trim().length === 0) {
      setErrorMsg(prevErrors => [...prevErrors, 'no_Password']);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async productURL => {
    console.log("handleLogin productURL:", productURL);
    if (!username) {
      Alert.alert('crm.codeverse.co.says', 'Please enter a username');
      return;
    }

    if (!password) {
      Alert.alert('crm.codeverse.co.says', 'Please enter a password');
      return;
    }
    setLoading(true); 
    const postData = new URLSearchParams();
    postData.append('username', username);
    postData.append('grant_type', 'password');
    postData.append('password', password);
    const credentials = base64Encode(`${USER_ID}:${USER_PASSWORD}`);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    };

    try {
      const response = await axios.post(
        productURL + API.LOGIN,
        postData.toString(),
        { headers }
      );
  
      console.log('Login api calling :', productURL + API.LOGIN);
      if (isValidString(response.data)) {
        let data = { token: response.data, productURL: productURL };
        await saveToken(data);
        await getUsers(response.data, productURL);
        await getRollMenu(roleIdd, companyIdd);
        LoginAudit(data);
  
        // Set a timeout to refresh the token before it expires
        const expiresIn = response.data.expires_in * 1000; // Convert to milliseconds
        const refreshTimeout = expiresIn - 60000; // Refresh 1 minute before expiration
        setTimeout(refreshToken, refreshTimeout);
  
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        console.log('Response:', JSON.stringify(response.data));
      }
    } catch (error) {
      if (error?.response?.data?.error_description) {
        Alert.alert(
          'crm.codeverse.co.says',
          error.response.data.error_description
        );
      }
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };

  // const saveToken = async data => {
  //   try {
  //     console.log('Saving token:', JSON.stringify(data));
  //     await AsyncStorage.setItem('userdata', JSON.stringify(data));
  //     await AsyncStorage.setItem('loggedIn', 'true');
  //     global.userData = data; // Ensure global userData is updated
  //     console.log('globaluserData', global.userData);
  //     if (isChecked) {
  //       const existingCredentials =
  //         JSON.parse(await AsyncStorage.getItem('credentials')) || [];
  //       const newCredential = {username, password, code};
  //       const updatedCredentials = [...existingCredentials, newCredential];
  //       await AsyncStorage.setItem(
  //         'credentials',
  //         JSON.stringify(updatedCredentials),
  //       );
  //     } else {
  //       await AsyncStorage.removeItem('username');
  //       await AsyncStorage.removeItem('password');
  //       await AsyncStorage.removeItem('code');
  //     }
  //   } catch (error) {
  //     console.error('Error saving token:', error);
  //   }
  // };

  const saveToken = async (data) => {
    try {
      const expiryTime = new Date().getTime() + data.token.expires_in * 1000;
      const tokenData = { ...data, expiryTime };
      await AsyncStorage.setItem('userdata', JSON.stringify(tokenData));
      await AsyncStorage.setItem('loggedIn', 'true');
      global.userData = tokenData; // Ensure global userData is updated
      console.log('globaluserData', global.userData);
      if (isChecked) {
        const existingCredentials = JSON.parse(await AsyncStorage.getItem('credentials')) || [];
        const newCredential = { username, password, code };
        const updatedCredentials = [...existingCredentials, newCredential];
        await AsyncStorage.setItem('credentials', JSON.stringify(updatedCredentials));
      } else {
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('password');
        await AsyncStorage.removeItem('code');
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const checkTokenExpiry = async () => {
    const userData = JSON.parse(await AsyncStorage.getItem('userdata'));
    if (userData && userData.expiryTime) {
      const currentTime = new Date().getTime();
      if (currentTime >= userData.expiryTime - 60000) { // Refresh token 1 minute before expiry
        await refreshToken(userData);
      }
    }
  };
  
  const refreshToken = async (userData) => {
    const postData = new URLSearchParams();
    postData.append('grant_type', 'refresh_token');
    postData.append('refresh_token', userData.token.refresh_token);
    const credentials = base64Encode(`${USER_ID}:${USER_PASSWORD}`);
  
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    };
  
    try {
      const response = await axios.post(
        userData.productURL + API.LOGIN,
        postData.toString(),
        { headers }
      );
      if (isValidString(response.data)) {
        const expiryTime = new Date().getTime() + response.data.expires_in * 1000;
        const newTokenData = { token: response.data, productURL: userData.productURL, expiryTime };
        await AsyncStorage.setItem('userdata', JSON.stringify(newTokenData));
        global.userData = newTokenData;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Handle token refresh failure (e.g., logout user)
    }
  };

  // const getRollMenu = async () => {
  //   try {
  //     const state = store.getState();
  //     const roleIdd = state?.loggedInUser?.roleId;
  //     const companyIdd = state?.loggedInUser?.companyId;
  
  //     console.log('Role ID:', roleIdd, 'Company ID:', companyIdd);
  
  //     const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_THE_ROLE_MENU}/${roleIdd}/${companyIdd}`;
  //     console.log('apiUrl:', apiUrl);
  
  //     const response = await axios.get(apiUrl, {
  //       headers: {
  //         Authorization: `Bearer ${global?.userData?.token?.access_token}`,
  //       },
  //     });
  
  //     const roleMenuData = response.data.response.roleMenuMapList;
  //     await AsyncStorage.setItem('roleMenu', JSON.stringify(roleMenuData));
  //     setRoleMenu(roleMenuData);
  //     console.log('Role Menu Data:', roleMenuData);
  //   } catch (err) {
  //     console.error('Error fetching role menu:', err);
  //   }
  // };
  
  
  
  const getRollMenu = async () => {
    try {
      const state = store.getState();
      const roleIdd = state?.loggedInUser?.roleId;
      const companyIdd = state?.loggedInUser?.companyId;
  
      // Ensure `companyId` is a single value or processed correctly
      const companyIdArray = companyIdd?.split(',') || [];
      const companyId = companyIdArray[0]; // Pick the first `companyId` as an example
  
      console.log('Role ID:', roleIdd, 'Company ID:', companyId);
  
      const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_THE_ROLE_MENU}/${roleIdd}/${companyId}`;
      console.log('apiUrl:', apiUrl);
  
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
  
      const roleMenuData = response.data.response.roleMenuMapList;
      await AsyncStorage.setItem('roleMenu', JSON.stringify(roleMenuData));
      setRoleMenu(roleMenuData);
      console.log('Role Menu Data:', roleMenuData);
    } catch (err) {
      console.error('Error fetching role menu:', err);
    }
  };
  
  
  
  const getUsers = async (userData, productURL) => {
    await checkTokenExpiry(); 
    console.log('getUsers userData:', userData);
    const apiUrl = `${productURL}${API.ADD_USERS}/${userData.userId}`; // Update API URL dynamically
    console.log('apiUrl', apiUrl);
  
    try {
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${userData.access_token}` },
      });
      const loggedInUser = response.data.response.users[0];
  
      if (loggedInUser) {
        console.log('Logged in user:', loggedInUser);
        await dispatch(setLoggedInUser(loggedInUser)); // Ensure Redux updates
        await dispatch(setUserRole(loggedInUser.role)); // Ensure Redux updates
        await saveUserDataToStorage(loggedInUser); // Save user data to storage
  
        // Extract roleId and companyId from the updated Redux state
        const state = store.getState();
        const roleIdd = state?.loggedInUser?.roleId;
        const companyIdd = state?.loggedInUser?.companyId;
  
        if (roleIdd && companyIdd) {
          console.log('Role ID:', roleIdd, 'Company ID:', companyIdd);
          await getRollMenu(roleIdd, companyIdd); // Pass the IDs to getRollMenu
        } else {
          console.error('Role ID or Company ID is missing');
          Alert.alert('Error', 'Unable to fetch role or company details.');
        }
      } else {
        Alert.alert('No user data found', 'Failed to fetch user data.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert(
        'Failed to fetch user data',
        'An error occurred while fetching user data.',
      );
    }
  };
  
  


  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenExpiry();
    }, 300000); // Check every 5 minutes
  
    return () => clearInterval(interval);
  }, []);

  const saveUserDataToStorage = async userData => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const saveRoleToStorage = async ({roleName, roleId}) => {
    try {
      await AsyncStorage.setItem('userRole', roleName);
      await AsyncStorage.setItem('userRoleId', roleId.toString());
    } catch (error) {
      console.error('Error saving user role and ID:', error);
    }
  };

  const handleForgotPassword = () => {
    // Alert.alert('Forgot password clicked');
    navigation.navigate('MailConfirmation');
    // navigation.navigate('EnterOtp');
    // navigation.navigate('ConfirmPassword');
  };
  const handleCheckBoxToggle = () => {
    setIsChecked(!isChecked);
  };

  return (
    // <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <SafeAreaView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on the platform
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust this offset if necessary
    >
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              style={{
                height: 100,
                width: 150,
                resizeMode: 'contain',
            
             }}
              source={require('../../../assets/Logo.png')}
            />
          </View>
          <Text style={styles.titlehead}>
          <Text style={styles.titleHighlight}>Hexa</Text>CRM
        </Text>
          <View style={styles.formContainer}>
            <View
              style={[
                styles.inputContainer,
                errorMsg?.includes('no_Code') && styles.inputContainerError,
              ]}>
            <TextInput
  style={styles.input}
  placeholder="Code"
  placeholderTextColor="#777"
  onChangeText={text => setCode(text.trimStart())}
  value={code}
/>

              <View
                style={{
                  backgroundColor:  '#F8FAFF',
                  borderRadius: 10,
                  paddingHorizontal: 9,
                  paddingVertical: 2,
                }}>
                <Image
                  source={require('../../../assets/code-lock.png')}
                  style={styles.inputImage}

                />
              </View>
            </View>

            {errorMsg?.includes('no_Code') && (
              <Text style={styles.errorText}>Code is required</Text>
            )}

            <View
              style={[
                styles.inputContainer,
                errorMsg?.includes('no_Username') && styles.inputContainerError,
              ]}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#777"
                onChangeText={handleUsernameChange}
                value={username}
              />
              <View
                style={{
                  backgroundColor:  '#F8FAFF',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 1,
                }}>
                <Image
                  source={require('../../../assets/email.png')}
                  style={styles.inputImage}
                />
              </View>
            </View>

            {errorMsg?.includes('no_Username') && (
              <Text style={styles.errorText}>Username is required</Text>
            )}
            {showSuggestions && (
              <ScrollView style={styles.suggestionsContainer}>
                {usernameSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestionClick(suggestion)}
                    style={styles.suggestionItem}>
                    <Text style={{color: '#000'}}>{suggestion.username}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View
              style={[
                styles.inputContainer,
                errorMsg?.includes('no_Password') && styles.inputContainerError,
              ]}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry={!showPassword} // Toggle secureTextEntry based on state
                onChangeText={text => setPassword(text)}
                value={password}
              />
              <TouchableOpacity
                style={{
                  backgroundColor:  '#F8FAFF',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 1,
                }}
                onPress={togglePasswordVisibility}>
                <Image
                  source={
                    showPassword
                      ? require('../../../assets/password.png')
                      : require('../../../assets/lock.png')
                  }
                  style={styles.inputImagee}
                />
              </TouchableOpacity>
            </View>
            {errorMsg?.includes('no_Password') && (
              <Text style={styles.errorText}>Password is required</Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: 15,
                marginTop: 10,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CustomCheckBox
                  isChecked={isChecked}
                  onToggle={handleCheckBoxToggle}
                />
                <TouchableOpacity>
                  <Text
                    style={{
                      padding: 5,
                      color: '#000',
                      fontSize: 17,
                      fontWeight: '500',
                    }}>
                    Remember Me
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{backgroundColor: '#F5F5F5', borderRadius: 10}}
                onPress={handleForgotPassword}>
                <Text
                  style={{
                    padding: 5,
                    color: '#000',
                    fontSize: 17,
                    fontWeight: '500',
                  }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={getCustomerUrl}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            <View style={styles.line} />
          </View>
          < View>
          <Text style={styles.title}>Login to Your Account</Text>
          </View>
          <View
            style={{justifyContent: 'flex-end', flex: 1, marginVertical: 10}}>
            <Text style={{textAlign: 'center', color: '#000'}}>
              All rights with Codeverse Technologies 1.5
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    // </KeyboardAwareScrollView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  imageContainer:{
    top: 20,
 right:10
  },
  title: {
    fontSize: 16,
    fontWeight:"600",
    color: colors.color2,
    alignItems: 'center',
    alignSelf:'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: 5,
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
    paddingHorizontal: 10,
    marginVertical: 10,
    // backgroundColor: '#D9D9D947',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#F8FAFF',
  },
  inputContainerError: {
    borderColor: 'red',
  },

  titlehead: {
    fontSize: 36,
    fontWeight: '700',
    // color: '#888888',
    color: colors.color2,
    // color: 'purple',
    // color: '#000',
    textAlign: 'center',
    marginTop: 20,
    // fontFamily:'serif'
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
    }),
  },
  titleHighlight: {
    color: '#3BC3FF',
    // color: 'purple',
    // color: colors.color2,
    // color: '#000',

    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
    }),
  },
  formContainer: {
    width: '100%',
    marginTop: 30,
  },
  inputImage: {
    width: 28,
    height: 28,
    tintColor:colors.color2
  },
  inputImagee: {
    width: 29,
    height: 29,
    tintColor:colors.color2
  },
  input: {
    flex: 1,
    height: '100%',
    color: 'black',
    fontSize: 16,
    
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#390050',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.color2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderRadius:20
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
  line: {
    borderBottomColor: '#615858C7',
    borderBottomWidth: 1,
    marginTop: 30,
    marginHorizontal: 30,
    marginBottom:20,
  },
  signintext: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  googleimg: {
    height: 34,
    width: 34,
  },
  facebookimg: {
    height: 38,
    width: 38,
  },
  infoText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 13,
  },
  suggestionsContainer: {
    top: 20,
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});

export default Login;
