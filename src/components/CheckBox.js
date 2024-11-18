// CustomCheckBox.js
import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const CustomCheckBox = ({ isChecked, onToggle }) => {
  return (
    <TouchableOpacity style={styles.checkBoxContainer} onPress={onToggle}>
      {isChecked ? (
        <Image source={require('../../assets/check.png')} style={styles.checkbox} />
      ) : (
        <Image source={require('../../assets/check-box-empty.png')} style={styles.checkbox} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkBoxContainer: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  checkbox: {
    backgroundColor:'lightgray',
    width: 25,
    height: 25,
  },
});

export default CustomCheckBox;
