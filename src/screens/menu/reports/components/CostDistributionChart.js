import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import Svg, { Circle, G } from 'react-native-svg';
import { PieChart } from 'lucide-react-native';

const PALETTE = ['#10375C', '#F2A154', '#0EA5E9', '#64748B', '#CBD5E1', '#22C55E', '#F59E0B', '#EF4444'];

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

const fmtAmount = (n) => {
  if (n == null) return '£0';
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`;
  return `£${Number(n).toFixed(2)}`;
};

const fmtCenter = (n) => {
  if (n == null) return '£0';
  if (n >= 1000) return `£${(n / 1000).toFixed(0)}k`;
  return `£${Number(n).toFixed(0)}`;
};

const Donut = ({ items, total }) => {
  const size = 120;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <View style={styles.donutContainer}>
      <Svg width={size} height={size}>
        <G>
          {items.map((item, idx) => {
            const fraction = total > 0 ? item.value / total : 0;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const offset = currentOffset;
            currentOffset += fraction * circumference;

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
      <View style={styles.donutCenter}>
        <Text style={styles.donutCenterValue}>{fmtCenter(total)}</Text>
        <Text style={styles.donutCenterLabel}>Total</Text>
      </View>
    </View>
  );
};

const CostDistributionChart = ({ data }) => {
  const items = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map((entry, idx) => ({
      label:      capitalize(entry.trade),
      value:      entry.amount  ?? 0,
      percentage: entry.percentage != null ? `${entry.percentage}%` : null,
      color:      PALETTE[idx % PALETTE.length],
      display:    fmtAmount(entry.amount),
    }));
  }, [data]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.value, 0), [items]);

  const isEmpty = items.length === 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Cost Distribution</Text>
        <Text style={styles.subtitle}>Spend breakdown by trade category</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyWrap}>
          <PieChart size={32} color="#CBD5E1" />
          <Text style={styles.emptyText}>No cost distribution data yet.</Text>
        </View>
      ) : (
        <>
          <Donut items={items} total={total} />

          <View style={styles.list}>
            {items.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.itemLeft}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <View style={styles.itemRight}>
                  {item.percentage && (
                    <Text style={styles.itemPct}>{item.percentage}</Text>
                  )}
                  <Text style={styles.itemValue}>{item.display}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
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
  header:   { marginBottom: 20 },
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
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
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
  list:     { gap: 12 },
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
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#334155',
  },
  itemPct: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  itemValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
});

export default CostDistributionChart;
