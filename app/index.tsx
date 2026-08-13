import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Indispensable pour que le navigateur se referme correctement après la connexion Google
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [isLogin, setIsLogin] = useState(false); // Par défaut: Inscription (comme demandé)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage('Veuillez entrer une adresse email valide.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    
    setLoading(true);
    
    if (isLogin) {
      // Connexion
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) setErrorMessage(error.message);
    } else {
      // Inscription
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });
      if (error) {
        setErrorMessage(error.message);
      } else if (data.session) {
        Alert.alert('Succès', "Création réussie ! Vous êtes maintenant connecté.");
      } else {
        // Le mode "Confirm Email" est activé sur Supabase
        Alert.alert(
          'Vérifiez votre boîte mail',
          "Nous vous avons envoyé un lien de confirmation. Veuillez cliquer dessus pour activer votre compte."
        );
        setIsLogin(true); // Bascule automatiquement sur l'écran de connexion
      }
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage('');
      const redirectUrl = Linking.createURL('/');
      
      if (Platform.OS === 'web') {
        // Sur le web, Supabase gère la redirection tout seul
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
          },
        });
        if (error) setErrorMessage(error.message);
        return;
      }

      // Sur Mobile (iOS/Android)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No url returned');

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (res.type === 'success' && res.url) {
        // Extraire les paramètres de l'URL pour initialiser la session
        // (La gestion complète se fait souvent via un écouteur onAuthStateChange déjà en place)
        console.log("Connecté avec succès:", res.url);
      } else if (res.type === 'cancel') {
        setErrorMessage('Connexion Google annulée.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'La connexion Google a échoué.');
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Entrez votre email pour recevoir un lien de réinitialisation.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage('Veuillez entrer une adresse email valide.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) {
      setErrorMessage(error.message);
    } else {
      Alert.alert('Succès', 'Un lien de réinitialisation a été envoyé à votre adresse email.');
    }
    setLoading(false);
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
              <Text style={[styles.welcomeTitle, { color: themeColors.onSurface }]}>
                {isLogin ? "Bon retour !" : "Créer un compte"}
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: themeColors.onSurfaceVariant, textAlign: 'center' }]}>
                {isLogin 
                  ? "Connectez-vous pour retrouver vos tâches." 
                  : "Inscrivez-vous pour créer votre propre espace de planification personnel."}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {errorMessage ? (
                <View style={[styles.errorContainer, { backgroundColor: themeColors.errorContainer }]}>
                  <Text style={[styles.errorText, { color: themeColors.onErrorContainer }]}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: themeColors.onSurface }]}>Adresse Email</Text>
                <View style={[styles.inputWrapper, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant }]}>
                  <SymbolView name={{ ios: 'envelope', android: 'mail', web: 'mail' }} size={20} tintColor={themeColors.outline} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: themeColors.onSurface }]}
                    placeholder="jean@exemple.com"
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
                <Text style={[styles.label, { color: themeColors.onSurface }]}>Mot de passe</Text>
                <View style={[styles.inputWrapper, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant }]}>
                  <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={20} tintColor={themeColors.outline} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: themeColors.onSurface }]}
                    placeholder="••••••••"
                    placeholderTextColor={themeColors.outline}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <SymbolView 
                      name={{ ios: showPassword ? 'eye.slash' : 'eye', android: showPassword ? 'visibility_off' : 'visibility', web: showPassword ? 'visibility_off' : 'visibility' }} 
                      size={20} 
                      tintColor={themeColors.outline} 
                    />
                  </Pressable>
                </View>
              </View>

              {isLogin && (
                <View style={styles.forgotPasswordContainer}>
                  <Pressable onPress={handleForgotPassword}>
                    <Text style={[styles.forgotPasswordText, { color: themeColors.secondary }]}>Mot de passe oublié ?</Text>
                  </Pressable>
                </View>
              )}

              {/* Submit Button */}
              <Pressable 
                style={({ pressed }) => [
                  styles.loginBtn, 
                  { backgroundColor: themeColors.primary },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={[styles.loginBtnText, { color: themeColors.onPrimary }]}>
                  {loading ? 'Patientez...' : (isLogin ? "Se connecter" : "S'inscrire")}
                </Text>
                <SymbolView name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }} size={18} tintColor={themeColors.onPrimary} />
              </Pressable>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: themeColors.outlineVariant }]} />
                <Text style={[styles.dividerText, { color: themeColors.outline }]}>ou</Text>
                <View style={[styles.divider, { backgroundColor: themeColors.outlineVariant }]} />
              </View>

              {/* Google Sign-In Button */}
              <Pressable 
                style={({ pressed }) => [
                  styles.socialBtn, 
                  { borderColor: themeColors.outlineVariant },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }], backgroundColor: themeColors.surfaceVariant }
                ]}
                onPress={handleGoogleSignIn}
              >
                <SymbolView name={{ ios: 'g.circle.fill', android: 'google', web: 'google' }} size={24} tintColor="#EA4335" />
                <Text style={[styles.socialBtnText, { color: themeColors.onSurface }]}>Continuer avec Google</Text>
              </Pressable>

            </View>

            {/* Toggle Mode */}
            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, { color: themeColors.onSurfaceVariant }]}>
                {isLogin ? "Vous n'avez pas de compte ? " : "Vous avez déjà un compte ? "}
              </Text>
              <Pressable onPress={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); }}>
                <Text style={[styles.signUpText, { color: themeColors.primary }]}>
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </Text>
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
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
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
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
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
