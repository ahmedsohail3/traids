import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Building2, HardHat, ArrowRight } from 'lucide-react-native';
import { Text, ScrollView } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { Images } from '~assets';

// ─── Logo ────────────────────────────────────────────────────────────────────
const Logo = () => (
  <Image
    source={Images.logoTraids}
    style={styles.logoBox}
    resizeMode="contain"
  />
);

// ─── Account Type Card ────────────────────────────────────────────────────────
const AccountCard = ({
  icon: IconComp,
  title,
  description,
  mainColor,
  iconBgColor,
  onPress,
  colors,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border || '#e5e7eb',
        borderTopColor: mainColor,
      },
    ]}>
    <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
      <IconComp size={RFValue(20)} color={mainColor} strokeWidth={2} />
    </View>
    <Text
      variant="sectionTitle"
      style={{
        color: mainColor,
        marginBottom: 8,
      }}>
      {title}
    </Text>
    <Text variant='body' style={[styles.cardDesc, { color: colors.textSecondary }]}>
      {description}
    </Text>
    <View style={styles.ctaRow}>
      <Text variant='button' style={[styles.cardCta, { color: mainColor }]}>Get Started</Text>
      <ArrowRight
        size={RFValue(12)}
        color={mainColor}
        strokeWidth={2.5}
        style={{ marginLeft: 6 }}
      />
    </View>
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const LoginAccountTypeScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {/* Header / Logo */}
      <View style={styles.header}>
        <Logo />
        <Text variant="screenTitle">Traids.</Text>
      </View>

      <Text
        variant="sectionTitle"
        style={{ fontFamily: FontFamily.bold, marginBottom: 10 }}>
        Choose Your Account Type
      </Text>
      <Text
        variant="body"
        style={{ color: colors.textSecondary, marginBottom: 20 }}>
        Select the profile that best fits your role in the construction ecosystem.
      </Text>

      {/* Cards */}
      <View style={styles.cardsContainer}>
        <AccountCard
          icon={Building2}
          title="Login as Company"
          description="I want to hire subcontractors, manage projects, and streamline my workforce administration."
          mainColor={colors.primary}
          iconBgColor="#F4F8FB" // Very light blue
          onPress={() => navigation.navigate('Login', { accountType: 'company' })}
          colors={colors}
        />
        <AccountCard
          icon={HardHat}
          title="Login as Subcontractor"
          description="I am a skilled tradesperson or freelancer looking for high-quality projects and secure payments."
          mainColor={colors.secondary}
          iconBgColor="#FEF5ED" // Very light orange
          onPress={() => navigation.navigate('Login', { accountType: 'subcontractor' })}
          colors={colors}
        />
      </View>

      {/* Register Link */}
      <View style={styles.registerRow}>
        <Text variant='body' style={{ color: colors.textSecondary }}>
          Don't Have an Account?{' '}
        </Text>
        <Text
          variant='body'
          style={{ color: colors.primary, fontFamily: FontFamily.bold }}
          // Naming the inner screen rewinds RegisterNavigator to its entry point.
          // Without it, re-entering Register resumes wherever the user left off
          // mid-signup, since the nested navigator keeps its own state.
          onPress={() => navigation.navigate('Register', { screen: 'RegisterAccountType' })}>
          Register
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  logoBox: {
    width: RFValue(32),
    height: RFValue(32),
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 28,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderTopWidth: 4,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: RFValue(35),
    height: RFValue(35),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardDesc: {
    lineHeight: RFValue(18),
    fontFamily: FontFamily.medium,
    marginBottom: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCta: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.semiBold,
  },
  registerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.regular,
  },
  registerLink: {
    fontSize: RFValue(12),
    fontFamily: FontFamily.bold,
  },
});

export default LoginAccountTypeScreen;
