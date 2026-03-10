import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface MealSectionProps {
  title: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  onSave?: () => void;
}

const MealSection = ({ title, icon, value, onChangeText, onSave }: MealSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`¿Qué comiste en el/la ${title.toLowerCase()}?`}
          value={value}
          onChangeText={onChangeText}
          multiline
        />
        <TouchableOpacity style={styles.addButton} onPress={onSave}>
          <Text style={styles.addButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.slate100,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 14,
    minHeight: 48,
  },
  addButton: {
    backgroundColor: COLORS.primary + '33', // 20% opacity
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.slate900,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MealSection;
