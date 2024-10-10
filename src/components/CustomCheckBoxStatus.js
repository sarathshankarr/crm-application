import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';

const CustomCheckBoxStatus = ({ isChecked, onToggle, disabled, borderColor }) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      style={[
        styles.checkboxBase,
        { borderColor: borderColor || 'black' }, // Apply the border color here
      ]}
    >
      {isChecked && (
        <View style={styles.checkboxTick} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxBase: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTick: {
    width: 10,
    height: 10,
    backgroundColor: 'black', // Tick color
  },
});

export default CustomCheckBoxStatus;
