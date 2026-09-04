/**
 * SubProfileScreen — the subcontractor's own profile.
 *
 * Three stacked blocks, matching the "Profile Overview" design:
 *   1. Profile card   — identity, badges, headline stats, about, certificates
 *   2. Portfolio card — showcased projects + the entry point to add one
 *   3. Total Reviews  — reviews companies have left after completed work
 *
 * Identity, stats and certificates come from `GET /auth/profile`. The portfolio
 * comes from its own slice. Reviews ride along on the profile as `workHistory`
 * — the same read-only, company-written data the company-side profile screen
 * renders. Every block that has no data degrades to an empty state rather than
 * disappearing, so the screen never looks broken while the backend catches up.
 */
import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  Plus,
  BadgeCheck,
  ShieldCheck,
  Ticket,
  FileText,
  Star,
} from 'lucide-react-native';
import { Text, ScrollView, Avatar } from '~components/Common';
import Header from '~components/Header';
import ProfileStatRow from '~components/Profile/ProfileStatRow';
import CertificateCard from '~components/Profile/CertificateCard';
import PortfolioWorkCard from '~components/Profile/PortfolioWorkCard';
import ReviewCard from '~components/Profile/ReviewCard';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import useProfile from '~hooks/useProfile';
import useSubcontractorPortfolio from '~hooks/useSubcontractorPortfolio';
import useAlert from '~hooks/useAlert';

// A subcontractor is "Top Rated" from 4.5 up — the threshold the badge in the
// design implies. The backend sends no such flag, so it is derived here.
const TOP_RATED_MIN = 4.5;

const titleCase = (value) =>
  String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const firstUrl = (documents) => {
  const arr = Array.isArray(documents) ? documents : documents ? [documents] : [];
  const doc = arr[0];
  if (!doc) return null;
  return typeof doc === 'string' ? doc : doc?.url ?? doc?.uri ?? null;
};

// `workHistory` entries are reviews under several possible key spellings —
// normalise once so the card does not have to know about any of them.
const mapReviews = (profile) => {
  const raw = profile?.workHistory ?? profile?.reviews ?? [];
  return (Array.isArray(raw) ? raw : []).map((r, i) => ({
    key:       r?._id ?? r?.id ?? `review-${i}`,
    name:      r?.reviewer ?? r?.reviewerName ?? r?.companyName ?? r?.company?.companyName ?? '',
    avatar:    r?.reviewerImage ?? r?.company?.companyLogo ?? null,
    rating:    Number(r?.rating ?? 0),
    comment:   r?.review ?? r?.comment ?? '',
    createdAt: r?.createdAt ?? r?.completedAt ?? r?.date ?? null,
  }));
};

const SubProfileScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { showConfirm, showAlert } = useAlert();

  const { profile, loading: profileLoading, getProfile } = useProfile();
  const {
    items: portfolio,
    loading: portfolioLoading,
    deletingId,
    getPortfolio,
    removePortfolioItem,
    seedPortfolioItem,
  } = useSubcontractorPortfolio();

  const refresh = useCallback(() => {
    getProfile();
    getPortfolio();
  }, [getProfile, getPortfolio]);

  // Refetch on focus so a project added on the upload screen is present when
  // that screen pops back to here.
  useFocusEffect(refresh);

  const p = profile ?? {};
  const rating = Number(p.rating ?? p.averageRating ?? p.totalRatings ?? 0);
  const reviews = mapReviews(p);

  const insuranceUrl     = firstUrl(p.insurance?.documents);
  const ticketsUrl       = firstUrl(p.tickets?.documents);
  const certificationUrl = firstUrl(p.certification?.documents);

  // The API exposes no verification flag. Holding all three compliance
  // documents is what verification means elsewhere in the app, so the tick is
  // derived from that rather than invented.
  const verified = !!insuranceUrl && !!ticketsUrl && !!certificationUrl;

  const jobSuccess = p.jobSuccessRate ?? p.jobSuccess ?? null;

  const openProject = useCallback(
    (item) => {
      // Seed the detail screen from the row so it paints immediately instead of
      // showing an empty card while its own request runs.
      seedPortfolioItem(item);
      navigation.navigate('PortfolioDetail', { portfolioId: item.id });
    },
    [navigation, seedPortfolioItem],
  );

  const confirmDelete = useCallback(
    (item) => {
      showConfirm({
        title: 'Remove Project',
        message: `Remove "${item.title}" from your portfolio? This cannot be undone.`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'error',
        onConfirm: async () => {
          try {
            await removePortfolioItem(item.id);
          } catch (err) {
            showAlert({
              title: 'Could Not Remove',
              message: typeof err === 'string' ? err : 'Please try again.',
              type: 'error',
            });
          }
        },
      });
    },
    [showConfirm, showAlert, removePortfolioItem],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Profile Overview"
        subtitle="View ratings and reviews from different hiring companies."
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={profileLoading && !!profile}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }>
        {/* CustomScrollView wraps every child in one flex View, so the spacing
            between blocks has to live on a container of our own rather than on
            the content container's gap. */}
        <View style={styles.stack}>
          {/* ── Profile card ─────────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarFrame}>
                {p.profileImage ? (
                  <Image source={{ uri: p.profileImage }} style={styles.avatar} />
                ) : (
                  <Avatar size={RFValue(90)} />
                )}
                {verified && (
                  <View style={styles.verifyBadge}>
                    <BadgeCheck
                      size={RFValue(20)}
                      color="#FFFFFF"
                      fill="#22C55E"
                      strokeWidth={2}
                    />
                  </View>
                )}
              </View>

              <Text style={styles.name} numberOfLines={1}>
                {p.fullName || 'Your name'}
              </Text>
              {!!p.email && (
                <Text style={styles.email} numberOfLines={1}>{p.email}</Text>
              )}
            </View>

            {(rating >= TOP_RATED_MIN || !!p.primaryTrade) && (
              <View style={styles.badgesRow}>
                {rating >= TOP_RATED_MIN && (
                  <View style={styles.topRatedBadge}>
                    <Text style={styles.topRatedText}>Top Rated</Text>
                    <View style={styles.badgeStars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={RFValue(7)}
                          color="#A77F46"
                          fill="#A77F46"
                          strokeWidth={0}
                        />
                      ))}
                    </View>
                  </View>
                )}
                {!!p.primaryTrade && (
                  <View style={styles.tradeBadge}>
                    <Text style={styles.tradeText}>{titleCase(p.primaryTrade)}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.statsBlock}>
              {jobSuccess != null && (
                <ProfileStatRow label="Job Success" value={`${jobSuccess}%`} />
              )}
              <ProfileStatRow
                label="Hourly Rate"
                value={p.hourlyRate != null ? `£${p.hourlyRate}/hr` : '—'}
              />
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>About</Text>
              <Text style={styles.about}>
                {p.professionalBio?.trim()
                  ? p.professionalBio
                  : 'You have not added a professional bio yet. Add one in Settings so hiring companies know what you do.'}
              </Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Certificates</Text>
              <CertificateCard
                icon={ShieldCheck}
                title="Public Liability Insurance"
                expiresAt={p.insurance?.expiresAt}
                documentUrl={insuranceUrl}
              />
              <CertificateCard
                icon={Ticket}
                title="Site Tickets"
                expiresAt={p.tickets?.expiresAt}
                documentUrl={ticketsUrl}
              />
              <CertificateCard
                icon={FileText}
                title="Trade Certifications"
                expiresAt={p.certification?.expiresAt}
                documentUrl={certificationUrl}
              />
            </View>
          </View>

          {/* ── Portfolio card ───────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.block}>
              <Text style={styles.portfolioTitle}>Portfolio &amp; Profile Ratings</Text>
              <Text style={styles.portfolioSub}>
                Portfolio and profile ratings from verified companies and clients
              </Text>
              <TouchableOpacity
                style={styles.uploadBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('UploadWork')}>
                <Plus size={RFValue(14)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.uploadBtnText}>Upload New Work</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {portfolioLoading && portfolio.length === 0 ? (
              <ActivityIndicator
                style={styles.inlineLoader}
                size="small"
                color={colors.primary}
              />
            ) : portfolio.length === 0 ? (
              <Text style={styles.emptyText}>
                You have not showcased any work yet. Upload a completed project to
                raise your profile score.
              </Text>
            ) : (
              <View style={styles.workList}>
                {portfolio.map((item) => (
                  <PortfolioWorkCard
                    key={item.id}
                    title={item.title}
                    description={item.overview}
                    photos={item.photos}
                    deleting={deletingId === item.id}
                    onPress={() => openProject(item)}
                    onDelete={() => confirmDelete(item)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ── Reviews ──────────────────────────────────────────────────── */}
          <Text style={styles.reviewsHeading}>Total Reviews</Text>
          {reviews.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>
                No reviews yet. Companies can review you once a booking is complete.
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsStack}>
              {reviews.map((r) => (
                <ReviewCard
                  key={r.key}
                  reviewerName={r.name}
                  reviewerAvatar={r.avatar}
                  rating={r.rating}
                  createdAt={r.createdAt}
                  comment={r.comment}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 140 },
  stack:   { gap: RFValue(14) },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: RFValue(15),
    gap: RFValue(14),
  },

  // Identity
  avatarSection: { alignItems: 'center', gap: 4 },
  avatarFrame: { marginBottom: RFValue(8) },
  avatar: {
    width: RFValue(90),
    height: RFValue(90),
    borderRadius: RFValue(45),
    backgroundColor: '#F1F5F9',
  },
  verifyBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: RFValue(24),
    height: RFValue(24),
    borderRadius: RFValue(12),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(17),
    color: '#2E2E2E',
  },
  email: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#545454',
  },

  // Badges
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  topRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE0B5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  topRatedText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#A77F46',
  },
  badgeStars: { flexDirection: 'row', gap: 1 },
  tradeBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tradeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
    color: '#B45309',
  },

  divider: { height: 1, backgroundColor: '#EFEFEF' },

  statsBlock: { gap: 8 },
  block: { gap: RFValue(8) },
  blockTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
  },
  about: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    lineHeight: RFValue(17),
    color: '#475569',
  },

  // Portfolio
  portfolioTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(15),
    color: '#10375C',
  },
  portfolioSub: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#545454',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10375C',
    borderRadius: 8,
    paddingVertical: RFValue(11),
    marginTop: 4,
  },
  uploadBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
  workList: { gap: RFValue(14) },
  inlineLoader: { paddingVertical: RFValue(16) },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    lineHeight: RFValue(17),
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: RFValue(6),
  },

  // Reviews
  reviewsHeading: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
    color: '#10375C',
    marginTop: RFValue(4),
  },
  reviewsStack: { gap: RFValue(12) },
});

export default SubProfileScreen;
