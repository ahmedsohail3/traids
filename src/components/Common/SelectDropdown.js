import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';

/**
 * SelectDropdown — styled dropdown consistent with the Input component.
 *
 * Props:
 *   label       – field label string
 *   value       – currently selected string value
 *   options     – array of { label: string, value: string }
 *   onSelect    – callback(selectedValue: string)
 *   placeholder – placeholder text when nothing selected
 *   error       – error string to display below
 *   containerStyle – optional outer style
 */
const SelectDropdown = ({
  label,
  value,
  options = [],
  onSelect,
  placeholder = 'Select...',
  error,
  containerStyle,
}) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  const handleSelect = useCallback(
    item => {
      onSelect(item.value);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {label.includes('*')
            ? [
                label.substring(0, label.indexOf('*')),
                <Text key="star" style={{ color: colors.error }}>*</Text>,
                label.substring(label.indexOf('*') + 1),
              ]
            : label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.error : colors.inputBorder,
          },
        ]}>
        <Text
          style={[
            styles.triggerText,
            { color: selectedLabel ? colors.inputText : colors.inputPlaceholder },
          ]}>
          {selectedLabel || placeholder}
        </Text>
        <Icon name="chevron-down" size={RFValue(16)} color={colors.textSecondary} />
      </TouchableOpacity>

      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <SafeAreaView style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              {label || 'Select an option'}
            </Text>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.option,
                    item.value === value && { backgroundColor: colors.backgroundSecondary },
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.textPrimary },
                      item.value === value && { fontFamily: FontFamily.semiBold },
                    ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Icon name="check" size={RFValue(14)} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.regular,
    marginBottom: 6,
  },
  trigger: {
    height: 56,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.regular,
    flex: 1,
  },
  error: {
    marginTop: 6,
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    maxHeight: 360,
  },
  sheetTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(14),
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.regular,
    flex: 1,
  },
});

export default SelectDropdown;
