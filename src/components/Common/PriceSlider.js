/**
 * PriceSlider
 *
 * Props:
 *   title       string   — label shown in the header row
 *   icon        Lucide   — optional icon rendered left of the title
 *   iconColor   string   — icon tint (default '#F2A154')
 *   min         number   — minimum value (default 0)
 *   max         number   — maximum value (default 1000)
 *   step        number   — snap increment (default 1)
 *   value       number   — controlled current value
 *   onChange    fn       — called with new number on every move
 *   prefix      string   — currency / unit prefix (default '£')
 *   minLabel    string   — override left label (default prefix+min)
 *   maxLabel    string   — override right label (default prefix+max+'+')
 */
import { useRef, useCallback } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const THUMB_SIZE   = RFValue(18);
const THUMB_RADIUS = THUMB_SIZE / 2;
const TRACK_HEIGHT = RFValue(4);
const NAVY         = '#10375C';
const TRACK_BG     = '#E2E8F0';

const PriceSlider = ({
  title,
  icon: Icon,
  iconColor = '#F2A154',
  min = 0,
  max = 1000,
  step = 1,
  value,
  onChange,
  prefix = '£',
  minLabel,
  maxLabel,
}) => {
  const trackWidth = useRef(0);
  const thumbX     = useRef(new Animated.Value(0)).current;
  const currentX   = useRef(0); // pixel snapshot — avoids reading private _value
  const startX     = useRef(0);

  // ── Converters ───────────────────────────────────────────────────────────────
  const valueToX = (v) =>
    trackWidth.current * ((Math.max(min, Math.min(max, v)) - min) / (max - min));

  const xToValue = (x) => {
    const ratio = trackWidth.current > 0 ? x / trackWidth.current : 0;
    const raw   = min + ratio * (max - min);
    return Math.max(min, Math.min(max, Math.round(raw / step) * step));
  };

  // ── Track layout ─────────────────────────────────────────────────────────────
  const onLayout = useCallback(
    (e) => {
      const w = e.nativeEvent.layout.width;
      if (w > 0 && w !== trackWidth.current) {
        trackWidth.current = w;
        const x = valueToX(value);
        thumbX.setValue(x);
        currentX.current = x;
      }
    },
    [value], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Gesture ──────────────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,

      onPanResponderGrant: (e) => {
        // Tap-to-jump: position thumb at touch point immediately
        const tapX = Math.max(0, Math.min(trackWidth.current, e.nativeEvent.locationX));
        thumbX.setValue(tapX);
        currentX.current = tapX;
        startX.current   = tapX;
        onChange(xToValue(tapX));
      },

      onPanResponderMove: (_, { dx }) => {
        const newX = Math.max(0, Math.min(trackWidth.current, startX.current + dx));
        thumbX.setValue(newX);
        currentX.current = newX;
        onChange(xToValue(newX));
      },
    }),
  ).current;

  // ── Derived animated styles ───────────────────────────────────────────────────
  // Fill width = thumbX (pixels from left edge)
  // Thumb translate = thumbX − THUMB_RADIUS so its centre sits at thumbX
  const thumbTranslateX = Animated.subtract(thumbX, THUMB_RADIUS);

  return (
    <View>
      {/* Title row */}
      <View style={styles.titleRow}>
        {Icon && <Icon size={RFValue(14)} color={iconColor} strokeWidth={2} />}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.currentValue}>
          {prefix}{value.toLocaleString()}
        </Text>
      </View>

      {/* Slider track + thumb */}
      <View
        style={styles.trackWrapper}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {/* Background track */}
        <View style={styles.trackBg} pointerEvents="none" />
        {/* Fill */}
        <Animated.View style={[styles.fill, { width: thumbX }]} pointerEvents="none" />
        {/* Thumb */}
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX: thumbTranslateX }] }]}
          pointerEvents="none"
        />
      </View>

      {/* Min / Max labels */}
      <View style={styles.labelsRow}>
        <Text style={styles.rangeLabel}>{minLabel ?? `${prefix}${min.toLocaleString()}`}</Text>
        <Text style={styles.rangeLabel}>{maxLabel ?? `${prefix}${max.toLocaleString()}+`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: NAVY,
  },
  currentValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: NAVY,
  },

  // The wrapper gives enough vertical height for the thumb to render
  // without clipping, and is the gesture target
  trackWrapper: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: TRACK_BG,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: NAVY,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_RADIUS,
    backgroundColor: NAVY,
    // Subtle shadow for depth
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rangeLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
});

export default PriceSlider;
