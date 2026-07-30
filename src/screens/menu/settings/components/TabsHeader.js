import { useRef, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';
const SLATE = '#94A3B8';

const TabsHeader = ({ activeTab, onTabSelect, tabs = [] }) => {
  const scrollRef = useRef(null);

  // Layout of each tab within the scroll content, keyed by tab id.
  const tabLayouts   = useRef({});
  const viewportW    = useRef(0);
  const contentW     = useRef(0);

  const firstTabId = tabs[0]?.id;

  // Centre the active tab in the viewport. The first tab stays pinned to the
  // start — centring it would leave dead space on the left.
  const centerActiveTab = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || !viewportW.current) return;

    if (firstTabId === activeTab) {
      scroller.scrollTo({ x: 0, animated: true });
      return;
    }

    const layout = tabLayouts.current[activeTab];
    if (!layout) return;

    const maxScroll = Math.max(0, contentW.current - viewportW.current);
    const target    = layout.x + layout.width / 2 - viewportW.current / 2;
    scroller.scrollTo({ x: Math.min(Math.max(target, 0), maxScroll), animated: true });
  }, [activeTab, firstTabId]);

  useEffect(() => { centerActiveTab(); }, [centerActiveTab]);

  const handleTabLayout = useCallback((tabId) => (e) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[tabId] = { x, width };
    // Layout for the initially active tab can land after the first effect run.
    if (tabId === activeTab) centerActiveTab();
  }, [activeTab, centerActiveTab]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      
      <View style={styles.scrollWrapper}>
        <ScrollView 
          ref={scrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onLayout={(e) => { viewportW.current = e.nativeEvent.layout.width; centerActiveTab(); }}
          onContentSizeChange={(w) => { contentW.current = w; centerActiveTab(); }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onLayout={handleTabLayout(tab.id)}
                onPress={() => onTabSelect(tab.id)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
        {/* Full width bottom border representing inactive track */}
        <View style={styles.trackBorder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0, 
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: NAVY,
    marginBottom: 16,
  },
  scrollWrapper: {
    position: 'relative',
  },
  scrollContent: {
    paddingRight: 20,
    flexDirection: 'row',
    gap: 20,
  },
  tabItem: {
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    zIndex: 2,
  },
  tabItemActive: {
    borderBottomColor: NAVY,
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: SLATE,
  },
  tabTextActive: {
    color: NAVY,
    fontFamily: FontFamily.medium,
  },
  trackBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
    zIndex: 1, // behind the active tab border
  }
});

export default TabsHeader;
