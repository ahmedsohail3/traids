import React from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Calendar } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';

const NAVY = '#10375C';
const BORDER = '#E2E8F0';

const TimelineRow = ({ startDate, endDate, onStartPress, onEndPress }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.timelineRow}>
      <TouchableOpacity style={[styles.dateBtn, { borderColor: BORDER, backgroundColor: colors.surface }]} onPress={onStartPress} activeOpacity={0.8}>
        <RNTextInput
          value={startDate}
          placeholder="mm/dd/yy"
          placeholderTextColor="#94A3B8"
          editable={false}
          pointerEvents="none"
          style={[styles.dateText, { color: colors.textPrimary }]}
        />
        <Calendar size={RFValue(14)} color="#94A3B8" strokeWidth={2} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      
      <Text style={styles.dash}>—</Text>
      
      <TouchableOpacity style={[styles.dateBtn, { borderColor: BORDER, backgroundColor: colors.surface }]} onPress={onEndPress} activeOpacity={0.8}>
        <RNTextInput
          value={endDate}
          placeholder="mm/dd/yy"
          placeholderTextColor="#94A3B8"
          editable={false}
          pointerEvents="none"
          style={[styles.dateText, { color: colors.textPrimary }]}
        />
        <Calendar size={RFValue(14)} color="#94A3B8" strokeWidth={2} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  dateText: { 
    flex: 1, 
    fontFamily: FontFamily.regular, 
    fontSize: RFValue(11),
    padding: 0, 
    margin: 0,
  },
  dash: { 
    color: '#94A3B8', 
    paddingHorizontal: 6,
    fontFamily: FontFamily.bold,
  },
});

export default TimelineRow;
