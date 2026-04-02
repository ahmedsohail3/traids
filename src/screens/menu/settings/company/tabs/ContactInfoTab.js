import React, { useState } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const FormLabel = ({ text, required }) => (
  <View style={styles.labelRow}>
    <Text style={styles.labelText}>{text}</Text>
    {required && <Text style={styles.requiredMark}>*</Text>}
  </View>
);

const Input = ({ placeholder, val, onChange }) => (
  <RNTextInput
    placeholder={placeholder}
    placeholderTextColor="#94A3B8"
    value={val}
    onChangeText={onChange}
    style={styles.input}
  />
);

const ContactInfoTab = () => {
  const [form, setForm] = useState({
    name: 'John Doe',
    email: 'john@acme.com',
    phone: '+44 7700 900000',
    address: '123 Construction Way, London, UK'
  });

  const setItem = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <View style={styles.container}>
      <FormLabel text="Primary Contact Name" />
      <Input val={form.name} onChange={v => setItem('name', v)} />

      <FormLabel text="Work Email" />
      <Input val={form.email} onChange={v => setItem('email', v)} />

      <FormLabel text="Phone Number" />
      <Input val={form.phone} onChange={v => setItem('phone', v)} />

      <FormLabel text="Head Office Address" />
      <Input val={form.address} onChange={v => setItem('address', v)} />

      <Button title="Save Changes" variant="secondary" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  labelText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: RFValue(11),
    fontFamily: FontFamily.regular,
    color: '#334155',
    marginBottom: 20,
  }
});

export default ContactInfoTab;
