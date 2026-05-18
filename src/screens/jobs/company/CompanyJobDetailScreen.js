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

const stripHtml = (str) =>
  str ? str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : '';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Normalise both offer and application records into a single shape for ApplicantCard.
const normaliseApplicants = (job) => {
  // typeOfJob === 'offer'   → applicants live in job.offers[].subcontractor
  // typeOfJob === 'request' → applicants live in job.applications[].subcontractor
  const offers       = Array.isArray(job.offers)       ? job.offers       : [];
  const applications = Array.isArray(job.applications) ? job.applications : [];

  const fromOffers = offers.map((o) => {
    const sub = o.subcontractor ?? {};
    return {
      _id:      o._id,
      name:     sub.fullName     ?? '—',
      trade:    sub.primaryTrade ?? '—',
      rate:     sub.hourlyRate   != null ? `£${sub.hourlyRate}/hr` : '—',
      avatarUri: sub.profileImage ?? null,
      isVerified: sub.isVerified ?? false,
      message:  o.message ?? '',
      status:   o.status  ?? 'pending',
    };
  });

  const fromApplications = applications.map((a) => {
    const sub = a.subcontractor ?? {};
    return {
      _id:      a._id,
      name:     sub.fullName     ?? a.fullName ?? '—',
      trade:    sub.primaryTrade ?? '—',
      rate:     sub.hourlyRate   != null
        ? `£${sub.hourlyRate}/hr`
        : a.proposedDailyRate != null
          ? `£${a.proposedDailyRate}/day`
          : '—',
      avatarUri:  sub.profileImage ?? null,
      isVerified: sub.isVerified   ?? false,
      message:  a.message ?? '',
      status:   a.status  ?? 'pending',
    };
  });

  return [...fromOffers, ...fromApplications];
};

// ── Screen ────────────────────────────────────────────────────────────────────

const CompanyJobDetailScreen = ({ route }) => {
  const { colors } = useTheme();
  const { selectedJob, detailLoading, getJobById, resetSelectedJob } = useCompanyJobs();

  const jobId  = route?.params?.job?._id ?? route?.params?.jobId;
  const status = route?.params?.status ?? selectedJob?.status ?? 'pending';

  useEffect(() => {
    if (jobId) getJobById(jobId);
    return () => resetSelectedJob();
  }, [jobId]);

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
            <TouchableOpacity style={[styles.tag, styles.completeBtn]} activeOpacity={0.8}>
              <Text style={styles.completeBtnText}>✓ Complete Job</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.jobTitle}>{job.jobTitle ?? '—'}</Text>
          <Text style={styles.jobMeta}>
            {job.trade ?? '—'}
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
              message={a.message}
              status={a.status === 'accepted' ? 'accepted' : 'pending'}
              onCancel={() => {}}
              onAccept={() => {}}
              onMessage={() => {}}
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
