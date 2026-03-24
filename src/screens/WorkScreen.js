import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import Header from '../components/Header';
import WorkItemCard from '../components/WorkItemCard';
import { COLORS, FONTS } from '../theme/theme';

export default function WorkScreen() {
  const insets = useSafeAreaInsets();
  const { employees, workItems, collections, supervisorEstate, assignToWorkItem, removeFromWorkItem } = useContext(AppContext);

  const presentEmployees = useMemo(
    () => employees.filter(e => e.status === 'present'),
    [employees]
  );

  // Show all work items (supervisor can see cross-posted ones too)
  const tappingItems = workItems.filter(i => i.type === 'tapping');
  const generalItems = workItems.filter(i => i.type === 'general');

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 40 }}>
        {/* Tapping blocks section */}
        {tappingItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>TAPPING BLOCKS</Text>
            {tappingItems.map(item => (
              <WorkItemCard
                key={item.id}
                item={item}
                allEmployees={employees}
                presentEmployees={presentEmployees}
                collections={collections}
                onAssign={assignToWorkItem}
                onRemove={removeFromWorkItem}
              />
            ))}
          </>
        )}

        {/* General work section */}
        {generalItems.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>GENERAL WORK</Text>
            {generalItems.map(item => (
              <WorkItemCard
                key={item.id}
                item={item}
                allEmployees={employees}
                presentEmployees={presentEmployees}
                collections={collections}
                onAssign={assignToWorkItem}
                onRemove={removeFromWorkItem}
              />
            ))}
          </>
        )}

        {/* Today's collection summary */}
        {collections.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Today's collection summary</Text>
            {collections.map(col => (
              <View key={col.id} style={styles.summaryItem}>
                <Text style={styles.summaryName}>{col.employeeName}</Text>
                <View style={styles.summaryValues}>
                  {col.type !== 'Scraps only' && (
                    <Text style={styles.summaryMono}>{col.drc} kg DRC</Text>
                  )}
                  {(col.type === 'Scraps only' || col.type === 'Both') && (
                    <Text style={styles.summaryMono}>{col.scrapsWeight} kg Scrap</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  summarySection: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
  },
  summaryTitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  summaryName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
    flex: 1,
  },
  summaryValues: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryMono: {
    fontFamily: FONTS.monoRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
