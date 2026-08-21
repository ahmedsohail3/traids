import {useState, useEffect} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {RFValue} from 'react-native-responsive-fontsize';
import {Text} from '~components/Common';
import {FontFamily} from '~theme/fonts';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Images} from '~assets';
import useNotifications from '~hooks/useNotifications';
import NotificationDropdownModal from '~components/Notifications/NotificationDropdownModal';

const Header = ({
  title,
  subtitle,
  showPostButton = false,
  showBackButton = false,
  onPostPress,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {unreadCount, getNotifications} = useNotifications();
  const [notifVisible, setNotifVisible] = useState(false);
  const userType = useSelector(s => s.auth?.user?.type ?? 'company');

  useEffect(() => {
    getNotifications();
  }, []);

  // Settings lives inside the More tab, so the tap has to go through the role's
  // tab root — 'Settings' is not a top-level registered route.
  const goToSettings = () => {
    if (onSettingsPress) return onSettingsPress();
    const tabsRoot = userType === 'subcontractor' ? 'SubTabs' : 'CompanyTabs';
    navigation.navigate(tabsRoot, {
      screen: 'More',
      params: {screen: 'Settings'},
    });
  };

  return (
    <View style={[styles.dashCard, {paddingTop: insets.top + RFValue(12)}]}>
      {/* Top row: logo + right icons */}
      <View style={styles.row}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Image
            source={Images.traidsLogoWhite}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Right: bell + settings */}
        <View style={styles.iconsRow}>
          {/* Notification bell */}
          <TouchableOpacity
            style={styles.iconCircle}
            activeOpacity={0.7}
            onPress={() => setNotifVisible(true)}>
            <Icon
              name="notifications-outline"
              size={RFValue(17)}
              color="#FFFFFF"
            />
            {unreadCount > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.iconCircle}
            activeOpacity={0.7}
            onPress={goToSettings}>
            <Icon name="settings-outline" size={RFValue(17)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <NotificationDropdownModal
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
        navigation={navigation}
      />

      {/* Title + subtitle + optional FAB */}
      <View style={styles.titleRowExt}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}>
            <Icon name="arrow-back" size={RFValue(18)} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={[styles.row, styles.titleRow, {flex: 1, marginTop: 0}]}>
          <View style={styles.titleBlock}>
            {title ? (
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={styles.subtitleText}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Company-only: orange + button */}
          {showPostButton ? (
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.85}
              onPress={onPostPress}>
              <Icon
                name="add-circle-outline"
                size={RFValue(22)}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dashCard: {
    backgroundColor: '#10375C',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: RFValue(120),
    height: RFValue(32),
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: RFValue(34),
    height: RFValue(34),
    borderRadius: RFValue(17),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  titleRowExt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    alignItems: 'flex-end',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(18),
    color: '#FFFFFF',
    lineHeight: RFValue(24),
  },
  subtitleText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#FFFFFF',
    lineHeight: RFValue(14),
  },
  fab: {
    width: RFValue(35),
    height: RFValue(35),
    borderRadius: RFValue(6),
    backgroundColor: '#F2A154',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#F2A154',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default Header;
