import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { ESTATES } from '../data/mockData';
import { COLORS, FONTS } from '../theme/theme';

export default function EstateSelectScreen() {
  const insets = useSafeAreaInsets();
  const { setSupervisorEstate } = useContext(AppContext);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo / Title */}
      <View style={styles.logoArea}>
        <Image source={require('../../assets/logo.jpeg')} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.logoSub}>State Farming Corporation of Kerala</Text>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>Choose your estate</Text>

      {/* Estate Cards */}
      {ESTATES.map(estate => (
        <TouchableOpacity
          key={estate.id}
          style={styles.card}
          onPress={() => setSupervisorEstate(estate.id)}
          activeOpacity={0.82}
        >
          <View style={styles.cardContent}>
            <Text style={styles.estateName}>{estate.name}</Text>

          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ))}

      {/* Footer note */}
      <Text style={styles.footerNote}>
        You can reassign workers to other estates from the Work tab.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    flexGrow: 1,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 160,
    height: 100,
    marginTop: 20,
    borderRadius: 50,
  },
  logoSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 12
  },
  heading: {
    fontFamily: FONTS.sansMedium,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  cardContent: {
    flex: 1,
  },
  estateName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  estateRange: {
    fontFamily: FONTS.monoRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footerNote: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
  },
});
