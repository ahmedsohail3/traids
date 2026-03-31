/**
 * TrendChart — simple SVG line chart using react-native-svg (no heavy lib required).
 * Props:
 *   data   number[]   — y-values (e.g. [2,4,3,8,6,9,7])
 *   labels string[]   — x-axis labels (optional)
 *   color  string     — line color
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const WIDTH = 300;
const HEIGHT = 80;
const PADDING_X = 0;
const PADDING_Y = 8;

const buildPath = (data, w, h) => {
  if (!data || data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const range = max - min || 1;
  const step = (w - PADDING_X * 2) / (data.length - 1);

  const points = data.map((v, i) => ({
    x: PADDING_X + i * step,
    y: PADDING_Y + (1 - (v - min) / range) * (h - PADDING_Y * 2),
  }));

  // Smooth cubic bezier
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = (points[i - 1].x + points[i].x) / 2;
    const cp1y = points[i - 1].y;
    const cp2x = (points[i - 1].x + points[i].x) / 2;
    const cp2y = points[i].y;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${points[i].x} ${points[i].y}`;
  }
  return { linePath: d, points };
};

const TrendChart = ({ data = [], labels = [], color = '#10375C' }) => {
  const { colors } = useTheme();
  const result = buildPath(data, WIDTH, HEIGHT);

  if (!result || !result.linePath) return null;
  const { linePath, points } = result;

  // Fill area under curve
  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const fillPath = `${linePath} L ${lastPt.x} ${HEIGHT} L ${firstPt.x} ${HEIGHT} Z`;

  return (
    <View style={styles.container}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* Fill */}
        <Path d={fillPath} fill="url(#grad)" />
        {/* Line */}
        <Path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </Svg>
      {/* X-axis labels */}
      {labels.length > 0 && (
        <View style={styles.labelsRow}>
          {labels.map((l, i) => (
            <Text key={i} style={[styles.axisLabel, { color: colors.textSecondary }]}>{l}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  axisLabel: {
    fontSize: RFValue(9),
    fontFamily: FontFamily.regular,
  },
});

export default TrendChart;
