/**
 * SubBookingsScreen — "My Bookings" for the Subcontractor role.
 * FilterTabs: Offers | In Progress | Pending | Completed
 */
import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '~context/ThemeContext';
import { ScrollView } from '~components/Common';
import Header from '~components/Header';
import FilterTabs from '~components/Common/FilterTabs';
import SubOfferCard from '~components/Job/SubOfferCard';
import SubBookingCard from '~components/Job/SubBookingCard';
import useSubcontractorBookings from '~hooks/useSubcontractorBookings';

// ─── Screen ───────────────────────────────────────────────────────────────────

const SubBookingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Offers');

  const { offers, pending, inProgress, completed, getBookings } = useSubcontractorBookings();

  useEffect(() => { getBookings(); }, []);

  const filterTabs = useMemo(() => [
    { key: 'Offers',      label: 'Offers',      count: offers.length },
    { key: 'In Progress', label: 'In Progress',  count: inProgress.length },
    { key: 'Pending',     label: 'Pending',      count: pending.length },
    { key: 'Completed',   label: 'Completed',    count: completed.length },
  ], [offers.length, inProgress.length, pending.length, completed.length]);

  const activeBookings = useMemo(() => {
    switch (activeTab) {
      case 'In Progress': return inProgress;
      case 'Pending':     return pending;
      case 'Completed':   return completed;
      default:            return [];
    }
  }, [activeTab, inProgress, pending, completed]);

  const navigateToDetail = booking =>
    navigation.navigate('SubBookingDetail', { booking });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="My Bookings" subtitle="Manage your assigned and ongoing jobs." />

      <View style={{ paddingVertical: 16 }}>
        <FilterTabs tabs={filterTabs} activeTab={activeTab} onChange={setActiveTab} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {activeTab === 'Offers'
          ? offers.map(offer => (
              <SubOfferCard
                key={offer.id ?? offer._id}
                {...offer}
                onPress={() => navigateToDetail({
                  ...offer,
                  title: offer.jobTitle,
                  status: 'Offer',
                })}
                onReject={() => {}}
                onAccept={() => {}}
                onViewDoc={() => {}}
              />
            ))
          : activeBookings.map(booking => (
              <SubBookingCard
                key={booking.id ?? booking._id}
                {...booking}
                onPress={() => navigateToDetail(booking)}
              />
            ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 4,
  },
});

export default SubBookingsScreen;
