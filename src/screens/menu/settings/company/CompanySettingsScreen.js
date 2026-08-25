import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import TabsHeader from '../components/TabsHeader';
import BusinessDetailsTab from './tabs/BusinessDetailsTab';
import ContactInfoTab from './tabs/ContactInfoTab';
import DocumentsTab from './tabs/DocumentsTab';
import SecurityTab from './tabs/SecurityTab';
import NotificationsTab from './tabs/NotificationsTab';
import useProfile from '~hooks/useProfile';

// Timesheet reminders are the only setting on the Notifications tab and have no
// backend behind them yet — shipping in phase 2. Hiding just the row would leave
// an empty tab with a Save button that can never enable, so the whole tab goes.
// Flip to true to restore it; NotificationsTab itself is left intact.
const SHOW_NOTIFICATIONS_TAB = false;

const TABS = [
  { id: 'business', label: 'Business Details' },
  { id: 'contact',  label: 'Contact Information' },
  { id: 'documents', label: 'Documents' },
  { id: 'security',  label: 'Account Security' },
  ...(SHOW_NOTIFICATIONS_TAB
    ? [{ id: 'notifications', label: 'Notifications' }]
    : []),
];

const CompanySettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('business');
  const { profile, updateCompanyProfile, updatingProfile } = useProfile();

  const renderTabContent = () => {
    switch(activeTab) {
      case 'business':
        return (
          <BusinessDetailsTab
            profile={profile}
            updateCompanyProfile={updateCompanyProfile}
            updatingProfile={updatingProfile}
          />
        );
      case 'contact':
        return (
          <ContactInfoTab
            profile={profile}
            updateCompanyProfile={updateCompanyProfile}
            updatingProfile={updatingProfile}
          />
        );
      case 'documents':
        return (
          <DocumentsTab
            profile={profile}
            updateCompanyProfile={updateCompanyProfile}
            updatingProfile={updatingProfile}
          />
        );
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return (
          <NotificationsTab
            profile={profile}
            updateCompanyProfile={updateCompanyProfile}
            updatingProfile={updatingProfile}
          />
        );
      default:
        return null;
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
