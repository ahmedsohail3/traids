import {View, StyleSheet, RefreshControl} from 'react-native';
import {ScrollView, Text} from '~components/Common';
import Header from '~components/Header';
import Svg, {Polyline} from 'react-native-svg';
import {RFValue} from 'react-native-responsive-fontsize';
import {FontFamily} from '~theme/fonts';
import {useTheme} from '~context/ThemeContext';
import useSubcontractorEarnings from '~hooks/useSubcontractorEarnings';
import {money} from '~screens/menu/wallet/walletFormat';
import {
  STATUS_STYLES,
  CHART_TICKS,
  CHART_HEIGHT,
  compactMoney,
} from './earningsData';

// Chart series colours, shared by the legend and the bars.
const SERIES = {gross: '#3B82F6', cis: '#F87171', net: '#10B981'};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Mini trend line in the KPI card footer. Points are normalised into the 58×16
// box, so any series length works.
const Sparkline = ({data = [], color = SERIES.net, width = 58, height = 16}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const KpiCard = ({label, value, hero, changePct, trend, footnote}) => (
  <View style={[styles.card, hero && styles.cardHero]}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiLabel}>{label}</Text>
      {hero && (
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Hero</Text>
        </View>
      )}
    </View>

    <Text style={styles.kpiValue}>{value}</Text>

    <View style={styles.kpiFooter}>
      {changePct != null ? (
        <Text style={styles.kpiChange}>
          {changePct >= 0 ? '+' : ''}
          {changePct}% vs last period
        </Text>
      ) : (
        <Text style={styles.kpiFootnote}>{footnote}</Text>
      )}
      {trend ? <Sparkline data={trend} /> : null}
    </View>
  </View>
);

const LegendDot = ({color, label}) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, {backgroundColor: color}]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const WeekCard = ({week, currency}) => {
  const status = STATUS_STYLES[week.status] ?? STATUS_STYLES.pending;

  return (
    <View style={styles.weekCard}>
      <View style={styles.weekTopRow}>
        <View style={styles.weekTitleRow}>
          <Text style={styles.weekTitle}>Week {week.id}</Text>
          <Text style={styles.weekRange}>({week.range})</Text>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: status.bg}]}>
          <Text style={[styles.statusText, {color: status.text}]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.weekFigures}>
        <View style={styles.figureCol}>
          <Text style={styles.figureLabel}>GROSS</Text>
          <Text style={styles.figureValue}>{money(week.gross, currency)}</Text>
        </View>
        <View style={styles.figureCol}>
          <Text style={styles.figureLabel}>DEDUCTION (20%)</Text>
          <Text style={[styles.figureValue, {color: SERIES.cis}]}>
            {money(week.deduction, currency)}
          </Text>
        </View>
        <View style={[styles.figureCol, styles.figureColEnd]}>
          <Text style={styles.figureLabel}>NET PAY</Text>
          <Text style={[styles.figureValue, styles.figureValueNet]}>
            {money(week.net, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const EarningsScreen = () => {
  const {colors} = useTheme();
  const {data, loading, refresh} = useSubcontractorEarnings();

  const {currency, summary, monthly, cisBreakdown, weeks, ytd} = data;

  // Bars scale against the top tick so they line up with the y-axis labels.
  const scale = CHART_TICKS[0];
  const barHeight = value =>
    Math.max(2, (Number(value ?? 0) / scale) * CHART_HEIGHT);

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      <Header
        title="Earnings Dashboard"
        subtitle="Track your gross, deductions, and net earnings"
        showBackButton
      />

      <ScrollView
        includeAvoidingView={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#10375C"
          />
        }>
        {/* KPI cards */}
        <KpiCard
          label="Gross Earnings"
          value={money(summary.gross, currency)}
          changePct={summary.grossChangePct}
          trend={summary.grossTrend}
        />
        <KpiCard
          label={`CIS Deductions (${summary.cisRate}%)`}
          value={money(summary.cisDeductions, currency)}
          footnote="Standard CIS rate applied"
        />
        <KpiCard
          label="Net Earnings"
          value={money(summary.net, currency)}
          hero
          changePct={summary.netChangePct}
          trend={summary.netTrend}
        />
        <KpiCard
          label="Pending Payments"
          value={money(summary.pending, currency)}
          footnote="Standard CIS rate applied"
        />

        {/* Earnings overview chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Earnings Overview</Text>
          <View style={styles.legend}>
            <LegendDot color={SERIES.gross} label="Gross" />
            <LegendDot color={SERIES.cis} label="CIS" />
            <LegendDot color={SERIES.net} label="Net" />
          </View>

          <View style={styles.chartVisual}>
            <View style={styles.axis}>
              {CHART_TICKS.map(tick => (
                <Text key={tick} style={styles.axisLabel}>
                  {tick === 0 ? '£0' : money(tick, currency).replace('.00', '')}
                </Text>
              ))}
            </View>

            <View style={styles.barsContainer}>
              {monthly.map(month => (
                <View key={month.label} style={styles.barGroup}>
                  <View style={styles.bars}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight(month.gross),
                          backgroundColor: SERIES.gross,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight(month.cis),
                          backgroundColor: SERIES.cis,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight(month.net),
                          backgroundColor: SERIES.net,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{month.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* CIS deduction breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CIS Deduction Breakdown</Text>
          <View style={styles.breakdownTotalRow}>
            <Text style={styles.breakdownTotal}>
              {compactMoney(cisBreakdown.total)}
            </Text>
            <Text style={styles.breakdownTotalCaption}>/Total CIS</Text>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barLabelsRow}>
              <Text style={styles.axisLabel}>0</Text>
              <Text style={styles.axisLabel}>
                {money(cisBreakdown.total, currency).replace('.00', '')}
              </Text>
            </View>
            <View style={styles.barTrack}>
              {cisBreakdown.categories.map(cat => (
                <View
                  key={cat.label}
                  style={{flex: cat.percent, backgroundColor: cat.color}}
                />
              ))}
            </View>
          </View>

          <View style={styles.categoryList}>
            {cisBreakdown.categories.map(cat => (
              <View key={cat.label} style={styles.categoryRow}>
                <View style={styles.categoryLabelWrap}>
                  <View style={[styles.dot, {backgroundColor: cat.color}]} />
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </View>
                <View style={styles.categoryValueWrap}>
                  <Text style={styles.categoryPercent}>{cat.percent}%</Text>
                  <Text style={styles.categoryAmount}>
                    {money(cat.amount, currency)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly detail */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Earnings Detail</Text>
          <Text style={styles.sectionAction}>Total YTD</Text>
        </View>

        {weeks.map(week => (
          <WeekCard key={week.id} week={week} currency={currency} />
        ))}

        {/* YTD summary */}
        <View style={styles.ytdCard}>
          <View style={styles.weekTopRow}>
            <Text style={styles.ytdTitle}>Total YTD Summary</Text>
            <Text style={styles.ytdPeriod}>{ytd.period}</Text>
          </View>
          <View style={styles.weekFigures}>
            <View style={styles.figureCol}>
              <Text style={styles.ytdFigureLabel}>GROSS</Text>
              <Text style={styles.ytdFigureValue}>
                {money(ytd.gross, currency)}
              </Text>
            </View>
            <View style={styles.figureCol}>
              <Text style={styles.ytdFigureLabel}>DEDUCTION (20%)</Text>
              <Text style={[styles.ytdFigureValue, {color: SERIES.cis}]}>
                {money(ytd.deduction, currency)}
              </Text>
            </View>
            <View style={[styles.figureCol, styles.figureColEnd]}>
              <Text style={styles.ytdFigureLabel}>NET PAY</Text>
              <Text style={[styles.ytdFigureValue, {color: SERIES.net}]}>
                {money(ytd.net, currency)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {flex: 1},
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },

  // Generic card shell
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHero: {borderWidth: 2, borderColor: '#10B981'},
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13.5),
    color: '#0F172A',
  },

  // KPI card
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#475569',
  },
  kpiValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(20),
    color: '#0F172A',
  },
  kpiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiChange: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#10B981',
  },
  kpiFootnote: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#64748B',
  },
  heroBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  heroBadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(8.5),
    color: '#047857',
  },

  // Chart
  legend: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  dot: {width: 8, height: 8, borderRadius: 4},
  legendLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#475569',
  },
  chartVisual: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  axis: {
    width: 40,
    height: CHART_HEIGHT,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(8.5),
    color: '#94A3B8',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barGroup: {alignItems: 'center', gap: 6},
  bars: {flexDirection: 'row', alignItems: 'flex-end', gap: 2},
  bar: {width: 10, borderTopLeftRadius: 2, borderTopRightRadius: 2},
  barLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9.5),
    color: '#0F172A',
  },

  // CIS breakdown
  breakdownTotalRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 4},
  breakdownTotal: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(20),
    color: '#0F172A',
  },
  breakdownTotalCaption: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
    paddingBottom: 3,
  },
  barContainer: {gap: 6},
  barLabelsRow: {flexDirection: 'row', justifyContent: 'space-between'},
  barTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  categoryList: {gap: 10},
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLabelWrap: {flexDirection: 'row', alignItems: 'center', gap: 8},
  categoryLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#0F172A',
  },
  categoryValueWrap: {flexDirection: 'row', alignItems: 'center', gap: 12},
  categoryPercent: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#475569',
  },
  categoryAmount: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(10.5),
    color: '#0F172A',
  },

  // Weekly detail
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13.5),
    color: '#0F172A',
  },
  sectionAction: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#F2A154',
  },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  weekTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  weekTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#0F172A',
  },
  weekRange: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#64748B',
  },
  statusBadge: {borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4},
  statusText: {fontFamily: FontFamily.semiBold, fontSize: RFValue(10.5)},
  weekFigures: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  figureCol: {flex: 1, gap: 2},
  figureColEnd: {alignItems: 'flex-end'},
  figureLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(8.5),
    color: '#94A3B8',
  },
  figureValue: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#0F172A',
  },
  figureValueNet: {fontFamily: FontFamily.bold, color: SERIES.net},

  // YTD summary
  ytdCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#F2A154',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  ytdTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
  ytdPeriod: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#475569',
  },
  ytdFigureLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(8.5),
    color: '#64748B',
  },
  ytdFigureValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
});

export default EarningsScreen;
