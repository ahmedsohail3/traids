/**
 * ReviewCard — a review left on the subcontractor, used by both the "Total
 * Reviews" list on the profile and the "Verified Client Review" block on a
 * project's detail screen.
 *
 * Props:
 *   reviewerName    string
 *   reviewerAvatar  string|null
 *   rating          number
 *   createdAt       string|null  ISO; the time badge hides when unparseable
 *   comment         string
 *   compact         boolean      the tighter variant used on the detail screen
 */
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Clock } from 'lucide-react-native';
import { Text, Avatar } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { timeAgo } from '~utils';
import StarRating from './StarRating';

const ReviewCard = ({
  reviewerName,
  reviewerAvatar,
  rating = 0,
  createdAt,
  comment,
  compact = false,
}) => {
  const when = timeAgo(createdAt);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.meta}>
          <Avatar uri={reviewerAvatar} size={RFValue(34)} />
          <View style={styles.textStack}>
            <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={1}>
              {reviewerName || 'Anonymous'}
            </Text>
            <StarRating
              value={rating}
              size={compact ? 9 : 10}
              valuePlacement={compact ? 'after' : 'before'}
            />
          </View>
        </View>

        {!!when && (
          <View style={styles.timeBadge}>
            <Clock size={RFValue(11)} color="#545454" strokeWidth={1.8} />
            <Text style={styles.timeText}>{when}</Text>
          </View>
        )}
      </View>

      {!!comment && (
        <Text style={[styles.comment, compact && styles.commentCompact]}>{comment}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 16,
    padding: RFValue(14),
    gap: RFValue(10),
  },
  cardCompact: {
    borderRadius: 12,
    padding: RFValue(11),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  textStack: { gap: 2, flexShrink: 1 },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(13),
    color: '#2E2E2E',
  },
  nameCompact: { fontSize: RFValue(12) },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  timeText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9.5),
    color: '#545454',
  },
  comment: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    lineHeight: RFValue(17),
    color: '#292929',
  },
  commentCompact: {
    fontSize: RFValue(10.5),
    lineHeight: RFValue(15),
  },
});

export default ReviewCard;
