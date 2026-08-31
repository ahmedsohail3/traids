import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Feather';
import {Text} from '~components/Common';
import {useTheme} from '~context/ThemeContext';
import {FontFamily} from '~theme/fonts';

/**
 * Size for the description line under each auth screen's heading — a step below
 * the body default (RFValue(11)), which reads better for copy this long.
 *
 * Apply it to any nested <Text> too: those are AppTexts and re-apply the body
 * size rather than inheriting, so they would otherwise render larger than the
 * text around them. Text.js rescales lineHeight from the body ratio for you.
 */
export const AUTH_DESCRIPTION_FONT_SIZE = RFValue(11);

const AuthContainer = ({
  children,
  showBack,
  onBackPress,
  backLabel = 'Back to Login',
  reserveBackSpace = false,
}) => {
  const {colors, isDark} = useTheme();

  return (
    <View style={[styles.safe, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {showBack && (
          <TouchableOpacity
            style={styles.backRow}
            onPress={onBackPress}
            activeOpacity={0.7}>
            <Icon
              name="arrow-left"
              size={RFValue(14)}
              color={colors.textSecondary}
            />
            <Text style={[styles.backText, {color: colors.textSecondary}]}>
              {backLabel}
            </Text>
          </TouchableOpacity>
        )}

        {/* Empty spacer — nothing is drawn. It copies the back row purely to
            borrow its height, so this screen's card sits at the same level as
            the ones that do have a back button, without hardcoding a margin
            that would drift as RFValue scales. */}
        {!showBack && reserveBackSpace && (
          <View
            style={[styles.backRow, styles.backRowSpacer]}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            <Icon name="arrow-left" size={RFValue(14)} />
            <Text style={styles.backText}>{backLabel}</Text>
          </View>
        )}

        <View style={[styles.card, {backgroundColor: colors.surface}]}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: RFValue(32),
    paddingBottom: RFValue(40),
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backRowSpacer: {opacity: 0},
  backText: {
    fontSize: RFValue(13),
    fontFamily: FontFamily.medium,
  },
  card: {
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#0A2540',
    padding: 24,
  },
});

export default AuthContainer;
