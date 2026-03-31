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
 *   status       'Pending' | 'Active' | 'Accepted' | 'In Progress'
 *   onEdit       function
 *   onDelete     function
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MapPin, User, Calendar, Pencil, Trash2 } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const STATUS_COLORS = {
  Pending:     { bg: '#F0A05B', text: '#FFFFFF' },
  Active:      { bg: '#077a09ff', text: '#FFFFFF' },
  Accepted:    { bg: '#6E62E5', text: '#FFFFFF' },
  'In Progress': { bg: '#1E3A8A', text: '#FFFFFF' },
};

const JobCard = ({
  jobId,
  title,
  trade,
  location,
  assignee,
  startDate,
  status = 'Pending',
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.Pending;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Top row: job id + status badge */}
      <View style={styles.topRow}>
        <Text style={[styles.jobId, { color: colors.textPrimary }]}>{jobId}</Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>{status}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.trade, { color: colors.textSecondary }]}>{trade}</Text>

      {/* Meta: location + assignee */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{location}</Text>
        </View>
        <View style={styles.metaItem}>
          <User size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{assignee}</Text>
        </View>
      </View>

      {/* Bottom: actions + start date */}
      <View style={styles.bottomRow}>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={styles.actionBtn}>
            <Pencil size={RFValue(14)} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.actionBtn}>
            <Trash2 size={RFValue(14)} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={[styles.metaItem, { borderWidth: 0.95, borderColor: '#E2E8F0', padding: 5 }]}>
          <Calendar size={RFValue(11)} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{startDate}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: RFValue(14),
    marginBottom: RFValue(12),
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
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
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
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    padding: 4,
  },
});

export default JobCard;
