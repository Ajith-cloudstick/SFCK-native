import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CollectionBottomSheet from './CollectionBottomSheet';
import { COLORS, FONTS } from '../theme/theme';

export default function WorkItemCard({ item, allEmployees, presentEmployees, collections, onAssign, onRemove }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetEmployee, setSheetEmployee] = useState(null);

  // Which employees are currently assigned
  const assignedEmployees = allEmployees.filter(e => item.assignedEmpIds.includes(e.id));

  // Search results for the add-employee mini-search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return presentEmployees
      .filter(e =>
        !item.assignedEmpIds.includes(e.id) &&
        (e.name.toLowerCase().includes(q) || e.id.includes(q))
      )
      .slice(0, 5);
  }, [searchQuery, presentEmployees, item.assignedEmpIds]);

  // Check if the employee has a collection entry for this item
  const hasCollection = (empId) =>
    collections.some(c => c.workItemId === item.id && c.employeeId === empId);

  const isTapping = item.type === 'tapping';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.blockId}>{item.id}</Text>
          <Text style={styles.blockMeta}>
            {isTapping ? ` · ${item.blockName}` : ` · ${item.category}`}
          </Text>
        </View>
        <View style={styles.headerBadges}>
          {item.isCrossPosted && (
            <View style={styles.crossBadge}>
              <Text style={styles.crossText}>Cross-posted</Text>
            </View>
          )}
          <View style={[styles.statusBadge, assignedEmployees.length > 0 && styles.statusBadgeAssigned]}>
            <Text style={[styles.statusText, assignedEmployees.length > 0 && styles.statusTextAssigned]}>
              {assignedEmployees.length > 0 ? 'Assigned' : 'Scheduled'}
            </Text>
          </View>
        </View>
      </View>

      {/* Sub-header */}
      <Text style={styles.subMeta}>
        {isTapping ? `${item.estate} · ${item.trees} trees` : item.estate}
      </Text>

      {/* Assigned employees */}
      {assignedEmployees.length === 0 ? (
        <Text style={styles.emptyAssigned}>
          {isTapping ? 'No tappers assigned yet' : 'No workers assigned yet'}
        </Text>
      ) : (
        assignedEmployees.map(emp => (
          <View key={emp.id} style={styles.assignedRow}>
            <View style={styles.assignedAvatar}>
              <Text style={styles.assignedAvatarText}>{emp.initials}</Text>
            </View>
            <Text style={styles.assignedName}>{emp.name} · {emp.id}</Text>
            <View style={styles.assignedActions}>
              {isTapping && (
                hasCollection(emp.id) ? (
                  <View style={styles.collectedBadge}>
                    <Text style={styles.collectedText}>✓ Collected</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addCollBtn}
                    onPress={() => setSheetEmployee(emp)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addCollText}>+ Add</Text>
                  </TouchableOpacity>
                )
              )}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(item.id, emp.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Add employee search */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={isTapping ? 'Add tapper by name/ID' : 'Add worker by name/ID'}
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map(emp => (
            <TouchableOpacity
              key={emp.id}
              style={styles.searchResultRow}
              onPress={() => {
                onAssign(item.id, emp.id);
                setSearchQuery('');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.searchResultName}>{emp.name}</Text>
              <Text style={styles.searchResultMeta}>{emp.id} · {emp.estate}</Text>
              <View style={styles.addBtn}>
                <Feather name="plus" size={14} color={COLORS.primaryLight} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Collection bottom sheet */}
      <CollectionBottomSheet
        visible={!!sheetEmployee}
        employee={sheetEmployee}
        workItemId={item.id}
        onClose={() => setSheetEmployee(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.background,
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBadgeAssigned: {
    backgroundColor: COLORS.surfaceGreen,
    borderColor: COLORS.primaryLight,
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
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  emptyAssigned: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    padding: 14,
    fontStyle: 'italic',
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  assignedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  assignedAvatarText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.primaryLight,
  },
  assignedName: {
    flex: 1,
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  assignedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCollBtn: {
    backgroundColor: COLORS.surfaceGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addCollText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primaryLight,
  },
  collectedBadge: {
    backgroundColor: COLORS.surfaceGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  collectedText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.primaryLight,
  },
  removeBtn: {
    padding: 4,
  },
  addRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    height: 38,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  searchResults: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  searchResultName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
    flex: 1,
  },
  searchResultMeta: {
    fontFamily: FONTS.monoRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginRight: 10,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
