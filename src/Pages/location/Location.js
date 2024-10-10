import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const Location = () => {
  return (
    <View
      style={styles.container}>
      <Text>Location</Text>
    </View>
  );
};

const styles=StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#fff"
    }
})
export default Location;