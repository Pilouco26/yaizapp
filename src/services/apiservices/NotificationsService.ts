import { API_CONFIG, getFullApiUrlWithAuth, getDefaultHeaders } from '../../utils/config';
import { Notification, CreateNotificationRequest, UpdateNotificationRequest, NotificationSearchParams, ApiResponse } from '../types';

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

      const data: ApiResponse<Notification[]> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to get notifications');
      }

      return data.data;
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

      const data: ApiResponse<Notification[]> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to search notifications');
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to search notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create notification (auth required)
   * POST /api/notifications
   */
  static async createNotification(notificationData: CreateNotificationRequest, authToken: string): Promise<Notification> {
    try {
      const apiUrl = getFullApiUrlWithAuth(API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getDefaultHeaders({
          'Authorization': `Bearer ${authToken}`,
        }),
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: ApiResponse<Notification> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to create notification');
      }

      return data.data;
    } catch (error) {
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

      const data: ApiResponse<Notification> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to update notification');
      }

      return data.data;
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
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete notification');
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
  static async getNotificationsByType(type: 'SYSTEM' | 'BUDGET_ALERT', authToken: string, userId?: string): Promise<Notification[]> {
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
      return await this.updateNotification(notificationId, { isRead: true }, authToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark notification as unread
   */
  static async markAsUnread(notificationId: string, authToken: string): Promise<Notification> {
    try {
      return await this.updateNotification(notificationId, { isRead: false }, authToken);
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

