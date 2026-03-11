import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

const ProfileScreen = ({ navigation }: any) => {
  const { userProfile, resetChallenge } = useStore();

  const handleReset = () => {
    Alert.alert(
      'Reiniciar Reto',
      '¿Estás seguro de que quieres reiniciar todo tu progreso? Esto no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
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
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Image
              source={{ uri: userProfile.avatar }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color={COLORS.slate900} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{userProfile.name}</Text>
          <Text style={styles.bio}>Camino de vida saludable desde Ene 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Estadísticas</Text>
          <View style={styles.grid}>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{userProfile.currentWeight}kg</Text>
              <Text style={styles.statLabel}>Peso Actual</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{userProfile.goalWeight}kg</Text>
              <Text style={styles.statLabel}>Peso Meta</Text>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Cuenta</Text>
          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={20} color={COLORS.slate500} />
                <Text style={styles.menuText}>Editar Perfil</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.slate400} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Couple')}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="heart-outline" size={20} color={COLORS.slate500} />
                <Text style={styles.menuText}>Vincular Pareja</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.slate400} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Notificaciones', 'Configuración de notificaciones próximamente.')}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="notifications-outline" size={20} color={COLORS.slate500} />
                <Text style={styles.menuText}>Configuración de Notificaciones</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.slate400} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => Alert.alert('Política de Privacidad', 'Política de privacidad disponible en el lanzamiento.')}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="shield-outline" size={20} color={COLORS.slate500} />
                <Text style={styles.menuText}>Política de Privacidad</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.slate400} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sesión</Text>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert(
                'Cerrar Sesión',
                '¿Estás seguro de que quieres cerrar sesión?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Cerrar Sesión',
                    onPress: () => supabase.auth.signOut(),
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona de Peligro</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
          >
            <Text style={styles.resetBtnText}>Reiniciar Progreso del Reto</Text>
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
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.slate900,
  },
  logoutBtn: {
    backgroundColor: COLORS.slate900,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  logoutBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
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
