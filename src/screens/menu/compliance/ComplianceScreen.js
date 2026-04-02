import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView, Text, Button } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Folder } from 'lucide-react-native';

const DATA = [
  { id: 1, name: 'Downtown Office Renovation', trade: 'Electrician' },
  { id: 2, name: 'Downtown Office Renovation', trade: 'Electrician' },
  { id: 3, name: 'Downtown Office Renovation', trade: 'Electrician' },
];

const ComplianceScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Compliance Centre"
        subtitle="Manage safety documents, permits, and regulatory requirements according to jobs"
        showBackButton
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {DATA.map((item, idx) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Folder size={64} color="#FBBF24" fill="#FBBF24" />
            </View>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.tradeName}>{item.trade}</Text>
            
            <Button 
              title="See Documents" 
              variant="primary" 
              style={styles.seeDocsBtn} 
              onPress={() => navigation.navigate('ComplianceProject', { projectId: item.id, name: item.name })}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120, // space for tab bar
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    marginBottom: 16,
  },
  projectName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
    textAlign: 'center',
    marginBottom: 4,
  },
  tradeName: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
    marginBottom: 20,
  },
  seeDocsBtn: {
    width: '100%',
  },
});

export default ComplianceScreen;
