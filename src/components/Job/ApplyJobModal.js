import { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, ShieldCheck, FileText, File, Trash2 } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { Images } from '~assets';
import useSubcontractorJobs from '~hooks/useSubcontractorJobs';
import useProfile from '~hooks/useProfile';
import useKeyboardInset from '~hooks/useKeyboardInset';
import { buildJobApplicationFormData } from '~utils/buildFormData';
import { pickDocument, pickImageFromLibrary } from '~utils/filePicker';

// ─── Form config ─────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  fullName:          '',
  proposedDailyRate: '',
  message:           '',
  documents:         [],
};

const validateForm = (values) => {
  const errors = {};

  // Read-only, filled from the profile — an empty value means the profile never
  // loaded, so the message has to point at that rather than at the user.
  if (!values.fullName.trim())
    errors.fullName = 'Your profile details could not be loaded. Close and reopen this form.';

  const rate = Number(values.proposedDailyRate);
  if (!values.proposedDailyRate.trim())
    errors.proposedDailyRate = 'Proposed daily rate is required';
  else if (isNaN(rate) || rate <= 0)
    errors.proposedDailyRate = 'Rate must be greater than 0';

  if (!values.message.trim())
    errors.message = 'Message is required';

  return errors;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldError = ({ message }) =>
  message ? <Text style={styles.errorText}>{message}</Text> : null;

const DocumentChip = ({ doc, onRemove }) => {
  const isImg = doc.type?.startsWith('image/');
  const Icon  = isImg ? FileText : File;
  return (
    <View style={styles.docChip}>
      <Icon size={RFValue(12)} color="#10375C" strokeWidth={2} />
      <Text style={styles.docChipName} numberOfLines={1}>{doc.name ?? 'document'}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8}>
        <Trash2 size={RFValue(12)} color="#94A3B8" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

const ApplyJobModal = ({
  visible,
  onClose,
  onSeeMyJobs,
  onApplied,
  onApplyFailed,
  jobTitle,
  jobId,
}) => {
  const { colors }    = useTheme();
  const insets        = useSafeAreaInsets();
  const { applyForJob, applyingForJob } = useSubcontractorJobs();
  const { profile, getProfile } = useProfile();

  // Measured keyboard avoidance instead of KeyboardAvoidingView: inside a Modal
  // the KAV frame goes stale, so the sheet kept the keyboard's space after the
  // keyboard was dismissed. This resolves back to 0 on every layout.
  const { keyboardInset, keyboardVisible, onLayout } = useKeyboardInset(insets.bottom);

  const [form,        setForm]        = useState({ ...INITIAL_FORM });
  const [errors,      setErrors]      = useState({});
  const [submitError, setSubmitError] = useState('');
  const [offerSent,   setOfferSent]   = useState(false);

  const profileName = profile?.fullName ?? profile?.name ?? '';

  useEffect(() => {
    if (visible) setForm((p) => ({ ...p, fullName: profileName }));
  }, [visible, profileName]);

  // The profile is fetched once at cold start and never retried. If that call
  // failed, the name stays empty for the whole session and the form can never
  // be submitted, so re-request it when the sheet opens without one.
  useEffect(() => {
    if (visible && !profileName) getProfile();
  }, [visible, profileName, getProfile]);

  const set = useCallback((key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: '' }));
    setSubmitError('');
  }, []);

  // ── Documents ────────────────────────────────────────────────────────────────

  const addDoc = useCallback((doc) => {
    if (!doc) return;
    setForm((p) => ({ ...p, documents: [...p.documents, doc] }));
  }, []);

  const removeDoc = useCallback((idx) => {
    setForm((p) => ({ ...p, documents: p.documents.filter((_, i) => i !== idx) }));
  }, []);

  const handlePickDocument = useCallback(async () => {
    const doc = await pickDocument();
    addDoc(doc);
  }, [addDoc]);

  const handlePickImage = useCallback(async () => {
    const img = await pickImageFromLibrary({ selectionLimit: 1 });
    addDoc(img);
  }, [addDoc]);

  // ── Reset / close ─────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setForm({ ...INITIAL_FORM, fullName: profileName });
    setErrors({});
    setSubmitError('');
    setOfferSent(false);
  }, [profileName]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSeeMyJobs = useCallback(() => {
    handleClose();
    onSeeMyJobs?.();
  }, [handleClose, onSeeMyJobs]);

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setSubmitError('');

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = buildJobApplicationFormData({
      jobId,
      fullName:          form.fullName,
      proposedDailyRate: form.proposedDailyRate,
      message:           form.message,
      documents:         form.documents,
    });

    try {
      await applyForJob(formData);
      setOfferSent(true);
      // The job detail, the job board badge and the Requested tab all read
      // stale until whoever opened this sheet re-fetches.
      onApplied?.();
    } catch (err) {
      onApplyFailed?.(err);
      // Shown in the sheet rather than through an alert: the alert host has to
      // clear this modal to be seen, and an inline banner sits right above the
      // button the user just pressed.
      setSubmitError(typeof err === 'string' ? err : 'Something went wrong. Please try again.');
    }
  }, [form, jobId, applyForJob, onApplied, onApplyFailed]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Padding the overlay — not the sheet — keeps the sheet's maxHeight
          measured against the space left above the keyboard. */}
      <View
        style={[styles.overlay, { paddingBottom: keyboardInset }]}
        onLayout={onLayout}
      >
        {/* Backdrop */}
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

        {/* Sheet */}
        <View style={[
          styles.sheet,
          {
            backgroundColor: colors.modalBackground,
            // The keyboard already covers the bottom safe area.
            paddingBottom: keyboardVisible ? 16 : Math.max(insets.bottom, 16),
          },
        ]}>
          <View style={styles.dragHandle} />

          {offerSent ? (
            /* ── Success ── */
            <View style={styles.successContent}>
              <Image source={Images.checkmarkIcon} style={styles.successIcon} />
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                Application Submitted
              </Text>
              <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                Your application has been submitted successfully. Wait for the company to respond.
              </Text>
              <TouchableOpacity style={styles.seeJobsBtn} onPress={handleSeeMyJobs} activeOpacity={0.85}>
                <Text style={styles.seeJobsBtnText}>See My Jobs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Form ── */
            <>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Apply For Job</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={10}>
                  <X size={RFValue(18)} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Scrollable form — submit button lives inside so keyboard never hides it */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.formContent}
              >
                {/* Verified banner */}
                <View style={styles.verifiedBanner}>
                  <ShieldCheck size={RFValue(16)} color="#92400E" strokeWidth={2} />
                  <View style={styles.verifiedTextWrap}>
                    <Text style={styles.verifiedTitle}>Profile Verified</Text>
                    <Text style={styles.verifiedSub}>
                      Your trade credentials, qualifications, and insurance certificates will be
                      automatically attached to this application from your verified profile.
                    </Text>
                  </View>
                </View>

                {/* Full Name */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
                <View style={[
                  styles.inputWrap,
                  styles.inputDisabled,
                  {
                    borderColor: errors.fullName ? '#EF4444' : colors.border,
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    value={form.fullName}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                </View>
                <FieldError message={errors.fullName} />

                {/* Proposed Hourly Rate */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Proposed Hourly Rate
                </Text>
                <View style={[
                  styles.inputWrap,
                  styles.inputRow,
                  { borderColor: errors.proposedDailyRate ? '#EF4444' : colors.border, backgroundColor: colors.surfaceSecondary },
                ]}>
                  <Text style={[styles.prefix, { color: colors.textSecondary }]}>£</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.inputPlaceholder}
                    keyboardType="decimal-pad"
                    value={form.proposedDailyRate}
                    onChangeText={(v) => set('proposedDailyRate', v.replace(/[^0-9.]/g, ''))}
                  />
                </View>
                <FieldError message={errors.proposedDailyRate} />

                {/* Message */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Message</Text>
                <View style={[
                  styles.inputWrap,
                  styles.textAreaWrap,
                  { borderColor: errors.message ? '#EF4444' : colors.border, backgroundColor: colors.surfaceSecondary },
                ]}>
                  <TextInput
                    style={[styles.input, styles.textArea, { color: colors.textPrimary }]}
                    placeholder="Introduce yourself and explain why you're a great fit..."
                    placeholderTextColor={colors.inputPlaceholder}
                    multiline
                    textAlignVertical="top"
                    value={form.message}
                    onChangeText={(v) => set('message', v)}
                  />
                </View>
                <FieldError message={errors.message} />

                {/* Documents */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Supporting Documents{' '}
                  <Text style={styles.optional}>(optional)</Text>
                </Text>

                {form.documents.length > 0 && (
                  <View style={styles.docList}>
                    {form.documents.map((doc, i) => (
                      <DocumentChip key={i} doc={doc} onRemove={() => removeDoc(i)} />
                    ))}
                  </View>
                )}

                <View style={styles.docBtnRow}>
                  <TouchableOpacity
                    style={[styles.docPickBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                    onPress={handlePickImage}
                    activeOpacity={0.8}
                  >
                    <FileText size={RFValue(13)} color="#3B82F6" strokeWidth={2} />
                    <Text style={[styles.docPickBtnText, { color: colors.textPrimary }]}>Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.docPickBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                    onPress={handlePickDocument}
                    activeOpacity={0.8}
                  >
                    <File size={RFValue(13)} color="#22C55E" strokeWidth={2} />
                    <Text style={[styles.docPickBtnText, { color: colors.textPrimary }]}>Document</Text>
                  </TouchableOpacity>
                </View>

                {submitError ? (
                  <View style={styles.submitErrorBanner}>
                    <Text style={styles.submitErrorText}>{submitError}</Text>
                  </View>
                ) : null}

                {/* Submit inside scroll so keyboard never hides it */}
                <TouchableOpacity
                  style={[styles.sendBtn, applyingForJob && styles.sendBtnDisabled]}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                  disabled={applyingForJob}
                >
                  {applyingForJob
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.sendBtnText}>Submit Application</Text>}
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(16,55,92,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
  },
  formContent: { paddingBottom: 8 },

  // Verified banner
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  verifiedTextWrap: { flex: 1 },
  verifiedTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#92400E',
    marginBottom: 2,
  },
  verifiedSub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#92400E',
    lineHeight: RFValue(14),
  },

  // Inputs
  inputLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    marginBottom: 6,
    marginTop: 10,
  },
  optional: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputDisabled: { opacity: 0.65 },
  inputRow:    { flexDirection: 'row', alignItems: 'center' },
  prefix: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(12),
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    padding: 0,
  },
  textAreaWrap: { height: 100, alignItems: 'flex-start', paddingVertical: 10 },
  textArea:     { height: 80 },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#EF4444',
    marginBottom: 4,
    marginLeft: 2,
  },

  // Documents
  docList:    { gap: 8, marginBottom: 10 },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  docChipName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#10375C',
  },
  docBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  docPickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
  },
  docPickBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
  },

  // Submit
  submitErrorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  submitErrorText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#B91C1C',
    lineHeight: RFValue(15),
  },
  sendBtn: {
    backgroundColor: '#10375C',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },

  // Success
  successContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  successIcon:  { width: RFValue(64), height: RFValue(64), marginBottom: 16 },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(17),
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    textAlign: 'center',
    lineHeight: RFValue(17),
    marginBottom: 28,
  },
  seeJobsBtn: {
    backgroundColor: '#10375C',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  seeJobsBtnText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },
});

export default ApplyJobModal;
