import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Feather';
import { Text } from '~components/Common';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';

const AuthContainer = ({ children, showBack, onBackPress }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
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
            <Icon name="arrow-left" size={RFValue(14)} color={colors.textSecondary} />
            <Text  style={[styles.backText, { color: colors.textSecondary }]}>Back to Login</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
