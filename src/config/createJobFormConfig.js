// Centralised form configuration and validation for the Create/Post Job flow.
// Used by PostJobScreen and reusable for a future Edit Job flow.
// Dates are stored as ISO 8601 strings "YYYY-MM-DD" throughout.

import dayjs from 'dayjs';

export const INITIAL_JOB_FORM = {
  jobTitle:          '',
  trade:             '',
  description:       '',
  siteAddress:       '',
  timelineStartDate: '',  // YYYY-MM-DD
  timelineEndDate:   '',  // YYYY-MM-DD
  hourlyRate:        '',
  workersRequired:   '',
  documents:         [],  // [{ uri, type, name }]
};

// Formats a stored YYYY-MM-DD value for display (e.g. "Jun 3, 2026").
export const formatDateForDisplay = (iso) =>
  iso ? dayjs(iso).format('MMM D, YYYY') : '';

export const validateJobForm = (values) => {
  const errors = {};

  if (!values.jobTitle?.trim())
    errors.jobTitle = 'Job title is required';

  if (!values.trade)
    errors.trade = 'Please select a trade';

  if (!values.description?.trim())
    errors.description = 'Description is required';

  if (!values.siteAddress?.trim())
    errors.siteAddress = 'Site address is required';

  if (!values.timelineStartDate) {
    errors.timelineStartDate = 'Start date is required';
  }

  if (!values.timelineEndDate) {
    errors.timelineEndDate = 'End date is required';
  } else if (values.timelineStartDate) {
    const start = dayjs(values.timelineStartDate);
    const end   = dayjs(values.timelineEndDate);
    if (end.isBefore(start)) {
      errors.timelineEndDate = 'End date must be on or after start date';
    }
  }

  const rate = Number(values.hourlyRate);
  if (!String(values.hourlyRate).trim()) {
    errors.hourlyRate = 'Hourly rate is required';
  } else if (isNaN(rate) || rate <= 0) {
    errors.hourlyRate = 'Hourly rate must be greater than 0';
  }

  const workers = Number(values.workersRequired);
  if (!String(values.workersRequired).trim()) {
    errors.workersRequired = 'Workers required is required';
  } else if (!Number.isInteger(workers) || workers < 1) {
    errors.workersRequired = 'Must be a whole number greater than 0';
  }

  return errors;
};
