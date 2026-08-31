/**
 * SubJobDetailScreen — API-driven job detail for the Subcontractor role.
 * Data comes from GET /jobs/{jobId} via useSubcontractorJobs.getJobDetails.
 * Registered outside the tab navigator so no bottom tab bar is shown.
 */
import {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {
  MapPin,
  Clock,
  Calendar,
  Briefcase,
  FileText,
  Building2,
  Users,
  Mail,
  Phone,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react-native';
import {useTheme} from '~context/ThemeContext';
import {FontFamily} from '~theme/fonts';
import {ScrollView, Text, Avatar} from '~components/Common';
import Header from '~components/Header';
import ApplyJobModal from '~components/Job/ApplyJobModal';
import useSubcontractorJobs from '~hooks/useSubcontractorJobs';
import useAlert from '~hooks/useAlert';
import {stripHtml} from '~utils';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NAVY = '#10375C';
const ORANGE = '#F2A154';

const fmtDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const isImageUrl = (url = '') => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

// ─── Sub-components ───────────────────────────────────────────────────────────

const OverviewItem = ({icon: Icon, label, value, colors}) => (
  <View
    style={[
      styles.overviewItem,
      {backgroundColor: colors.surface, borderColor: colors.border},
    ]}>
    <View style={styles.overviewIcon}>
      <Icon size={RFValue(14)} color={NAVY} strokeWidth={2} />
    </View>
    <Text style={[styles.overviewLabel, {color: colors.textSecondary}]}>
      {label}
    </Text>
    <Text
      style={[styles.overviewValue, {color: colors.textPrimary}]}
      numberOfLines={2}>
      {value ?? '—'}
    </Text>
  </View>
);

const DocumentRow = ({url, index}) => {
  const isImg = isImageUrl(url);
  const Icon = isImg ? ImageIcon : FileText;
  const label = url.split('/').pop() ?? `Document ${index + 1}`;

  return (
    <TouchableOpacity
      style={styles.docRow}
      activeOpacity={0.75}
      onPress={() => Linking.openURL(url).catch(() => {})}>
      <Icon size={RFValue(14)} color={NAVY} strokeWidth={2} />
      <Text style={styles.docText} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const CompanyInfoRow = ({icon: Icon, value}) => {
  if (!value) return null;
  return (
    <View style={styles.companyInfoRow}>
      <Icon size={RFValue(11)} color="rgba(255,255,255,0.6)" strokeWidth={2} />
      <Text style={styles.companyInfoText}>{value}</Text>
    </View>
  );
};

// A prior application blocks re-applying whatever its outcome — the server's
// duplicate guard is status-agnostic, so a rejection is permanent for that job.
// Gate on `hasApplied` alone; excluding rejected here would show an enabled
// button that then fails with a 409.
const APPLIED_LABEL = {
  pending:   'Applied — Awaiting Response',
  accepted:  'Application Accepted',
  rejected:  'Application Rejected',
  withdrawn: 'Application Withdrawn',
};

const appliedLabelFor = (status) =>
  APPLIED_LABEL[String(status ?? '').trim().toLowerCase()] ?? 'Already Applied';

const fmtAppliedDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const SubJobDetailScreen = ({navigation, route}) => {
  const {colors} = useTheme();
  const {showAlert} = useAlert();
  const {jobId, openApply} = route?.params ?? {};

  const {
    selectedJob,
    loadingJobDetails,
    jobDetailsError,
    getJobDetails,
    resetJobDetails,
  } = useSubcontractorJobs();

  const [applyVisible, setApplyVisible] = useState(false);

  const load = useCallback(() => {
    if (jobId) getJobDetails(jobId);
  }, [jobId, getJobDetails]);

  // `hasApplied` / `myApplication` are merged into the job for subcontractor
  // callers on every return path of GET /jobs/:id.
  const hasApplied    = selectedJob?.hasApplied === true;
  const appliedStatus = selectedJob?.myApplication?.status;
  const appliedOn     = fmtAppliedDate(selectedJob?.myApplication?.createdAt);

  // Guarded here as well as on the button, so the sheet cannot be opened by the
  // `openApply` route param either.
  const openApplySheet = useCallback(() => {
    if (hasApplied) return;
    setApplyVisible(true);
  }, [hasApplied]);

  useEffect(() => {
    load();
    return () => resetJobDetails();
  }, [load]);

  // Open apply modal immediately if navigated with openApply flag
  useEffect(() => {
    if (openApply) openApplySheet();
  }, [openApply, openApplySheet]);

  // Show error alert if fetch fails
  useEffect(() => {
    if (jobDetailsError) {
      showAlert({
        title: 'Unable to Load Job',
        message: jobDetailsError,
        type: 'error',
      });
    }
  }, [jobDetailsError, showAlert]);

  const job = selectedJob;
  const company = job?.company ?? {};

  // Duration in days between timeline dates
  const durationLabel = (() => {
    if (!job?.timelineStartDate || !job?.timelineEndDate) return '—';
    const ms = new Date(job.timelineEndDate) - new Date(job.timelineStartDate);
    const days = Math.round(ms / 86_400_000);
    if (days <= 0) return '—';
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
    const weeks = Math.round(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  })();

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      <Header
        title="Job Details"
        subtitle="View full job information."
        showBackButton
      />

      {/* ── Loading ── */}
      {loadingJobDetails && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      )}

      {!loadingJobDetails && job && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* ── Company + Apply ── */}
          <View
            style={[
              styles.card,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            {/* Job title */}
            <Text style={[styles.jobTitle, {color: colors.textPrimary}]}>
              {job.jobTitle ?? '—'}
            </Text>

            <View style={styles.companyRow}>
              <Avatar
                uri={company.profileImage}
                size={RFValue(40)}
                style={styles.companyLogo}
              />
              <View style={styles.companyMeta}>
                <Text style={[styles.companyName, {color: colors.textPrimary}]}>
                  {company.companyName ?? '—'}
                </Text>
                {company.headOfficeAddress ? (
                  <View style={styles.locationRow}>
                    <MapPin
                      size={RFValue(9)}
                      color={colors.textSecondary}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.locationText,
                        {color: colors.textSecondary},
                      ]}>
                      {company.headOfficeAddress}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.rateBadge}>
                <Text style={styles.rateText}>£{job.hourlyRate}/hr</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.applyBtn, hasApplied && styles.applyBtnDisabled]}
              onPress={openApplySheet}
              disabled={hasApplied}
              activeOpacity={0.85}>
              <Text
                style={[
                  styles.applyBtnText,
                  hasApplied && styles.applyBtnTextDisabled,
                ]}>
                {hasApplied ? appliedLabelFor(appliedStatus) : 'Apply Now'}
              </Text>
            </TouchableOpacity>
            {hasApplied && appliedOn && (
              <Text style={[styles.appliedOnText, {color: colors.textSecondary}]}>
                Applied {appliedOn}
              </Text>
            )}
          </View>

          {/* ── Job Description ── */}
          <View
            style={[
              styles.card,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
              Job Description
            </Text>
            <Text style={[styles.bodyText, {color: colors.textSecondary}]}>
              {stripHtml(job.description) || '—'}
            </Text>
          </View>

          {/* ── Documents ── */}
          {Array.isArray(job.projectDocuments) &&
            job.projectDocuments.length > 0 && (
              <View
                style={[
                  styles.card,
                  {backgroundColor: colors.surface, borderColor: colors.border},
                ]}>
                <Text
                  style={[styles.sectionTitle, {color: colors.textPrimary}]}>
                  Site Maps &amp; Documents
                </Text>
                {job.projectDocuments.map((url, i) => (
                  <DocumentRow key={i} url={url} index={i} />
                ))}
              </View>
            )}

          {/* ── Job Overview ── */}
          <View
            style={[
              styles.card,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
              Job Overview
            </Text>
            <View style={styles.overviewGrid}>
              <OverviewItem
                icon={Briefcase}
                label="Trade"
                value={
                  job.trade
                    ? job.trade.charAt(0).toUpperCase() + job.trade.slice(1)
                    : '—'
                }
                colors={colors}
              />
              <OverviewItem
                icon={DollarSign}
                label="Hourly Rate"
                value={`£${job.hourlyRate}/hr`}
                colors={colors}
              />
              <OverviewItem
                icon={Users}
                label="Workers"
                value={String(job.workersRequired ?? 1)}
                colors={colors}
              />
              <OverviewItem
                icon={Clock}
                label="Duration"
                value={durationLabel}
                colors={colors}
              />
              <OverviewItem
                icon={Calendar}
                label="Start Date"
                value={fmtDate(job.timelineStartDate)}
                colors={colors}
              />
              <OverviewItem
                icon={Calendar}
                label="End Date"
                value={fmtDate(job.timelineEndDate)}
                colors={colors}
              />
              <OverviewItem
                icon={MapPin}
                label="Location"
                value={job.siteAddress}
                colors={colors}
              />
            </View>
          </View>

          {/* ── About the Company ── */}
          <View style={styles.aboutCard}>
            <View style={styles.aboutHeader}>
              <Building2 size={RFValue(14)} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.aboutTitle}>About the Company</Text>
            </View>
            <Text style={styles.aboutName}>{company.companyName ?? '—'}</Text>
            <CompanyInfoRow icon={Mail} value={company.workEmail} />
            <CompanyInfoRow icon={Phone} value={company.phoneNumber} />
            <CompanyInfoRow icon={MapPin} value={company.headOfficeAddress} />
          </View>
        </ScrollView>
      )}

      <ApplyJobModal
        visible={applyVisible}
        onClose={() => setApplyVisible(false)}
        jobId={job?._id}
        jobTitle={job?.jobTitle}
        // Re-read the job either way: on success `hasApplied` flips and the
        // button has to disable, and a failure usually means this screen's copy
        // was already stale (a 409 from another device, or a bulk rejection).
        onApplied={load}
        onApplyFailed={load}
        onSeeMyJobs={() => {
          setApplyVisible(false);
          navigation.navigate('SubTabs', {screen: 'Bookings'});
        }}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {flex: 1},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  scrollContent: {padding: 16, paddingBottom: 40},

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 15,
  },

  // Job title above company row
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
    marginBottom: 12,
  },

  // Company row
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  companyLogo: {
    width: RFValue(40),
    height: RFValue(40),
    borderRadius: 8,
    resizeMode: 'cover',
    flexShrink: 0,
  },
  companyMeta: {flex: 1, gap: 3},
  companyName: {fontFamily: FontFamily.semiBold, fontSize: RFValue(12)},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 3},
  locationText: {fontFamily: FontFamily.regular, fontSize: RFValue(9), flex: 1},
  rateBadge: {
    backgroundColor: ORANGE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  rateText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
  },
  applyBtn: {
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  applyBtnTextDisabled: {
    color: '#64748B',
  },
  appliedOnText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    textAlign: 'center',
    marginTop: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
  },

  // Section
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    marginBottom: 12,
  },

  // Overview grid
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  overviewItem: {
    width: '47%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  overviewIcon: {marginBottom: 2},
  overviewLabel: {fontFamily: FontFamily.regular, fontSize: RFValue(9)},
  overviewValue: {fontFamily: FontFamily.semiBold, fontSize: RFValue(11)},

  // Description
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

  // About the Company
  aboutCard: {
    backgroundColor: NAVY,
    borderRadius: 16,
    padding: 16,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aboutTitle: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },
  aboutName: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    marginBottom: 10,
  },
  companyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  companyInfoText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    flex: 1,
  },
});

export default SubJobDetailScreen;
