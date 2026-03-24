import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import CollectionBottomSheet from '../components/CollectionBottomSheet';
import { COLORS, FONTS } from '../theme/theme';

export default function WorkDetailScreen({ route, navigation }) {
  const { itemId } = route.params;
  const insets = useSafeAreaInsets();
  const { employees, workItems, collections, removeFromWorkItem } = useContext(AppContext);

  const item = workItems.find(i => i.id === itemId);
  const [sheetEmployee, setSheetEmployee] = useState(null);

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Item not found</Text>
      </View>
    );
  }

  const isTapping = item.type === 'tapping';
  const assignedEmployees = employees.filter(e => item.assignedEmpIds.includes(e.id));

  const uncollectedEmployees = isTapping ? assignedEmployees.filter(emp => !collections.some(c => c.workItemId === item.id && c.employeeId === emp.id)) : assignedEmployees;
  const collectedEmployees = isTapping ? assignedEmployees.filter(emp => collections.some(c => c.workItemId === item.id && c.employeeId === emp.id)) : [];

  const renderEmployeeRow = (emp) => {
    const existingLog = collections.find(c => c.workItemId === item.id && c.employeeId === emp.id);
    let totalDry = 0;
    if (existingLog) {
       totalDry = (parseFloat(existingLog.drc) + parseFloat(existingLog.scrapsWeight || 0) / 2).toFixed(2);
    }

    return (
      <View key={emp.id} style={styles.assignedRow}>
        <View style={styles.assignedAvatar}>
          <Text style={styles.assignedAvatarText}>{emp.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.assignedName}>{emp.name} · {emp.id}</Text>
          {isTapping && existingLog && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.totalBoldText}>Total (Dry Rubber): {totalDry} kg</Text>
              <Text style={styles.collectedSummaryText}>
                {existingLog.drc}kg DRC (Wet {existingLog.latexWeight}kg) · {(existingLog.scrapsWeight || '0')}kg Scrap
              </Text>
            </View>
          )}
        </View>
        <View style={styles.assignedActions}>
          {isTapping && (
            existingLog ? (
              <TouchableOpacity style={styles.editBtn} onPress={() => setSheetEmployee(emp)}>
                <Feather name="edit-2" size={14} color={COLORS.primaryLight} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.addCollBtn} onPress={() => setSheetEmployee(emp)}>
                <Text style={styles.addCollText}>+ Add Coll.</Text>
              </TouchableOpacity>
            )
          )}
          <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromWorkItem(item.id, emp.id)}>
            <Feather name="x" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <Text style={styles.navTitle}>{item.id} {isTapping ? `· ${item.blockName}` : `· ${item.category}`}</Text>
        <Text style={styles.navSubtitle}>{item.estate}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {assignedEmployees.length === 0 ? (
          <View>
            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionHeader}>Assigned Workers (0)</Text>
            </View>
            <View style={styles.assignedList}>
              <Text style={styles.emptyAssigned}>{isTapping ? 'No tappers assigned yet' : 'No workers assigned yet'}</Text>
            </View>
          </View>
        ) : (
          <>
            {uncollectedEmployees.length > 0 && (
              <View>
                <View style={styles.listHeaderRow}>
                  <Text style={styles.sectionHeader}>{isTapping ? 'Pending Collection' : 'Assigned Workers'} ({uncollectedEmployees.length})</Text>
                </View>
                <View style={styles.assignedList}>
                  {uncollectedEmployees.map(renderEmployeeRow)}
                </View>
              </View>
            )}

            {collectedEmployees.length > 0 && (
              <View>
                <View style={[styles.listHeaderRow, { marginTop: uncollectedEmployees.length > 0 ? 32 : 24 }]}>
                  <Text style={styles.sectionHeader}>Collection Added ({collectedEmployees.length})</Text>
                </View>
                <View style={styles.assignedList}>
                  {collectedEmployees.map(renderEmployeeRow)}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <CollectionBottomSheet
        visible={!!sheetEmployee}
        employee={sheetEmployee}
        workItemId={item.id}
        existingLog={collections.find(c => c.workItemId === item.id && c.employeeId === sheetEmployee?.id)}
        onClose={() => setSheetEmployee(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navbar: {
    backgroundColor: COLORS.white,
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navTitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  navSubtitle: {
    fontFamily: FONTS.monoRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeader: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginRight: 10,
  },
  assignedList: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  emptyAssigned: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    padding: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  assignedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assignedAvatarText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primaryLight,
  },
  assignedName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  totalBoldText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  collectedSummaryText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  assignedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addCollBtn: {
    backgroundColor: COLORS.surfaceGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addCollText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primaryLight,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  editBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primaryLight,
  },
  removeBtn: {
    padding: 4,
  },
});
