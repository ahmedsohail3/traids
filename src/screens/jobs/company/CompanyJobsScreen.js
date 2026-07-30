import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator,
  Modal, KeyboardAvoidingView, Platform, ScrollView as RNScrollView,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Search, X, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import JobCard from '~components/Common/JobCard';
import FilterTabs from '~components/Common/FilterTabs';
import useCompanyJobs from '~hooks/useCompanyJobs';
import useAlert from '~hooks/useAlert';
import { formatErrorMsg, stripHtml } from '~utils';
import { pickDocument } from '~utils/filePicker';

// ── Data mapper ───────────────────────────────────────────────────────────────

const STATUS_MAP = {
  pending:       'Pending',
  active:        'Active',
  accepted:      'Accepted',
  'in progress': 'In Progress',
  in_progress:   'In Progress',
  inprogress:    'In Progress',
  completed:     'Completed',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return `Starts ${new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
};

const mapJob = (raw, index) => ({
  _id:       raw._id,
  jobId:     `Job #${index + 1}`,
  title:     raw.jobTitle    ?? '—',
  trade:     raw.trade       ?? '—',
  location:  raw.siteAddress ?? '—',
  assignee:  raw.assignedTo?.length > 0 ? (raw.assignedTo[0]?.fullName ?? 'Assigned') : 'Unassigned',
  startDate: formatDate(raw.timelineStartDate),
  status:    STATUS_MAP[raw.status?.toLowerCase()] ?? 'Pending',
  typeOfJob: raw.typeOfJob,
});

const EMPTY_FORM = { jobTitle: '', hourlyRate: '', description: '', workersRequired: '' };

// Headroom left above a focused job card so it doesn't sit flush with the top edge.
const FOCUS_TOP_GAP = 12;

// ── Screen ────────────────────────────────────────────────────────────────────

const CompanyJobsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const {
    jobs, loading, getJobs, deleteJob, updateJob, updatingJob,
    startJob, completeJob,
  } = useCompanyJobs();
  const { showConfirm, showAlert } = useAlert();

  const [search,    setSearch]    = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [editingJobId,  setEditingJobId]  = useState(null);
  const [editForm,      setEditForm]      = useState(EMPTY_FORM);
  const [editDocuments, setEditDocuments] = useState([]);

  // ── Focus-a-job state (e.g. after posting a new job) ─────────────────────────
  const scrollRef   = useRef(null);
  const cardOffsets = useRef({});          // jobId -> y offset within the list
  const [focusJobId, setFocusJobId] = useState(null);

  useEffect(() => { getJobs(); }, []);

  const mapped = useMemo(() => jobs.map(mapJob), [jobs]);

  const filterTabs = useMemo(() => {
    const counts = mapped.reduce((acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    }, {});
    return [
      { key: 'All',         label: 'All',         count: mapped.length },
      { key: 'In Progress', label: 'In Progress',  count: counts['In Progress'] ?? 0 },
      { key: 'Accepted',    label: 'Accepted',     count: counts.Accepted   ?? 0 },
      { key: 'Pending',     label: 'Pending',      count: counts.Pending    ?? 0 },
      { key: 'Completed',   label: 'Completed',    count: counts.Completed  ?? 0 },
    ];
  }, [mapped]);

  const filtered = useMemo(() => mapped.filter((job) => {
    const matchesTab    = activeTab === 'All' || job.status === activeTab;
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  }), [mapped, activeTab, search]);

  // ── Focus handling ───────────────────────────────────────────────────────────

  // A `focusJobId` route param (sent after posting a job) means: refresh, clear
  // any filtering that would hide the job, then scroll it into view.
  const requestedFocusId = route?.params?.focusJobId;

  useEffect(() => {
    if (!requestedFocusId) return;
    setActiveTab('All');
    setSearch('');
    setFocusJobId(requestedFocusId);
    // Consume the param so re-visiting the tab doesn't scroll again.
    navigation.setParams({ focusJobId: undefined });
    getJobs();
  }, [requestedFocusId, getJobs, navigation]);

  // Scrolls once the target card's offset is known; no-ops until then.
  const scrollToFocusedJob = useCallback(() => {
    const y = focusJobId ? cardOffsets.current[focusJobId] : undefined;
    if (y === undefined) return;
    scrollRef.current?.scrollTo({ y: Math.max(y - FOCUS_TOP_GAP, 0), animated: true });
    setFocusJobId(null);
  }, [focusJobId]);

  const handleCardLayout = useCallback((jobId) => (e) => {
    cardOffsets.current[jobId] = e.nativeEvent.layout.y;
    if (jobId === focusJobId) scrollToFocusedJob();
  }, [focusJobId, scrollToFocusedJob]);

  // Covers the case where the card was already laid out before it was focused,
  // so no fresh onLayout fires.
  useEffect(() => { scrollToFocusedJob(); }, [filtered, scrollToFocusedJob]);

  // ── Edit handlers ────────────────────────────────────────────────────────────

  const openEdit = useCallback((jobId) => {
    const raw = jobs.find((j) => j._id === jobId);
    if (!raw) return;
    setEditForm({
      jobTitle:        raw.jobTitle        ?? '',
      hourlyRate:      raw.hourlyRate      != null ? String(raw.hourlyRate)      : '',
      description:     stripHtml(raw.description ?? ''),
      workersRequired: raw.workersRequired != null ? String(raw.workersRequired) : '',
    });
    setEditDocuments([]);
    setEditingJobId(jobId);
  }, [jobs]);

  const closeEdit = useCallback(() => {
    setEditingJobId(null);
    setEditForm(EMPTY_FORM);
    setEditDocuments([]);
  }, []);

  const handlePickDoc = useCallback(async () => {
    const file = await pickDocument();
    if (file) setEditDocuments((prev) => [...prev, { ...file, isNew: true }]);
  }, []);

  const handleRemoveDoc = useCallback((index) => {
    setEditDocuments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveEdit = useCallback(async () => {
    try {
      await updateJob(editingJobId, { ...editForm, documents: editDocuments });
      showAlert({ title: 'Updated', message: 'Job updated successfully.', type: 'success' });
      closeEdit();
      getJobs();
    } catch (err) {
      showAlert({ title: 'Error', message: formatErrorMsg(err), type: 'error' });
    }
  }, [editingJobId, editForm, editDocuments, updateJob, getJobs, closeEdit, showAlert]);

  const handleStartJob = useCallback((jobId) => {
    showConfirm({
      title:       'Start Job',
      message:     'Are you sure you want to start this job?',
      confirmText: 'Start Job',
      type:        'success',
      onConfirm:   async () => {
        try {
          await startJob(jobId);
          showAlert({ title: 'Job Started', message: 'The job is now in progress.', type: 'success' });
        } catch (err) {
          showAlert({ title: 'Error', message: formatErrorMsg(err), type: 'error' });
        }
      },
    });
  }, [startJob, showConfirm, showAlert]);

  const handleCompleteJob = useCallback((jobId) => {
    showConfirm({
      title:       'Complete Job',
      message:     'Are you sure you want to mark this job as completed?',
      confirmText: 'Complete Job',
      type:        'success',
      onConfirm:   async () => {
        try {
          await completeJob(jobId);
          showAlert({ title: 'Job Completed', message: 'The job has been marked as completed.', type: 'success' });
        } catch (err) {
          showAlert({ title: 'Error', message: formatErrorMsg(err), type: 'error' });
        }
      },
    });
  }, [completeJob, showConfirm, showAlert]);

  // ── Existing docs for the job being edited ───────────────────────────────────
  const editingRawJob = useMemo(
    () => jobs.find((j) => j._id === editingJobId),
    [jobs, editingJobId],
  );
  const existingDocs = Array.isArray(editingRawJob?.documents) ? editingRawJob.documents : [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="My Jobs" subtitle="Manage your active listings and ongoing projects." />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Search size={RFValue(13)} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <FilterTabs tabs={filterTabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Jobs List */}
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filtered.length === 0 && !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No jobs found.</Text>
            </View>
          ) : (
            filtered.map((job, index) => (
              <View key={job._id ?? index} onLayout={handleCardLayout(job._id)}>
                <JobCard
                  {...job}
                  onPress={() => navigation.navigate('CompanyJobDetail', { job, status: job.status })}
                  onEdit={() => openEdit(job._id)}
                  onDelete={() => {
                    showConfirm({
                      title:       'Delete Job',
                      message:     'Are you sure you want to delete this job? This action cannot be undone.',
                      confirmText: 'Delete',
                      type:        'error',
                      onConfirm:   async () => {
                        try {
                          await deleteJob(job._id);
                          showAlert({ title: 'Deleted', message: 'Job deleted successfully.', type: 'success' });
                        } catch (err) {
                          showAlert({ title: 'Error', message: formatErrorMsg(err), type: 'error' });
                        }
                      },
                    });
                  }}
                  onStart={job.status === 'Pending' ? () => handleStartJob(job._id) : undefined}
                  onComplete={job.status === 'In Progress' ? () => handleCompleteJob(job._id) : undefined}
                  status={job.status}
                />
              </View>
            ))
          )}

          <View style={styles.paginationRow}>
            <Text style={styles.paginationText}>Showing 1–{filtered.length} of {mapped.length}</Text>
            <View style={styles.pageButtons}>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>«</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.pageBtn, styles.pageBtnActive]}><Text style={[styles.pageText, { color: '#FFFFFF' }]}>1</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageText}>»</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ── Edit Job Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={editingJobId !== null}
        animationType="slide"
        transparent
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Job</Text>
              <TouchableOpacity onPress={closeEdit} hitSlop={8}>
                <X size={RFValue(18)} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <RNScrollView
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.fieldLabel}>Job Title</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.jobTitle}
                onChangeText={(v) => setEditForm((f) => ({ ...f, jobTitle: v }))}
                placeholder="Job title"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.fieldLabel}>Hourly Rate (£)</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.hourlyRate}
                onChangeText={(v) => setEditForm((f) => ({ ...f, hourlyRate: v.replace(/[^0-9.]/g, '') }))}
                placeholder="e.g. 25"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Workers Required</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.workersRequired}
                onChangeText={(v) => setEditForm((f) => ({ ...f, workersRequired: v.replace(/[^0-9]/g, '') }))}
                placeholder="e.g. 3"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldTextarea]}
                value={editForm.description}
                onChangeText={(v) => setEditForm((f) => ({ ...f, description: v }))}
                placeholder="Job description..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Existing documents */}
              {existingDocs.length > 0 && (
                <View style={styles.existingDocsWrap}>
                  <Text style={styles.fieldLabel}>Existing Documents ({existingDocs.length})</Text>
                  {existingDocs.map((doc, i) => (
                    <View key={i} style={styles.existingDocRow}>
                      <Text style={styles.existingDocName} numberOfLines={1}>
                        {typeof doc === 'string' ? `Document ${i + 1}` : (doc.name ?? `Document ${i + 1}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* New documents */}
              <Text style={styles.fieldLabel}>Add Documents</Text>
              {editDocuments.map((doc, i) => (
                <View key={i} style={styles.newDocRow}>
                  <Text style={styles.newDocName} numberOfLines={1}>{doc.name ?? `Document ${i + 1}`}</Text>
                  <TouchableOpacity onPress={() => handleRemoveDoc(i)} hitSlop={8}>
                    <Trash2 size={RFValue(14)} color="#EF4444" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addDocBtn} onPress={handlePickDoc} activeOpacity={0.7}>
                <Plus size={RFValue(14)} color="#10375C" strokeWidth={2} />
                <Text style={styles.addDocText}>Add Document</Text>
              </TouchableOpacity>

              <View style={styles.modalSpacer} />
            </RNScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeEdit} activeOpacity={0.7}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, updatingJob && styles.saveBtnDisabled]}
                onPress={handleSaveEdit}
                disabled={updatingJob}
                activeOpacity={0.8}
              >
                {updatingJob
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.saveBtnText}>Save Changes</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:      { flex: 1 },
  container: { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
    padding: 0,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  emptyWrap:   { alignItems: 'center', paddingTop: 40 },
  emptyText:   { fontFamily: FontFamily.regular, fontSize: RFValue(12) },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paginationText: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#64748B' },
  pageButtons:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pageBtn: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  pageBtnActive: { backgroundColor: '#10375C', borderColor: '#10375C' },
  pageText: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#10375C' },

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    color: '#10375C',
  },
  modalBody: { paddingHorizontal: 20, paddingTop: 16 },
  modalSpacer: { height: 24 },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  // ── Form fields ────────────────────────────────────────────────────────────
  fieldLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 6,
    marginTop: 14,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
    backgroundColor: '#F8FAFC',
  },
  fieldTextarea: {
    height: RFValue(90),
    textAlignVertical: 'top',
  },

  // ── Documents ──────────────────────────────────────────────────────────────
  existingDocsWrap: { marginTop: 4 },
  existingDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 6,
  },
  existingDocName: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  newDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  newDocName: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#1E3A8A',
  },
  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addDocText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#10375C',
  },

  // ── Footer buttons ─────────────────────────────────────────────────────────
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
});

export default CompanyJobsScreen;
