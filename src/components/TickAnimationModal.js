import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

const TickAnimationModal = ({ isVisible, onClose, punchStatus, currentTime, currentDate, currentDay }) => {
  const rotation = useSharedValue(0); // Controls tick rotation
  const scale = useSharedValue(0); // Controls scaling of the circle and tick

  useEffect(() => {
    if (isVisible) {
      rotation.value = withTiming(360, { duration: 1000, easing: Easing.linear });
      scale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    }
  }, [isVisible]);

  const animatedTickStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Determine the message based on the punch status
  const message = punchStatus === 'in'
    ? "You've punched in! Let's get going. 🎉"
    : "You've punched out! See you later. 👋";

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        
        <View style={styles.modalContainer}>
        <Animated.View style={[styles.circleContainer, animatedScaleStyle]}>
            <Svg width={100} height={100} viewBox="0 0 100 100">
              <Circle cx="50" cy="50" r="45" stroke="green" strokeWidth="5" fill="green" />
            </Svg>

            {/* Animated Tick inside the circle */}
            <Animated.View style={[styles.tickContainer, animatedTickStyle]}>
              <Svg width={50} height={50} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M20 6L9 17l-5-5" />
              </Svg>
            </Animated.View>
          </Animated.View>
          <Text style={styles.hurrayText}>All Done 😊</Text>
          <Text style={styles.subText}>{message}</Text>
          
          <View style={{flexDirection:"row",justifyContent:"space-between"}}>
            <Text style={{color:"#000"}}>Date</Text>
            <Text style={{marginRight:45,color:"#000"}}>Time</Text>
          </View>
          {/* Display current date and time */}
          <View style={{flexDirection:"row",justifyContent:"space-between",marginVertical:5}}>
          <Text style={styles.dateText}>{`${currentDate}`}</Text>
          <Text style={styles.timeText}>{currentTime}</Text>
          </View>
          <View style={{marginVertical:10}}>
            <Text style={{color:"#000"}}>Day</Text>
            <Text style={{color:"#000"}}>{`${currentDay}`}</Text>
          </View>

          {/* Circle with animation */}
         
        </View>
      </View>
    </Modal>
  );
};



const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Transparent background
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
  },
  hurrayText: {
    fontSize: 20,
    color: 'green',
    fontWeight: 'bold',
    marginVertical:15,
    alignSelf:"center",
    color:"#000"
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    alignSelf:'center',
    color:"#000"
  },
  circleContainer: {
    position: 'relative', // Container for both circle and tick
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf:"center",
  },
  tickContainer: {
    position: 'absolute', // Position the tick inside the circle
    top: 25, // Adjust to center the tick properly inside the circle
    left: 25, // Adjust to center the tick horizontally
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText:{
    color:"#000"
  },
  timeText:{
    color:"#000"
  }
});

export default TickAnimationModal;
