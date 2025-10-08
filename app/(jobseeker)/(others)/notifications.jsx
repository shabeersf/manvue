import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Notifications() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'job', 'system'

  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'job_proposal',
      title: 'New Job Proposal',
      message: 'TechCorp Solutions sent you a job proposal for Senior React Developer position.',
      timestamp: '5 mins ago',
      isRead: false,
      icon: 'briefcase',
      iconColor: theme.colors.primary.teal,
      actionUrl: '/job-details/1',
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'Digital Innovations sent you a message about the interview schedule.',
      timestamp: '15 mins ago',
      isRead: false,
      icon: 'chatbubble',
      iconColor: theme.colors.primary.orange,
      actionUrl: '/message-details/2',
    },
    {
      id: '3',
      type: 'profile_approved',
      title: 'Profile Update Approved',
      message: 'Your education update has been approved by admin and applied to your profile.',
      timestamp: '1 hour ago',
      isRead: false,
      icon: 'checkmark-circle',
      iconColor: theme.colors.status.success,
      actionUrl: '/jobseeker/profile',
    },
    {
      id: '4',
      type: 'job_accepted',
      title: 'Proposal Accepted',
      message: 'You accepted the job proposal from StartupHub. Check your messages for next steps.',
      timestamp: '2 hours ago',
      isRead: true,
      icon: 'heart',
      iconColor: theme.colors.status.success,
      actionUrl: '/message-details/3',
    },
    {
      id: '5',
      type: 'system',
      title: 'Subscription Reminder',
      message: 'Your premium subscription will expire in 30 days. Renew now to continue accessing premium features.',
      timestamp: '1 day ago',
      isRead: true,
      icon: 'time',
      iconColor: theme.colors.status.warning,
      actionUrl: '/subscription',
    },
    {
      id: '6',
      type: 'profile_rejected',
      title: 'Profile Update Rejected',
      message: 'Your years of experience update was rejected. Please provide valid documentation.',
      timestamp: '2 days ago',
      isRead: true,
      icon: 'close-circle',
      iconColor: theme.colors.status.error,
      actionUrl: '/jobseeker/profile',
    },
    {
      id: '7',
      type: 'job_proposal',
      title: 'New Job Proposal',
      message: 'InnovateCorp is interested in your profile for React Native Developer role.',
      timestamp: '3 days ago',
      isRead: true,
      icon: 'briefcase',
      iconColor: theme.colors.primary.teal,
      actionUrl: '/job-details/4',
    },
    {
      id: '8',
      type: 'system',
      title: 'Welcome to Manvue!',
      message: 'Your account has been created successfully. Complete your profile to get better job matches.',
      timestamp: '1 week ago',
      isRead: true,
      icon: 'person-add',
      iconColor: theme.colors.primary.deepBlue,
      actionUrl: '/jobseeker/profile',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const handleNotificationPress = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  // Filter notifications
  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'job':
        return notifications.filter(n => 
          ['job_proposal', 'job_accepted', 'job_rejected'].includes(n.type)
        );
      case 'system':
        return notifications.filter(n => 
          ['system', 'profile_approved', 'profile_rejected'].includes(n.type)
        );
      default:
        return notifications;
    }
  };

  // Get filter stats
  const getFilterStats = () => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      job: notifications.filter(n => ['job_proposal', 'job_accepted', 'job_rejected'].includes(n.type)).length,
      system: notifications.filter(n => ['system', 'profile_approved', 'profile_rejected'].includes(n.type)).length,
    };
  };

  const stats = getFilterStats();

  // Header Component
  const Header = () => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
      }}
    >
      {/* Header Title and Actions */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: theme.typography.sizes.lg,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.text.primary,
            }}
          >
            Notifications
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
            }}
          >
            {stats.unread > 0 ? `${stats.unread} unread notifications` : 'All caught up!'}
          </Text>
        </View>

        {stats.unread > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            style={{
              backgroundColor: theme.colors.background.accent,
              borderRadius: theme.borderRadius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.primary.teal,
              }}
            >
              Mark All Read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {[
          { id: 'all', label: 'All', count: stats.all },
          { id: 'unread', label: 'Unread', count: stats.unread },
          { id: 'job', label: 'Jobs', count: stats.job },
          { id: 'system', label: 'System', count: stats.system },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: activeFilter === filter.id 
                ? theme.colors.primary.teal 
                : theme.colors.background.accent,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: activeFilter === filter.id 
                  ? theme.typography.fonts.semiBold 
                  : theme.typography.fonts.medium,
                color: activeFilter === filter.id 
                  ? theme.colors.neutral.white 
                  : theme.colors.text.secondary,
              }}
            >
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <View
                style={{
                  backgroundColor: activeFilter === filter.id 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : theme.colors.primary.teal,
                  borderRadius: theme.borderRadius.full,
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                  marginLeft: theme.spacing.xs,
                  minWidth: 18,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xs,
                    fontFamily: theme.typography.fonts.bold,
                    color: theme.colors.neutral.white,
                  }}
                >
                  {filter.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Notification Item Component
  const NotificationItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      style={{
        backgroundColor: item.isRead ? theme.colors.background.card : theme.colors.background.accent,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
      activeOpacity={0.8}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${item.iconColor}15`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <Ionicons
          name={item.icon}
          size={20}
          color={item.iconColor}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.xs,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: item.isRead 
                ? theme.typography.fonts.medium 
                : theme.typography.fonts.semiBold,
              color: theme.colors.text.primary,
              flex: 1,
              marginRight: theme.spacing.sm,
            }}
          >
            {item.title}
          </Text>

          {/* Unread indicator */}
          {!item.isRead && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.primary.teal,
                marginTop: 4,
              }}
            />
          )}
        </View>

        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.secondary,
            lineHeight: theme.typography.sizes.sm * 1.4,
            marginBottom: theme.spacing.xs,
          }}
        >
          {item.message}
        </Text>

        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.tertiary,
          }}
        >
          {item.timestamp}
        </Text>
      </View>

      {/* Action indicator */}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={theme.colors.text.tertiary}
        style={{ marginLeft: theme.spacing.sm, marginTop: 2 }}
      />
    </TouchableOpacity>
  );

  // Empty State Component
  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xxxl,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.background.accent,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}
      >
        <Ionicons
          name={
            activeFilter === 'unread' ? 'mail-unread-outline' :
            activeFilter === 'job' ? 'briefcase-outline' :
            activeFilter === 'system' ? 'settings-outline' :
            'notifications-outline'
          }
          size={32}
          color={theme.colors.primary.teal}
        />
      </View>

      <Text
        style={{
          fontSize: theme.typography.sizes.lg,
          fontFamily: theme.typography.fonts.semiBold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.sm,
          textAlign: 'center',
        }}
      >
        {activeFilter === 'unread' ? 'No unread notifications' :
         activeFilter === 'job' ? 'No job notifications' :
         activeFilter === 'system' ? 'No system notifications' :
         'No notifications yet'}
      </Text>

      <Text
        style={{
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.regular,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: theme.typography.sizes.base * 1.4,
        }}
      >
        {activeFilter === 'unread' ? 'All your notifications have been read' :
         activeFilter === 'job' ? 'Job-related notifications will appear here' :
         activeFilter === 'system' ? 'System updates and alerts will appear here' :
         'When you receive notifications, they will appear here'}
      </Text>
    </View>
  );

  const filteredNotifications = getFilteredNotifications();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <Header />
      
      {filteredNotifications.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => <NotificationItem item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary.teal]}
              tintColor={theme.colors.primary.teal}
            />
          }
        />
      )}
    </View>
  );
}