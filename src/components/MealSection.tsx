import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface MealSectionProps {
  title: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

// Value is stored as comma-separated: "Avena,Fruta,Café"
const parseChips = (value: string): string[] => {
  if (!value || !value.trim()) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
};

const MealSection = ({ title, icon, value, onChangeText, editable = true }: MealSectionProps) => {
  const [inputText, setInputText] = useState('');
  const chips = parseChips(value);

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newChips = [...chips, trimmed];
    onChangeText(newChips.join(','));
    setInputText('');
  };

  const handleRemove = (index: number) => {
    if (!editable) return;
    const newChips = chips.filter((_, i) => i !== index);
    onChangeText(newChips.join(','));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        {chips.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{chips.length}</Text>
          </View>
        )}
      </View>

      {editable && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Agregar ${title.toLowerCase()}...`}
            placeholderTextColor={COLORS.slate400}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addButton, !inputText.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!inputText.trim()}
          >
            <Ionicons name="add" size={20} color={inputText.trim() ? COLORS.slate900 : COLORS.slate400} />
          </TouchableOpacity>
        </View>
      )}

      {chips.length > 0 && (
        <View style={styles.chipsContainer}>
          {chips.map((chip, index) => (
            <View key={`${chip}-${index}`} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
              {editable && (
                <TouchableOpacity
                  onPress={() => handleRemove(index)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.slate400} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {!editable && chips.length === 0 && (
        <Text style={styles.emptyText}>Sin registro</Text>
      )}
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
  countBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary + '33',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.slate100,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.slate900,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.slate100,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '1A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.slate900,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.slate400,
    fontStyle: 'italic',
  },
});

export default MealSection;
