/**
 * SubcontractorProfileScreen
 *
 * Full-screen subcontractor profile for Company role.
 * Shows bio, compliance center, work history, and a "Book Now" / offer flow.
 */
import {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {
  Star,
  Download,
  CheckCircle2,
  XCircle,
  MapPin,
} from 'lucide-react-native';
import {
  Text,
  Button,
  AttachmentThumb,
  AttachmentViewer,
} from '~components/Common';
import Header from '~components/Header';
import {FontFamily} from '~theme/fonts';
import {useTheme} from '~context/ThemeContext';
import useCompanySubcontractors from '~hooks/useCompanySubcontractors';
import useChat from '~hooks/useChat';
import useAlert from '~hooks/useAlert';
import {openDocument} from '~utils/openDocument';

// ─── Small helpers ────────────────────────────────────────────────────────────
const StatusIcon = ({status}) => {
  if (status === 'verified')
    return (
      <CheckCircle2
        size={RFValue(14)}
        color="#22C55E"
        fill="#22C55E"
        strokeWidth={0}
      />
    );
  if (status === 'expired')
    return (
      <XCircle
        size={RFValue(14)}
        color="#EF4444"
        fill="#EF4444"
        strokeWidth={0}
      />
    );
  return (
    <CheckCircle2
      size={RFValue(14)}
      color="#F2A154"
      fill="#F2A154"
      strokeWidth={0}
    />
  );
};

const StarRow = ({rating}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', gap: 3}}>
    {Array.from({length: 5}).map((_, i) => (
      <Star key={i} size={RFValue(10)} color="#F2A154" fill="#F2A154" />
    ))}
    <Text
      style={{
        fontFamily: FontFamily.bold,
        fontSize: RFValue(11),
        color: '#F2A154',
        marginLeft: 4,
      }}>
      {rating.toFixed(1)}
    </Text>
  </View>
);

// Each row owns its busy flag so one slow document does not freeze the others.
const ComplianceRow = ({item}) => {
  const {showAlert} = useAlert();
  const [opening, setOpening] = useState(false);

  const handleDownload = useCallback(async () => {
    if (opening) return;
    setOpening(true);
    try {
      await openDocument(item.documentUrl);
    } catch (err) {
      showAlert({
        title: 'Download Failed',
        message: err?.message ?? 'Could not open this document.',
        type: 'error',
      });
    } finally {
      setOpening(false);
    }
  }, [opening, item.documentUrl, showAlert]);

  return (
    <View style={styles.complianceRow}>
      <StatusIcon status={item.status} />
      <View style={styles.complianceInfo}>
        <Text style={styles.complianceLabel}>{item.label}</Text>
        {item.date && <Text style={styles.complianceDate}>{item.date}</Text>}
      </View>
      {item.hasDocument && (
        <TouchableOpacity
          style={[styles.downloadBtn, opening && styles.downloadBtnBusy]}
          activeOpacity={0.7}
          disabled={opening}
          hitSlop={8}
          onPress={handleDownload}>
          {opening ? (
            <ActivityIndicator size="small" color="#64748B" />
          ) : (
            <Download size={RFValue(12)} color="#64748B" />
          )}
          <Text style={styles.downloadText}>
            {opening ? 'Opening…' : 'View'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ReviewerAvatar = ({name}) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <View style={styles.reviewerAvatar}>
      <Text style={styles.reviewerInitial}>{initial}</Text>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const SubcontractorProfileScreen = ({route, navigation}) => {
  const {colors} = useTheme();
  const routeSub = route?.params?.sub ?? {};
  console.log('routeSub', routeSub);
  const subcontractorId = routeSub._id ?? routeSub.id;

  const {
    profile,
    profileLoading: loading,
    getProfile,
  } = useCompanySubcontractors();
  const {rawConversations, getConversations} = useChat();

  // Index of the work example being viewed full-screen; null when closed.
  const [viewerIndex, setViewerIndex] = useState(null);

  useEffect(() => {
    getConversations();
  }, []);

  useEffect(() => {
    if (subcontractorId) getProfile(subcontractorId);
  }, [subcontractorId]);

  // Fall back to route params while the API loads so the screen isn't blank
  const sub = profile ?? routeSub;

  // `sub` is the unmapped route param until the profile request lands, so
  // normalise here as well instead of assuming the mapped shape.
  const workExamples = (Array.isArray(sub.workExamples) ? sub.workExamples : [])
    .map(w =>
      typeof w === 'string' ? w : w?.url ?? w?.uri ?? w?.image ?? null,
    )
    .filter(Boolean);

  const handleBookNow = () => {
    navigation.navigate('SendOffer', {
      subcontractorId,
      subName: sub.name ?? sub.fullName,
      subTrade: sub.trade,
      subAvatarUri: sub.avatarUri ?? sub.profileImage ?? null,
      subAbout: sub.about,
    });
  };

  const handleMessage = () => {
    const existing = rawConversations.find(
      c =>
        c.subcontractor?._id === subcontractorId ||
        c.subcontractor === subcontractorId,
    );
    if (existing) {
      navigation.navigate('CompanyChat', {conversation: existing});
    } else {
      navigation.navigate('CompanyChat', {
        subcontractorId,
        subName: sub.name ?? sub.fullName,
        subAvatarUri: sub.avatarUri ?? sub.profileImage ?? null,
      });
    }
  };

  return (
    <View style={[styles.root, {backgroundColor: colors.background}]}>
      <Header
        title="Find Subcontractors"
        subtitle="Discover and hire top-rated professionals for your project."
        showBackButton
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <Image source={{uri: sub.avatarUri}} style={styles.avatar} />
          <View style={{flex: 1}}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{sub.name}</Text>
              <View style={styles.tradePill}>
                <Text style={styles.tradePillText}>{sub.trade}</Text>
              </View>
              {sub.availability != null && (
                <View
                  style={[
                    styles.availabilityPill,
                    sub.availability
                      ? styles.availabilityOn
                      : styles.availabilityOff,
                  ]}>
                  <View
                    style={[
                      styles.availabilityDot,
                      {
                        backgroundColor: sub.availability
                          ? '#22C55E'
                          : '#94A3B8',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.availabilityText,
                      {color: sub.availability ? '#16A34A' : '#64748B'},
                    ]}>
                    {sub.availability ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <Star size={RFValue(11)} color="#F2A154" fill="#F2A154" />
              <Text style={styles.rating}>{sub.rating}</Text>
              <Text style={styles.reviews}>{sub.reviews} Reviews</Text>
            </View>
            {(sub.location || sub.yearsOfExperience != null) && (
              <View style={styles.metaRow}>
                {sub.location && (
                  <View style={styles.metaInline}>
                    <MapPin size={RFValue(11)} color="#94A3B8" />
                    <Text style={styles.stat}>{sub.location}</Text>
                  </View>
                )}
                {sub.yearsOfExperience != null && (
                  <Text style={styles.stat}>
                    {sub.yearsOfExperience}{' '}
                    {sub.yearsOfExperience === 1 ? 'year' : 'years'} experience
                  </Text>
                )}
              </View>
            )}
            <View style={styles.metaRow}>
              <Text style={styles.rateLabel}>Hourly Rate</Text>
              <Text style={styles.rateValue}>{sub.hourlyRate}</Text>
            </View>
          </View>
        </View>

        {/* CTA buttons */}
        <View style={styles.ctaRow}>
          <Button
            title="Message"
            variant="outline"
            style={{flex: 1}}
            onPress={handleMessage}
          />
          <Button
            title="Book Now"
            variant="primary"
            style={{flex: 1, backgroundColor: '#F2A154'}}
            onPress={handleBookNow}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{sub.about}</Text>
        </View>

        {/* Compliance Center */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Center</Text>
          <Text style={styles.sectionSub}>Click to view / Certifications</Text>
          {(sub.compliance ?? []).map((item, i) => (
            <ComplianceRow key={`${item.label}-${i}`} item={item} />
          ))}
        </View>
        {/* Work Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Examples</Text>
          <Text style={styles.sectionSub}>
            Photos and documents from previous jobs
          </Text>
          {workExamples.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.workExamplesRow}>
              {workExamples.map((uri, i) => (
                <AttachmentThumb
                  key={`${uri}-${i}`}
                  uri={uri}
                  size={RFValue(96)}
                  onPress={() => setViewerIndex(i)}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptySectionText}>
              This subcontractor has not added any work examples yet.
            </Text>
          )}
        </View>

        {/* Work History */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Work History</Text>
          </View>
          {(sub.workHistory ?? []).length > 0 ? (
            sub.workHistory.map((item, i) => (
              <View key={i} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={{flex: 1}}>
                    <Text style={styles.historyTitle}>{item.title}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <StarRow rating={item.rating} />
                </View>
                <Text style={styles.historyReview}>{item.review}</Text>
                <View style={styles.reviewerRow}>
                  <ReviewerAvatar name={item.reviewer} />
                  <Text style={styles.historyReviewer}>
                    Review by {item.reviewer}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHistoryText}>
              There is no work history for this subcontractor.
            </Text>
          )}
        </View>
      </ScrollView>

      <AttachmentViewer
        visible={viewerIndex !== null}
        items={workExamples}
        initialIndex={viewerIndex ?? 0}
        title="Work Examples"
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {flex: 1},
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {padding: 16, paddingBottom: 40},
  profileCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: RFValue(52),
    height: RFValue(52),
    borderRadius: RFValue(26),
    backgroundColor: '#F1F5F9',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    color: '#10375C',
    flexShrink: 1,
  },
  tradePill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
    flexShrink: 0,
  },
  tradePillText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#10375C',
    textTransform: 'capitalize',
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
    flexShrink: 0,
  },
  availabilityOn: {backgroundColor: '#F0FDF4'},
  availabilityOff: {backgroundColor: '#F1F5F9'},
  availabilityDot: {width: 6, height: 6, borderRadius: 3},
  availabilityText: {fontFamily: FontFamily.semiBold, fontSize: RFValue(9)},
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
  },
  rating: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  reviews: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  stat: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  rateLabel: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  rateValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
  },
  ctaRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionSub: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
    marginBottom: 10,
  },
  viewAll: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
    color: '#F2A154',
  },
  workExamplesRow: {
    gap: 10,
    paddingVertical: 2,
  },
  emptySectionText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 16,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#64748B',
    lineHeight: RFValue(17),
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  complianceInfo: {flex: 1, marginHorizontal: 10},
  complianceLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#1E293B',
  },
  complianceDate: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  // Fixed width keeps the row from shifting when the label swaps to "Opening…".
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minWidth: RFValue(78),
  },
  downloadBtnBusy: {opacity: 0.6},
  downloadText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#64748B',
  },
  historyCard: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 2,
  },
  historyDate: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  historyReview: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
    lineHeight: RFValue(15),
    marginBottom: 12,
  },
  reviewerRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  reviewerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#64748B',
  },
  historyReviewer: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#64748B',
  },
  emptyHistoryText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default SubcontractorProfileScreen;
