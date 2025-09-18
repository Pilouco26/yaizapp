import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../../components/ThemeWrapper';
import { NotificationsService } from '../../services';
import { Notification } from '../../services/types';

const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      // Use hardcoded userId 51 as specified in the request
      const userId = '51';
      const notificationsData = await NotificationsService.getNotificationsByUserId(userId, '');
      
      // Map API response to ensure isRead field is properly set
      const mappedNotifications = notificationsData.map(notification => ({
        ...notification,
        isRead: notification.read !== undefined ? notification.read : notification.isRead
      }));
      
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudieron cargar las notificaciones: ${errorMessage}`);
      setNotifications([]);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      
      const result = await NotificationsService.markAsRead(notificationId, '');
      
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('🔔 handleMarkAsRead - Error marking notification as read:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo marcar como leída: ${errorMessage}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = '51';
      await NotificationsService.markAllAsRead(userId, '');
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudieron marcar todas como leídas: ${errorMessage}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return 'settings';
      case 'BUDGET_ALERT':
        return 'warning';
      case 'FRIEND':
        return 'people';
      default:
        return 'notifications';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return colors.primary;
      case 'BUDGET_ALERT':
        return '#FF6B6B';
      case 'FRIEND':
        return '#4ECDC4';
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      await fetchNotifications();
      setIsLoading(false);
    };

    loadNotifications();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center p-4">
            <ThemedText className="text-lg font-medium mb-4">
              Cargando notificaciones...
            </ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={{ flex: 1 }}>
        <View className="flex-1 p-4">
          <View className="flex-row items-center justify-between mb-6">
            <ThemedText className="text-2xl font-bold">
              Notificaciones
            </ThemedText>
            {unreadCount > 0 && (
              <ThemedTouchableOpacity
                className="px-4 py-2 rounded-lg"
                variant="primary"
                onPress={handleMarkAllAsRead}
                style={{ backgroundColor: colors.primary }}
              >
                <ThemedText className="text-sm font-medium" style={{ color: '#ffffff' }}>
                  Marcar todas como leídas
                </ThemedText>
              </ThemedTouchableOpacity>
            )}
          </View>

          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          >
            {notifications.length === 0 ? (
              <View className="flex-1 items-center justify-center p-8">
                <Ionicons 
                  name="notifications-outline" 
                  size={64} 
                  color={colors.textSecondary + '60'} 
                />
                <ThemedText className="text-lg font-medium mt-4 text-center">
                  No hay notificaciones
                </ThemedText>
                <ThemedText className="text-sm text-center mt-2 opacity-70">
                  Cuando tengas notificaciones, aparecerán aquí
                </ThemedText>
              </View>
            ) : (
              notifications.map((notification, index) => {
                const typeColor = getNotificationTypeColor(notification.type);
                const iconName = getNotificationIcon(notification.type);
                
                return (
                  <ThemedTouchableOpacity
                    key={notification.id}
                    className="flex-row items-start p-4 rounded-xl mb-3"
                    variant="surface"
                    onPress={() => !notification.isRead && handleMarkAsRead(notification.id)}
                    activeOpacity={1}
                    style={{
                      minHeight: 80,
                      backgroundColor: notification.isRead ? '#f5f5f5' : colors.primary + '10',
                      borderLeftWidth: 4,
                      borderLeftColor: typeColor,
                      opacity: notification.isRead ? 0.7 : 1,
                    }}
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Ionicons 
                          name={iconName as any} 
                          size={20} 
                          color={typeColor} 
                        />
                        <ThemedText 
                          className="text-sm font-medium ml-2"
                          style={{ color: typeColor }}
                        >
                          {notification.type}
                        </ThemedText>
                        {!notification.isRead && (
                          <View 
                            className="w-2 h-2 rounded-full ml-2"
                            style={{ backgroundColor: colors.primary }}
                          />
                        )}
                      </View>
                      
                      <ThemedText 
                        className="text-lg font-medium mb-2"
                        style={{ 
                          color: notification.isRead ? colors.textSecondary : colors.textPrimary,
                          fontWeight: notification.isRead ? 'normal' : 'bold'
                        }}
                      >
                        {notification.title}
                      </ThemedText>
                      
                      <ThemedText 
                        className="text-xs"
                        style={{ color: colors.textTertiary }}
                      >
                        {formatDate(notification.createdAt)}
                      </ThemedText>
                    </View>
                    
                    {!notification.isRead && (
                      <Ionicons 
                        name="ellipse" 
                        size={8} 
                        color={colors.primary} 
                      />
                    )}
                  </ThemedTouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

