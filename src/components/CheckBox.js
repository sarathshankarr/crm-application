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
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
  },
});

export default CustomCheckBox;
