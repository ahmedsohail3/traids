import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Platform } from 'react-native';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { ChevronDown, Clock, Pencil, Lock, Eye } from 'lucide-react-native';
import { Button } from '~components/Common';
import SubmitInvoiceModal from './SubmitInvoiceModal';
import useSubcontractorBookings from '~hooks/useSubcontractorBookings';
import useSubcontractorTimesheet from '~hooks/useSubcontractorTimesheet';
import useAlert from '~hooks/useAlert';
import dayjs from 'dayjs';

let TimePicker;
let DateTimePicker;
if (Platform.OS === 'android') {
  TimePicker = require('react-native-date-picker').default;
} else {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDayDate = (iso) => {
  if (!iso) return { weekday: '—', date: '—' };
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString('en-GB', { weekday: 'long' }),
    date:    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  };
};

const money = (n) => `£${Number(n ?? 0).toFixed(2)}`;

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Date-only key (UTC) so day comparisons aren't affected by local timezone drift.
const dateKey = (d) => d.toISOString().slice(0, 10);

const addDaysUTC = (date, days) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

// How many 7-day weeks the project spans, based on its timeline dates.
const getProjectTotalWeeks = (startIso, endIso) => {
  if (!startIso || !endIso) return 1;
  const start = new Date(startIso);
  const end   = new Date(endIso);
  const diffDays = Math.floor((end - start) / 86400000) + 1;
  return Math.max(1, Math.ceil(diffDays / 7));
};

// Every calendar day in the given week of the project — Week 1 starts on the
// project's own timeline start date, not a calendar Monday.
const getWeekDates = (startIso, endIso, weekNumber) => {
  const start = new Date(startIso);
  const end   = endIso ? new Date(endIso) : null;
  const weekStart = addDaysUTC(start, (weekNumber - 1) * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = addDaysUTC(weekStart, i);
    if (end && d > end) break;
    days.push(d);
  }
  return days;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SummaryRow = ({ label, value }) => (
  <View style={styles.summaryRowInner}>
    <Text style={styles.summaryRowLabel}>{label}</Text>
    <Text style={styles.summaryRowVal}>
      {value}
    </Text>
  </View>
);

// Project selector — shows in-progress bookings for the subcontractor to pick from.
const ProjectPicker = ({ bookings, selectedBooking, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.projectSelector}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <View style={styles.projectIconWrap}>
          <Text style={styles.projectIconText}>🏢</Text>
        </View>
        <View style={styles.projectSelectorInfo}>
          <Text style={styles.projectSelectorName} numberOfLines={1}>
            {selectedBooking?.jobTitle ?? 'Select a project'}
          </Text>
          <Text style={styles.projectSelectorMeta} numberOfLines={1}>
            {selectedBooking
              ? `${selectedBooking.company?.companyName ?? '—'} · ${capitalize(selectedBooking.trade) ?? '—'}`
              : `${bookings.length} job${bookings.length !== 1 ? 's' : ''} in progress`}
          </Text>
        </View>
        <ChevronDown size={RFValue(16)} color="#64748B" />
      </TouchableOpacity>

      {open && (
        <View style={styles.projectDropdownMenu}>
          {bookings.length === 0 ? (
            <Text style={styles.projectDropdownEmpty}>No projects in progress.</Text>
          ) : (
            bookings.map((b) => {
              const active = selectedBooking?._id === b._id;
              return (
                <TouchableOpacity
                  key={b._id}
                  style={[styles.projectDropdownItem, active && styles.projectDropdownItemActive]}
                  onPress={() => { onSelect(b._id); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.projectDropdownItemText, active && styles.projectDropdownItemTextActive]} numberOfLines={1}>
                    {b.jobTitle ?? 'Untitled Job'}
                  </Text>
                  <Text style={styles.projectDropdownItemMeta} numberOfLines={1}>
                    {b.company?.companyName ?? '—'}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
};

// Week selector — plain row of dots for short projects; horizontal scroll for
// longer ones so the week numbers don't feel clustered together.
const WeekStepper = ({ weekNumbers, weekNumber, onSelect }) => {
  if (weekNumbers.length <= 4) {
    return (
      <View style={styles.stepper}>
        {weekNumbers.map((wk, idx) => {
          const active = wk === weekNumber;
          return (
            <React.Fragment key={wk}>
              <TouchableOpacity style={styles.stepItem} onPress={() => onSelect(wk)} activeOpacity={0.7}>
                <View style={[styles.stepDot, active && styles.stepDotCompleted]}>
                  <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>{wk}</Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelCompleted]}>Week {wk}</Text>
              </TouchableOpacity>
              {idx < weekNumbers.length - 1 && <View style={styles.stepLine} />}
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={weekNumbers}
      keyExtractor={(wk) => String(wk)}
      showsHorizontalScrollIndicator={false}
      style={styles.stepperScroll}
      contentContainerStyle={styles.stepperScrollContent}
      renderItem={({ item: wk }) => {
        const active = wk === weekNumber;
        return (
          <TouchableOpacity style={styles.stepItemScroll} onPress={() => onSelect(wk)} activeOpacity={0.7}>
            <Text style={[styles.stepLabel, active && styles.stepLabelCompleted]}>Week {wk}</Text>
            <View style={[styles.stepDot, active && styles.stepDotCompleted]}>
              <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>{wk}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const defaultCheckInTime  = () => dayjs().hour(8).minute(0).second(0).toDate();
const defaultCheckOutTime = () => dayjs().hour(17).minute(0).second(0).toDate();

// Parses "08:00 AM" style strings (as returned/expected by the API) into a Date.
const parseTimeString = (str) => {
  const match = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i.exec((str ?? '').trim());
  if (!match) return defaultCheckInTime();
  let hh = parseInt(match[1], 10);
  const mm = parseInt(match[2], 10);
  const ap = match[3];
  if (/pm/i.test(ap) && hh !== 12) hh += 12;
  if (/am/i.test(ap) && hh === 12) hh = 0;
  return dayjs().hour(hh).minute(mm).second(0).toDate();
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const SubTimesheetScreen = () => {
  const { colors } = useTheme();

  const { showAlert } = useAlert();
  const { inProgress, getBookings } = useSubcontractorBookings();
  const {
    timesheet, loading, error, getMyJobTimesheet,
    logHours, logging,
    submitWeekTimesheet, submitting,
  } = useSubcontractorTimesheet();

  const [submitMessage, setSubmitMessage] = useState(null);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [weekNumber,    setWeekNumber]    = useState(1);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [submitted,     setSubmitted]     = useState(false);

  // Inline check-in/check-out editor — at most one day is editable at a time.
  // `editingDate` is the date-key of the logged day currently being edited (null
  // when logging a fresh, previously-unlogged day instead of editing an existing one).
  const [editCheckIn,     setEditCheckIn]     = useState(defaultCheckInTime());
  const [editCheckOut,    setEditCheckOut]    = useState(defaultCheckOutTime());
  const [editPickerField, setEditPickerField] = useState(null); // 'checkIn' | 'checkOut' | null
  const [editingDate,     setEditingDate]     = useState(null);

  useEffect(() => { getBookings(); }, []);

  // Auto-select the first in-progress job once bookings load
  useEffect(() => {
    if (!selectedJobId && inProgress.length > 0) {
      setSelectedJobId(inProgress[0]._id);
    }
  }, [inProgress, selectedJobId]);

  useEffect(() => {
    if (selectedJobId) getMyJobTimesheet(selectedJobId, weekNumber);
  }, [selectedJobId, weekNumber]);

  const selectedBooking = useMemo(
    () => inProgress.find((b) => b._id === selectedJobId) ?? null,
    [inProgress, selectedJobId],
  );

  const timelineStart = selectedBooking?.timelineStartDate ?? selectedBooking?.job?.timelineStartDate ?? null;
  const timelineEnd   = selectedBooking?.timelineEndDate   ?? selectedBooking?.job?.timelineEndDate   ?? null;

  const totalWeeks = useMemo(
    () => getProjectTotalWeeks(timelineStart, timelineEnd),
    [timelineStart, timelineEnd],
  );
  const weekNumbers = useMemo(
    () => Array.from({ length: totalWeeks }, (_, i) => i + 1),
    [totalWeeks],
  );

  // Reset to Week 1 whenever a different project is selected
  useEffect(() => { setWeekNumber(1); }, [selectedJobId]);

  // Reset the inline check-in/check-out editor whenever the job or week changes
  useEffect(() => {
    setEditCheckIn(defaultCheckInTime());
    setEditCheckOut(defaultCheckOutTime());
    setEditPickerField(null);
    setEditingDate(null);
  }, [selectedJobId, weekNumber]);

  // Opens the inline editor for a given day, prefilled from its existing log (if any).
  const startEdit = (date, log) => {
    setEditCheckIn(log ? parseTimeString(log.checkIn) : defaultCheckInTime());
    setEditCheckOut(log ? parseTimeString(log.checkOut) : defaultCheckOutTime());
    setEditPickerField(null);
    setEditingDate(dateKey(date));
  };

  const dailyLogs = timesheet?.dailyLogs ?? [];

  // Every calendar day in the selected week, merged with any logged hours for that day —
  // so days with no logged hours still render (the subcontractor can see what's outstanding).
  const weekDays = useMemo(() => {
    if (!timelineStart) {
      return dailyLogs.map((log) => ({ date: new Date(log.date), log }));
    }
    const dates = getWeekDates(timelineStart, timelineEnd, weekNumber);
    const logsByDate = new Map(dailyLogs.map((log) => [dateKey(new Date(log.date)), log]));
    return dates.map((d) => ({ date: d, log: logsByDate.get(dateKey(d)) ?? null }));
  }, [timelineStart, timelineEnd, weekNumber, dailyLogs]);

  const handleConfirm = async () => {
    if (!timesheet?._id) return;
    try {
      const result = await submitWeekTimesheet(timesheet._id);
      setSubmitMessage(result?.message ?? null);
      setSubmitted(true);
      getMyJobTimesheet(selectedJobId, weekNumber);
    } catch (err) {
      showAlert({
        title:   'Error',
        message: typeof err === 'string' ? err : 'Failed to submit timesheet. Please try again.',
        type:    'error',
      });
    }
  };
  const handleClose = () => { setModalVisible(false); setSubmitted(false); setSubmitMessage(null); };

  const handleSubmitLogHours = async (date) => {
    if (!selectedJobId) return;
    try {
      await logHours(
        selectedJobId,
        dateKey(date),
        dayjs(editCheckIn).format('hh:mm A'),
        dayjs(editCheckOut).format('hh:mm A'),
      );
      setEditingDate(null);
      getMyJobTimesheet(selectedJobId, weekNumber);
      showAlert({ title: 'Logged', message: 'Hours logged successfully.', type: 'success' });
    } catch (err) {
      showAlert({
        title:   'Error',
        message: typeof err === 'string' ? err : 'Failed to log hours. Please try again.',
        type:    'error',
      });
    }
  };

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
          <Text style={styles.totalHours}>
            Total Week Hours: <Text style={styles.totalHoursVal}>{timesheet?.totalHours ?? 0} hrs</Text>
          </Text>
        </View>

        <ProjectPicker
          bookings={inProgress}
          selectedBooking={selectedBooking}
          onSelect={setSelectedJobId}
        />

        {!selectedJobId ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Select an in-progress project to view its timesheet.
            </Text>
          </View>
        ) : (
          <>
            {/* ── Week Selector ── */}
            <Text style={styles.sectionTitle}>Project Progress</Text>
            <WeekStepper weekNumbers={weekNumbers} weekNumber={weekNumber} onSelect={setWeekNumber} />

            {loading && (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}

            {!loading && error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {!loading && !error && (
              <>
                {/* ── Daily Hours Log ── */}
                <Text style={styles.sectionTitle}>Log Daily Hours</Text>
                {weekDays.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      No days found for Week {weekNumber}.
                    </Text>
                  </View>
                ) : (
                  weekDays.map(({ date, log }, idx) => {
                    const { weekday, date: dateLabel } = formatDayDate(date.toISOString());
                    const isToday = dateKey(date) === dateKey(new Date());
                    const isEditingThisDay = editingDate === dateKey(date);
                    const showEditor = isEditingThisDay || (!log && isToday);

                    return (
                      <View key={idx} style={styles.dayBlock}>
                        <View style={styles.dayHeader}>
                          <View>
                            <Text style={styles.dayName}>{weekday}</Text>
                            <Text style={styles.dayDate}>{dateLabel}</Text>
                          </View>
                          <View style={styles.dayHeaderRight}>
                            {log ? (
                              <>
                                <View style={styles.pillGreen}>
                                  <Text style={styles.pillText}>{log.hoursWorked}h</Text>
                                </View>
                                {log.isLocked ? (
                                  <Lock size={RFValue(13)} color="#94A3B8" strokeWidth={2} />
                                ) : (
                                  <TouchableOpacity
                                    style={styles.editLink}
                                    onPress={() => startEdit(date, log)}
                                    activeOpacity={0.7}
                                  >
                                    <Pencil size={RFValue(11)} color="#64748B" strokeWidth={2} />
                                    <Text style={styles.editLinkText}>Edit</Text>
                                  </TouchableOpacity>
                                )}
                              </>
                            ) : isToday ? (
                              <View style={styles.pillToday}>
                                <Text style={styles.pillTodayText}>Today</Text>
                              </View>
                            ) : (
                              <View style={styles.pillMuted}>
                                <Text style={styles.pillMutedText}>Not logged</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {showEditor ? (
                          <>
                            <TouchableOpacity
                              style={[styles.timeRow, styles.timeRowEditable]}
                              onPress={() => setEditPickerField('checkIn')}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.timeLabel}>Checked In</Text>
                              <View style={styles.timeValRow}>
                                <Text style={styles.timeVal}>{dayjs(editCheckIn).format('hh:mm A')}</Text>
                                <Clock size={RFValue(12)} color={colors.primary} />
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.timeRow, styles.timeRowEditable, styles.timeRowGap]}
                              onPress={() => setEditPickerField('checkOut')}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.timeLabel}>Check Out</Text>
                              <View style={styles.timeValRow}>
                                <Text style={styles.timeVal}>{dayjs(editCheckOut).format('hh:mm A')}</Text>
                                <Clock size={RFValue(12)} color={colors.primary} />
                              </View>
                            </TouchableOpacity>

                            {Platform.OS === 'ios' && editPickerField && (
                              <View style={styles.iosTimePickerWrap}>
                                <DateTimePicker
                                  value={editPickerField === 'checkIn' ? editCheckIn : editCheckOut}
                                  mode="time"
                                  display="spinner"
                                  onChange={(_, d) => {
                                    if (!d) return;
                                    if (editPickerField === 'checkIn') setEditCheckIn(d);
                                    else setEditCheckOut(d);
                                  }}
                                />
                                <TouchableOpacity style={styles.iosTimeDoneBtn} onPress={() => setEditPickerField(null)}>
                                  <Text style={styles.iosTimeDoneText}>Done</Text>
                                </TouchableOpacity>
                              </View>
                            )}

                            <View style={styles.dayEditActions}>
                              {log && (
                                <TouchableOpacity
                                  style={styles.editCancelBtn}
                                  onPress={() => setEditingDate(null)}
                                  disabled={logging}
                                >
                                  <Text style={styles.editCancelText}>Cancel</Text>
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                style={[styles.daySubmitBtn, logging && { opacity: 0.7 }]}
                                onPress={() => handleSubmitLogHours(date)}
                                activeOpacity={0.85}
                                disabled={logging}
                              >
                                {logging
                                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                                  : <Text style={styles.daySubmitBtnText}>Log Hours</Text>}
                              </TouchableOpacity>
                            </View>
                          </>
                        ) : log ? (
                          <>
                            <View style={styles.timeRow}>
                              <Text style={styles.timeLabel}>Checked In</Text>
                              <View style={styles.timeValRow}>
                                <Text style={styles.timeVal}>{log.checkIn ?? '—'}</Text>
                                <Clock size={RFValue(12)} color={colors.primary} />
                              </View>
                            </View>
                            <View style={[styles.timeRow, styles.timeRowGap]}>
                              <Text style={styles.timeLabel}>Check Out</Text>
                              <View style={styles.timeValRow}>
                                <Text style={styles.timeVal}>{log.checkOut ?? '—'}</Text>
                                <Clock size={RFValue(12)} color={colors.primary} />
                              </View>
                            </View>
                          </>
                        ) : (
                          <View style={styles.unloggedRow}>
                            <Text style={styles.unloggedText}>No hours logged for this day yet.</Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}

                {/* ── Submission Summary ── */}
                {timesheet && (
                  <>
                    <View style={styles.summarySectionTitleContainer}>
                      <Eye size={RFValue(14)} color={colors.secondary} />
                      <Text style={styles.summarySectionTitle}>SUBMISSION SUMMARY</Text>
                    </View>
                    <View style={styles.summarySection}>
                      <View style={styles.summaryAccentBar} />
                      <View style={styles.summaryContent}>
                        <SummaryRow label="Total Hours Worked" value={`${timesheet.totalHours} hrs`} />
                        <SummaryRow label="Hourly Rate" value={`${money(timesheet.hourlyRate)}/hr`} />
                        <SummaryRow label="Gross Amount" value={money(timesheet.grossAmount)} />
                        <SummaryRow
                          label={`Platform Fee (${Math.round((timesheet.platformFeePercent ?? 0) * 100)}%)`}
                          value={`-${money(timesheet.platformFee)}`}
                        />
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRowTotal}>
                          <Text style={styles.summaryRowTotalLabel}>Total Payable</Text>
                          <Text style={styles.summaryRowTotalVal}>{money(timesheet.netPayable)}</Text>
                        </View>
                        <Text style={styles.summaryNote}>CIS tax will be applied upon acceptance</Text>
                      </View>
                    </View>

                    {/* ── Submit Timesheet ── */}
                    <Button
                      title="Submit Timesheet"
                      variant="primary"
                      style={styles.submitInvoiceBtn}
                      onPress={() => setModalVisible(true)}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      <SubmitInvoiceModal
        visible={modalVisible}
        onClose={handleClose}
        onConfirm={handleConfirm}
        submitted={submitted}
        submitting={submitting}
        submitMessage={submitMessage}
        totalHours={timesheet?.totalHours ?? 0}
        totalPayable={timesheet?.netPayable ?? 0}
        grossAmount={timesheet?.grossAmount ?? 0}
        jobTitle={selectedBooking?.jobTitle ?? 'this project'}
        companyName={selectedBooking?.company?.companyName ?? 'the company'}
      />

      {Platform.OS === 'android' && editPickerField && (
        <TimePicker
          modal
          open
          date={editPickerField === 'checkIn' ? editCheckIn : editCheckOut}
          mode="time"
          onConfirm={(date) => {
            if (editPickerField === 'checkIn') setEditCheckIn(date);
            else setEditCheckOut(date);
            setEditPickerField(null);
          }}
          onCancel={() => setEditPickerField(null)}
        />
      )}
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
  projectDropdownMenu: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  projectDropdownEmpty: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
    padding: 14,
    textAlign: 'center',
  },
  projectDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  projectDropdownItemActive: { backgroundColor: '#F0F6FF' },
  projectDropdownItemText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#1E293B',
    marginBottom: 2,
  },
  projectDropdownItemTextActive: { color: '#10375C' },
  projectDropdownItemMeta: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },

  // Empty / loading / error states
  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontFamily: FontFamily.regular, fontSize: RFValue(11), textAlign: 'center' },
  loaderWrap: { paddingVertical: 24, alignItems: 'center' },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#EF4444',
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Section title
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    marginBottom: 12,
    marginTop: 20,
  },

  // Week selector
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  stepItem: { alignItems: 'center', gap: 6, flex: 1 },
  stepDot: {
    width: 30, height: 30, borderRadius: 18,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  stepDotCompleted: { backgroundColor: '#10375C', borderColor: '#10375C' },
  stepDotText: { fontFamily: FontFamily.bold, fontSize: RFValue(10), color: '#94A3B8' },
  stepDotTextActive: { color: '#FFFFFF' },
  stepLabel: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  stepLabelCompleted: { color: '#10375C' },
  stepLine: {
    width: 16, height: 1.5, backgroundColor: '#E2E8F0', marginBottom: 22,
  },
  stepperScroll: {
    flexGrow: 0,
    height: 92,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  stepperScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 20,
    alignItems: 'center',
  },
  stepItemScroll: { alignItems: 'center', gap: 6 },

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
  pillMuted: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
  },
  pillMutedText: { fontFamily: FontFamily.bold, fontSize: RFValue(9), color: '#94A3B8' },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editLinkText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(10), color: '#64748B' },
  unloggedRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  unloggedText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
    textAlign: 'center',
  },

  // Time rows — full width, stacked
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FAF4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1, borderColor: '#AFEEC6',
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

  // Today / Log Hours
  pillToday: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
  },
  pillTodayText: { fontFamily: FontFamily.bold, fontSize: RFValue(9), color: '#CA8A04' },
  iosTimePickerWrap: {
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  iosTimeDoneBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  iosTimeDoneText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  timeRowEditable: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  dayEditActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  daySubmitBtn: {
    backgroundColor: '#10375C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
  },
  daySubmitBtnText: { fontFamily: FontFamily.bold, fontSize: RFValue(13), color: '#FFFFFF' },
  editCancelBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#64748B' },
});

export default SubTimesheetScreen;
