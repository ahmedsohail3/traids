import { useState, useCallback, forwardRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import PropTypes from "prop-types";
import { RFValue } from "react-native-responsive-fontsize";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "~context/ThemeContext";
import { FontFamily } from "~theme/fonts";

// Light mode colors for forceLight prop
const lightModeColors = {
  inputBackground: "#FFFFFF",
  inputBorder: "#E5E7EB",
  inputText: "#111827",
  inputPlaceholder: "#9AA0A6",
  inputDisabled: "#F3F4F6",
  iconMuted: "#9CA3AF",
  textSecondary: "#6B7280",
  error: "#EF4444",
};

const Input = forwardRef(({
  type = 1,
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  secureTextEntry = false,
  editable = true,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  multiline = false,
  maxLength = 120,
  numberOfLines = 1,
  forceLight = false,
}, ref) => {
  const { colors, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  // Use light mode colors if forceLight is true
  const activeColors = forceLight ? lightModeColors : colors;
  const effectiveIsDark = forceLight ? false : isDark;

  const handleChangeText = useCallback(
    (text) => {
      onChangeText(text);
    },
    [onChangeText],
  );

  // Dynamic styles based on theme
  const themedStyles = {
    label: {
      color: effectiveIsDark ? activeColors.textSecondary : activeColors.textPrimary,
    },
    inputWrapper1: {
      backgroundColor: activeColors.inputBackground,
      borderColor: error ? activeColors.error : activeColors.inputBorder,
    },
    inputWrapper2: {
      backgroundColor: "transparent",
      borderBottomColor: error ? activeColors.error : activeColors.inputBorder,
    },
    input: {
      color: activeColors.inputText,
    },
    disabled: {
      backgroundColor: activeColors.inputDisabled,
    },
    iconColor: activeColors.primary,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, themedStyles.label]}>
          {label.includes('*')
            ? [
                label.substring(0, label.indexOf('*')),
                <Text key="star" style={{ color: activeColors.error }}>*</Text>,
                label.substring(label.indexOf('*') + 1),
              ]
            : label}
        </Text>
      )}

      <View
        style={[
          type === 1 ? styles.inputWrapper1 : styles.inputWrapper2,
          type === 1 ? themedStyles.inputWrapper1 : themedStyles.inputWrapper2,
          error && styles.errorBorder,
          !editable && themedStyles.disabled,
        ]}>
        {leftIcon && type === 1 && (
          <Icon
            name={leftIcon}
            size={18}
            color={themedStyles.iconColor}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          ref={ref}
          value={value}
          maxLength={maxLength}
          onChangeText={handleChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={activeColors.inputPlaceholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={isPassword && !showPassword}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            themedStyles.input,
            multiline && styles.multiline,
            inputStyle,
          ]}
          returnKeyType="done"
        />

        {(isPassword || rightIcon) && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              isPassword ? setShowPassword(!showPassword) : onRightIconPress?.()
            }>
            <MaterialIcon
              name={isPassword ? (showPassword ? "eye-off" : "eye") : rightIcon}
              size={22}
              color={themedStyles.iconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: activeColors.error }]}>{error}</Text>
      )}
    </View>
  );
});

Input.displayName = "Input";

Input.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChangeText: PropTypes.func.isRequired,
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

  // ── Type 1 ──
  inputWrapper1: {
    height: 56,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  // ── Type 2 ──
  inputWrapper2: {
    height: 56,
    borderWidth: 0.5,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },

  // ── Common ──
  input: {
    flex: 1,
    fontSize: RFValue(12),
    fontFamily: FontFamily.regular,
    paddingVertical: 0,
    textAlignVertical: "center",
  },

  multiline: {
    paddingVertical: 12,
    textAlignVertical: "top",
  },

  leftIcon: {
    marginRight: 10,
  },

  errorText: {
    marginTop: 6,
    fontSize: RFValue(10),
  },

  errorBorder: {},
});

export default Input;
