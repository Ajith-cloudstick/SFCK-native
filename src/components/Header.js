import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import { COLORS, FONTS } from '../theme/theme';

export default function Header({ onSearchVisible }) {
  const insets = useSafeAreaInsets();
  const { supervisorEstate, setSupervisorEstate } = useContext(AppContext);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleChangeEstate = () => {
    setMenuVisible(false);
    setSupervisorEstate(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.titleContainer}>
          <Text style={styles.estate} numberOfLines={1}>{supervisorEstate || 'Select Estate'}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Simple menu modal */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleChangeEstate}>
              <Text style={styles.menuItemText}>Change estate</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  estate: {
    fontFamily: FONTS.sansMedium,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuBtn: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
  menuIcon: {
    fontSize: 22,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  menu: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
