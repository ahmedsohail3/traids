import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { buildCompanyProfileFormData } from '~utils/buildFormData';
import useAlert from '~hooks/useAlert';
import useSettingsForm from '~hooks/useSettingsForm';

const seedForm = (profile) => ({
  name:    profile.primaryContactName ?? '',
  email:   profile.workEmail          ?? '',
  phone:   profile.phoneNumber        ?? '',
  address: profile.headOfficeAddress  ?? '',
});

const FormLabel = ({ text, required }) => (
  <View style={styles.labelRow}>
    <Text style={styles.labelText}>{text}</Text>
    {required && <Text style={styles.requiredMark}>*</Text>}
  </View>
);

const Input = ({ placeholder, val, onChange }) => (
  <RNTextInput
    placeholder={placeholder}
    placeholderTextColor="#94A3B8"
    value={val}
    onChangeText={onChange}
    style={styles.input}
  />
);

const ContactInfoTab = ({ profile, updateCompanyProfile, updatingProfile }) => {
  const { showAlert } = useAlert();
  const { values: form, setValue: setItem, dirty } = useSettingsForm(profile, seedForm);

  const handleSave = useCallback(async () => {
    try {
      const formData = buildCompanyProfileFormData({
        primaryContactName: form.name,
        workEmail: form.email,
        phoneNumber: form.phone,
        headOfficeAddress: form.address,
      });
      await updateCompanyProfile(formData);
      showAlert({ title: 'Success', message: 'Contact information updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? 'Update failed.', type: 'error' });
    }
  }, [form, updateCompanyProfile]);

  const saveDisabled = updatingProfile || !dirty;

  return (
    <View style={styles.container}>
      <FormLabel text="Primary Contact Name" />
      <Input val={form.name} onChange={(v) => setItem('name', v)} />

      <FormLabel text="Work Email" />
      <Input val={form.email} onChange={(v) => setItem('email', v)} />

      <FormLabel text="Phone Number" />
      <Input val={form.phone} onChange={(v) => setItem('phone', v)} />

      <FormLabel text="Head Office Address" />
      <Input val={form.address} onChange={(v) => setItem('address', v)} />

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
  container: { marginTop: 10 },
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
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#F2A154',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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

export default ContactInfoTab;
