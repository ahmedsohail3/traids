import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Folder, Settings, Share2, MapPin, File, Eye, Trash2, Calendar } from 'lucide-react-native';
import UploadField from '~components/Common/UploadField';
import ShareComplianceModal from './components/ShareComplianceModal';
import useCompanyCompliance from '~hooks/useCompanyCompliance';

const TABS = ['RAMS', 'Permits', 'Reports', 'Incidents', 'Drawings'];

const TAB_KEY = {
  RAMS:      'RAMS',
  Permits:   'permits',
  Reports:   'reports',
  Incidents: 'incidents',
  Drawings:  'drawings',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const STATUS_COLORS = {
  active:     { bg: '#DCFCE7', text: '#16A34A' },
  completed:  { bg: '#F1F5F9', text: '#64748B' },
  pending:    { bg: '#FEF9C3', text: '#CA8A04' },
  cancelled:  { bg: '#FEE2E2', text: '#DC2626' },
};

const statusStyle = (status) =>
  STATUS_COLORS[status?.toLowerCase()] ?? { bg: '#F1F5F9', text: '#64748B' };

const ComplianceProjectScreen = ({ route }) => {
  const { colors } = useTheme();
  const { record } = route.params ?? {};

  const {
    selectedCompliance,
    loadingDetails,
    getComplianceByProjectId,
    resetSelectedCompliance,
  } = useCompanyCompliance();

  const [activeTab,    setActiveTab]    = useState(TABS[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const projectId = record?.project?._id;

  useEffect(() => {
    if (projectId) getComplianceByProjectId(projectId);
    return () => { resetSelectedCompliance(); };
  }, [projectId]);

  // Use fetched data; fall back to route record while loading
  const compliance = selectedCompliance ?? record;
  const project    = compliance?.project ?? {};

  const name     = project.jobTitle   ?? record?.name     ?? '—';
  const location = project.siteAddress ?? record?.location ?? '—';
  const trade    = project.trade       ?? '—';
  const status   = project.status      ?? '—';
  const start    = project.timelineStartDate;
  const end      = project.timelineEndDate;

  const activeFiles = useMemo(() => {
    if (!compliance) return [];
    const key = TAB_KEY[activeTab];
    return Array.isArray(compliance[key]) ? compliance[key] : [];
  }, [compliance, activeTab]);

  const st = statusStyle(status);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Compliance Centre"
        subtitle="Manage safety documents, permits, and regulatory requirements according to jobs"
        showBackButton
      />

      {loadingDetails && !selectedCompliance && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Project Card Header */}
        <View style={styles.projectHeaderCard}>
          <View style={styles.projectHeaderTop}>
            <View style={styles.projectHeaderLeft}>
              <View style={styles.folderIconWrap}>
                <Folder size={18} color="#FFFFFF" fill="#10375C" strokeWidth={1} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.projectName} numberOfLines={1}>{name}</Text>
                <View style={styles.projectAddressRow}>
                  <MapPin size={RFValue(9)} color="#F2A154" />
                  <Text style={styles.projectAddressText} numberOfLines={1}>{location}</Text>
                </View>
              </View>
            </View>

            <View style={styles.projectHeaderActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Settings size={RFValue(14)} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#F2A154', borderColor: '#F2A154' }]}
                onPress={() => setModalVisible(true)}
              >
                <Share2 size={RFValue(14)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Trade + Status row */}
          <View style={styles.metaRow}>
            {trade !== '—' && (
              <View style={styles.tradeBadge}>
                <Text style={styles.tradeText}>{trade}</Text>
              </View>
            )}
            {status !== '—' && (
              <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                <Text style={[styles.statusText, { color: st.text }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Timeline */}
          {(start || end) && (
            <View style={styles.timelineRow}>
              <Calendar size={RFValue(10)} color="#94A3B8" />
              <Text style={styles.timelineText}>
                {formatDate(start)} – {formatDate(end)}
              </Text>
            </View>
          )}

        </View>

        {/* Horizontal Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.uploadSection}>
          <UploadField
            instructions="Upload Document"
            hint="Drag and drop your RAMS, Permits or Safety Plans here"
            style={styles.uploadFieldCustom}
          />
        </View>

        {/* File list for active tab */}
        <View style={styles.filesSection}>
          <Text style={styles.filesTitle}>Attached Files</Text>
          <Text style={styles.filesSubtitle}>Here you can explore the uploaded files</Text>

          {activeFiles.length === 0 ? (
            <View style={styles.emptyFiles}>
              <File size={RFValue(28)} color="#CBD5E1" />
              <Text style={styles.emptyFilesText}>No {activeTab} documents uploaded yet.</Text>
            </View>
          ) : (
            <View style={styles.filesList}>
              {activeFiles.map((f, idx) => (
                <View key={f._id ?? idx} style={styles.fileCard}>
                  <View style={styles.fileLeft}>
                    <View style={styles.fileIconWrap}>
                      <File size={RFValue(16)} color="#10375C" />
                    </View>
                    <View>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {f.name ?? f.fileName ?? f.originalName ?? activeTab}
                      </Text>
                      <View style={styles.fileMetaRow}>
                        {f.uploadedAt && <Text style={styles.fileMetaText}>
                          {f.uploadedAt ? formatDate(f.uploadedAt) : f.date ?? '—'}
                        </Text>}
                        {f.size != null && (
                          <Text style={styles.fileMetaText}>{f.size}</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.fileActions}>
                    <TouchableOpacity style={styles.iconBtn}>
                      <Eye size={RFValue(14)} color="#94A3B8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                      <Trash2 size={RFValue(14)} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ShareComplianceModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:            { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  scrollContainer:  { padding: 16, paddingBottom: 120 },
  projectHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  projectHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  projectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  folderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 4,
  },
  projectAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectAddressText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  projectHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tradeBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tradeText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#3B82F6',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  timelineText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  tabsContainer:    { flexGrow: 0, marginBottom: 20 },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginRight: 10,
  },
  tabButtonActive:  { backgroundColor: '#10375C', borderColor: '#10375C' },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#64748B',
  },
  tabTextActive:    { color: '#FFFFFF' },
  uploadSection:    { marginBottom: 24 },
  uploadFieldCustom:{ marginBottom: 0 },
  filesSection:     {},
  filesTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    marginBottom: 2,
  },
  filesSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
    marginBottom: 16,
  },
  emptyFiles: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyFilesText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  filesList:        { gap: 8 },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fileIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#10375C',
    marginBottom: 4,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileMetaText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9),
    color: '#94A3B8',
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: { padding: 2 },
});

export default ComplianceProjectScreen;
