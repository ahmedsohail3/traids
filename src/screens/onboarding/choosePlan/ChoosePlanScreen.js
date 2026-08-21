/**
 * ChoosePlanScreen
 *
 * Company-only step shown straight after login when the authenticated user has
 * no plan yet (`user.accountType == null`). Picking a plan stores it and lets
 * RootNavigator swap this screen for CompanyNavigator. Subcontractors never see
 * this screen — they go to SubNavigator as before.
 */
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react-native';
import { Text, ScrollView, PlanCard } from '~components/Common';
import OnboardingLayout from '~containers/layouts/OnboardingLayout';
import { setAccountType } from '~redux/reducers/authSlice';
import useAuth from '~hooks/useAuth';
import { storeAccountType } from '~utils';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import { Images } from '~assets';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '$29/mo',
    icon: Images.planBasic,
    iconBgColor: '#EEF4F9', // Very light blue
    accent: 'primary',
    description:
      'Perfect for startups and small teams getting started with essential tools.',
    features: [
      'Up to 10 Team Members',
      '5 Active Projects',
      'Basic Dashboard Analytics',
      'Task & Project Management',
      'Company Calendar',
      '5 GB Secure Storage',
    ],
    ctaLabel: 'Choose Basic',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$79/mo',
    icon: Images.planPro,
    iconBgColor: '#FEF9EC', // Very light orange
    accent: 'secondary',
    description:
      'Designed for growing companies that need advanced collaboration.',
    features: [
      'Up to 100 Team Members',
      'Unlimited Projects',
      'Advanced Analytics',
      'AI-Powered Insights',
      'Workflow Automation',
      'Team Collaboration Tools',
    ],
    ctaLabel: 'Upgrade to Pro',
  },
  {
    id: 'proPlus',
    name: 'Pro+ Plan',
    price: '$149/mo',
    icon: Images.planProPlus,
    iconBgColor: '#EEF4F9', // Very light blue
    accent: 'primary',
    description:
      'Built for large organizations requiring enterprise level performance and security.',
    features: [
      'Unlimited Team Members',
      'Unlimited Projects & Workspaces',
      'AI Automation Suite',
      'Predictive Business Analytics',
      'Role & Permission Management',
      'Single Sign-On (SSO)',
    ],
    ctaLabel: 'Get Pro+',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
const ChoosePlanScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { logout } = useAuth();

  const choosePlan = async (planId) => {
    await storeAccountType(planId);
    dispatch(setAccountType(planId));
  };

  return (
    <OnboardingLayout>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Back — the only way out of this step is back to the login flow */}
        <TouchableOpacity
          onPress={logout}
          hitSlop={12}
          style={styles.backButton}>
          <ArrowLeft
            size={RFValue(18)}
            color={colors.textPrimary}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* Header / Logo */}
        <View style={styles.header}>
          <Image
            source={Images.traidsLogo}
            style={styles.logoBox}
            resizeMode="contain"
          />
        </View>

        <Text variant="screenTitle" style={styles.title}>
          Choose Your Plan
        </Text>
        <Text
          variant="body"
          style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select the plan that best fits your team's needs and budget.
        </Text>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              icon={plan.icon}
              iconBgColor={plan.iconBgColor}
              nameColor={colors[plan.accent]}
              description={plan.description}
              features={plan.features}
              ctaLabel={plan.ctaLabel}
              accentColor={colors[plan.accent]}
              onPress={() => choosePlan(plan.id)}
            />
          ))}
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
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
  title: {
    fontSize: RFValue(19),
    fontFamily: FontFamily.bold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(10),
    lineHeight: RFValue(15),
    marginBottom: 24,
  },
  plansContainer: {
    gap: 24,
  },
});

export default ChoosePlanScreen;
