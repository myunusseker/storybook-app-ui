import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  icon?: keyof typeof Feather.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  label?: string;
}

export default function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  label,
  ...props
}: InputFieldProps) {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        {icon && (
          <Feather 
            name={icon} 
            size={20} 
            color={theme.secondaryText} 
            style={styles.icon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            isPassword && styles.inputWithPasswordIcon,
            error && styles.inputError,
            {
              color: theme.text,
              borderColor: error ? '#ef4444' : theme.border,
              backgroundColor: theme.background,
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.secondaryText}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          textContentType="none"
          autoComplete="off"
          passwordRules=""
          importantForAutofill="no"
          autoCorrect={false}
          spellCheck={false}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputWithPasswordIcon: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  icon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    height: 48,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'left',
  },
});
