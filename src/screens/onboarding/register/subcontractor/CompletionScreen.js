import { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { CheckCircle } from 'lucide-react-native';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const COMPLETED_ITEMS = [
  { key: 'traids',    label: 'Traids Account',  sub: 'Profile created' },
  { key: 'stripe',   label: 'Stripe Account',   sub: 'Payment account active' },
  { key: 'bank',     label: 'Bank Verified',    sub: 'Barclays ••••9911 connected' },
  { key: 'identity', label: 'Identity Verified', sub: 'KYC check passed' },
];

const CompletionScreen = ({ navigation }) => {
  const handleGoToLogin = useCallback(() => {
    // Pop back to the root of AuthNavigator so we land on Login. accountType is
    // explicit: Login defaults to 'company' without it, and navigating to an
    // existing Login in the stack would otherwise keep its stale params.
    navigation.navigate('Login', { accountType: 'subcontractor' });
  }, [navigation]);

  return (
    // Dark semi-transparent overlay — fills the screen
    <View style={styles.overlay}>
      {/* Tapping the overlay does nothing (no dismiss on tap) */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Badge icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconBg} />
          <View style={styles.iconCircle}>
            <CheckCircle size={RFValue(44)} color="#22C55E" strokeWidth={2} />
          </View>
        </View>

        {/* Headline */}
        <Text
          variant="sectionTitle"
          align="center"
          style={styles.headline}>
          You're all set, Emma!
        </Text>
        <Text
          variant="body"
          align="center"
          style={styles.subtitle}>
          Your bank account has been verified. You can now receive payments from companies on Traids.
        </Text>

        {/* Checklist */}
        {COMPLETED_ITEMS.map((item, idx) => (
          <View
            key={item.key}
            style={[
              styles.row,
              idx < COMPLETED_ITEMS.length - 1 && styles.rowBorder,
            ]}>
            {/* Check icon */}
            <View style={styles.rowIcon}>
              <CheckCircle size={RFValue(16)} color="#22C55E" strokeWidth={2.5} />
            </View>
            {/* Text */}
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.sub}</Text>
            </View>
            {/* Done badge */}
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>Done</Text>
            </View>
          </View>
        ))}

        {/* CTA */}
        <Button
          title="Go to Login →"
          onPress={handleGoToLogin}
          style={styles.cta}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 24,
  },

  // ── Badge icon ──
  iconWrap: {
    alignSelf: 'center',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: RFValue(80),
    height: RFValue(80),
  },
  iconBg: {
    position: 'absolute',
    width: RFValue(70),
    height: RFValue(70),
    borderRadius: RFValue(35),
    backgroundColor: '#DCFCE7',
    opacity: 0.6,
  },
  iconCircle: {
    width: RFValue(62),
    height: RFValue(62),
    borderRadius: RFValue(31),
    borderWidth: 2.5,
    borderColor: '#22C55E',
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Headline ──
  headline: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(16),
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(12),
    color: '#6B7280',
    lineHeight: RFValue(18),
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  // ── Checklist ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  rowIcon: {
    width: RFValue(30),
    height: RFValue(30),
    borderRadius: RFValue(15),
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.semiBold,
    color: '#111827',
    marginBottom: 2,
  },
  rowSub: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.regular,
    color: '#6B7280',
  },
  doneBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  doneBadgeText: {
    fontSize: RFValue(10),
    fontFamily: FontFamily.semiBold,
    color: '#15803D',
  },

  // ── CTA ──
  cta: {
    marginTop: 20,
  },
});

export default CompletionScreen;
