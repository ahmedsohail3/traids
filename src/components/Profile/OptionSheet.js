/**
 * OptionSheet — bottom sheet of mutually-exclusive choices, paired with
 * FormPickerField.
 *
 * The Common `SelectDropdown` bundles its own label and border treatment, which
 * does not match this form's field styling; this sheet is the picker half only.
 *
 * Props:
 *   visible  boolean
 *   title    string
 *   options  Array<{ label, value }>
 *   value    string
 *   onSelect function(value)
 *   onClose  function
 */
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Check } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const OptionSheet = ({ visible, title, options = [], value, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      {/* Swallows taps inside the sheet so choosing an option does not also
          dismiss it through the backdrop. */}
      <TouchableOpacity style={styles.sheet} activeOpacity={1}>
        <View style={styles.handle} />
        {!!title && <Text style={styles.title}>{title}</Text>}

        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {opt.label}
                </Text>
                {active && <Check size={RFValue(15)} color="#10375C" strokeWidth={2.4} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: RFValue(18),
    paddingBottom: RFValue(28),
    paddingTop: RFValue(10),
    maxHeight: '65%',
  },
  handle: {
    alignSelf: 'center',
    width: RFValue(40),
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: RFValue(12),
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
    marginBottom: RFValue(8),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: RFValue(13),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  optionText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(12),
    color: '#2E2E2E',
  },
  optionTextActive: {
    fontFamily: FontFamily.semiBold,
    color: '#10375C',
  },
});

export default OptionSheet;
