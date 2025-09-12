# YaizApp Services

This directory contains all the service classes for interacting with the YaizApp Backend API. Each service corresponds to a specific API endpoint group and provides methods for CRUD operations.

## Services Overview

### Authentication Service (`AuthService.ts`)
- **Purpose**: Handle authentication and token management
- **Endpoints**: `/api/auth/dev-token`
- **Key Methods**:
  - `generateDevToken(request)` - Generate development JWT token
  - `storeToken(token)` - Store authentication token securely
  - `getStoredToken()` - Retrieve stored token
  - `clearToken()` - Clear stored token
  - `isAuthenticated()` - Check if user is authenticated

### Health Service (`HealthService.ts`)
- **Purpose**: Monitor API health and status
- **Endpoints**: `/api/health`, `/api/health/searchBy`
- **Key Methods**:
  - `getHealth()` - Get comprehensive health information
  - `searchHealth(params)` - Get filtered health information
  - `ping()` - Simple ping check
  - `detailedCheck()` - Detailed health check

### Users Service (`UsersService.ts`)
- **Purpose**: Manage user accounts and profiles
- **Endpoints**: `/api/users`, `/api/users/searchBy`
- **Key Methods**:
  - `getAllUsers(authToken)` - Get all users
  - `searchUsers(params, authToken)` - Search users by criteria
  - `createUser(userData, authToken)` - Create new user
  - `updateUser(userId, userData, authToken)` - Update user
  - `deleteUser(userId, authToken)` - Delete user
  - `getUserById(userId, authToken)` - Get user by ID
  - `getUserByEmail(email, authToken)` - Get user by email

### Families Service (`FamiliesService.ts`)
- **Purpose**: Manage family groups and memberships
- **Endpoints**: `/api/families`, `/api/families/searchBy`
- **Key Methods**:
  - `getAllFamilies(authToken)` - Get all families
  - `searchFamilies(params, authToken)` - Search families
  - `createFamily(familyData, authToken)` - Create family
  - `updateFamily(familyId, familyData, authToken)` - Update family
  - `deleteFamily(familyId, authToken)` - Delete family
  - `getFamilyById(familyId, authToken)` - Get family by ID
  - `getFamiliesByName(name, authToken)` - Get families by name

### Months Service (`MonthsService.ts`)
- **Purpose**: Manage monthly financial data
- **Endpoints**: `/api/months`, `/api/months/searchBy`
- **Key Methods**:
  - `getAllMonths(authToken)` - Get all months
  - `searchMonths(params, authToken)` - Search months
  - `createMonth(monthData, authToken)` - Create month
  - `updateMonth(monthId, monthData, authToken)` - Update month
  - `deleteMonth(monthId, authToken)` - Delete month
  - `getMonthsByUserId(userId, authToken)` - Get months by user
  - `getMonthByUserAndDate(userId, year, month, authToken)` - Get specific month
  - `getMonthsWithExpensesAbove(amount, authToken, userId)` - Get months with high expenses

### Goals Service (`GoalsService.ts`)
- **Purpose**: Manage financial goals and targets
- **Endpoints**: `/api/goals`, `/api/goals/searchBy`
- **Key Methods**:
  - `getAllGoals(authToken)` - Get all goals
  - `searchGoals(params, authToken)` - Search goals
  - `createGoal(goalData, authToken)` - Create goal
  - `updateGoal(goalId, goalData, authToken)` - Update goal
  - `deleteGoal(goalId, authToken)` - Delete goal
  - `getGoalsByUserId(userId, authToken)` - Get goals by user
  - `getActiveGoalsByUserId(userId, authToken)` - Get active goals
  - `updateGoalProgress(goalId, currentAmount, authToken)` - Update progress
  - `completeGoal(goalId, authToken)` - Mark goal as completed

### Transactions Service (`TransactionsService.ts`)
- **Purpose**: Manage financial transactions (income/expenses)
- **Endpoints**: `/api/transactions`, `/api/transactions/searchBy`
- **Key Methods**:
  - `getAllTransactions(authToken)` - Get all transactions
  - `searchTransactions(params, authToken)` - Search transactions
  - `createTransaction(transactionData, authToken)` - Create transaction
  - `updateTransaction(transactionId, transactionData, authToken)` - Update transaction
  - `deleteTransaction(transactionId, authToken)` - Delete transaction
  - `getTransactionsByUserId(userId, authToken)` - Get transactions by user
  - `getTransactionsByMonthId(monthId, authToken)` - Get transactions by month
  - `getExpenses(userId, authToken, monthId)` - Get expenses
  - `getIncome(userId, authToken, monthId)` - Get income

### Notifications Service (`NotificationsService.ts`)
- **Purpose**: Manage user notifications and alerts
- **Endpoints**: `/api/notifications`, `/api/notifications/searchBy`
- **Key Methods**:
  - `getAllNotifications(authToken)` - Get all notifications
  - `searchNotifications(params, authToken)` - Search notifications
  - `createNotification(notificationData, authToken)` - Create notification
  - `updateNotification(notificationId, notificationData, authToken)` - Update notification
  - `deleteNotification(notificationId, authToken)` - Delete notification
  - `getNotificationsByUserId(userId, authToken)` - Get notifications by user
  - `getUnreadNotificationsByUserId(userId, authToken)` - Get unread notifications
  - `markAsRead(notificationId, authToken)` - Mark as read
  - `markAllAsRead(userId, authToken)` - Mark all as read
  - `getNotificationCount(userId, authToken, unreadOnly)` - Get notification count

## Usage Examples

### Basic Authentication
```typescript
import { AuthService } from '../services';

// Generate dev token
const tokenResponse = await AuthService.generateDevToken({
  userId: 'user123',
  email: 'user@example.com'
});

// Store token
await AuthService.storeToken(tokenResponse.token);
```

### Working with Users
```typescript
import { UsersService } from '../services';

// Get all users
const users = await UsersService.getAllUsers(authToken);

// Create new user
const newUser = await UsersService.createUser({
  username: 'johndoe',
  email: 'john@example.com',
  name: 'John Doe'
}, authToken);

// Search users
const searchResults = await UsersService.searchUsers({
  email: 'john@example.com'
}, authToken);
```

### Managing Transactions
```typescript
import { TransactionsService } from '../services';

// Create expense transaction
const expense = await TransactionsService.createTransaction({
  userId: 'user123',
  type: 'EXPENSE',
  amount: 50.00,
  description: 'Groceries',
  category: 'Food',
  date: '2024-01-15'
}, authToken);

// Get expenses for a month
const expenses = await TransactionsService.getExpenses('user123', authToken, 'month123');
```

### Working with Goals
```typescript
import { GoalsService } from '../services';

// Create a savings goal
const goal = await GoalsService.createGoal({
  userId: 'user123',
  title: 'Vacation Fund',
  description: 'Save for summer vacation',
  targetAmount: 2000.00,
  targetDate: '2024-06-01'
}, authToken);

// Update goal progress
await GoalsService.updateGoalProgress(goal.id, 500.00, authToken);
```

## Error Handling

All services include comprehensive error handling and will throw descriptive errors when API calls fail. Always wrap service calls in try-catch blocks:

```typescript
try {
  const users = await UsersService.getAllUsers(authToken);
  console.log('Users loaded successfully:', users);
} catch (error) {
  console.error('Failed to load users:', error.message);
  // Handle error appropriately
}
```

## Type Safety

All services are fully typed with TypeScript interfaces defined in `types.ts`. This provides:
- IntelliSense support in your IDE
- Compile-time type checking
- Better error prevention
- Improved code documentation

## Configuration

The services use the API configuration from `../utils/config.ts` which points to the production API at `https://yaizapp-backend.onrender.com`. All endpoints are automatically constructed using the base URL and endpoint paths.

### API Key Setup

All API calls require an API key and value for authentication. Set up your API credentials by:

1. Create a `.env` file in the project root
2. Add your API key and value:
   ```
   EXPO_API_KEY=your_api_key_here
   EXPO_API_VALUE=your_api_value_here
   ```
   Or for client-side access:
   ```
   EXPO_PUBLIC_API_KEY=your_public_api_key_here
   EXPO_PUBLIC_API_VALUE=your_public_api_value_here
   ```

Both the API key and value will be automatically included in all requests as separate headers.

**Header Format:**
- **Key:** `EXPO_API_KEY` → **Value:** `{your_api_key}`
- **Key:** `EXPO_API_VALUE` → **Value:** `{your_api_value}`

## Authentication

Most endpoints require authentication via JWT tokens. The `authToken` parameter should be passed to methods that require authentication. Use the `AuthService` to generate and manage tokens.

