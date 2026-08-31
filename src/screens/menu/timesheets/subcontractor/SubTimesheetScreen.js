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

// ─── Date helpers ─────────────────────────────────────────────────────────────
// Per the backend's timesheet spec (documents/TIMESHEET_MOBILE_HANDOVER.md §2).
// Every date is anchored at local noon before any day arithmetic: adding or
// subtracting days at midnight across a DST boundary shifts the calendar day.

const atNoon = (date) => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
};

// "2026-08-12T00:00:00.000Z" or "2026-08-12" → local Date at noon.
// Never `new Date(iso)` then read local getters: an instant at UTC midnight is
// already the previous day for anyone behind UTC.
const parseISODate = (value) => {
  if (!value) return null;
  const [ymd] = String(value).split('T');
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0, 0);
};

// Local calendar date out — never a UTC conversion. This is what the API's
// `date` field carries, and what the server derives the week number from.
const toISODate = (date) => {
  const d = atNoon(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const addDays = (date, days) => {
  const d = atNoon(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Monday of the week containing this date; Sunday counts back six days.
const mondayOf = (date) => {
  const d = atNoon(date);
  const dow = d.getDay();
  return addDays(d, dow === 0 ? -6 : 1 - dow);
};

const weeksBetween = (a, b) => Math.round((atNoon(b) - atNoon(a)) / (7 * 86400000));

// ─── Week model ───────────────────────────────────────────────────────────────
// Weeks are Monday-based and anchored to the job's start week — not the ISO
// calendar week, and not a rolling seven days from the start date. A job
// starting on a Wednesday has a Week 1 that is only five days long. The backend
// derives week numbers the same way, so any deviation here files hours under a
// week the server disagrees with.

const firstMondayOf = (timelineStart) => (timelineStart ? mondayOf(timelineStart) : null);

const getTotalWeeks = (timelineStart, timelineEnd) => {
  if (!timelineStart || !timelineEnd) return 1;
  return Math.max(1, weeksBetween(mondayOf(timelineStart), mondayOf(timelineEnd)) + 1);
};

const mondayOfWeek = (firstMonday, weekNum) => addDays(firstMonday, (weekNum - 1) * 7);

// The week the job is in today — null when today falls outside the timeline.
const getCurrentWeekNumber = (firstMonday, totalWeeks, today = new Date()) => {
  if (!firstMonday) return null;
  const n = weeksBetween(firstMonday, mondayOf(today)) + 1;
  return n >= 1 && n <= totalWeeks ? n : null;
};

// ─── Display helpers ──────────────────────────────────────────────────────────
const formatDayDate = (date) => {
  if (!date) return { weekday: '—', date: '—' };
  return {
    weekday: date.toLocaleDateString('en-GB', { weekday: 'long' }),
    date:    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  };
};

// "27 Aug 2026" — used in the job lifecycle and submit-blocked messages.
const formatLongDate = (date) =>
  date ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const money = (n) => `£${Number(n ?? 0).toFixed(2)}`;

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

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

// What the subcontractor is told about a week once it leaves their hands.
// Mirrors the company side's vocabulary: the API's `submitted` reads as
// "Pending" there because it is awaiting the company's review.
const STATUS_PILL = {
  submitted: { label: 'Submitted', bg: '#FEF3C7', color: '#CA8A04' },
  approved:  { label: 'Approved',  bg: '#DCFCE7', color: '#16A34A' },
  rejected:  { label: 'Rejected',  bg: '#FEE2E2', color: '#DC2626' },
};

// A week can only be sent once. Anything past `draft` is already with the
// company, so the summary becomes read-only.
const isLockedStatus = (status) =>
  Object.prototype.hasOwnProperty.call(STATUS_PILL, (status ?? '').toLowerCase());

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

  const timelineStart = useMemo(
    () => parseISODate(selectedBooking?.timelineStartDate ?? selectedBooking?.job?.timelineStartDate),
    [selectedBooking],
  );
  const timelineEnd = useMemo(
    () => parseISODate(selectedBooking?.timelineEndDate ?? selectedBooking?.job?.timelineEndDate),
    [selectedBooking],
  );

  const firstMonday = useMemo(() => firstMondayOf(timelineStart), [timelineStart]);
  const totalWeeks  = useMemo(
    () => getTotalWeeks(timelineStart, timelineEnd),
    [timelineStart, timelineEnd],
  );
  const weekNumbers = useMemo(
    () => Array.from({ length: totalWeeks }, (_, i) => i + 1),
    [totalWeeks],
  );

  // Recomputed on every render rather than memoised: the app can sit open across
  // midnight, and a stale "today" would keep yesterday loggable.
  const today         = atNoon(new Date());
  const todayISO      = toISODate(today);
  const currentWeekNum = getCurrentWeekNumber(firstMonday, totalWeeks, today);
  const isCurrentWeek  = currentWeekNum !== null && weekNumber === currentWeekNum;

  // Both bounds inclusive — on the end date itself the job is still active.
  const isJobEnded      = Boolean(timelineEnd   && today > timelineEnd);
  const isJobNotStarted = Boolean(timelineStart && today < timelineStart);

  // Open on the week the job is actually in — landing on Week 1 of a job in its
  // fourth week shows a read-only week and hides the one that can be logged.
  // A finished job opens on its last week, which is the one worth reading back.
  useEffect(() => {
    setWeekNumber(currentWeekNum ?? (isJobEnded ? totalWeeks : 1));
  }, [selectedJobId, currentWeekNum, isJobEnded, totalWeeks]);

  // Reset the inline check-in/check-out editor whenever the job or week changes
  useEffect(() => {
    setEditCheckIn(defaultCheckInTime());
    setEditCheckOut(defaultCheckOutTime());
    setEditPickerField(null);
    setEditingDate(null);
  }, [selectedJobId, weekNumber]);

  // Opens the inline editor for a given day, prefilled from its existing log (if any).
  const startEdit = (iso, log) => {
    setEditCheckIn(log ? parseTimeString(log.checkIn) : defaultCheckInTime());
    setEditCheckOut(log ? parseTimeString(log.checkOut) : defaultCheckOutTime());
    setEditPickerField(null);
    setEditingDate(iso);
  };

  const dailyLogs = useMemo(() => timesheet?.dailyLogs ?? [], [timesheet]);

  // Scoped to the selected week: switching weeks reloads `timesheet`, so a
  // submitted Week 1 does not lock an unsubmitted Week 2.
  const weekStatus = (timesheet?.status ?? '').toLowerCase();
  const weekLocked = isLockedStatus(weekStatus);
  const statusPill = STATUS_PILL[weekStatus] ?? null;

  // The seven days of the selected week, each merged with its own log. Logs are
  // matched by date — never by weekday name, which is what let one week's hours
  // appear in another week's grid.
  //
  // Days outside the job's timeline are dropped, so a job ending on a Thursday
  // does not offer Friday to Sunday. An out-of-range day that already has hours
  // on it is kept: the visible rows have to account for every hour the server
  // holds, or the week total and the invoice stop reconciling.
  const weekDays = useMemo(() => {
    const logsByDate = new Map(
      dailyLogs.map((log) => [toISODate(parseISODate(log.date) ?? new Date(log.date)), log]),
    );

    if (!firstMonday) {
      return [...logsByDate.entries()].map(([iso, log]) => ({
        iso,
        date:       parseISODate(iso),
        log,
        inTimeline: true,
        isFuture:   false,
      }));
    }

    const monday    = mondayOfWeek(firstMonday, weekNumber);
    const todayDate = parseISODate(todayISO);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
      .map((date) => {
        const iso = toISODate(date);
        return {
          date,
          iso,
          log:        logsByDate.get(iso) ?? null,
          inTimeline: (!timelineStart || date >= timelineStart) && (!timelineEnd || date <= timelineEnd),
          isFuture:   date > todayDate,
        };
      })
      .filter((row) => row.inTimeline || row.log);
  }, [firstMonday, timelineStart, timelineEnd, weekNumber, dailyLogs, todayISO]);

  // ── What can be logged / submitted (spec §4 and §5) ─────────────────────────
  // Every date restriction here is a client rule: the server accepts a log
  // against any date as long as the week is still a draft.

  const canLogRow = (row) => (
    isCurrentWeek          // past and future weeks are read-only
    && row.inTimeline
    && !row.isFuture       // you cannot log hours you have not worked yet
    && !row.log?.isLocked
    && !weekLocked         // already submitted or approved
  );

  const totalHours = timesheet?.totalHours ?? 0;
  const canSubmit  = isCurrentWeek && totalHours > 0 && Boolean(timesheet?._id) && !weekLocked;

  // Says why the button is unavailable rather than leaving a dead control.
  const submitBlockedReason = (() => {
    if (canSubmit || weekLocked) return null;
    if (isJobEnded)              return `This job ended on ${formatLongDate(timelineEnd)}.`;
    if (isJobNotStarted)         return `This job starts on ${formatLongDate(timelineStart)}.`;
    if (currentWeekNum === null) return 'This project has no active week right now.';
    if (!isCurrentWeek)          return `Only Week ${currentWeekNum} can be submitted.`;
    if (totalHours <= 0)         return 'Log at least one day before submitting.';
    return null;
  })();

  const handleConfirm = async () => {
    if (!canSubmit) return;
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

  const handleSubmitLogHours = async (row) => {
    if (!selectedJobId) return;
    try {
      // `weekNumber` is derived from the row's own date rather than the selected
      // week, so a kept out-of-range row still posts the week it belongs to.
      // The new backend derives it from `date` and ignores this, but the old one
      // falls back to a creation counter when it is absent — which drifts from
      // the calendar as soon as a week is skipped. Deprecated, still required.
      await logHours(
        selectedJobId,
        row.iso,
        dayjs(editCheckIn).format('hh:mm A'),
        dayjs(editCheckOut).format('hh:mm A'),
        firstMonday ? weeksBetween(firstMonday, mondayOf(row.date)) + 1 : weekNumber,
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
            {/* ── Job lifecycle notice ── */}
            {(isJobEnded || isJobNotStarted) && (
              <View style={styles.lifecycleNotice}>
                <Text style={styles.lifecycleTitle}>
                  {isJobEnded
                    ? `Job completed on ${formatLongDate(timelineEnd)}.`
                    : `This job starts on ${formatLongDate(timelineStart)}.`}
                </Text>
                <Text style={styles.lifecycleBody}>
                  {isJobEnded
                    ? 'This project has finished, so no more hours can be logged or submitted. Previous weeks are shown here for your records.'
                    : 'You can start logging hours once the job begins. Weeks are shown here so you can see the schedule.'}
                </Text>
              </View>
            )}

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
                      Week {weekNumber} falls outside this project's timeline.
                    </Text>
                  </View>
                ) : (
                  weekDays.map((row) => {
                    const { date, iso, log } = row;
                    const { weekday, date: dateLabel } = formatDayDate(date);
                    const isToday    = iso === todayISO;
                    const loggable   = canLogRow(row);
                    // Editors open on tap only — never auto-opened for a row.
                    const showEditor = editingDate === iso && loggable;

                    return (
                      <View key={iso} style={styles.dayBlock}>
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
                                {log.isLocked || !loggable ? (
                                  <Lock size={RFValue(13)} color="#94A3B8" strokeWidth={2} />
                                ) : (
                                  <TouchableOpacity
                                    style={styles.editLink}
                                    onPress={() => startEdit(iso, log)}
                                    activeOpacity={0.7}
                                  >
                                    <Pencil size={RFValue(11)} color="#64748B" strokeWidth={2} />
                                    <Text style={styles.editLinkText}>Edit</Text>
                                  </TouchableOpacity>
                                )}
                              </>
                            ) : (
                              <>
                                {isToday && (
                                  <View style={styles.pillToday}>
                                    <Text style={styles.pillTodayText}>Today</Text>
                                  </View>
                                )}
                                {/* Any past day of the current week can still be
                                    logged, and saves against its own date. */}
                                {loggable && !showEditor ? (
                                  <TouchableOpacity
                                    style={styles.editLink}
                                    onPress={() => startEdit(iso, null)}
                                    activeOpacity={0.7}
                                  >
                                    <Clock size={RFValue(11)} color="#64748B" strokeWidth={2} />
                                    <Text style={styles.editLinkText}>Log</Text>
                                  </TouchableOpacity>
                                ) : !isToday && (
                                  <View style={styles.pillMuted}>
                                    <Text style={styles.pillMutedText}>Not logged</Text>
                                  </View>
                                )}
                              </>
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
                                {/* The spinner otherwise takes its colours from
                                    the system appearance, so on a device in dark
                                    mode it draws light text — invisible against
                                    this card, which is always white. Pin both:
                                    themeVariant stops iOS restyling it for dark
                                    mode, textColor matches the Done button below. */}
                                <DateTimePicker
                                  value={editPickerField === 'checkIn' ? editCheckIn : editCheckOut}
                                  mode="time"
                                  display="spinner"
                                  themeVariant="light"
                                  textColor="#10375C"
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
                              <TouchableOpacity
                                style={styles.editCancelBtn}
                                onPress={() => setEditingDate(null)}
                                disabled={logging}
                              >
                                <Text style={styles.editCancelText}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.daySubmitBtn, logging && { opacity: 0.7 }]}
                                onPress={() => handleSubmitLogHours(row)}
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
                      {statusPill && (
                        <View style={[styles.pillStatus, { backgroundColor: statusPill.bg }]}>
                          <Text style={[styles.pillStatusText, { color: statusPill.color }]}>
                            {statusPill.label}
                          </Text>
                        </View>
                      )}
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
                  </>
                )}

                {/* ── Submit Timesheet ──
                    Outside the summary block on purpose: a week with no hours
                    has no timesheet record yet — it is created by the first log
                    — and that is exactly when the user needs to be told why they
                    cannot submit. */}
                {weekLocked ? (
                  <Text style={styles.submittedNote}>
                    {weekStatus === 'approved'
                      ? 'This week has been approved.'
                      : weekStatus === 'rejected'
                        ? 'This week was rejected. Contact the company for details.'
                        : 'This week has been submitted and is awaiting review.'}
                  </Text>
                ) : (
                  <>
                    <Button
                      title="Submit Timesheet"
                      variant="primary"
                      style={styles.submitInvoiceBtn}
                      onPress={() => setModalVisible(true)}
                      disabled={submitting || !canSubmit}
                    />
                    {submitBlockedReason && (
                      <Text style={styles.submitBlockedText}>{submitBlockedReason}</Text>
                    )}
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
  // Week status beside the summary heading — colours come from STATUS_PILL.
  pillStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pillStatusText: { fontFamily: FontFamily.bold, fontSize: RFValue(9) },
  submittedNote: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  // Why the submit button is unavailable — a dead control with no explanation
  // reads as a broken screen.
  submitBlockedText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  lifecycleNotice: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  lifecycleTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#92400E',
    marginBottom: 4,
  },
  lifecycleBody: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#92400E',
    lineHeight: RFValue(15),
  },
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
