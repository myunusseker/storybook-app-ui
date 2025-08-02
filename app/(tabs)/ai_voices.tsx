import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, VolumeX, Volume2, RefreshCw, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function AIVoicesScreen() {
  const [hasVoiceSetup, setHasVoiceSetup] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleVoiceSetup = () => {
    router.push('/voice-setup');
  };

  const handleRecalibrateVoice = () => {
    Alert.alert(
      'Recalibrate Voice',
      'This will update your AI voice model. You\'ll need to record new voice samples.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: handleVoiceSetup }
      ]
    );
  };

  const handleDeleteVoice = () => {
    Alert.alert(
      'Delete Voice',
      'Are you sure you want to delete your AI voice? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setHasVoiceSetup(false);
            Alert.alert('Voice Deleted', 'Your AI voice has been removed.');
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={theme.gradientBackground.colors} style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Voice</Text>
        {!hasVoiceSetup ? (
          <TouchableOpacity style={styles.voiceSetupCard} onPress={handleVoiceSetup}>
            <LinearGradient
              colors={[theme.accent, '#7c3aed']}
              style={styles.voiceSetupGradient}
            >
              <View style={styles.voiceSetupContent}>
                <View style={styles.voiceSetupIcon}>
                  <Mic size={24} color="#ffffff" />
                </View>
                <View style={styles.voiceSetupText}>
                  <Text style={styles.voiceSetupTitle}>Set Up Your Voice</Text>
                  <Text style={styles.voiceSetupDescription}>
                    Record your voice to create personalized AI narrations
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.voiceCard}>
            <View style={styles.voiceStatus}>
              <View style={styles.voiceStatusIcon}>
                <Mic size={20} color="#10b981" />
              </View>
              <View style={styles.voiceStatusText}>
                <Text style={styles.voiceStatusTitle}>Voice Ready</Text>
                <Text style={styles.voiceStatusDescription}>
                  Your AI voice is set up and ready to use
                </Text>
              </View>
              <TouchableOpacity
                style={styles.voiceToggle}
                onPress={() => setIsVoiceEnabled(!isVoiceEnabled)}
              >
                {isVoiceEnabled ? (
                  <Volume2 size={20} color="#10b981" />
                ) : (
                  <VolumeX size={20} color="#ef4444" />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.voiceActions}>
              <TouchableOpacity
                style={styles.voiceActionButton}
                onPress={handleRecalibrateVoice}
              >
                <RefreshCw size={16} color="#8b5cf6" />
                <Text style={styles.voiceActionText}>Recalibrate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.voiceActionButton, styles.deleteButton]}
                onPress={handleDeleteVoice}
              >
                <Trash2 size={16} color="#ef4444" />
                <Text style={[styles.voiceActionText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
  },
  voiceSetupCard: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voiceSetupGradient: {
    padding: 20,
  },
  voiceSetupContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceSetupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  voiceSetupText: {
    flex: 1,
  },
  voiceSetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  voiceSetupDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  voiceCard: {
    backgroundColor: theme.card,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voiceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  voiceStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voiceStatusText: {
    flex: 1,
  },
  voiceStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 3,
  },
  voiceStatusDescription: {
    fontSize: 14,
    color: theme.secondaryText,
  },
  voiceToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  voiceActions: {
    flexDirection: 'row',
    gap: 10,
  },
  voiceActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  voiceActionText: {
    fontSize: 14,
    color: theme.accent,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
});