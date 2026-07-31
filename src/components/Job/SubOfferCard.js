/**
 * SubOfferCard — incoming job offer card for the Subcontractor "Offers" tab.
 *
 * Props:
 *   jobTitle           string
 *   companyName        string
 *   companyInitial     string
 *   companyColorIndex  number
 *   rate               string   e.g. "£12/hr"
 *   message            string
 *   documents          Array<{ name: string, verified: boolean }>
 *   onReject           function
 *   onAccept           function
 *   onViewDoc          function(docName)
 *   onPress            function
 */
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {FileText, Eye, CheckCircle} from 'lucide-react-native';
import {Text} from '~components/Common';
import {FontFamily} from '~theme/fonts';
import {useTheme} from '~context/ThemeContext';

const STATUS_BADGE = {
  accepted: {label: 'Accepted', color: '#077a09'},
  rejected: {label: 'Rejected', color: '#DC2626'},
};

const AVATAR_COLORS = ['#10375C', '#F2A154', '#3BB273', '#6366F1', '#EC4899'];

const SubOfferCard = ({
  jobTitle,
  companyName,
  companyInitial,
  companyColorIndex = 0,
  rate,
  message,
  documents = [],
  status = 'pending',
  loading = false,
  onReject,
  onAccept,
  onViewDoc,
  onPress,
}) => {
  const {colors} = useTheme();
  const avatarColor = AVATAR_COLORS[companyColorIndex % AVATAR_COLORS.length];
  // const allVerified = documents.length > 0 && documents.every(d => d.verified);
  const badge = STATUS_BADGE[status];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        styles.card,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      {/* ── Header: logo | title+company | rate ── */}
      <View style={[styles.header, {borderBottomColor: colors.border}]}>
        <View style={[styles.avatar, {backgroundColor: avatarColor}]}>
          <Text style={styles.avatarText}>{companyInitial}</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text
            style={[styles.jobTitle, {color: colors.textPrimary}]}
            numberOfLines={2}>
            {jobTitle}
          </Text>
          <Text style={[styles.companyName, {color: colors.textSecondary}]}>
            {companyName}
          </Text>
        </View>

        <View style={styles.rateBlock}>
          <Text style={[styles.rateValue, {color: colors.textPrimary}]}>
            {rate}
          </Text>
          <Text style={[styles.rateLabel, {color: colors.textSecondary}]}>
            Quote/Bid
          </Text>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* Message */}
        <Text style={[styles.sectionLabel, {color: colors.textPrimary}]}>
          Message
        </Text>
        <Text
          style={[styles.messageText, {color: colors.textSecondary}]}
          numberOfLines={5}>
          {message}
        </Text>

        {/* Compliance Documents */}
        {documents.length > 0 && (
          <Text
            style={[
              styles.sectionLabel,
              {color: colors.textPrimary, marginTop: 12},
            ]}>
            Compliance &amp; Safety Documents
          </Text>
        )}

        {documents.map((doc, i) => (
          <View
            key={i}
            style={[
              styles.docRow,
              {
                backgroundColor: doc.verified ? '#F0FDF4' : colors.surface,
                borderColor: doc.verified ? '#16A34A' : colors.border,
              },
            ]}>
            <FileText
              size={RFValue(13)}
              color={doc.verified ? '#16A34A' : '#94A3B8'}
              strokeWidth={1.8}
            />
            <Text
              style={[
                styles.docName,
                {color: doc.verified ? '#16A34A' : colors.textPrimary},
              ]}
              numberOfLines={1}>
              {doc.name}
            </Text>
            <View style={styles.docIcons}>
              <TouchableOpacity
                onPress={() => onViewDoc?.(doc.name)}
                hitSlop={8}>
                <Eye size={RFValue(14)} color="#94A3B8" strokeWidth={1.8} />
              </TouchableOpacity>
              {doc.verified ? (
                <CheckCircle
                  size={RFValue(15)}
                  color="#22C55E"
                  strokeWidth={1.5}
                />
              ) : (
                <CheckCircle
                  size={RFValue(15)}
                  color="#CBD5E1"
                  strokeWidth={1.5}
                />
              )}
            </View>
          </View>
        ))}
      </View>

      {/* ── Footer actions ── */}
      <View style={[styles.footer, {borderTopColor: colors.border}]}>
        {badge ? (
          <View style={[styles.statusBadge, {backgroundColor: badge.color}]}>
            <Text style={styles.statusBadgeText}>{badge.label}</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.rejectBtn, {borderColor: colors.primary}]}
              onPress={onReject}
              disabled={loading}
              activeOpacity={0.8}>
              <Text style={[styles.rejectBtnText, {color: colors.textPrimary}]}>
                Reject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={onAccept}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.acceptBtnText, {color: '#FFFFFF'}]}>
                  Accept
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
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
    shadowOffset: {width: 0, height: 2},
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
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  jobTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    lineHeight: RFValue(16),
  },
  companyName: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
  rateBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  rateValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },
  rateLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(8),
    marginTop: 1,
  },

  // Body
  body: {
    padding: 14,
    paddingBottom: 8,
  },
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
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  docName: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
  },
  docIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
  },
  rejectBtn: {
    flex: 1,
    height: RFValue(40),
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
  },
  acceptBtn: {
    flex: 1,
    height: RFValue(40),
    borderRadius: 8,
    // borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2A154',
  },
  acceptBtnFilled: {
    backgroundColor: '#F2A154',
  },
  acceptBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
  },
  statusBadge: {
    flex: 1,
    height: RFValue(40),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
  },
});

export default SubOfferCard;
