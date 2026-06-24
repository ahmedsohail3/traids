// Centralised form configuration and validation for the "Send Offer" flow.
// Used by SendOfferScreen when the company creates a new job inline while
// sending an offer to a subcontractor. Dates are stored as ISO 8601 "YYYY-MM-DD".

import dayjs from 'dayjs';

export const INITIAL_OFFER_FORM = {
  jobTitle:          '',
  trade:             '',
  description:       '',
  siteAddress:       '',
  timelineStartDate: '',  // YYYY-MM-DD
  timelineEndDate:   '',  // YYYY-MM-DD
  hourlyRate:        '',
  documents:         [],  // [{ uri, type, name }]
};

export const validateOfferForm = (values) => {
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

  return errors;
};
