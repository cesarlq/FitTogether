import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING } from '../constants/theme';
import MealSection from '../components/MealSection';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as api from '../services/api';
import { MealPhoto } from '../types';

const LogMealScreen = ({ navigation, route }: any) => {
  const initialDate = route?.params?.date || format(new Date(), 'yyyy-MM-dd');
  const isFromStack = !!route?.params?.date;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const { dailyLogs, logMeal, updateNotes, addMealPhoto, removeMealPhoto, userId } = useStore();
  const todayLog = dailyLogs[selectedDate] || { breakfast: '', lunch: '', dinner: '', snacks: '', notes: '', photos: [] };
  const photos = todayLog.photos || [];

  const [notes, setNotes] = useState(todayLog.notes || '');
  const [uploading, setUploading] = useState(false);

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

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await handleUploadPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await handleUploadPhoto(result.assets[0].uri);
    }
  };

  const handleUploadPhoto = async (uri: string) => {
    if (!userId) return;
    setUploading(true);
    try {
      const publicUrl = await api.uploadMealPhoto(userId, selectedDate, uri, 'general');
      const photo: MealPhoto = {
        uri: publicUrl,
        mealType: 'general',
        createdAt: new Date().toISOString(),
      };
      addMealPhoto(selectedDate, photo);
    } catch (err: any) {
      console.error('Upload meal photo error:', err);
      // Fallback: save local URI
      const photo: MealPhoto = {
        uri,
        mealType: 'general',
        createdAt: new Date().toISOString(),
      };
      addMealPhoto(selectedDate, photo);
    } finally {
      setUploading(false);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Agregar Foto', 'Elige una opción', [
      { text: 'Tomar Foto', onPress: takePhoto },
      { text: 'Elegir de Galería', onPress: pickPhoto },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleDeletePhoto = (photoUri: string) => {
    Alert.alert('Eliminar Foto', '¿Estás seguro de que quieres eliminar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeMealPhoto(selectedDate, photoUri),
      },
    ]);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isToday = selectedDate >= todayStr;
  const isEditable = selectedDate === todayStr;

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
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              <View style={styles.photoRow}>
                {isEditable && (
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={showPhotoOptions}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="camera" size={24} color={COLORS.primary} />
                        <Text style={styles.uploadText}>Agregar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {photos.map((photo, index) => (
                  <View key={`${photo.uri}-${index}`} style={styles.photoContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    {isEditable && (
                      <TouchableOpacity
                        style={styles.photoDeleteBtn}
                        onPress={() => handleDeletePhoto(photo.uri)}
                      >
                        <Ionicons name="close-circle" size={22} color={COLORS.fail} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {photos.length === 0 && !isEditable && (
                  <View style={styles.noPhotos}>
                    <Ionicons name="image-outline" size={24} color={COLORS.slate400} />
                    <Text style={styles.noPhotosText}>Sin fotos</Text>
                  </View>
                )}
              </View>
           </ScrollView>
        </View>

        {!isEditable && (
          <View style={styles.readOnlyBanner}>
            <Ionicons name="lock-closed-outline" size={16} color={COLORS.slate500} />
            <Text style={styles.readOnlyText}>Solo puedes editar el registro de hoy</Text>
          </View>
        )}

        <MealSection
          title="Desayuno"
          icon="🌅"
          value={todayLog.breakfast}
          onChangeText={(val) => logMeal(selectedDate, 'breakfast', val)}
          editable={isEditable}
        />
        <MealSection
          title="Almuerzo"
          icon="☀️"
          value={todayLog.lunch}
          onChangeText={(val) => logMeal(selectedDate, 'lunch', val)}
          editable={isEditable}
        />
        <MealSection
          title="Cena"
          icon="🌙"
          value={todayLog.dinner}
          onChangeText={(val) => logMeal(selectedDate, 'dinner', val)}
          editable={isEditable}
        />
        <MealSection
          title="Snacks"
          icon="🍪"
          value={todayLog.snacks}
          onChangeText={(val) => logMeal(selectedDate, 'snacks', val)}
          editable={isEditable}
        />

        <View style={styles.notesSection}>
           <Text style={styles.sectionTitle}>Notas del Día</Text>
           <TextInput
              style={[styles.notesInput, !isEditable && styles.notesInputDisabled]}
              placeholder="¿Cómo fue tu digestión? ¿Cómo te sientes hoy?"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              onBlur={handleSaveNotes}
              editable={isEditable}
           />
        </View>
      </ScrollView>

      {isEditable && (
        <View style={styles.footer}>
           <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAndGoBack}>
              <Text style={styles.saveBtnText}>
                {isFromStack ? 'Guardar y Volver' : 'Guardar Registro Diario'}
              </Text>
           </TouchableOpacity>
        </View>
      )}
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
  photoScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  photoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  uploadBtn: {
    width: 110,
    height: 110,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary + '4D',
    backgroundColor: COLORS.primary + '0D',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  uploadText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate900,
  },
  photoContainer: {
    position: 'relative',
  },
  photoImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
    backgroundColor: COLORS.slate100,
  },
  photoDeleteBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.white,
    borderRadius: 11,
  },
  noPhotos: {
    width: 110,
    height: 110,
    borderRadius: 14,
    backgroundColor: COLORS.slate100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  noPhotosText: {
    fontSize: 11,
    color: COLORS.slate400,
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.slate100,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  readOnlyText: {
    fontSize: 13,
    color: COLORS.slate500,
    fontWeight: '500',
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
  notesInputDisabled: {
    opacity: 0.6,
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
