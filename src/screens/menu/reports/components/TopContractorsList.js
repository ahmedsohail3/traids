import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { Filter, BadgeCheck, Users } from 'lucide-react-native';

const TopContractorsList = ({ data }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Performing Contractors</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={RFValue(14)} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {hasData ? (
        <View style={styles.list}>
          {data.map((item, idx) => (
            <View key={item._id ?? item.id ?? idx} style={styles.itemRow}>
              <View style={styles.contractorInfoRow}>
                <View style={styles.avatarWrap}>
                  <Image
                    source={{ uri: item.avatar ?? item.profileImage ?? `https://i.pravatar.cc/150?u=${item._id ?? idx}` }}
                    style={styles.avatar}
                  />
                  {item.verified && (
                    <View style={styles.verifiedBadge}>
                      <BadgeCheck size={RFValue(10)} color="#3B82F6" fill="#fff" />
                    </View>
                  )}
                </View>

                <View style={styles.detailsCol}>
                  <Text style={styles.name}>{item.name ?? '—'}</Text>
                  <Text style={styles.tradeInfo}>
                    {[item.trade, item.jobs != null ? `${item.jobs} Jobs` : null].filter(Boolean).join(' · ')}
                  </Text>
                </View>

                <View style={styles.spendCol}>
                  <Text style={styles.spendAmount}>{item.spend ?? '—'}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                {item.rating != null && (
                  <Text style={[styles.statText, { fontFamily: FontFamily.medium }]}>Rating: {item.rating}</Text>
                )}
                {item.onTime != null && (
                  <Text style={[styles.statText, { color: '#22C55E' }]}>On-Time: {item.onTime}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <Users size={32} color="#CBD5E1" />
          <Text style={styles.emptyText}>No contractor data yet.</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
  filterBtn: {
    padding: 4,
  },
  list: {
    paddingHorizontal: 20,
  },
  itemRow: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12
  },
  contractorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  detailsCol: {
    flex: 1,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 2,
  },
  tradeInfo: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  spendCol: {
    alignItems: 'flex-end',
  },
  spendAmount: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 48,
  },
  statText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(9.5),
    color: '#64748B',
  },
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

export default TopContractorsList;
