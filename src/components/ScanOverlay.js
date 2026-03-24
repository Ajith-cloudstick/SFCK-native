import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { COLORS, FONTS } from '../theme/theme';

const LATE_CUTOFF_HOUR = 8;
const LATE_CUTOFF_MIN = 30;

export default function ScanOverlay({ visible, onClose }) {
  const { employees, markEmployee, showToast } = useContext(AppContext);
  const [manualId, setManualId] = useState('');

  const matchedEmployee = employees.find(e => e.id === manualId);

  const handleConfirm = () => {
    if (!matchedEmployee) return;

    const now = new Date();
    const isLate = now.getHours() > LATE_CUTOFF_HOUR ||
      (now.getHours() === LATE_CUTOFF_HOUR && now.getMinutes() >= LATE_CUTOFF_MIN);

    if (matchedEmployee.status === 'present') {
      markEmployee(matchedEmployee.id);
      showToast(`${matchedEmployee.name} (${matchedEmployee.id}) unmarked`);
    } else {
      markEmployee(matchedEmployee.id);
      if (isLate) {
        showToast(`${matchedEmployee.name} marked present · Late`, 'late');
      } else {
        showToast(`${matchedEmployee.name} (${matchedEmployee.id}) marked present`);
      }
    }
    onClose();
    setManualId('');
  };

  const handleClose = () => {
    setManualId('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={handleClose}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.scanArea}>
          <Feather name="camera" size={32} color={COLORS.primaryLight} />
          <Text style={styles.scanNote}>Position ID card within frame</Text>
        </View>

        <Text style={styles.manualLabel}>Or enter ID manually:</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={manualId}
          onChangeText={setManualId}
          placeholder="e.g. 3412"
          placeholderTextColor={COLORS.textSecondary}
          maxLength={4}
        />

        {matchedEmployee && (
          <View style={styles.resultCard}>
            <Text style={styles.resultName}>{matchedEmployee.name}</Text>
            <Text style={styles.resultMeta}>
              {matchedEmployee.id} · {matchedEmployee.estate} · {matchedEmployee.status}
            </Text>
            <TouchableOpacity
              style={[styles.confirmBtn, matchedEmployee.status === 'present' && styles.undoBtn]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>
                {matchedEmployee.status === 'present' ? 'Already present — undo?' : 'Mark present'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 24,
    paddingTop: 60,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 40,
  },
  backText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.primaryLight,
  },
  scanArea: {
    height: 240,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    borderStyle: 'dashed',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: COLORS.surfaceGreen,
  },
  scanNote: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.primaryLight,
    marginTop: 16,
  },
  manualLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: FONTS.monoRegular,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  resultCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.surfaceGreen,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  resultName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.primary,
    marginBottom: 4,
  },
  resultMeta: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.primaryLight,
    marginBottom: 16,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoBtn: {
    backgroundColor: COLORS.textPrimary,
  },
  confirmText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.white,
  },
});
