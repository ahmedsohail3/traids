import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { AlertCircle } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const UnpaidInvoiceBanner = () => {
  return (
    <View style={styles.container}>
      <AlertCircle size={RFValue(16)} color="#EA580C" style={styles.icon} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>Unpaid Invoice Detected</Text>
        <Text style={styles.subtitle}>
          You won't be able to post new jobs until all pending invoices are settled.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB', // light orange bg
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  icon: { marginRight: 12, marginTop: 2 },
  textWrap: { flex: 1 },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#C2410C',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#9A3412',
    lineHeight: RFValue(15),
  },
});

export default UnpaidInvoiceBanner;
