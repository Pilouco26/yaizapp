import React, { useState, useEffect } from 'react';
import { View, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedCard } from '../../../components/ThemeWrapper';
import { EnhancedInput } from '../../../components/EnhancedInput';
import CustomButton from '../../../components/CustomButton';
import { FamiliesService } from '../../../services/apiservices/FamiliesService';
import { UsersService } from '../../../services/apiservices/UsersService';
import { NotificationsService } from '../../../services/apiservices/NotificationsService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
// Remove hardcoded constants; use authenticated user info instead

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  addedDate: string;
}

const FamilyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [familyName, setFamilyName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingFamily, setIsLoadingFamily] = useState(true);
  const [hasFamily, setHasFamily] = useState(false);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        // Step 1: Fetch current user using authenticated user id if available
        const authUserId = Number((user as any)?.id) || undefined;
        const currentUser = authUserId ? await UsersService.getUserById(authUserId) : null;
        
        if (!currentUser) {
          console.error('❌ Current user not found - API returned null/undefined');
          throw new Error('Current user not found');
        }
        const userFamilyId = (currentUser as any).familyId;
        
        if (!userFamilyId) {
          // User has no family, set state to show create family button
          setHasFamily(false);
          setFamilyName('');
          setFamilyMembers([]);
          return;
        }
        
        // Step 2: Fetch family using the familyId
        const families = await FamiliesService.searchFamilies({ id: String(userFamilyId) });
        
        if (families && families.length > 0) {
          const family = families[0];
          
          setFamilyName((family as any).name ?? 'Familia');
          const usersArr = (family as any).users || [];
          
          const mapped = usersArr.map((u: any) => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: authUserId && u.id === authUserId ? 'admin' : 'member',
            addedDate: u.createdAt ?? new Date().toISOString(),
          }));
          
          setFamilyMembers(mapped);
          setHasFamily(true);
        } else {
          // Family not found, set state to show create family button
          setHasFamily(false);
          setFamilyName('');
          setFamilyMembers([]);
          return;
        }
      } catch (error) {
        console.error('❌ Failed to fetch family data:');
        console.error('Error type:', typeof error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Full error object:', error);
        
        // If error is 404 (family not found), set state to show create family button
        if (error instanceof Error && error.message.includes('404')) {
          setHasFamily(false);
          setFamilyName('');
          setFamilyMembers([]);
          return;
        }
        
        // For other errors, show fallback data
        setFamilyName('Familia Demo');
        setFamilyMembers([
          {
            id: '1',
            name: 'Usuario Principal',
            email: 'usuario@ejemplo.com',
            role: 'admin',
            addedDate: '2024-01-01',
          },
        ]);
        setHasFamily(true);
      } finally {
        setIsLoadingFamily(false);
      }
    };
    fetchFamily();
  }, [navigation]);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre de usuario');
      return;
    }

    setIsAddingMember(true);
    try {
      // 1. Search user by username using UsersService
      const matchedUsers = await UsersService.searchUsers({ username: newMemberEmail });
      const targetUser = matchedUsers.length > 0 ? matchedUsers[0] : null;

      if (!targetUser) {
        throw new Error('Usuario no encontrado');
      }

      // 2. Get current user details to extract username and family ID
      const currentUserId = Number((user as any)?.id);
      const currentUser = currentUserId ? await UsersService.getUserById(currentUserId) : null;
      const currentUsername = currentUser?.username || 'Usuario';
      const currentUserFamilyId = (currentUser as any)?.familyId;

      if (!currentUserFamilyId) {
        Alert.alert('Error', 'No tienes una familia asignada');
        return;
      }

      // 3. Build notification payload
      const notificationBody = {
        userId: String(targetUser.id),
        title: `${currentUsername} wants you to add to his family`,
        message: String(currentUserFamilyId), // Send the family ID instead of user ID
        type: 'FRIEND' as const,
      };

      // 4. Send notification via NotificationsService
      try {
        await NotificationsService.createNotification(notificationBody as any);
        setNewMemberEmail('');
        Alert.alert('Éxito', 'Notificación enviada al usuario');
      } catch (notifErr) {
        console.error('Error enviando notificación:', notifErr);
        Alert.alert('Error', 'No se pudo enviar la notificación');
      }
    } catch (error) {
      Alert.alert('Error', 'No se ha encontrado el usuario');
    } finally {
      setIsAddingMember(false);
    }
  };



  const renderFamilyMember = ({ item }: { item: FamilyMember }) => (
    <ThemedTouchableOpacity
      className="flex-row items-center p-4 rounded-xl mb-3"
      variant="surfaceSecondary"
      style={{
        minHeight: 70,
      }}
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <ThemedText className="text-lg font-semibold mr-2">
            {item.name}
          </ThemedText>
        </View>
        <ThemedText className="text-sm text-gray-600">
          {item.email}
        </ThemedText>
        <ThemedText className="text-xs text-gray-500 mt-1">
          Agregado: {new Date(item.addedDate).toLocaleDateString('es-ES')}
        </ThemedText>
      </View>
    </ThemedTouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
          {isLoadingFamily ? (
            <ThemedCard className="w-full items-center p-6">
              <View className="items-center justify-center py-8">
                <Ionicons 
                  name="hourglass-outline" 
                  size={64} 
                  color={colors.textTertiary} 
                />
                <ThemedText className="text-lg font-medium mt-4 text-center">
                  Cargando familia...
                </ThemedText>
              </View>
            </ThemedCard>
          ) : !hasFamily ? (
            // No family - show create family button
            <ThemedCard className="w-full items-center p-6">
              <ThemedText className="text-2xl font-bold mb-6 text-center">
                Crear Familia
              </ThemedText>
              
              <ThemedText className="text-base mb-6 text-center">
                Aún no tienes una familia. Crea una para comenzar a gestionar tus finanzas familiares.
              </ThemedText>

              <CustomButton
                title="Crear Nueva Familia"
                onPress={() => navigation.navigate('CreateFamily')}
                variant="primary"
                icon="people"
              />
            </ThemedCard>
          ) : (
            // Has family - show family management UI
            <>
              {/* Add Member Section */}
              <ThemedCard className="w-full items-center mb-6 p-6">
                <View className="w-full mb-4">
                  <EnhancedInput
                    value={newMemberEmail}
                    onChangeText={setNewMemberEmail}
                    placeholder="Ingresa el usuario del miembro"
                    label="Usuario del miembro"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      minHeight: 60,
                      fontSize: 16,
                    }}
                  />
                </View>
                
                <CustomButton
                  title={isAddingMember ? 'Agregando...' : 'Agregar Miembro'}
                  onPress={handleAddMember}
                  disabled={isAddingMember || !newMemberEmail.trim()}
                  variant="primary"
                  icon="person-add"
                />
              </ThemedCard>

              {/* Divider Line */}
              <View className="w-full h-px bg-neutral-300 mb-6" />

              {/* Family Members List */}
              <ThemedCard className="w-full p-6">
                <ThemedText className="text-lg font-semibold mb-4 text-center">
                  {familyName ? familyName : 'Familia'} ({familyMembers.length})
                </ThemedText>
                
                {familyMembers.length === 0 ? (
                  <View className="items-center justify-center py-8">
                    <Ionicons 
                      name="people-outline" 
                      size={64} 
                      color={colors.textTertiary} 
                    />
                    <ThemedText className="text-lg font-medium mt-4 text-center">
                      No hay miembros en la familia
                    </ThemedText>
                    <ThemedText className="text-sm text-gray-500 mt-2 text-center">
                      Agrega miembros usando el formulario de arriba
                    </ThemedText>
                  </View>
                ) : (
                  <FlatList
                    data={familyMembers}
                    renderItem={renderFamilyMember}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
                )}
              </ThemedCard>
            </>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

FamilyScreen.displayName = 'FamilyScreen';

export default FamilyScreen;

