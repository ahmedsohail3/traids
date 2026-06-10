/**
 * SubBookingsScreen — "My Bookings" for the Subcontractor role.
 * FilterTabs: Offers | In Progress | Pending | Completed
 *
 * API shape:
 *   offers[]     — offer objects: { _id, status, job{...}, company{...}, compliance{...} }
 *   inProgress[] — job objects:   { _id, jobTitle, trade, siteAddress, company{...}, ... }
 *   pending[]    — job objects (same shape as inProgress)
 *   completed[]  — job objects (same shape as inProgress)
 */
import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from '~context/ThemeContext';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import FilterTabs from '~components/Common/FilterTabs';
import SubOfferCard from '~components/Job/SubOfferCard';
import SubBookingCard from '~components/Job/SubBookingCard';
import useSubcontractorBookings from '~hooks/useSubcontractorBookings';
import useSubcontractorJobs from '~hooks/useSubcontractorJobs';
import useAlert from '~hooks/useAlert';
import { stripHtml } from '~utils';
import { FontFamily } from '~theme/fonts';

// Flatten compliance sub-arrays into SubOfferCard's { name, verified } shape.
const mapComplianceDocs = (compliance) => {
  if (!compliance) return [];
  return [
    ...(compliance.RAMS      ?? []),
    ...(compliance.drawings   ?? []),
    ...(compliance.permits    ?? []),
    ...(compliance.reports    ?? []),
    ...(compliance.incidents  ?? []),
  ].map((doc) => ({
    name:     doc.name ?? doc.fileName ?? 'Document',
    verified: doc.verified ?? false,
  }));
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const SubBookingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Offers');

  const { offers, pending, inProgress, completed, getBookings } = useSubcontractorBookings();
  const { acceptJobOffer, rejectJobOffer, processingOfferAction } = useSubcontractorJobs();
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => { getBookings(); }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => getBookings());
    return unsubscribe;
  }, [navigation, getBookings]);

  const handleAccept = (offerId) => {
    showConfirm({
      title:       'Accept Offer',
      message:     'Are you sure you want to accept this job offer?',
      confirmText: 'Accept',
      type:        'success',
      onConfirm:   async () => {
        try {
          await acceptJobOffer(offerId);
          showAlert({ title: 'Accepted', message: 'Offer accepted successfully.', type: 'success' });
          getBookings();
        } catch (err) {
          showAlert({ title: 'Error', message: err ?? 'Failed to accept offer.', type: 'error' });
        }
      },
    });
  };

  const handleReject = (offerId) => {
    showConfirm({
      title:       'Reject Offer',
      message:     'Are you sure you want to reject this job offer?',
      confirmText: 'Reject',
      type:        'error',
      onConfirm:   async () => {
        try {
          await rejectJobOffer(offerId);
          showAlert({ title: 'Rejected', message: 'Offer rejected successfully.', type: 'success' });
          getBookings();
        } catch (err) {
          showAlert({ title: 'Error', message: err ?? 'Failed to reject offer.', type: 'error' });
        }
      },
    });
  };

  const filterTabs = useMemo(() => [
    { key: 'Offers',      label: 'Offers',      count: offers.length },
    { key: 'In Progress', label: 'In Progress',  count: inProgress.length },
    { key: 'Pending',     label: 'Pending',      count: pending.length },
    { key: 'Completed',   label: 'Completed',    count: completed.length },
  ], [offers.length, inProgress.length, pending.length, completed.length]);

  // Auto-select first tab with data once bookings load; fall back to Offers.
  useEffect(() => {
    const counts = {
      'Offers':      offers.length,
      'In Progress': inProgress.length,
      'Pending':     pending.length,
      'Completed':   completed.length,
    };
    const firstNonEmpty = Object.keys(counts).find((k) => counts[k] > 0);
    setActiveTab(firstNonEmpty ?? 'Offers');
  }, [offers.length, inProgress.length, pending.length, completed.length]);

  const activeBookings = useMemo(() => {
    switch (activeTab) {
      case 'In Progress': return inProgress;
      case 'Pending':     return pending;
      case 'Completed':   return completed;
      default:            return [];
    }
  }, [activeTab, inProgress, pending, completed]);

  const activeCount = activeTab === 'Offers' ? offers.length : activeBookings.length;

  const emptyLabel = {
    'Offers':      'No offers yet',
    'In Progress': 'No jobs in progress',
    'Pending':     'No pending jobs',
    'Completed':   'No completed jobs',
  };

  // Tab key → SubBookingCard status label
  const tabStatusLabel = { 'In Progress': 'In Progress', Pending: 'Pending', Completed: 'Completed' };

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
        {activeCount === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {emptyLabel[activeTab]}
            </Text>
          </View>
        ) : activeTab === 'Offers'
          ? offers.map((offer, idx) => {
              const job     = offer.job     ?? {};
              const company = offer.company ?? {};
              return (
                <SubOfferCard
                  key={offer._id}
                  jobTitle={job.jobTitle ?? '—'}
                  companyName={company.companyName ?? '—'}
                  companyInitial={(company.companyName ?? '?')[0].toUpperCase()}
                  companyColorIndex={idx % 5}
                  rate={job.hourlyRate != null ? `£${job.hourlyRate}/hr` : '—'}
                  message={stripHtml(job.description)}
                  documents={mapComplianceDocs(offer.compliance)}
                  status={offer.status ?? 'pending'}
                  loading={processingOfferAction}
                  onPress={() => navigation.navigate('SubBookingDetail', { booking: offer })}
                  onAccept={() => handleAccept(offer._id)}
                  onReject={() => handleReject(offer._id)}
                  onViewDoc={() => {}}
                />
              );
            })
          : activeBookings.map((booking, idx) => {
              const company = booking.company ?? {};
              return (
                <SubBookingCard
                  key={booking._id}
                  companyName={company.companyName ?? '—'}
                  companyInitial={(company.companyName ?? '?')[0].toUpperCase()}
                  companyColorIndex={idx % 5}
                  title={booking.jobTitle ?? '—'}
                  status={tabStatusLabel[activeTab] ?? 'Pending'}
                  description={stripHtml(booking.description)}
                  location={booking.siteAddress ?? '—'}
                  trade={booking.trade ?? '—'}
                  onPress={() => navigation.navigate('SubBookingDetail', { booking })}
                />
              );
            })}
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
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.regular,
  },
});

export default SubBookingsScreen;
