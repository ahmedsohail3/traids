import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJobTimesheets,
  clearJobTimesheets,
  approveTimesheet as approveTimesheetAction,
} from '~redux/reducers/companyTimesheetSlice';

// Stable references so selectors never return a new object when the slice is absent.
const EMPTY_ARRAY = [];

const selectJobTimesheets      = (s) => s.companyTimesheet?.jobTimesheets      ?? EMPTY_ARRAY;
const selectLoading            = (s) => s.companyTimesheet?.loading            ?? false;
const selectError              = (s) => s.companyTimesheet?.error              ?? null;
const selectApprovingTimesheet = (s) => s.companyTimesheet?.approvingTimesheet ?? false;
const selectApproveError       = (s) => s.companyTimesheet?.approveError       ?? null;

const useCompanyTimesheet = () => {
  const dispatch = useDispatch();

  const jobTimesheets      = useSelector(selectJobTimesheets);
  const loading            = useSelector(selectLoading);
  const error              = useSelector(selectError);
  const approvingTimesheet = useSelector(selectApprovingTimesheet);
  const approveError       = useSelector(selectApproveError);

  const getJobTimesheets = useCallback((jobId) => dispatch(fetchJobTimesheets(jobId)),         [dispatch]);
  const reset            = useCallback(() => dispatch(clearJobTimesheets()),                   [dispatch]);
  const approveTimesheet = useCallback((id) => dispatch(approveTimesheetAction(id)).unwrap(),  [dispatch]);

  return { jobTimesheets, loading, error, approvingTimesheet, approveError, getJobTimesheets, reset, approveTimesheet };
};

export default useCompanyTimesheet;
