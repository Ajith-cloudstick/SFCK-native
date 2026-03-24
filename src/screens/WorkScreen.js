import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import Header from '../components/Header';
import WorkItemCard from '../components/WorkItemCard';
import { ESTATES } from '../data/mockData';
import { COLORS, FONTS } from '../theme/theme';

export default function WorkScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { employees, workItems, collections, supervisorEstate, assignToWorkItem, removeFromWorkItem, changeEmployeeEstate } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('unassigned');
  const [transferEmployee, setTransferEmployee] = useState(null);
  const [assignEmployee, setAssignEmployee] = useState(null);

  const presentEmployees = useMemo(
    () => employees.filter(e => e.status === 'present'),
    [employees]
  );

  const unassignedEmployees = useMemo(
    () => presentEmployees.filter(e => 
      e.estate === supervisorEstate &&
      !workItems.some(item => item.assignedEmpIds.includes(e.id))
    ),
    [presentEmployees, workItems, supervisorEstate]
  );

  // Show all work items (supervisor can see cross-posted ones too)
  const tappingItems = workItems.filter(i => i.type === 'tapping');
  const generalItems = workItems.filter(i => i.type === 'general');

  return (
    <View style={styles.container}>
      <Header />
      
      {/* Two-part UI Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'unassigned' && styles.tabBtnActive]} onPress={() => setActiveTab('unassigned')}>
          <Text style={[styles.tabText, activeTab === 'unassigned' && styles.tabTextActive]}>Unassigned ({unassignedEmployees.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'assignments' && styles.tabBtnActive]} onPress={() => setActiveTab('assignments')}>
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.tabTextActive]}>Assignments</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'unassigned' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
          {unassignedEmployees.length === 0 ? (
            <Text style={styles.emptyText}>No unassigned employees for {supervisorEstate || 'this estate'}.</Text>
          ) : (
            unassignedEmployees.map(emp => (
              <View key={emp.id} style={styles.employeeCard}>
                <View style={styles.empAvatar}><Text style={styles.empAvatarText}>{emp.initials}</Text></View>
                <View style={styles.empInfo}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empId}>{emp.id}</Text>
                </View>
                <View style={styles.empActions}>
                  <TouchableOpacity style={styles.btnAssign} onPress={() => setAssignEmployee(emp)}>
                    <Text style={styles.btnTextAssign}>Assign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnTransfer} onPress={() => setTransferEmployee(emp)}>
                    <Text style={styles.btnTextTransfer}>Transfer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 40 }}>
          {/* Tapping blocks section */}
          {tappingItems.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>TAPPING BLOCKS</Text>
              {tappingItems.map(item => (
                <WorkItemCard
                  key={item.id}
                  item={item}
                  onPress={(id) => navigation.navigate('WorkDetail', { itemId: id })}
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
                  onPress={(id) => navigation.navigate('WorkDetail', { itemId: id })}
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
      )}

      {/* Transfer Modal */}
      <Modal visible={!!transferEmployee} transparent animationType="fade" onRequestClose={() => setTransferEmployee(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTransferEmployee(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transfer {transferEmployee?.name}</Text>
            <Text style={styles.modalSub}>Select a new estate</Text>
            {ESTATES.map(estate => (
              <TouchableOpacity
                key={estate.id}
                style={styles.estateOption}
                onPress={() => {
                  changeEmployeeEstate(transferEmployee.id, estate.id);
                  setTransferEmployee(null);
                }}
              >
                <Text style={styles.estateOptionText}>{estate.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setTransferEmployee(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Assign Modal */}
      <Modal visible={!!assignEmployee} transparent animationType="fade" onRequestClose={() => setAssignEmployee(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAssignEmployee(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign {assignEmployee?.name}</Text>
            <Text style={styles.modalSub}>Select work block</Text>
            <ScrollView style={{maxHeight: 300}}>
              {workItems.filter(i => i.estate === supervisorEstate).map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.estateOption}
                  onPress={() => {
                    assignToWorkItem(item.id, assignEmployee.id);
                    setAssignEmployee(null);
                  }}
                >
                  <Text style={styles.estateOptionText}>{item.id} - {item.type === 'tapping' ? item.blockName : item.category}</Text>
                  <Text style={styles.estateCurrent}>{item.type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setAssignEmployee(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primaryLight,
  },
  tabText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryLight,
  },
  emptyText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  empAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  empAvatarText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.primaryLight,
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  empId: {
    fontFamily: FONTS.monoRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  empActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAssign: {
    backgroundColor: COLORS.surfaceGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnTextAssign: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primaryLight,
  },
  btnTransfer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnTextTransfer: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  estateOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estateOptionText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  estateCurrent: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  modalCancel: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.warning,
  },
});
