import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  const [messages, setMessages] = useState([]);
  const [filterCounts, setFilterCounts] = useState({
    all: 0,
    unread: 0,
    blocked: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations on mount and filter change
  useEffect(() => {
    fetchConversations();
  }, [activeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchConversations();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchConversations = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);

      const result = await apiService.getJobseekerChatList(
        searchQuery,
        activeFilter,
        50,
        0
      );

      if (result.success) {
        setMessages(result.data.conversations || []);
        setFilterCounts(result.data.filter_counts || {
          all: 0,
          unread: 0,
          blocked: 0,
        });
      } else {
        console.error('Error fetching conversations:', result.message);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([]);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations(false);
    setRefreshing(false);
  };

  // Navigate to chat details
  const handleChatPress = (item) => {
    router.push(`/message-details/${item.conversation_id}`);
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
          { id: 'all', label: 'All', count: filterCounts.all },
          { id: 'unread', label: 'Unread', count: filterCounts.unread },
          { id: 'blocked', label: 'Blocked', count: filterCounts.blocked },
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
      onPress={() => handleChatPress(item)}
      style={{
        flexDirection: 'row',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
      }}
      activeOpacity={0.7}
    >
      {/* Company Avatar */}
      <View style={{ marginRight: theme.spacing.md, position: 'relative' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: theme.borderRadius.full,
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

  // Loading State
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary.teal} />
        <Text style={{
          marginTop: theme.spacing.md,
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.medium,
          color: theme.colors.text.secondary,
        }}>
          Loading conversations...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <Header />
      
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={messages}
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