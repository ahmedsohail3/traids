import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Image,
} from 'react-native';
import { X, ShieldCheck, UploadCloud, CheckCircle2 } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { Images } from '~assets';

const { width, height } = Dimensions.get('window');

const ApplyJobModal = ({ visible, onClose, onSeeMyJobs, jobTitle }) => {
  const { colors } = useTheme();

  const [fullName, setFullName] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [message, setMessage] = useState('');
  const [offerSent, setOfferSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!proposedRate.trim()) e.proposedRate = 'Proposed rate is required';
    if (!message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOffer = () => {
    if (!validate()) return;
    setSubmitting(true);
    // Simulate async submission
    setTimeout(() => {
      setSubmitting(false);
      setOfferSent(true);
    }, 800);
  };

  const handleClose = () => {
    setOfferSent(false);
    setFullName('');
    setProposedRate('');
    setMessage('');
    setErrors({});
    onClose();
  };

  const handleSeeMyJobs = () => {
    handleClose();
    onSeeMyJobs?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}
        >
          <View style={[styles.sheet, { backgroundColor: colors.modalBackground }]}>
            <View style={styles.dragHandle} />

            {offerSent ? (
              /* ── Success State ── */
              <View style={styles.successContent}>
                <Image source={Images.checkmarkIcon} style={styles.successIcon} />
                <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                  Offer Sent Successfully
                </Text>
                <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                  Your offer has been sent successfully. Wait for the Company to accept.
                </Text>
                <TouchableOpacity
                  style={styles.seeJobsBtn}
                  onPress={handleSeeMyJobs}
                  activeOpacity={0.85}
                >
                  <Text style={styles.seeJobsBtnText}>See My Jobs</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── Apply Form ── */
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Apply For Job</Text>
                  <TouchableOpacity onPress={handleClose} hitSlop={10}>
                    <X size={RFValue(18)} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.formContent}
                >
                  {/* Profile Verified Banner */}
                  <View style={styles.verifiedBanner}>
                    <ShieldCheck size={RFValue(16)} color="#15803D" strokeWidth={2} />
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
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        borderColor: errors.fullName ? '#EF4444' : colors.border,
                        backgroundColor: colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="Enter your name"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={fullName}
                      onChangeText={v => {
                        setFullName(v);
                        if (errors.fullName) setErrors(p => ({ ...p, fullName: undefined }));
                      }}
                    />
                  </View>
                  {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

                  {/* Proposed Daily Rate */}
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Proposed Daily Rate
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      styles.inputRow,
                      {
                        borderColor: errors.proposedRate ? '#EF4444' : colors.border,
                        backgroundColor: colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text style={[styles.prefix, { color: colors.textSecondary }]}>£</Text>
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="£00/hour"
                      placeholderTextColor={colors.inputPlaceholder}
                      keyboardType="numeric"
                      value={proposedRate}
                      onChangeText={v => {
                        setProposedRate(v);
                        if (errors.proposedRate) setErrors(p => ({ ...p, proposedRate: undefined }));
                      }}
                    />
                  </View>
                  {errors.proposedRate ? (
                    <Text style={styles.errorText}>{errors.proposedRate}</Text>
                  ) : null}

                  {/* Message */}
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Message</Text>
                  <View
                    style={[
                      styles.inputWrap,
                      styles.textAreaWrap,
                      {
                        borderColor: errors.message ? '#EF4444' : colors.border,
                        backgroundColor: colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, styles.textArea, { color: colors.textPrimary }]}
                      placeholder="Enter message for the job"
                      placeholderTextColor={colors.inputPlaceholder}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      value={message}
                      onChangeText={v => {
                        setMessage(v);
                        if (errors.message) setErrors(p => ({ ...p, message: undefined }));
                      }}
                    />
                  </View>
                  {errors.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}

                  {/* Project Documents */}
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Project Documents
                  </Text>
                  <TouchableOpacity
                    style={[styles.uploadBox, { borderColor: colors.border }]}
                    activeOpacity={0.75}
                  >
                    <UploadCloud size={RFValue(22)} color="#94A3B8" strokeWidth={1.5} />
                    <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                      Click to upload or drag and drop
                    </Text>
                    <Text style={[styles.uploadHint, { color: '#94A3B8' }]}>
                      PDF, JPG or PNG (max. 10mb)
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.sendBtn, submitting && styles.sendBtnDisabled]}
                    onPress={handleSendOffer}
                    activeOpacity={0.85}
                    disabled={submitting}
                  >
                    <Text style={styles.sendBtnText}>
                      {submitting ? 'Sending...' : 'Send Offer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(16,55,92,0.4)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: height * 0.88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
  },
  formContent: {
    paddingBottom: 8,
  },

  // Verified Banner
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  verifiedTextWrap: {
    flex: 1,
  },
  verifiedTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#15803D',
    marginBottom: 2,
  },
  verifiedSub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#16A34A',
    lineHeight: RFValue(14),
  },

  // Form fields
  inputLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    marginBottom: 6,
    marginTop: 4,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  textAreaWrap: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  textArea: {
    height: 70,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#EF4444',
    marginBottom: 8,
    marginLeft: 2,
  },

  // Upload box
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  uploadText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
  },
  uploadHint: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },

  // Footer
  footer: {
    marginTop: 12,
  },
  sendBtn: {
    backgroundColor: '#10375C',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },

  // Success state
  successContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  successIcon: {
    width: RFValue(64),
    height: RFValue(64),
    marginBottom: 16,
  },
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
