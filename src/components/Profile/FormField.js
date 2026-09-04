/**
 * Form fields for the Upload New Work screen.
 *
 * The app's Common `TextInput` carries its own label, floating-label and icon
 * behaviour that does not match this form's flat "label above a 44pt box"
 * design, so these three primitives implement that design directly and share
 * one label/error treatment between them.
 *
 * Exports:
 *   FormField       label + arbitrary control + error line
 *   FormTextField   single-line or multiline text entry
 *   FormPickerField read-only row that opens a picker (dropdown, date sheet)
 */
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

export const FormField = ({ label, error, children }) => (
  <View style={styles.field}>
    {!!label && <Text style={styles.label}>{label}</Text>}
    {children}
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

export const FormTextField = ({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  minHeight,
  keyboardType = 'default',
  maxLength = 200,
  autoCapitalize = 'sentences',
}) => (
  <FormField label={label} error={error}>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      multiline={multiline}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[
        styles.input,
        multiline && [styles.inputMultiline, minHeight ? { minHeight } : null],
        !!error && styles.inputError,
      ]}
    />
  </FormField>
);

export const FormPickerField = ({ label, error, value, placeholder, onPress }) => (
  <FormField label={label} error={error}>
    <TouchableOpacity
      style={[styles.input, styles.picker, !!error && styles.inputError]}
      activeOpacity={0.8}
      onPress={onPress}>
      <Text
        style={[styles.pickerText, !value && styles.pickerPlaceholder]}
        numberOfLines={1}>
        {value || placeholder}
      </Text>
      <ChevronDown size={RFValue(15)} color="#94A3B8" strokeWidth={2} />
    </TouchableOpacity>
  </FormField>
);

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  input: {
    minHeight: RFValue(40),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(10),
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#2E2E2E',
  },
  inputMultiline: {
    minHeight: RFValue(56),
    paddingTop: RFValue(10),
  },
  inputError: { borderColor: '#EF4444' },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#2E2E2E',
  },
  pickerPlaceholder: { color: '#94A3B8' },
  error: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#EF4444',
  },
});

export default FormField;
