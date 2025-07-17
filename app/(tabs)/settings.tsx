import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Volume2, Moon, Shield, CircleHelp as HelpCircle, MessageCircle, Star, LogOut, ChevronRight, Download, Trash2, Database } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);

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

  const SettingsItem = ({ icon, title, subtitle, onPress, showArrow = true, rightComponent }: any) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsIcon}>
          {icon}
        </View>
        <View style={styles.settingsTextContainer}>
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && <ChevronRight size={20} color="#94a3b8" />)}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#fdf2f8', '#f8fafc']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Bell size={20} color="#8b5cf6" />}
              title="Push Notifications"
              subtitle="Get notified about new stories"
              onPress={() => setNotifications(!notifications)}
              showArrow={false}
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  thumbColor={notifications ? '#8b5cf6' : '#f4f4f5'}
                  trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Volume2 size={20} color="#8b5cf6" />}
              title="Auto-play Next Story"
              subtitle="Automatically play the next story"
              onPress={() => setAutoPlay(!autoPlay)}
              showArrow={false}
              rightComponent={
                <Switch
                  value={autoPlay}
                  onValueChange={setAutoPlay}
                  thumbColor={autoPlay ? '#8b5cf6' : '#f4f4f5'}
                  trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                />
              }
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Moon size={20} color="#8b5cf6" />}
              title="Night Mode"
              subtitle="Darker interface for bedtime"
              onPress={() => setNightMode(!nightMode)}
              showArrow={false}
              rightComponent={
                <Switch
                  value={nightMode}
                  onValueChange={setNightMode}
                  thumbColor={nightMode ? '#8b5cf6' : '#f4f4f5'}
                  trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                />
              }
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
              onPress={() => setDownloadOverWifi(!downloadOverWifi)}
              showArrow={false}
              rightComponent={
                <Switch
                  value={downloadOverWifi}
                  onValueChange={setDownloadOverWifi}
                  thumbColor={downloadOverWifi ? '#8b5cf6' : '#f4f4f5'}
                  trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                />
              }
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
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
    height: 50,
  },
});