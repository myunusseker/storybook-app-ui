import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Plus, Edit, Trash2, Star, Settings, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, where, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AIVoice {
  id: string;
  userId: string;
  name: string;
  apiKey?: string;
  status: 'processing' | 'ready' | 'failed' | 'waiting';
  isDefault: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export default function AIVoicesScreen() {
  const [voices, setVoices] = useState<AIVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVoice, setEditingVoice] = useState<AIVoice | null>(null);
  const [newVoiceName, setNewVoiceName] = useState('');
  
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Voices data listener
  useEffect(() => {
    if (!user) {
      setVoices([]);
      setLoading(false);
      return;
    }

    const voicesRef = collection(db, 'users', user.uid, 'aiVoices');
    const q = query(voicesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const voicesData: AIVoice[] = [];
      snapshot.forEach((doc) => {
        voicesData.push({
          id: doc.id,
          ...doc.data()
        } as AIVoice);
      });
      
      setVoices(voicesData);
      setLoading(false);
      
      // Check if we need to auto-set a default voice
      checkAndSetAutoDefault(voicesData);
    }, (error) => {
      console.error('Error fetching voices:', error);
      Alert.alert('Error', 'Failed to load voices');
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleCreateVoice = () => {
    setNewVoiceName('');
    setEditingVoice(null);
    setShowCreateModal(true);
  };

  const handleEditVoice = (voice: AIVoice) => {
    setNewVoiceName(voice.name);
    setEditingVoice(voice);
    setShowCreateModal(true);
  };

  const handleSaveVoice = async () => {
    if (!newVoiceName.trim()) {
      Alert.alert('Error', 'Please enter a voice name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create voices');
      return;
    }

    try {
      if (editingVoice) {
        // Edit existing voice
        const voiceRef = doc(db, 'users', user.uid, 'aiVoices', editingVoice.id);
        await updateDoc(voiceRef, {
          name: newVoiceName,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new voice - never set as default initially
        const voicesRef = collection(db, 'users', user.uid, 'aiVoices');
        
        await addDoc(voicesRef, {
          userId: user.uid,
          name: newVoiceName,
          status: 'waiting',
          isDefault: false, // Never set as default when creating
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
    }

      setShowCreateModal(false);
      setNewVoiceName('');
      setEditingVoice(null);
    } catch (error) {
      console.error('Error saving voice:', error);
    }
  };

  const handleSetupVoice = (voice: AIVoice) => {
    if (voice.status === 'ready' || voice.status === 'processing') {
      // Show warning for recalibration
      Alert.alert(
        'Recalibrate AI Voice',
        `Are you sure you want to recalibrate "${voice.name}"? This will reset your current voice settings and require new voice samples.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Recalibrate', 
            style: 'destructive',
            onPress: () => router.push(`/voice-setup?voiceId=${voice.id}`)
          }
        ]
      );
    } else {
      // Direct navigation for waiting/failed status
      router.push(`/voice-setup?voiceId=${voice.id}`);
    }
  };

  const getSetupButtonText = (status: AIVoice['status']) => {
    switch (status) {
      case 'waiting':
      case 'failed':
        return 'Setup AI Voice';
      case 'ready':
      case 'processing':
        return 'Recalibrate AI Voice';
      default:
        return 'Setup AI Voice';
    }
  };

  const handleSetDefault = async (voiceId: string) => {
    if (!user) {
      console.log('No user found');
      return;
    }

    // Find the voice being set as default
    const targetVoice = voices.find(voice => voice.id === voiceId);
    
    if (!targetVoice) {
      Alert.alert('Error', 'Voice not found');
      return;
    }

    // Only allow setting ready voices as default
    if (targetVoice.status !== 'ready') {
      Alert.alert(
        'Voice Not Ready', 
        'Only completed voices can be set as default. Please wait for voice processing to complete.'
      );
      return;
    }

    try {
      // Use Firestore batch for atomic operations
      const batch = writeBatch(db);
      
      // First, unset all current default voices
      voices.forEach(voice => {
        if (voice.isDefault) {
          console.log(`Unsetting default for voice: ${voice.name} (${voice.id})`);
          const voiceRef = doc(db, 'users', user.uid, 'aiVoices', voice.id);
          batch.update(voiceRef, { isDefault: false, updatedAt: serverTimestamp() });
        }
      });

      // Then set the new default voice
      console.log(`Setting default for voice: ${targetVoice.name} (${voiceId})`);
      const newDefaultRef = doc(db, 'users', user.uid, 'aiVoices', voiceId);
      batch.update(newDefaultRef, { isDefault: true, updatedAt: serverTimestamp() });

      await batch.commit();
      console.log('Default voice update completed successfully');
    } catch (error) {
      console.error('Error setting default voice:', error);
      Alert.alert('Error', 'Failed to update default voice');
    }
  };

  // Add this new function to automatically set default when a voice becomes ready
  const checkAndSetAutoDefault = async (voices: AIVoice[]) => {
    if (!user) return;

    const hasDefaultVoice = voices.some(voice => voice.isDefault);
    const readyVoices = voices.filter(voice => voice.status === 'ready');
    
    // If no default voice exists and we have ready voices, set the first ready voice as default
    if (!hasDefaultVoice && readyVoices.length > 0) {
      const firstReadyVoice = readyVoices[0];
      
      try {
        const voiceRef = doc(db, 'users', user.uid, 'aiVoices', firstReadyVoice.id);
        await updateDoc(voiceRef, {
          isDefault: true,
          updatedAt: serverTimestamp(),
        });
        
        console.log(`Automatically set ${firstReadyVoice.name} as default voice`);
      } catch (error) {
        console.error('Error setting auto default voice:', error);
      }
    }
  };

  const handleDeleteVoice = async (voice: AIVoice) => {
    if (!user) return;

    Alert.alert(
      'Delete Voice',
      `Are you sure you want to delete "${voice.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const voiceRef = doc(db, 'users', user.uid, 'aiVoices', voice.id);
              await deleteDoc(voiceRef);
              
              // If we deleted the default voice, the auto-default logic will handle setting a new one
              console.log(`Deleted voice: ${voice.name}${voice.isDefault ? ' (was default)' : ''}`);
            } catch (error) {
              console.error('Error deleting voice:', error);
              Alert.alert('Error', 'Failed to delete voice');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      // Handle regular date string
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString();
      }
      // Handle Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: AIVoice['status']) => {
    switch (status) {
      case 'ready': return '#10b981';
      case 'processing': return theme.accent;
      case 'waiting': return theme.accent;
      case 'failed': return '#ef4444';
      default: return theme.secondaryText;
    }
  };

  const getStatusText = (status: AIVoice['status']) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'processing': return 'Processing...';
      case 'failed': return 'Failed';
      case 'waiting': return 'Waiting for voice samples...';
      default: return 'Unknown';
    }
  };

  const VoiceCard = ({ voice }: { voice: AIVoice }) => (
    <View style={styles.voiceCard}>
      <View style={styles.voiceHeader}>
        <View style={styles.voiceInfo}>
          <View style={styles.voiceNameRow}>
            <Text style={styles.voiceName}>{voice.name}</Text>
            {voice.isDefault && (
              <View style={styles.defaultBadge}>
                <Star size={12} color="#ffffff" fill="#ffffff" />
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditVoice(voice)}
            >
              <Edit size={18} color={theme.accent} />
            </TouchableOpacity>
          </View>
          <View style={styles.voiceMeta}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(voice.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(voice.status) }]}>
                {getStatusText(voice.status)}
              </Text>
            </View>
            <Text style={styles.dateText}>Created {formatDate(voice.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.voiceActions}>
        <TouchableOpacity 
          style={styles.setupButton}
          onPress={() => handleSetupVoice(voice)}
        >
          <LinearGradient
            colors={[theme.accent, '#7c3aed']}
            style={styles.setupButtonGradient}
          >
            <Settings size={16} color="#ffffff" />
            <Text style={styles.setupButtonText}>{getSetupButtonText(voice.status)}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!voice.isDefault && (
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              voice.status === 'ready' ? styles.primaryActionButton : styles.disabledActionButton
            ]}
            onPress={() => {
              if (voice.status === 'ready') {
                console.log('Set default button pressed for voice:', voice.id, voice.name);
                handleSetDefault(voice.id);
              }
            }}
            disabled={voice.status !== 'ready'}
          >
            <Star size={16} color={voice.status === 'ready' ? '#ffffff' : theme.secondaryText} />
            <Text style={[
              styles.actionButtonText, 
              voice.status === 'ready' ? styles.primaryActionText : styles.disabledActionText
            ]}>
              {voice.status === 'ready' ? 'Set Default' : 'Not Ready'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.deleteButtonInline}
          onPress={() => handleDeleteVoice(voice)}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={theme.gradientBackground.colors} style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>AI Voices</Text>
          <Text style={styles.subtitle}>
            Create and manage personalized AI voices for your stories
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading voices...</Text>
          </View>
        ) : !user ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Please log in to manage your AI voices</Text>
          </View>
        ) : voices.length === 0 ? (
          <View style={styles.emptyState}>
            <TouchableOpacity style={styles.createFirstVoiceCard} onPress={handleCreateVoice}>
              <LinearGradient
                colors={[theme.accent, '#7c3aed']}
                style={styles.createFirstVoiceGradient}
              >
                <View style={styles.createFirstVoiceContent}>
                  <View style={styles.createFirstVoiceIcon}>
                    <Mic size={32} color="#ffffff" />
                  </View>
                  <Text style={styles.createFirstVoiceTitle}>Create Your First AI Voice</Text>
                  <Text style={styles.createFirstVoiceDescription}>
                    Record voice samples to generate personalized AI narrations for your stories
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Voices ({voices.length})</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleCreateVoice}
              >
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {voices.map((voice) => (
              <VoiceCard key={voice.id} voice={voice} />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Create/Edit Voice Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingVoice ? 'Edit AI Voice' : 'Create New AI Voice'}
            </Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowCreateModal(false)}
            >
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Voice Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newVoiceName}
                onChangeText={setNewVoiceName}
                placeholder="e.g., My Storytelling Voice"
                placeholderTextColor={theme.secondaryText}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveVoice}
              >
                <Text style={styles.saveButtonText}>
                  {editingVoice ? 'Update Voice' : 'Create Voice'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.secondaryText,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.secondaryText,
  },
  emptyText: {
    fontSize: 16,
    color: theme.secondaryText,
    textAlign: 'center',
    marginVertical: 40,
  },
  createFirstVoiceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  createFirstVoiceGradient: {
    padding: 30,
    alignItems: 'center',
  },
  createFirstVoiceContent: {
    alignItems: 'center',
  },
  createFirstVoiceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  createFirstVoiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  createFirstVoiceDescription: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  voiceCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  voiceHeader: {
    marginBottom: 10,
  },
  voiceInfo: {
    flex: 1,
  },
  editButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  voiceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginRight: 8,
    elevation: 1,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  voiceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '400',
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: theme.secondaryText,
  },
  voiceActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  setupButton: {
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  setupButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  setupButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: theme.background,
    borderWidth: 2,
    borderColor: theme.border,
    gap: 6, 
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 14,
    color: theme.accent,
    fontWeight: '600',
  },
  primaryActionButton: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
    elevation: 2,
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  primaryActionText: {
    color: '#ffffff',
  },
  disabledActionButton: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    opacity: 0.5,
  },
  disabledActionText: {
    color: theme.secondaryText,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 2,
  },
  deleteButtonInline: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.mode === 'dark' ? theme.background : '#fee2e2',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.mode === 'dark' ? theme.border : '#fca5a5',
    minWidth: 44,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bottomSpacing: {
    height: 120,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.secondaryText,
  },
  saveButton: {
    backgroundColor: theme.accent,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});