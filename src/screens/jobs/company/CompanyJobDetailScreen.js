import { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, ActivityIndicator,
  TextInput, ScrollView as RNScrollView,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, ScrollView } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import ApplicantCard from '~components/Job/ApplicantCard';
import useCompanyJobs from '~hooks/useCompanyJobs';
import useChat from '~hooks/useChat';
import useAlert from '~hooks/useAlert';
import { stripHtml, formatErrorMsg } from '~utils';
import { pickDocument } from '~utils/filePicker';
import { buildUpdateJobFormData } from '~utils/buildFormData';
import { Plus, Trash2 } from 'lucide-react-native';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  pending:      '#F2A154',
  active:       '#077a09',
  accepted:     '#1E3A8A',
  'in progress': '#1E3A8A',
  in_progress:  '#1E3A8A',
  completed:    '#3BB273',
};

const STATUS_LABELS = {
  pending:      'Pending',
  active:       'Active',
  accepted:     'Accepted',
  'in progress': 'In Progress',
  in_progress:  'In Progress',
  completed:    'Completed',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Normalise helpers ─────────────────────────────────────────────────────────

const fromOffer = (o) => {
  const sub = o.subcontractor ?? {};
  return {
    _id:       o._id,
    subId:     sub._id ?? null,
    name:      sub.fullName     ?? '—',
    trade:     sub.primaryTrade ?? '—',
    rate:      sub.hourlyRate   != null ? `£${sub.hourlyRate}/hr` : '—',
    avatarUri: sub.profileImage ?? null,
    isVerified: sub.isVerified  ?? false,
    message:   sub?.professionalBio ?? '',
    status:    o.status         ?? 'pending',
  };
};

const fromApplication = (a) => {
  const sub = a.subcontractor ?? {};
  return {
    _id:       a._id,
    subId:     sub._id ?? null,
    name:      sub.fullName     ?? a.fullName ?? '—',
    trade:     sub.primaryTrade ?? '—',
    rate:      a.proposedDailyRate != null
      ? `£${a.proposedDailyRate}/hr`
      : sub.hourlyRate != null
        ? `£${sub.hourlyRate}/hr`
        : '—',
    avatarUri:  sub.profileImage ?? null,
    isVerified: sub.isVerified   ?? false,
    message:    a.message ?? sub?.professionalBio ?? '',
    status:     a.status         ?? 'pending',
  };
};

const fromAssignedTo = (s) => ({
  _id:       s._id,
  subId:     s._id ?? null,
  name:      s.fullName     ?? s.name     ?? '—',
  trade:     s.primaryTrade ?? s.trade    ?? '—',
  rate:      s.hourlyRate   != null ? `£${s.hourlyRate}/hr` : '—',
  avatarUri: s.profileImage ?? s.avatarUri ?? null,
  isVerified: s.isVerified  ?? false,
  message: s?.professionalBio ?? '',
  status:    'accepted',
});

const normaliseApplicants = (job) => {
  const type   = job.typeOfJob ?? '';
  const status = (job.status ?? '').toLowerCase();
  const isActive = status === 'in_progress' || status === 'in progress' || status === 'completed';

  const offers       = Array.isArray(job.offers)       ? job.offers       : [];
  const applications = Array.isArray(job.applications) ? job.applications : [];
  const assignedTo   = Array.isArray(job.assignedTo)   ? job.assignedTo   : [];

  if (type === 'request' && !isActive) {
    return [...applications.map(fromApplication), ...offers.map(fromOffer)];
  }
  if (type === 'request' && isActive)  return assignedTo.map(fromAssignedTo);
  if (type === 'offer'   && !isActive) return offers.map(fromOffer);
  if (type === 'offer'   && isActive)  return assignedTo.map(fromAssignedTo);

  return [
    ...offers.map(fromOffer),
    ...applications.map(fromApplication),
    ...assignedTo.map(fromAssignedTo),
  ];
};

const EMPTY_FORM = { jobTitle: '', hourlyRate: '', description: '', workersRequired: '' };

// ── Screen ────────────────────────────────────────────────────────────────────

const CompanyJobDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { showAlert, showConfirm } = useAlert();
  const {
    selectedJob, detailLoading, getJobById, resetSelectedJob, getJobs,
    acceptJobApplication, rejectJobApplication, processingApplication,
    deleteJob, deletingJob,
    updateJob, updatingJob,
    startJob, startingJob,
    completeJob, completingJob,
  } = useCompanyJobs();
  const { rawConversations, getConversations } = useChat();

  const jobId  = route?.params?.job?._id ?? route?.params?.jobId;
  const status = route?.params?.status ?? selectedJob?.status ?? 'pending';

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [editMode,      setEditMode]      = useState(false);
  const [editForm,      setEditForm]      = useState(EMPTY_FORM);
  const [editDocuments, setEditDocuments] = useState([]);

  const job = selectedJob ?? route?.params?.job ?? {};

  const openEdit = useCallback(() => {
    setEditForm({
      jobTitle:        job.jobTitle        ?? '',
      hourlyRate:      job.hourlyRate      != null ? String(job.hourlyRate)      : '',
      description:     stripHtml(job.description ?? ''),
      workersRequired: job.workersRequired != null ? String(job.workersRequired) : '',
    });
    setEditDocuments([]);
    setEditMode(true);
  }, [job]);

  const closeEdit = useCallback(() => {
    setEditMode(false);
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
      await updateJob(jobId, buildUpdateJobFormData({ ...editForm, documents: editDocuments }));
      showAlert({ title: 'Updated', message: 'Job updated successfully.', type: 'success' });
      closeEdit();
      getJobById(jobId);
      getJobs();
    } catch (err) {
      showAlert({ title: 'Error', message: formatErrorMsg(err), type: 'error' });
    }
  }, [jobId, editForm, editDocuments, updateJob, getJobById, getJobs, closeEdit, showAlert]);

  // ── Application handlers ─────────────────────────────────────────────────────

  const handleAccept = (applicationId) => {
    showConfirm({
      title:       'Accept Application',
      message:     'Are you sure you want to accept this subcontractor application?',
      confirmText: 'Accept',
      type:        'success',
      onConfirm:   async () => {
        try {
          await acceptJobApplication(applicationId);
          showAlert({ title: 'Accepted', message: 'Application accepted successfully.', type: 'success' });
          if (jobId) getJobById(jobId);
        } catch (err) {
          showAlert({ title: 'Error', message: err ?? 'Failed to accept application.', type: 'error' });
        }
      },
    });
  };

  const handleReject = (applicationId) => {
    showConfirm({
      title:       'Reject Application',
      message:     'Are you sure you want to reject this subcontractor application?',
      confirmText: 'Reject',
      type:        'error',
      onConfirm:   async () => {
        try {
          await rejectJobApplication(applicationId);
          showAlert({ title: 'Rejected', message: 'Application rejected successfully.', type: 'success' });
          if (jobId) getJobById(jobId);
        } catch (err) {
          showAlert({ title: 'Error', message: err ?? 'Failed to reject application.', type: 'error' });
        }
      },
    });
  };

  const handleStartJob = () => {
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
  };

  const handleCompleteJob = () => {
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
  };

  const handleDelete = () => {
    showConfirm({
      title:       'Delete Job',
      message:     'Are you sure you want to delete this job? This action cannot be undone.',
      confirmText: 'Delete',
      type:        'error',
      onConfirm:   async () => {
        try {
          await deleteJob(jobId);
          showAlert({ title: 'Deleted', message: 'Job deleted successfully.', type: 'success' });
          getJobs();
          navigation.goBack();
        } catch (err) {
          showAlert({ title: 'Error', message: formatErrorMsg(err), type: 'error' });
        }
      },
    });
  };

  useEffect(() => {
    getConversations();
    if (jobId) getJobById(jobId);
    return () => resetSelectedJob();
  }, [jobId]);

  const handleMessage = (applicant) => {
    const subId = applicant.subId;
    const existing = rawConversations.find(
      (c) => c.subcontractor?._id === subId || c.subcontractor === subId,
    );
    if (existing) {
      navigation.navigate('CompanyChat', { conversation: existing });
    } else {
      navigation.navigate('CompanyChat', {
        subcontractorId: subId,
        subName:         applicant.name,
        subAvatarUri:    applicant.avatarUri ?? null,
      });
    }
  };

  const statusKey   = (job.status ?? status ?? '').toLowerCase();
  const statusColor = STATUS_COLORS[statusKey] ?? STATUS_COLORS.pending;
  const statusLabel = STATUS_LABELS[statusKey] ?? (job.status ?? status ?? 'Pending');
  const applicants  = normaliseApplicants(job);
  const existingDocs = Array.isArray(job.documents) ? job.documents : [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="My Jobs"
        subtitle="Manage your active listings and ongoing projects."
        showBackButton
      />

      {detailLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Job Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: statusColor }]}>
              <Text style={styles.tagText}>{statusLabel}</Text>
            </View>
            {statusKey === 'completed' && (
              <View style={[styles.tag, styles.completeBtn]}>
                <Text style={styles.completeBtnText}>✓ Completed</Text>
              </View>
            )}
            {statusKey !== 'completed' && (
              <TouchableOpacity
                style={[styles.tag, styles.editBtn]}
                activeOpacity={0.8}
                onPress={editMode ? closeEdit : openEdit}
              >
                <Text style={styles.editBtnText}>{editMode ? 'Cancel Edit' : 'Edit Job'}</Text>
              </TouchableOpacity>
            )}
            {statusKey !== 'in_progress' && statusKey !== 'in progress' && statusKey !== 'completed' && (
              <TouchableOpacity
                style={[styles.tag, styles.deleteBtn]}
                activeOpacity={0.8}
                onPress={handleDelete}
                disabled={deletingJob}
              >
                <Text style={styles.deleteBtnText}>{deletingJob ? 'Deleting…' : 'Delete Job'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.jobTitle}>{job.jobTitle ?? '—'}</Text>
          <Text style={styles.jobMeta}>
            {job.trade ? job.trade.charAt(0).toUpperCase() + job.trade.slice(1) : '—'}
            {job.siteAddress ? ` • ${job.siteAddress}` : ''}
          </Text>

          {(job.timelineStartDate || job.timelineEndDate) && (
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>
                {formatDate(job.timelineStartDate)} → {formatDate(job.timelineEndDate)}
              </Text>
            </View>
          )}

          {(job.hourlyRate != null || job.workersRequired != null) && (
            <View style={styles.metaChips}>
              {job.hourlyRate != null && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>£{job.hourlyRate}/hr</Text>
                </View>
              )}
              {job.workersRequired != null && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{job.workersRequired} worker{job.workersRequired !== 1 ? 's' : ''}</Text>
                </View>
              )}
              {job.typeOfJob && (
                <View style={[styles.chip, styles.chipOutline]}>
                  <Text style={styles.chipOutlineText}>{job.typeOfJob}</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.descriptionText}>
            {stripHtml(job.description) || 'No description provided.'}
          </Text>

          {statusKey === 'pending' && (
            <TouchableOpacity
              style={styles.completeCardBtn}
              activeOpacity={0.8}
              onPress={handleStartJob}
              disabled={startingJob}
            >
              <Text style={styles.completeCardBtnText}>{startingJob ? 'Starting…' : 'Start Job'}</Text>
            </TouchableOpacity>
          )}
          {(statusKey === 'in_progress' || statusKey === 'in progress') && (
            <TouchableOpacity
              style={styles.completeCardBtn}
              activeOpacity={0.8}
              onPress={handleCompleteJob}
              disabled={completingJob}
            >
              <Text style={styles.completeCardBtnText}>{completingJob ? 'Completing…' : 'Complete Job'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Inline Edit Form ──────────────────────────────────────────────── */}
        {editMode && (
          <View style={styles.editCard}>
            <Text style={styles.editCardTitle}>Edit Job Details</Text>

            <RNScrollView keyboardShouldPersistTaps="handled" scrollEnabled={false}>
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
            </RNScrollView>

            {/* Save / Cancel */}
            <View style={styles.editFooter}>
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
        )}

        {/* Offers / Applicants */}
        {applicants.length > 0 ? (
          applicants.map((a, i) => (
            <ApplicantCard
              key={a._id ?? i}
              name={a.name}
              trade={a.trade}
              rate={a.rate}
              avatarUri={a.avatarUri}
              isVerified={a.isVerified}
              message={a.message || a.professionalBio || ''}
              status={a.status}
              loading={processingApplication}
              onReject={() => handleReject(a._id)}
              onAccept={() => handleAccept(a._id)}
              onMessage={() => handleMessage(a)}
            />
          ))
        ) : (
          <View style={styles.noApplicants}>
            <Text style={[styles.noApplicantsText, { color: colors.textSecondary }]}>
              No applicants yet.
            </Text>
          </View>
        )}

        {statusKey === 'pending' && (
          <TouchableOpacity
            style={styles.completeWideBtn}
            activeOpacity={0.8}
            onPress={handleStartJob}
            disabled={startingJob}
          >
            {startingJob
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.completeWideBtnText}>Start Job</Text>
            }
          </TouchableOpacity>
        )}
        {(statusKey === 'in_progress' || statusKey === 'in progress') && (
          <TouchableOpacity
            style={styles.completeWideBtn}
            activeOpacity={0.8}
            onPress={handleCompleteJob}
            disabled={completingJob}
          >
            {completingJob
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.completeWideBtnText}>Complete Job</Text>
            }
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:          { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },

  // ── Details card ──────────────────────────────────────────────────────────
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagsRow:  { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag:      { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  tagText:  { color: '#FFFFFF', fontFamily: FontFamily.semiBold, fontSize: RFValue(10), textTransform: 'capitalize' },
  completeBtn:     { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  completeBtnText: { color: '#64748B', fontFamily: FontFamily.semiBold, fontSize: RFValue(10) },
  editBtn:         { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  editBtnText:     { color: '#1E3A8A', fontFamily: FontFamily.semiBold, fontSize: RFValue(10) },
  deleteBtn:       { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
  deleteBtnText:   { color: '#DC2626', fontFamily: FontFamily.semiBold, fontSize: RFValue(10) },
  // Matches JobCard's Start/Complete Job button styling exactly — shared by both actions
  completeCardBtn: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#10375C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 16,
  },
  completeCardBtnText: { color: '#10375C', fontFamily: FontFamily.semiBold, fontSize: RFValue(9) },

  // Full-width primary action below applicants/assignees
  completeWideBtn: {
    backgroundColor: '#10375C',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  completeWideBtnText: { color: '#FFFFFF', fontFamily: FontFamily.semiBold, fontSize: RFValue(12) },

  jobTitle: { color: '#10375C', fontFamily: FontFamily.bold, fontSize: RFValue(14), marginBottom: 4 },
  jobMeta:  { color: '#64748B', fontFamily: FontFamily.medium, fontSize: RFValue(10), marginBottom: 12 },
  timelineRow:   { marginBottom: 12 },
  timelineLabel: { color: '#64748B', fontFamily: FontFamily.regular, fontSize: RFValue(10) },
  metaChips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip:          { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  chipText:      { color: '#10375C', fontFamily: FontFamily.semiBold, fontSize: RFValue(9) },
  chipOutline:   { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E2E8F0' },
  chipOutlineText: { color: '#64748B', fontFamily: FontFamily.semiBold, fontSize: RFValue(9), textTransform: 'capitalize' },
  sectionTitle:    { color: '#10375C', fontFamily: FontFamily.bold, fontSize: RFValue(12), marginBottom: 10 },
  descriptionText: { color: '#64748B', fontFamily: FontFamily.regular, fontSize: RFValue(10), lineHeight: RFValue(16) },

  // ── Edit card ─────────────────────────────────────────────────────────────
  editCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editCardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
    marginBottom: 4,
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
  existingDocName: { flex: 1, fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B' },
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
  newDocName: { flex: 1, fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#1E3A8A' },
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
  addDocText: { fontFamily: FontFamily.medium, fontSize: RFValue(11), color: '#10375C' },

  // ── Edit footer ────────────────────────────────────────────────────────────
  editFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#64748B' },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(12), color: '#FFFFFF' },

  // ── Applicants ─────────────────────────────────────────────────────────────
  noApplicants:     { alignItems: 'center', paddingVertical: 24 },
  noApplicantsText: { fontFamily: FontFamily.regular, fontSize: RFValue(12) },
});

export default CompanyJobDetailScreen;
