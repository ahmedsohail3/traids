/**
 * PostJobScreen
 *
 * Reached from CompanyDashboard via the orange + FAB in the header.
 * Allows a company to fill in and publish a new job posting.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Info, Eye } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Text } from '~components/Common';
import Header from '~components/Header';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

import {
  JobPreviewCard,
  FinancialSummary,
  TradeDropdown,
  WorkersStepper,
  TimelineRow,
  UploadArea,
  SuccessOverlay,
} from '~components/Job';

// ─── Constants ───────────────────────────────────────────────────────────────
const NAVY       = '#10375C';
const ORANGE     = '#F2A154';
const BORDER     = '#E2E8F0';

/** Compact section label */
const FormLabel = ({ text, style }) => (
  <Text style={[styles.formLabel, style]}>{text}</Text>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const PostJobScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Form state
  const [form, setForm] = useState({
    title: '',
    trade: '',
    description: '',
    address: '',
    startDate: '',
    endDate: '',
    rate: '',
  });

  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [success, setSuccess]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const set = useCallback((key, val) => setForm(p => ({ ...p, [key]: val })), []);

  // Simulate file pick + upload
  const handlePickFile = () => {
    if (uploading) return;
    const mock = { name: 'phoenix-document.pdf', size: '9.77 MB' };
    setFile(mock);
    setUploading(true);
    setUploadPct(0);
    let pct = 0;
    const iv = setInterval(() => {
      pct += 10;
      setUploadPct(pct);
      if (pct >= 100) {
        clearInterval(iv);
        setUploading(false);
      }
    }, 200);
  };

  // Simulate publish
  const handlePublish = () => {
    if (publishing) return;
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ─── Header ─── */}
      <Header
        title="Post New Job"
        subtitle="Start posting jobs and manage jobs."
        showBackButton
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={[styles.formCard, {marginBottom: 20, paddingBottom: 0}]}>
          {/* ─── Job Preview ─── */}
          <View style={styles.sectionHeaderWrap}>
            <Eye size={RFValue(12)} color={ORANGE} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>JOB PREVIEW</Text>
          </View>
          <JobPreviewCard
            title={form.title}
            trade={form.trade}
            rate={form.rate}
            description={form.description}
          />

          {/* ─── Financial Summary ─── */}
          <View style={styles.sectionHeaderWrap}>
            <Eye size={RFValue(12)} color={ORANGE} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>FINANCIAL SUMMARY</Text>
          </View>
          <FinancialSummary rate={form.rate} />
        </View>

        {/* ─── Form ─── */}
        <View style={styles.formCard}>
          <FormLabel text="Job Title" />
          <RNTextInput
            placeholder="Downtown Office Renovation"
            placeholderTextColor="#94A3B8"
            value={form.title}
            onChangeText={v => set('title', v)}
            style={[styles.formInput, { color: colors.textPrimary, backgroundColor: colors.surface }]}
          />

          <FormLabel text="Trade Required" />
          <TradeDropdown value={form.trade} onSelect={v => set('trade', v)} />

          <FormLabel text="Description" />
          <RNTextInput
            placeholder="Add job description..."
            placeholderTextColor="#94A3B8"
            value={form.description}
            onChangeText={v => set('description', v)}
            multiline
            style={[styles.formInput, styles.formInputMultiline, { color: colors.textPrimary, backgroundColor: colors.surface }]}
          />

          <FormLabel text="Site Address" />
          <View style={[styles.inputWithIcon, { backgroundColor: colors.surface }]}>
            <MapPin size={RFValue(13)} color="#94A3B8" style={styles.inputIconLeft} />
            <RNTextInput
              placeholder="California Park, California"
              placeholderTextColor="#94A3B8"
              value={form.address}
              onChangeText={v => set('address', v)}
              style={[styles.inputInner, { color: colors.textPrimary }]}
            />
          </View>

          <FormLabel text="Timeline" />
          <TimelineRow
            startDate={form.startDate}
            endDate={form.endDate}
            onStartPress={() => {}}
            onEndPress={() => {}}
          />

          <View style={styles.rateLabelRow}>
            <FormLabel text="Hourly Rate" style={{ marginBottom: 0 }} />
            <TouchableOpacity onPress={() => setShowTooltip(!showTooltip)}>
              <Info size={RFValue(12)} color="#94A3B8" />
            </TouchableOpacity>
            
            {showTooltip && (
              <View style={styles.tooltipBox}>
                <Text style={styles.tooltipTitle}>Includes 5% Platform Fee</Text>
                <Text style={styles.tooltipText}>You will pay £12.60/hour</Text>
                <Text style={styles.tooltipText}>(includes 5% platform fee)</Text>
              </View>
            )}
          </View>

          <View style={[styles.inputWithIcon, { backgroundColor: colors.surface, marginBottom: 4, zIndex: 1 }]}>
            <Text style={styles.poundSymbol}>£</Text>
            <RNTextInput
              value={form.rate}
              onChangeText={v => set('rate', v)}
              placeholder="12"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              style={[styles.inputInner, styles.rateInputInner, { color: colors.textPrimary }]}
            />
          </View>
          <Text style={styles.avgRateText}>Avg for Electrician: £350 - £450</Text>

          <FormLabel text="Project Documents" style={{ marginTop: 12 }} />
          <UploadArea
            file={file}
            uploadProgress={uploading ? uploadPct : file ? 100 : null}
            onPress={handlePickFile}
          />

          <TouchableOpacity
            style={[styles.publishBtn, publishing && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handlePublish}>
            {publishing
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.publishBtnText}>Publish Job</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ─── Success overlay ─── */}
      <SuccessOverlay
        visible={success}
        onViewJobs={() => {
          setSuccess(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  // Section heading
  sectionHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  sectionHeading: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    letterSpacing: 1,
  },

  // Form card
  formCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    zIndex: 1, // needed for tooltip overlay
  },
  formLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: NAVY,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    marginBottom: 20,
    minHeight: 44,
  },
  formInputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  
  // Icon Input
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 44,
  },
  inputIconLeft: {
    marginLeft: 12,
    marginRight: 8,
  },
  inputInner: {
    flex: 1,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    paddingVertical: 10,
    paddingRight: 12,
  },

  // Rate Section
  rateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    zIndex: 10,
  },
  poundSymbol: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#94A3B8',
    marginLeft: 14,
    marginRight: 4,
    marginTop: 2,
  },
  rateInputInner: { paddingLeft: 0, paddingRight: 12 },
  avgRateText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#22C55E',
    marginBottom: 20,
  },

  // Tooltip
  tooltipBox: {
    position: 'absolute',
    top: -5,
    left: 85,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
  tooltipTitle: { fontFamily: FontFamily.bold, fontSize: RFValue(10), color: NAVY, marginBottom: 4 },
  tooltipText: { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#64748B' },

  // Publish button
  publishBtn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: RFValue(14),
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  publishBtnText: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#fff' },
});

export default PostJobScreen;
