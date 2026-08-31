/**
 * SubRequestedCard — an application the subcontractor has sent, for the
 * "Requested" tab of My Bookings.
 *
 * Mirrors SubOfferCard's anatomy (header / meta / body / footer) so the two
 * tabs read as one family. The design's "Compliance & Safety Documents" block
 * is deliberately left out, matching the offer card.
 *
 * Props:
 *   jobTitle           string
 *   companyName        string
 *   companyInitial     string
 *   companyColorIndex  number
 *   rate               string   e.g. "£12/hr"
 *   message            string   the applicant's own covering message
 *   status             string   application status from the API
 *   appliedAt          string   ISO date the application was sent
 *   loading            boolean  a withdraw is in flight
 *   onWithdraw         function
 *   onViewJob          function
 *   onPress            function
 */
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { CalendarDays, Dot, Trash2 } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

// The design names three states — Application Sent, Under Review, Shortlisted.
// The rest are carried so a status we do not have a design for still reads as
// something, rather than falling off the card.
const STATUS_CHIP = {
  pending:      { label: 'Application Sent', color: '#1F5FA8', bg: '#EFF6FF' },
  sent:         { label: 'Application Sent', color: '#1F5FA8', bg: '#EFF6FF' },
  under_review: { label: 'Under Review',     color: '#B4700C', bg: '#FFFBEB' },
  reviewed:     { label: 'Under Review',     color: '#B4700C', bg: '#FFFBEB' },
  shortlisted:  { label: 'Shortlisted',      color: '#1B8A4E', bg: '#F0FDF4' },
  accepted:     { label: 'Accepted',         color: '#1B8A4E', bg: '#F0FDF4' },
  rejected:     { label: 'Rejected',         color: '#DC2626', bg: '#FEF2F2' },
  withdrawn:    { label: 'Withdrawn',        color: '#64748B', bg: '#F1F5F9' },
};

// `under review`, `UNDER-REVIEW` and `under_review` all key the same entry.
const chipFor = (status) => {
  const key = String(status ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return STATUS_CHIP[key] ?? { label: 'Application Sent', color: '#1F5FA8', bg: '#EFF6FF' };
};

const formatAppliedDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SubRequestedCard = ({
  jobTitle,
  companyName,
  companyInitial,
  companyColorIndex = 0,
  rate,
  message,
  status,
  appliedAt,
  loading = false,
  onWithdraw,
  onViewJob,
  onPress,
}) => {
  const { colors } = useTheme();
  const avatarColor = AVATAR_COLORS[companyColorIndex % AVATAR_COLORS.length];
  const chip        = chipFor(status);
  const appliedOn   = formatAppliedDate(appliedAt);

  // Nothing left to withdraw once the company has decided, or the applicant
  // already pulled out.
  const isClosed = ['accepted', 'rejected', 'withdrawn'].includes(
    String(status ?? '').trim().toLowerCase(),
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* ── Header: logo | title + company | rate ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{companyInitial}</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.jobTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {jobTitle}
          </Text>
          <Text style={[styles.companyName, { color: colors.textSecondary }]} numberOfLines={1}>
            {companyName}
          </Text>
        </View>

        <View style={styles.rateBlock}>
          <Text style={[styles.rateValue, { color: colors.textPrimary }]}>{rate}</Text>
          <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Quote/Bid</Text>
        </View>
      </View>

      {/* ── Meta: status | applied date ── */}
      <View style={[styles.metaRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.statusChip, { backgroundColor: chip.bg }]}>
          <Dot size={RFValue(14)} color={chip.color} strokeWidth={5} />
          <Text style={[styles.statusChipText, { color: chip.color }]}>{chip.label}</Text>
        </View>

        {appliedOn && (
          <View style={styles.appliedRow}>
            <CalendarDays size={RFValue(12)} color="#94A3B8" strokeWidth={1.8} />
            <Text style={[styles.appliedText, { color: colors.textSecondary }]}>
              Applied {appliedOn}
            </Text>
          </View>
        )}
      </View>

      {/* ── Body: the message that was sent ── */}
      {!!message && (
        <View style={styles.body}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Your Application
          </Text>
          <Text style={[styles.messageText, { color: colors.textSecondary }]} numberOfLines={5}>
            {message}
          </Text>
        </View>
      )}

      {/* ── Footer actions ── */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {!isClosed && (
          <TouchableOpacity
            style={[styles.withdrawBtn, { borderColor: colors.border }]}
            onPress={onWithdraw}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <>
                <Trash2 size={RFValue(12)} color="#64748B" strokeWidth={1.8} />
                <Text style={[styles.withdrawBtnText, { color: colors.textPrimary }]}>
                  Withdraw
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.viewJobBtn, isClosed && styles.viewJobBtnFull]}
          onPress={onViewJob}
          activeOpacity={0.85}>
          <Text style={styles.viewJobBtnText}>View Job</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: RFValue(14),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
  },
  avatar: {
    width: RFValue(36),
    height: RFValue(36),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
  },
  titleBlock: { flex: 1, gap: 2 },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    lineHeight: RFValue(16),
  },
  companyName: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
  rateBlock: { alignItems: 'flex-end', flexShrink: 0 },
  rateValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },
  rateLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(8),
    marginTop: 1,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
    paddingRight: 8,
    paddingVertical: 3,
    borderRadius: 500,
  },
  statusChipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  appliedText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
  },

  // Body
  body: { padding: 14, paddingBottom: 10 },
  sectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    marginBottom: 6,
  },
  messageText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(15),
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  withdrawBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
  },
  viewJobBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F2A154',
  },
  viewJobBtnFull: { flex: 1 },
  viewJobBtnText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
  },
});

export default SubRequestedCard;
