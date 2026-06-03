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

  const fileFields = {};

  if (profileImage?.isNew === true) {
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
