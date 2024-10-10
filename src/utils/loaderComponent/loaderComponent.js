import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

const LoaderComponent = ({ loaderText, ...props }) => {

    const [lMsg, set_lMsg] = useState('');
    return (
        <View style={[styles.mainActivity, { zIndex: 999 }]}>
            <View style={styles.loaderBckViewStyle}>
                <ActivityIndicator size="large" color="#390050" />
                <Text style={styles.textStyle}>{loaderText}</Text>
            </View>
        </View>

    );
};

export default LoaderComponent;

const styles = StyleSheet.create({
    mainActivity: {
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'transparent',
        width: 400,
        height: 800,
    },
    textStyle: {
        fontWeight: 'normal',
        fontSize: 30,
        color: 'black',
        marginRight: 2,
        marginTop: 2,
        marginBottom: 2,
        textAlign: 'center',
        justifyContent: 'center'
    },
    loaderBckViewStyle: {
        width: 220,
        minHeight: 150,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#D3D3D3',
        borderRadius: 10
    },
});