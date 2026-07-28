/**
 * JobCard — compact job listing card.
 * Used in "Recent Jobs" on company dashboard and "Recent Jobs" on subcontractor dashboard.
 *
 * Props:
 *   jobId        string    e.g. "Job #1"
 *   title        string    job title
 *   trade        string    e.g. "Electrician"
 *   location     string
 *   assignee     string    e.g. "Unassigned"
 *   startDate    string    e.g. "Starts Nov 1"
 *   status       'Pending' | 'Active' | 'Accepted' | 'In Progress' | 'Completed'
 *   onEdit       function
 *   onDelete     function
 *   onShare      function
 *   onStart      function
 */
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MapPin, User, Calendar, Pencil, Trash2, Share2 } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const STATUS_COLORS = {
  Pending:       { bg: '#F0A05B', text: '#FFFFFF' },
  Active:        { bg: '#077a09ff', text: '#FFFFFF' },
  Accepted:      { bg: '#E2E8F0', text: '#64748B' }, // Light gray / slate
  'In Progress': { bg: '#1E3A8A', text: '#FFFFFF' },
  Completed:     { bg: '#3BB273', text: '#FFFFFF' },
};

const JobCard = ({
  jobId,
  title,
  trade,
  location,
  assignee,
  startDate,
  status,
  onPress,
  onEdit,
  onDelete,
  onShare,
  onStart,    // 'Start Job' action — shown when status is Pending
  onComplete, // 'Complete Job' action — shown when status is In Progress
}) => {
  const { colors } = useTheme();
  // We use lowercase match just in case "In Progress" vs "In progress"
  const getStatusColor = () => {
    if (status.toLowerCase().includes('progress')) return STATUS_COLORS['In Progress'];
    return STATUS_COLORS[status] ?? STATUS_COLORS.Pending;
  };
  const statusStyle = getStatusColor();
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Top row: job id + status badge */}
      <View style={styles.topRow}>
        <Text style={[styles.jobId, { color: colors.textPrimary }]}>{jobId}</Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>{status}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
      <Text style={[styles.trade, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{trade}</Text>

      {/* Meta: location + assignee */}
      <View style={styles.metaCol}>
        <View style={styles.metaItem}>
          <MapPin size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{location}</Text>
        </View>
        <View style={styles.metaItem}>
          <User size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{assignee}</Text>
        </View>
      </View>

      {/* Bottom: actions + start date */}
      <View style={styles.bottomRow}>
        <View style={styles.actions}>
          {status?.toLowerCase() !== 'completed' && (
            <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={styles.actionBtn}>
              <Pencil size={RFValue(13)} color="#64748B" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {!status?.toLowerCase().includes('progress') && status?.toLowerCase() !== 'completed' && (
            <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.actionBtn}>
              <Trash2 size={RFValue(13)} color="#EF4444" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity onPress={onShare} activeOpacity={0.7} style={styles.actionBtn}>
              <Share2 size={RFValue(13)} color="#64748B" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        {status?.toLowerCase() === 'pending' && onStart ? (
           <TouchableOpacity onPress={onStart} style={styles.startBtn} activeOpacity={0.7}>
             <Text style={styles.startBtnText}>Start Job</Text>
           </TouchableOpacity>
        ) : status?.toLowerCase().includes('progress') && onComplete ? (
           <TouchableOpacity onPress={onComplete} style={styles.startBtn} activeOpacity={0.7}>
             <Text style={styles.startBtnText}>Complete Job</Text>
           </TouchableOpacity>
        ) : (
          <View style={[styles.metaItem, { borderWidth: 0.95, borderColor: '#E2E8F0', padding: 5, borderRadius: 6, }]}>
            <Calendar size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{startDate}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: RFValue(14),
    marginBottom: RFValue(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  jobId: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.semiBold,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.semiBold,
  },
  title: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.bold,
    marginBottom: 2,
  },
  trade: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  metaCol: {
    flexDirection: 'column',
    gap: 5,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  startBtn: {
    borderWidth: 1,
    borderColor: '#10375C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startBtnText: {
    color: '#10375C',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
  }
});

export default JobCard;
