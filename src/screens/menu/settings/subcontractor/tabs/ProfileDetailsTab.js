import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Camera } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import TradeDropdown from '~components/Job/TradeDropdown';
import { buildSubcontractorProfileFormData } from '~utils/buildFormData';
import { pickImageFromLibrary } from '~utils/filePicker';
import useAlert from '~hooks/useAlert';

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

  const [form, setForm] = useState({
    fullName:       '',
    primaryTrade:   '',
    hourlyRate:     '',
    professionalBio: '',
  });
  const [errors, setErrors]       = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  // Seed form from fetched profile
  useEffect(() => {
    if (profile) {
      setForm({
        fullName:        profile.fullName        ?? '',
        primaryTrade:    profile.primaryTrade     ?? '',
        hourlyRate:      profile.hourlyRate != null ? String(profile.hourlyRate) : '',
        professionalBio: profile.professionalBio  ?? '',
      });
      setAvatarFile(
        profile.profileImage
          ? { uri: profile.profileImage, isNew: false }
          : null,
      );
    }
  }, [profile]);

  const setItem = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const handlePickAvatar = useCallback(async () => {
    const file = await pickImageFromLibrary();
    if (file) setAvatarFile({ ...file, isNew: true });
  }, []);

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
        profileImage:    avatarFile,
      });
      await updateProfile(formData);
      showAlert({ title: 'Success', message: 'Profile details updated.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message ?? err ?? 'Update failed.', type: 'error' });
    }
  }, [form, avatarFile, updateProfile]);

  return (
    <View style={styles.container}>

      {/* Avatar row */}
      <View style={styles.logoRow}>
        <TouchableOpacity style={styles.logoPicker} onPress={handlePickAvatar} activeOpacity={0.8}>
          {avatarFile?.uri ? (
            <Image source={{ uri: avatarFile.uri }} style={styles.logoImage} />
          ) : (
            <Camera size={RFValue(18)} color="#10375C" strokeWidth={1.5} />
          )}
          <View style={styles.logoEditBadge}>
            <Camera size={RFValue(8)} color="#FFFFFF" strokeWidth={2} />
          </View>
        </TouchableOpacity>
        <Text style={styles.logoHint}>
          Tap to update your profile photo.{'\n'}JPG, PNG, or WEBP up to 5MB.
        </Text>
      </View>

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
        style={[styles.saveButton, updatingProfile && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={updatingProfile}
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  logoPicker: {
    width: RFValue(56),
    height: RFValue(56),
    borderRadius: RFValue(28),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logoImage: {
    width: RFValue(56),
    height: RFValue(56),
    borderRadius: RFValue(28),
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: RFValue(18),
    height: RFValue(18),
    borderRadius: RFValue(9),
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  logoHint: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
    lineHeight: RFValue(14),
  },
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
    backgroundColor: '#10375C',
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
