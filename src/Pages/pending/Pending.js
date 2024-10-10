import React, { useEffect, useState } from "react";
import { Image, Text, View, TouchableOpacity } from "react-native";

const Pending = ({ route }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Check if route and route.params are defined
    if (route && route.params && route.params.cartItems) {
      // Update cartItems when route.params.cartItems changes
      setCartItems(route.params.cartItems);
    }
  }, [route.params]); // Only re-run effect if route.params changes

  // Calculate total quantity
  const totalQuantity = cartItems.reduce((total, item) => {
    return (
      total +
      parseInt(item.extraSmallQuantity || 0) +
      parseInt(item.smallQuantity || 0) +
      parseInt(item.mediumQuantity || 0) +
      parseInt(item.largeQuantity || 0) +
      parseInt(item.extralargeQuantity || 0) +
      parseInt(item.doublelargeQuantity || 0) +
      parseInt(item.triblelargeQuantity || 0) +
      parseInt(item.fivelargeQuantity || 0)
    );
  }, 0);

  const removeItem = (index) => {
    // Remove the item from the cartItems array using its index
    const updatedCartItems = [...cartItems];
    updatedCartItems.splice(index, 1);
    // Update the state with the new cartItems array
    setCartItems(updatedCartItems);
  };

  return (
    <View>
      {cartItems.map((item, index) => (
        <View style={{ borderWidth: 1, borderColor: '#000', marginHorizontal: 10, marginVertical: 10 }} key={index}>
          <Text style={{ marginHorizontal: 10 }}>Name: {item.styleName}</Text>
          <Text style={{ marginHorizontal: 10 }}>Price: {item.mrp}</Text>
          {/* Add more details to display */}
          {item.imageUrls && item.imageUrls.map((imageUrl, imgIndex) => (
            <Image key={imgIndex} source={{ uri: imageUrl }} style={{ width: 100, height: 100, marginHorizontal: 10, marginVertical: 10 }} />
          ))}
          <TouchableOpacity style={{ marginHorizontal: 10, marginVertical: 10 }} onPress={() => removeItem(index)}>
            <Text>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text>Total Quantity: {totalQuantity}</Text>
    </View>
  );
}

export default Pending;
