/**
 * PortfolioDetailScreen — one showcased project in full.
 *
 * Reached from a card on the profile screen, which seeds the slice with the row
 * it was tapped so this screen has something to draw before its own request
 * lands. The first photo is the hero; the rest fill the gallery grid, and
 * tapping any of them opens the shared AttachmentViewer.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Star, ImageOff } from 'lucide-react-native';
import { Text, ScrollView, AttachmentViewer } from '~components/Common';
import Header from '~components/Header';
import ReviewCard from '~components/Profile/ReviewCard';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import useSubcontractorPortfolio from '~hooks/useSubcontractorPortfolio';

const titleCase = (value) =>
  String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Parameter = ({ label, value }) => (
  <View style={styles.param}>
    <Text style={styles.paramLabel}>{label}</Text>
    <Text style={styles.paramValue}>{value}</Text>
  </View>
);

const PortfolioDetailScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { portfolioId } = useRoute().params ?? {};

  const { selected, selectedLoading, selectedError, getPortfolioItem, resetSelected } =
    useSubcontractorPortfolio();

  const [viewerIndex, setViewerIndex] = useState(null);

  useEffect(() => {
    if (portfolioId) getPortfolioItem(portfolioId);
  }, [portfolioId, getPortfolioItem]);

  // Clearing on unmount stops the next project opening with this one's content
  // in the moment before its request resolves.
  useEffect(() => resetSelected, [resetSelected]);

  const item = selected ?? {};
  const photos = item.photos ?? [];
  const [hero, ...gallery] = photos;

  const completion = formatDate(item.completionDate);

  // Only render parameters the project actually carries — a grid of "—" says
  // nothing and makes a sparse project look broken.
  const parameters = [
    ['Hiring Client',     item.clientName],
    ['Location',          item.location],
    ['Project Duration',  item.duration],
    ['Estimated Cost',    item.costRange],
    ['Completion Date',   completion],
    ['Compliance Status', item.compliance],
  ].filter(([, value]) => !!value);

  const openViewer = useCallback((index) => setViewerIndex(index), []);

  if (selectedLoading && !selected) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Header title="Portfolio Details" subtitle="Your showcased project." showBackButton />
        <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
      </View>
    );
  }

  if (!selected) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Header title="Portfolio Details" subtitle="Your showcased project." showBackButton />
        <View style={styles.loader}>
          <Text style={styles.emptyText}>
            {selectedError ?? 'This project could not be loaded.'}
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Portfolio Details"
        subtitle="View ratings and reviews from leading hiring companies."
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.title}>{item.title}</Text>
            {(!!item.specialty || item.rating != null) && (
              <View style={styles.metaRow}>
                {!!item.specialty && (
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{titleCase(item.specialty)}</Text>
                  </View>
                )}
                {item.rating != null && (
                  <View style={styles.ratingRow}>
                    <Star size={RFValue(12)} color="#F2A154" fill="#F2A154" strokeWidth={0} />
                    <Text style={styles.ratingValue}>
                      {Number(item.rating).toFixed(1)}
                    </Text>
                    {item.verified && <Text style={styles.verifiedText}>(Verified)</Text>}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Hero */}
          {hero ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => openViewer(0)}>
              <Image source={{ uri: hero }} style={styles.hero} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.hero, styles.heroEmpty]}>
              <ImageOff size={RFValue(24)} color="#CBD5E1" strokeWidth={1.6} />
            </View>
          )}

          {/* Scope */}
          {(!!item.overview || !!item.description) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Project Overview &amp; Scope</Text>
              {!!item.overview && <Text style={styles.body}>{item.overview}</Text>}
              {!!item.description && <Text style={styles.body}>{item.description}</Text>}
            </View>
          )}

          {/* Parameters */}
          {parameters.length > 0 && (
            <View style={styles.paramsBox}>
              <Text style={styles.paramsTitle}>Project Parameters</Text>
              <View style={styles.paramsGrid}>
                {parameters.map(([label, value]) => (
                  <Parameter key={label} label={label.toUpperCase()} value={value} />
                ))}
              </View>
            </View>
          )}

          {/* Client review */}
          {!!item.review && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verified Client Review</Text>
              <ReviewCard
                compact
                reviewerName={item.review.reviewerName ?? item.review.reviewer}
                reviewerAvatar={item.review.reviewerImage ?? null}
                rating={Number(item.review.rating ?? 0)}
                createdAt={item.review.createdAt}
                comment={item.review.comment ?? item.review.review}
              />
            </View>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gallery</Text>
                <View style={styles.galleryGrid}>
                  {gallery.map((uri, i) => (
                    <TouchableOpacity
                      key={`${uri}-${i}`}
                      style={styles.galleryCell}
                      activeOpacity={0.9}
                      onPress={() => openViewer(i + 1)}>
                      <Image source={{ uri }} style={styles.galleryImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <AttachmentViewer
        visible={viewerIndex !== null}
        items={photos}
        initialIndex={viewerIndex ?? 0}
        title={item.title}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 140 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: RFValue(14) },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: RFValue(16),
    gap: RFValue(18),
  },

  headerBlock: { gap: RFValue(10) },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(17),
    lineHeight: RFValue(24),
    color: '#10375C',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: '#FFFBEB',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9.5),
    color: '#B45309',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#2E2E2E',
  },
  verifiedText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#545454',
  },

  hero: {
    width: '100%',
    height: RFValue(170),
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  heroEmpty: { alignItems: 'center', justifyContent: 'center' },

  section: { gap: RFValue(8) },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(13),
    color: '#10375C',
  },
  body: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    lineHeight: RFValue(16),
    color: '#475569',
  },

  paramsBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    padding: RFValue(14),
    gap: RFValue(12),
  },
  paramsTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12.5),
    color: '#10375C',
  },
  paramsGrid: { gap: RFValue(10) },
  param: { gap: 2 },
  paramLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(8.5),
    color: '#545454',
  },
  paramValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#2E2E2E',
  },

  divider: { height: 1, backgroundColor: '#EFEFEF' },

  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryCell: {
    // Two per row with an 8pt gutter between them.
    width: '48.5%',
    height: RFValue(95),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
  },
  galleryImage: { width: '100%', height: '100%', backgroundColor: '#F1F5F9' },

  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11.5),
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: RFValue(30),
  },
  backBtn: {
    backgroundColor: '#10375C',
    borderRadius: 8,
    paddingHorizontal: RFValue(24),
    paddingVertical: RFValue(11),
  },
  backBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
});

export default PortfolioDetailScreen;
