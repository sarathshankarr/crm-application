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
  const { width, height } = useWindowDimensions(); // Dynamically get dimensions

  // Calculate cardWidth based on orientation
  const isLandscape = width > height;
  const cardWidth = isLandscape ? width - 175 : width - 40; // Dynamic card width
  const cardMargin = 20; // Equal margin on both sides
  const totalCardWidth = cardWidth + 2 * cardMargin; // Total width including margin

  return (
    <View style={[styles.sliderContainer, { height: height / 2 }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
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
                  height: height / 2.3,
                  marginHorizontal: cardMargin,
                },
              ]}
            >
              <FastImage
                source={{ uri: url }}
                style={styles.image}
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
                height: height / 2.3,
                marginHorizontal: cardMargin,
              },
            ]}
          >
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
              (i - 1) * totalCardWidth,
              i * totalCardWidth,
              (i + 1) * totalCardWidth,
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
