/**
 * CustomTabBar
 *
 * Floating white card tab bar with an orange top-indicator on the active tab.
 *
 * Icon map keys must match the route names defined in the tab navigator.
 *
 * Company tabs:      Dashboard | Subcontractors | Jobs  | Chats | More
 * Subcontractor tabs: Dashboard | JobBoard       | Chats | Bookings | More
 */
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Common";
import { FontFamily } from "~theme/fonts";

// ─── Per-route config ─────────────────────────────────────────────────────────
const ROUTE_CONFIG = {
  // Company
  Dashboard:      { label: "Dashboard",      icon: "grid-outline",          iconFocused: "grid" },
  Subcontractors: { label: "Subcontractors", icon: "people-outline",         iconFocused: "people" },
  Jobs:           { label: "Jobs",           icon: "briefcase-outline",      iconFocused: "briefcase" },
  Chats:          { label: "Chats",          icon: "chatbubble-ellipses-outline", iconFocused: "chatbubble-ellipses" },
  More:           { label: "More",           icon: "menu-outline",           iconFocused: "menu" },

  // Subcontractor (may share some names)
  JobBoard:  { label: "Job Board", icon: "briefcase-outline",   iconFocused: "briefcase" },
  Bookings:  { label: "Bookings",  icon: "calendar-outline",    iconFocused: "calendar" },
};

const ACTIVE_COLOR   = '#10375C'; // dark navy
const INACTIVE_COLOR = '#94A3B8'; // muted slate
const INDICATOR_CLR  = '#F97316'; // orange

const CustomTabBar = ({ state, descriptors, navigation, ...props }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 12 }]}>
      <View style={styles.card}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = ROUTE_CONFIG[route.name] ?? {
            label: route.name,
            icon: "ellipse-outline",
            iconFocused: "ellipse",
          };

          const onPress = () => {
            if (route.name === 'More') {
              if (props.onMenuPress) {
                props.onMenuPress();
              }
              return; // DO NOT navigate natively yet
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}>
              {/* Orange indicator at the very top of the active tab */}
              <View
                style={[
                  styles.indicator,
                  isFocused ? styles.indicatorActive : styles.indicatorHidden,
                ]}
              />

              <Icon
                name={isFocused ? config.iconFocused : config.icon}
                size={RFValue(16)}
                color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                style={styles.icon}
                strokeWidth={3}
              />

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  styles.label,
                  { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                  isFocused && styles.labelActive,
                ]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    // Subtle shadow for the floating effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: RFValue(12),
  },
  indicator: {
    width: '60%',
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginBottom: RFValue(8),
  },
  indicatorActive: {
    backgroundColor: INDICATOR_CLR,
  },
  indicatorHidden: {
    backgroundColor: 'transparent',
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: RFValue(8),
    fontFamily: FontFamily.medium,
  },
  labelActive: {
    fontFamily: FontFamily.medium,
  },
});

export default CustomTabBar;
