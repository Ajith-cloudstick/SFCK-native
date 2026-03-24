import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../theme/theme';

export default function WorkItemCard({ item, allEmployees, onPress }) {
  const isTapping = item.type === 'tapping';
  const assignedCount = item.assignedEmpIds.length;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onPress(item.id)}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.blockId}>{item.id}</Text>
          <Text style={styles.blockMeta}>
            {isTapping ? ` · ${item.blockName}` : ` · ${item.category}`}
          </Text>
        </View>
        <View style={styles.headerBadges}>

          <View style={[styles.statusBadge, assignedCount > 0 && styles.statusBadgeAssigned]}>
            <Text style={[styles.statusText, assignedCount > 0 && styles.statusTextAssigned]}>
              {assignedCount > 0 ? `${assignedCount} Assigned` : ''}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.subMeta}>
        {isTapping ? `${item.estate} · ${item.trees} trees` : item.estate}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5ff",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  blockId: {
    fontFamily: FONTS.monoMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  blockMeta: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  crossBadge: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  crossText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 9,
    color: COLORS.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 3,

  },
  statusBadgeAssigned: {

  },
  statusText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  statusTextAssigned: {
    color: COLORS.primaryLight,
  },
  subMeta: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
