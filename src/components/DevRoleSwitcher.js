/**
 * DevRoleSwitcher
 *
 * ── DEV ONLY — remove this component before release ──
 *
 * A floating button that lets you hot-swap between the Company and Subcontractor
 * navigation flows without needing a real backend login.
 *
 * Renders in the top-right corner, on top of all other content.
 * Mount it inside <NavigationContainer> in App.js (see comment there).
 */
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setUserType } from '~redux/reducers/authSlice';

const DevRoleSwitcher = () => {
  const dispatch = useDispatch();
  const userType = useSelector(state => state.auth?.user?.type ?? 'company');
  const isCompany = userType === 'company';

  const toggle = () => {
    dispatch(setUserType(isCompany ? 'subcontractor' : 'company'));
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <TouchableOpacity style={styles.btn} onPress={toggle} activeOpacity={0.85}>
        <Text style={styles.label}>
          {isCompany ? '🏢 → Sub' : '👷 → Co'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 55,
    right: 12,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  btn: {
    backgroundColor: '#10375C',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default DevRoleSwitcher;
