import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, SelectDropdown } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useSubcontractorSignup from '~hooks/useSubcontractorSignup';

const TRADE_OPTIONS = [
  { label: 'Electrician', value: 'electrician' },
  { label: 'Plumber',     value: 'plumber' },
  { label: 'Carpenter',   value: 'carpenter' },
  { label: 'Masonry',     value: 'masonry' },
];

const PersonalDetailsScreen = ({ navigation }) => {
  const { formData, errors, updateField, clearError, validateStep } = useSubcontractorSignup();

  const handleContinue = useCallback(() => {
    if (!validateStep(1)) return;
    navigation.navigate('SubQualification');
  }, [validateStep, navigation]);

  return (
    <RegisterContainer
      title="Subcontractor Registration"
      onBack={() => navigation.goBack()}
      currentStep={1}
      totalSteps={4}>

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
