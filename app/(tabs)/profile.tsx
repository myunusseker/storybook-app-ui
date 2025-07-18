import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Calendar, Mic, Pencil as Edit, VolumeX, Volume2, RefreshCw, Trash2, Camera, Bell, Moon, Download, Database, Shield, CircleHelp as HelpCircle, MessageCircle, Star, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [hasVoiceSetup, setHasVoiceSetup] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);
  
  // Edit mode state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('Sarah Johnson');
  const [editedEmail, setEditedEmail] = useState('sarah.johnson@email.com');
  const [nameWidth, setNameWidth] = useState(0);
  const nameTextRef = useRef<Text>(null);
  const nameInputRef = useRef<TextInput>(null);

  // Force re-measurement when text changes
  useEffect(() => {
    // Small delay to ensure the layout has updated
    const timer = setTimeout(() => {
      const currentRef = isEditingName ? nameInputRef.current : nameTextRef.current;
      if (currentRef && currentRef.measure) {
        currentRef.measure((x: number, y: number, width: number, height: number) => {
          setNameWidth(width);
        });
      }
    }, 10);
    
    return () => clearTimeout(timer);
  }, [editedName, isEditingName]);

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

  const handleEditName = () => {
    if (isEditingName) {
      // Save the name
      setIsEditingName(false);
    } else {
      // Start editing
      setIsEditingName(true);
    }
  };

  const handleCancelNameEdit = () => {
    // Reset to original value and exit edit mode
    setEditedName('Sarah Johnson');
    setIsEditingName(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => {
          // Handle logout logic
          console.log('Logging out...');
        }}
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'This will remove all downloaded stories and reset your preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          Alert.alert('Data Cleared', 'All local data has been removed.');
        }}
      ]
    );
  };

  // Custom Toggle Component to replace React Native Switch
  const CustomToggle = ({ 
    value, 
    onValueChange 
  }: { 
    value: boolean; 
    onValueChange: (value: boolean) => void; 
  }) => {
    const toggleWidth = 51;
    const toggleHeight = 31;
    const thumbSize = 27;
    const thumbMargin = 2;
    
    return (
      <TouchableOpacity
        style={[
          styles.customToggle,
          {
            backgroundColor: value ? '#c4b5fd' : '#d1d5db',
            width: toggleWidth,
            height: toggleHeight,
          }
        ]}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.customToggleThumb,
            {
              width: thumbSize,
              height: thumbSize,
              backgroundColor: value ? '#8b5cf6' : '#f4f4f5',
              transform: [{
                translateX: value 
                  ? toggleWidth - thumbSize - thumbMargin 
                  : thumbMargin
              }],
            }
          ]}
        />
      </TouchableOpacity>
    );
  };

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    hasToggle = false,
    toggleValue,
    onToggleChange,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    hasToggle?: boolean;
    toggleValue?: boolean;
    onToggleChange?: (value: boolean) => void;
  }) => {
    return (
      <View style={styles.settingsItem}>
        <TouchableOpacity
          style={styles.settingsItemLeft}
          onPress={onPress}
          activeOpacity={hasToggle ? 1 : 0.7}
          disabled={!onPress}
        >
          <View style={styles.settingsIcon}>{icon}</View>
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
          </View>
        </TouchableOpacity>

        {hasToggle && toggleValue !== undefined && onToggleChange ? (
          <CustomToggle value={toggleValue} onValueChange={onToggleChange} />
        ) : (
          showArrow && <ChevronRight size={20} color="#94a3b8" />
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#fdf2f8', '#f8fafc']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=200' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.nameContainer}>
            {isEditingName ? (
              <TextInput
                ref={nameInputRef}
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                onBlur={handleEditName}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setNameWidth(width);
                }}
                autoFocus
                placeholder="Enter your name"
              />
            ) : (
              <Text 
                ref={nameTextRef}
                style={styles.userName}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setNameWidth(width);
                }}
              >
                {editedName}
              </Text>
            )}
            <TouchableOpacity 
              onPress={handleEditName} 
              style={[
                styles.editNameButton,
                {
                  left: `50%`,
                  marginLeft: (nameWidth / 2) + 8, // Half the name width + 8px offset
                  marginTop: -4
                }
              ]}
            >
              <Edit size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userEmail}>{editedEmail}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>48h</Text>
            <Text style={styles.statLabel}>Listened</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your Information
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Calendar size={20} color="#8b5cf6" />
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>December 2024</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Voice</Text>
          {!hasVoiceSetup ? (
            <TouchableOpacity style={styles.voiceSetupCard} onPress={handleVoiceSetup}>
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Bell size={20} color="#8b5cf6" />}
              title="Push Notifications"
              subtitle="Get notified about new stories"
              hasToggle
              toggleValue={notifications}
              onToggleChange={setNotifications}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Volume2 size={20} color="#8b5cf6" />}
              title="Auto-play Next Story"
              subtitle="Automatically play the next story"
              hasToggle
              toggleValue={autoPlay}
              onToggleChange={setAutoPlay}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Moon size={20} color="#8b5cf6" />}
              title="Night Mode"
              subtitle="Darker interface for bedtime"
              hasToggle
              toggleValue={nightMode}
              onToggleChange={setNightMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloads</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Download size={20} color="#8b5cf6" />}
              title="Download Over WiFi Only"
              subtitle="Save mobile data"
              hasToggle
              toggleValue={downloadOverWifi}
              onToggleChange={setDownloadOverWifi}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Database size={20} color="#8b5cf6" />}
              title="Storage Used"
              subtitle="256 MB of downloaded stories"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Shield size={20} color="#8b5cf6" />}
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<HelpCircle size={20} color="#8b5cf6" />}
              title="Help Center"
              subtitle="Get answers to common questions"
              onPress={() => {}}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<MessageCircle size={20} color="#8b5cf6" />}
              title="Contact Support"
              subtitle="Get help from our team"
              onPress={() => {}}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Star size={20} color="#8b5cf6" />}
              title="Rate the App"
              subtitle="Help us improve"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Trash2 size={20} color="#ef4444" />}
              title="Clear Data"
              subtitle="Remove all downloaded content"
              onPress={handleClearData}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<LogOut size={20} color="#ef4444" />}
              title="Log Out"
              subtitle="Sign out of your account"
              onPress={handleLogout}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Storybook AI</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  nameContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 5,
    width: '100%',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
    paddingBottom: 2,
    minWidth: 200,
    textAlign: 'center',
  },
  editNameButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 15,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
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
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
    marginBottom: 3,
  },
  voiceStatusDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  voiceToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  voiceActionText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 75,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 5,
  },
  footerVersion: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomSpacing: {
    height: 100,
  },
  customToggle: {
    borderRadius: 15.5,
    justifyContent: 'center',
    position: 'relative',
  },
  customToggleThumb: {
    borderRadius: 13.5,
    position: 'absolute',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
});