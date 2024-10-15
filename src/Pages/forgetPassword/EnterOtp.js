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
import { API } from '../../config/apiConfig';
import axios from 'axios';


const EnterOtp = ({ route, ...props }) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timer, setTimer] = useState(30);
    const [email, setEmail] = useState('');
    const [url, setUrl] = useState('');
    const [selection, setSelection] = useState({ start: 0, end: 1 });


    const inputRefs = useRef([]);


    useEffect(() => {
        if (route?.params) {
            console.log("route.params  ===> ", route.params);

            setEmail(route.params?.email);
            setUrl(route.params?.serverId);
        }

    }, []);

    const handleConfirmOtp = async () => {

        const isOtpComplete = otp.every((digit) => digit !== '');

        if (!isOtpComplete) {
            Alert.alert('Alert', 'Incomplete OTP.');
            return;
        }

        const otpStr = otp.join('');

        const reqBody = {
            emailId: email,
            otp: otpStr,
        };

        try {
            const apiUrl = url + API.CONFIRM_OTP;
            console.log("API URL ==> ", apiUrl, reqBody);
            const response = await axios.post(apiUrl, reqBody);

            setLoading(false);


            console.log('API Response:', response?.data?.message);
            // console.log('API Response:', response?.data?.message);

            const res = response?.data?.message;

            if (res === "success") {
                // Alert.alert('Alert', 'The OTP has been successfully sent to the registered email address.');
                navigation.navigate('ConfirmPassword', { email: email, otp: otpStr, url: url });

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
            console.log("error ==> ", error)
            Alert.alert('Alert', 'Woof! There seems to be a problem. Please try after sometime.');
        }
    };

    const handleResendOtp = async () => {
        setResendDisabled(true);
        setTimer(60);
        const reqBody = {
            emailId: email,
            server: url,
        };
        try {
            const apiUrl = url + API.REQUEST_OTP;
            console.log("API URL====> ", apiUrl, reqBody);
            const response = await axios.post(apiUrl, reqBody);
            setLoading(false);
            console.log('API Response:', response?.data?.message);

            const res = response?.data?.message;

            if (res === "success") {
                Alert.alert('Alert', 'The OTP has been successfully sent to the registered email address.');
            } else if (res === "not found") {
                Alert.alert('Alert', 'The provided email address is not found in the system.');
            } else if (res === "error") {
                Alert.alert('Alert', 'An error occurred while processing your request. Please try again.');
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Alert', 'Woof! There seems to be a problem. Please try after sometime.');
        }
    };

    useEffect(() => {
        let interval;
        if (resendDisabled) {
            interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        setResendDisabled(false);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendDisabled]);

    const handleChange = (text, index) => {
        let newOtp = [...otp];
        // newOtp[index] = text;
        newOtp[index] = text.charAt(0);

        setOtp(newOtp);

        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        } else if (text === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }


    };

    const handleFocus = (index) => {
        setSelection({ start: 0, end: 1 });
        inputRefs.current[index].setNativeProps({
            selection: { start: 0, end: 1 },
        });
    };


    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleTest = () => {
        Alert.alert("Clicked Resend");
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
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
                        <Text style={styles.title}>Please enter the verification code sent to your email</Text>

                        <View style={styles.otpContainer}>
                            {otp.map((value, index) => (
                                <TextInput
                                    key={index}
                                    style={styles.otpInput}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    value={value}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    onFocus={() => handleFocus(index)}
                                    selection={selection}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                />
                            ))}
                        </View>

                        {/* Resend Button with Countdown */}
                        <TouchableOpacity
                            style={[styles.resendButton, resendDisabled && styles.disabledButton]}
                            onPress={handleResendOtp}
                            // onPress={handleTest}
                            disabled={resendDisabled}
                        >
                            <Text style={styles.resendText}>
                                {resendDisabled ? `Resend in ${timer}s` : 'Resend Code'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleConfirmOtp}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Confirm</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.line} />
                    </View>
                    <View style={{ justifyContent: 'flex-end', flex: 1, marginVertical: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#000' }}>
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
        fontSize: 20,
        marginBottom: 30,
        color: '#390050',
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        marginTop: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    otpInput: {
        borderWidth: 2,
        borderColor: 'gray',
        textAlign: 'center',
        fontSize: 18,
        width: 40,
        marginHorizontal: 5,
        borderRadius: 10,
    },
    resendButton: {
        marginVertical: 10,
        alignItems: 'center',
    },
    resendText: {
        color: '#1F74BA',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
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
});

export default EnterOtp;
