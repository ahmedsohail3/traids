/**
 * SendOfferScreen
 *
 * Full-screen "Book Now" flow for the Company role — replaces the old
 * SendOfferModal bottom sheet. Lets the company either:
 *   - create a brand-new job inline and send it as an offer, or
 *   - pick an existing job from a dropdown (hides the create-job form,
 *     shows a read-only summary of that job instead).
 *
 * Either way, POST /offers is called with the same field set; the values
 * just come from the manual form or from the selected existing job.
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Eye, Plus, Calendar } from 'lucide-react-native';
import { StackActions } from '@react-navigation/native';

import { Text, SelectDropdown } from '~components/Common';
import Header from '~components/Header';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import useAlert from '~hooks/useAlert';
import useCompanyJobs from '~hooks/useCompanyJobs';

import {
  FinancialSummary,
  TradeDropdown,
  TimelineRow,
  SuccessOverlay,
  DateModal,
  DocumentChip,
  DocumentPickerSheet,
} from '~components/Job';

import { INITIAL_OFFER_FORM, validateOfferForm } from '~config/sendOfferFormConfig';
import { formatDateForDisplay } from '~config/createJobFormConfig';
import { pickDocument, pickImageFromLibrary } from '~utils/filePicker';

// ─── Constants ────────────────────────────────────────────────────────────────
const NAVY   = '#10375C';
const ORANGE = '#F2A154';
const BORDER = '#E2E8F0';
const NO_JOB_SELECTED = '';

// ─── Sub-components ───────────────────────────────────────────────────────────

const FormLabel = ({ text, style }) => (
  <Text style={[styles.formLabel, style]}>{text}</Text>
);

const FieldError = ({ message }) =>
  message ? <Text style={styles.fieldError}>{message}</Text> : null;

// ─── Screen ───────────────────────────────────────────────────────────────────

const SendOfferScreen = ({ route, navigation }) => {
  const insets        = useSafeAreaInsets();
  const { colors }    = useTheme();
  const { showAlert } = useAlert();
  const { jobs, getJobs, sendOffer, sendOfferForJob, sendingOffer } = useCompanyJobs();

  const {
    subcontractorId,
    subName      = 'Subcontractor',
    subTrade     = '',
    subAvatarUri = null,
    subAbout     = '',
  } = route?.params ?? {};

  useEffect(() => { getJobs(); }, []);

  // ── Select existing job ───────────────────────────────────────────────────
  const [selectedJobId, setSelectedJobId] = useState(NO_JOB_SELECTED);

  const jobOptions = useMemo(() => ([
    { label: 'Start from scratch...', value: NO_JOB_SELECTED },
    ...jobs.map((j) => ({ label: j.jobTitle ?? 'Untitled Job', value: j._id })),
  ]), [jobs]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j._id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  );

  // ── New-job form state (used only when "Start from scratch...") ──────────
  const [form,           setForm]           = useState({ ...INITIAL_OFFER_FORM });
  const [errors,         setErrors]         = useState({});
  const [successVisible, setSuccessVisible] = useState(false);

  const set = useCallback((key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: '' }));
  }, []);

  // Values actually sent to the API — from the selected job, or the manual form
  const effective = selectedJob ? {
    jobTitle:          selectedJob.jobTitle ?? '',
    trade:             selectedJob.trade ?? '',
    description:       selectedJob.description ?? '',
    siteAddress:       selectedJob.siteAddress ?? '',
    timelineStartDate: selectedJob.timelineStartDate ?? '',
    timelineEndDate:   selectedJob.timelineEndDate ?? '',
    hourlyRate:        selectedJob.hourlyRate != null ? String(selectedJob.hourlyRate) : '',
  } : form;

  // ── Date modal (only relevant when creating a new job) ───────────────────
  const [dateModal, setDateModal] = useState({ visible: false, field: null });

  const openDateModal  = useCallback((field) => setDateModal({ visible: true, field }), []);
  const closeDateModal = useCallback(() => setDateModal({ visible: false, field: null }), []);

  const confirmDate = useCallback((iso) => {
    if (dateModal.field) set(dateModal.field, iso);
  }, [dateModal.field, set]);

  // ── Document picker — always available, regardless of job source ─────────
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

  // ── Submission ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!selectedJob) {
      const validationErrors = validateOfferForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    try {
      if (selectedJob) {
        // Existing job — POST /offers/send/{jobId} with just the subcontractorId
        await sendOfferForJob(selectedJob._id, subcontractorId);
      } else {
        // New job — POST /offers with the full job + offer payload
        await sendOffer({
          subcontractorId,
          jobTitle:          effective.jobTitle,
          trade:             effective.trade,
          description:       effective.description,
          siteAddress:       effective.siteAddress,
          timelineStartDate: effective.timelineStartDate,
          timelineEndDate:   effective.timelineEndDate,
          hourlyRate:        effective.hourlyRate,
          documents:         form.documents,
        });
      }
      setSuccessVisible(true);
    } catch (err) {
      showAlert({
        title:   'Unable to Send Offer',
        message: typeof err === 'string' ? err : 'Something went wrong. Please try again.',
        type:    'error',
      });
    }
  }, [selectedJob, form, effective, subcontractorId, sendOffer, sendOfferForJob, showAlert]);

  const handleSeeMyJobs = useCallback(() => {
    setSuccessVisible(false);
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('CompanyTabs', { screen: 'Jobs' });
  }, [navigation]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Find Subcontractors"
        subtitle="Discover and book top rated professionals for your project."
        showBackButton
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Subcontractor summary ── */}
        <View style={styles.subCard}>
          <View style={styles.subRow}>
            {subAvatarUri ? (
              <Image source={{ uri: subAvatarUri }} style={styles.subAvatar} />
            ) : (
              <View style={[styles.subAvatar, styles.subAvatarPlaceholder]}>
                <Text style={styles.subAvatarInitial}>{subName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.subName}>{subName}</Text>
              {subTrade ? <Text style={styles.subTrade}>{subTrade}</Text> : null}
            </View>
          </View>

          {subAbout ? (
            <>
              <Text style={styles.subAboutLabel}>About</Text>
              <Text style={styles.subAboutText}>{subAbout}</Text>
            </>
          ) : null}

          <View style={styles.sectionHeaderWrap}>
            <Eye size={RFValue(12)} color={ORANGE} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>FINANCIAL SUMMARY</Text>
          </View>
          <FinancialSummary rate={effective.hourlyRate} />
        </View>

        {/* ── Job source + form ── */}
        <View style={styles.formCard}>
          <SelectDropdown
            label="Select Existing Job"
            value={selectedJobId}
            options={jobOptions}
            onSelect={setSelectedJobId}
            placeholder="Start from scratch..."
          />

          {selectedJob ? (
            /* Read-only summary of the picked job — create-job form is hidden */
            <View style={styles.jobSummary}>
              <Text style={styles.jobSummaryTitle}>{selectedJob.jobTitle}</Text>
              <Text style={styles.jobSummaryTrade}>{selectedJob.trade}</Text>

              {selectedJob.description ? (
                <Text style={styles.jobSummaryDesc} numberOfLines={3}>{selectedJob.description}</Text>
              ) : null}

              <View style={styles.jobSummaryMetaRow}>
                <MapPin size={RFValue(11)} color="#94A3B8" />
                <Text style={styles.jobSummaryMetaText}>{selectedJob.siteAddress || '—'}</Text>
              </View>
              <View style={styles.jobSummaryMetaRow}>
                <Calendar size={RFValue(11)} color="#94A3B8" />
                <Text style={styles.jobSummaryMetaText}>
                  {formatDateForDisplay(selectedJob.timelineStartDate) || '—'} – {formatDateForDisplay(selectedJob.timelineEndDate) || '—'}
                </Text>
              </View>

              <Text style={styles.jobSummaryRate}>£{selectedJob.hourlyRate ?? '—'} / hr</Text>
            </View>
          ) : (
            <>
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
                  placeholder="Enter full address..."
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

              {/* Hourly Rate */}
              <FormLabel text="Hourly Rate" />
              <View style={[
                styles.inputWithIcon,
                { backgroundColor: colors.surface },
                errors.hourlyRate && styles.inputError,
              ]}>
                <Text style={styles.poundSymbol}>£</Text>
                <RNTextInput
                  value={form.hourlyRate}
                  onChangeText={(v) => set('hourlyRate', v.replace(/[^0-9.]/g, ''))}
                  placeholder="12"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  style={[styles.inputInner, { color: colors.textPrimary }]}
                />
              </View>
              <FieldError message={errors.hourlyRate} />
            </>
          )}

          {/* Documents — only relevant when creating a new job (POST /offers) */}
          {!selectedJob && (
            <>
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
                  {form.documents.length === 0 ? 'Click to upload Qualifications' : 'Add Another'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Send Offer */}
          <TouchableOpacity
            style={[styles.sendBtn, sendingOffer && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleSend}
            disabled={sendingOffer}>
            {sendingOffer
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.sendBtnText}>Send Offer</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Success modal — the only modal in this flow ── */}
      <SuccessOverlay
        visible={successVisible}
        onViewJobs={handleSeeMyJobs}
        title="Offer Sent Successfully"
        message={'Your offer has been sent successfully.\nWait for subcontractor to accept.'}
        buttonText="See My Jobs"
      />

      {/* ── Date picker (new-job flow only) ── */}
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

  // Subcontractor summary card
  subCard: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  subAvatar: { width: RFValue(44), height: RFValue(44), borderRadius: RFValue(22), backgroundColor: '#F1F5F9' },
  subAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  subAvatarInitial: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: NAVY },
  subName:  { fontFamily: FontFamily.bold, fontSize: RFValue(13), color: NAVY, marginBottom: 2 },
  subTrade: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B' },
  subAboutLabel: { fontFamily: FontFamily.semiBold, fontSize: RFValue(10), color: NAVY, marginBottom: 4 },
  subAboutText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#64748B',
    lineHeight: RFValue(16),
    marginBottom: 16,
  },

  sectionHeaderWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  sectionHeading: { fontFamily: FontFamily.bold, fontSize: RFValue(11), letterSpacing: 1, color: NAVY },

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
  poundSymbol: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#94A3B8', marginLeft: 14, marginRight: 4 },

  // Read-only existing-job summary (shown instead of the create-job form)
  jobSummary: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  jobSummaryTitle: { fontFamily: FontFamily.bold, fontSize: RFValue(13), color: NAVY, marginBottom: 2 },
  jobSummaryTrade: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B', textTransform: 'capitalize', marginBottom: 8 },
  jobSummaryDesc: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B', lineHeight: RFValue(15), marginBottom: 10 },
  jobSummaryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  jobSummaryMetaText: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B' },
  jobSummaryRate: { fontFamily: FontFamily.bold, fontSize: RFValue(11), color: NAVY, marginTop: 4 },

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

  // Send
  sendBtn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: RFValue(14),
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sendBtnText: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#fff' },
});

export default SendOfferScreen;
