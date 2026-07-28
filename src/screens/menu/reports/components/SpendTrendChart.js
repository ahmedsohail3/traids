import { View, StyleSheet } from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { BarChart2 } from 'lucide-react-native';

const CHART_HEIGHT = 120;

const Bars = ({ data }) => {
  const MAX_VALUE = Math.max(...data.map(i => (i.labor ?? 0) + (i.materials ?? 0)), 1);
  const step   = Math.ceil(MAX_VALUE / 4 / 1000) * 1000 || 1;
  const Y_AXIS = [step * 4, step * 3, step * 2, step, 0];

  return (
    <View style={styles.chartArea}>
      <View style={styles.yAxis}>
        {Y_AXIS.map(val => (
          <Text key={val} style={styles.yAxisText}>{val === 0 ? '0' : val >= 1000 ? `${val / 1000}k` : val}</Text>
        ))}
      </View>

      <View style={styles.barsContainer}>
        <View style={styles.gridLines}>
          {Y_AXIS.map(val => (
            <View key={`grid-${val}`} style={styles.gridLine} />
          ))}
        </View>

        <View style={styles.barsArea}>
          {data.map((item, idx) => {
            const laborHeight    = ((item.labor    ?? 0) / MAX_VALUE) * CHART_HEIGHT;
            const materialHeight = ((item.materials ?? 0) / MAX_VALUE) * CHART_HEIGHT;
            return (
              <View key={idx} style={styles.barCol}>
                <View style={styles.barStack}>
                  <View style={[styles.segment, { height: materialHeight, backgroundColor: '#F2A154' }]} />
                  <View style={[styles.segment, { height: laborHeight,    backgroundColor: '#10375C' }]} />
                </View>
                <Text style={styles.xLabel}>{item.month}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const SpendTrendChart = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Spend Trend</Text>
        {hasData && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10375C' }]} />
              <Text style={styles.legendText}>Labor</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F2A154' }]} />
              <Text style={styles.legendText}>Materials</Text>
            </View>
          </View>
        )}
      </View>

      {hasData ? (
        <Bars data={data} />
      ) : (
        <View style={styles.emptyWrap}>
          <BarChart2 size={32} color="#CBD5E1" />
          <Text style={styles.emptyText}>No spend trend data yet.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    paddingRight: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  legend: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#64748B',
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
  chartArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT + 20,
  },
  yAxis: {
    justifyContent: 'space-between',
    height: CHART_HEIGHT,
    paddingRight: 8,
  },
  yAxisText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(8),
    color: '#94A3B8',
    textAlign: 'right',
    width: 30,
  },
  barsContainer: {
    flex: 1,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    height: CHART_HEIGHT,
  },
  gridLine: { height: 1, backgroundColor: '#F1F5F9' },
  barsArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT + 20,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  barCol: { alignItems: 'center', width: 28 },
  barStack: {
    width: 14,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  segment: { width: '100%' },
  xLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#64748B',
  },
});

export default SpendTrendChart;
