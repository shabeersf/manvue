import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Messages() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'blocked'

  // Mock messages data
  const [messages] = useState([
    {
      id: '1',
      companyName: 'TechCorp Solutions',
      companyInitial: 'TC',
      lastMessage: 'Thank you for accepting our proposal! We are excited to move forward...',
      timestamp: '2 mins ago',
      unreadCount: 3,
      isBlocked: false,
      status: 'active', // 'active', 'blocked', 'reported'
      isOnline: true,
      messageType: 'text',
      senderType: 'company', // 'company' or 'user'
    },
    {
      id: '2',
      companyName: 'Digital Innovations',
      companyInitial: 'DI',
      lastMessage: 'We have reviewed your CV and would like to schedule an interview...',
      timestamp: '1 hour ago',
      unreadCount: 1,
      isBlocked: false,
      status: 'active',
      isOnline: false,
      messageType: 'text',
      senderType: 'company',
    },
    {
      id: '3',
      companyName: 'StartupHub',
      companyInitial: 'SH',
      lastMessage: 'You: I am interested in learning more about the role',
      timestamp: '3 hours ago',
      unreadCount: 0,
      isBlocked: false,
      status: 'active',
      isOnline: true,
      messageType: 'text',
      senderType: 'user',
    },
    {
      id: '4',
      companyName: 'InnovateCorp',
      companyInitial: 'IC',
      lastMessage: 'Please find the updated job description attached',
      timestamp: '1 day ago',
      unreadCount: 0,
      isBlocked: false,
      status: 'active',
      isOnline: false,
      messageType: 'file',
      senderType: 'company',
    },
    {
      id: '5',
      companyName: 'DevSolutions Ltd',
      companyInitial: 'DS',
      lastMessage: 'Thank you for your interest. However, we have decided...',
      timestamp: '2 days ago',
      unreadCount: 0,
      isBlocked: true,
      status: 'blocked',
      isOnline: false,
      messageType: 'text',
      senderType: 'company',
    },
    {
      id: '6',
      companyName: 'FutureTech',
      companyInitial: 'FT',
      lastMessage: 'Your profile matches our requirements perfectly...',
      timestamp: '3 days ago',
      unreadCount: 2,
      isBlocked: false,
      status: 'active',
      isOnline: true,
      messageType: 'text',
      senderType: 'company',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Filter messages based on active filter and search query
  const getFilteredMessages = () => {
    let filtered = messages;

    // Apply status filter
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(msg => msg.unreadCount > 0);
        break;
      case 'blocked':
        filtered = filtered.filter(msg => msg.isBlocked);
        break;
      default:
        filtered = filtered.filter(msg => !msg.isBlocked);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(msg =>
        msg.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

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
      {/* Search Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.neutral.lightGray,
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        }}
      >
        <Ionicons
          name="search"
          size={16}
          color={theme.colors.text.tertiary}
          style={{ marginRight: theme.spacing.sm }}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search conversations..."
          placeholderTextColor={theme.colors.text.placeholder}
          style={{
            flex: 1,
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.primary,
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={{ padding: theme.spacing.xs }}
          >
            <Ionicons
              name="close"
              size={16}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {[
          { id: 'all', label: 'All', count: messages.filter(m => !m.isBlocked).length },
          { id: 'unread', label: 'Unread', count: messages.filter(m => m.unreadCount > 0 && !m.isBlocked).length },
          { id: 'blocked', label: 'Blocked', count: messages.filter(m => m.isBlocked).length },
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

  // Message Item Component
  const MessageItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/message-details/${item.id}`)}
      style={{
        backgroundColor: theme.colors.background.card,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
        opacity: item.isBlocked ? 0.6 : 1,
      }}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Company Avatar */}
        <View style={{ position: 'relative', marginRight: theme.spacing.md }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: item.unreadCount > 0 
                ? theme.colors.primary.teal 
                : theme.colors.background.accent,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: item.unreadCount > 0 ? 2 : 1,
              borderColor: item.unreadCount > 0 
                ? theme.colors.primary.teal 
                : theme.colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.bold,
                color: item.unreadCount > 0 
                  ? theme.colors.neutral.white 
                  : theme.colors.primary.teal,
              }}
            >
              {item.companyInitial}
            </Text>
          </View>

          {/* Online status */}
          {item.isOnline && !item.isBlocked && (
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: theme.colors.status.success,
                borderWidth: 2,
                borderColor: theme.colors.background.card,
              }}
            />
          )}

          {/* Blocked indicator */}
          {item.isBlocked && (
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: theme.colors.status.error,
                borderWidth: 2,
                borderColor: theme.colors.background.card,
              }}
            />
          )}
        </View>

        {/* Message Content */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: theme.spacing.xs,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: item.unreadCount > 0 
                  ? theme.typography.fonts.semiBold 
                  : theme.typography.fonts.medium,
                color: theme.colors.text.primary,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item.companyName}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              {/* Message type indicator */}
              {item.messageType === 'file' && (
                <Ionicons
                  name="document-attach-outline"
                  size={14}
                  color={theme.colors.text.tertiary}
                />
              )}

              {/* Blocked indicator */}
              {item.isBlocked && (
                <Ionicons
                  name="ban-outline"
                  size={14}
                  color={theme.colors.status.error}
                />
              )}

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
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: item.unreadCount > 0 
                  ? theme.colors.text.primary 
                  : theme.colors.text.secondary,
                flex: 1,
                marginRight: theme.spacing.sm,
              }}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>

            {/* Unread count badge */}
            {item.unreadCount > 0 && (
              <View
                style={{
                  backgroundColor: theme.colors.primary.teal,
                  borderRadius: theme.borderRadius.full,
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                  minWidth: 20,
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
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
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
            activeFilter === 'blocked' ? 'ban-outline' :
            activeFilter === 'unread' ? 'mail-unread-outline' :
            searchQuery ? 'search-outline' : 'chatbubbles-outline'
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
        {searchQuery ? 'No results found' :
         activeFilter === 'blocked' ? 'No blocked conversations' :
         activeFilter === 'unread' ? 'No unread messages' :
         'No conversations yet'}
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
        {searchQuery ? 'Try adjusting your search terms' :
         activeFilter === 'blocked' ? 'You haven\'t blocked any companies yet' :
         activeFilter === 'unread' ? 'All messages have been read' :
         'When companies send you proposals, your conversations will appear here'}
      </Text>
    </View>
  );

  const filteredMessages = getFilteredMessages();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <Header />
      
      {filteredMessages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredMessages}
          renderItem={({ item }) => <MessageItem item={item} />}
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