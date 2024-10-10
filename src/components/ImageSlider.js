import React, {useRef} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const {width, height} = Dimensions.get('window');
const cardWidth = width - 20;
const cardMargin = (width - cardWidth) / 2;

const ImageSlider = ({imageUrls}) => {
  const animate = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: animate}}}],
          {useNativeDriver: false},
        )}>
        {imageUrls.map((url, index) => (
          <View key={index} style={styles.card}>
            <Image source={{uri: url}} style={styles.image} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicator}>
        {imageUrls.map((_, i) => {
          const translateX = animate.interpolate({
            inputRange: [-width + i * width, width * i, width + i * width],
            outputRange: [-20, 0, 20],
          });

          return (
            <View key={i} style={styles.dot}>
              <Animated.View
                style={[
                  styles.animatedDot,
                  {transform: [{translateX: translateX}]},
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
  container: {
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
    backgroundColor: '#fff',
    borderRadius: 5,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  animatedDot: {
    height: 10,
    width: 10,
    backgroundColor: 'green',
    position: 'absolute',
  },
});

export default ImageSlider;
