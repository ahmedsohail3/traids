import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import TradeDropdown from '~components/Job/TradeDropdown';

const FormLabel = ({ text, required }) => (
  <View style={styles.labelRow}>
    <Text style={styles.labelText}>{text}</Text>
    {required && <Text style={styles.requiredMark}>*</Text>}
  </View>
);

const Input = ({ placeholder, val, onChange, multiline, keyboardType }) => (
  <RNTextInput
    placeholder={placeholder}
    placeholderTextColor="#94A3B8"
    value={val}
    onChangeText={onChange}
    multiline={multiline}
    keyboardType={keyboardType}
    style={[styles.input, multiline && styles.inputMultiline]}
  />
);

const ProfileDetailsTab = () => {
  const [form, setForm] = useState({
    name: 'Michael Chen',
    trade: 'Electrician',
    rate: '45.00',
    about: 'BuildRight Construction is a premier construction and infrastructure contractor dedicated to delivering excellence in every project. With over 15 years of industry experience, we specialize in commercial fit-outs, residential developments, and large-scale renovation projects.'
  });

  const setItem = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <View style={styles.container}>
      
      {/* Profile Image Row */}
      <View style={styles.logoRow}>
        <TouchableOpacity style={styles.logoPicker}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?u=michael' }}
            style={styles.profileImg}
          />
        </TouchableOpacity>
        <Text style={styles.logoHint}>
          JPG, PNG, or WEBP up to 5MB. Square image recommended.
        </Text>
      </View>

      <FormLabel text="Full Name" required />
      <Input placeholder="Enter your full name" val={form.name} onChange={v => setItem('name', v)} />

      <FormLabel text="Trade Type" required />
      <TradeDropdown value={form.trade} onSelect={v => setItem('trade', v)} />

      <FormLabel text="Hourly Rate (£)" required />
      <Input 
        placeholder="Enter your hourly rate" 
        val={form.rate} 
        onChange={v => setItem('rate', v)} 
        keyboardType="numeric" 
      />

      <View style={{ marginTop: 2 }}>
        <FormLabel text="About Us" />
        <Input placeholder="Describe your experience" val={form.about} onChange={v => setItem('about', v)} multiline />
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
    borderRadius: RFValue(22),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  profileImg: {
    width: '100%',
    height: '100%',
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
    fontFamily: FontFamily.medium,
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
  }
});

export default ProfileDetailsTab;
