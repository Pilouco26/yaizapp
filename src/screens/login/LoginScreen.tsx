import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  ActivityIndicator, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../components/ThemeWrapper';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface LoginScreenProps {
  onLogin?: (username: string, password: string) => Promise<void>;
  onSignup?: (username: string, name: string, email: string, password: string) => Promise<void>;
  onMetaLogin?: () => Promise<void>;
  onBiometricLogin?: () => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  username: string;
  name: string;
  email: string;
  password: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  username?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin, 
  onSignup, 
  onMetaLogin, 
  onBiometricLogin,
  isLoading
}) => {
  const { colors } = useTheme();
  const { login, signup, loginWithMeta, loginWithBiometric, isLoading: authLoading } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  // Provide fallbacks from AuthContext when props are not supplied
  const handleLogin = onLogin ?? login;
  const handleSignup = onSignup ?? signup;
  const handleMetaLogin = onMetaLogin ?? loginWithMeta;
  const handleBiometricLogin = onBiometricLogin ?? loginWithBiometric;
  const loading = typeof isLoading === 'boolean' ? isLoading : authLoading;
  const [isSignup, setIsSignup] = useState(false);
  const [signupStep, setSignupStep] = useState<'account' | 'name'>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    name: '',
    email: 'demo@example.com',
    password: 'Demo123!'
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  // Password requirements
  const passwordRequirements = [
    { text: 'Al menos 8 caracteres', met: false },
    { text: 'Una letra mayúscula', met: false },
    { text: 'Una letra minúscula', met: false },
    { text: 'Un número', met: false },
    { text: 'Un carácter especial', met: false }
  ];

  // Check biometric availability on component mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Check if biometric authentication is available
  const checkBiometricAvailability = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      console.log('Biometric check - Hardware:', hasHardware, 'Enrolled:', isEnrolled);
      
      if (hasHardware && isEnrolled) {
        const biometricTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        console.log('Supported biometric types:', biometricTypes);
        
        // Only enable if Face ID or Touch ID is available
        const hasFaceID = biometricTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
        const hasTouchID = biometricTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
        
        console.log('Face ID available:', hasFaceID, 'Touch ID available:', hasTouchID);
        
        if (hasFaceID || hasTouchID) {
          setIsBiometricAvailable(true);
          
          if (hasFaceID) {
            setBiometricType('Face ID');
            console.log('Face ID enabled');
          } else if (hasTouchID) {
            setBiometricType('Touch ID');
            console.log('Touch ID enabled');
          }
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  }, []);

  // Handle biometric authentication
  const handleBiometricAuth = useCallback(async () => {
    if (!isBiometricAvailable || !handleBiometricLogin) return;

    console.log('Starting biometric authentication...');
    console.log('Biometric type:', biometricType);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Usa Face ID para acceder a YaizApp',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: true, // This forces biometric-only authentication
        cancelLabel: 'Cancelar',
      });

      console.log('Biometric authentication result:', result);

      if (result.success) {
        console.log('Biometric authentication successful');
        await handleBiometricLogin();
      } else if (result.error === 'user_cancel') {
        console.log('User cancelled biometric authentication');
        // User cancelled, no need to show error
        return;
      } else if (result.error === 'not_available') {
        console.log('Biometric not available');
        Alert.alert(
          'Biometría no disponible',
          'Face ID no está disponible en este momento. Intenta de nuevo.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('Biometric authentication failed:', result.error);
        Alert.alert(
          'Error de autenticación',
          'No se pudo completar la autenticación biométrica. Intenta de nuevo.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert(
        'Error',
        'Error al acceder a la autenticación biométrica.',
        [{ text: 'OK' }]
      );
    }
  }, [isBiometricAvailable, handleBiometricLogin, biometricType]);

  // Validate password strength
  const validatePassword = useCallback((password: string) => {
    const requirements = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    return requirements.map((met, index) => ({
      text: passwordRequirements[index].text,
      met
    }));
  }, []);

  // Validate email format
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Handle input changes with validation
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Validate password in real-time
    if (field === 'password') {
      const requirements = validatePassword(value);
      // Update password requirements visually
    }
  }, [errors, validatePassword]);

  // Username availability check (debounced)
  useEffect(() => {
    let timer: any;
    async function check() {
      try {
        if (!isSignup || signupStep !== 'account') return;
        const username = formData.username.trim();
        if (username.length < 3) {
          setIsUsernameAvailable(null);
          return;
        }
        setCheckingUsername(true);
        const { UsersService } = await import('../../services/apiservices/UsersService');
        const res = await UsersService.searchAvailability(username);
        setIsUsernameAvailable(res.available);
      } catch (e) {
        setIsUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }
    if (formData.username) {
      timer = setTimeout(check, 400);
    } else {
      setIsUsernameAvailable(null);
    }
    return () => timer && clearTimeout(timer);
  }, [formData.username, isSignup, signupStep]);

  // Email availability check (debounced)
  useEffect(() => {
    let timer: any;
    async function check() {
      try {
        if (!isSignup || signupStep !== 'account') return;
        const email = formData.email.trim();
        if (!validateEmail(email)) {
          setIsEmailAvailable(null);
          return;
        }
        setCheckingEmail(true);
        const { UsersService } = await import('../../services/apiservices/UsersService');
        const res = await UsersService.searchAvailabilityByEmail(email);
        setIsEmailAvailable(res.available);
      } catch (e) {
        setIsEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }
    if (formData.email) {
      timer = setTimeout(check, 400);
    } else {
      setIsEmailAvailable(null);
    }
    return () => timer && clearTimeout(timer);
  }, [formData.email, isSignup, signupStep, validateEmail]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: ValidationErrors = {};
    // Step-specific validation
    if (isSignup && signupStep === 'name' && !formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (isSignup && signupStep === 'account') {
      if (!formData.username.trim()) {
        (newErrors as any).username = 'El usuario es requerido';
      }
      if (isUsernameAvailable === false) {
        (newErrors as any).username = 'El usuario no está disponible';
      }
    }

    // For login, validate username instead of email
    if (!isSignup) {
      if (!formData.username.trim()) {
        (newErrors as any).username = 'El usuario es requerido';
      }
    } else {
      // For signup, validate email
      if (!formData.email.trim()) {
        newErrors.email = 'El email es requerido';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Formato de email inválido';
      } else if (signupStep === 'account' && isEmailAvailable === false) {
        newErrors.email = 'El email no está disponible';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (isSignup && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isSignup, signupStep, validateEmail, isUsernameAvailable, isEmailAvailable]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isSignup) {
        if (signupStep === 'account') {
          // Navigate to dedicated name screen
          navigation.navigate('Name', {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
          });
          setIsSubmitting(false);
          return;
        }
        // Finalize signup
        await handleSignup(formData.username, formData.name, formData.email, formData.password);
      } else {
        await handleLogin(formData.username.trim(), formData.password);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        isSignup ? 'Error al crear la cuenta' : 'Error al iniciar sesión',
        [{ text: 'OK' }]
      );
      console.log("error", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSignup, signupStep, validateForm, handleSignup, handleLogin]);

  const currentPasswordRequirements = validatePassword(formData.password);

  return (
    <View style={styles.container}>
      <ThemedView style={styles.themedContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <View style={styles.content}>
          {/* App Logo/Icon */}
              <View style={styles.logoContainer}>
            <View 
                  style={[styles.logoBackground, { backgroundColor: colors.primary + '20' }]}
            >
                  <Ionicons name="wallet" size={48} color={colors.primary} />
            </View>
                <ThemedText style={styles.appTitle}>
              YaizApp
            </ThemedText>
                <ThemedText style={styles.appSubtitle} variant="secondary">
              Gestiona tus ahorros y facturas
            </ThemedText>
          </View>
          
              {/* Form Container */}
              <View style={styles.formContainer}>
                {/* Toggle between Login and Signup */}
                <View style={styles.toggleContainer}>
                  <ThemedTouchableOpacity
                    style={[
                      styles.toggleButton,
                      !isSignup && styles.toggleButtonActive
                    ]}
                    onPress={() => {
                      setIsSignup(false);
                      // Clear any existing errors when switching
                      setErrors({});
                    }}
                    activeOpacity={0.7}
                  >
                    <ThemedText 
                      style={[
                        styles.toggleButtonText,
                        !isSignup && styles.toggleButtonTextActive
                      ]}
                    >
                      Iniciar Sesión
                    </ThemedText>
                  </ThemedTouchableOpacity>
                  <ThemedTouchableOpacity
                    style={[
                      styles.toggleButton,
                      isSignup && styles.toggleButtonActive
                    ]}
                    onPress={() => {
                      setIsSignup(true);
                      // Clear any existing errors when switching
                      setErrors({});
                    }}
                    activeOpacity={0.7}
                  >
                    <ThemedText 
                      style={[
                        styles.toggleButtonText,
                        isSignup && styles.toggleButtonTextActive
                      ]}
                    >
                      Crear Cuenta
            </ThemedText>
                  </ThemedTouchableOpacity>
                </View>

                {/* Social Login */}
                {!isSignup && (
                  <View style={styles.socialContainer}>
              <ThemedTouchableOpacity 
                      style={[
                        styles.socialButton,
                        (loading || isSubmitting) && styles.buttonDisabled
                      ]}
                onPress={handleMetaLogin}
                      disabled={loading || isSubmitting}
                    >
                      <View style={styles.socialIconsContainer}>
                        <Ionicons name="logo-facebook" size={20} color="#ffffff" />
                        <Ionicons name="logo-instagram" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                      </View>
                      <ThemedText style={styles.socialButtonText}>
                  Continuar con Meta
                </ThemedText>
              </ThemedTouchableOpacity>
            </View>
                )}
            
            {/* Divider */}
                {!isSignup && (
                  <View style={styles.dividerContainer}>
                    <View style={[styles.dividerLine, { backgroundColor: colors.textTertiary }]} />
                    <ThemedText style={styles.dividerText} variant="tertiary">
                o
              </ThemedText>
                    <View style={[styles.dividerLine, { backgroundColor: colors.textTertiary }]} />
                  </View>
                )}

                {/* Form Fields */}
                <View style={styles.fieldsContainer}>
                  {/* Username field (login mode, or signup account step) */}
                  {(!isSignup || (isSignup && signupStep === 'account')) && (
                    <View style={styles.fieldContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          { 
                            borderColor: (errors as any).username ? '#ef4444' : colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary
                          }
                        ]}
                        placeholder="Nombre de usuario"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.username}
                        onChangeText={(value) => handleInputChange('username', value)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        contextMenuHidden={false}
                        selectTextOnFocus={false}
                      />
                      {isSignup ? (
                        ((errors as any).username || isUsernameAvailable !== null) && (
                          <ThemedText style={[styles.errorText, { color: (errors as any).username ? '#ef4444' : (isUsernameAvailable ? '#10b981' : '#ef4444') }]}>
                            {(errors as any).username ? (errors as any).username : (checkingUsername ? 'Comprobando disponibilidad...' : (isUsernameAvailable ? 'Usuario disponible' : 'Usuario no disponible'))}
                          </ThemedText>
                        )
                      ) : (
                        (errors as any).username && (
                          <ThemedText style={styles.errorText}>
                            {(errors as any).username}
                          </ThemedText>
                        )
                      )}
                    </View>
                  )}

                  {/* Email field (only for signup) */}
                  {isSignup && (
                    <View style={styles.fieldContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          { 
                            borderColor: errors.email ? '#ef4444' : colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary
                          }
                        ]}
                        placeholder="Correo electrónico"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        contextMenuHidden={false}
                        selectTextOnFocus={false}
                      />
                      {(errors.email || (signupStep === 'account' && isEmailAvailable !== null)) && (
                        <ThemedText style={[styles.errorText, { color: errors.email ? '#ef4444' : (isEmailAvailable ? '#10b981' : '#ef4444') }]}>
                          {errors.email ? errors.email : (checkingEmail ? 'Comprobando disponibilidad...' : (isEmailAvailable ? 'Email disponible' : 'Email no disponible'))}
                        </ThemedText>
                      )}
                    </View>
                  )}

                  {/* Password field */}
                  <View style={styles.fieldContainer}>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          styles.passwordInput,
                          { 
                            borderColor: errors.password ? '#ef4444' : colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary
                          }
                        ]}
                        placeholder="Contraseña"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        contextMenuHidden={false}
                        selectTextOnFocus={false}
                      />
                      <ThemedTouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={showPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color={colors.textSecondary} 
                        />
                      </ThemedTouchableOpacity>
                    </View>
                    {errors.password && (
                      <ThemedText style={styles.errorText}>
                        {errors.password}
                      </ThemedText>
                    )}
                  </View>

                  {/* Password requirements (only for signup & account step) */}
                  {isSignup && signupStep === 'account' && formData.password.length > 0 && (
                    <View style={[styles.requirementsContainer, { backgroundColor: colors.surfaceSecondary }]}>
                      <ThemedText style={styles.requirementsTitle} variant="secondary">
                        Requisitos de contraseña:
                      </ThemedText>
                      {currentPasswordRequirements.map((req, index) => (
                        <View key={index} style={styles.requirementItem}>
                          <Ionicons 
                            name={req.met ? "checkmark-circle" : "ellipse-outline"} 
                            size={16} 
                            color={req.met ? "#10b981" : colors.textTertiary} 
                          />
                          <ThemedText 
                            style={[
                              styles.requirementText,
                              { color: req.met ? "#10b981" : colors.textTertiary }
                            ]}
                          >
                            {req.text}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
            </View>
            
                {/* Congratulations / Name Step */}
                {isSignup && signupStep === 'name' && (
                  <View style={[styles.fieldsContainer, { marginTop: 8 }] }>
                    <ThemedText style={{ fontSize: 20, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>
                      ¡Enhorabuena!
                    </ThemedText>
                    <ThemedText style={{ fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
                      ¿Cómo te llamas?
                    </ThemedText>
                    <View style={styles.fieldContainer}>
                      <TextInput
                        style={[
                          styles.input,
                          { 
                            borderColor: errors.name ? '#ef4444' : colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary
                          }
                        ]}
                        placeholder="Nombre completo"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                        autoCapitalize="words"
                        autoCorrect={false}
                        contextMenuHidden={false}
                        selectTextOnFocus={false}
                      />
                      {errors.name && (
                        <ThemedText style={styles.errorText}>
                          {errors.name}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                )}

                {/* Submit Button */}
            <ThemedTouchableOpacity 
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    (loading || isSubmitting) && styles.buttonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={loading || isSubmitting}
                >
                  {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                    <Ionicons 
                      name={isSignup ? (signupStep === 'account' ? "arrow-forward" : "person-add") : "log-in"} 
                      size={20} 
                      color="#ffffff" 
                    />
                  )}
                  <ThemedText style={styles.submitButtonText}>
                    {isSubmitting
                      ? (isSignup ? (signupStep === 'account' ? 'Continuando...' : 'Creando cuenta...') : 'Iniciando...')
                      : (isSignup ? (signupStep === 'account' ? 'Continuar' : 'Finalizar') : 'Iniciar Sesión')}
              </ThemedText>
            </ThemedTouchableOpacity>

                {/* Biometric Button - Only show for login and when biometric is available */}
                {!isSignup && isBiometricAvailable && (
                  <ThemedTouchableOpacity 
                    style={[
                      styles.biometricButton,
                      { 
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border
                      },
                      (loading || isSubmitting) && styles.buttonDisabled
                    ]}
                    onPress={handleBiometricAuth}
                    disabled={loading || isSubmitting}
                  >
                    <Ionicons 
                      name={biometricType === 'Face ID' ? "scan" : "finger-print"} 
                      size={20} 
                      color={colors.primary} 
                    />
                    <ThemedText style={[styles.biometricButtonText, { color: colors.primary }]}>
                      Acceso biométrico
                    </ThemedText>
                  </ThemedTouchableOpacity>
                )}
          </View>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themedContainer: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#6b7280',
    fontSize: 14,
  },
  toggleButtonTextActive: {
    color: '#2563eb',
  },
  socialContainer: {
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1877F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    color: '#ffffff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  fieldsContainer: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 64,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -16 }],
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  requirementsContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 8,
  },
  submitButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5.84,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default LoginScreen; 