import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import Card from '../components/Card';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const { longestStreak, dailyLogs, userProfile, logWeight } = useStore();
  const [weightInput, setWeightInput] = useState('');

  // Success rate calculation
  const logsArray = Object.values(dailyLogs);
  const totalLogs = logsArray.length;
  const completedLogs = logsArray.filter(l => l.completed).length;
  const successRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  // Real Weekly Completion Data
  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const weeklyProgress = weeklyLabels.map((_, i) => {
    const day = format(addDays(startOfThisWeek, i), 'yyyy-MM-dd');
    return dailyLogs[day]?.completed ? 100 : 0;
  });

  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    color: (opacity = 1) => `rgba(13, 242, 89, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  };

  const weeklyData = {
    labels: weeklyLabels,
    datasets: [
      {
        data: weeklyProgress,
      },
    ],
  };

  // Real Weight History Data
  const weightLabels = userProfile.weightHistory.slice(-6).map(h => format(parseISO(h.date), 'MM/dd'));
  const weightValues = userProfile.weightHistory.slice(-6).map(h => h.weight);

  // Fallback if not enough data
  const displayWeightLabels = weightValues.length > 0 ? weightLabels : ['N/A'];
  const displayWeightValues = weightValues.length > 0 ? weightValues : [0];

  const weightData = {
    labels: displayWeightLabels,
    datasets: [
      {
        data: displayWeightValues,
        color: (opacity = 1) => COLORS.primary,
        strokeWidth: 3,
      },
    ],
    legend: ['Peso (kg)'],
  };

  // Weight diff from first to current
  const weightDiff = weightValues.length >= 2
    ? (weightValues[weightValues.length - 1] - weightValues[0]).toFixed(1)
    : null;
  const diffToGoal = (userProfile.currentWeight - userProfile.goalWeight).toFixed(1);

  const handleLogWeight = () => {
    const value = parseFloat(weightInput);
    if (isNaN(value) || value < 20 || value > 300) {
      Alert.alert('Peso Inválido', 'Por favor ingresa un peso válido entre 20 y 300 kg.');
      return;
    }
    logWeight(value);
    setWeightInput('');
    Keyboard.dismiss();
    Alert.alert('Peso Registrado', `Tu peso de ${value} kg ha sido registrado para hoy.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>RACHA MÁS LARGA</Text>
            <Text style={styles.statValue}>{longestStreak} Días</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>TASA DE ÉXITO</Text>
            <Text style={styles.statValue}>{successRate}%</Text>
          </Card>
        </View>

        {/* Log Weight Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registra tu Peso</Text>
          <Card style={styles.weightLogCard}>
            <View style={styles.weightCurrentRow}>
              <View>
                <Text style={styles.weightCurrentLabel}>Actual</Text>
                <Text style={styles.weightCurrentValue}>{userProfile.currentWeight} kg</Text>
              </View>
              <View style={styles.weightArrow}>
                <Ionicons name="arrow-forward" size={20} color={COLORS.slate400} />
              </View>
              <View>
                <Text style={styles.weightCurrentLabel}>Meta</Text>
                <Text style={styles.weightGoalValue}>{userProfile.goalWeight} kg</Text>
              </View>
              <View style={styles.weightDiffBadge}>
                <Text style={styles.weightDiffText}>{diffToGoal} kg por perder</Text>
              </View>
            </View>

            <View style={styles.weightInputRow}>
              <View style={styles.weightInputContainer}>
                <Ionicons name="scale-outline" size={20} color={COLORS.slate400} style={styles.weightInputIcon} />
                <TextInput
                  style={styles.weightInput}
                  placeholder="Ingresa tu peso de hoy"
                  placeholderTextColor={COLORS.slate400}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleLogWeight}
                />
                <Text style={styles.weightUnit}>kg</Text>
              </View>
              <TouchableOpacity
                style={[styles.weightSaveBtn, !weightInput && styles.weightSaveBtnDisabled]}
                onPress={handleLogWeight}
                disabled={!weightInput}
              >
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {userProfile.weightHistory.length > 0 && (
              <Text style={styles.lastLogText}>
                Último registro: {format(parseISO(userProfile.weightHistory[userProfile.weightHistory.length - 1].date), 'MMM d, yyyy')}
                {' — '}
                {userProfile.weightHistory[userProfile.weightHistory.length - 1].weight} kg
              </Text>
            )}
          </Card>
        </View>

        {/* Weight Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seguimiento de Peso</Text>
            {weightDiff !== null && (
              <View style={[styles.trendBadge, { backgroundColor: Number(weightDiff) <= 0 ? COLORS.success + '1A' : COLORS.fail + '1A' }]}>
                <Ionicons
                  name={Number(weightDiff) <= 0 ? "trending-down" : "trending-up"}
                  size={14}
                  color={Number(weightDiff) <= 0 ? COLORS.success : COLORS.fail}
                />
                <Text style={{ color: Number(weightDiff) <= 0 ? COLORS.success : COLORS.fail, fontSize: 12, fontWeight: 'bold' }}>
                  {' '}{weightDiff} kg
                </Text>
              </View>
            )}
          </View>
          <Card style={styles.chartCard}>
            <LineChart
              data={weightData}
              width={screenWidth - SPACING.md * 4}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasa de Completado Semanal (%)</Text>
          <Card style={styles.chartCard}>
            <BarChart
              data={weeklyData}
              width={screenWidth - SPACING.md * 4}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{ ...chartConfig, decimalPlaces: 0 }}
              style={styles.chart}
              verticalLabelRotation={0}
              fromZero
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logros Recientes</Text>
          <Card style={styles.milestoneCard}>
            <View style={styles.milestoneIcon}>
              <Ionicons name="trophy" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.milestoneTitle}>{longestStreak} Días de Consistencia</Text>
              <Text style={styles.milestoneDate}>Tu mejor racha hasta ahora</Text>
            </View>
          </Card>
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
  scrollContent: {
    padding: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    padding: SPACING.md,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.slate500,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.slate900,
    marginBottom: SPACING.md,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  chartCard: {
    padding: 0,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  chart: {
    borderRadius: 12,
  },
  // Weight Log Section
  weightLogCard: {
    padding: SPACING.md,
  },
  weightCurrentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  weightCurrentLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.slate400,
    textTransform: 'uppercase',
  },
  weightCurrentValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  weightGoalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  weightArrow: {
    paddingHorizontal: SPACING.xs,
  },
  weightDiffBadge: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary + '1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weightDiffText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  weightInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  weightInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate100,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
  },
  weightInputIcon: {
    marginRight: SPACING.xs,
  },
  weightInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.slate900,
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.slate400,
    marginLeft: SPACING.xs,
  },
  weightSaveBtn: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightSaveBtnDisabled: {
    opacity: 0.4,
  },
  lastLogText: {
    fontSize: 11,
    color: COLORS.slate400,
    marginTop: SPACING.sm,
  },
  // Milestones
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  milestoneDate: {
    fontSize: 12,
    color: COLORS.slate500,
  },
});

export default StatsScreen;
