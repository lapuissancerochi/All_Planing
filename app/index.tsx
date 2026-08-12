import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Naviguer vers les tabs après la connexion
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.primaryContainer }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Card */}
          <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.outlineVariant + '40' }]}>
            
            {/* Header & Logo */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: themeColors.primary }]}>
                <SymbolView name={{ ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' }} size={28} tintColor={themeColors.onPrimary} />
              </View>
              <Text style={[styles.brandTitle, { color: themeColors.primary }]}>ALLPLANING</Text>
            </View>

            <View style={styles.welcomeTextContainer}>
              <Text style={[styles.welcomeTitle, { color: themeColors.onSurface }]}>Welcome Back</Text>
              <Text style={[styles.welcomeSubtitle, { color: themeColors.onSurfaceVariant }]}>Sign in to stay productive.</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.onSurface }]}>Email Address</Text>
                <View style={[styles.inputWrapper, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant }]}>
                  <SymbolView name={{ ios: 'envelope', android: 'mail', web: 'mail' }} size={20} tintColor={themeColors.outline} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: themeColors.onSurface }]}
                    placeholder="you@example.com"
                    placeholderTextColor={themeColors.outline}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.onSurface }]}>Password</Text>
                <View style={[styles.inputWrapper, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant }]}>
                  <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={20} tintColor={themeColors.outline} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: themeColors.onSurface }]}
                    placeholder="••••••••"
                    placeholderTextColor={themeColors.outline}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </View>

              {/* Forgot Password */}
              <View style={styles.forgotPasswordContainer}>
                <Pressable>
                  <Text style={[styles.forgotPasswordText, { color: themeColors.secondary }]}>Forgot Password?</Text>
                </Pressable>
              </View>

              {/* Sign In Button */}
              <Pressable 
                style={({ pressed }) => [
                  styles.loginBtn, 
                  { backgroundColor: themeColors.primary },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
                onPress={handleLogin}
              >
                <Text style={[styles.loginBtnText, { color: themeColors.onPrimary }]}>Sign In</Text>
                <SymbolView name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }} size={18} tintColor={themeColors.onPrimary} />
              </Pressable>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.outlineVariant + '50' }]} />
              <Text style={[styles.dividerText, { color: themeColors.onSurfaceVariant, backgroundColor: themeColors.surface }]}>Or continue with</Text>
            </View>

            {/* Social Buttons */}
            <View style={styles.socialContainer}>
              <Pressable style={({ pressed }) => [
                styles.socialBtn,
                { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant },
                pressed && { backgroundColor: themeColors.surfaceContainerLow }
              ]}>
                <SymbolView name={{ ios: 'globe', android: 'language', web: 'language' }} size={20} tintColor={themeColors.onSurfaceVariant} />
                <Text style={[styles.socialBtnText, { color: themeColors.onSurface }]}>Google</Text>
              </Pressable>
              
              <Pressable style={({ pressed }) => [
                styles.socialBtn,
                { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant },
                pressed && { backgroundColor: themeColors.surfaceContainerLow }
              ]}>
                <SymbolView name={{ ios: 'apple.logo', android: 'smartphone', web: 'smartphone' }} size={20} tintColor={themeColors.onSurfaceVariant} />
                <Text style={[styles.socialBtnText, { color: themeColors.onSurface }]}>Apple</Text>
              </Pressable>
            </View>

            {/* Sign up */}
            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, { color: themeColors.onSurfaceVariant }]}>Don't have an account? </Text>
              <Pressable>
                <Text style={[styles.signUpText, { color: themeColors.primary }]}>Sign up</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    shadowColor: '#1c1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 30,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    position: 'relative',
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  }
});
