/**
 * ApplicantCard — displays a quote/bid from a subcontractor.
 * Used in CompanyJobDetailScreen.
 *
 * Props:
 *   name        string
 *   trade       string
 *   rate        string   e.g. "£12/hr"
 *   message     string
 *   avatarUri   string
 *   isVerified  boolean
 *   status      'pending' | 'accepted'
 *   onCancel    function
 *   onAccept    function
 *   canRespond  boolean — false hides Accept/Reject (offers, where the
 *               subcontractor is the one who responds)
 *   onMessage   function
 */
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, Avatar } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { CheckCircle2 } from 'lucide-react-native';

const STATUS_BADGE = {
  accepted: { label: 'Accepted', color: '#077a09' },
  rejected: { label: 'Rejected', color: '#DC2626' },
};

const ApplicantCard = ({
  name,
  trade,
  rate,
  message,
  avatarUri,
  isVerified,
  status = 'pending',
  canRespond = true,
  loading = false,
  onReject,
  onAccept,
  onMessage,
}) => {
  const { colors } = useTheme();
  const badge = STATUS_BADGE[status];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <Avatar uri={avatarUri} size={RFValue(36)} />
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={RFValue(10)} color="#10375C" fill="#FFFFFF" />
              </View>
            )}
          </View>
          <View>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{name}</Text>
            <Text style={[styles.trade, { color: colors.textSecondary }]}>{trade}</Text>
          </View>
        </View>

        <View style={styles.quoteSection}>
          {badge ? (
            <View style={[styles.statusBadge, { backgroundColor: badge.color }]}>
              <Text style={styles.statusBadgeText}>{badge.label}</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.quoteLabel, { color: colors.textSecondary }]}>Qoute/Bid</Text>
              <Text style={[styles.quoteValue, { color: colors.textPrimary }]}>{rate}</Text>
            </>
          )}
        </View>
      </View>

      {/* Quote for accepted/rejected (badge replaces it in top row) */}
      {badge && (
        <View style={styles.quoteRow}>
          <Text style={[styles.quoteLabel, { color: colors.textSecondary }]}>Qoute/Bid</Text>
          <Text style={[styles.quoteValue, { color: colors.textPrimary }]}>{rate}</Text>
        </View>
      )}

      {/* Message Section */}
      {message && <View style={styles.messageSection}>
        <Text style={[styles.messageTitle, { color: colors.textPrimary }]}>Message</Text>
        <Text style={[styles.messageBody, { color: '#64748B' }]}>{message}</Text>
      </View>}

      {/* Bottom Actions — Accept/Reject only where the company is the one
          deciding, i.e. a subcontractor applied. An offer is the company's own
          booking, so there is nothing for it to accept or reject. */}
      {status === 'pending' && canRespond ? (
        <>
          <View style={styles.actionsRow}>
            <Button
              title="Reject"
              variant="outline"
              onPress={onReject}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <View style={{ width: 12 }} />
            <Button
              title={loading ? 'Processing…' : 'Accept'}
              variant="primary"
              onPress={onAccept}
              disabled={loading}
              style={{ flex: 1, backgroundColor: '#F2A154' }}
            />
          </View>
          <View style={[styles.actionsRow, styles.messageRow]}>
            <Button
              title="Message"
              variant="outline"
              onPress={onMessage}
              style={{ flex: 1 }}
            />
          </View>
        </>
      ) : (
        <View style={styles.actionsRow}>
          <Button
            title="Message"
            variant="outline"
            onPress={onMessage}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 1,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    marginBottom: 2,
  },
  trade: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
  },
  quoteSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  quoteLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    marginBottom: 2,
  },
  quoteValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
  },
  quoteRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  messageSection: {
    padding: 16,
    paddingBottom: 0,
  },
  messageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    marginBottom: 6,
  },
  messageBody: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(16),
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
  },
  messageRow: {
    paddingTop: 0,
  },
});

export default ApplicantCard;
