import React, { useState, useEffect } from 'react';
import { View, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedCard } from '../../components/ThemeWrapper';
import { EnhancedInput } from '../../components/EnhancedInput';
import CustomButton from '../../components/CustomButton';
import { FamiliesService } from '../../services/apiservices/FamiliesService';
import { UsersService } from '../../services/apiservices/UsersService';
import { useAuth } from '../../contexts/AuthContext';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  addedDate: string;
}

const FamilyScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const familyId = (user as any)?.familyId ?? '1';
  const [familyName, setFamilyName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingFamily, setIsLoadingFamily] = useState(true);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        // Step 1: Fetch current user by ID = 1
        console.log('=== STEP 1: Fetching current user ===');
        console.log('API Call: GET /api/users/searchBy?id=1');
        console.log('Request URL:', '{{baseUrl}}/api/users/searchBy?id=1');
        
        const currentUser = await UsersService.getUserById('1');
        console.log('User API Response:', JSON.stringify(currentUser, null, 2));
        
        if (!currentUser) {
          throw new Error('Current user not found');
        }
        
        // Step 2: Extract familyId from user response
        console.log('=== STEP 2: Extracting familyId ===');
        const userFamilyId = (currentUser as any).familyId;
        console.log('Extracted userFamilyId:', userFamilyId);
        console.log('Full user object keys:', Object.keys(currentUser));
        console.log('User object with familyId:', {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          familyId: userFamilyId
        });
        
        if (!userFamilyId) {
          throw new Error('User does not have a familyId');
        }
        
        // Step 3: Fetch family using the familyId
        console.log('=== STEP 3: Fetching family data ===');
        console.log(`API Call: GET /api/families/searchBy?id=${userFamilyId}`);
        console.log('Request URL:', `{{baseUrl}}/api/families/searchBy?id=${userFamilyId}`);
        
        const families = await FamiliesService.searchFamilies({ id: String(userFamilyId) });
        console.log('Family API Response:', JSON.stringify(families, null, 2));
        console.log('Number of families returned:', families?.length || 0);
        
        if (families && families.length > 0) {
          const family = families[0];
          console.log('Selected family:', JSON.stringify(family, null, 2));
          
          setFamilyName((family as any).name ?? 'Familia');
          const usersArr = (family as any).users || [];
          console.log('Family users array:', JSON.stringify(usersArr, null, 2));
          
          const mapped = usersArr.map((u: any) => ({
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: u.id === 1 ? 'admin' : 'member', // Assume user ID 1 is admin
            addedDate: u.createdAt ?? new Date().toISOString(),
          }));
          
          console.log('Mapped family members:', JSON.stringify(mapped, null, 2));
          setFamilyMembers(mapped);
          console.log('✅ Family data loaded successfully:', family.name, mapped.length, 'members');
        } else {
          throw new Error('Family not found');
        }
      } catch (error) {
        console.error('❌ Failed to fetch family data:');
        console.error('Error type:', typeof error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Full error object:', error);
        
        // Fallback to mock data when API fails
        console.log('🔄 Using fallback mock data');
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
      } finally {
        setIsLoadingFamily(false);
      }
    };
    fetchFamily();
  }, []);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!isValidEmail(newMemberEmail)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsAddingMember(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        role: 'member',
        addedDate: new Date().toISOString().split('T')[0],
      };

      setFamilyMembers(prev => [...prev, newMember]);
      setNewMemberEmail('');
      Alert.alert('Éxito', 'Miembro agregado a la familia');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el miembro');
    } finally {
      setIsAddingMember(false);
    }
  };


  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
          {item.role === 'admin' && (
            <View className="bg-blue-100 px-2 py-1 rounded-full">
              <ThemedText className="text-xs font-medium text-blue-600">
                Admin
              </ThemedText>
            </View>
          )}
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
          {/* Add Member Section */}
          <ThemedCard className="w-full items-center mb-6 p-6">
            <View className="w-full mb-4">
              <EnhancedInput
                value={newMemberEmail}
                onChangeText={setNewMemberEmail}
                placeholder="Ingresa el usuario del miembro"
                label="Usuario del miembro"
                keyboardType="email-address"
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
            
            {isLoadingFamily ? (
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
            ) : familyMembers.length === 0 ? (
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
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

FamilyScreen.displayName = 'FamilyScreen';

export default FamilyScreen;

