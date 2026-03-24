import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme/theme';

export default function EmployeeRow({ employee, onToggleStatus }) {
  const isPresent = employee.status === 'present';

  const avatarBg = isPresent ? COLORS.primaryLight : COLORS.surfaceGreen;
  const avatarColor = isPresent ? COLORS.white : COLORS.primaryLight;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onToggleStatus(employee.id)} activeOpacity={0.8}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>{employee.initials}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{employee.name}</Text>
          {employee.isLate && (
            <View style={styles.lateBadge}>
              <Text style={styles.lateText}>Late</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta}>{employee.id} · {employee.estate}</Text>
      </View>

      <TouchableOpacity
        style={[styles.actionBtn, isPresent ? styles.btnFilled : styles.btnOutline]}
        onPress={() => onToggleStatus(employee.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isPresent ? (
          <Feather name="check" size={16} color={COLORS.white} />
        ) : (
          <Text style={styles.btnText}>Mark</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  lateBadge: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  lateText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 10,
    color: COLORS.warning,
  },
  meta: {
    fontFamily: FONTS.monoRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionBtn: {
    height: 32,
    minWidth: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  btnFilled: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 0,
  },
  btnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
});
