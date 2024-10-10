import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const PersonalInfo =()=>{
    const [enterName, setEnterName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [alternateNumber, setAlternateNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [panNumber, setPanNumber] = useState('');

    const handleEnterYourName = text => {
        setEnterName(text);
    };

    const handleContactNumberChange = text => {
        setContactNumber(text);
    };
    
    const handleAlternateNumberChange = text => {
        setAlternateNumber(text);
    };
    
    const handleEmailAddressChange = text => {
        setEmailAddress(text);
    };
      
    const handlePanNumberChange = text => {
        setPanNumber(text);
    };

    return(
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.personalInfoContainer}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            style={[styles.profileImage, { tintColor: 'gray' }]}
                            source={require('../../../assets/profile.png')}
                        />
                        <Image
                            style={styles.cameraIconRight}
                            source={require('../../../assets/cam.png')}
                        />
                    </View>
                </TouchableOpacity>
                <View style={styles.contxt}>
                    <TextInput
                        placeholder="Enter Your Full Name"
                        placeholderTextColor="#000"
                        value={enterName}
                        onChangeText={handleEnterYourName}
                    />
                    <View style={styles.underlne} />
                </View>
                <View>
                    <View style={styles.contxt}>
                        <TextInput
                            placeholder="Mobile Number"
                            placeholderTextColor="#000"
                            value={contactNumber}
                            onChangeText={handleContactNumberChange}
                            keyboardType="numeric"
                        />
                        <View style={styles.underlne} />
                    </View>
                </View>
                <View>
                    <View style={styles.contxt}>
                        <TextInput
                            placeholder="Alternate Number"
                            placeholderTextColor="#000"
                            value={alternateNumber}
                            onChangeText={handleAlternateNumberChange}
                            keyboardType="numeric"
                        />
                        <View style={styles.underlne} />
                    </View>
                </View>
                <View>
                    <View style={styles.contxt}>
                        <TextInput
                            placeholder="Email Address"
                            placeholderTextColor="#000"
                            value={emailAddress}
                            onChangeText={handleEmailAddressChange}
                            keyboardType="email-address"
                        />
                        <View style={styles.underlne} />
                    </View>
                </View>
                <View>
                    <View style={styles.contxt}>
                        <TextInput
                            placeholder="PAN Number"
                            placeholderTextColor="#000"
                            value={panNumber}
                            onChangeText={handlePanNumberChange}
                        />
                        <View style={styles.underlne} />
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
        </View>
    )
}

const styles=StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    personalInfoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        height: 110,
        width: 110,
    },
    cameraIconRight: {
        height: 35,
        width: 35,
        position: 'absolute',
        top: 1,
        right: 1,
    },
    orgnmetxt: {
        marginLeft: 20,
    },
    contxt: {
        marginLeft: 20,
        marginTop: 10,
    },
    underlne: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginRight: 10,
    },
    apparelContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginHorizontal: 5,
        marginVertical: 10,
    },
    apparelButton: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 60,
        paddingVertical: 6,
        width: 120, // Set a fixed width for each button
        marginVertical: 5,
    },
    selectedApparel: {
        backgroundColor: '#390050', // Change to green when selected
    },
    updateButton: {
        borderWidth: 1,
        backgroundColor: 'gray',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingVertical: 20,
      },
      updateButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
      },
})

export default PersonalInfo;
