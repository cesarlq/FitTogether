import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import MealSection from '../components/MealSection';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const LogMealScreen = ({ navigation, route }: any) => {
  const selectedDate = route?.params?.date || format(new Date(), 'yyyy-MM-dd');
  const { dailyLogs, logMeal, updateNotes } = useStore();
  const todayLog = dailyLogs[selectedDate] || { breakfast: '', lunch: '', dinner: '', snacks: '', notes: '' };

  const [notes, setNotes] = useState(todayLog.notes || '');

  const handleSaveNotes = () => {
    updateNotes(selectedDate, notes);
    Alert.alert('Saved', 'Daily notes updated successfully.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.slate900} />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Meal Log</Text>
         <TouchableOpacity style={styles.calendarBtn}>
            <Ionicons name="calendar" size={20} color={COLORS.slate900} />
         </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateNav}>
           <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
           <Text style={styles.dateText}>
             {selectedDate === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(parseISO(selectedDate), 'MMM d')}, {format(parseISO(selectedDate), 'yyyy')}
           </Text>
           <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </View>

        <View style={styles.photoSection}>
           <Text style={styles.sectionTitle}>Meal Snapshots</Text>
           <View style={styles.photoRow}>
              <TouchableOpacity style={styles.uploadBtn}>
                 <Ionicons name="camera" size={24} color={COLORS.primary} />
                 <Text style={styles.uploadText}>Upload Photo</Text>
              </TouchableOpacity>
              <View style={styles.mockPhoto}>
                 <Text>🥗</Text>
              </View>
           </View>
        </View>

        <MealSection
          title="Breakfast"
          icon="🌅"
          value={todayLog.breakfast}
          onChangeText={(val) => logMeal(selectedDate, 'breakfast', val)}
          onSave={() => Alert.alert('Saved', 'Breakfast updated.')}
        />
        <MealSection
          title="Lunch"
          icon="☀️"
          value={todayLog.lunch}
          onChangeText={(val) => logMeal(selectedDate, 'lunch', val)}
          onSave={() => Alert.alert('Saved', 'Lunch updated.')}
        />
        <MealSection
          title="Dinner"
          icon="🌙"
          value={todayLog.dinner}
          onChangeText={(val) => logMeal(selectedDate, 'dinner', val)}
          onSave={() => Alert.alert('Saved', 'Dinner updated.')}
        />
        <MealSection
          title="Snacks"
          icon="🍪"
          value={todayLog.snacks}
          onChangeText={(val) => logMeal(selectedDate, 'snacks', val)}
          onSave={() => Alert.alert('Saved', 'Snacks updated.')}
        />

        <View style={styles.notesSection}>
           <Text style={styles.sectionTitle}>Daily Notes</Text>
           <TextInput
              style={styles.notesInput}
              placeholder="How was your digestion? How do you feel today?"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              onBlur={handleSaveNotes}
           />
        </View>
      </ScrollView>

      <View style={styles.footer}>
         <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.saveBtnText}>Save Daily Log</Text>
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
  headerIcon: {
    fontSize: 20,
  },
  backBtn: { padding: 4 },
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
  navIcon: {
    fontSize: 20,
    color: COLORS.primary,
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
  uploadIcon: {
    fontSize: 24,
    color: COLORS.primary,
    marginBottom: 4,
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
