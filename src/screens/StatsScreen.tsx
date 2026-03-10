import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import Card from '../components/Card';
import { format, subDays, startOfWeek, addDays, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const { longestStreak, dailyLogs, userProfile } = useStore();

  // Success rate calculation
  const logsArray = Object.values(dailyLogs);
  const totalLogs = logsArray.length;
  const completedLogs = logsArray.filter(l => l.completed).length;
  const successRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  // Real Weekly Completion Data
  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
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
    decimalPlaces: 0,
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
  const weightLabels = userProfile.weightHistory.slice(-4).map(h => format(parseISO(h.date), 'MM/dd'));
  const weightValues = userProfile.weightHistory.slice(-4).map(h => h.weight);

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
    legend: ['Weight (kg)'],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>LONGEST STREAK</Text>
            <Text style={styles.statValue}>{longestStreak} Days</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>SUCCESS RATE</Text>
            <Text style={styles.statValue}>{successRate}%</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Tracking</Text>
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
          <Text style={styles.sectionTitle}>Weekly Completion Rate (%)</Text>
          <Card style={styles.chartCard}>
            <BarChart
              data={weeklyData}
              width={screenWidth - SPACING.md * 4}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={chartConfig}
              style={styles.chart}
              verticalLabelRotation={0}
              fromZero
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Milestones</Text>
          <Card style={styles.milestoneCard}>
            <View style={styles.milestoneIcon}>
              <Ionicons name="trophy" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.milestoneTitle}>15 Day Consistency</Text>
              <Text style={styles.milestoneDate}>Unlocked today</Text>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.slate900,
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
