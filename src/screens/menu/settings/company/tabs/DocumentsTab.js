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
    company: { name: 'phoenix-document.pdf', size: '6.77 MB' },
    insurance: { name: 'phoenix-document.pdf', size: '6.77 MB' },
    health: { name: 'phoenix-document.pdf', size: '6.77 MB' }
  });

  const removeDoc = (key) => setDocs(p => ({ ...p, [key]: null }));
  const uploadDoc = (key) => setDocs(p => ({ ...p, [key]: { name: 'new-document.pdf', size: '2.4 MB' } }));

  return (
    <View style={styles.container}>
      <UploadField
        label="Company Document"
        onPress={() => uploadDoc('company')}
        file={docs.company}
        onRemove={() => removeDoc('company')}
      />

      <UploadField
        label="Insurance Certificate"
        onPress={() => uploadDoc('insurance')}
        file={docs.insurance}
        onRemove={() => removeDoc('insurance')}
      />

      <UploadField
        label="Health and Safety Policy"
        onPress={() => uploadDoc('health')}
        file={docs.health}
        onRemove={() => removeDoc('health')}
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
  }
});

export default DocumentsTab;
