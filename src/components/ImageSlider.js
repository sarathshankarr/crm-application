import React, { useContext, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { ColorContext } from './colortheme/colorTheme';

const ImageSlider = ({ fullImageUrls }) => {
  const { colors } = useContext(ColorContext);
  const styles = getStyles(colors);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  // Calculate dynamic card dimensions
  const isLandscape = width > height;
  const cardWidth = width; // Full screen width
  const cardHeight = isLandscape ? height * 0.8 : height / 2.3; // Adjust height for orientation

  return (
    <View style={[styles.sliderContainer, { height: cardHeight }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {fullImageUrls?.length > 0 ? (
          fullImageUrls.map((url, index) => (
            <View
              key={index}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: cardHeight,
                },
              ]}
            >
              <FastImage
                source={{ uri: url }}
                style={{ width: '80%', height: '80%',alignSelf:'center' }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          ))
        ) : (
          <View
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
            ]}
          >
            <FastImage
              source={require('../../assets/NewNoImage.jpg')}
              style={{ width: '80%', height: '80%' }}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.indicator}>
  {fullImageUrls?.map((_, i) => {
    // Calculate the input range for each dot
    const inputRange = [(i - 1) * cardWidth, i * cardWidth, (i + 1) * cardWidth];

    // Interpolate dot scale and color
    const dotScale = scrollX.interpolate({
      inputRange,
      outputRange: [1, 1.2, 1],
      extrapolate: 'clamp',
    });

    const dotColor = scrollX.interpolate({
      inputRange,
      outputRange: ['gray', colors.color2, 'gray'],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.dot,
          {
            transform: [{ scale: dotScale }], // Scale animation
            backgroundColor: dotColor, // Color animation
          },
        ]}
      />
    );
  })}
</View>

    </View>
  );
};



const getStyles = (colors) => StyleSheet.create({
  sliderContainer: {
    flex: 1,
    alignItems: 'center', // Center items horizontally
    justifyContent: 'center', // Center items vertically
  },
  card: {
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
    backgroundColor: colors.color2,
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
