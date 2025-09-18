import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { Notification, CreateNotificationRequest, UpdateNotificationRequest, NotificationSearchParams, ApiResponse, NotificationsResponse } from '../types';

/**
 * Notifications Service
 * Handles notification management API calls
 */
export class NotificationsService {
  /**
   * Get all notifications (auth required)
   * GET /api/notifications
   */
  static async getAllNotifications(authToken: string): Promise<Notification[]> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<NotificationsResponse> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      if (!data.data) {
        throw new Error('No data returned from API');
      }

      // Handle nested response structure: { data: { success: true, notifications: [...] } }
      if (data.data.notifications && Array.isArray(data.data.notifications)) {
        return data.data.notifications;
      }

      // Fallback to direct data array (should not happen with proper API)
      return data.data as any;
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search notifications
   * GET /api/notifications/searchBy?userId=*id*&type=*SYSTEM|BUDGET_ALERT*&read=*bool*
   */
  static async searchNotifications(params: NotificationSearchParams, authToken: string): Promise<Notification[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.userId) {
        searchParams.append('userId', params.userId);
      }
      if (params.type) {
        searchParams.append('type', params.type);
      }
      if (params.read !== undefined) {
        searchParams.append('read', params.read.toString());
      }

      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.SEARCH}?${searchParams.toString()}`);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<NotificationsResponse> = await response.json();
      
      if (!data.data?.success || !data.data) {
        console.error('🔔 NotificationsService.searchNotifications apiUrl:', apiUrl);
        throw new Error(data.message || 'Failed to search notifications');
      }

      // Handle nested response structure: { data: { success: true, notifications: [...] } }
      if (data.data.notifications && Array.isArray(data.data.notifications)) {
        return data.data.notifications;
      }

      // Fallback to direct data array (should not happen with proper API)
      return data.data as any;
    } catch (error) {
      throw new Error(`Failed to search notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create notification (auth required)
   * POST /api/notifications
   */
  static async createNotification(notificationData: CreateNotificationRequest, authToken?: string): Promise<Notification> {
    try {
      
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE);
      
      const headers = getDefaultHeaders();
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(notificationData),
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔔 NotificationsService.createNotification HTTP error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Notification> = await response.json();
      
      // Check if the response indicates success
      if (data.success === false) {
        console.error('🔔 NotificationsService.createNotification API returned success: false');
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        console.error('🔔 NotificationsService.createNotification API returned error:', data.error);
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
      
      // If success is true or undefined, and we have data, return it
      if (data.data) {
        ('✅ NotificationsService.createNotification success, returning data');
        return data.data;
      }
      
      // If no data but success is true, the notification might have been created successfully
      // Return a mock notification object to indicate success
      if (data.success === true || data.success === undefined) {
        ('✅ NotificationsService.createNotification success without data, returning mock notification');
        return {
          id: Date.now().toString(),
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      console.error('🔔 NotificationsService.createNotification unexpected response structure');
      throw new Error('Unexpected API response structure');
    } catch (error) {
      console.error('🔔 NotificationsService.createNotification error:', error);
      throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update notification (auth required)
   * PUT /api/notifications/{id}
   */
  static async updateNotification(notificationId: string, notificationData: UpdateNotificationRequest, authToken: string): Promise<Notification> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}`);
      
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
        body: JSON.stringify(notificationData),
      });

      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<NotificationsResponse> = await response.json();
      
      if (!data.data?.success || !data.data) {
        throw new Error(data.message || 'Failed to update notification');
      }

      return data.data as any;
    } catch (error) {
      throw new Error(`Failed to update notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete notification (auth required)
   * DELETE /api/notifications/{id}
   */
  static async deleteNotification(notificationId: string, authToken: string): Promise<void> {
    try {
      const apiUrl = getFullApiUrlWithAuth(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}`);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.data?.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'API returned an error');
      }
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get notifications by user ID
   */
  static async getNotificationsByUserId(userId: string, authToken: string): Promise<Notification[]> {
    try {
      return await this.searchNotifications({ userId }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread notifications by user ID
   */
  static async getUnreadNotificationsByUserId(userId: string, authToken: string): Promise<Notification[]> {
    try {
      return await this.searchNotifications({ userId, read: false }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notifications by type
   */
  static async getNotificationsByType(type: 'SYSTEM' | 'BUDGET_ALERT' | 'FRIEND', authToken: string, userId?: string): Promise<Notification[]> {
    try {
      return await this.searchNotifications({ userId, type }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, authToken: string): Promise<Notification> {
    try {
      console.log('🔔 NotificationsService.markAsRead - notificationId:', notificationId);
      console.log('🔔 NotificationsService.markAsRead - sending { read: true }');
      return await this.updateNotification(notificationId, { read: true } as any, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark notification as unread
   */
  static async markAsUnread(notificationId: string, authToken: string): Promise<Notification> {
    try {
      console.log('🔔 NotificationsService.markAsUnread - notificationId:', notificationId);
      console.log('🔔 NotificationsService.markAsUnread - sending { read: false }');
      return await this.updateNotification(notificationId, { read: false } as any, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string, authToken: string): Promise<void> {
    try {
      const unreadNotifications = await this.getUnreadNotificationsByUserId(userId, authToken);
      
      await Promise.all(
        unreadNotifications.map(notification => 
          this.markAsRead(notification.id, authToken)
        )
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notification count for a user
   */
  static async getNotificationCount(userId: string, authToken: string, unreadOnly: boolean = false): Promise<number> {
    try {
      const notifications = unreadOnly 
        ? await this.getUnreadNotificationsByUserId(userId, authToken)
        : await this.getNotificationsByUserId(userId, authToken);
      
      return notifications.length;
    } catch (error) {
      throw error;
    }
  }
}


