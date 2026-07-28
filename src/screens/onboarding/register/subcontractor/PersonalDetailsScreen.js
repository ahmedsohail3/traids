import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, SelectDropdown } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useSubcontractorSignup from '~hooks/useSubcontractorSignup';
import useScrollToFieldError from '~hooks/useScrollToFieldError';

const TRADE_OPTIONS = [
  { label: 'Electrician', value: 'electrician' },
  { label: 'Plumber',     value: 'plumber' },
  { label: 'Carpenter',   value: 'carpenter' },
  { label: 'Masonry',     value: 'masonry' },
];

const PersonalDetailsScreen = ({ navigation }) => {
  const {
    formData,
    errors,
    updateField,
    clearError,
    validateStep,
    validatingEmail,
    validateEmail,
  } = useSubcontractorSignup();

  // Server-validated field — scroll it back into view when it comes back rejected
  const { scrollRef, onContentLayout, registerField } = useScrollToFieldError(errors, ['email']);

  const handleContinue = useCallback(async () => {
    if (!validateStep(1)) return;
    // Server check for an already-registered email — no-ops if this email passed before
    if (!(await validateEmail())) return;
    navigation.navigate('SubQualification');
  }, [validateStep, validateEmail, navigation]);

  return (
    <RegisterContainer
      title="Subcontractor Registration"
      onBack={() => navigation.goBack()}
      currentStep={1}
      totalSteps={4}
      scrollRef={scrollRef}
      onContentLayout={onContentLayout}>

      <Text variant="sectionTitle" style={styles.heading}>
        Personal Details
      </Text>

      <TextInput
        label="Full Name *"
        value={formData.fullName}
        onChangeText={(v) => { updateField('fullName', v); clearError('fullName'); }}
        placeholder="Your Name"
        autoCapitalize="words"
        error={errors.fullName}
      />

      <View {...registerField('email')}>
        <TextInput
          label="Email *"
          value={formData.email}
          onChangeText={(v) => { updateField('email', v); clearError('email'); }}
          placeholder="Your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
      </View>

      <TextInput
        label="Enter Password *"
        value={formData.password}
        onChangeText={(v) => { updateField('password', v); clearError('password'); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.password}
      />

      <TextInput
        label="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={(v) => { updateField('confirmPassword', v); clearError('confirmPassword'); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <SelectDropdown
        label="Primary Trade *"
        options={TRADE_OPTIONS}
        value={formData.primaryTrade}
        onSelect={(v) => { updateField('primaryTrade', v); clearError('primaryTrade'); }}
        placeholder="Select an option"
        error={errors.primaryTrade}
      />

      <TextInput
        label="Years Experience"
        value={formData.yearsOfExperience}
        onChangeText={(v) => updateField('yearsOfExperience', v)}
        placeholder="e.g. 5"
        keyboardType="number-pad"
      />

      <TextInput
        label="Hourly Rate (£) *"
        value={formData.hourlyRate}
        onChangeText={(v) => { updateField('hourlyRate', v.replace(/[^0-9.]/g, '')); clearError('hourlyRate'); }}
        placeholder="£12"
        keyboardType="decimal-pad"
        error={errors.hourlyRate}
      />

      <TextInput
        label="Postcode / Location *"
        value={formData.postcode}
        onChangeText={(v) => { updateField('postcode', v); clearError('postcode'); }}
        placeholder="SW1A 1AA"
        autoCapitalize="characters"
        error={errors.postcode}
      />

      <TextInput
        label="City / Location *"
        value={formData.cityLocation}
        onChangeText={(v) => { updateField('cityLocation', v); clearError('cityLocation'); }}
        placeholder="London"
        autoCapitalize="words"
        error={errors.cityLocation}
      />

      <View style={styles.actionRow}>
        <Button
          title="Cancel"
          variant="outline"
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        />
        <Button
          title="Save & Continue"
          style={styles.continueBtn}
          onPress={handleContinue}
          loading={validatingEmail}
        />
      </View>
    </RegisterContainer>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontFamily: FontFamily.bold,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn:    { flex: 1 },
  continueBtn:  { flex: 2 },
});

export default PersonalDetailsScreen;
