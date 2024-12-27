import React, { useContext, useEffect, useRef, useState } from 'react';
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
import axios from 'axios';
import { API, USER_ID, USER_PASSWORD } from '../../config/apiConfig';
import { isValidString } from '../../Helper/Helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encode as base64Encode } from 'base-64';
import { useDispatch } from 'react-redux';
import { setLoggedInUser, setUserRole } from '../../redux/actions/Actions';
import { ColorContext } from '../../components/colortheme/colorTheme';
import store from '../../redux/store/Store';



const ConfirmPassword = ({ route, ...props }) => {
    const { colors } = useContext(ColorContext);
    const styles = getStyles(colors);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [url, setUrl] = useState('');
    const [otpStr, setotpStr] = useState('');
    const [showPassword1, setshowPassword1] = useState(true);
    const [showPassword2, setshowPassword2] = useState(true);
    const dispatch = useDispatch();
    const [code, setCode] = useState('');
    const [roleMenu, setRoleMenu] = useState(null);



    useEffect(() => {
        if (route?.params) {
            console.log("props  ===> ", route.params);

            setEmail(route.params?.email);
            setotpStr(route.params?.otp);
            setUrl(route.params?.url);
            setCode(route.params?.serverCode);
        }

    }, []);

    const handleSetNewPassword = async () => {
        setLoading(true);
        if (!newPassword || !confirmNewPassword) {
            setLoading(false);
            Alert.alert('Alert', 'Please fill all the fields');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setLoading(false);
            Alert.alert('Alert', 'Passwords do not match. Please try again.');
            return;
        }
        if (newPassword.length <= 8) {
            setLoading(false);
            Alert.alert('Alert', 'Password must be at least 8 characters long.');
            return;
        }

        const reqBody = {
            emailId: email,
            otp: otpStr,
            password: newPassword,
            linkType: 2,
        };

        try {
            const apiUrl = url + API.RESET_PASSWORD;
            console.log("API URL ==> ", apiUrl);
            const response = await axios.post(apiUrl, reqBody);
            setLoading(false);
            console.log('API Response:', response?.data?.message);

            const res = response?.data?.message;

            if (res === "success") {
                Alert.alert('Alert', 'New password set successfully. Please wait Logging in...');
                handleRedirect(url);
                // navigation.navigate('Login');

            } else if (res === "mismatch") {
                Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
            } else if (res === "expired") {
                Alert.alert('Alert', 'This reset link has already been used or has expired');
            } else if (res === "not found") {
                Alert.alert('Alert', 'The provided email address is not found in the system');
            } else if (res === "error") {
                Alert.alert('Alert', 'An error occurred while processing your request. Please try again.');
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Alert', 'Woof! There seems to be a problem. Please try after sometime.');
        }
    }

    const handleRedirect = async (productURL) => {

        console.log("Started of redirect");
        console.log("Start process productURL ===> ", productURL)

        setLoading(true);
        const postData = new URLSearchParams();
        postData.append('username', email);
        postData.append('grant_type', 'password');
        postData.append('password', newPassword);
        const credentials = base64Encode(`${USER_ID}:${USER_PASSWORD}`);

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
        };
        console.log("call api for login ")
        try {
            const response = await axios.post(
                productURL + API.LOGIN,
                postData.toString(),
                {
                    headers,
                },
            );
            if (isValidString(response.data)) {
                console.log("validated response now call 3 fxns")
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

    const saveToken = async data => {
        console.log("saveToken==========>");
        const username = email;
        const password = newPassword;


        try {
            console.log('Saving token:', JSON.stringify(data));
            await AsyncStorage.setItem('userdata', JSON.stringify(data));
            await AsyncStorage.setItem('loggedIn', 'true');
            global.userData = data; // Ensure global userData is updated
            console.log('globaluserData', global.userData);
            if (true) {
                const existingCredentials =
                    JSON.parse(await AsyncStorage.getItem('credentials')) || [];

                const filteredCredentials = existingCredentials.filter(
                    (cred) => !(cred.username === username && cred.code === code)
                );

                const newCredential = { username, password, code };
                filteredCredentials.push(newCredential);
                console.log('Added new or updated credential');

                await AsyncStorage.setItem(
                    'credentials',
                    JSON.stringify(filteredCredentials)
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

    // const getUsers = async (userData, productURL) => {
    //     console.log('getUsers userData:', userData);
    //     const apiUrl = `${productURL}${API.ADD_USERS}/${userData.userId}`; // Update API URL to include dynamic
    //     console.log('apurl', apiUrl);
    //     try {
    //         const response = await axios.get(apiUrl, {
    //             headers: { Authorization: `Bearer ${userData.access_token}` },
    //         });
    //         const loggedInUser = response.data.response.users[0]; // Since response is expected to have only one user with given
    //         if (loggedInUser) {
    //             console.log('Logged in user:', loggedInUser);
    //             dispatch(setLoggedInUser(loggedInUser));
    //             dispatch(setUserRole(loggedInUser.role));
    //             await saveUserDataToStorage(loggedInUser);
    //             // const roles = loggedInUser.role;
    //             // let roleName = '';
    //             // let roleId = '';
    //             // for (const role of roles) {
    //             //   const name = role.role;
    //             //   if (name) {
    //             //     if (
    //             //       name === 'admin' ||
    //             //       name === 'Distributor' ||
    //             //       name === 'Retailer'
    //             //     ) {
    //             //       roleName = name;
    //             //       roleId = role.id;
    //             //       break;
    //             //     }
    //             //   }
    //             // }
    //             // if (roleName && roleId) {
    //             //   await saveRoleToStorage({roleName, roleId});
    //             // } 
    //             // else {
    //             //   Alert.alert(
    //             //     'Unauthorized role',
    //             //     'You do not have access to this application.',
    //             //   );
    //             // }
    //         } else {
    //             Alert.alert('No user data found', 'Failed to fetch user data.');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching user data:', error);
    //         Alert.alert(
    //             'Failed to fetch user data',
    //             'An error occurred while fetching user data.',
    //         );
    //     }
    // };


    const getUsers = async (userData, productURL) => {
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
  
      
    const saveUserDataToStorage = async userData => {
        try {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user data:', error);
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

    return (
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
                            source={require('../../../assets/loginbg.png')}
                        />
                    </View>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Set New Password</Text>
                        <View
                            style={[
                                styles.inputContainer,
                            ]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter New Password"
                                placeholderTextColor="#000"
                                onChangeText={text => setNewPassword(text)}
                                value={newPassword}
                                secureTextEntry={showPassword1}
                            />
                            <TouchableOpacity onPress={() => setshowPassword1(!showPassword1)}>
                                <Image
                                    source={!showPassword1 ? require('../../../assets/password.png') : require('../../../assets/lock.png')}
                                    style={styles.inputImage}
                                />
                            </TouchableOpacity>
                        </View>
                        <View
                            style={[
                                styles.inputContainer,
                            ]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#000"
                                onChangeText={text => setConfirmNewPassword(text)}
                                value={confirmNewPassword}
                                secureTextEntry={showPassword2}

                            />
                            <TouchableOpacity onPress={() => setshowPassword2(!showPassword2)}>
                                <Image
                                    source={!showPassword2 ? require('../../../assets/password.png') : require('../../../assets/lock.png')}
                                    style={styles.inputImage}
                                />
                            </TouchableOpacity>
                        </View>



                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSetNewPassword}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                        <View style={styles.line} />

                    </View>
                    <View style={{ justifyContent: 'flex-end', flex: 1, marginVertical: 10 }}>

                        <Text style={{ textAlign: 'center', color: "#000" }}>
                            All rights with Codeverse Technologies
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
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
    title1: {
        fontSize: 17,
        marginBottom: 30,
        color: '#390050',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        borderRadius: 5,
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
        width: 24,
        height: 24,
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: 'black',
        fontSize: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 10,
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
        backgroundColor:  colors.color2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10
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

    errorText: {
        color: 'red',
        marginBottom: 13,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    otpInput: {
        borderBottomWidth: 2,
        borderBottomColor: 'gray',
        textAlign: 'center',
        fontSize: 18,
        width: 40,
        marginHorizontal: 5,
    },
    otpInput1: {
        borderWidth: 2,
        borderColor: 'gray',
        textAlign: 'center',
        fontSize: 18,
        width: 40,
        marginHorizontal: 5,
        borderRadius: 10
    },
});

export default ConfirmPassword;


