import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '~context/ThemeContext';
import Header from '~components/Header';
import { ScrollView, Text } from '~components/Common';
import { useSelector } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';

import CompanySettingsScreen from './company/CompanySettingsScreen';
import SubcontractorSettingsScreen from './subcontractor/SubcontractorSettingsScreen';

const SettingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  // Using selector with fallback. We'll use a local state to toggle for dev showcase.
  const [devUserType, setDevUserType] = React.useState('subcontractor');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Settings"
        subtitle="Manage your account settings and preferences."
        showBackButton
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {devUserType === 'subcontractor' ? <SubcontractorSettingsScreen /> : <CompanySettingsScreen />}

        {/* Dev toggle — remove in production */}
        <TouchableOpacity
          onPress={() => setDevUserType(p => p === 'company' ? 'subcontractor' : 'company')}
          style={[styles.devToggle, { backgroundColor: colors.primary }]}>
          <Text style={styles.devToggleText}>
            Switch to {devUserType === 'company' ? 'Subcontractor' : 'Company'} View
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120, // space for tab bar
  },
  devToggle: {
    marginTop: 24,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  devToggleText: {
    color: '#fff',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
  },
});

export default SettingsScreen;
