/**
 * GradientBackground
 *
 * Fills its own bounds with a horizontal linear gradient, drawn with
 * react-native-svg (the project has no gradient dependency). Children render on
 * top. Used for the AI Help Assistant surfaces — FAB, bot avatars and the user
 * message bubble — which all share AI_GRADIENT.
 */
import { useId } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

/** Pink → indigo → blue, left to right (Figma: AI Help Assistant). */
export const AI_GRADIENT = ['#E86BAF', '#3A3FD4', '#4D8BE8'];

const GradientBackground = ({ colors = AI_GRADIENT, style, children }) => {
  // Gradient ids must be unique per SVG document and url(#id) rejects colons.
  const gradientId = `grad${useId().replace(/:/g, '')}`;

  return (
    <View style={style}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            {colors.map((color, i) => (
              <Stop
                key={`${color}-${i}`}
                offset={colors.length > 1 ? i / (colors.length - 1) : 0}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      {children}
    </View>
  );
};

export default GradientBackground;
