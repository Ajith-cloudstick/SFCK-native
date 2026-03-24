import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import EmployeeRow from '../components/EmployeeRow';
import Header from '../components/Header';
import ScanOverlay from '../components/ScanOverlay';
import { COLORS, FONTS } from '../theme/theme';

const FILTER_MY = 'my';
const FILTER_ALL = 'all';

export default function AttendanceScreen() {
  const { employees, markEmployee, showToast, supervisorEstate } = useContext(AppContext);
  const [estateFilter, setEstateFilter] = useState(FILTER_MY);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanVisible, setScanVisible] = useState(false);

  const handleMark = (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;
    const isLateNow = markEmployee(empId);
    if (emp.status === 'present') {
      showToast(`${emp.name} (${emp.id}) unmarked`);
    } else if (isLateNow) {
      showToast(`${emp.name} marked present · Late`, 'late');
    } else {
      showToast(`${emp.name} (${emp.id}) marked present`);
    }
  };

  const visibleEmployees = useMemo(() => {
    let list = employees;
    if (estateFilter === FILTER_MY && supervisorEstate) {
      list = list.filter(e => e.estate === supervisorEstate);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) || e.id.includes(q)
      );
    }
    return list.slice(0, 80);
  }, [employees, estateFilter, searchQuery, supervisorEstate]);

  const baseList = estateFilter === FILTER_MY && supervisorEstate
    ? employees.filter(e => e.estate === supervisorEstate)
    : employees;

  const presentCount = baseList.filter(e => e.status === 'present').length;
  const lateCount = baseList.filter(e => e.isLate).length;

  return (
    <View style={styles.container}>
      <Header />

      {/* Search row (inside this screen only) */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={() => setScanVisible(true)} activeOpacity={0.9}>
          <Feather name="maximize" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Secondary estate filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, estateFilter === FILTER_MY && styles.filterPillActive]}
          onPress={() => setEstateFilter(FILTER_MY)}
        >
          <Text style={[styles.filterPillText, estateFilter === FILTER_MY && styles.filterPillTextActive]}>
            My estate {estateFilter === FILTER_MY ? '✓' : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, estateFilter === FILTER_ALL && styles.filterPillActive]}
          onPress={() => setEstateFilter(FILTER_ALL)}
        >
          <Text style={[styles.filterPillText, estateFilter === FILTER_ALL && styles.filterPillTextActive]}>
            All estates
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Present</Text>
          <Text style={styles.presentNum}>{presentCount}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Late</Text>
          <Text style={styles.lateNum}>{lateCount}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Shown</Text>
          <Text style={styles.totalNum}>{visibleEmployees.length}</Text>
        </View>
      </View>

      <FlatList
        data={visibleEmployees}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <EmployeeRow
            employee={item}
            onToggleStatus={handleMark}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <ScanOverlay visible={scanVisible} onClose={() => setScanVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  scanBtn: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  filterPillTextActive: {
    color: COLORS.surfaceGreen,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statsLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  presentNum: {
    fontFamily: FONTS.monoMedium,
    fontSize: 14,
    color: COLORS.primaryLight,
  },
  lateNum: {
    fontFamily: FONTS.monoMedium,
    fontSize: 14,
    color: COLORS.warning,
  },
  totalNum: {
    fontFamily: FONTS.monoMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingBottom: 40,
  },
});
