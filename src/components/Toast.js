import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, FONTS } from '../theme/theme';

export default function Toast() {
  const { toastMessage, toastType } = useContext(AppContext);

  if (!toastMessage) return null;

  const isLate = toastType === 'late';

  return (
    <View style={styles.container}>
      <View style={[styles.pill, isLate && styles.pillLate]}>
        <Text style={[styles.text, isLate && styles.textLate]}>{toastMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  pill: {
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pillLate: {
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  text: {
    color: COLORS.white,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  textLate: {
    color: COLORS.warning,
  },
});
