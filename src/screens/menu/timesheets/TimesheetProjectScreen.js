import { useState, useEffect, useMemo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Modal,
} from 'react-native';
import { Text, ScrollView, TextInput } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Plus, Eye, ChevronDown, Check, Star } from 'lucide-react-native';
import WorkerTimesheetModal from './components/WorkerTimesheetModal';
import InvoicesModal from './components/InvoicesModal';
import RatingModal from './components/RatingModal';
import useCompanyTimesheet from '~hooks/useCompanyTimesheet';
import useCompanyInvoices from '~hooks/useCompanyInvoices';
import useCompanyJobs from '~hooks/useCompanyJobs';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = ['All', 'Pending', 'Approved'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// submitted → display as Pending; approved → Approved; anything else hidden via filter
const STATUS_DISPLAY = {
  submitted: 'Pending',
  approved:  'Approved',
};

const mapTimesheet = (ts) => ({
  _id:             ts._id,
  subcontractorId: ts.subcontractor?._id  ?? null,
  name:            ts.subcontractor?.fullName     ?? '—',
  trade:           ts.subcontractor?.primaryTrade ?? '—',
  avatarUri:       ts.subcontractor?.profileImage ?? null,
  hours:           ts.totalHours    ?? 0,
  date:            formatDate(ts.weekStartDate),
  weekNumber:      ts.weekNumber    ?? 1,
  amount:          ts.grossAmount   != null ? `£${ts.grossAmount.toFixed(2)}` : '—',
  netPayable:      ts.netPayable    != null ? `£${ts.netPayable.toFixed(2)}`  : '—',
  hourlyRate:      ts.hourlyRate    != null ? `£${ts.hourlyRate}/hr`          : '—',
  status:          STATUS_DISPLAY[(ts.status ?? '').toLowerCase()] ?? null,
  paymentStatus:   ts.paymentStatus ?? '',
  timeLeft:        ts.paymentStatus === 'paid' ? 'Review Closed' : 'Awaiting Review',
  dailyLogs:       Array.isArray(ts.dailyLogs) ? ts.dailyLogs : [],
});

// ── Sub-components ────────────────────────────────────────────────────────────

const ActionPill = ({ label, variant, colors }) => {
  const borderColor = variant === 'green' ? colors.success : colors.secondary;
  const bgColor     = variant === 'green' ? `${colors.success}20` : `${colors.secondary}20`;
  const textColor   = variant === 'green' ? colors.success : colors.secondary;
  return (
    <View style={[styles.pill, { borderColor, backgroundColor: bgColor, borderWidth: 1 }]}>
      <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const DropdownLabel = ({ label }) => (
  <TouchableOpacity style={styles.dropdown}>
    <Text style={styles.dropdownText}>{label}</Text>
    <ChevronDown size={RFValue(12)} color="#94A3B8" />
  </TouchableOpacity>
);

// ── Screen ────────────────────────────────────────────────────────────────────

const TimesheetProjectScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { projectTitle = 'Timesheets', job } = route.params ?? {};
  const jobId = job?._id ?? route.params?.jobId;

  const { jobTimesheets, loading, approvingTimesheet, getJobTimesheets, reset, approveTimesheet } = useCompanyTimesheet();
  const { invoices, loading: invoicesLoading, getJobInvoices, reset: resetInvoices } = useCompanyInvoices();
  const { ratingsData, submittingRating, getJobRatings, submitJobRating, resetRatings } = useCompanyJobs();

  const [activeTab,         setActiveTab]         = useState('All');
  const [search,            setSearch]            = useState('');
  const [modalVisible,      setModalVisible]      = useState(false);
  const [selectedWorker,    setSelectedWorker]    = useState(null);
  const [confirmVisible,    setConfirmVisible]    = useState(false);
  const [pendingApproveId,  setPendingApproveId]  = useState(null);
  const [invoicesVisible,   setInvoicesVisible]   = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingWorker,      setRatingWorker]      = useState(null);

  const handleApprovePress = (timesheetId) => {
    setPendingApproveId(timesheetId);
    setConfirmVisible(true);
  };

  const handleConfirmApprove = async () => {
    setConfirmVisible(false);
    try {
      await approveTimesheet(pendingApproveId);
    } catch (_) {}
    setPendingApproveId(null);
  };

  const handleCancelApprove = () => {
    setConfirmVisible(false);
    setPendingApproveId(null);
  };

  useEffect(() => {
    if (jobId) { getJobTimesheets(jobId); getJobRatings(jobId); }
    return () => { reset(); resetInvoices(); resetRatings(); };
  }, [jobId]);

  const mapped = useMemo(
    () => jobTimesheets.map(mapTimesheet).filter((t) => t.status !== null),
    [jobTimesheets],
  );

  const canGenerateInvoice = useMemo(
    () => mapped.length > 0 && mapped.every((t) => t.status?.toLowerCase() === 'approved'),
    [mapped],
  );

  const handleGenerateInvoice = () => {
    if (jobId) getJobInvoices(jobId);
    setInvoicesVisible(true);
  };

  const displayed = useMemo(() => {
    const byTab = activeTab === 'All'
      ? mapped
      : mapped.filter((t) => t.status.toLowerCase() === activeTab.toLowerCase());

    if (!search.trim()) return byTab;
    const q = search.toLowerCase();
    return byTab.filter((t) => t.name.toLowerCase().includes(q));
  }, [mapped, activeTab, search]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title={projectTitle}
        subtitle="Review work logs and timesheet submissions."
        showBackButton
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentCard}>
          {/* Filter dropdowns */}
          <View style={styles.filtersTopRow}>
            <View style={styles.dropdownFlex}><DropdownLabel label="Hourly Rate" /></View>
            <View style={styles.dropdownFlex}><DropdownLabel label="Fee Percentage" /></View>
          </View>

          {/* Search + Add */}
          <View style={styles.searchAddRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Search worker..."
                value={search}
                onChangeText={setSearch}
                leftIcon="search"
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Plus size={RFValue(14)} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {TABS.map((tab) => {
              const active = tab === activeTab;
              return (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem} activeOpacity={0.7}>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab}</Text>
                  {active && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List */}
          <View style={styles.listArea}>
            {!loading && displayed.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No timesheets found.
                </Text>
              </View>
            )}

            {displayed.map((item) => {
              const isApproved = item.status.toLowerCase() === 'approved';
              return (
                <View key={item._id} style={styles.workerCard}>
                  {/* Top */}
                  <View style={styles.workerTop}>
                    <View style={styles.workerLeft}>
                      <Image
                        source={item.avatarUri ? { uri: item.avatarUri } : { uri: `https://i.pravatar.cc/150?u=${item._id}` }}
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={styles.workerName}>{item.name}</Text>
                        <Text style={styles.workerMeta}>
                          <Text style={styles.workerHours}>{item.hours} hrs</Text>{'  '}{item.date}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.workerAmount}>{item.amount}</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Bottom */}
                  <View style={styles.workerBottom}>
                    <View style={styles.pillsRow}>
                      <ActionPill
                        label={item.timeLeft}
                        variant={isApproved ? 'green' : 'orange'}
                        colors={colors}
                      />
                      <ActionPill
                        label={item.status}
                        variant={isApproved ? 'green' : 'orange'}
                        colors={colors}
                      />
                    </View>

                    <View style={styles.actionBtnsRow}>
                      {isApproved && (() => {
                        const existingRating = ratingsData.ratings.find(
                          (r) => (r.subcontractor?._id ?? r.subcontractor) === item.subcontractorId
                        );
                        const hasRating = !!existingRating;
                        return (
                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => { setRatingWorker({ ...item, existingRating }); setRatingModalVisible(true); }}
                            activeOpacity={0.7}
                          >
                            <Star
                              size={RFValue(13)}
                              color={hasRating ? '#F59E0B' : '#94A3B8'}
                              fill={hasRating ? '#F59E0B' : 'transparent'}
                              strokeWidth={1.8}
                            />
                          </TouchableOpacity>
                        );
                      })()}
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => {
                          setSelectedWorker(item);
                          setModalVisible(true);
                        }}
                      >
                        <Eye size={RFValue(12)} color="#94A3B8" />
                      </TouchableOpacity>
                      {!isApproved && (
                        <TouchableOpacity
                          style={[styles.iconBtn, styles.checkBg]}
                          onPress={() => handleApprovePress(item._id)}
                          disabled={approvingTimesheet}
                        >
                          {approvingTimesheet && pendingApproveId === item._id
                            ? <ActivityIndicator size={RFValue(10)} color="#22C55E" />
                            : <Check size={RFValue(12)} color="#22C55E" strokeWidth={3} />
                          }
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {canGenerateInvoice && (
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateInvoice} activeOpacity={0.85}>
            <Plus size={RFValue(13)} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.generateBtnText}>Generate Invoice</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <WorkerTimesheetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        worker={selectedWorker}
      />

      <InvoicesModal
        visible={invoicesVisible}
        onClose={() => setInvoicesVisible(false)}
        invoices={invoices}
        loading={invoicesLoading}
        jobTitle={projectTitle}
        onViewReceipt={(invoiceId) => {
          setInvoicesVisible(false);
          navigation.navigate('InvoiceDetail', { invoiceId });
        }}
      />

      <RatingModal
        visible={ratingModalVisible}
        onClose={() => { setRatingModalVisible(false); setRatingWorker(null); }}
        worker={ratingWorker}
        jobId={jobId}
        submitting={submittingRating}
        onSubmit={async ({ subcontractorId, rating, comment }) => {
          try {
            await submitJobRating(jobId, subcontractorId, rating, comment);
            getJobRatings(jobId);
          } catch (_) {}
        }}
      />

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelApprove}
      >
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Approve Timesheet</Text>
            <Text style={styles.confirmBody}>
              Are you sure you want to approve this timesheet? This action cannot be undone.
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelApprove}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={handleConfirmApprove}>
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContainer: { padding: 16, paddingBottom: 120 },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 16,
    paddingBottom: 16,
  },
  filtersTopRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  dropdownFlex: { flex: 1 },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dropdownText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  searchAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  addBtn: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    gap: 20,
  },
  tabItem:        { paddingBottom: 10 },
  tabLabel:       { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#94A3B8' },
  tabLabelActive: { color: '#10375C', fontFamily: FontFamily.bold },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: '#10375C',
    borderRadius: 2,
  },
  listArea: { paddingHorizontal: 16, marginTop: 16, gap: 16 },
  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontFamily: FontFamily.regular, fontSize: RFValue(12) },
  workerCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 8,
    marginBottom: 16,
  },
  workerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  workerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:       { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E2E8F0' },
  workerName:   { fontFamily: FontFamily.semiBold, fontSize: RFValue(10.5), color: '#10375C', marginBottom: 2 },
  workerMeta:   { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#94A3B8' },
  workerHours:  { fontFamily: FontFamily.medium },
  workerAmount: { fontFamily: FontFamily.bold, fontSize: RFValue(11.5), color: '#10375C' },
  divider:      { height: 1, backgroundColor: '#E0E4EC', marginVertical: 14 },
  workerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pillsRow:     { flexDirection: 'row', gap: 8 },
  pill:         { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 18 },
  pillText:     { fontFamily: FontFamily.semiBold, fontSize: RFValue(8) },
  actionBtnsRow: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 24, height: 24, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#9CA3AF26',
  },
  checkBg: { backgroundColor: '#22C55E26' },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10375C',
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 16,
  },
  generateBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
  },
  confirmTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
    marginBottom: 10,
  },
  confirmBody: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#64748B',
    lineHeight: RFValue(16),
    marginBottom: 24,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#64748B',
  },
  approveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10375C',
    alignItems: 'center',
  },
  approveBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#FFFFFF',
  },
});

export default TimesheetProjectScreen;
