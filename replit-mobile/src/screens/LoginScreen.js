import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { userAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !displayName) {
      alert('Please enter your email and display name');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.createUser({ email, display_name: displayName });
      // Navigate to main app
      navigation.replace('Main', { userId: response.data.id });
    } catch (error) {
      console.log('Login error:', error.message);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>CAPTURE</Text>
        <Text style={styles.subtitle}>Claim Your Territory</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor={COLORS.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Run, Walk, and Capture territories on the map
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 48,
    textAlign: 'center',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl * 2,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
