import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';

const EditProfileScreen = ({ navigation }: any) => {
  const { userProfile, updateProfile, userId } = useStore();
  const [name, setName] = useState(userProfile.name);
  const [currentWeight, setCurrentWeight] = useState(String(userProfile.currentWeight));
  const [goalWeight, setGoalWeight] = useState(String(userProfile.goalWeight));
  const [avatarUri, setAvatarUri] = useState(userProfile.avatar);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar una foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!userId) return;

    setUploading(true);
    try {
      // Read file as arraybuffer (works correctly in React Native)
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${userId}/avatar.${fileExt}`;
      const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          upsert: true,
          contentType,
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache-bust
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setAvatarUri(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setAvatarUri(uri);
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Cambiar Foto', 'Elige una opción', [
      { text: 'Tomar Foto', onPress: takePhoto },
      { text: 'Elegir de Galería', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = () => {
    const weight = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);

    if (isNaN(weight) || isNaN(goal)) {
      Alert.alert('Entrada Inválida', 'Por favor ingresa números válidos para el peso.');
      return;
    }

    updateProfile({
      name,
      avatar: avatarUri,
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
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={showImageOptions} disabled={uploading}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            {uploading ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={COLORS.white} />
              </View>
            ) : (
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Toca para cambiar foto</Text>
        </View>

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
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.slate100,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  changePhotoText: {
    marginTop: SPACING.sm,
    fontSize: 13,
    color: COLORS.slate500,
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
