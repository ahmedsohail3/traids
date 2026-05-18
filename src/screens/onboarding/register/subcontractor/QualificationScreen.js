import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, UploadField } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import RegisterContainer from '../RegisterContainer';

// ─── Date Input row ──────────────────────────────────────────────────────────
const ExpiryRow = ({ value, onChangeText }) => (
  <TextInput
    label="Expiry Date"
    value={value}
    onChangeText={onChangeText}
    placeholder="00/00/0000"
    keyboardType="number-pad"
    maxLength={10}
  />
);

const QualificationScreen = ({ navigation }) => {
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [ticketsFile, setTicketsFile] = useState(null);
  const [ticketsExpiry, setTicketsExpiry] = useState('');
  const [certFile, setCertFile] = useState(null);
  const [certExpiry, setCertExpiry] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = useCallback(text => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8);
    if (cleaned.length > 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    }
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  }, []);

  const handlePickFile = useCallback(setter => {
    // TODO: integrate @react-native-documents/picker
    setter({ name: 'document.pdf', uri: '' });
  }, []);

  const handleContinue = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SubProfileSetup');
    }, 500);
  }, [navigation]);

  return (
    <RegisterContainer
      title="Subcontractor Registration"
      onBack={() => navigation.goBack()}
      currentStep={2}
      totalSteps={4}>

      <Text variant="sectionTitle" style={styles.heading}>
        Qualification & CIS
      </Text>

      {/* Insurance */}
      <UploadField
        label="Insurance"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={insuranceFile}
        onPress={() => handlePickFile(setInsuranceFile)}
      />
      <ExpiryRow
        value={insuranceExpiry}
        onChangeText={t => setInsuranceExpiry(formatDate(t))}
      />

      {/* Tickets */}
      <UploadField
        label="Tickets"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={ticketsFile}
        onPress={() => handlePickFile(setTicketsFile)}
      />
      <ExpiryRow
        value={ticketsExpiry}
        onChangeText={t => setTicketsExpiry(formatDate(t))}
      />

      {/* Certification */}
      <UploadField
        label="Certification"
        hint="PDF, JPG or PNG (max. 5MB)"
        file={certFile}
        onPress={() => handlePickFile(setCertFile)}
      />
      <ExpiryRow
        value={certExpiry}
        onChangeText={t => setCertExpiry(formatDate(t))}
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

export default QualificationScreen;
