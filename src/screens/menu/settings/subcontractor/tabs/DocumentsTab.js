import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from '~components/Common';
import UploadField from '~components/Common/UploadField';
import { FontFamily } from '~theme/fonts';

const FormLabel = ({ text }) => (
  <View style={styles.labelRow}>
    <Text style={styles.labelText}>{text}</Text>
  </View>
);

const DocumentsTab = () => {
  const [docs, setDocs] = useState({
    insurance: { name: 'phoenix-document.pdf', size: '6.77 MB' },
    tickets: { name: 'phoenix-document.pdf', size: '6.77 MB' },
    certification: { name: 'phoenix-document.pdf', size: '6.77 MB' }
  });

  const removeDoc = (key) => setDocs(p => ({ ...p, [key]: null }));
  const uploadDoc = (key) => setDocs(p => ({ ...p, [key]: { name: 'new-document.pdf', size: '2.4 MB' } }));

  return (
    <View style={styles.container}>
      <UploadField
        label="Insurance"
        onPress={() => uploadDoc('insurance')}
        file={docs.insurance}
        onRemove={() => removeDoc('insurance')}
      />

      <UploadField
        label="Tickets"
        onPress={() => uploadDoc('tickets')}
        file={docs.tickets}
        onRemove={() => removeDoc('tickets')}
      />

      <UploadField
        label="Certification"
        onPress={() => uploadDoc('certification')}
        file={docs.certification}
        onRemove={() => removeDoc('certification')}
      />

      <Button title="Save Changes" variant="secondary" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  labelRow: {
    marginBottom: 8,
  },
  labelText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: '#10375C',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10.5,
    color: '#10375C',
    marginBottom: 2,
  },
  fileSize: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: '#64748B',
  },
  removeBtn: {
    padding: 4,
  }
});

export default DocumentsTab;
