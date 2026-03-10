import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import MealSection from '../components/MealSection';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const LogMealScreen = ({ navigation, route }: any) => {
  const initialDate = route?.params?.date || format(new Date(), 'yyyy-MM-dd');
  const isFromStack = !!route?.params?.date;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const { dailyLogs, logMeal, updateNotes } = useStore();
  const todayLog = dailyLogs[selectedDate] || { breakfast: '', lunch: '', dinner: '', snacks: '', notes: '' };

  const [notes, setNotes] = useState(todayLog.notes || '');

  const handleSaveNotes = useCallback(() => {
    updateNotes(selectedDate, notes);
  }, [selectedDate, notes, updateNotes]);

  const handlePrevDay = () => {
    const prev = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    setSelectedDate(prev);
    const prevLog = dailyLogs[prev];
    setNotes(prevLog?.notes || '');
  };

  const handleNextDay = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (selectedDate >= todayStr) return;
    const next = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    setSelectedDate(next);
    const nextLog = dailyLogs[next];
    setNotes(nextLog?.notes || '');
  };

  const handleSaveAndGoBack = () => {
    handleSaveNotes();
    Alert.alert('Guardado', 'Registro diario guardado.');
    if (isFromStack) {
      navigation.goBack();
    }
  };

  const getDateLabel = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (selectedDate === todayStr) return 'Hoy';
    return format(parseISO(selectedDate), 'MMM d');
  };

  const isToday = selectedDate >= format(new Date(), 'yyyy-MM-dd');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {isFromStack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.slate900} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.headerTitle}>Registro de Comidas</Text>
        <TouchableOpacity
          style={styles.calendarBtn}
          onPress={() => {
            if (isFromStack) {
              navigation.goBack();
              // Navigate to calendar from parent
            } else {
              navigation.navigate('Calendar');
            }
          }}
        >
          <Ionicons name="calendar" size={20} color={COLORS.slate900} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={handlePrevDay} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {getDateLabel()}, {format(parseISO(selectedDate), 'yyyy')}
          </Text>
          <TouchableOpacity
            onPress={handleNextDay}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isToday}
          >
            <Ionicons name="chevron-forward" size={20} color={isToday ? COLORS.slate400 : COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
           <Text style={styles.sectionTitle}>Fotos de Comidas</Text>
           <View style={styles.photoRow}>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => Alert.alert('Próximamente', 'La subida de fotos estará disponible en una futura actualización.')}
              >
                 <Ionicons name="camera" size={24} color={COLORS.primary} />
                 <Text style={styles.uploadText}>Subir Foto</Text>
              </TouchableOpacity>
              <View style={styles.mockPhoto}>
                 <Text>🥗</Text>
              </View>
           </View>
        </View>

        <MealSection
          title="Desayuno"
          icon="🌅"
          value={todayLog.breakfast}
          onChangeText={(val) => logMeal(selectedDate, 'breakfast', val)}
          onSave={() => Alert.alert('Guardado', 'Desayuno actualizado.')}
        />
        <MealSection
          title="Almuerzo"
          icon="☀️"
          value={todayLog.lunch}
          onChangeText={(val) => logMeal(selectedDate, 'lunch', val)}
          onSave={() => Alert.alert('Guardado', 'Almuerzo actualizado.')}
        />
        <MealSection
          title="Cena"
          icon="🌙"
          value={todayLog.dinner}
          onChangeText={(val) => logMeal(selectedDate, 'dinner', val)}
          onSave={() => Alert.alert('Guardado', 'Cena actualizada.')}
        />
        <MealSection
          title="Snacks"
          icon="🍪"
          value={todayLog.snacks}
          onChangeText={(val) => logMeal(selectedDate, 'snacks', val)}
          onSave={() => Alert.alert('Guardado', 'Snacks actualizado.')}
        />

        <View style={styles.notesSection}>
           <Text style={styles.sectionTitle}>Notas del Día</Text>
           <TextInput
              style={styles.notesInput}
              placeholder="¿Cómo fue tu digestión? ¿Cómo te sientes hoy?"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              onBlur={handleSaveNotes}
           />
        </View>
      </ScrollView>

      <View style={styles.footer}>
         <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAndGoBack}>
            <Text style={styles.saveBtnText}>
              {isFromStack ? 'Guardar y Volver' : 'Guardar Registro Diario'}
            </Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  backBtn: { padding: 4, width: 32 },
  calendarBtn: { padding: 4 },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '0D',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate900,
  },
  photoSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.slate500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  photoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  uploadBtn: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary + '4D',
    backgroundColor: COLORS.primary + '0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate900,
  },
  mockPhoto: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: COLORS.slate100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesSection: {
    marginTop: SPACING.md,
  },
  notesInput: {
    backgroundColor: COLORS.slate100,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.slate900,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LogMealScreen;
