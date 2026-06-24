import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyJobTimesheet,
  logTimesheetHours,
  submitTimesheet,
  clearMyJobTimesheet,
} from '~redux/reducers/subcontractorTimesheetSlice';

const EMPTY_ARRAY = [];

const selectTimesheets   = (s) => s.subcontractorTimesheet?.timesheets   ?? EMPTY_ARRAY;
const selectLoading      = (s) => s.subcontractorTimesheet?.loading      ?? false;
const selectError        = (s) => s.subcontractorTimesheet?.error        ?? null;
const selectLogging      = (s) => s.subcontractorTimesheet?.logging      ?? false;
const selectLogError     = (s) => s.subcontractorTimesheet?.logError     ?? null;
const selectSubmitting   = (s) => s.subcontractorTimesheet?.submitting   ?? false;
const selectSubmitError  = (s) => s.subcontractorTimesheet?.submitError  ?? null;
const selectSubmitMessage = (s) => s.subcontractorTimesheet?.submitMessage ?? null;

/**
 * useSubcontractorTimesheet
 *
 * GET /timesheets/my/job/{jobId}?weekNumber=N — fetches the subcontractor's
 * own timesheet for a given job + week.
 */
const useSubcontractorTimesheet = () => {
  const dispatch = useDispatch();

  const timesheets = useSelector(selectTimesheets);
  const loading    = useSelector(selectLoading);
  const error      = useSelector(selectError);
  const logging    = useSelector(selectLogging);
  const logError   = useSelector(selectLogError);
  const submitting  = useSelector(selectSubmitting);
  const submitError = useSelector(selectSubmitError);
  const submitMessage = useSelector(selectSubmitMessage);

  const getMyJobTimesheet = useCallback(
    (jobId, weekNumber = 1) => dispatch(fetchMyJobTimesheet({ jobId, weekNumber })),
    [dispatch],
  );
  const reset = useCallback(() => dispatch(clearMyJobTimesheet()), [dispatch]);

  const logHours = useCallback(
    (jobId, date, checkIn, checkOut) =>
      dispatch(logTimesheetHours({ jobId, date, checkIn, checkOut })).unwrap(),
    [dispatch],
  );

  const submitWeekTimesheet = useCallback(
    (timesheetId) => dispatch(submitTimesheet(timesheetId)).unwrap(),
    [dispatch],
  );

  return {
    timesheet: timesheets[0] ?? null,
    loading,
    error,
    getMyJobTimesheet,
    reset,
    logHours,
    logging,
    logError,
    submitWeekTimesheet,
    submitting,
    submitError,
    submitMessage,
  };
};

export default useSubcontractorTimesheet;
