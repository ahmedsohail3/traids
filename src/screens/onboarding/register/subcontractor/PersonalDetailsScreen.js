import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, SelectDropdown } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';

const TRADE_OPTIONS = [
  { label: 'Bricklayer', value: 'bricklayer' },
  { label: 'Carpenter', value: 'carpenter' },
  { label: 'Electrician', value: 'electrician' },
  { label: 'Plumber', value: 'plumber' },
  { label: 'Painter & Decorator', value: 'painter' },
  { label: 'Plasterer', value: 'plasterer' },
  { label: 'Roofer', value: 'roofer' },
  { label: 'Steel Fixer', value: 'steel_fixer' },
  { label: 'General Labourer', value: 'labourer' },
  { label: 'Other', value: 'other' },
];

const PersonalDetailsScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [primaryTrade, setPrimaryTrade] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const clearError = useCallback(
    field => setErrors(prev => ({ ...prev, [field]: '' })),
    [],
  );

  const validate = useCallback(() => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!primaryTrade) e.primaryTrade = 'Please select a primary trade';
    if (!postcode.trim()) e.postcode = 'Postcode / Location is required';
    if (!city.trim()) e.city = 'City / Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [fullName, primaryTrade, postcode, city]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SubQualification');
    }, 500);
  }, [validate, navigation]);

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
        value={fullName}
        onChangeText={v => { setFullName(v); clearError('fullName'); }}
        placeholder="Your Name"
        autoCapitalize="words"
        error={errors.fullName}
      />

      <SelectDropdown
        label="Primary Trade *"
        options={TRADE_OPTIONS}
        value={primaryTrade}
        onSelect={v => { setPrimaryTrade(v); clearError('primaryTrade'); }}
        placeholder="Select an option"
        error={errors.primaryTrade}
      />

      <TextInput
        label="Years Experience"
        value={yearsExperience}
        onChangeText={setYearsExperience}
        placeholder="e.g. 5"
        keyboardType="number-pad"
      />

      <TextInput
        label="Postcode / Location *"
        value={postcode}
        onChangeText={v => { setPostcode(v); clearError('postcode'); }}
        placeholder="SW1A 1AA"
        autoCapitalize="characters"
        error={errors.postcode}
      />

      <TextInput
        label="City/Location *"
        value={city}
        onChangeText={v => { setCity(v); clearError('city'); }}
        placeholder="London"
        autoCapitalize="words"
        error={errors.city}
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
          loading={loading}
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
  cancelBtn: { flex: 1 },
  continueBtn: { flex: 2 },
});

export default PersonalDetailsScreen;
