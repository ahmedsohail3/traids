import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useCompanySignup from '~hooks/useCompanySignup';
import useScrollToFieldError from '~hooks/useScrollToFieldError';

const CompanyDetailsScreen = ({ navigation }) => {
  const { formData, errors, updateField, clearError, validateStep, validating, validateOnServer } =
    useCompanySignup();

  // Server-validated fields — listed top-down so the highest error wins the scroll
  const { scrollRef, onContentLayout, registerField } = useScrollToFieldError(errors, [
    'workEmail',
    'phoneNumber',
  ]);

  const handleContinue = useCallback(async () => {
    if (!validateStep(3)) return;
    // Server check for an already-registered work email / phone number
    if (!(await validateOnServer(3))) return;
    navigation.navigate('Verification');
  }, [validateStep, validateOnServer, navigation]);

  return (
    <RegisterContainer
      onBack={() => navigation.goBack()}
      currentStep={3}
      totalSteps={4}
      scrollRef={scrollRef}
      onContentLayout={onContentLayout}>

      <Text
        variant="sectionTitle"
        style={{ fontFamily: FontFamily.bold, marginBottom: 20 }}>
        Company Registration
      </Text>

      <TextInput
        label="Primary Contact Name *"
        value={formData.primaryContactName}
        onChangeText={v => { updateField('primaryContactName', v); clearError('primaryContactName'); }}
        placeholder="John Doe"
        autoCapitalize="words"
        error={errors.primaryContactName}
      />

      <View {...registerField('workEmail')}>
        <TextInput
          label="Work Email *"
          value={formData.workEmail}
          onChangeText={v => { updateField('workEmail', v); clearError('workEmail'); }}
          placeholder="john@acme.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.workEmail}
        />
      </View>

      <View {...registerField('phoneNumber')}>
        <TextInput
          label="Phone Number *"
          value={formData.phoneNumber}
          onChangeText={v => { updateField('phoneNumber', v); clearError('phoneNumber'); }}
          placeholder="+44 7706 900083"
          keyboardType="phone-pad"
          error={errors.phoneNumber}
        />
      </View>

      <TextInput
        label="Enter Password *"
        value={formData.password}
        onChangeText={v => { updateField('password', v); clearError('password'); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.password}
      />

      <TextInput
        label="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={v => { updateField('confirmPassword', v); clearError('confirmPassword'); }}
        placeholder="••••••••"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <TextInput
        label="Head Office Address *"
        value={formData.headOfficeAddress}
        onChangeText={v => { updateField('headOfficeAddress', v); clearError('headOfficeAddress'); }}
        placeholder="123 Construction Way, London, UK"
        autoCapitalize="words"
        error={errors.headOfficeAddress}
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
          loading={validating}
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

export default CompanyDetailsScreen;
