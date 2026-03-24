import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, FONTS } from '../theme/theme';

export default function CollectionBottomSheet({ visible, employee, workItemId, existingLog, onClose }) {
  const { addCollection, showToast } = useContext(AppContext);

  const [latexWeight, setLatexWeight] = useState('');
  const [drcPercent, setDrcPercent] = useState('36');
  const [scrapsWeight, setScrapsWeight] = useState('');

  useEffect(() => {
    if (visible) {
      if (existingLog) {
         setLatexWeight(existingLog.latexWeight || '');
         setDrcPercent(existingLog.drcPercent || '36');
         setScrapsWeight(existingLog.scrapsWeight?.toString() || '');
      } else {
         setLatexWeight('');
         setDrcPercent('36');
         setScrapsWeight('');
      }
    }
  }, [visible, existingLog]);

  const numWet = parseFloat(latexWeight) || 0;
  const numDrcPct = parseFloat(drcPercent) || 0;
  const drcKg = numWet * (numDrcPct / 100);
  
  const numScrap = parseFloat(scrapsWeight) || 0;
  const totalDry = drcKg + (numScrap / 2);

  const handleSave = () => {
    if (!employee) return;
    addCollection({
      employeeId: employee.id,
      employeeName: employee.name,
      workItemId,
      type: 'Both',
      latexWeight: latexWeight || '0',
      drcPercent: drcPercent || '0',
      scrapsWeight: scrapsWeight || '0',
      drc: drcKg.toFixed(2),
    });
    showToast(`Collection ${existingLog ? 'updated' : 'saved'} — ${employee.name}`);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.backdrop} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}/>
        
        <View style={styles.modalBox}>
          
          <View style={styles.header}>
            <Text style={styles.title}>
              {employee ? employee.name : 'Collection'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
               <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled" 
          >
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Wet Weight (kg)</Text>
                <TextInput
                  style={styles.formalInput}
                  keyboardType="decimal-pad"
                  value={latexWeight}
                  onChangeText={setLatexWeight}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DRC (%)</Text>
                <TextInput
                  style={styles.formalInput}
                  keyboardType="decimal-pad"
                  value={drcPercent}
                  onChangeText={setDrcPercent}
                  placeholder="36"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={styles.calcRow}>
               <Text style={styles.calcLabel}>Calculated DRC:</Text>
               <Text style={styles.calcValue}>{drcKg.toFixed(2)} kg</Text>
            </View>

            <View style={styles.inputGroupFull}>
              <Text style={styles.label}>Scrap Weight (kg)</Text>
              <TextInput
                style={styles.formalInput}
                keyboardType="decimal-pad"
                value={scrapsWeight}
                onChangeText={setScrapsWeight}
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.inputGroupFull}>
              <Text style={styles.label}>Total Dry Rubber (kg)</Text>
              <TextInput
                style={[styles.formalInput, styles.disabledInput]}
                value={totalDry.toFixed(2)}
                editable={false}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
              <Text style={styles.saveBtnText}>{existingLog ? 'Update Collection' : 'Save Collection'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: FONTS.sansMedium,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontFamily: FONTS.monoMedium,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupFull: {
    marginBottom: 16,
  },
  label: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  formalInput: {
    fontFamily: FONTS.monoMedium,
    fontSize: 18,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceGreen,
    borderRadius: 8,
  },
  calcLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.primaryLight,
  },
  calcValue: {
    fontFamily: FONTS.monoMedium,
    fontSize: 15,
    color: COLORS.primary,
  },
  disabledInput: {
    backgroundColor: COLORS.background,
    color: COLORS.primary,
    fontFamily: FONTS.monoMedium,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.white,
  },
});
