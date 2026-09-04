/**
 * buildFormData
 *
 * Converts plain text fields and file objects into a multipart/form-data payload.
 * Skips any value that is null, undefined, or empty string.
 *
 * @param {Record<string, string>} textFields  — key/value text pairs
 * @param {Record<string, {uri, type?, name?}|null>} fileFields — file descriptors
 * @returns {FormData}
 */
export const buildFormData = (textFields = {}, fileFields = {}) => {
  const fd = new FormData();

  for (const [key, value] of Object.entries(textFields)) {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, String(value));
    }
  }

  for (const [key, file] of Object.entries(fileFields)) {
    if (file?.uri) {
      fd.append(key, {
        uri:  file.uri,
        type: file.type ?? 'application/octet-stream',
        name: file.name ?? `${key}.pdf`,
      });
    }
  }

  return fd;
};

/**
 * buildCompanyProfileFormData
 *
 * Builds a multipart/form-data payload for updating a company profile.
 * Only appends non-null/non-empty text fields.
 * For file fields, only includes files where `file.isNew === true`.
 *
 * @param {Object} fields
 * @param {string} [fields.companyName]
 * @param {string} [fields.registrationNumber]
 * @param {string} [fields.vatNumber]
 * @param {string} [fields.industryType]
 * @param {string} [fields.aboutUs]
 * @param {string} [fields.primaryContactName]
 * @param {string} [fields.workEmail]
 * @param {string} [fields.phoneNumber]
 * @param {string} [fields.headOfficeAddress]
 * @param {string} [fields.password]
 * @param {boolean} [fields.timesheetReminders]
 * @param {{uri, type, name, isNew}|null} [fields.companyDocuments]
 * @param {{uri, type, name, isNew}|null} [fields.insuranceCertificate]
 * @param {{uri, type, name, isNew}|null} [fields.healthAndSafetyPolicy]
 * @returns {FormData}
 */
// Removal is signalled with its own flag rather than an empty `profileImage`.
// In multipart/form-data every part is either a string or a file — there is no
// null — so an empty string is indistinguishable from "unchanged" to any backend
// that guards with a truthy check (`if (req.body.profileImage)`), which is the
// common shape. An explicit flag cannot be misread either way.
const REMOVE_IMAGE_FLAG = 'removeProfileImage';

export const buildCompanyProfileFormData = (fields = {}) => {
  const {
    companyName,
    registrationNumber,
    vatNumber,
    industryType,
    aboutUs,
    primaryContactName,
    workEmail,
    phoneNumber,
    headOfficeAddress,
    password,
    timesheetReminders,
    companyDocuments,
    insuranceCertificate,
    healthAndSafetyPolicy,
    profileImage,
    removeProfileImage = false,
  } = fields;

  const textFields = {};

  if (companyName !== null && companyName !== undefined && companyName !== '') {
    textFields.companyName = companyName;
  }
  if (registrationNumber !== null && registrationNumber !== undefined && registrationNumber !== '') {
    textFields.registrationNumber = registrationNumber;
  }
  if (vatNumber !== null && vatNumber !== undefined && vatNumber !== '') {
    textFields.vatNumber = vatNumber;
  }
  if (industryType !== null && industryType !== undefined && industryType !== '') {
    textFields.industryType = industryType;
  }
  if (aboutUs !== null && aboutUs !== undefined && aboutUs !== '') {
    textFields.aboutUs = aboutUs;
  }
  if (primaryContactName !== null && primaryContactName !== undefined && primaryContactName !== '') {
    textFields.primaryContactName = primaryContactName;
  }
  if (workEmail !== null && workEmail !== undefined && workEmail !== '') {
    textFields.workEmail = workEmail;
  }
  if (phoneNumber !== null && phoneNumber !== undefined && phoneNumber !== '') {
    textFields.phoneNumber = phoneNumber;
  }
  if (headOfficeAddress !== null && headOfficeAddress !== undefined && headOfficeAddress !== '') {
    textFields.headOfficeAddress = headOfficeAddress;
  }
  if (password !== null && password !== undefined && password !== '') {
    textFields.password = password;
  }
  if (timesheetReminders !== null && timesheetReminders !== undefined) {
    textFields.timesheetReminders = String(timesheetReminders);
  }

  // Mutually exclusive: removing and uploading in one request is contradictory.
  if (removeProfileImage) {
    textFields[REMOVE_IMAGE_FLAG] = 'true';
  }

  const fileFields = {};

  if (!removeProfileImage && profileImage?.isNew === true) {
    fileFields.profileImage = profileImage;
  }
  if (companyDocuments?.isNew === true) {
    fileFields.companyDocuments = companyDocuments;
  }
  if (insuranceCertificate?.isNew === true) {
    fileFields.insuranceCertificate = insuranceCertificate;
  }
  if (healthAndSafetyPolicy?.isNew === true) {
    fileFields.healthAndSafetyPolicy = healthAndSafetyPolicy;
  }

  return buildFormData(textFields, fileFields);
};

/**
 * buildSubcontractorProfileFormData
 *
 * Builds a multipart/form-data payload for PUT /subcontractor/update-profile.
 * Only appends non-null/non-empty text fields.
 * For the profile image, only uploads when `file.isNew === true`.
 * For document arrays, only uploads entries where `doc.isNew === true`.
 *
 * @param {Object} fields
 * @param {string}  [fields.fullName]
 * @param {string}  [fields.primaryTrade]
 * @param {string|number} [fields.hourlyRate]
 * @param {string}  [fields.professionalBio]
 * @param {string}  [fields.availability]
 * @param {boolean} [fields.jobAlerts]
 * @param {boolean} [fields.timesheetReminders]
 * @param {string}  [fields.password]
 * @param {{uri, type, name, isNew}|null} [fields.profileImage]
 * @param {Array<{uri, type, name, isNew}>} [fields.insuranceDocuments]
 * @param {Array<{uri, type, name, isNew}>} [fields.ticketsDocuments]
 * @param {Array<{uri, type, name, isNew}>} [fields.certificationDocuments]
 * @returns {FormData}
 */
export const buildSubcontractorProfileFormData = (fields = {}) => {
  const {
    fullName,
    primaryTrade,
    hourlyRate,
    professionalBio,
    availability,
    jobAlerts,
    timesheetReminders,
    password,
    profileImage,
    removeProfileImage    = false,
    insuranceDocuments    = [],
    ticketsDocuments      = [],
    certificationDocuments = [],
  } = fields;

  const fd = new FormData();

  // ── Text fields ──────────────────────────────────────────────────────────────

  const textMap = { fullName, primaryTrade, professionalBio, password };
  for (const [key, value] of Object.entries(textMap)) {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, String(value));
    }
  }
  if (hourlyRate !== null && hourlyRate !== undefined && hourlyRate !== '') {
    fd.append('hourlyRate', String(hourlyRate));
  }
  // Boolean fields — must use explicit null/undefined guard so `false` is sent correctly
  if (availability      !== null && availability      !== undefined) fd.append('availability',      String(availability));
  if (jobAlerts         !== null && jobAlerts         !== undefined) fd.append('jobAlerts',         String(jobAlerts));
  if (timesheetReminders !== null && timesheetReminders !== undefined) fd.append('timesheetReminders', String(timesheetReminders));

  // ── Profile image (single) ───────────────────────────────────────────────────

  // Mutually exclusive: removing and uploading in one request is contradictory.
  if (removeProfileImage) {
    fd.append(REMOVE_IMAGE_FLAG, 'true');
  } else if (profileImage?.isNew === true && profileImage?.uri) {
    fd.append('profileImage', {
      uri:  profileImage.uri,
      type: profileImage.type ?? 'image/jpeg',
      name: profileImage.name ?? 'profileImage.jpg',
    });
  }

  // ── Document arrays — only new files ─────────────────────────────────────────

  const appendDocs = (key, docs) => {
    docs.forEach((doc) => {
      if (doc?.isNew === true && doc?.uri) {
        fd.append(key, {
          uri:  doc.uri,
          type: doc.type ?? 'application/octet-stream',
          name: doc.name ?? `${key}.pdf`,
        });
      }
    });
  };

  appendDocs('insuranceDocuments',    insuranceDocuments);
  appendDocs('ticketsDocuments',      ticketsDocuments);
  appendDocs('certificationDocuments', certificationDocuments);

  return fd;
};

// ── Date helper ───────────────────────────────────────────────────────────────
// Converts DD/MM/YYYY → YYYY-MM-DD. Returns null if format is unrecognised.
const parseDDMMYYYY = (str) => {
  if (!str) return null;
  const [dd, mm, yyyy] = str.split('/');
  if (!dd || !mm || !yyyy || yyyy.length < 4) return null;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
};

/**
 * buildSubcontractorSignupFormData
 *
 * Builds a multipart/form-data payload for POST /subcontractor/signup.
 * - Strips `confirmPassword` (validation-only).
 * - Converts expiry strings from DD/MM/YYYY to YYYY-MM-DD before sending.
 * - Bracket-notation keys (insurance[expiresAt]) are appended as string literals.
 *
 * @param {Object} fields — raw formData from subcontractorSignupSlice
 * @returns {FormData}
 */
export const buildSubcontractorSignupFormData = ({
  confirmPassword:          _,    // strip — validation only
  profileImage,
  insuranceDocuments:       __,   // file object — UI only, not sent
  insuranceDocumentUrl,
  insuranceExpiresAt,
  ticketsDocuments:         ___,  // file object — UI only, not sent
  ticketsDocumentUrl,
  ticketsExpiresAt,
  certificationDocuments:   ____, // file object — UI only, not sent
  certificationDocumentUrl,
  certificationExpiresAt,
  workExamples,
  ...textFields
}) => {
  const fd = new FormData();

  // ── Text fields ──────────────────────────────────────────────────────────────
  for (const [key, value] of Object.entries(textFields)) {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, String(value));
    }
  }

  // ── Profile image ────────────────────────────────────────────────────────────
  if (profileImage?.uri) {
    fd.append('profileImage', {
      uri:  profileImage.uri,
      type: profileImage.type ?? 'image/jpeg',
      name: profileImage.name ?? 'profileImage.jpg',
    });
  }

  // ── Insurance document URL + expiry ───────────────────────────────────────────
  if (insuranceDocumentUrl) fd.append('insuranceDocuments', insuranceDocumentUrl);
  const insuranceISO = parseDDMMYYYY(insuranceExpiresAt);
  if (insuranceISO) fd.append('insurance[expiresAt]', insuranceISO);

  // ── Tickets document URL + expiry ─────────────────────────────────────────────
  // Wire key is plural — matches `tickets[expiresAt]` below, the `tickets` group
  // the API returns, and the profile update payload.
  if (ticketsDocumentUrl) fd.append('ticketsDocuments', ticketsDocumentUrl);
  const ticketsISO = parseDDMMYYYY(ticketsExpiresAt);
  if (ticketsISO) fd.append('tickets[expiresAt]', ticketsISO);

  // ── Certification document URL + expiry ──────────────────────────────────────
  if (certificationDocumentUrl) fd.append('certificationDocuments', certificationDocumentUrl);
  const certISO = parseDDMMYYYY(certificationExpiresAt);
  if (certISO) fd.append('certification[expiresAt]', certISO);

  // ── Work examples ─────────────────────────────────────────────────────────────
  if (workExamples?.uri) {
    fd.append('workExamples', {
      uri:  workExamples.uri,
      type: workExamples.type ?? 'application/octet-stream',
      name: workExamples.name ?? 'workExamples',
    });
  }

  return fd;
};

/**
 * buildChatMessageFormData
 *
 * Builds a multipart/form-data payload for POST /chat/send.
 * Skips empty content; appends each attachment individually as 'attachments'.
 *
 * @param {Object} fields
 * @param {string} fields.conversationId
 * @param {string} [fields.content]
 * @param {Array<{uri, type, name}>} [fields.attachments]
 * @returns {FormData}
 */
export const buildChatMessageFormData = ({ conversationId, content, attachments = [] }) => {
  const fd = new FormData();

  if (conversationId) fd.append('conversationId', conversationId);
  if (content?.trim()) fd.append('content', content.trim());

  attachments.forEach((file) => {
    if (file?.uri) {
      fd.append('attachments', {
        uri:  file.uri,
        type: file.type  ?? 'application/octet-stream',
        name: file.name  ?? 'attachment',
      });
    }
  });

  return fd;
};

/**
 * buildUpdateJobFormData
 *
 * Builds a multipart/form-data payload for PATCH /jobs/:id.
 * Only appends fields that have a non-empty value.
 * Only sends newly picked documents — backend retains existing ones.
 *
 * @param {Object} fields
 * @param {string} [fields.jobTitle]
 * @param {string|number} [fields.hourlyRate]
 * @param {string} [fields.description]
 * @param {string|number} [fields.workersRequired]
 * @param {Array<{uri, type, name}>} [fields.documents]
 * @returns {FormData}
 */
export const buildUpdateJobFormData = ({
  jobTitle,
  hourlyRate,
  description,
  workersRequired,
  documents = [],
}) => {
  const fd = new FormData();

  const textFields = { jobTitle, description };
  for (const [key, value] of Object.entries(textFields)) {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, String(value));
    }
  }

  if (hourlyRate !== null && hourlyRate !== undefined && hourlyRate !== '') {
    fd.append('hourlyRate', String(hourlyRate));
  }
  if (workersRequired !== null && workersRequired !== undefined && workersRequired !== '') {
    fd.append('workersRequired', String(workersRequired));
  }

  documents.forEach((doc) => {
    if (doc?.uri) {
      fd.append('documents', {
        uri:  doc.uri,
        type: doc.type ?? 'application/octet-stream',
        name: doc.name ?? 'document',
      });
    }
  });

  return fd;
};

/**
 * buildCreateJobFormData
 *
 * Builds a multipart/form-data payload for POST /jobs.
 * Reusable for a future PUT /jobs/:id (edit) flow.
 *
 * @param {Object} fields
 * @param {string} fields.jobTitle
 * @param {string} fields.trade
 * @param {string} fields.description
 * @param {string} fields.siteAddress
 * @param {string} fields.timelineStartDate  — "YYYY-MM-DD" (ISO 8601)
 * @param {string} fields.timelineEndDate    — "YYYY-MM-DD" (ISO 8601)
 * @param {string|number} fields.hourlyRate
 * @param {string|number} fields.workersRequired
 * @param {Array<{uri, type, name}>} [fields.documents]
 * @returns {FormData}
 */
export const buildCreateJobFormData = ({
  jobTitle,
  trade,
  description,
  siteAddress,
  timelineStartDate,
  timelineEndDate,
  hourlyRate,
  workersRequired,
  documents = [],
}) => {
  const fd = new FormData();

  const textFields = {
    jobTitle,
    trade,
    description,
    siteAddress,
    timelineStartDate,
    timelineEndDate,
  };

  for (const [key, value] of Object.entries(textFields)) {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, String(value));
    }
  }

  if (hourlyRate !== null && hourlyRate !== undefined && hourlyRate !== '') {
    fd.append('hourlyRate', String(hourlyRate));
  }

  if (workersRequired !== null && workersRequired !== undefined && workersRequired !== '') {
    fd.append('workersRequired', String(workersRequired));
  }

  documents.forEach((doc) => {
    if (doc?.uri) {
      fd.append('documents', {
        uri:  doc.uri,
        type: doc.type ?? 'application/octet-stream',
        name: doc.name ?? 'document',
      });
    }
  });

  return fd;
};

/**
 * buildSendOfferFormData
 *
 * Builds a multipart/form-data payload for POST /offers.
 * Used by the company's "Send Offer" flow — either for a brand-new job
 * (fields entered manually) or an existing job (fields pre-filled from it).
 *
 * @param {Object} fields
 * @param {string} fields.subcontractorId
 * @param {string} fields.jobTitle
 * @param {string} fields.trade
 * @param {string} [fields.description]
 * @param {string} [fields.siteAddress]
 * @param {string} [fields.timelineStartDate] — "YYYY-MM-DD"
 * @param {string} [fields.timelineEndDate]   — "YYYY-MM-DD"
 * @param {string|number} fields.hourlyRate
 * @param {Array<{uri, type, name}>} [fields.documents]
 * @returns {FormData}
 */
export const buildSendOfferFormData = ({
  subcontractorId,
  jobTitle,
  trade,
  description,
  siteAddress,
  timelineStartDate,
  timelineEndDate,
  hourlyRate,
  documents = [],
}) => {
  const fd = new FormData();

  if (subcontractorId) fd.append('subcontractorId', subcontractorId);

  const textFields = { jobTitle, trade, description, siteAddress, timelineStartDate, timelineEndDate };
  for (const [key, value] of Object.entries(textFields)) {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, String(value));
    }
  }

  if (hourlyRate !== null && hourlyRate !== undefined && hourlyRate !== '') {
    fd.append('hourlyRate', String(hourlyRate));
  }

  documents.forEach((doc) => {
    if (doc?.uri) {
      fd.append('documents', {
        uri:  doc.uri,
        type: doc.type ?? 'application/octet-stream',
        name: doc.name ?? 'document',
      });
    }
  });

  return fd;
};

/**
 * buildFirstMessageFormData
 *
 * Builds a multipart/form-data payload for POST /chat/send-first.
 * Only company users call this endpoint — subcontractorId identifies the recipient.
 *
 * @param {Object} fields
 * @param {string} fields.subcontractorId
 * @param {string} [fields.content]
 * @param {Array<{uri, type, name}>} [fields.attachments]
 * @returns {FormData}
 */
export const buildFirstMessageFormData = ({ subcontractorId, companyId, content, attachments = [] }) => {
  const fd = new FormData();

  if (companyId)       fd.append('companyId',       companyId);
  if (subcontractorId) fd.append('subcontractorId', subcontractorId);
  if (content?.trim()) fd.append('content',         content.trim());

  attachments.forEach((file) => {
    if (file?.uri) {
      fd.append('attachments', {
        uri:  file.uri,
        type: file.type ?? 'application/octet-stream',
        name: file.name ?? 'attachment',
      });
    }
  });

  return fd;
};

/**
 * buildJobApplicationFormData
 *
 * Builds a multipart/form-data payload for POST /job-applications.
 * Reusable for future PUT /job-applications/:id (update) flow.
 *
 * @param {Object} fields
 * @param {string} fields.jobId
 * @param {string} fields.fullName
 * @param {string|number} fields.proposedDailyRate
 * @param {string} fields.message
 * @param {Array<{uri, type, name}>} [fields.documents]
 * @returns {FormData}
 */
export const buildJobApplicationFormData = ({
  jobId,
  fullName,
  proposedDailyRate,
  message,
  documents = [],
}) => {
  const fd = new FormData();

  if (jobId)                fd.append('jobId',            String(jobId));
  if (fullName?.trim())     fd.append('fullName',         fullName.trim());
  if (message?.trim())      fd.append('message',          message.trim());
  if (proposedDailyRate !== null && proposedDailyRate !== undefined && proposedDailyRate !== '') {
    fd.append('proposedDailyRate', String(proposedDailyRate));
  }

  documents.forEach((doc) => {
    if (doc?.uri) {
      fd.append('documents', {
        uri:  doc.uri,
        type: doc.type ?? 'application/octet-stream',
        name: doc.name ?? 'document',
      });
    }
  });

  return fd;
};

// ─── Subcontractor portfolio ──────────────────────────────────────────────────

/**
 * buildPortfolioFormData
 *
 * Multipart body for POST /subcontractor/portfolio — one showcased project.
 * Photos ride along with the text fields, the same shape the profile and
 * document updates already use.
 *
 * Empty strings are omitted rather than sent, so a half-filled draft does not
 * overwrite server-side values with blanks.
 *
 * @param {object}  fields
 * @param {string}  [fields.title]
 * @param {string}  [fields.specialty]       trade slug, e.g. 'electrician'
 * @param {string}  [fields.workType]
 * @param {string}  [fields.overview]        1–2 sentence summary
 * @param {string}  [fields.description]     long-form description
 * @param {string}  [fields.clientName]
 * @param {string}  [fields.location]
 * @param {string}  [fields.duration]
 * @param {string}  [fields.costRange]
 * @param {string}  [fields.completionDate]  YYYY-MM-DD
 * @param {'submitted'|'draft'} [fields.status]
 * @param {Array<{uri, type, name}>} [fields.photos]
 * @returns {FormData}
 */
export const buildPortfolioFormData = (fields = {}) => {
  const { photos = [], ...text } = fields;
  const fd = new FormData();

  for (const [key, value] of Object.entries(text)) {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      fd.append(key, String(value).trim());
    }
  }

  photos.forEach((photo) => {
    if (photo?.uri) {
      fd.append('photos', {
        uri:  photo.uri,
        type: photo.type ?? 'image/jpeg',
        name: photo.name ?? `photo_${Date.now()}.jpg`,
      });
    }
  });

  return fd;
};
