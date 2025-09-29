import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedCard } from '../../../components/ThemeWrapper';
import { EnhancedInput } from '../../../components/EnhancedInput';
import CustomButton from '../../../components/CustomButton';
import { FamiliesService } from '../../../services/apiservices/FamiliesService';
import { UsersService } from '../../../services/apiservices/UsersService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { UpdateUserRequest } from '../../../services/types';

const CreateFamilyScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [familyName, setFamilyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la familia');
      return;
    }

    setIsCreating(true);
    try {
      // Step 1: Create the family
      const newFamily = await FamiliesService.createFamily({ name: familyName }, '');
      console.log('newFamily', newFamily);
      if (!newFamily || !newFamily.id) {
        throw new Error('Failed to create family');
      }

      // Step 2: Update the user with the new familyId
      const userId = Number((user as any)?.id);
      if (!userId) {
        throw new Error('User ID not found');
      }

      const updateUserData: UpdateUserRequest = {
        familyId: Number(newFamily.id)
      };
      await UsersService.updateUser(userId, updateUserData, '');

      // Step 3: Navigate to the FamilyScreen
      navigation.navigate('Family');

    } catch (error) {
      console.error('Error creating family:', error);
      Alert.alert('Error', 'No se pudo crear la familia. Por favor intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
          <ThemedCard className="w-full items-center p-6">
            <ThemedText className="text-2xl font-bold mb-6 text-center">
              Crear Nueva Familia
            </ThemedText>
            
            <ThemedText className="text-base mb-6 text-center">
              Para comenzar, necesitamos crear una familia para ti. Podrás agregar más miembros después.
            </ThemedText>

            <View className="w-full mb-6">
              <EnhancedInput
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="Nombre de la familia"
                label="Nombre de la familia"
                autoCapitalize="words"
                autoCorrect={false}
                style={{
                  minHeight: 60,
                  fontSize: 16,
                }}
              />
            </View>
            
            <CustomButton
              title={isCreating ? 'Creando...' : 'Crear Familia'}
              onPress={handleCreateFamily}
              disabled={isCreating || !familyName.trim()}
              variant="primary"
              icon="people"
            />
          </ThemedCard>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

CreateFamilyScreen.displayName = 'CreateFamilyScreen';

export default CreateFamilyScreen;
