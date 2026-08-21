import {View, StyleSheet, Image} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {Building2, HardHat} from 'lucide-react-native';
import {Text, ScrollView, AccountTypeCard} from '~components/Common';
import {FontFamily} from '~theme/fonts';
import {useTheme} from '~context/ThemeContext';
import {Images} from '~assets';

// ─── Logo ────────────────────────────────────────────────────────────────────
const Logo = () => (
  <Image
    source={Images.traidsLogo}
    style={styles.logoBox}
    resizeMode="contain"
  />
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const LoginAccountTypeScreen = ({navigation}) => {
  const {colors} = useTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {/* Header / Logo */}
      <View style={styles.header}>
        <Logo />
      </View>

      <Text
        variant="sectionTitle"
        style={{fontFamily: FontFamily.bold, marginBottom: 10}}>
        Choose Your Account Type
      </Text>
      <Text
        variant="body"
        style={{color: colors.textSecondary, marginBottom: 20}}>
        Select the profile that best fits your role in the construction
        ecosystem.
      </Text>

      {/* Cards */}
      <View style={styles.cardsContainer}>
        <AccountTypeCard
          icon={Building2}
          title="Login as Company"
          description="I want to hire subcontractors, manage projects, and streamline my workforce administration."
          mainColor={colors.primary}
          iconBgColor="#F4F8FB" // Very light blue
          onPress={() => navigation.navigate('Login', {accountType: 'company'})}
        />
        <AccountTypeCard
          icon={HardHat}
          title="Login as Subcontractor"
          description="I am a skilled tradesperson or freelancer looking for high-quality projects and secure payments."
          mainColor={colors.secondary}
          iconBgColor="#FEF5ED" // Very light orange
          onPress={() =>
            navigation.navigate('Login', {accountType: 'subcontractor'})
          }
        />
      </View>

      {/* Register Link */}
      <View style={styles.registerRow}>
        <Text variant="body" style={{color: colors.textSecondary}}>
          Don't Have an Account?{' '}
        </Text>
        <Text
          variant="body"
          style={{color: colors.primary, fontFamily: FontFamily.bold}}
          // Naming the inner screen rewinds RegisterNavigator to its entry point.
          // Without it, re-entering Register resumes wherever the user left off
          // mid-signup, since the nested navigator keeps its own state.
          onPress={() =>
            navigation.navigate('Register', {screen: 'RegisterAccountType'})
          }>
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
    width: RFValue(120),
    height: RFValue(32),
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 28,
  },
  registerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default LoginAccountTypeScreen;
