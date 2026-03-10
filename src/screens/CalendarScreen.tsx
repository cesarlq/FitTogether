import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import Card from '../components/Card';

const CalendarScreen = ({ navigation }: any) => {
  const { dailyLogs } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Calculate real completion rate for displayed month
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthLogged = monthDays.filter(d => {
    const key = format(d, 'yyyy-MM-dd');
    return dailyLogs[key]?.completed;
  }).length;
  const monthTotal = monthDays.filter(d => {
    const key = format(d, 'yyyy-MM-dd');
    return !!dailyLogs[key];
  }).length;
  const completionRate = monthTotal > 0 ? Math.round((monthLogged / monthTotal) * 100) : 0;

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const renderDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const log = dailyLogs[dateStr];
    const isCurrentMonth = isSameMonth(day, monthStart);
    const isToday = isSameDay(day, new Date());

    let statusColor = COLORS.slate100;
    if (log) {
      statusColor = log.completed ? COLORS.success : COLORS.fail;
    }

    return (
      <TouchableOpacity
        key={dateStr}
        style={styles.dayCell}
        onPress={() => navigation.navigate('DayDetail', { date: dateStr })}
      >
        <Text style={[
          styles.dayText,
          !isCurrentMonth && styles.disabledDayText,
          isToday && styles.todayText
        ]}>
          {format(day, 'd')}
        </Text>
        <View style={[styles.dot, { backgroundColor: isCurrentMonth ? statusColor : COLORS.slate100 }]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario Dietético</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.chevron}>‹</Text>
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
            <Text style={styles.completionRate}>
              {monthTotal > 0 ? `${completionRate}% Metas Cumplidas` : 'Sin datos aún'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          <View style={styles.weekDays}>
            {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(d => (
              <Text key={d} style={styles.weekDayText}>{d}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {days.map(renderDay)}
          </View>
        </View>

        <View style={styles.legend}>
           <Text style={styles.sectionTitle}>Leyenda de Actividad</Text>
           <Card style={styles.legendItem}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.success + '33' }]}>
                 <Text style={{ color: COLORS.success }}>✓</Text>
              </View>
              <View>
                 <Text style={styles.legendTitle}>Meta Dietética Cumplida</Text>
                 <Text style={styles.legendSub}>Objetivos de calorías y macros alcanzados</Text>
              </View>
           </Card>
           <Card style={styles.legendItem}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.fail + '33' }]}>
                 <Text style={{ color: COLORS.fail }}>✕</Text>
              </View>
              <View>
                 <Text style={styles.legendTitle}>Meta No Cumplida</Text>
                 <Text style={styles.legendSub}>Excedió límites o no cumplió objetivos</Text>
              </View>
           </Card>
           <Card style={styles.legendItem}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.slate100 }]}>
                 <Text style={{ color: COLORS.slate400 }}>-</Text>
              </View>
              <View>
                 <Text style={styles.legendTitle}>Sin Datos Registrados</Text>
                 <Text style={styles.legendSub}>Sin entradas para este día</Text>
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
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  chevron: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.sm,
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  completionRate: {
    fontSize: 10,
    color: COLORS.slate500,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  calendarGrid: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  weekDays: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    marginBottom: SPACING.sm,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.slate400,
    fontWeight: 'bold',
    paddingVertical: SPACING.sm,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.slate900,
  },
  disabledDayText: {
    color: COLORS.slate100,
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  legend: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.slate500,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  legendSub: {
    fontSize: 12,
    color: COLORS.slate500,
  },
});

export default CalendarScreen;
