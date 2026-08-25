import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, ImagePickerField } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import TradeDropdown from '~components/Job/TradeDropdown';
import { buildSubcontractorProfileFormData } from '~utils/buildFormData';
import useAlert from '~hooks/useAlert';
import useSettingsForm from '~hooks/useSettingsForm';

const seedForm = (profile) => ({
  fullName:        profile.fullName        ?? '',
  primaryTrade:    profile.primaryTrade    ?? '',
  hourlyRate:      profile.hourlyRate != null ? String(profile.hourlyRate) : '',
  professionalBio: profile.professionalBio ?? '',
  avatar:          profile.profileImage ? { uri: profile.profileImage, isNew: false } : null,
});

// ── Shared sub-components (mirrors BusinessDetailsTab style) ───────────────────

const FormLabel = ({ text, required }) => (
  <View style={styles.labelRow}>
    <Text style={styles.labelText}>{text}</Text>
    {required && <Text style={styles.requiredMark}>*</Text>}
  </View>
);

const Input = ({ placeholder, val, onChange, multiline, keyboardType, error }) => (
  <>
    <RNTextInput
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      value={val}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboardType}
      style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </>
);

// ── Tab ────────────────────────────────────────────────────────────────────────

const ProfileDetailsTab = ({ profile, updateProfile, updatingProfile }) => {
  const { showAlert } = useAlert();

  const { values: form, setValue, dirty } = useSettingsForm(profile, seedForm);
  const [errors, setErrors] = useState({});

  const setItem = (k, v) => {
    setValue(k, v);
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  // null means the user chose "Remove Photo"; a file means they picked a new one.
  const handleAvatarChange = useCallback(
    (file) => setValue('avatar', file ? { ...file, isNew: true } : null),
    [setValue],
  );

  // Only a removal if there was something on the server to remove — clearing an
  // avatar the user never had should not send a remove instruction.
  const removingAvatar = !form.avatar && !!profile.profileImage;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())     e.fullName     = 'Full name is required';
    if (!form.primaryTrade.trim()) e.primaryTrade = 'Trade type is required';
    if (!form.hourlyRate.trim())   e.hourlyRate   = 'Hourly rate is required';
    else if (isNaN(Number(form.hourlyRate))) e.hourlyRate = 'Enter a valid number';
    return e;
  };

  const handleSave = useCallback(async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    try {
      const formData = buildSubcontractorProfileFormData({
        fullName:        form.fullName,
        primaryTrade:    form.primaryTrade,
        hourlyRate:      form.hourlyRate,
        professionalBio: form.professionalBio,
        profileImage:    form.avatar,
        removeProfileImage: removingAvatar,
      });
      await updateProfile(formData);
      showAlert({ title: 'Success', message: 'Profile details updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? err ?? 'Update failed.', type: 'error' });
    }
  }, [form, updateProfile, removingAvatar]);

  const saveDisabled = updatingProfile || !dirty;

  return (
    <View style={styles.container}>

      {/* Avatar */}
      <ImagePickerField
        value={form.avatar}
        onChange={handleAvatarChange}
        size={RFValue(72)}
        hint="Tap to update your profile photo. JPG, PNG or WEBP up to 5MB."
        disabled={updatingProfile}
      />

      <FormLabel text="Full Name" required />
      <Input
        placeholder="Enter your full name"
        val={form.fullName}
        onChange={(v) => setItem('fullName', v)}
        error={errors.fullName}
      />

      <FormLabel text="Trade Type" required />
      <TradeDropdown
        value={form.primaryTrade}
        onSelect={(v) => setItem('primaryTrade', v)}
      />
      {errors.primaryTrade ? <Text style={styles.errorText}>{errors.primaryTrade}</Text> : null}

      <FormLabel text="Hourly Rate (£)" required />
      <Input
        placeholder="Enter your hourly rate"
        val={form.hourlyRate}
        onChange={(v) => setItem('hourlyRate', v)}
        keyboardType="numeric"
        error={errors.hourlyRate}
      />

      <View style={{ marginTop: 2 }}>
        <FormLabel text="Professional Bio" />
        <Input
          placeholder="Describe your experience and skills"
          val={form.professionalBio}
          onChange={(v) => setItem('professionalBio', v)}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saveDisabled && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saveDisabled}
        activeOpacity={0.8}
      >
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
  inputError: {
    borderColor: '#EF4444',
    marginBottom: 4,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    color: '#EF4444',
    marginBottom: 12,
  },
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

export default ProfileDetailsTab;
