import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  valueText?: string;
}

const ProgressBar = ({ progress, label, valueText }: ProgressBarProps) => {
  return (
    <View style={styles.container}>
      {(label || valueText) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {valueText && <Text style={styles.valueText}>{valueText}</Text>}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 14,
    color: COLORS.slate500,
  },
  valueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.slate900,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.slate100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});

export default ProgressBar;
