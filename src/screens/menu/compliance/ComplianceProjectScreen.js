import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Folder, Settings, Share2, MapPin, File, Eye, Trash2 } from 'lucide-react-native';
import UploadField from '~components/Common/UploadField';
import ShareComplianceModal from './components/ShareComplianceModal';

const TABS = ['RAMS', 'Permits', 'Reports', 'Incidents', 'Drawings'];

const FILES = [
  { id: 1, name: 'Rams.pdf', date: 'Oct 24, 2023', size: '2.4 MB' },
  { id: 2, name: 'document_1.pdf', date: 'Oct 24, 2023', size: '2.4 MB' },
  { id: 3, name: 'README.rm', date: 'Oct 24, 2023', size: '2.4 MB' },
  { id: 4, name: 'Sheet 1.xls', date: 'Oct 24, 2023', size: '2.4 MB' },
  { id: 5, name: 'Scann_158.pdf', date: 'Oct 24, 2023', size: '2.4 MB' },
];

const ComplianceProjectScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  // Safe extraction of params (defaulting if navigating raw)
  const { name = 'Downtown Office Renovation' } = route.params || {};

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Compliance Centre"
        subtitle="Manage safety documents, permits, and regulatory requirements according to jobs"
        showBackButton
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Project Card Header */}
        <View style={styles.projectHeaderCard}>
          <View style={styles.projectHeaderTop}>
            <View style={styles.projectHeaderLeft}>
              <View style={styles.folderIconWrap}>
                <Folder size={18} color="#FFFFFF" fill="#10375C" strokeWidth={1} style={{ color: '#10375C' }}/>
              </View>
              <View>
                <Text style={styles.projectName}>{name}</Text>
                <View style={styles.projectAddressRow}>
                  <MapPin size={RFValue(9)} color="#F2A154" />
                  <Text style={styles.projectAddressText}>123 Market St, Downtown</Text>
                </View>
              </View>
            </View>

            <View style={styles.projectHeaderActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Settings size={RFValue(14)} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F2A154', borderColor: '#F2A154' }]} onPress={() => setModalVisible(true)}>
                <Share2 size={RFValue(14)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Budget Block */}
          <View style={styles.budgetBlock}>
            <View style={styles.budgetInnerBlock}>
            <View style={styles.budgetCol}>
              <Text style={styles.budgetLabel}>TOTAL BUDGET</Text>
              <Text style={[styles.budgetValue, { color: '#FFFFFF' }]}>$45,000</Text>
            </View>
            <View style={{borderLeftWidth: 1, borderColor: '#FFFFFF1A'}} />
            <View style={styles.budgetCol}>
              <Text style={styles.budgetLabel}>CURRENT SPEND</Text>
              <Text style={[styles.budgetValue, { color: '#F2A154' }]}>$28,400</Text>
            </View>
            <View style={{borderLeftWidth: 1, borderColor: '#FFFFFF1A'}} />
            <View style={styles.budgetCol}>
              <Text style={styles.budgetLabel}>AVAILABLE FUNDS</Text>
              <Text style={[styles.budgetValue, { color: '#22C55E' }]}>$16,600</Text>
            </View>
          </View></View>
        </View>

        {/* Horizontal Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsContainer}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {TABS.map(tab => {
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
            )
          })}
        </ScrollView>

        <View style={styles.uploadSection}>
          <UploadField 
            instructions="Upload Document"
            hint="Drag and drop your RAMS, Permits or Safety Plans here"
            style={styles.uploadFieldCustom}
          />
        </View>

        <View style={styles.filesSection}>
          <Text style={styles.filesTitle}>Attached Files</Text>
          <Text style={styles.filesSubtitle}>Here you can explore the uploaded files</Text>

          <View style={styles.filesList}>
            {FILES.map((f, idx) => (
              <View key={idx} style={styles.fileCard}>
                <View style={styles.fileLeft}>
                  <View style={styles.fileIconWrap}>
                     <File size={RFValue(16)} color="#10375C" />
                  </View>
                  <View>
                    <Text style={styles.fileName}>{f.name}</Text>
                    <View style={styles.fileMetaRow}>
                      <Text style={styles.fileMetaText}>⏱ {f.date}</Text>
                      <Text style={styles.fileMetaText}>📦 {f.size}</Text>
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
        </View>

      </ScrollView>

      {/* Sharing Modal */}
      <ShareComplianceModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120, // space for tab bar
  },
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
    marginBottom: 16,
  },
  projectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
  budgetBlock: {
    backgroundColor: '#10375C',
    borderRadius: 8,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  budgetInnerBlock: {backgroundColor: '#FFFFFF0D', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, flexDirection: 'row', justifyContent:'space-between', width: '100%', borderWidth: 1, borderColor: '#FFFFFF1A'},
  budgetCol: {},
  budgetLabel: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(8),
    color: '#94A3B8',
    marginBottom: 2,
  },
  budgetValue: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
  },
  tabsContainer: {
    flexGrow: 0,
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginRight: 10,
  },
  tabButtonActive: {
    backgroundColor: '#10375C',
    borderColor: '#10375C',
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadFieldCustom: {
    marginBottom: 0,
  },
  filesSection: {},
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
  filesList: {
    gap: 8,
  },
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
  },
  fileIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9', // light gray
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
  iconBtn: {
    padding: 2,
  },
});

export default ComplianceProjectScreen;
