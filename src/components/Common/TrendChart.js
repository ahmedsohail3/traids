/**
 * TrendChart — SVG line chart with Y-axis labels.
 * Props:
 *   data   number[]   — y-values (e.g. [2,4,3,8,6,9,7])
 *   labels string[]   — x-axis labels (optional)
 *   color  string     — line color
 */
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const SVG_W       = 300;
const SVG_H       = 80;
const PAD_Y       = 8;
const Y_AXIS_W    = 28;

const formatVal = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(Math.round(n));
};

const buildPath = (data) => {
  if (!data || data.length < 2) return null;
  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min;
  const step  = SVG_W / (data.length - 1);

  const toY = (v) => {
    if (range === 0) return SVG_H / 2; // flat → centre
    return PAD_Y + (1 - (v - min) / range) * (SVG_H - PAD_Y * 2);
  };

  const points = data.map((v, i) => ({ x: i * step, y: toY(v) }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cpx = (points[i - 1].x + points[i].x) / 2;
    d += ` C ${cpx} ${points[i - 1].y} ${cpx} ${points[i].y} ${points[i].x} ${points[i].y}`;
  }
  return { linePath: d, points, min, max };
};

const TrendChart = ({ data = [], labels = [], color = '#10375C' }) => {

  const { colors } = useTheme();
  const result = buildPath(data);

  if (!result) return null;
  const { linePath, points, min, max } = result;

  const mid      = (min + max) / 2;
  const lastPt   = points[points.length - 1];
  const fillPath = `${linePath} L ${lastPt.x} ${SVG_H} L ${points[0].x} ${SVG_H} Z`;

  return (
    <View style={styles.outer}>
      {/* SVG row: Y-axis labels + chart */}
      <View style={styles.svgRow}>
        <View style={styles.yAxis}>
          <Text style={[styles.yLabel, { color: colors.textSecondary }]}>{formatVal(max)}</Text>
          <Text style={[styles.yLabel, { color: colors.textSecondary }]}>{formatVal(mid)}</Text>
          <Text style={[styles.yLabel, { color: colors.textSecondary }]}>{formatVal(min)}</Text>
        </View>

        <View style={styles.chartArea}>
          <Svg
            width="100%"
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <Stop offset="100%" stopColor={color} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path d={fillPath} fill="url(#grad)" />
            <Path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </View>

      {/* X-axis labels — offset to align with chart area, not Y-axis */}
      {labels.length > 0 && (
        <View style={[styles.xAxis, { paddingLeft: Y_AXIS_W }]}>
          {labels.map((l, i) => (
            <Text key={i} style={[styles.xLabel, { color: colors.textSecondary }]}>
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { width: '100%' },

  svgRow: { flexDirection: 'row', alignItems: 'flex-start' },

  yAxis: {
    width: Y_AXIS_W,
    height: SVG_H,           // locked to SVG height so space-between aligns correctly
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
    paddingVertical: PAD_Y,  // mirrors the SVG's internal top/bottom padding
  },
  yLabel: {
    fontSize: RFValue(8),
    fontFamily: FontFamily.regular,
    lineHeight: RFValue(10),
  },

  chartArea: { flex: 1 },

  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  xLabel: {
    fontSize: RFValue(9),
    fontFamily: FontFamily.regular,
  },
});

export default TrendChart;
