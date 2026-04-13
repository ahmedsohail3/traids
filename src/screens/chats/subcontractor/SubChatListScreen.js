/**
 * SubChatListScreen — Chat list screen for Subcontractor role.
 * Shows All / Unread tabs, search, and a conversation list.
 */
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Search } from 'lucide-react-native';
import ChatListItem from '~components/Chat/ChatListItem';
import { ScrollView } from '~components/Common';

const TABS = ['All', 'Unread'];

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name: 'Acme Construction',
    lastMessage: 'Thank you for your message...',
    time: 'Mon',
    unread: 1,
    isOnline: false,
    avatarUri: null,
  },
  {
    id: '2',
    name: 'SuppSpark',
    lastMessage: 'Thank you for your message...',
    time: 'Tue',
    unread: 0,
    isOnline: true,
    avatarUri: null,
  },
];

const SubChatListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_CONVERSATIONS.filter(c => {
    const matchesTab = activeTab === 'All' || c.unread > 0;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Messages" subtitle="Manage your chat system here." />


      <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Search size={RFValue(13)} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search user..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity key={tab} style={styles.tabItem} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab}</Text>
              {active && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Conversation list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{backgroundColor: '#FFFFFF', paddingHorizontal: 0}}>
        {filtered.map(item => (
          <View key={item.id}>
            <ChatListItem
              item={item}
              onPress={() => navigation.navigate('SubChat', { conversation: item })}
            />
            <View style={styles.divider} />
          </View>
        ))}
      </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 140,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden'
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#10375C',
    padding: 0,
  },
  tabRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    width: '100%'
  },
  tabItem: { paddingBottom: 10, width: '50%', },
  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#94A3B8',
    textAlign: 'center'
  },
  tabLabelActive: {
    color: '#10375C',
    fontFamily: FontFamily.medium,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginHorizontal: 16 },
});

export default SubChatListScreen;
