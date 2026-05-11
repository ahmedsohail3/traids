/**
 * SubBookingsScreen — "My Bookings" for the Subcontractor role.
 * FilterTabs: Offers | In Progress | Pending | Completed
 */
import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '~context/ThemeContext';
import { ScrollView } from '~components/Common';
import Header from '~components/Header';
import FilterTabs from '~components/Common/FilterTabs';
import SubOfferCard from '~components/Job/SubOfferCard';
import SubBookingCard from '~components/Job/SubBookingCard';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_OFFERS = [
  {
    id: 'o1',
    jobTitle: 'Plumber Required for Small Task',
    companyName: 'Acme Construction',
    companyInitial: 'A',
    companyColorIndex: 1,
    rate: '£12/hr',
    message:
      'We are looking for a skilled and reliable Electrician to handle electrical installations and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge.',
    documents: [
      { name: 'RAMS.pdf', verified: true },
      { name: 'PublicLiability.pdf', verified: false },
      { name: 'RAMS.pdf', verified: false },
      { name: 'PublicLiability.pdf', verified: false },
    ],
  },
  {
    id: 'o2',
    jobTitle: 'Plumber Required for Small Task',
    companyName: 'Acme Construction',
    companyInitial: 'A',
    companyColorIndex: 1,
    rate: '£12/hr',
    message:
      'Hi, I have extensive experience with commercial HVAC systems. I can start immediately and have my own crew. I am available for the dates requested.',
    documents: [
      { name: 'RAMS.pdf', verified: true },
      { name: 'PublicLiability.pdf', verified: false },
      { name: 'RAMS.pdf', verified: false },
      { name: 'PublicLiability.pdf', verified: false },
    ],
  },
  {
    id: 'o3',
    jobTitle: 'Plumber Required for Small Task',
    companyName: 'Acme Construction',
    companyInitial: 'A',
    companyColorIndex: 1,
    rate: '£12/hr',
    message:
      'Hi, I have extensive experience with commercial HVAC systems. I can start immediately and have my own crew. I am available for the dates requested.',
    documents: [
      { name: 'RAMS.pdf', verified: true },
      { name: 'PublicLiability.pdf', verified: true },
      { name: 'RAMS.pdf', verified: true },
      { name: 'PublicLiability.pdf', verified: true },
    ],
  },
  {
    id: 'o4',
    jobTitle: 'Plumber Required for Small Task',
    companyName: 'Acme Construction',
    companyInitial: 'A',
    companyColorIndex: 1,
    rate: '£12/hr',
    message:
      'Hi, I have extensive experience with commercial HVAC systems. I can start immediately and have my own crew. I am available for the dates requested.',
    documents: [
      { name: 'RAMS.pdf', verified: true },
      { name: 'PublicLiability.pdf', verified: true },
      { name: 'RAMS.pdf', verified: true },
      { name: 'PublicLiability.pdf', verified: true },
    ],
  },
];

const MOCK_BOOKINGS = [
  {
    id: 'b1',
    companyName: 'VoltSpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    title: 'Senior Electrician',
    status: 'In Progress',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to…',
    location: '81 Guild Street, London, UK',
    trade: 'Electrician',
    rate: '£40/hr',
  },
  {
    id: 'b2',
    companyName: 'VoltSpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    title: 'Senior Electrician',
    status: 'In Progress',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to…',
    location: '81 Guild Street, London, UK',
    trade: 'Electrician',
    rate: '£40/hr',
  },
  {
    id: 'b3',
    companyName: 'VoltSpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    title: 'Senior Electrician',
    status: 'In Progress',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to…',
    location: '81 Guild Street, London, UK',
    trade: 'Electrician',
    rate: '£40/hr',
  },
  {
    id: 'b4',
    companyName: 'VoltSpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    title: 'Senior Electrician',
    status: 'Pending',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to…',
    location: '81 Guild Street, London, UK',
    trade: 'Electrician',
    rate: '£25/hr',
  },
  {
    id: 'b5',
    companyName: 'VoltSpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    title: 'Senior Electrician',
    status: 'Pending',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to…',
    location: '81 Guild Street, London, UK',
    trade: 'Electrician',
    rate: '£25/hr',
  },
  {
    id: 'b6',
    companyName: 'VoltSpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    title: 'Senior Electrician',
    status: 'Completed',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to…',
    location: '81 Guild Street, London, UK',
    trade: 'Electrician',
    rate: '£30/hr',
  },
  {
    id: 'b7',
    companyName: 'VoltSpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    title: 'Senior Electrician',
    status: 'Completed',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to…',
    location: '81 Guild Street, London, UK',
    trade: 'Electrician',
    rate: '£30/hr',
  },
  {
    id: 'b8',
    companyName: 'VoltSpark Ltd',
    companyInitial: 'V',
    companyColorIndex: 0,
    title: 'Senior Electrician',
    status: 'Completed',
    description:
      'We are looking for a skilled and reliable Electrician to handle electrical installations, repairs, and maintenance work for our ongoing project. The ideal candidate should have strong technical knowledge, attention to…',
    location: '81 Guild Street, London, UK',
    trade: 'Electrician',
    rate: '£30/hr',
  },
];

// ─── Tab config ───────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'Offers', label: 'Offers', count: MOCK_OFFERS.length }, // recalculated from array length
  { key: 'In Progress', label: 'In Progress', count: MOCK_BOOKINGS.filter(b => b.status === 'In Progress').length },
  { key: 'Pending', label: 'Pending', count: MOCK_BOOKINGS.filter(b => b.status === 'Pending').length },
  { key: 'Completed', label: 'Completed', count: MOCK_BOOKINGS.filter(b => b.status === 'Completed').length },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

const SubBookingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Offers');

  const bookings = useMemo(
    () => MOCK_BOOKINGS.filter(b => b.status === activeTab),
    [activeTab],
  );

  const navigateToDetail = booking =>
    navigation.navigate('SubBookingDetail', { booking });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="My Bookings" subtitle="Manage your assigned and ongoing jobs." />

      <View style={{ paddingVertical: 16 }}>
        <FilterTabs tabs={FILTER_TABS} activeTab={activeTab} onChange={setActiveTab} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {activeTab === 'Offers'
          ? MOCK_OFFERS.map(offer => (
              <SubOfferCard
                key={offer.id}
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
          : bookings.map(booking => (
              <SubBookingCard
                key={booking.id}
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
