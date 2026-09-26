import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type IntroScreenProps = {
  onFinished: () => void;
};

const introLogo = require('../../assets/images/intro-logo-transparent.png');

export default function IntroScreen({ onFinished }: IntroScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 45, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]);

    animation.start(({ finished }) => {
      if (finished) onFinished();
    });
    return () => animation.stop();
  }, [onFinished, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={introLogo}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
        accessibilityLabel="Haushalt Inventory Intro"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ede8D0',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 210,
    width: 210,
  },
});
