import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import Card from '../components/Card';
import StreakRing from '../components/StreakRing';
import ProgressBar from '../components/ProgressBar';
import { format, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const HomeScreen = ({ navigation }: any) => {
  const { currentStreak, dailyLogs, partnerData, toggleComplete, setInitialData } = useStore();

  useEffect(() => {
    setInitialData();
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = dailyLogs[today];
  const isCompleted = todayLog?.completed || false;

  const mealCount = todayLog ? [todayLog.breakfast, todayLog.lunch, todayLog.dinner].filter(m => m.length > 0).length : 0;

  // Real last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = dailyLogs[dateStr];
    return {
      label: WEEKDAY_LABELS[i],
      completed: log?.completed || false,
      hasData: !!log,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=sam' }} style={styles.avatar} />
          </TouchableOpacity>
          <Text style={styles.appName}>FitTogether</Text>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => Alert.alert('Notificaciones', 'No hay notificaciones nuevas.')}
          >
            <Ionicons name="notifications" size={20} color={COLORS.slate900} />
          </TouchableOpacity>
        </View>

        <View style={styles.streakSection}>
          <StreakRing streak={currentStreak} />
          <Text style={styles.streakQuote}>
            Tu consistencia semanal es <Text style={styles.highlight}>increíble!</Text> Sigue así.
          </Text>
        </View>

        <Card style={styles.weekCard}>
          <Text style={styles.cardTitle}>Últimos 7 Días</Text>
          <View style={styles.weekRow}>
            {last7Days.map((day, i) => (
              <View key={i} style={styles.dayItem}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <View style={[styles.dayCircle, day.completed ? styles.completedCircle : styles.pendingCircle]}>
                   <Ionicons
                     name={day.completed ? "checkmark" : "ellipse-outline"}
                     size={12}
                     color={day.completed ? COLORS.primary : COLORS.slate400}
                   />
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardTitle}>Estado de Hoy</Text>
            <View style={[styles.badge, isCompleted && styles.badgeCompleted]}>
              <Text style={[styles.badgeText, isCompleted && styles.badgeTextCompleted]}>
                {isCompleted ? 'Completado' : 'En Progreso'}
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={mealCount / 3}
            label="Registro de Comidas"
            valueText={`${mealCount}/3`}
          />
        </Card>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.logBtn]}
            onPress={() => navigation.navigate('Log')}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.slate900} />
            <Text style={styles.btnText}>Registrar Comida</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.doneBtn, isCompleted && styles.completedBtn]}
            onPress={() => toggleComplete(today)}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={COLORS.white}
            />
            <Text style={[styles.btnText, { color: COLORS.white }]}>
              {isCompleted ? '¡Listo!' : 'Listo por Hoy'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
          <Card style={styles.partnerCard}>
            <View style={styles.partnerInfo}>
               <View style={styles.partnerAvatars}>
                  <Image source={{ uri: partnerData.avatar }} style={styles.smallAvatar} />
                  <Image source={{ uri: 'https://i.pravatar.cc/150?u=user2' }} style={[styles.smallAvatar, { marginLeft: -10 }]} />
               </View>
               <Text style={styles.partnerText}>
                 <Text style={styles.bold}>{partnerData.name}</Text> y 4 más registraron hoy!
               </Text>
            </View>
          </Card>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  notificationBtn: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  streakSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  streakQuote: {
    marginTop: SPACING.lg,
    color: COLORS.slate500,
    textAlign: 'center',
    fontSize: 14,
  },
  highlight: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  weekCard: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.slate900,
    marginBottom: SPACING.md,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.slate400,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: COLORS.primary + '33',
  },
  pendingCircle: {
    backgroundColor: COLORS.slate100,
  },
  statusCard: {
    marginBottom: SPACING.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: COLORS.primary + '1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCompleted: {
    backgroundColor: COLORS.primary + '33',
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextCompleted: {
    color: COLORS.slate900,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  logBtn: {
    backgroundColor: COLORS.primary,
  },
  doneBtn: {
    backgroundColor: COLORS.slate900,
  },
  completedBtn: {
    backgroundColor: COLORS.primary,
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.slate900,
  },
  partnerCard: {
    backgroundColor: COLORS.primary + '0D',
    borderColor: COLORS.primary + '1A',
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatars: {
    flexDirection: 'row',
    marginRight: SPACING.md,
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  partnerText: {
    fontSize: 12,
    color: COLORS.slate500,
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
});

export default HomeScreen;
