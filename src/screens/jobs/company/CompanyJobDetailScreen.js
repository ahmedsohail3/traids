import React, { useEffect } from 'react';
import {
  View, StyleSheet, TouchableOpacity, ActivityIndicator,
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
import { stripHtml } from '~utils';

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

// Selects the correct source list based on typeOfJob × status rules.
const normaliseApplicants = (job) => {
  const type   = job.typeOfJob ?? '';
  const status = (job.status ?? '').toLowerCase();
  const isActive = status === 'in_progress' || status === 'in progress' || status === 'completed';

  const offers       = Array.isArray(job.offers)       ? job.offers       : [];
  const applications = Array.isArray(job.applications) ? job.applications : [];
  const assignedTo   = Array.isArray(job.assignedTo)   ? job.assignedTo   : [];

  // request + pending   → applications + offers
  if (type === 'request' && !isActive) {
    return [
      ...applications.map(fromApplication),
      ...offers.map(fromOffer),
    ];
  }

  // request + in_progress / completed → assignedTo
  if (type === 'request' && isActive) {
    return assignedTo.map(fromAssignedTo);
  }

  // offer + pending → offers
  if (type === 'offer' && !isActive) {
    return offers.map(fromOffer);
  }

  // offer + in_progress → assignedTo
  if (type === 'offer' && isActive) {
    return assignedTo.map(fromAssignedTo);
  }

  // Fallback: show whatever is available
  return [
    ...offers.map(fromOffer),
    ...applications.map(fromApplication),
    ...assignedTo.map(fromAssignedTo),
  ];
};

// ── Screen ────────────────────────────────────────────────────────────────────

const CompanyJobDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { showAlert, showConfirm } = useAlert();
  const {
    selectedJob, detailLoading, getJobById, resetSelectedJob,
    acceptJobApplication, rejectJobApplication, processingApplication,
  } = useCompanyJobs();
  const { rawConversations, getConversations } = useChat();

  const jobId  = route?.params?.job?._id ?? route?.params?.jobId;
  const status = route?.params?.status ?? selectedJob?.status ?? 'pending';

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

  // Fall back to route params while the API loads so screen isn't blank
  const job = selectedJob ?? route?.params?.job ?? {};

  const statusKey   = (job.status ?? status ?? '').toLowerCase();
  const statusColor = STATUS_COLORS[statusKey] ?? STATUS_COLORS.pending;
  const statusLabel = STATUS_LABELS[statusKey] ?? (job.status ?? status ?? 'Pending');
  const applicants = normaliseApplicants(job);

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
              <TouchableOpacity style={[styles.tag, styles.completeBtn]} activeOpacity={0.8}>
                <Text style={styles.completeBtnText}>✓ Complete Job</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.jobTitle}>{job.jobTitle ?? '—'}</Text>
          <Text style={styles.jobMeta}>
            {job.trade ? job.trade.charAt(0).toUpperCase() + job.trade.slice(1) : '—'}
            {job.siteAddress ? ` • ${job.siteAddress}` : ''}
          </Text>

          {/* Timeline */}
          {(job.timelineStartDate || job.timelineEndDate) && (
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>
                {formatDate(job.timelineStartDate)} → {formatDate(job.timelineEndDate)}
              </Text>
            </View>
          )}

          {/* Rate + Workers */}
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
        </View>

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
      </ScrollView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:        { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  tagText: { color: '#FFFFFF', fontFamily: FontFamily.semiBold, fontSize: RFValue(10), textTransform: 'capitalize' },
  completeBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  completeBtnText: { color: '#64748B', fontFamily: FontFamily.semiBold, fontSize: RFValue(10) },
  jobTitle: {
    color: '#10375C',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    marginBottom: 4,
  },
  jobMeta: {
    color: '#64748B',
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    marginBottom: 12,
  },
  timelineRow: { marginBottom: 12 },
  timelineLabel: {
    color: '#64748B',
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
  metaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: { color: '#10375C', fontFamily: FontFamily.semiBold, fontSize: RFValue(9) },
  chipOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipOutlineText: { color: '#64748B', fontFamily: FontFamily.semiBold, fontSize: RFValue(9), textTransform: 'capitalize' },
  sectionTitle: {
    color: '#10375C',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    marginBottom: 10,
  },
  descriptionText: {
    color: '#64748B',
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(16),
  },
  noApplicants: { alignItems: 'center', paddingVertical: 24 },
  noApplicantsText: { fontFamily: FontFamily.regular, fontSize: RFValue(12) },
});

export default CompanyJobDetailScreen;
