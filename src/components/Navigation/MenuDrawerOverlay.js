import { useRef, useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions, 
  Image,
  PanResponder
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { FileText, ShieldCheck, PieChart, BarChart2, CreditCard, Wallet, Settings, LogOut } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useSelector } from 'react-redux';
import useAuth from '~hooks/useAuth';
import useProfile from '~hooks/useProfile';
import useAlert from '~hooks/useAlert';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;
const NAVY = '#10375C';

const COMPANY_MENU_ITEMS = [
  { label: 'Timesheets', icon: FileText, route: 'Timesheets' },
  { label: 'Compliance', icon: ShieldCheck, route: 'Compliance' },
  { label: 'Financial',  icon: PieChart,    route: 'Financial' },
  { label: 'Reports',    icon: BarChart2,   route: 'Reports' },
  { label: 'Settings',   icon: Settings,    route: 'Settings' },
];

// Profile and Earnings are built but unreleased, so they are left out of the
// menu until their routes go back into MoreStack.
const SUBCONTRACTOR_MENU_ITEMS = [
  { label: 'Timesheets', icon: FileText, route: 'Timesheets' },
  { label: 'Payments', icon: CreditCard, route: 'Payments' },
  { label: 'Wallet',     icon: Wallet,      route: 'Wallet' },
  { label: 'Settings',   icon: Settings,    route: 'Settings' },
];

const MenuDrawerOverlay = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { logout } = useAuth();
  const { profile } = useProfile();
  const { showConfirm } = useAlert();

  const userType = useSelector((s) => s.auth?.user?.type ?? 'subcontractor');
  const ACTIVE_MENU = userType === 'subcontractor' ? SUBCONTRACTOR_MENU_ITEMS : COMPANY_MENU_ITEMS;

  const handleLogout = () => {
    onClose();
    showConfirm({
      title:       'Log Out',
      message:     'Are you sure you want to log out of your account?',
      confirmText: 'Log Out',
      cancelText:  'Cancel',
      type:        'warning',
      onConfirm:   logout,
    });
  };

  // Local state to keep the Modal mounted during exit animations
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, modalVisible, slideAnim, fadeAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Assume control if horizontal swipe distance > 10
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow dragging to the left (negative dx)
        if (gestureState.dx < 0) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped left beyond 50px or fast swipe
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          onClose();
        } else {
          // Snap back if released too early
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Don't render until modalVisible is true
  if (!modalVisible) return null;

  const tabsRoot = userType === 'subcontractor' ? 'SubTabs' : 'CompanyTabs';

  const handleMenuPress = (route) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(tabsRoot, {
        screen: 'More',
        params: { screen: route },
      });
    }, 280); // Wait until close animation mostly finishes
  };

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        {/* Backdrop (tap to close) */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
        </Animated.View>

        {/* Drawer Panel */}
        <Animated.View 
          {...panResponder.panHandlers}
          style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        >
          <View style={styles.topSection}>
            {/* Profile Info */}
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                {profile?.profileImage ? (
                  <Image source={{ uri: profile.profileImage }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarImg, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>
                      {profile?.primaryContactName?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.profileTextWrap}>
                <Text style={styles.profileName}>{profile?.primaryContactName || profile?.fullName || '—'}</Text>
                <Text style={styles.profileEmail}>{profile?.workEmail || profile?.email || '—'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Menu Items */}
            {ACTIVE_MENU.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.menuItem} 
                  onPress={() => handleMenuPress(item.route)}
                  activeOpacity={0.7}
                >
                  <IconComp size={RFValue(18)} color={NAVY} strokeWidth={2} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
              <LogOut size={RFValue(18)} color="#EF4444" strokeWidth={2} />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Logout</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23, 23, 23, 0.4)',
  },
  backdropTouch: { flex: 1, width: '100%', height: '100%' },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 50,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
    justifyContent: 'space-between',
  },
  topSection: {},
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(16),
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: NAVY,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuItemText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: NAVY,
    marginLeft: 14,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
});

export default MenuDrawerOverlay;
