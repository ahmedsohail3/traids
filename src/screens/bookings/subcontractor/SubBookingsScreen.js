/**
 * SubBookingsScreen — "My Bookings" for the Subcontractor role.
 * FilterTabs: Offers | Requested | In Progress | Pending | Completed
 *
 * API shape:
 *   offers[]     — offer objects: { _id, status, job{...}, company{...}, compliance{...} }
 *   requested[]  — the subcontractor's own applications:
 *                  { _id, status, message, proposedDailyRate, createdAt, job{...}, company{...} }
 *   inProgress[] — job objects:   { _id, jobTitle, trade, siteAddress, company{...}, ... }
 *   pending[]    — job objects (same shape as inProgress)
 *   completed[]  — job objects (same shape as inProgress)
 */
import { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from '~context/ThemeContext';
import { ScrollView, Text } from '~components/Common';
import Header from '~components/Header';
import FilterTabs from '~components/Common/FilterTabs';
import SubOfferCard from '~components/Job/SubOfferCard';
import SubBookingCard from '~components/Job/SubBookingCard';
import SubRequestedCard from '~components/Job/SubRequestedCard';
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

// A job is only displayed when it actually has a title.
const hasTitle = (job) => typeof job?.jobTitle === 'string' && job.jobTitle.trim().length > 0;

// ─── Screen ───────────────────────────────────────────────────────────────────

const SubBookingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Offers');

  const {
    offers:     rawOffers,
    requested:  rawRequested,
    pending:    rawPending,
    inProgress: rawInProgress,
    completed:  rawCompleted,
    getBookings,
  } = useSubcontractorBookings();
  const {
    acceptJobOffer, rejectJobOffer, processingOfferAction,
    withdrawApplication, withdrawingApplication,
  } = useSubcontractorJobs();
  const { showAlert, showConfirm } = useAlert();

  // Drop entries with no job title — deleted/incomplete jobs come back from the
  // API as `job: null` (offers) or without a jobTitle (bookings).
  const offers = useMemo(
    () => rawOffers.filter((o) => hasTitle(o?.job)),
    [rawOffers],
  );
  const requested = useMemo(
    () => rawRequested.filter((a) => hasTitle(a?.job)),
    [rawRequested],
  );
  const inProgress = useMemo(() => rawInProgress.filter(hasTitle), [rawInProgress]);
  const pending    = useMemo(() => rawPending.filter(hasTitle),    [rawPending]);
  const completed  = useMemo(() => rawCompleted.filter(hasTitle),  [rawCompleted]);

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

  const handleWithdraw = (applicationId) => {
    showConfirm({
      title:       'Withdraw Application',
      message:     'Are you sure you want to withdraw this application? This cannot be undone.',
      confirmText: 'Withdraw',
      type:        'error',
      onConfirm:   async () => {
        try {
          await withdrawApplication(applicationId);
          showAlert({ title: 'Withdrawn', message: 'Application withdrawn.', type: 'success' });
          getBookings();
        } catch (err) {
          showAlert({ title: 'Error', message: err ?? 'Failed to withdraw application.', type: 'error' });
        }
      },
    });
  };

  const filterTabs = useMemo(() => [
    { key: 'Offers',      label: 'Offers',       count: offers.length },
    { key: 'Requested',   label: 'Requested',    count: requested.length },
    { key: 'In Progress', label: 'In Progress',  count: inProgress.length },
    { key: 'Pending',     label: 'Pending',      count: pending.length },
    { key: 'Completed',   label: 'Completed',    count: completed.length },
  ], [offers.length, requested.length, inProgress.length, pending.length, completed.length]);

  // Auto-select first tab with data once bookings load; fall back to Offers.
  useEffect(() => {
    const counts = {
      'Offers':      offers.length,
      'Requested':   requested.length,
      'In Progress': inProgress.length,
      'Pending':     pending.length,
      'Completed':   completed.length,
    };
    const firstNonEmpty = Object.keys(counts).find((k) => counts[k] > 0);
    setActiveTab(firstNonEmpty ?? 'Offers');
  }, [offers.length, requested.length, inProgress.length, pending.length, completed.length]);

  const activeBookings = useMemo(() => {
    switch (activeTab) {
      case 'In Progress': return inProgress;
      case 'Pending':     return pending;
      case 'Completed':   return completed;
      default:            return [];
    }
  }, [activeTab, inProgress, pending, completed]);

  const activeCount = {
    'Offers':    offers.length,
    'Requested': requested.length,
  }[activeTab] ?? activeBookings.length;

  const emptyLabel = {
    'Offers':      'No offers yet',
    'Requested':   'You have not applied for any jobs yet',
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
        ) : activeTab === 'Offers' ? (
          offers.map((offer, idx) => {
            const job     = offer.job     ?? {};
            const company = offer.company ?? {};
            return (
              <SubOfferCard
                key={offer._id}
                jobTitle={job.jobTitle}
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
        ) : activeTab === 'Requested' ? (
          requested.map((application, idx) => {
            const job     = application.job     ?? {};
            const company = application.company ?? {};
            // The proposed rate is what the subcontractor bid; the job's own
            // rate is the fallback for an application that carries neither.
            const bid = application.proposedDailyRate ?? job.hourlyRate;
            return (
              <SubRequestedCard
                key={application._id}
                jobTitle={job.jobTitle}
                companyName={company.companyName ?? '—'}
                companyInitial={(company.companyName ?? '?')[0].toUpperCase()}
                companyColorIndex={idx % 5}
                rate={bid != null ? `£${bid}/hr` : '—'}
                message={stripHtml(application.message)}
                status={application.status}
                appliedAt={application.createdAt ?? application.appliedAt}
                loading={withdrawingApplication}
                onPress={() => navigation.navigate('SubJobDetail', { jobId: job._id })}
                onViewJob={() => navigation.navigate('SubJobDetail', { jobId: job._id })}
                onWithdraw={() => handleWithdraw(application._id)}
              />
            );
          })
        ) : (
          activeBookings.map((booking, idx) => {
            const company = booking.company ?? {};
            return (
              <SubBookingCard
                key={booking._id}
                companyName={company.companyName ?? '—'}
                companyInitial={(company.companyName ?? '?')[0].toUpperCase()}
                companyColorIndex={idx % 5}
                title={booking.jobTitle}
                status={tabStatusLabel[activeTab] ?? 'Pending'}
                description={stripHtml(booking.description)}
                location={booking.siteAddress ?? '—'}
                trade={booking.trade ?? '—'}
                onPress={() => navigation.navigate('SubBookingDetail', { booking })}
              />
            );
          })
        )}
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
