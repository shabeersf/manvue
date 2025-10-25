import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EmployerMessages() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'interviews', 'proposals'
  
  // Dynamic data from API
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    all: 0,
    unread: 0,
    interviews: 0,
    proposals: 0,
  });

  // Fetch conversations from API
  const fetchConversations = async (showLoader = true, isRefresh = false) => {
    try {
      if (showLoader && !isRefresh) {
        setLoading(true);
      }

      const result = await apiService.getEmployerConversations({
        filter: activeFilter,
        search_query: searchQuery.trim(),
      });

      if (result.success) {
        setMessages(result.data.conversations || []);
        setStats(result.data.stats || {
          all: 0,
          unread: 0,
          interviews: 0,
          proposals: 0,
        });
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchConversations();
  }, [activeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || searchQuery === '') {
        fetchConversations(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations(false, true);
  }, [activeFilter, searchQuery]);

  // Filter buttons data
  const filters = [
    { key: 'all', label: 'All', count: stats.all },
    { key: 'unread', label: 'Unread', count: stats.unread },
    { key: 'interviews', label: 'Interviews', count: stats.interviews },
    { key: 'proposals', label: 'Proposals', count: stats.proposals },
  ];

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
      {/* Header Title */}
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
            Messages
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
            }}
          >
            {stats.unread > 0 ? `${stats.unread} unread conversations` : 'All caught up!'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <TouchableOpacity
            onPress={() => {
              // Navigate to blocked conversations or show blocked filter
              // You can implement this feature later
              Alert.alert('Info', 'Blocked conversations feature coming soon');
            }}
            style={{
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.background.accent,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="ban-outline"
              size={20}
              color={theme.colors.status.error}
            />
          </TouchableOpacity>
        </View>
      </View>

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
          placeholder="Search candidates or messages..."
          placeholderTextColor={theme.colors.text.placeholder}
          style={{
            flex: 1,
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.primary,
            paddingVertical: 0,
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={16}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.xs,
        }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            style={{
              flex: 1,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              backgroundColor:
                activeFilter === filter.key
                  ? theme.colors.primary.teal
                  : theme.colors.neutral.lightGray,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                fontFamily:
                  activeFilter === filter.key
                    ? theme.typography.fonts.semiBold
                    : theme.typography.fonts.medium,
                color:
                  activeFilter === filter.key
                    ? theme.colors.neutral.white
                    : theme.colors.text.secondary,
              }}
            >
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.bold,
                  color:
                    activeFilter === filter.key
                      ? theme.colors.neutral.white
                      : theme.colors.primary.teal,
                  marginTop: 2,
                }}
              >
                {filter.count}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Message Item Component
  const MessageItem = ({ item }) => {
    const getConversationTypeIcon = () => {
      switch (item.conversationType) {
        case 'interview':
          return 'calendar-outline';
        case 'application':
          return 'briefcase-outline';
        default:
          return 'chatbubble-outline';
      }
    };

    const getConversationTypeColor = () => {
      switch (item.conversationType) {
        case 'interview':
          return theme.colors.primary.orange;
        case 'application':
          return theme.colors.primary.teal;
        default:
          return theme.colors.text.tertiary;
      }
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${item.jobseeker_id}/${item.application_id}/${item.conversation_id}`)}
        style={{
          backgroundColor: theme.colors.background.card,
          marginHorizontal: theme.spacing.md,
          marginVertical: theme.spacing.xs,
          borderRadius: theme.borderRadius.lg,
          ...theme.shadows.sm,
          borderWidth: 1,
          borderColor: item.unreadCount > 0 
            ? theme.colors.primary.teal + '30' 
            : theme.colors.border.light,
        }}
        activeOpacity={0.7}
      >
        {/* {console.log("item",item)} */}
        <View
          style={{
            padding: theme.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.primary.teal,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: theme.spacing.md,
              position: 'relative',
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.neutral.white,
              }}
            >
              {item.candidateInitials}
            </Text>

            {/* Online indicator */}
            {item.isOnline && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: theme.colors.status.success,
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
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontFamily: item.unreadCount > 0 
                      ? theme.typography.fonts.semiBold 
                      : theme.typography.fonts.medium,
                    color: theme.colors.text.primary,
                    marginRight: theme.spacing.xs,
                  }}
                  numberOfLines={1}
                >
                  {item.candidateName}
                </Text>

                {/* Conversation type indicator */}
                <View
                  style={{
                    backgroundColor: `${getConversationTypeColor()}15`,
                    borderRadius: theme.borderRadius.sm,
                    paddingHorizontal: theme.spacing.xs,
                    paddingVertical: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={getConversationTypeIcon()}
                    size={10}
                    color={getConversationTypeColor()}
                    style={{ marginRight: theme.spacing.xs }}
                  />
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.xs,
                      fontFamily: theme.typography.fonts.medium,
                      color: getConversationTypeColor(),
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.conversationType}
                  </Text>
                </View>
              </View>

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

            {/* Position and Experience */}
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {item.position} • {item.candidateExperience}
            </Text>

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
  };

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
            activeFilter === 'interviews' ? 'calendar-outline' :
            activeFilter === 'proposals' ? 'briefcase-outline' :
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
        {searchQuery ? 'No conversations found' :
         activeFilter === 'unread' ? 'No unread messages' :
         activeFilter === 'interviews' ? 'No interview conversations' :
         activeFilter === 'proposals' ? 'No proposal conversations' :
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
         activeFilter === 'unread' ? 'All your messages have been read' :
         activeFilter === 'interviews' ? 'Interview-related conversations will appear here' :
         activeFilter === 'proposals' ? 'Job proposal conversations will appear here' :
         'When candidates respond to your job postings, conversations will appear here'}
      </Text>
    </View>
  );

  // Loading State
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary.teal} />
        <Text style={{ 
          marginTop: theme.spacing.md,
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.medium,
          color: theme.colors.text.secondary 
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
          contentContainerStyle={{ paddingVertical: theme.spacing.sm }}
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