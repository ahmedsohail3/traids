import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { ChevronDown, Clock, Pencil, Lock, Check, Eye } from 'lucide-react-native';
import { Button } from '~components/Common';
import SubmitInvoiceModal from './SubmitInvoiceModal';

// ─── Static mock data ──────────────────────────────────────────────────────────
const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

const DAYS = [
  { key: 'monday',    label: 'Monday',    date: '20 Nov', pill: '9h', checkIn: '08:00 AM', checkOut: '08:00 AM', showSubmit: false },
  { key: 'tuesday',   label: 'Tuesday',   date: '21 Nov', pill: '9h', checkIn: '08:00 AM', checkOut: '08:00 AM', showSubmit: false },
  { key: 'wednesday', label: 'Wednesday', date: '22 Nov', pill: '9h', checkIn: '08:00 AM', checkOut: '08:00 AM', showSubmit: true  },
  { key: 'thursday',  label: 'Thursday',  date: '23 Nov', pill: '9h', checkIn: '08:00 AM', checkOut: '08:00 AM', showSubmit: true  },
  { key: 'friday',    label: 'Friday',    date: '24 Nov', pill: '9h', checkIn: '08:00 AM', checkOut: '08:00 AM', showSubmit: true  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const TimeRow = ({ label, value }) => (
  <View style={styles.timeRow}>
    <Text style={styles.timeLabel}>{label}</Text>
    <View style={styles.timeValRow}>
      <Text style={styles.timeVal}>{value}</Text>
      <Clock size={RFValue(11)} color="#94A3B8" />
    </View>
  </View>
);

const SummaryRow = ({ label, value }) => (
  <View style={styles.summaryRowInner}>
    <Text style={styles.summaryRowLabel}>{label}</Text>
    <Text style={styles.summaryRowVal}>
      {value}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const SubTimesheetScreen = () => {
  const { colors } = useTheme();
  // activeWeek = first incomplete week index. idx < activeWeek means completed.
  const [activeWeek, setActiveWeek] = useState(1); // Week 1 (idx=0) is completed
  const [modalVisible, setModalVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleConfirm = () => setSubmitted(true);
  const handleClose = () => { setModalVisible(false); setSubmitted(false); };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Timesheets"
        subtitle="Log your work and submit approval"
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* ── Project Selector ── */}
        <View style={styles.projectHeader}>
          <View>
            <Text style={styles.projectHeaderLabel}>Select Project</Text>
          </View>
          <Text style={styles.totalHours}>Total Week Hours: <Text style={styles.totalHoursVal}>68.3 hrs</Text></Text>
        </View>

        <TouchableOpacity style={styles.projectSelector}>
          <View style={styles.projectIconWrap}>
            <Text style={styles.projectIconText}>🏢</Text>
          </View>
          <View style={styles.projectSelectorInfo}>
            <Text style={styles.projectSelectorName}>Riverside Apartment Cleaning</Text>
            <Text style={styles.projectSelectorMeta}>Buildright Construction · 3 Weeks</Text>
          </View>
          <ChevronDown size={RFValue(16)} color="#64748B" />
        </TouchableOpacity>

        {/* ── Week Progress Stepper ── */}
        <Text style={styles.sectionTitle}>Project Progress</Text>
        <View style={styles.stepper}>
          {WEEKS.map((week, idx) => {
            const isCompleted = idx < activeWeek;
            return (
              <React.Fragment key={week}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, isCompleted && styles.stepDotCompleted]}>
                    {isCompleted
                      ? <Check size={RFValue(12)} color="#FFFFFF" strokeWidth={3} />
                      : <Lock size={RFValue(12)} color="#94A3B8" strokeWidth={2} />
                    }
                  </View>
                  <Text style={styles.stepLabel}>{week}</Text>
                </View>
                {idx < WEEKS.length - 1 && (
                  <View style={styles.stepLine} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* ── Daily Hours Log ── */}
        <Text style={styles.sectionTitle}>Log Daily Hours</Text>
        {DAYS.map((day) => (
          <View key={day.key} style={styles.dayBlock}>
            {/* Day header */}
            <View style={styles.dayHeader}>
              <View>
                <Text style={styles.dayName}>{day.label}</Text>
                <Text style={styles.dayDate}>{day.date}</Text>
              </View>
              <View style={styles.dayHeaderRight}>
                <View style={styles.pillGreen}>
                  <Text style={styles.pillText}>{day.pill}</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                  <Pencil size={RFValue(10)} color="#64748B" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time rows — full width, stacked */}
            <View style={[styles.timeRow, !day.showSubmit && styles.timeRowChecked]}>
              <Text style={styles.timeLabel}>Checked In</Text>
              <View style={styles.timeValRow}>
                <Text style={styles.timeVal}>{day.checkIn}</Text>
                <Clock size={RFValue(12)} color={colors.primary} />
              </View>
            </View>
            <View style={[styles.timeRow,styles.timeRowGap, !day.showSubmit && styles.timeRowChecked]}>
              <Text style={styles.timeLabel}>Check Out</Text>
              <View style={styles.timeValRow}>
                <Text style={styles.timeVal}>{day.checkOut}</Text>
                <Clock size={RFValue(12)} color={colors.primary} />
              </View>
            </View>

            {/* Conditional Submit */}
            {day.showSubmit && (
              <Button
                title="Submit"
                variant="primary"
                style={styles.daySubmitBtn}
                onPress={() => {}}
              />
            )}
          </View>
        ))}

        {/* ── Submission Summary ── */}
        <View style={styles.summarySectionTitleContainer}>
          <Eye size={RFValue(14)} color={colors.secondary} />
          <Text style={styles.summarySectionTitle}>SUBMISSION SUMMARY</Text>
        </View>
        <View style={styles.summarySection}>
          <View style={styles.summaryAccentBar} />
          <View style={styles.summaryContent}>
            <SummaryRow label="Total Hours Worked" value="23 hrs" />
            <SummaryRow label="Hourly Rate" value="£30/hr" />
            <SummaryRow label="Gross Amount" value="£690.00" />
            <SummaryRow label="Platform Fee (10%)" value="-£34.00" />
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryRowTotalLabel}>Total Payable</Text>
              <Text style={styles.summaryRowTotalVal}>£ 621.00</Text>
            </View>
            <Text style={styles.summaryNote}>CIS tax will be applied upon acceptance</Text>
          </View>
        </View>

        {/* ── Final Submit Invoice ── */}
        <Button
          title="Submit Invoice"
          variant="primary"
          style={styles.submitInvoiceBtn}
          onPress={() => setModalVisible(true)}
        />
      </ScrollView>

      <SubmitInvoiceModal
        visible={modalVisible}
        onClose={handleClose}
        onConfirm={handleConfirm}
        submitted={submitted}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 120 },

  // Project header
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectHeaderLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
  },
  totalHours: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  totalHoursVal: {
    fontFamily: FontFamily.bold,
    color: '#10375C',
  },
  projectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    gap: 10,
  },
  projectIconWrap: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  projectIconText: { fontSize: RFValue(18) },
  projectSelectorInfo: { flex: 1 },
  projectSelectorName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11.5),
    color: '#10375C',
    marginBottom: 2,
  },
  projectSelectorMeta: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },

  // Section title
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    marginBottom: 12,
  },

  // Week Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  stepItem: { alignItems: 'center', gap: 6 },
  stepDot: {
    width: 30, height: 30, borderRadius: 18,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  stepDotCompleted: { backgroundColor: '#22C55E', borderColor: '#22C55E', borderWidth: 1 },
  stepLabel: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  stepLabelCompleted: { color: '#10375C' },
  stepLine: {
    flex: 1, height: 1.5, backgroundColor: '#E2E8F0', marginBottom: 22, marginHorizontal: 4,
  },

  // Day blocks
  dayBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#64748B',
  },
  dayDate: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  dayHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillGreen: {
    backgroundColor: '#3BB273', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
  },
  pillText: { fontFamily: FontFamily.bold, fontSize: RFValue(9), color: '#FFFFFF' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  editBtnText: { fontFamily: FontFamily.bold, fontSize: RFValue(9), color: '#64748B' },

  // Time rows — full width, stacked with green tint
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,borderColor: '#E2E8F0'
  },
  timeRowChecked: {
    backgroundColor: '#F0FAF4',
    borderColor: '#AFEEC6'
  },
  timeRowGap: { marginTop: 8 },
  timeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#64748B',
  },
  timeValRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeVal: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  daySubmitBtn: { marginTop: 12 },

  // Submission summary
  summarySection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  summaryAccentBar: { width: 4, backgroundColor: '#F97316' },
  summaryContent: { flex: 1, padding: 14 },
  summarySectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summarySectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(10),
    letterSpacing: 0.8,
  },
  summaryRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryRowLabel: { fontFamily: FontFamily.regular, fontSize: RFValue(10.5), color: '#64748B' },
  summaryRowVal: { fontFamily: FontFamily.semiBold, fontSize: RFValue(10.5), color: '#10375C' },
  summaryDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 10,
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 10, backgroundColor: '#F8FAFC'
  },
  summaryRowTotalLabel: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(10.5),
    color: '#10375C',
  },
  summaryRowTotalVal: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(10.5),
    color: '#10375C',
  },
  summaryNote: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center'
  },
  submitInvoiceBtn: { marginBottom: 8 },
});

export default SubTimesheetScreen;
