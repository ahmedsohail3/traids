import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, UploadField } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';
import useSubcontractorSignup from '~hooks/useSubcontractorSignup';
import { pickDocument } from '~utils/filePicker';

// ─── Expiry date row ──────────────────────────────────────────────────────────

const ExpiryRow = ({ value, onChangeText }) => (
  <TextInput
    label="Expiry Date"
    value={value}
    onChangeText={onChangeText}
    placeholder="DD/MM/YYYY"
    keyboardType="number-pad"
    maxLength={10}
  />
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const QualificationScreen = ({ navigation }) => {
  const { formData, updateField } = useSubcontractorSignup();

  const formatDate = useCallback((text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    if (cleaned.length > 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    }
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  }, []);

  const handlePickFile = useCallback(async (field) => {
    const file = await pickDocument();
    if (file) updateField(field, file);
  }, [updateField]);

  const handleContinue = useCallback(() => {
    navigation.navigate('SubProfileSetup');
  }, [navigation]);

  return (
    <RegisterContainer
      title="Subcontractor Registration"
      onBack={() => navigation.goBack()}
      currentStep={2}
      totalSteps={4}>

      <Text variant="sectionTitle" style={styles.heading}>
        Qualification &amp; CIS
      </Text>

      {/* Insurance */}
      <UploadField
        label="Insurance"
        hint="JPG, PNG or WEBP (max. 5MB)"
        file={formData.insuranceDocuments}
        onPress={() => handlePickFile('insuranceDocuments')}
        onRemove={() => updateField('insuranceDocuments', null)}
      />
      <ExpiryRow
        value={formData.insuranceExpiresAt}
        onChangeText={(t) => updateField('insuranceExpiresAt', formatDate(t))}
      />

      {/* Tickets */}
      <UploadField
        label="Tickets"
        hint="JPG, PNG or WEBP (max. 5MB)"
        file={formData.ticketDocuments}
        onPress={() => handlePickFile('ticketDocuments')}
        onRemove={() => updateField('ticketDocuments', null)}
      />
      <ExpiryRow
        value={formData.ticketExpiresAt}
        onChangeText={(t) => updateField('ticketExpiresAt', formatDate(t))}
      />

      {/* Certification */}
      <UploadField
        label="Certification"
        hint="JPG, PNG or WEBP (max. 5MB)"
        file={formData.certificationDocuments}
        onPress={() => handlePickFile('certificationDocuments')}
        onRemove={() => updateField('certificationDocuments', null)}
      />
      <ExpiryRow
        value={formData.certificationExpiresAt}
        onChangeText={(t) => updateField('certificationExpiresAt', formatDate(t))}
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
  cancelBtn:   { flex: 1 },
  continueBtn: { flex: 2 },
});

export default QualificationScreen;
