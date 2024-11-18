import React, { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { encode as base64Encode } from 'base-64';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidString } from '../../Helper/Helper';
import {
  API,
  CUSTOMER_URL,
  USER_ID,
  USER_PASSWORD,
} from '../../config/apiConfig';
import { setLoggedInUser, setUserRole } from '../../redux/actions/Actions';
import CustomCheckBox from '../../components/CheckBox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import useOnlineStatus from '../../utils/hooks/online/useOnlineStatus';

const Login = () => {
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
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 400) {
        Alert.alert('Invalid Code', 'Please enter a valid customer code.');
      } else if (error.response && (error.response.status === 502 || error.response.status === 404)) {
        Alert.alert('Alert', 'Woof! There seems to be a problem. Please try after sometime.');
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

    const apiUrl = `${global?.userData?.productURL}${API.LOGINAUDIT}/${userId}/${companyId}/${0}/${2}`;
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
      })

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

  const goingToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = async productURL => {
    if (!username) {
      Alert.alert(
        'crm.codeverse.co.says',
        'Please enter a username',
      );
      return;
    }

    if (!password) {
      Alert.alert(
        'crm.codeverse.co.says',
        'Please enter a password',
      );
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
        {
          headers,
        },
      );
      if (isValidString(response.data)) {
        let data = { token: response.data, productURL: productURL };
        await saveToken(data);
        await getUsers(response.data, productURL);

        LoginAudit(data);

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
          error.response.data.error_description,
        );
      }
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };

  const saveToken = async data => {
    try {
      console.log('Saving token:', JSON.stringify(data));
      await AsyncStorage.setItem('userdata', JSON.stringify(data));
      await AsyncStorage.setItem('loggedIn', 'true');
      global.userData = data; // Ensure global userData is updated
      console.log('globaluserData', global.userData);
      if (isChecked) {
        const existingCredentials =
          JSON.parse(await AsyncStorage.getItem('credentials')) || [];
        const newCredential = { username, password, code };
        const updatedCredentials = [...existingCredentials, newCredential];
        await AsyncStorage.setItem(
          'credentials',
          JSON.stringify(updatedCredentials),
        );
      } else {
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('password');
        await AsyncStorage.removeItem('code');
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const getUsers = async (userData, productURL) => {
    console.log('getUsers userData:', userData);
    const apiUrl = `${productURL}${API.ADD_USERS}/${userData.userId}`; // Update API URL to include dynamic
    console.log('apurl', apiUrl);
    try {
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${userData.access_token}` },
      });
      const loggedInUser = response.data.response.users[0]; // Since response is expected to have only one user with given
      if (loggedInUser) {
        console.log('Logged in user:', loggedInUser);
        dispatch(setLoggedInUser(loggedInUser));
        dispatch(setUserRole(loggedInUser.role));
        await saveUserDataToStorage(loggedInUser);
        // const roles = loggedInUser.role;
        // let roleName = '';
        // let roleId = '';
        // for (const role of roles) {
        //   const name = role.role;
        //   if (name) {
        //     if (
        //       name === 'admin' ||
        //       name === 'Distributor' ||
        //       name === 'Retailer'
        //     ) {
        //       roleName = name;
        //       roleId = role.id;
        //       break;
        //     }
        //   }
        // }
        // if (roleName && roleId) {
        //   await saveRoleToStorage({roleName, roleId});
        // } 
        // else {
        //   Alert.alert(
        //     'Unauthorized role',
        //     'You do not have access to this application.',
        //   );
        // }
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

  const saveUserDataToStorage = async userData => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const saveRoleToStorage = async ({ roleName, roleId }) => {
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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on the platform
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust this offset if necessary
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              style={{ height: 103, width: 103, marginTop: 30 }}
              source={require('../../../assets/loghighcon.png')}
            />
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login to Your Account</Text>
            <View
              style={[
                styles.inputContainer,
                errorMsg?.includes('no_Code') && styles.inputContainerError,
              ]}>
              <TextInput
                style={styles.input}
                placeholder="Code"
                placeholderTextColor="#000"
                onChangeText={text => setCode(text)}
                value={code}
              />
              <Image
                source={require('../../../assets/code-lock.png')}
                style={styles.inputImage}
              />
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
                placeholderTextColor="#000"
                onChangeText={handleUsernameChange}
                value={username}
              />

              <Image
                source={require('../../../assets/email.png')}
                style={styles.inputImage}
              />
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
                    <Text style={{ color: "#000" }}>{suggestion.username}</Text>
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
                placeholderTextColor="#000"
                secureTextEntry={!showPassword} // Toggle secureTextEntry based on state
                onChangeText={text => setPassword(text)}
                value={password}
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Image
                  source={showPassword ? require('../../../assets/password.png') : require('../../../assets/lock.png')}
                  style={styles.inputImagee}
                />
              </TouchableOpacity>
            </View>
            {errorMsg?.includes('no_Password') && (
              <Text style={styles.errorText}>Password is required</Text>
            )}
            {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CustomCheckBox isChecked={isChecked} onToggle={handleCheckBoxToggle} />
          <Text style={{ padding: 5, color: '#000', color: "#000" }}>Remember Me</Text>
        </View> */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15,marginTop:10}}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CustomCheckBox isChecked={isChecked} onToggle={handleCheckBoxToggle} />
                <Text style={{ padding: 5, color: '#000',fontSize:15,fontWeight:"500"}}>Remember Me</Text>
              </View>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={{ padding: 5, color: '#000',fontSize:16,fontWeight:"500" }}>Forgot Password?</Text>
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
            {/* <View>
          <Text style={styles.signintext}>Or sign in with</Text>
        </View> */}
            {/* <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View>
          <TouchableOpacity>
            <Image
              style={styles.googleimg}
              source={require('../../../assets/google.png')}></Image></TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity>
            <Image
              style={styles.facebookimg}
              source={require('../../../assets/Facebook.png')}></Image></TouchableOpacity>
          </View>
        </View> */}
          </View>
          <View style={{ justifyContent: 'flex-end', flex: 1, marginVertical: 10 }}>
            {/* <TouchableOpacity onPress={goingToSignUp}>
                <Text style={{textAlign:'center'}}>Don’t have an account? Sign Up</Text>
        </TouchableOpacity> */}
            <Text style={{ textAlign: 'center', color: "#000" }}>
              All rights with Codeverse Technologies
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    // </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 25,
    marginBottom: 30,
    color: '#390050',
    alignItems: 'center',
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
    borderWidth: 2,
    borderColor: '#D9D9D9',
  },
  inputContainerError: {
    borderColor: 'red',
  },

  formContainer: {
    width: '100%',
    marginTop: 30,
  },
  inputImage: {
    width: 29,
    height: 29,
    marginRight: 10,
  },
  inputImagee:{
    width: 29,
    height: 29,
    marginRight: 10,
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
    backgroundColor: '#1F74BA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
  line: {
    borderBottomColor: '#615858C7',
    borderBottomWidth: 1,
    marginVertical: 30,
    marginHorizontal: 30,
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
