import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';

const EditProfileScreen = ({ navigation }: any) => {
  const { userProfile, updateProfile } = useStore();
  const [name, setName] = useState(userProfile.name);
  const [currentWeight, setCurrentWeight] = useState(String(userProfile.currentWeight));
  const [goalWeight, setGoalWeight] = useState(String(userProfile.goalWeight));

  const handleSave = () => {
    const weight = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);

    if (isNaN(weight) || isNaN(goal)) {
      Alert.alert('Entrada Inválida', 'Por favor ingresa números válidos para el peso.');
      return;
    }

    updateProfile({
      name,
      currentWeight: weight,
      goalWeight: goal,
    });

    Alert.alert('Guardado', 'Perfil actualizado correctamente.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Peso Actual (kg)</Text>
          <TextInput
            style={styles.input}
            value={currentWeight}
            onChangeText={setCurrentWeight}
            placeholder="e.g. 78.5"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Peso Meta (kg)</Text>
          <TextInput
            style={styles.input}
            value={goalWeight}
            onChangeText={setGoalWeight}
            placeholder="e.g. 75.0"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar Cambios</Text>
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
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.slate500,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    color: COLORS.slate900,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveBtnText: {
    color: COLORS.slate900,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;
