import { View, StyleSheet } from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { FolderOpen } from 'lucide-react-native';

const STATUS_COLORS = {
  active:    '#10375C',
  completed: '#22C55E',
  delayed:   '#EF4444',
};

const statusColor = (status) =>
  STATUS_COLORS[status?.toLowerCase()] ?? '#64748B';

const ProjectCostList = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Project Cost Summary</Text>

      {hasData ? (
        <View style={styles.list}>
          {data.map((item, index) => (
            <View
              key={item._id ?? item.id ?? index}
              style={[styles.itemRow, index !== data.length - 1 && styles.borderBottom]}
            >
              <View style={styles.topRow}>
                <View style={styles.nameBlock}>
                  <Text style={styles.projectName}>{item.name ?? item.jobTitle ?? '—'}</Text>
                  {(item.manager ?? item.managerName) ? (
                    <Text style={styles.managerName}>{item.manager ?? item.managerName}</Text>
                  ) : null}
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) }]}>
                  <Text style={styles.statusText}>
                    {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : '—'}
                  </Text>
                </View>
              </View>

              <View style={styles.bottomRow}>
                {item.budget != null && (
                  <Text style={styles.bottomText}>Budget: {item.budget}</Text>
                )}
                {item.actual != null && (
                  <Text style={[styles.bottomText, item.actualWarning && styles.warning]}>
                    Actual: <Text style={[styles.boldText, item.actualWarning && styles.warning]}>{item.actual}</Text>
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <FolderOpen size={32} color="#CBD5E1" />
          <Text style={styles.emptyText}>No project cost data yet.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list:       { paddingHorizontal: 20 },
  itemRow:    { paddingVertical: 14 },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameBlock: { flex: 1, paddingRight: 10 },
  projectName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 2,
  },
  managerName: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#FFFFFF',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#64748B',
  },
  boldText: {
    fontFamily: FontFamily.bold,
    color: '#334155',
  },
  warning: { color: '#EF4444' },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
});

export default ProjectCostList;
