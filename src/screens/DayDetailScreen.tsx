import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import { format, parseISO } from 'date-fns';
import Card from '../components/Card';

const DayDetailScreen = ({ route, navigation }: any) => {
  const { date } = route.params;
  const { dailyLogs, toggleComplete } = useStore();
  const log = dailyLogs[date];

  if (!log) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.noData}>No data for this day.</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Log', { date })}
          >
            <Text style={styles.actionBtnText}>Log Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <Text style={styles.dateText}>{format(parseISO(date), 'EEEE, MMMM do')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: log.completed ? COLORS.success + '33' : COLORS.fail + '33' }]}>
            <Text style={{ color: log.completed ? COLORS.success : COLORS.fail, fontWeight: 'bold' }}>
              {log.completed ? 'Goal Met' : 'Goal Missed'}
            </Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logged Meals</Text>
          <Card style={styles.mealItem}>
            <Text style={styles.mealTitle}>🌅 Breakfast</Text>
            <Text style={styles.mealValue}>{log.breakfast || 'Not logged'}</Text>
          </Card>
          <Card style={styles.mealItem}>
            <Text style={styles.mealTitle}>☀️ Lunch</Text>
            <Text style={styles.mealValue}>{log.lunch || 'Not logged'}</Text>
          </Card>
          <Card style={styles.mealItem}>
            <Text style={styles.mealTitle}>🌙 Dinner</Text>
            <Text style={styles.mealValue}>{log.dinner || 'Not logged'}</Text>
          </Card>
          <Card style={styles.mealItem}>
            <Text style={styles.mealTitle}>🍪 Snacks</Text>
            <Text style={styles.mealValue}>{log.snacks || 'Not logged'}</Text>
          </Card>
        </View>

        {log.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Notes</Text>
            <Card>
              <Text style={styles.notesText}>{log.notes}</Text>
            </Card>
          </View>
        )}

        <View style={styles.actions}>
           <TouchableOpacity
             style={[styles.btn, { backgroundColor: COLORS.primary }]}
             onPress={() => navigation.navigate('Log', { date })}
           >
             <Text style={styles.btnText}>Edit Entry</Text>
           </TouchableOpacity>
           <TouchableOpacity
             style={[styles.btn, { backgroundColor: COLORS.slate900, marginTop: SPACING.md }]}
             onPress={() => {
                toggleComplete(date);
                Alert.alert('Updated', 'Status changed.');
             }}
           >
             <Text style={[styles.btnText, { color: COLORS.white }]}>
               Toggle Completion Status
             </Text>
           </TouchableOpacity>
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
    padding: SPACING.xl,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  headerCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.slate900,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.slate500,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  mealItem: {
    marginBottom: SPACING.sm,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.slate500,
    marginBottom: 4,
  },
  mealValue: {
    fontSize: 16,
    color: COLORS.slate900,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.slate900,
    lineHeight: 20,
  },
  noData: {
    fontSize: 16,
    color: COLORS.slate500,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  actions: {
    marginTop: SPACING.lg,
  },
  btn: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DayDetailScreen;
