import React, { useCallback, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../components/ThemeWrapper';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Name'>;

const NameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { signup, isLoading } = useAuth();
  const { username, email, password } = route.params;
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor, introduce tu nombre.');
      return;
    }
    try {
      setSubmitting(true);
      await signup(username, name.trim(), email, password);
      // AuthContext will flip to authenticated and AppWrapper will render the main stack
    } catch (e) {
      Alert.alert('Error', 'No se pudo completar el registro.');
    } finally {
      setSubmitting(false);
    }
  }, [name, signup, username, email, password]);

  return (
    <View style={styles.container}>
      <ThemedView style={styles.themedContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <View style={styles.content}>
            <ThemedText style={[styles.title, { color: colors.textPrimary }]}>¡Enhorabuena!</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>¿Cómo te llamas?</ThemedText>

            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }]}
              placeholder="Nombre completo"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />

            <ThemedTouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }, (isLoading || submitting) && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={isLoading || submitting}
              activeOpacity={0.8}
            >
              {isLoading || submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Finalizar</ThemedText>
              )}
            </ThemedTouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  themedContainer: { flex: 1 },
  keyboardContainer: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 420,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 18,
    marginBottom: 16,
  },
  submitButton: {
    width: '100%',
    maxWidth: 420,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default NameScreen;


