import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, SelectDropdown } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';

const INDUSTRY_OPTIONS = [
  { label: 'Construction', value: 'construction' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Architecture', value: 'architecture' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Infrastructure', value: 'infrastructure' },
  { label: 'Mining', value: 'mining' },
  { label: 'Other', value: 'other' },
];

const BusinessDetailsScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const [companyName, setCompanyName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [industry, setIndustry] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback(() => {
    const e = {};
    if (!companyName.trim()) e.companyName = 'Company name is required';
    if (!regNumber.trim()) e.regNumber = 'Registration number is required';
    if (!industry) e.industry = 'Please select an industry type';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [companyName, regNumber, industry]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('CardDetails', { companyName, regNumber, vatNumber, industry });
    }, 500);
  }, [validate, navigation, companyName, regNumber, vatNumber, industry]);

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
        value={companyName}
        onChangeText={v => { setCompanyName(v); setErrors(p => ({ ...p, companyName: '' })); }}
        placeholder="Acme Construction Ltd"
        autoCapitalize="words"
        error={errors.companyName}
      />

      <TextInput
        label="Registration Number *"
        value={regNumber}
        onChangeText={v => { setRegNumber(v); setErrors(p => ({ ...p, regNumber: '' })); }}
        placeholder="12345678"
        keyboardType="default"
        error={errors.regNumber}
      />

      <TextInput
        label="VAT Number"
        value={vatNumber}
        onChangeText={setVatNumber}
        placeholder="GB 123 4567 89"
        keyboardType="default"
      />

      <SelectDropdown
        label="Industry Type *"
        options={INDUSTRY_OPTIONS}
        value={industry}
        onSelect={v => { setIndustry(v); setErrors(p => ({ ...p, industry: '' })); }}
        placeholder="Construction"
        error={errors.industry}
      />

      {/* Bottom action row */}
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
          loading={loading}
        />
      </View>
    </RegisterContainer>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
  },
  continueBtn: {
    flex: 2,
  },
});

export default BusinessDetailsScreen;
