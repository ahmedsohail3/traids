import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import TabsHeader from '../components/TabsHeader';
import BusinessDetailsTab from './tabs/BusinessDetailsTab';
import ContactInfoTab from './tabs/ContactInfoTab';
import DocumentsTab from './tabs/DocumentsTab';
import SecurityTab from './tabs/SecurityTab';
import NotificationsTab from './tabs/NotificationsTab';

const TABS = [
  { id: 'business', label: 'Business Details' },
  { id: 'contact',  label: 'Contact Information' },
  { id: 'documents', label: 'Documents' },
  { id: 'security',  label: 'Account Security' },
  { id: 'notifications', label: 'Notifications' },
];

const CompanySettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('business');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'business': return <BusinessDetailsTab />;
      case 'contact': return <ContactInfoTab />;
      case 'documents': return <DocumentsTab />;
      case 'security': return <SecurityTab />;
      case 'notifications': return <NotificationsTab />;
      default: return null;
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TabsHeader activeTab={activeTab} onTabSelect={setActiveTab} tabs={TABS} />
      
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 3,
    minHeight: 500,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
  }
});

export default CompanySettingsScreen;
