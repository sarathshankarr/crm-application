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
import axios from 'axios';
import { API } from '../../config/apiConfig';
import { CUSTOMER_URL } from '../../config/apiConfig';
import { isValidString } from '../../Helper/Helper';


const MailConfirmation = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [url, setUrl] = useState('');


    const handleGetOtp = async () => {

        setLoading(true);

        if (code?.trim()?.length === 0 || email?.trim()?.length === 0) {
            Alert.alert('Alert', 'Please fill all the fields');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(CUSTOMER_URL + code);
            setLoading(false);
            console.log('API Response:', response?.data?.response?.url);

            if (isValidString(response?.data?.response?.url)) {
                const serverUrl = response?.data?.response?.url;
                setUrl(serverUrl);
                // navigation.navigate('EnterOtp', { email: email, serverId: serverUrl });
                handleCallAPI(serverUrl);
            } else {
                Alert.alert('Invalid Code', 'Please enter a valid customer code.');
            }
        } catch (error) {
            setLoading(false);
            if (error.response?.status === 400) {
                Alert.alert('Invalid Code', 'Please enter a valid customer code.');
            } else if ([502, 404].includes(error.response?.status)) {
                Alert.alert('Alert', 'Woof! There seems to be a problem. Please try after sometime.');
            } else {
                Alert.alert('Alert', 'Woof! There seems to be a problem. Please try after sometime.');
            }
        }
    }

    const handleCallAPI = async (serverUrl) => {
        setLoading(true);
        const reqBody = {
            emailId: email,
            server: serverUrl,
        };

        console.log("entered handlecallApi", serverUrl, reqBody);
        try {
            const apiUrl = serverUrl + API.REQUEST_OTP;
            console.log("API URL ====  >", apiUrl);
            const response = await axios.post(apiUrl, reqBody);
            setLoading(false);

            console.log('API Response:', response?.data?.message);
            const res = response?.data?.message;

            if (res === "success") {
                Alert.alert('Alert', 'The OTP has been successfully sent to the registered email address.');
                navigation.navigate('EnterOtp', { email: email, serverId: serverUrl });
            } else if (res === "not found") {
                Alert.alert('Alert', 'The provided email address is not found in the system.');
            } else if (res === "error") {
                Alert.alert('Alert', 'An error occurred while processing your request. Please try again.');
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Alert', 'Woof! There seems to be a problem. Please try after sometime.');
        }
    }


    return (

        <SafeAreaView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on the platform
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust this offset if necessary
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.imageContainer}>
                        <Image
                            style={{ height: 103, width: 103, marginTop: 30 }}
                            source={require('../../../assets/loginbg.png')}
                        />
                    </View>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Forget your Password</Text>

                        <View
                            style={[
                                styles.inputContainer,
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

                        <View
                            style={[
                                styles.inputContainer,
                            ]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#000"
                                onChangeText={text => setEmail(text)}
                                value={email}
                            />
                            <Image
                                source={require('../../../assets/email.png')}
                                style={styles.inputImage}
                            />
                        </View>


                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleGetOtp}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send OTP</Text>
                            )}
                        </TouchableOpacity>
                        <View style={styles.line} />

                    </View>
                    <View style={{ justifyContent: 'flex-end', flex: 1, marginVertical: 10 }}>

                        <Text style={{ textAlign: 'center', color: "#000" }}>
                            All rights with Codeverse Technologies
                        </Text>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </SafeAreaView>

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
        paddingHorizontal: 10,
        paddingVertical: Platform.OS === 'ios' ? 8 : 0,
        marginVertical: 10,
        // backgroundColor: '#D9D9D947',
        borderWidth: 2,
        borderColor: '#D9D9D9',
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

    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#1F74BA',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 15,
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

export default MailConfirmation;

