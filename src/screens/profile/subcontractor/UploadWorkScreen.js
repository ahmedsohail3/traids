/**
 * UploadWorkScreen — the "Upload New Work" form.
 *
 * Four sections, matching the design: project information, specifications and
 * costs, photos, and the long-form description. It can be submitted for review
 * or saved as a draft; a draft only needs a title, so a half-written project is
 * never lost to validation.
 */
import { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, ScrollView } from '~components/Common';
import Header from '~components/Header';
import {
  FormTextField,
  FormPickerField,
} from '~components/Profile/FormField';
import OptionSheet from '~components/Profile/OptionSheet';
import UploadDropzone from '~components/Profile/UploadDropzone';
import UploadedFileRow from '~components/Profile/UploadedFileRow';
import DateModal from '~components/Job/DateModal';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { pickImagesFromLibrary, DOCUMENT_IMAGE_OPTIONS } from '~utils/filePicker';
import { buildPortfolioFormData } from '~utils/buildFormData';
import useSubcontractorPortfolio from '~hooks/useSubcontractorPortfolio';
import useAlert from '~hooks/useAlert';

const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const SPECIALTY_OPTIONS = [
  { label: 'Electrical Installations', value: 'electrician' },
  { label: 'Plumbing & Heating',       value: 'plumber' },
  { label: 'Carpentry & Joinery',      value: 'carpenter' },
  { label: 'Masonry & Groundworks',    value: 'masonry' },
];

const WORK_TYPE_OPTIONS = [
  { label: 'Commercial Build',   value: 'commercial' },
  { label: 'Residential Build',  value: 'residential' },
  { label: 'Industrial',         value: 'industrial' },
  { label: 'Refurbishment',      value: 'refurbishment' },
  { label: 'Maintenance',        value: 'maintenance' },
];

const labelFor = (options, value) =>
  options.find((o) => o.value === value)?.label ?? '';

// The design shows the completion date as DD/MM/YYYY; DateModal reports
// YYYY-MM-DD, which is also what the API should receive, so only the display
// is reordered.
const displayDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

/**
 * A draft is a work-in-progress, so only the title is required for one; a
 * submission is going in front of hiring companies and has to be complete.
 * Pure, so handleSave can memoise on the values it reads rather than on a
 * closure rebuilt every render.
 */
const validate = (form, photos, status) => {
  const e = {};
  if (!form.title.trim()) e.title = 'Give this project a title.';

  if (status === 'submitted') {
    if (!form.specialty) e.specialty = 'Choose a specialty category.';
    if (!form.workType) e.workType = 'Choose a work type.';
    if (!form.overview.trim()) e.overview = 'Add a short summary of the work.';
    if (!form.clientName.trim()) e.clientName = 'Who was this work for?';
    if (!form.completionDate) e.completionDate = 'When was this completed?';
    if (photos.length === 0) e.photos = 'Add at least one project photo.';
  }
  return e;
};

const EMPTY_FORM = {
  title: '',
  specialty: '',
  workType: '',
  overview: '',
  clientName: '',
  location: '',
  duration: '',
  costRange: '',
  completionDate: '',
  description: '',
};

const UploadWorkScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const { addPortfolioItem, creating } = useSubcontractorPortfolio();

  const [form, setForm] = useState(EMPTY_FORM);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [sheet, setSheet] = useState(null); // 'specialty' | 'workType' | null
  const [dateOpen, setDateOpen] = useState(false);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
  }, []);

  // ── Photos ─────────────────────────────────────────────────────────────────

  const handleAddPhotos = useCallback(async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      showAlert({
        title: 'Photo Limit Reached',
        message: `You can attach up to ${MAX_PHOTOS} photos to one project.`,
        type: 'warning',
      });
      return;
    }

    try {
      const picked = await pickImagesFromLibrary({
        ...DOCUMENT_IMAGE_OPTIONS,
        selectionLimit: remaining,
      });
      if (picked.length === 0) return;

      // A known size over the cap is rejected; an unknown size is let through
      // rather than blocking the user on a detail the picker did not report.
      const tooBig = picked.filter((p) => p.size != null && p.size > MAX_PHOTO_BYTES);
      const accepted = picked.filter((p) => !tooBig.includes(p));

      if (accepted.length > 0) setPhotos((prev) => [...prev, ...accepted]);

      if (tooBig.length > 0) {
        showAlert({
          title: 'Some Photos Skipped',
          message: `${tooBig.length} ${tooBig.length === 1 ? 'photo is' : 'photos are'} larger than 5MB and ${tooBig.length === 1 ? 'was' : 'were'} not added.`,
          type: 'warning',
        });
      }
    } catch (err) {
      showAlert({
        title: 'Could Not Open Gallery',
        message: err?.message ?? 'Please try again.',
        type: 'error',
      });
    }
  }, [photos.length, showAlert]);

  const removePhoto = useCallback((index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (status) => {
      if (creating) return;

      const found = validate(form, photos, status);
      setErrors(found);
      if (Object.keys(found).length > 0) {
        showAlert({
          title: 'Check Your Details',
          message: 'Some required fields still need filling in.',
          type: 'warning',
        });
        return;
      }

      try {
        await addPortfolioItem(buildPortfolioFormData({ ...form, status, photos }));
        showAlert({
          title: status === 'draft' ? 'Draft Saved' : 'Submitted for Review',
          message:
            status === 'draft'
              ? 'You can finish this project later from your profile.'
              : 'Your project has been sent for review and will appear on your profile once approved.',
          type: 'success',
        });
        navigation.goBack();
      } catch (err) {
        showAlert({
          title: 'Upload Failed',
          message:
            typeof err === 'string'
              ? err
              : 'Your project could not be uploaded. Please try again.',
          type: 'error',
        });
      }
    },
    [creating, form, photos, addPortfolioItem, showAlert, navigation],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Upload New Work"
        subtitle="Showcase recent projects to attract top hiring clients."
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {/* Project information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Information</Text>

            <FormTextField
              label="Project Title"
              placeholder="e.g. Commercial Office Rewiring & Modernization"
              value={form.title}
              onChangeText={(v) => setField('title', v)}
              error={errors.title}
            />
            <FormPickerField
              label="Specialty Category"
              placeholder="Select a specialty"
              value={labelFor(SPECIALTY_OPTIONS, form.specialty)}
              onPress={() => setSheet('specialty')}
              error={errors.specialty}
            />
            <FormPickerField
              label="Work Type"
              placeholder="Select a work type"
              value={labelFor(WORK_TYPE_OPTIONS, form.workType)}
              onPress={() => setSheet('workType')}
              error={errors.workType}
            />
            <FormTextField
              label="Brief Overview"
              placeholder="Provide a 1-2 sentence quick summary of what was completed..."
              value={form.overview}
              onChangeText={(v) => setField('overview', v)}
              multiline
              maxLength={220}
              error={errors.overview}
            />
          </View>

          <View style={styles.divider} />

          {/* Specifications & costs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications &amp; Costs</Text>

            <FormTextField
              label="Client / Company Name"
              placeholder="e.g. Apex Workspace Solutions"
              value={form.clientName}
              onChangeText={(v) => setField('clientName', v)}
              error={errors.clientName}
            />
            <FormTextField
              label="Project Location"
              placeholder="e.g. Manchester, UK"
              value={form.location}
              onChangeText={(v) => setField('location', v)}
            />
            <FormTextField
              label="Duration (Days/Weeks)"
              placeholder="e.g. 3 Weeks"
              value={form.duration}
              onChangeText={(v) => setField('duration', v)}
            />
            <FormTextField
              label="Cost Range (£)"
              placeholder="e.g. £12,000 - £15,000"
              value={form.costRange}
              onChangeText={(v) => setField('costRange', v)}
            />
            <FormPickerField
              label="Completion Date"
              placeholder="Select a date"
              value={displayDate(form.completionDate)}
              onPress={() => setDateOpen(true)}
              error={errors.completionDate}
            />
          </View>

          <View style={styles.divider} />

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Photos &amp; Media</Text>

            <UploadDropzone
              disabled={photos.length >= MAX_PHOTOS}
              onPress={handleAddPhotos}
            />
            {!!errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}

            {photos.length > 0 && (
              <View style={styles.previewList}>
                <Text style={styles.previewHeading}>
                  Uploaded Previews ({photos.length} {photos.length === 1 ? 'file' : 'files'})
                </Text>
                {photos.map((photo, i) => (
                  <UploadedFileRow
                    key={`${photo.uri}-${i}`}
                    uri={photo.uri}
                    name={photo.name}
                    size={photo.size}
                    onRemove={() => removePhoto(i)}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Detailed description */}
          <View style={styles.section}>
            <FormTextField
              label="Detailed Project Description"
              placeholder="Describe the challenges faced, the safety procedures followed, materials used, and specific techniques applied to make this project successful..."
              value={form.description}
              onChangeText={(v) => setField('description', v)}
              multiline
              minHeight={RFValue(90)}
              maxLength={1500}
            />
          </View>

          <View style={styles.divider} />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.submitBtn, creating && styles.btnBusy]}
              activeOpacity={0.85}
              disabled={creating}
              onPress={() => handleSave('submitted')}>
              {creating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Submit for Review</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.draftBtn, creating && styles.btnBusy]}
              activeOpacity={0.85}
              disabled={creating}
              onPress={() => handleSave('draft')}>
              <Text style={styles.draftText}>Save as Draft</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <OptionSheet
        visible={sheet === 'specialty'}
        title="Specialty Category"
        options={SPECIALTY_OPTIONS}
        value={form.specialty}
        onSelect={(v) => setField('specialty', v)}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'workType'}
        title="Work Type"
        options={WORK_TYPE_OPTIONS}
        value={form.workType}
        onSelect={(v) => setField('workType', v)}
        onClose={() => setSheet(null)}
      />
      <DateModal
        visible={dateOpen}
        title="Completion Date"
        value={form.completionDate}
        onConfirm={(iso) => setField('completionDate', iso)}
        onClose={() => setDateOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 140 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: RFValue(15),
    gap: RFValue(18),
  },
  section: { gap: RFValue(14) },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
  },
  divider: { height: 1, backgroundColor: '#EFEFEF' },

  previewList: { gap: RFValue(10) },
  previewHeading: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#545454',
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#EF4444',
  },

  actions: { gap: RFValue(10) },
  submitBtn: {
    height: RFValue(42),
    borderRadius: 8,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(13),
    color: '#FFFFFF',
  },
  draftBtn: {
    height: RFValue(42),
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(13),
    color: '#10375C',
  },
  btnBusy: { opacity: 0.7 },
});

export default UploadWorkScreen;
