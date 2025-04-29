import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const CustomCheckBoxPickList = ({ 
  checked, 
  indeterminate, 
  disabled, 
  onChange,
  style
}) => {
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, style]}
    >
      <View style={[
        styles.checkbox, 
        checked && styles.checked,
        disabled && styles.disabled
      ]}>
        {checked && !indeterminate && (
          <Image 
            source={require('../../assets/check.png')} 
            style={styles.checkIcon} 
          />
        )}
        {indeterminate && !checked && (
          <View style={styles.indeterminateLine} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#3a7bd5',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checked: {
    backgroundColor: '#3a7bd5'
  },
  disabled: {
    borderColor: '#cccccc',
    backgroundColor: '#f0f0f0'
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff'
  },
  indeterminateLine: {
    width: 14,
    height: 2,
    backgroundColor: '#3a7bd5'
  }
});

export default CustomCheckBoxPickList;