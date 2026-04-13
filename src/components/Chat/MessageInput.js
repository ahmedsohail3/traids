/**
 * MessageInput — shared bottom input bar for chat screens.
 */
import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { Paperclip, Send } from 'lucide-react-native';

const MessageInput = ({ value, onChangeText, onSend, onAttach }) => (
  <View style={styles.container}>
    <View style={styles.inputContainer}>
    <TouchableOpacity style={styles.attachBtn} onPress={onAttach}>
      <Paperclip size={RFValue(14)} color="#10375C" />
    </TouchableOpacity>

    <TextInput
      style={styles.input}
      placeholder="Type here..."
      placeholderTextColor="#10375C"
      value={value}
      onChangeText={onChangeText}
      multiline
    />

    <TouchableOpacity
      style={[styles.sendBtn, value?.trim() && styles.sendBtnActive]}
      onPress={onSend}
    >
      <Send size={RFValue(15)} color={'#FFFFFF'} />
    </TouchableOpacity></View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attachBtn: {
    width: 36, height: 36, 
    alignItems: 'center', justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: '#94A3B8',
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    paddingRight: 14,
    paddingVertical: 8,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2E2E2E',
  },
  sendBtnActive: {
    backgroundColor: '#10375C',
    borderColor: '#10375C',
  },
});

export default MessageInput;
