import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();



  const validateEmail = (email: string) => /.+@.+\..+/.test(email);
  const handleLogin = async () => {
    setError('');
    setFieldErrors({ name: '', email: '', password: '', confirmPassword: '' });
    
    let hasError = false;
    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email is required.' }));
      hasError = true;
    } else if (!validateEmail(email)) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      hasError = true;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required.' }));
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase auth listener will handle navigation
    } catch (err: any) {
      const errorCode = err.code;
      switch (errorCode) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setFieldErrors((prev) => ({ ...prev, email: 'Invalid email address.' }));
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle sign up
  const handleSignUp = async () => {
    setError('');
    setFieldErrors({ name: '', email: '', password: '', confirmPassword: '' });
    
    let hasError = false;
    if (!name.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: 'Name is required.' }));
      hasError = true;
    } else if (name.trim().length < 2) {
      setFieldErrors((prev) => ({ ...prev, name: 'Name must be at least 2 characters.' }));
      hasError = true;
    }
    
    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email is required.' }));
      hasError = true;
    } else if (!validateEmail(email)) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      hasError = true;
    }
    
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required.' }));
      hasError = true;
    } else if (password.length < 6) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
      hasError = true;
    }
    
    if (!confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password.' }));
      hasError = true;
    } else if (password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      hasError = true;
    }
    
    if (hasError) return;

    setLoading(true);
    try {
      console.log('Attempting signup with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signup successful! User:', userCredential.user.uid);
      await updateProfile(userCredential.user, { displayName: name.trim() });
      // Create user doc in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name.trim(),
        email,
        photoURL: '',
        createdAt: new Date().toISOString(),
      });
      console.log('User profile created in Firestore');
      // Firebase auth listener will handle navigation
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorCode = err.code;
      switch (errorCode) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/invalid-email':
          setFieldErrors((prev) => ({ ...prev, email: 'Invalid email address.' }));
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled.');
          break;
        case 'auth/weak-password':
          setFieldErrors((prev) => ({ ...prev, password: 'Password is too weak. Please choose a stronger password.' }));
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={theme.mode === 'dark' ? ['#23232a', '#18181b'] : ['#edceffff', '#fcd8ecff']}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
              />
              <Text style={[styles.title, { color: theme.accent }]}>Storybook AI</Text>
            </View>
            <View style={[styles.formContainer, { backgroundColor: theme.card }]}> 
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, fieldErrors.name && styles.inputError, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                    placeholder="Your Name"
                    placeholderTextColor={theme.secondaryText}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                  {fieldErrors.name ? <Text style={styles.errorText}>{fieldErrors.name}</Text> : null}
                </View>
              )}
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, fieldErrors.email && styles.inputError, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Email Address"
                  placeholderTextColor={theme.secondaryText}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {fieldErrors.email ? <Text style={styles.errorText}>{fieldErrors.email}</Text> : null}
              </View>
              <View style={styles.inputGroup}>
                <View style={styles.passwordInputRow}>
                  <TextInput
                    style={[styles.input, fieldErrors.password && styles.inputError, { flex: 1, color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                    placeholder="Password"
                    placeholderTextColor={theme.secondaryText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    textContentType="oneTimeCode"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType="default"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.secondaryText} />
                  </TouchableOpacity>
                </View>
                {fieldErrors.password ? <Text style={styles.errorText}>{fieldErrors.password}</Text> : null}
              </View>
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <View style={styles.passwordInputRow}>
                    <TextInput
                      style={[styles.input, fieldErrors.confirmPassword && styles.inputError, { flex: 1, color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                      placeholder="Confirm Password"
                      placeholderTextColor={theme.secondaryText}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      textContentType="oneTimeCode"
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                      keyboardType="default"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                      <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={theme.secondaryText} />
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.confirmPassword ? <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text> : null}
                </View>
              )}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.accent }, loading && styles.buttonDisabled]}
                onPress={isSignUp ? handleSignUp : handleLogin}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: '#fff' }]}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={[styles.switchText, { color: theme.accent }]}>
                  {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  formContainer: {
    marginHorizontal: 32,
    backgroundColor: '#fefaffff',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'left',
    fontSize: 13,
  },
  switchText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
  },
  inputWithIcon: {
    paddingRight: 44, // space for icon
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  iconButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    height: 48,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  // icon style is no longer needed with Feather icons
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  forgotText: {
    color: '#8b5cf6',
    fontSize: 14,
  },
  error: {
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 15,
  },
  signupText: {
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
    passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    height: 48,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
