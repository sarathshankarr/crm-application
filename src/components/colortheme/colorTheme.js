import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

const ColorContext = createContext();

const ColorProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [colors, setColors] = useState({
    color2: '#1F74BA', 
    lightcolor: '#9DE4DC',
    color3: '#DDD', 
    color4: '#007167', 
    color5: '#DDD', 
  });

  

useEffect(() => {
  const getColorfromStorage = async () => {
    try {
      const ThemeColor = await AsyncStorage.getItem('ThemeColor');
      if (ThemeColor) {
        const parsedColors = JSON.parse(ThemeColor);
        setColors(parsedColors.Colors);
      }
    } catch (error) {
      console.error("Failed to load theme color from AsyncStorage", error);
    } finally {
      setIsLoading(false); 
    }
  };

  getColorfromStorage();
}, []);

  const updateColor = (key, value) => {
    setColors((prevColors) => ({
      ...prevColors,
      [key]: value,
    }));
  };

  const updateAllColors = (newColors) => {
    setColors(newColors);
  };

  return (
    <ColorContext.Provider value={{ colors, updateColor,updateAllColors }}>
      {children}
    </ColorContext.Provider>
  );
};

export { ColorContext, ColorProvider };