import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Calendar, Mic, Pencil as Edit, VolumeX, Volume2, RefreshCw, Trash2, Camera, Bell, Moon, Download, Database, Shield, CircleHelp as HelpCircle, MessageCircle, Star, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { signOut, updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  // Voice setup state and logic moved to ai_voices.tsx
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);
  const { theme, mode, setThemeMode } = useTheme();
  const styles = getStyles(theme);
  
  // User profile state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [nameWidth, setNameWidth] = useState(0);
  const nameTextRef = useRef<Text>(null);
  const nameInputRef = useRef<TextInput>(null);
  // Fetch user profile info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        setEditedEmail(user.email || '');
        setPhotoURL(user.photoURL || '');
        // Try to get name from displayName, fallback to Firestore
        if (user.displayName) {
          setEditedName(user.displayName);
        } else {
          // fallback to Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setEditedName(data.name || '');
            setCreatedAt(data.createdAt || '');
          }
        }
        // Always try to get createdAt from Firestore
        if (user.uid) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCreatedAt(data.createdAt || '');
          }
        }
      } catch (e) {
        // ignore
      }
    };
    fetchProfile();
  }, []);

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

  // Change photo logic
  const handleChangePhoto = async () => {
    try {
      // Ask for permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // Optionally, you can show a toast or inline error here
        return;
      }
      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // disables cropping/zooming
        quality: 0.7,
        allowsMultipleSelection: false,
      });
      if (result.canceled) return;
      setUploadingPhoto(true);
      const user = auth.currentUser;
      if (!user) throw new Error('Not logged in');
      const imageUri = result.assets[0].uri;
      // Upload to Firebase Storage
      const storage = getStorage();
      const ext = imageUri.split('.').pop();
      const storageRef = ref(storage, `profile_photos/${user.uid}.${ext}`);
      // Convert to blob
      let blob;
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        blob = await response.blob();
      } else {
        const response = await fetch(imageUri);
        blob = await response.blob();
      }
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      // Update Auth
      await updateProfile(user, { photoURL: downloadURL });
      setPhotoURL(downloadURL);
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });
      // No alert, just hide loader
    } catch (e) {
      // Optionally, you can show a toast or inline error here
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEditName = async () => {
    if (isEditingName) {
      // Save the name to Firebase Auth and Firestore
      try {
        const user = auth.currentUser;
        if (user && editedName.trim()) {
          // Update displayName in Auth
          await updateProfile(user, { displayName: editedName.trim() });
          // Update name in Firestore
          await updateDoc(doc(db, 'users', user.uid), { name: editedName.trim() });
        }
      } catch (e) {
        // Optionally show error
      }
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
        { text: 'Log Out', style: 'destructive', onPress: async () => {
            try {
              await signOut(auth);
              // Firebase auth listener will handle navigation
            } catch (e) {
              Alert.alert('Logout Failed', 'Could not log out.');
            }
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
            backgroundColor: value ? theme.accent + '80' : theme.background,
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
              backgroundColor: value ? theme.accent : theme.border,
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
          showArrow && <ChevronRight size={20} color={theme.secondaryText} />
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={theme.gradientBackground.colors}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: photoURL || `https://avatar.iran.liara.run/username?username=${editedName || editedEmail || 'User'}` }}
              style={styles.profileImage}
            />
            {uploadingPhoto && (
              <View style={styles.profileImageLoadingOverlay}>
                <ActivityIndicator size="large" color={theme.accent} />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handleChangePhoto} disabled={uploadingPhoto}>
              <Camera size={16} color={uploadingPhoto ? theme.secondaryText : theme.accent} />
            </TouchableOpacity>
          </View>
          <View style={[styles.nameContainer, { flexDirection: 'row', justifyContent: 'center', marginLeft: 24}]}>
            {isEditingName ? (
              <TextInput
                ref={nameInputRef}
                value={editedName}
                style={styles.userName}
                onChangeText={setEditedName}
                onBlur={handleEditName}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setNameWidth(width);
                }}
                autoFocus
                placeholder="Enter your name"
                placeholderTextColor={theme.secondaryText}
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
                  marginLeft: 8, // Half the name width + 8px offset
                }
              ]}
            >
              <Edit size={16} color={theme.accent} />
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
              <Calendar size={20} color={theme.accent} />
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{createdAt ? new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : ''}</Text>
            </View>
            <View style={styles.infoItem}>
              <Star size={20} color={theme.accent} />
              <Text style={styles.infoLabel}>Membership Tier</Text>
              <Text style={styles.infoValue}>Free</Text>
            </View>
          </View>
        </View>

        {/* AI Voice section moved to ai_voices.tsx */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Bell size={20} color={theme.accent} />}
              title="Push Notifications"
              subtitle="Get notified about new stories"
              hasToggle
              toggleValue={notifications}
              onToggleChange={setNotifications}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Volume2 size={20} color={theme.accent} />}
              title="Auto-play Next Story"
              subtitle="Automatically play the next story"
              hasToggle
              toggleValue={autoPlay}
              onToggleChange={setAutoPlay}
            />
            <View style={styles.settingsDivider} />
            <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Moon size={20} color={theme.accent} />
              <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16, flex: 1 }}>Theme</Text>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: mode === 'system' ? theme.accent : theme.card,
                  marginRight: 4,
                }}
                onPress={() => setThemeMode('system')}
              >
                <Text style={{ color: mode === 'system' ? '#fff' : theme.text, fontWeight: '600' }}>System</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: mode === 'light' ? theme.accent : theme.card,
                  marginRight: 4,
                }}
                onPress={() => setThemeMode('light')}
              >
                <Text style={{ color: mode === 'light' ? '#fff' : theme.text, fontWeight: '600' }}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: mode === 'dark' ? theme.accent : theme.card,
                }}
                onPress={() => setThemeMode('dark')}
              >
                <Text style={{ color: mode === 'dark' ? '#fff' : theme.text, fontWeight: '600' }}>Dark</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloads</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Download size={20} color={theme.accent} />}
              title="Download Over WiFi Only"
              subtitle="Save mobile data"
              hasToggle
              toggleValue={downloadOverWifi}
              onToggleChange={setDownloadOverWifi}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Database size={20} color={theme.accent} />}
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
              icon={<Shield size={20} color={theme.accent} />}
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
              icon={<HelpCircle size={20} color={theme.accent} />}
              title="Help Center"
              subtitle="Get answers to common questions"
              onPress={() => {}}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<MessageCircle size={20} color={theme.accent} />}
              title="Contact Support"
              subtitle="Get help from our team"
              onPress={() => {}}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Star size={20} color={theme.accent} />}
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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  profileImageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 80,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginTop: 20,
    marginBottom: 15,
  },
  profileImage: {
    width: '40%',
    aspectRatio: 1,
    resizeMode: 'cover',
    borderRadius: 80,
    borderWidth: 2,
    borderColor: theme.card,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.card,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
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
    color: theme.text,
    borderBottomWidth: 2,
    borderBottomColor: theme.accent,
    paddingBottom: 2,
    minWidth: 200,
    textAlign: 'center',
  },
  editNameButton: {
    position: 'relative',
  },
  userEmail: {
    fontSize: 16,
    color: theme.secondaryText,
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.card,
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
    color: theme.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: theme.secondaryText,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.border,
    marginHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: theme.card,
    borderRadius: 15,
    padding: 20,
    paddingBottom: 5,
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
    color: theme.secondaryText,
    marginLeft: 15,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: theme.text,
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
  settingsCard: {
    backgroundColor: theme.card,
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
    backgroundColor: theme.background,
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
    color: theme.text,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: theme.secondaryText,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 75,
  },
  settingsLabel: {
    fontSize: 16,
    color: theme.text,
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
    color: theme.accent,
    marginBottom: 5,
  },
  footerVersion: {
    fontSize: 14,
    color: theme.secondaryText,
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