import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBookings,
  clearBookings,
  clearAllBookings,
} from '~redux/reducers/subcontractorBookingsSlice';

const useSubcontractorBookings = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((s) => s.subcontractorBookings.bookings);
  // Future selectors plug in the same way:
  // const details = useSelector((s) => s.subcontractorBookings.bookingDetails);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const getBookings   = useCallback(() => dispatch(fetchBookings()),    [dispatch]);
  const resetBookings = useCallback(() => dispatch(clearBookings()),    [dispatch]);
  const resetAll      = useCallback(() => dispatch(clearAllBookings()), [dispatch]);

  // Future actions (add here as endpoints are built):
  // const getBookingDetails = useCallback((id) => dispatch(fetchBookingDetails(id)), [dispatch]);
  // const acceptBooking     = useCallback((id) => dispatch(acceptBookingAction(id)), [dispatch]);
  // const rejectBooking     = useCallback((id) => dispatch(rejectBookingAction(id)), [dispatch]);

  return {
    // Categorized data — mirrors API response shape
    offers:     data.offers,
    pending:    data.pending,
    inProgress: data.inProgress,
    completed:  data.completed,

    loading,
    error,

    getBookings,
    resetBookings,
    resetAll,
  };
};

export default useSubcontractorBookings;
