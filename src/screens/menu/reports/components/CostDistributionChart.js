import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import Svg, { Circle, G } from 'react-native-svg';

const FALLBACK_DATA = [
  { label: 'Electrical', value: 35000, color: '#10375C', display: '£35.0k' },
  { label: 'Plumbing',   value: 22000, color: '#F2A154', display: '£22.0k' },
  { label: 'HVAC',       value: 18000, color: '#0EA5E9', display: '£18.0k' },
  { label: 'Carpentry',  value: 12500, color: '#64748B', display: '£12.5k' },
  { label: 'Masonry',    value: 8500,  color: '#CBD5E1', display: '£8.5k' },
];
const FALLBACK_TOTAL = 96000;

// Render basic donut by accumulating strokeDashoffsets
const Donut = ({ items, total }) => {
  const size = 120;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerLabel = total >= 1000 ? `${(total / 1000).toFixed(0)}k` : String(total);

  let currentOffset = 0;

  return (
    <View style={styles.donutContainer}>
      <Svg width={size} height={size}>
        <G>
          {items.map((item, idx) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const offset = currentOffset;
            currentOffset += (item.value / total) * circumference;

            return (
              <Circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={circumference / 4 - offset}
                fill="transparent"
              />
            );
          })}
        </G>
      </Svg>
      {/* Center Text */}
      <View style={styles.donutCenter}>
        <Text style={styles.donutCenterValue}>{centerLabel}</Text>
        <Text style={styles.donutCenterLabel}>Total</Text>
      </View>
    </View>
  );
};

const CostDistributionChart = ({ data }) => {
  const items = (data?.items && data.items.length > 0) ? data.items : FALLBACK_DATA;
  const total = data?.total ?? FALLBACK_TOTAL;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Cost Distribution</Text>
        <Text style={styles.subtitle}>spend breakdown by trade category</Text>
      </View>

      <Donut items={items} total={total} />

      <View style={styles.list}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.itemLeft}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.itemLabel}>{item.label}</Text>
            </View>
            <Text style={styles.itemValue}>{item.display}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(16),
    color: '#10375C',
  },
  donutCenterLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#334155',
  },
  itemValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
});

export default CostDistributionChart;
