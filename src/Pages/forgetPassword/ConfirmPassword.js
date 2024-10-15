import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API } from '../../config/apiConfig';


const ConfirmPassword = ({ route, ...props }) => {
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


    useEffect(() => {
        if (route?.params) {
            console.log("props  ===> ", route.params);

            setEmail(route.params?.email);
            setotpStr(route.params?.otp);
            setUrl(route.params?.url);
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
        };

        try {
            const apiUrl = url + API.RESET_PASSWORD;
            console.log("API URL ==> ", apiUrl);
            const response = await axios.post(apiUrl, reqBody);
            setLoading(false);
            console.log('API Response:', response?.data?.message);

            const res = response?.data?.message;

            if (res === "success") {
                Alert.alert('Alert', 'New password set successfully. Please log in again.');
                navigation.navigate('Login');

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

    return (
        <KeyboardAvoidingView
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
        </KeyboardAvoidingView>
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


