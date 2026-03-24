import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, Animated, Dimensions
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, FONTS } from '../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72;

export default function CollectionBottomSheet({ visible, employee, workItemId, onClose }) {
  const { addCollection, showToast } = useContext(AppContext);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const [collType, setCollType] = useState('Latex (DRC)');
  const [latexWeight, setLatexWeight] = useState('');
  const [drcPercent, setDrcPercent] = useState('');
  const [scrapsWeight, setScrapsWeight] = useState('');
  const [targetDrc, setTargetDrc] = useState('4.50');

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 120,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const showLatex = collType !== 'Scraps only';
  const showScraps = collType === 'Scraps only' || collType === 'Both';

  const drcKg = showLatex
    ? (parseFloat(latexWeight) || 0) * ((parseFloat(drcPercent) || 0) / 100)
    : 0;

  const target = parseFloat(targetDrc) || 4.5;
  const incentiveAmount = drcKg > target + 0.001 ? Math.round((drcKg - target) * 12) : 0;
  const excessKg = drcKg > target + 0.001 ? (drcKg - target).toFixed(2) : 0;

  const handleSave = () => {
    if (!employee) return;
    addCollection({
      employeeId: employee.id,
      employeeName: employee.name,
      workItemId,
      type: collType,
      latexWeight: latexWeight || '0',
      drcPercent: drcPercent || '0',
      scrapsWeight: scrapsWeight || '0',
      drc: drcKg.toFixed(2),
    });
    showToast(`Collection saved — ${employee.name}`);
    // reset
    setCollType('Latex (DRC)');
    setLatexWeight('');
    setDrcPercent('');
    setScrapsWeight('');
    setTargetDrc('4.50');
    onClose();
  };

  if (!visible && slideAnim._value === SHEET_HEIGHT) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.title}>
            Collection{employee ? ` — ${employee.name}` : ''}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Type selector */}
            <Text style={styles.label}>Collection type</Text>
            <View style={styles.typeRow}>
              {['Latex (DRC)', 'Scraps only', 'Both'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, collType === t && styles.typeBtnActive]}
                  onPress={() => setCollType(t)}
                >
                  <Text style={[styles.typeBtnText, collType === t && styles.typeBtnTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {showLatex && (
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Latex weight (kg)</Text>
                  <TextInput
                    style={styles.monoInput}
                    keyboardType="decimal-pad"
                    value={latexWeight}
                    onChangeText={setLatexWeight}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>DRC %</Text>
                  <TextInput
                    style={styles.monoInput}
                    keyboardType="decimal-pad"
                    value={drcPercent}
                    onChangeText={setDrcPercent}
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>
            )}

            {showLatex && (latexWeight || drcPercent) ? (
              <Text style={styles.drcCalc}>= {drcKg.toFixed(2)} kg DRC</Text>
            ) : null}

            {showScraps && (
              <View style={styles.field}>
                <Text style={styles.label}>Scraps weight (kg)</Text>
                <TextInput
                  style={styles.monoInput}
                  keyboardType="decimal-pad"
                  value={scrapsWeight}
                  onChangeText={setScrapsWeight}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Daily target (kg DRC)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={targetDrc}
                onChangeText={setTargetDrc}
              />
            </View>

            {incentiveAmount > 0 && (
              <View style={styles.incentiveCard}>
                <Text style={styles.incentiveTitle}>
                  Exceeds target by {excessKg} kg → Incentive:
                </Text>
                <Text style={styles.incentiveAmount}>+ ₹{incentiveAmount}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  label: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  typeBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  typeBtnTextActive: {
    color: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  halfField: {
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  monoInput: {
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: FONTS.monoMedium,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  drcCalc: {
    fontFamily: FONTS.monoMedium,
    fontSize: 13,
    color: COLORS.primaryLight,
    marginBottom: 16,
    marginLeft: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: FONTS.sansRegular,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  incentiveCard: {
    backgroundColor: COLORS.surfaceGreen,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incentiveTitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.primaryLight,
    flex: 1,
    marginRight: 8,
  },
  incentiveAmount: {
    fontFamily: FONTS.sansMedium,
    fontSize: 18,
    color: COLORS.primary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.white,
  },
});
