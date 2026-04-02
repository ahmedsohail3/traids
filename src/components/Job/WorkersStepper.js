import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Minus, Plus } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';
const BORDER = '#E2E8F0';

const WorkersStepper = ({ value, onChange }) => (
  <View style={styles.stepperRow}>
    <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(Math.max(0, value - 1))}>
      <Minus size={RFValue(14)} color={NAVY} strokeWidth={2} />
    </TouchableOpacity>
    <Text style={styles.stepValue}>{value}</Text>
    <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(value + 1)}>
      <Plus size={RFValue(14)} color={NAVY} strokeWidth={2} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  stepBtn: {
    width: RFValue(30),
    height: RFValue(30),
    borderRadius: RFValue(6),
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    color: NAVY,
    minWidth: RFValue(24),
    textAlign: 'center',
  },
});

export default WorkersStepper;
