import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

// How much of the keyboard we let the safe-area/nav-bar region cover before we
// bother adding padding for it. Absorbed-height reports are a few px off.
const TOLERANCE = 8;

/**
 * Keyboard avoidance that cannot double-compensate.
 *
 * The problem this solves: `adjustResize` (plus forced edge-to-edge on Android)
 * shrinks the window for the keyboard *sometimes*. Adding a keyboard-height
 * margin unconditionally — or stacking KeyboardAvoidingView on top of a manual
 * listener — lifts the content by two keyboard heights whenever the resize does
 * happen, leaving a keyboard-sized blank block above the keyboard.
 *
 * So instead of trusting either mechanism, we measure: `onLayout` records the
 * height of the view with the keyboard closed, and whatever that view loses when
 * the keyboard opens is height the platform already handled. We pad only the
 * difference, which is the full keyboard height when nothing resized and 0 when
 * the window resized fully.
 *
 * Usage:
 *   const { keyboardInset, onLayout } = useKeyboardInset();
 *   <View style={styles.fill} onLayout={onLayout}>            // must be the view that shrinks
 *     <View style={[styles.card, { marginBottom: keyboardInset + gap }]} />
 *   </View>
 */
const useKeyboardInset = (bottomInset = 0) => {
  const [inset,   setInset]   = useState(0);
  const [visible, setVisible] = useState(false);

  const kbHeightRef  = useRef(0); // current keyboard height, 0 when closed
  const layoutRef    = useRef(0); // latest measured height of the tracked view
  const baselineRef  = useRef(0); // its height with the keyboard closed

  const resolve = useCallback(() => {
    const kbHeight = kbHeightRef.current;
    setVisible(kbHeight > 0);
    if (kbHeight === 0) return setInset(0);

    // Height the platform already took away from us (window resize).
    const absorbed  = Math.max(0, baselineRef.current - layoutRef.current);
    // The keyboard also covers the bottom safe area / nav bar, so that space
    // stops needing its own gap once anything is absorbed.
    const remaining = kbHeight - absorbed - (absorbed > 0 ? bottomInset : 0);

    setInset(remaining > TOLERANCE ? remaining : 0);
  }, [bottomInset]);

  const onLayout = useCallback(
    ({ nativeEvent }) => {
      const height = nativeEvent.layout.height;
      if (height === layoutRef.current) return;
      layoutRef.current = height;

      // With the keyboard closed this is the unshrunk height — our reference.
      if (kbHeightRef.current === 0) baselineRef.current = height;
      resolve();
    },
    [resolve],
  );

  useEffect(() => {
    // iOS never resizes the window, and `will*` events let us move with the
    // keyboard animation. Android's `did*` events fire after the resize has
    // already been laid out, which is exactly when we can measure it.
    const isIOS = Platform.OS === 'ios';

    const onShow = (e) => {
      // On iOS use the frame position: `height` stays at full size even on
      // frame changes that push the keyboard partly/fully offscreen.
      kbHeightRef.current = isIOS
        ? Math.max(0, Dimensions.get('window').height - e.endCoordinates.screenY)
        : e.endCoordinates.height;
      resolve();
    };

    const onHide = () => {
      kbHeightRef.current = 0;
      // The window is about to grow back; re-baseline off the next layout.
      resolve();
    };

    const subs = isIOS
      ? [
          Keyboard.addListener('keyboardWillChangeFrame', onShow),
          Keyboard.addListener('keyboardWillHide', onHide),
        ]
      : [
          Keyboard.addListener('keyboardDidShow', onShow),
          Keyboard.addListener('keyboardDidHide', onHide),
        ];

    return () => subs.forEach((s) => s.remove());
  }, [resolve]);

  // `keyboardVisible` matters separately from `keyboardInset`: when the window
  // resized fully the inset is 0, but a gap above the keyboard is still wanted.
  return { keyboardInset: inset, keyboardVisible: visible, onLayout };
};

export default useKeyboardInset;
