import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ChevronDown } from 'lucide-react-native';
import { Text, ImagePickerField } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { buildCompanyProfileFormData } from '~utils/buildFormData';
import useAlert from '~hooks/useAlert';
import useSettingsForm from '~hooks/useSettingsForm';

const seedForm = (profile) => ({
  name:     profile.companyName        ?? '',
  regNum:   profile.registrationNumber ?? '',
  vatNum:   profile.vatNumber          ?? '',
  industry: profile.industryType       ?? '',
  about:    profile.aboutUs            ?? '',
  logo:     profile.profileImage ? { uri: profile.profileImage, isNew: false } : null,
});

const INDUSTRY_OPTIONS = [
  { label: 'Construction',          value: 'construction' },
  { label: 'Facilities Management', value: 'facilities_management' },
  { label: 'Recruitment',           value: 'recruitment' },
];

const FormLabel = ({ text, required }) => (
  <View style={styles.labelRow}>
    <Text style={styles.labelText}>{text}</Text>
    {required && <Text style={styles.requiredMark}>*</Text>}
  </View>
);

const Input = ({ placeholder, val, onChange, multiline }) => (
  <RNTextInput
    placeholder={placeholder}
    placeholderTextColor="#94A3B8"
    value={val}
    onChangeText={onChange}
    multiline={multiline}
    style={[styles.input, multiline && styles.inputMultiline]}
  />
);

const IndustryDropdown = ({ value, onSelect }) => {
  const [open, setOpen] = useState(false);

  const selectedOption = INDUSTRY_OPTIONS.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : 'Select industry type';

  const handleSelect = useCallback(
    (opt) => {
      onSelect(opt.value);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.dropdownTriggerText,
            !selectedOption && styles.dropdownPlaceholder,
          ]}>
          {displayLabel}
        </Text>
        <ChevronDown size={RFValue(14)} color="#64748B" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <View style={styles.dropdownList}>
            <FlatList
              data={INDUSTRY_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    item.value === value && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      item.value === value && styles.dropdownItemTextActive,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const BusinessDetailsTab = ({ profile, updateCompanyProfile, updatingProfile }) => {
  const { showAlert } = useAlert();
  const { values: form, setValue: setItem, dirty } = useSettingsForm(profile, seedForm);

  // null means the user chose "Remove Photo"; a file means they picked a new one.
  const handleLogoChange = useCallback(
    (file) => setItem('logo', file ? { ...file, isNew: true } : null),
    [setItem],
  );

  // Only a removal if there was something on the server to remove — clearing a
  // logo the company never had should not send a remove instruction.
  const removingLogo = !form.logo && !!profile.profileImage;

  const handleSave = useCallback(async () => {
    try {
      const formData = buildCompanyProfileFormData({
        companyName:        form.name,
        registrationNumber: form.regNum,
        vatNumber:          form.vatNum,
        industryType:       form.industry,
        aboutUs:            form.about,
        profileImage:       form.logo,
        removeProfileImage: removingLogo,
      });
      await updateCompanyProfile(formData);
      showAlert({ title: 'Success', message: 'Business details updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? 'Update failed.', type: 'error' });
    }
  }, [form, updateCompanyProfile, removingLogo]);

  const saveDisabled = updatingProfile || !dirty;

  return (
    <View style={styles.container}>

      {/* Logo */}
      <ImagePickerField
        value={form.logo}
        onChange={handleLogoChange}
        size={RFValue(72)}
        shape="square"
        hint="Tap to update your company logo. JPG, PNG or WEBP up to 5MB."
        disabled={updatingProfile}
      />

      <FormLabel text="Company Name" required />
      <Input placeholder="Enter company name" val={form.name} onChange={(v) => setItem('name', v)} />

      <FormLabel text="Registration Number" required />
      <Input placeholder="Enter registration number" val={form.regNum} onChange={(v) => setItem('regNum', v)} />

      <FormLabel text="VAT Number" />
      <Input placeholder="Enter VAT number" val={form.vatNum} onChange={(v) => setItem('vatNum', v)} />

      <FormLabel text="Industry Type" required />
      <IndustryDropdown value={form.industry} onSelect={(v) => setItem('industry', v)} />

      <View style={{ marginTop: 20 }}>
        <FormLabel text="About Us" />
        <Input placeholder="Describe your company" val={form.about} onChange={(v) => setItem('about', v)} multiline />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saveDisabled}
        activeOpacity={0.8}>
        {updatingProfile ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  labelText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  requiredMark: {
    color: '#EF4444',
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    color: '#334155',
    marginBottom: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Dropdown
  dropdownWrapper: {
    marginBottom: 16,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownTriggerText: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    color: '#334155',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    maxHeight: 320,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#F0F6FF',
  },
  dropdownItemText: {
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    color: '#334155',
  },
  dropdownItemTextActive: {
    fontFamily: FontFamily.bold,
    color: '#10375C',
  },
  // Save button
  saveButton: {
    backgroundColor: '#F2A154',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
});

export default BusinessDetailsTab;
