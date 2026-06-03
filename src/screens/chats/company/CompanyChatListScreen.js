import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MessageSquare, Search } from 'lucide-react-native';
import { Text } from '~components/Common';
import Header from '~components/Header';
import ChatListItem from '~components/Chat/ChatListItem';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import useChat from '~hooks/useChat';

const TABS = ['All', 'Unread'];

const CompanyChatListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { conversations, loading, getConversations } = useChat();

  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    getConversations();
  }, [getConversations]);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchesTab    = activeTab === 'All' || c.unread > 0;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [conversations, activeTab, search]);

  const handlePress = useCallback(
    (item) => navigation.navigate('CompanyChat', { conversation: item._raw ?? item }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View>
        <ChatListItem item={item} onPress={() => handlePress(item)} />
        <View style={styles.divider} />
      </View>
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <MessageSquare size={RFValue(32)} color="#CBD5E1" strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>No conversations</Text>
        <Text style={styles.emptySub}>
          {activeTab === 'Unread'
            ? 'No unread messages at the moment.'
            : 'Your conversations will appear here.'}
        </Text>
      </View>
    );
  };

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
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab}
                </Text>
                {active && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#10375C" />
          </View>
        )}

        {/* List */}
        {!loading && (
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={12}
            windowSize={8}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root:      { flex: 1 },
  container: {
    flex: 1,
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 140,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
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
  },
  tabItem:        { paddingBottom: 10, width: '50%' },
  tabLabel:       { fontFamily: FontFamily.medium, fontSize: RFValue(11), color: '#94A3B8', textAlign: 'center' },
  tabLabelActive: { color: '#10375C', fontFamily: FontFamily.medium },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginHorizontal: 16 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: FontFamily.semiBold, fontSize: RFValue(13), color: '#10375C', marginTop: 14, marginBottom: 6 },
  emptySub:   { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#94A3B8', textAlign: 'center', lineHeight: RFValue(15) },
});

export default CompanyChatListScreen;
