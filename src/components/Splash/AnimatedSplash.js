/**
 * AnimatedSplash — the JS-rendered handoff from the native BootSplash screen.
 *
 * `useHideAnimation` renders a pixel-accurate clone of the native splash (same
 * manifest, so the switch from native → JS is invisible), and calls
 * `BootSplash.hide()` for us as soon as it mounts. We keep that clone on
 * screen — with the loading dots from the Figma splash added below the logo —
 * until `ready` (app init actually finished), then fade out into the app.
 *
 * Figma: light https://figma.com/design/do3IFFhZDeCeIkY3BFSwiE?node-id=2374-2823
 *        dark  https://figma.com/design/do3IFFhZDeCeIkY3BFSwiE?node-id=2373-1423
 */
import {useRef} from 'react';
import {Animated, Image, View, useColorScheme} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import LoadingDots from './LoadingDots';

const manifest = require('../../assets/bootsplash/manifest.json');
const logo = require('../../assets/bootsplash/logo.png');
const darkLogo = require('../../assets/bootsplash/dark-logo.png');

const FADE_DURATION = 350;

const AnimatedSplash = ({ready, onAnimationEnd}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const isDark = useColorScheme() === 'dark';

  const {container, logo: logoProps} = BootSplash.useHideAnimation({
    ready,
    manifest,
    logo,
    darkLogo,
    animate: () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(onAnimationEnd);
    },
  });

  return (
    <Animated.View {...container} style={[container.style, {opacity}]}>
      <Image {...logoProps} />
      <View style={{marginTop: 24}}>
        <LoadingDots color={isDark ? '#FFFFFF' : '#10375C'} />
      </View>
    </Animated.View>
  );
};

export default AnimatedSplash;
