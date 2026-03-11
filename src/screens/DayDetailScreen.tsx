import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';

const parseChips = (value: string): string[] => {
  if (!value || !value.trim()) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
};

const DayDetailScreen = ({ route, navigation }: any) => {
  const { date } = route.params;
  const { dailyLogs, toggleComplete } = useStore();
  const log = dailyLogs[date];
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isToday = date === todayStr;

  if (!log) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.noData}>Sin datos para este día.</Text>
          {isToday && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('EditMeal', { date })}
            >
              <Text style={styles.actionBtnText}>Registrar Ahora</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const renderMealChips = (value: string) => {
    const chips = parseChips(value);
    if (chips.length === 0) return <Text style={styles.mealValue}>Sin registrar</Text>;
    return (
      <View style={styles.chipsRow}>
        {chips.map((chip, i) => (
          <View key={`${chip}-${i}`} style={styles.chip}>
            <Text style={styles.chipText}>{chip}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <Text style={styles.dateText}>{format(parseISO(date), 'EEEE, MMMM do')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: log.completed ? COLORS.success + '33' : COLORS.fail + '33' }]}>
            <Text style={{ color: log.completed ? COLORS.success : COLORS.fail, fontWeight: 'bold' }}>
              {log.completed ? 'Meta Cumplida' : 'Meta No Cumplida'}
            </Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comidas Registradas</Text>
          <Card style={styles.mealItem}>
            <Text style={styles.mealTitle}>Desayuno</Text>
            {renderMealChips(log.breakfast)}
          </Card>
          <Card style={styles.mealItem}>
            <Text style={styles.mealTitle}>Almuerzo</Text>
            {renderMealChips(log.lunch)}
          </Card>
          <Card style={styles.mealItem}>
            <Text style={styles.mealTitle}>Cena</Text>
            {renderMealChips(log.dinner)}
          </Card>
          <Card style={styles.mealItem}>
            <Text style={styles.mealTitle}>Snacks</Text>
            {renderMealChips(log.snacks)}
          </Card>
        </View>

        {log.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas del Día</Text>
            <Card>
              <Text style={styles.notesText}>{log.notes}</Text>
            </Card>
          </View>
        ) : null}

        {isToday ? (
          <View style={styles.actions}>
             <TouchableOpacity
               style={[styles.btn, { backgroundColor: COLORS.primary }]}
               onPress={() => navigation.navigate('EditMeal', { date })}
             >
               <Text style={styles.btnText}>Editar Registro</Text>
             </TouchableOpacity>
             <TouchableOpacity
               style={[styles.btn, { backgroundColor: COLORS.slate900, marginTop: SPACING.md }]}
               onPress={() => {
                  toggleComplete(date);
                  Alert.alert('Actualizado', 'Estado cambiado.');
               }}
             >
               <Text style={[styles.btnText, { color: COLORS.white }]}>
                 Cambiar Estado
               </Text>
             </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.readOnlyBanner}>
            <Ionicons name="lock-closed-outline" size={16} color={COLORS.slate500} />
            <Text style={styles.readOnlyText}>Los registros pasados son de solo lectura</Text>
          </View>
        )}
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: 4,
  },
  chip: {
    backgroundColor: COLORS.primary + '1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.slate900,
    fontWeight: '500',
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.slate100,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
  },
  readOnlyText: {
    fontSize: 13,
    color: COLORS.slate500,
    fontWeight: '500',
  },
});

export default DayDetailScreen;
