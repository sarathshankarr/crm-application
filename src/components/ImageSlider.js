import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');
const cardWidth = width - 20;
const cardMargin = (width - cardWidth) / 2;

const ImageSlider = ({ fullImageUrls }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.sliderContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {fullImageUrls?.length > 0 ? (
          fullImageUrls.map((url, index) => (
            <View key={index} style={styles.card}>
              <FastImage 
                source={{ uri: url }} 
                style={styles.image}
                resizeMode={FastImage.resizeMode.contain}
                onLoadStart={() => {
                  // Optionally show a placeholder while loading
                  console.log('Image loading started');
                }}
                onLoad={() => {
                  // Handle the image load success if needed
                  console.log('Image loaded:', url);
                }}
              />
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <FastImage 
              source={require('../../assets/NewNoImage.jpg')} // Placeholder image
              style={styles.image}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.indicator}>
        {fullImageUrls?.map((_, i) => {
          const translateX = scrollX.interpolate({
            inputRange: [
              (i - 1) * width,
              i * width,
              (i + 1) * width,
            ],
            outputRange: [0, 10, 0],
            extrapolate: 'clamp',
          });

          return (
            <View key={i} style={styles.dot}>
              <Animated.View
                style={[
                  styles.animatedDot,
                  { transform: [{ translateX }] },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  sliderContainer: {
    marginVertical: height / 50,
  },
  card: {
    width: cardWidth,
    height: height / 2.3,
    marginHorizontal: cardMargin,
    borderRadius: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  indicator: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  dot: {
    height: 10,
    width: 10,
    backgroundColor: '#F09120',
    borderRadius: 5,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  animatedDot: {
    height: 10,
    width: 10,
    backgroundColor: 'gray',
    position: 'absolute',
  },
});

export default ImageSlider;

