/**
 * SubBookingDetailScreen — Full-screen booking detail for Subcontractor role.
 * Fetches full job details via GET /jobs/{jobId}.
 *
 * Booking param shapes:
 *   Offers tab    → offer object: { job: { _id, ... }, company, ... }
 *   Other tabs    → job object directly: { _id, jobTitle, company, ... }
 */
import { useEffect, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Linking,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  MessageSquare, MapPin, Star, ShieldCheck,
  Calendar, Clock, Users, Briefcase, FileText, Image as ImageIcon,
} from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import useSubcontractorJobs from '~hooks/useSubcontractorJobs';
import useSubcontractorBookings from '~hooks/useSubcontractorBookings';
import useChat from '~hooks/useChat';
import useAlert from '~hooks/useAlert';
import { stripHtml } from '~utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NAVY   = '#10375C';
const ORANGE = '#F2A154';
const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

const STATUS_STYLE = {
  in_progress:   { bg: '#1E3A8A', text: '#FFFFFF', label: 'In Progress' },
  pending:       { bg: ORANGE,    text: '#FFFFFF', label: 'Pending'     },
  completed:     { bg: '#3BB273', text: '#FFFFFF', label: 'Completed'   },
  offer:         { bg: '#6366F1', text: '#FFFFFF', label: 'Offer'       },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isImageUrl = (url = '') => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

// ─── Sub-components ───────────────────────────────────────────────────────────

const OverviewChip = ({ icon: Icon, label, value, colors }) => (
  <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <Icon size={RFValue(12)} color={NAVY} strokeWidth={2} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: colors.textPrimary }]} numberOfLines={1}>{value ?? '—'}</Text>
    </View>
  </View>
);

const DocumentRow = ({ url, index }) => {
  const isImg = isImageUrl(url);
  const Icon  = isImg ? ImageIcon : FileText;
  const label = `Document ${index + 1}`;
  return (
    <TouchableOpacity
      style={styles.docRow}
      activeOpacity={0.75}
      onPress={() => Linking.openURL(url).catch(() => {})}
    >
      <Icon size={RFValue(13)} color={NAVY} strokeWidth={2} />
      <Text style={styles.docText} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const SubBookingDetailScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { showAlert, showConfirm } = useAlert();
  const { booking } = route?.params ?? {};

  // Determine if this came from the Offers tab (booking wraps a job object)
  const isOffer  = booking?.job != null && typeof booking?.job === 'object';
  const offerId  = isOffer ? booking._id : null;
  // Resolve job ID: offers wrap the job under `booking.job`; inProgress/etc. ARE the job.
  const jobId = booking?.job?._id ?? (typeof booking?.job === 'string' ? booking.job : null) ?? booking?._id;

  const {
    selectedJob,
    loadingJobDetails,
    jobDetailsError,
    getJobDetails,
    resetJobDetails,
    acceptJobOffer,
    rejectJobOffer,
    processingOfferAction,
  } = useSubcontractorJobs();

  const { getBookings } = useSubcontractorBookings();
  const { rawConversations, getConversations } = useChat();

  const load = useCallback(() => {
    if (jobId) getJobDetails(jobId);
  }, [jobId, getJobDetails]);

  useEffect(() => {
    getConversations();
    load();
    return () => resetJobDetails();
  }, [load]);

  useEffect(() => {
    if (jobDetailsError) {
      showAlert({ title: 'Unable to Load', message: jobDetailsError, type: 'error' });
    }
  }, [jobDetailsError, showAlert]);

  const job     = selectedJob;
  const company = job?.company ?? {};

  // Find existing conversation with this company (company can only start one)
  const companyId = company._id ?? booking?.company?._id ?? null;
  const existingConversation = companyId
    ? rawConversations.find(
        (c) => c.company?._id === companyId || c.company === companyId,
      )
    : null;

  const handleMessage = () => {
    if (existingConversation) {
      navigation.navigate('SubChat', { conversation: existingConversation });
    }
  };

  const handleAccept = () => {
    if (!offerId) return;
    showConfirm({
      title:       'Accept Offer',
      message:     'Are you sure you want to accept this job offer?',
      confirmText: 'Accept',
      type:        'success',
      onConfirm:   async () => {
        try {
          await acceptJobOffer(offerId);
          showAlert({ title: 'Accepted', message: 'Offer accepted successfully.', type: 'success' });
          if (jobId) getJobDetails(jobId);
          getBookings();
        } catch (err) {
          showAlert({ title: 'Error', message: err ?? 'Failed to accept offer.', type: 'error' });
        }
      },
    });
  };

  const handleReject = () => {
    if (!offerId) return;
    showConfirm({
      title:       'Reject Offer',
      message:     'Are you sure you want to reject this job offer?',
      confirmText: 'Reject',
      type:        'error',
      onConfirm:   async () => {
        try {
          await rejectJobOffer(offerId);
          showAlert({ title: 'Rejected', message: 'Offer rejected successfully.', type: 'success' });
          if (jobId) getJobDetails(jobId);
          getBookings();
          navigation.goBack();
        } catch (err) {
          showAlert({ title: 'Error', message: err ?? 'Failed to reject offer.', type: 'error' });
        }
      },
    });
  };

  const statusKey   = (job?.status ?? '').toLowerCase();
  const statusStyle = STATUS_STYLE[statusKey] ?? STATUS_STYLE.pending;

  const companyInitial  = (company.companyName ?? 'C')[0].toUpperCase();
  const avatarColor     = AVATAR_COLORS[0];

  // Duration label
  const durationLabel = (() => {
    if (!job?.timelineStartDate || !job?.timelineEndDate) return '—';
    const ms   = new Date(job.timelineEndDate) - new Date(job.timelineStartDate);
    const days = Math.round(ms / 86_400_000);
    if (days <= 0) return '—';
    if (days < 7)  return `${days} day${days !== 1 ? 's' : ''}`;
    const weeks = Math.round(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  })();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Booking Details" subtitle="View your job assignment details." showBackButton />

      {loadingJobDetails && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      )}

      {!loadingJobDetails && job && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── Company card ── */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.companyLabelRow}>
              <Text style={[styles.companyLabel, { color: colors.textSecondary }]}>COMPANY</Text>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={RFValue(10)} color="#15803D" strokeWidth={2} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </View>

            <View style={styles.companyCenter}>
              {company.profileImage ? (
                <Image source={{ uri: company.profileImage }} style={styles.companyAvatar} />
              ) : (
                <View style={[styles.companyAvatarPlaceholder, { backgroundColor: avatarColor }]}>
                  <Text style={styles.companyAvatarText}>{companyInitial}</Text>
                </View>
              )}
              <Text style={[styles.companyName, { color: colors.textPrimary }]}>
                {company.companyName ?? '—'}
              </Text>
              <Text style={[styles.companySubtitle, { color: colors.textSecondary }]}>Company</Text>

            </View>

            <View style={styles.actionRow}>
              {existingConversation && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: NAVY }]}
                  activeOpacity={0.8}
                  onPress={handleMessage}
                >
                  <MessageSquare size={RFValue(14)} color="#FFFFFF" strokeWidth={2} />
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Message</Text>
                </TouchableOpacity>
              )}
              {isOffer && statusKey === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FEE2E2', flex: 1 }]}
                    activeOpacity={0.8}
                    disabled={processingOfferAction}
                    onPress={handleReject}
                  >
                    <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#F2A154', flex: 1 }]}
                    activeOpacity={0.8}
                    disabled={processingOfferAction}
                    onPress={handleAccept}
                  >
                    {processingOfferAction
                      ? <ActivityIndicator size="small" color="#FFFFFF" />
                      : <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Accept</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* ── Job overview card ── */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
              </View>
              <View style={styles.rateWrap}>
                <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Hourly Rate</Text>
                <Text style={[styles.rateValue, { color: colors.textPrimary }]}>
                  £{job.hourlyRate}/hr
                </Text>
              </View>
            </View>

            <Text style={[styles.jobTitle, { color: colors.textPrimary }]}>{job.jobTitle ?? '—'}</Text>

            <View style={styles.metaRow}>
              <Text style={[styles.jobMeta, { color: colors.textSecondary }]}>
                {job.trade ? job.trade.charAt(0).toUpperCase() + job.trade.slice(1) : '—'}
              </Text>
              <Text style={[styles.metaSep, { color: colors.textSecondary }]}> • </Text>
              <MapPin size={RFValue(10)} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.jobMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                {job.siteAddress ?? '—'}
              </Text>
            </View>

            {/* Overview chips */}
            <View style={styles.chipsGrid}>
              <OverviewChip icon={Calendar} label="Start Date" value={fmtDate(job.timelineStartDate)} colors={colors} />
              <OverviewChip icon={Calendar} label="End Date"   value={fmtDate(job.timelineEndDate)}   colors={colors} />
              <OverviewChip icon={Clock}    label="Duration"   value={durationLabel}                  colors={colors} />
              <OverviewChip icon={Users}    label="Workers"    value={String(job.workersRequired ?? 1)} colors={colors} />
              <OverviewChip icon={Briefcase} label="Trade"     value={job.trade ? job.trade.charAt(0).toUpperCase() + job.trade.slice(1) : '—'} colors={colors} />
            </View>
          </View>

          {/* ── Job description card ── */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Job Description</Text>
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              {stripHtml(job.description) || 'No description provided.'}
            </Text>
          </View>

          {/* ── Documents card ── */}
          {Array.isArray(job.projectDocuments) && job.projectDocuments.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Site Maps &amp; Documents</Text>
              {job.projectDocuments.map((url, i) => (
                <DocumentRow key={i} url={url} index={i} />
              ))}
            </View>
          )}

        </ScrollView>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:   { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },

  // Company card
  companyLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(8),
    color: '#15803D',
    letterSpacing: 0.5,
  },
  companyCenter: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  companyAvatar: {
    width: RFValue(64),
    height: RFValue(64),
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 4,
  },
  companyAvatarPlaceholder: {
    width: RFValue(64),
    height: RFValue(64),
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  companyAvatarText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(24),
  },
  companyName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(16),
    textAlign: 'center',
  },
  companySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: RFValue(42),
    borderRadius: 10,
  },
  actionBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
  },

  // Job overview
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
  },
  rateWrap: { alignItems: 'flex-end' },
  rateLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
  },
  rateValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 14,
    gap: 2,
  },
  jobMeta: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
  metaSep: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },

  // Overview chips grid
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  chipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(8.5),
    marginBottom: 1,
  },
  chipValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
  },

  // Description
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(16),
  },

  // Documents
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  docText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: NAVY,
    textDecorationLine: 'underline',
    flex: 1,
  },
});

export default SubBookingDetailScreen;
