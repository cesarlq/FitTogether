import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Share,
} from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { supabase } from '../services/supabase';
import * as api from '../services/api';

const CoupleScreen = ({ navigation }: any) => {
  const { userId, partnerData, refreshPartner } = useStore();
  const [coupleCode, setCoupleCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [hasCouple, setHasCouple] = useState(false);

  useEffect(() => {
    loadCoupleStatus();
  }, []);

  const loadCoupleStatus = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const profile = await api.getProfile(userId);
      if (profile?.couple_id) {
        setHasCouple(true);
        // Get couple code
        const { data: couple } = await supabase
          .from('couples')
          .select('code')
          .eq('id', profile.couple_id)
          .single();
        if (couple) setCoupleCode(couple.code);

        // Get partner
        const partner = await api.getPartnerProfile(userId);
        setPartnerProfile(partner);
      }
    } catch (err) {
      console.error('Load couple error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const couple = await api.createAndJoinCouple(userId);
      setCoupleCode(couple.code);
      setHasCouple(true);
      Alert.alert(
        'Código Creado',
        `Tu código es: ${couple.code}\n\nCompártelo con tu pareja para que se una.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCouple = async () => {
    if (!userId || !inputCode.trim()) {
      Alert.alert('Error', 'Ingresa el código de tu pareja.');
      return;
    }
    setJoining(true);
    try {
      await api.joinCouple(userId, inputCode.trim());
      Alert.alert('¡Conectados!', 'Te has vinculado con tu pareja exitosamente.');
      await refreshPartner();
      await loadCoupleStatus();
      setInputCode('');
    } catch (err: any) {
      if (err.code === 'PGRST116') {
        Alert.alert('Error', 'Código no encontrado. Verifica e intenta de nuevo.');
      } else {
        Alert.alert('Error', err.message || 'No se pudo unir.');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleShareCode = async () => {
    if (!coupleCode) return;
    try {
      await Share.share({
        message: `¡Únete a mi reto en FitTogether! Usa este código para conectarnos: ${coupleCode}`,
      });
    } catch {}
  };

  const handleUnlink = () => {
    Alert.alert(
      'Desvincular Pareja',
      '¿Estás seguro? Tu pareja ya no podrá ver tu progreso.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            if (!userId) return;
            try {
              await api.updateProfile(userId, { couple_id: null });
              setHasCouple(false);
              setPartnerProfile(null);
              setCoupleCode(null);
              await refreshPartner();
              Alert.alert('Listo', 'Se ha desvinculado la pareja.');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Already linked with partner
  if (hasCouple && partnerProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerIcon}>
            <View style={styles.heartCircle}>
              <Ionicons name="heart" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Pareja Vinculada</Text>
          </View>

          {/* Partner Card */}
          <View style={styles.partnerCard}>
            <Image
              source={{ uri: partnerProfile.avatar || 'https://i.pravatar.cc/150?u=partner' }}
              style={styles.partnerAvatar}
            />
            <Text style={styles.partnerName}>{partnerProfile.name}</Text>
            <View style={styles.partnerStats}>
              <View style={styles.partnerStat}>
                <Text style={styles.partnerStatValue}>{partnerData.currentStreak}</Text>
                <Text style={styles.partnerStatLabel}>Racha</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.partnerStat}>
                <Text style={styles.partnerStatValue}>
                  {partnerData.todayCompleted ? '✓' : '—'}
                </Text>
                <Text style={styles.partnerStatLabel}>Hoy</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.partnerStat}>
                <Text style={styles.partnerStatValue}>
                  {Math.round(partnerData.weeklyProgress * 100)}%
                </Text>
                <Text style={styles.partnerStatLabel}>Semana</Text>
              </View>
            </View>
          </View>

          {/* Couple Code */}
          {coupleCode && (
            <View style={styles.codeSection}>
              <Text style={styles.codeSectionLabel}>Código de pareja</Text>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>{coupleCode}</Text>
                <TouchableOpacity onPress={handleShareCode} style={styles.shareBtn}>
                  <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.unlinkBtn} onPress={handleUnlink}>
            <Ionicons name="heart-dislike-outline" size={18} color={COLORS.fail} />
            <Text style={styles.unlinkText}>Desvincular Pareja</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Has code but no partner yet (waiting)
  if (hasCouple && !partnerProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerIcon}>
            <View style={styles.waitCircle}>
              <Ionicons name="time-outline" size={32} color={COLORS.slate500} />
            </View>
            <Text style={styles.title}>Esperando a tu Pareja</Text>
            <Text style={styles.subtitle}>
              Comparte este código para que tu pareja se una
            </Text>
          </View>

          <View style={styles.bigCodeCard}>
            <Text style={styles.bigCodeLabel}>TU CÓDIGO</Text>
            <Text style={styles.bigCode}>{coupleCode}</Text>
            <TouchableOpacity style={styles.shareBtnFull} onPress={handleShareCode}>
              <Ionicons name="share-outline" size={20} color={COLORS.slate900} />
              <Text style={styles.shareBtnText}>Compartir Código</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadCoupleStatus}
          >
            <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
            <Text style={styles.refreshText}>Verificar si se unió</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.unlinkBtn} onPress={handleUnlink}>
            <Ionicons name="close-circle-outline" size={18} color={COLORS.fail} />
            <Text style={styles.unlinkText}>Cancelar y Eliminar Código</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // No couple yet — show create or join
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerIcon}>
          <View style={styles.heartCircle}>
            <Ionicons name="people" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Conectar con tu Pareja</Text>
          <Text style={styles.subtitle}>
            Vincula tu cuenta con tu pareja para ver el progreso de ambos en tiempo real
          </Text>
        </View>

        {/* Option 1: Create Code */}
        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.optionNumber}>
              <Text style={styles.optionNumberText}>1</Text>
            </View>
            <Text style={styles.optionTitle}>Crear un Código</Text>
          </View>
          <Text style={styles.optionDesc}>
            Genera un código único y compártelo con tu pareja
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateCode}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.slate900} />
            <Text style={styles.primaryBtnText}>Generar Código</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>O</Text>
          <View style={styles.orLine} />
        </View>

        {/* Option 2: Join with Code */}
        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.optionNumber}>
              <Text style={styles.optionNumberText}>2</Text>
            </View>
            <Text style={styles.optionTitle}>Unirse con Código</Text>
          </View>
          <Text style={styles.optionDesc}>
            Si tu pareja ya creó un código, ingrésalo aquí
          </Text>
          <View style={styles.codeInputRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="Ej: ABC123"
              placeholderTextColor={COLORS.slate400}
              value={inputCode}
              onChangeText={(t) => setInputCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.joinBtn, (!inputCode.trim() || joining) && styles.joinBtnDisabled]}
              onPress={handleJoinCouple}
              disabled={!inputCode.trim() || joining}
            >
              {joining ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.joinBtnText}>Unirse</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  headerIcon: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  heartCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  waitCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.slate100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.slate900,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.slate500,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    lineHeight: 20,
  },
  // Option Cards
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  optionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionNumberText: {
    fontWeight: 'bold',
    color: COLORS.slate900,
    fontSize: 14,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  optionDesc: {
    fontSize: 13,
    color: COLORS.slate500,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  primaryBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: COLORS.slate900,
  },
  // Or Divider
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.slate100,
  },
  orText: {
    paddingHorizontal: SPACING.md,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.slate400,
  },
  // Code Input
  codeInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  codeInput: {
    flex: 1,
    backgroundColor: COLORS.slate100,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
    color: COLORS.slate900,
  },
  joinBtn: {
    backgroundColor: COLORS.slate900,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnDisabled: {
    opacity: 0.4,
  },
  joinBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Linked Partner View
  partnerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '33',
    marginBottom: SPACING.lg,
  },
  partnerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.slate100,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.slate900,
    marginBottom: SPACING.md,
  },
  partnerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  partnerStat: {
    alignItems: 'center',
  },
  partnerStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  partnerStatLabel: {
    fontSize: 11,
    color: COLORS.slate500,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.slate100,
  },
  // Code Display
  codeSection: {
    marginBottom: SPACING.lg,
  },
  codeSectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.slate500,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  codeText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: COLORS.slate900,
  },
  shareBtn: {
    padding: SPACING.xs,
  },
  // Big Code (waiting state)
  bigCodeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '33',
    borderStyle: 'dashed',
    marginBottom: SPACING.lg,
  },
  bigCodeLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.slate400,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  bigCode: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: COLORS.slate900,
    marginBottom: SPACING.lg,
  },
  shareBtnFull: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  shareBtnText: {
    fontWeight: 'bold',
    color: COLORS.slate900,
    fontSize: 14,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  refreshText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  unlinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  unlinkText: {
    color: COLORS.fail,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CoupleScreen;
