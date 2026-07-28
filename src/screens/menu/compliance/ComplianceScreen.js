import { useEffect, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ScrollView, Text, Button } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Folder } from 'lucide-react-native';
import useCompanyCompliance from '~hooks/useCompanyCompliance';

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapRecord = (record) => ({
  _id:      record._id,
  name:     record.name             ?? '—',
  trade:    record.project?.trade   ?? '—',
  location: record.project?.siteAddress ?? '—',
  _raw:     record,
});

// ── Screen ────────────────────────────────────────────────────────────────────

const ComplianceScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { complianceRecords, loading, getComplianceRecords } = useCompanyCompliance();

  useEffect(() => { getComplianceRecords(); }, []);

  const records = useMemo(() => complianceRecords.map(mapRecord), [complianceRecords]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Compliance Centre"
        subtitle="Manage safety documents, permits, and regulatory requirements according to jobs"
        showBackButton
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {!loading && records.length === 0 && (
          <View style={styles.emptyWrap}>
            <Folder size={48} color="#CBD5E1" />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No compliance records found.
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Compliance documents will appear here once records are created.
            </Text>
          </View>
        )}

        {records.map((item) => (
          <View key={item._id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Folder size={64} color="#FBBF24" fill="#FBBF24" />
            </View>

            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.tradeName}>{item.trade}</Text>

            <Button
              title="See Documents"
              variant="primary"
              style={styles.seeDocsBtn}
              onPress={() => navigation.navigate('ComplianceProject', {
                name:     item.name,
                location: item.location,
                record:   item._raw,
              })}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    marginBottom: 16,
  },
  projectName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
    textAlign: 'center',
    marginBottom: 4,
  },
  tradeName: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
    marginBottom: 16,
  },
  seeDocsBtn: {
    width: '100%',
  },
});

export default ComplianceScreen;
