import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { userProfile, resetChallenge } = useStore();

  const handleReset = () => {
    Alert.alert(
      'Reset Challenge',
      'Are you sure you want to reset all your progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetChallenge()
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?u=fit-together-user' }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color={COLORS.slate900} />
            </View>
          </View>
          <Text style={styles.name}>{userProfile.name}</Text>
          <Text style={styles.bio}>Healthy living journey since Jan 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats Overview</Text>
          <View style={styles.grid}>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{userProfile.currentWeight}kg</Text>
              <Text style={styles.statLabel}>Current Weight</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>1,840</Text>
              <Text style={styles.statLabel}>Avg Calories</Text>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.slate400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Notification Settings</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.slate400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.slate400} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
          >
            <Text style={styles.resetBtnText}>Reset Challenge Progress</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>FitTogether v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  bio: {
    fontSize: 14,
    color: COLORS.slate500,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.slate500,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 4,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.slate900,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.slate400,
  },
  resetBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.fail,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetBtnText: {
    color: COLORS.fail,
    fontWeight: 'bold',
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    color: COLORS.slate400,
    fontSize: 12,
    marginVertical: SPACING.xl,
  },
});

export default ProfileScreen;
