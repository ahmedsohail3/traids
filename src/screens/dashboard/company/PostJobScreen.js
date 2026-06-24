/**
 * PostJobScreen
 *
 * Create Job flow for the Company user type.
 * - Form state driven by createJobFormConfig (single source of truth)
 * - Real API via useCompanyJobs.createJob
 * - Document uploads via existing filePicker utilities
 * - Platform-specific date pickers:
 *     Android → react-native-date-picker (modal)
 *     iOS     → @react-native-community/datetimepicker (spinner in modal)
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
import { MapPin, Info, Eye, Plus, Users } from 'lucide-react-native';
import { StackActions } from '@react-navigation/native';

import { Text } from '~components/Common';
import Header from '~components/Header';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import useAlert from '~hooks/useAlert';
import useCompanyJobs from '~hooks/useCompanyJobs';

import {
  JobPreviewCard,
  FinancialSummary,
  TradeDropdown,
  TimelineRow,
  SuccessOverlay,
  DateModal,
  DocumentChip,
  DocumentPickerSheet,
} from '~components/Job';

import {
  INITIAL_JOB_FORM,
  validateJobForm,
  formatDateForDisplay,
} from '~config/createJobFormConfig';
import { pickDocument, pickImageFromLibrary } from '~utils/filePicker';

// ─── Constants ────────────────────────────────────────────────────────────────
const NAVY   = '#10375C';
const ORANGE = '#F2A154';
const BORDER = '#E2E8F0';

// ─── Sub-components ───────────────────────────────────────────────────────────

const FormLabel = ({ text, style }) => (
  <Text style={[styles.formLabel, style]}>{text}</Text>
);

const FieldError = ({ message }) =>
  message ? <Text style={styles.fieldError}>{message}</Text> : null;

// ─── Screen ───────────────────────────────────────────────────────────────────
const PostJobScreen = ({ navigation }) => {
  const insets             = useSafeAreaInsets();
  const { colors }         = useTheme();
  const { showAlert }      = useAlert();
  const { createJob, creatingJob } = useCompanyJobs();

  // ── Form state ────────────────────────────────────────────────────────────
  const [form,           setForm]           = useState({ ...INITIAL_JOB_FORM });
  const [errors,         setErrors]         = useState({});
  const [successVisible, setSuccessVisible] = useState(false);

  const set = useCallback((key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: '' }));
  }, []);

  // ── Date modal state ──────────────────────────────────────────────────────
  const [dateModal, setDateModal] = useState({ visible: false, field: null });

  const openDateModal  = useCallback((field) => setDateModal({ visible: true, field }), []);
  const closeDateModal = useCallback(() => setDateModal({ visible: false, field: null }), []);

  const confirmDate = useCallback((iso) => {
    if (dateModal.field) set(dateModal.field, iso);
  }, [dateModal.field, set]);

  // ── Document picker ───────────────────────────────────────────────────────
  const [docSheetVisible, setDocSheetVisible] = useState(false);

  const addDocument = useCallback((doc) => {
    if (!doc) return;
    setForm((p) => ({ ...p, documents: [...p.documents, doc] }));
  }, []);

  const removeDocument = useCallback((idx) => {
    setForm((p) => ({ ...p, documents: p.documents.filter((_, i) => i !== idx) }));
  }, []);

  const handlePickDocument = useCallback(async () => {
    setDocSheetVisible(false);
    const doc = await pickDocument();
    addDocument(doc);
  }, [addDocument]);

  const handlePickImage = useCallback(async () => {
    setDocSheetVisible(false);
    const img = await pickImageFromLibrary({ selectionLimit: 1 });
    addDocument(img);
  }, [addDocument]);

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const [showTooltip, setShowTooltip] = useState(false);

  // ── Submission ────────────────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    const validationErrors = validateJobForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Dates are already stored as YYYY-MM-DD (ISO 8601) — send directly
    try {
      await createJob(form);
      setSuccessVisible(true);
    } catch {
      showAlert({
        title:   'Unable to Create Job',
        message: 'Something went wrong. Please try again.',
        type:    'error',
      });
    }
  }, [form, createJob, showAlert, setSuccessVisible]);

  const handleSeeMyJobs = useCallback(() => {
    setSuccessVisible(false);
    setForm({ ...INITIAL_JOB_FORM });
    setErrors({});
    // Remove PostJob from the Dashboard stack, then switch to Jobs tab
    navigation.dispatch(StackActions.popToTop());
    navigation.getParent()?.navigate('Jobs');
  }, [navigation]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Post New Job" subtitle="Start posting jobs and manage jobs." showBackButton />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Preview card ── */}
        <View style={[styles.formCard, { marginBottom: 20, paddingBottom: 0 }]}>
          <View style={styles.sectionHeaderWrap}>
            <Eye size={RFValue(12)} color={ORANGE} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>JOB PREVIEW</Text>
          </View>
          <JobPreviewCard
            title={form.jobTitle}
            trade={form.trade}
            rate={form.hourlyRate}
            description={form.description}
          />

          <View style={styles.sectionHeaderWrap}>
            <Eye size={RFValue(12)} color={ORANGE} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>FINANCIAL SUMMARY</Text>
          </View>
          <FinancialSummary rate={form.hourlyRate} />
        </View>

        {/* ── Form ── */}
        <View style={styles.formCard}>

          {/* Job Title */}
          <FormLabel text="Job Title" />
          <RNTextInput
            placeholder="Downtown Office Renovation"
            placeholderTextColor="#94A3B8"
            value={form.jobTitle}
            onChangeText={(v) => set('jobTitle', v)}
            style={[
              styles.formInput,
              { color: colors.textPrimary, backgroundColor: colors.surface },
              errors.jobTitle && styles.inputError,
            ]}
          />
          <FieldError message={errors.jobTitle} />

          {/* Trade */}
          <FormLabel text="Trade Required" />
          <TradeDropdown value={form.trade} onSelect={(v) => set('trade', v)} />
          <FieldError message={errors.trade} />

          {/* Description */}
          <FormLabel text="Description" />
          <RNTextInput
            placeholder="Add job description..."
            placeholderTextColor="#94A3B8"
            value={form.description}
            onChangeText={(v) => set('description', v)}
            multiline
            style={[
              styles.formInput,
              styles.formInputMultiline,
              { color: colors.textPrimary, backgroundColor: colors.surface },
              errors.description && styles.inputError,
            ]}
          />
          <FieldError message={errors.description} />

          {/* Site Address */}
          <FormLabel text="Site Address" />
          <View style={[
            styles.inputWithIcon,
            { backgroundColor: colors.surface },
            errors.siteAddress && styles.inputError,
          ]}>
            <MapPin size={RFValue(13)} color="#94A3B8" style={styles.inputIconLeft} />
            <RNTextInput
              placeholder="California Park, California"
              placeholderTextColor="#94A3B8"
              value={form.siteAddress}
              onChangeText={(v) => set('siteAddress', v)}
              style={[styles.inputInner, { color: colors.textPrimary }]}
            />
          </View>
          <FieldError message={errors.siteAddress} />

          {/* Timeline */}
          <FormLabel text="Timeline" />
          <TimelineRow
            startDate={formatDateForDisplay(form.timelineStartDate)}
            endDate={formatDateForDisplay(form.timelineEndDate)}
            onStartPress={() => openDateModal('timelineStartDate')}
            onEndPress={() => openDateModal('timelineEndDate')}
          />
          {(errors.timelineStartDate || errors.timelineEndDate) && (
            <FieldError message={errors.timelineStartDate || errors.timelineEndDate} />
          )}

          {/* Workers Required */}
          <FormLabel text="Workers Required" />
          <View style={[
            styles.inputWithIcon,
            { backgroundColor: colors.surface },
            errors.workersRequired && styles.inputError,
          ]}>
            <Users size={RFValue(13)} color="#94A3B8" style={styles.inputIconLeft} />
            <RNTextInput
              placeholder="e.g. 3"
              placeholderTextColor="#94A3B8"
              value={form.workersRequired}
              onChangeText={(v) => set('workersRequired', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              style={[styles.inputInner, { color: colors.textPrimary }]}
            />
          </View>
          <FieldError message={errors.workersRequired} />

          {/* Hourly Rate */}
          <View style={styles.rateLabelRow}>
            <FormLabel text="Hourly Rate" style={{ marginBottom: 0 }} />
            <TouchableOpacity onPress={() => setShowTooltip((v) => !v)}>
              <Info size={RFValue(12)} color="#94A3B8" />
            </TouchableOpacity>
            {showTooltip && (
              <View style={styles.tooltipBox}>
                <Text style={styles.tooltipTitle}>Includes 5% Platform Fee</Text>
                <Text style={styles.tooltipText}>You will pay £{form.hourlyRate ? (Number(form.hourlyRate) * 1.05).toFixed(2) : '—'}/hour</Text>
                <Text style={styles.tooltipText}>(includes 5% platform fee)</Text>
              </View>
            )}
          </View>
          <View style={[
            styles.inputWithIcon,
            { backgroundColor: colors.surface, marginBottom: 4, zIndex: 1 },
            errors.hourlyRate && styles.inputError,
          ]}>
            <Text style={styles.poundSymbol}>£</Text>
            <RNTextInput
              value={form.hourlyRate}
              onChangeText={(v) => set('hourlyRate', v.replace(/[^0-9.]/g, ''))}
              placeholder="12"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              style={[styles.inputInner, styles.rateInputInner, { color: colors.textPrimary }]}
            />
          </View>
          <FieldError message={errors.hourlyRate} />
          <Text style={styles.avgRateText}>Avg for Electrician: £350 - £450</Text>

          {/* Documents */}
          <FormLabel text="Project Documents" style={{ marginTop: 12 }} />

          {form.documents.length > 0 && (
            <View style={styles.docList}>
              {form.documents.map((doc, idx) => (
                <DocumentChip key={idx} doc={doc} onRemove={() => removeDocument(idx)} />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addDocBtn}
            onPress={() => setDocSheetVisible(true)}
            activeOpacity={0.8}>
            <Plus size={RFValue(13)} color={NAVY} strokeWidth={2.5} />
            <Text style={styles.addDocBtnText}>
              {form.documents.length === 0 ? 'Upload Document' : 'Add Another'}
            </Text>
          </TouchableOpacity>

          {/* Publish */}
          <TouchableOpacity
            style={[styles.publishBtn, creatingJob && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handlePublish}
            disabled={creatingJob}>
            {creatingJob
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.publishBtnText}>Publish Job</Text>}
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* ── Success overlay ── */}
      <SuccessOverlay visible={successVisible} onViewJobs={handleSeeMyJobs} />

      {/* ── Date picker ── */}
      <DateModal
        visible={dateModal.visible}
        title={dateModal.field === 'timelineStartDate' ? 'Start Date' : 'End Date'}
        value={dateModal.field ? form[dateModal.field] : ''}
        minimumDate={
          dateModal.field === 'timelineEndDate' && form.timelineStartDate
            ? new Date(form.timelineStartDate)
            : (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })()
        }
        onConfirm={confirmDate}
        onClose={closeDateModal}
      />

      {/* ── Document type picker sheet ── */}
      <DocumentPickerSheet
        visible={docSheetVisible}
        onClose={() => setDocSheetVisible(false)}
        onPickImage={handlePickImage}
        onPickDocument={handlePickDocument}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  sectionHeaderWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  sectionHeading: { fontFamily: FontFamily.bold, fontSize: RFValue(11), letterSpacing: 1 },

  formCard: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    zIndex: 1,
  },
  formLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: NAVY,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    marginBottom: 4,
    minHeight: 44,
  },
  formInputMultiline: { minHeight: 120, textAlignVertical: 'top' },
  inputError: { borderColor: '#EF4444' },
  fieldError: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#EF4444',
    marginBottom: 12,
    marginTop: 2,
  },

  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    marginBottom: 4,
    minHeight: 44,
  },
  inputIconLeft: { marginLeft: 12, marginRight: 8 },
  inputInner: {
    flex: 1,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    paddingVertical: 10,
    paddingRight: 12,
  },

  rateLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, zIndex: 10 },
  poundSymbol: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#94A3B8', marginLeft: 14, marginRight: 4, marginTop: 2 },
  rateInputInner: { paddingLeft: 0, paddingRight: 12 },
  avgRateText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(9), color: '#22C55E', marginBottom: 20 },

  tooltipBox: {
    position: 'absolute', top: -5, left: 85,
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: BORDER,
    padding: 12, width: 200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 8, zIndex: 999,
  },
  tooltipTitle: { fontFamily: FontFamily.bold, fontSize: RFValue(10), color: NAVY, marginBottom: 4 },
  tooltipText:  { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#64748B' },

  // Documents
  docList: { gap: 8, marginBottom: 12 },

  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 24,
    backgroundColor: '#FAFBFC',
  },
  addDocBtnText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(11), color: NAVY },

  // Publish
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
