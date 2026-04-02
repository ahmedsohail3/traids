import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Image as ImageIcon } from 'lucide-react-native';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import TradeDropdown from '~components/Job/TradeDropdown';

const FormLabel = ({ text, required }) => (
  <View style={styles.labelRow}>
    <Text style={styles.labelText}>{text}</Text>
    {required && <Text style={styles.requiredMark}>*</Text>}
  </View>
);

const Input = ({ placeholder, val, onChange, multiline }) => (
  <RNTextInput
    placeholder={placeholder}
    placeholderTextColor="#94A3B8"
    value={val}
    onChangeText={onChange}
    multiline={multiline}
    style={[styles.input, multiline && styles.inputMultiline]}
  />
);

const BusinessDetailsTab = () => {
  const [form, setForm] = useState({
    name: 'Your Acme Construction Ltd',
    regNum: '12345678',
    vatNum: 'GB 123 4567 89',
    industry: 'Residential Construction',
    about: 'BuildRight Construction is a premier construction and infrastructure contractor dedicated to delivering excellence in every project. With over 15 years of industry experience, we specialize in commercial fit-outs, residential developments, and large-scale renovation projects.'
  });

  const setItem = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <View style={styles.container}>
      
      {/* Logo Upload Row */}
      <View style={styles.logoRow}>
        <TouchableOpacity style={styles.logoPicker}>
          <ImageIcon size={RFValue(18)} color="#10375C" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.logoHint}>
          JPG, PNG, or WEBP up to 5MB. Square image recommended.
        </Text>
      </View>

      <FormLabel text="Company Name" required />
      <Input placeholder="Enter company name" val={form.name} onChange={v => setItem('name', v)} />

      <FormLabel text="Registration Number" required />
      <Input placeholder="Enter registration number" val={form.regNum} onChange={v => setItem('regNum', v)} />

      <FormLabel text="VAT Number" />
      <Input placeholder="Enter VAT number" val={form.vatNum} onChange={v => setItem('vatNum', v)} />

      <FormLabel text="Industry Type" required />
      <TradeDropdown value={form.industry} onSelect={v => setItem('industry', v)} />

      <View style={{ marginTop: 20 }}>
        <FormLabel text="About Us" />
        <Input placeholder="Describe your company" val={form.about} onChange={v => setItem('about', v)} multiline />
      </View>

      <Button title="Save Changes" variant="secondary" onPress={() => {}} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  logoPicker: {
    width: RFValue(44),
    height: RFValue(44),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  logoHint: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
    lineHeight: RFValue(14),
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  labelText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  requiredMark: {
    color: '#EF4444',
    marginLeft: 2,
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
    marginBottom: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default BusinessDetailsTab;
