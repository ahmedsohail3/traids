/**
 * SendOfferModal — Bottom-sheet modal for sending a job offer to a subcontractor.
 * Also contains the success overlay shown after the offer is submitted.
 *
 * Props:
 *   visible     boolean
 *   onClose     function
 *   onSent      function   called after offer is sent (show success overlay)
 *   subName     string
 */
import React, { useState } from 'react';
import {
  View, StyleSheet, Modal, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { X, ChevronDown, MapPin, Calendar, CheckCircle2, Upload, Bold, Italic, List } from 'lucide-react-native';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const EXISTING_JOBS = ['Start from scratch...', 'Downtown Office Renovation', 'Westside Apartment Complex'];

const SendOfferModal = ({ visible, onClose, onSent, subName = 'Subcontractor' }) => {
  const [selectedJob, setSelectedJob] = useState('Start from scratch...');
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [form, setForm] = useState({
    title: '',
    trade: '',
    description: '',
    address: '',
    startDate: '',
    endDate: '',
    rate: '',
  });
  const [success, setSuccess] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSend = () => {
    setSuccess(true);
  };

  const handleDone = () => {
    setSuccess(false);
    onSent?.();
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetContainer}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Sending Offer</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <X size={RFValue(16)} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Select existing job */}
            <Text style={styles.fieldLabel}>SELECT EXISTING JOB</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setShowJobPicker(!showJobPicker)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownText}>{selectedJob}</Text>
              <ChevronDown size={RFValue(14)} color="#94A3B8" />
            </TouchableOpacity>
            {showJobPicker && (
              <View style={styles.dropdownList}>
                {EXISTING_JOBS.map(j => (
                  <TouchableOpacity
                    key={j}
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedJob(j); setShowJobPicker(false); }}
                  >
                    <Text style={[styles.dropdownItemText, j === selectedJob && { color: '#F2A154', fontFamily: FontFamily.semiBold }]}>{j}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Job Title */}
            <Text style={styles.fieldLabel}>Job Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Downtown Office Renovation"
              placeholderTextColor="#CBD5E1"
              value={form.title}
              onChangeText={v => set('title', v)}
            />

            {/* Trade Required */}
            <Text style={styles.fieldLabel}>Trade Required</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Select trade..."
              placeholderTextColor="#CBD5E1"
              value={form.trade}
              onChangeText={v => set('trade', v)}
            />

            {/* Description */}
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Description</Text>
              <Text style={styles.markdownSupport}>Markdown support</Text>
            </View>
            <View style={[styles.textInput, styles.descriptionWrapper]}>
              <View style={styles.formatToolbar}>
                <TouchableOpacity style={styles.formatBtn}><Bold size={RFValue(12)} color="#94A3B8" /></TouchableOpacity>
                <TouchableOpacity style={styles.formatBtn}><Italic size={RFValue(12)} color="#94A3B8" /></TouchableOpacity>
                <TouchableOpacity style={[styles.formatBtn, styles.formatBtnActive]}>
                  <List size={RFValue(12)} color="#10375C" />
                  <Text style={styles.formatBtnText}>List</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.multilineInput}
                placeholder="Add job description..."
                placeholderTextColor="#CBD5E1"
                value={form.description}
                onChangeText={v => set('description', v)}
                multiline
                textAlignVertical="top"
              />
            </View>


            {/* Site Address */}
            <Text style={styles.fieldLabel}>Site Address</Text>
            <View style={styles.iconInput}>
              <MapPin size={RFValue(13)} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.iconInputText}
                placeholder="Add full address..."
                placeholderTextColor="#CBD5E1"
                value={form.address}
                onChangeText={v => set('address', v)}
              />
            </View>

            {/* Timeline */}
            <Text style={styles.fieldLabel}>Timeline</Text>
            <View style={styles.timelineRow}>
              <View style={[styles.iconInput, { flex: 1 }]}>
                <Calendar size={RFValue(12)} color="#94A3B8" style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.iconInputText}
                  placeholder="mm/dd/yy"
                  placeholderTextColor="#CBD5E1"
                  value={form.startDate}
                  onChangeText={v => set('startDate', v)}
                />
              </View>
              <View style={{ width: 8 }} />
              <View style={[styles.iconInput, { flex: 1 }]}>
                <Calendar size={RFValue(12)} color="#94A3B8" style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.iconInputText}
                  placeholder="mm/dd/yy"
                  placeholderTextColor="#CBD5E1"
                  value={form.endDate}
                  onChangeText={v => set('endDate', v)}
                />
              </View>
            </View>

            {/* Hourly Rate */}
            <Text style={styles.fieldLabel}>Hourly Rate *</Text>
            <View style={styles.iconInput}>
              <Text style={styles.poundSign}>£</Text>
              <TextInput
                style={styles.iconInputText}
                placeholder="0"
                placeholderTextColor="#CBD5E1"
                keyboardType="numeric"
                value={form.rate}
                onChangeText={v => set('rate', v)}
              />
            </View>

            {/* Project Documents */}
            <Text style={styles.fieldLabel}>Project Documents</Text>
            <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7}>
              <Upload size={RFValue(18)} color="#94A3B8" style={{ marginBottom: 8 }} />
              <Text style={styles.uploadText}>Click to upload Qualifications</Text>
              <Text style={styles.uploadSub}>MAX. SIZE 5 MB (PDF, DOC, DOCX)</Text>
            </TouchableOpacity>

            {/* Send button */}
            <Button
              title="Send Offer"
              variant="primary"
              onPress={handleSend}
              style={styles.sendBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Success Overlay */}
      <Modal visible={success} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <CheckCircle2 size={RFValue(50)} color="#22C55E" strokeWidth={1.5} />
            </View>
            <Text style={styles.successTitle}>Offer Sent Successfully</Text>
            <Text style={styles.successSub}>
              Your offer has been sent successfully.{'\n'}Wait for subcontractor to accept.
            </Text>
            <Button
              title="See My Jobs"
              variant="primary"
              onPress={handleDone}
              style={styles.successBtn}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    color: '#10375C',
  },
  closeBtn: { padding: 4 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  fieldLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
    color: '#10375C',
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  markdownSupport: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  dropdownText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#64748B',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    marginTop: -10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dropdownItemText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#1E293B',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  descriptionWrapper: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  formatToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  formatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formatBtnActive: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formatBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#10375C',
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
  },
  iconInputText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
    padding: 0,
  },
  poundSign: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#94A3B8',
    marginRight: 6,
  },
  timelineRow: { flexDirection: 'row' },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  uploadText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 4,
  },
  uploadSub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(8),
    color: '#94A3B8',
  },
  sendBtn: { marginBottom: 4 },

  // Success overlay
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  successIconWrap: {
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(16),
    color: '#10375C',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: RFValue(17),
    marginBottom: 24,
  },
  successBtn: {},
});

export default SendOfferModal;
