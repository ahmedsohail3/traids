import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, SelectDropdown } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useCompanySignup from '~hooks/useCompanySignup';

const INDUSTRY_OPTIONS = [
  { label: 'Construction',          value: 'construction' },
  { label: 'Facilities Management', value: 'facilities_management' },
  { label: 'Recruitment',           value: 'recruitment' },
];

const BusinessDetailsScreen = ({ navigation }) => {
  const { formData, errors, updateField, clearError, validateStep } = useCompanySignup();

  const handleContinue = useCallback(() => {
    if (!validateStep(1)) return;
    navigation.navigate('CardDetails');
  }, [validateStep, navigation]);

  return (
    <RegisterContainer
      onBack={() => navigation.goBack()}
      currentStep={1}
      totalSteps={4}>

      <Text
        variant="sectionTitle"
        style={{ fontFamily: FontFamily.bold, marginBottom: 20 }}>
        Business Details
      </Text>

      <TextInput
        label="Company Name"
        value={formData.companyName}
        onChangeText={v => { updateField('companyName', v); clearError('companyName'); }}
        placeholder="Acme Construction Ltd"
        autoCapitalize="words"
        error={errors.companyName}
      />

      <TextInput
        label="Registration Number *"
        value={formData.registrationNumber}
        onChangeText={v => { updateField('registrationNumber', v); clearError('registrationNumber'); }}
        placeholder="12345678"
        keyboardType="default"
        error={errors.registrationNumber}
      />

      <TextInput
        label="VAT Number"
        value={formData.vatNumber}
        onChangeText={v => updateField('vatNumber', v)}
        placeholder="GB 123 4567 89"
        keyboardType="default"
      />

      <SelectDropdown
        label="Industry Type *"
        options={INDUSTRY_OPTIONS}
        value={formData.industryType}
        onSelect={v => { updateField('industryType', v); clearError('industryType'); }}
        placeholder="Construction"
        error={errors.industryType}
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
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:  { flex: 1 },
  continueBtn:{ flex: 2 },
});

export default BusinessDetailsScreen;
