import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, UploadField } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';

const VerificationScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const [companyDoc, setCompanyDoc] = useState(null);
  const [insuranceCert, setInsuranceCert] = useState(null);
  const [healthPolicy, setHealthPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // In a real app, this would open the document picker
  const handlePickFile = useCallback(setter => {
    // TODO: integrate react-native-document-picker
    setter({ name: 'document.pdf', uri: '' });
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!companyDoc) e.companyDoc = 'Company document is required';
    if (!insuranceCert) e.insuranceCert = 'Insurance certificate is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [companyDoc, insuranceCert]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // TODO: navigate to dashboard / success screen
      navigation.navigate('Login');
    }, 800);
  }, [validate, navigation]);

  return (
    <RegisterContainer
      onBack={() => navigation.goBack()}
      currentStep={4}
      totalSteps={4}>

      <Text
        variant="sectionTitle"
        style={{ fontFamily: FontFamily.bold, marginBottom: 20 }}>
        Verification
      </Text>

      <UploadField
        label="Company Document *"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={companyDoc}
        onPress={() => handlePickFile(setCompanyDoc)}
        style={errors.companyDoc ? { borderColor: colors.error } : undefined}
      />
      {errors.companyDoc ? (
        <Text style={[styles.fieldError, { color: colors.error }]}>{errors.companyDoc}</Text>
      ) : null}

      <UploadField
        label="Insurance Certificate *"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={insuranceCert}
        onPress={() => handlePickFile(setInsuranceCert)}
        style={errors.insuranceCert ? { borderColor: colors.error } : undefined}
      />
      {errors.insuranceCert ? (
        <Text style={[styles.fieldError, { color: colors.error }]}>{errors.insuranceCert}</Text>
      ) : null}

      <UploadField
        label="Health & Safety Policy"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={healthPolicy}
        onPress={() => handlePickFile(setHealthPolicy)}
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
  fieldError: {
    fontSize: 10,
    marginTop: -14,
    marginBottom: 14,
    fontFamily: FontFamily.regular,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: { flex: 1 },
  continueBtn: { flex: 2 },
});

export default VerificationScreen;
