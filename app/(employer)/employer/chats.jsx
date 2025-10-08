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

export default function EmployerMessages() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'interviews', 'proposals'

  // Mock messages data
  const [messages] = useState([
    {
      id: '1',
      candidateName: 'John Smith',
      candidateInitials: 'JS',
      position: 'Senior React Developer',
      lastMessage: 'Thank you for considering my application. I am very excited about this opportunity...',
      timestamp: '5 mins ago',
      unreadCount: 3,
      isBlocked: false,
      status: 'active', // 'active', 'blocked'
      isOnline: true,
      messageType: 'text', // 'text', 'file', 'interview'
      senderType: 'candidate', // 'candidate' or 'company'
      conversationType: 'proposal', // 'proposal', 'interview', 'general'
      candidateExperience: '5 years',
      appliedTime: '2 hours ago',
    },
    {
      id: '2',
      candidateName: 'Sarah Johnson',
      candidateInitials: 'SJ',
      position: 'Frontend Developer',
      lastMessage: 'I have attached my updated portfolio. Looking forward to hearing from you.',
      timestamp: '1 hour ago',
      unreadCount: 1,
      isBlocked: false,
      status: 'active',
      isOnline: false,
      messageType: 'file',
      senderType: 'candidate',
      conversationType: 'proposal',
      candidateExperience: '3 years',
      appliedTime: '5 hours ago',
    },
    {
      id: '3',
      candidateName: 'Mike Chen',
      candidateInitials: 'MC',
      position: 'Full Stack Developer',
      lastMessage: 'You: Great! Let\'s schedule the interview for tomorrow at 2 PM.',
      timestamp: '3 hours ago',
      unreadCount: 0,
      isBlocked: false,
      status: 'active',
      isOnline: true,
      messageType: 'text',
      senderType: 'company',
      conversationType: 'interview',
      candidateExperience: '4 years',
      appliedTime: '1 day ago',
    },
    {
      id: '4',
      candidateName: 'Priya Sharma',
      candidateInitials: 'PS',
      position: 'React Native Developer',
      lastMessage: 'I would like to know more about the team structure and growth opportunities.',
      timestamp: '6 hours ago',
      unreadCount: 2,
      isBlocked: false,
      status: 'active',
      isOnline: false,
      messageType: 'text',
      senderType: 'candidate',
      conversationType: 'general',
      candidateExperience: '3.5 years',
      appliedTime: '3 hours ago',
    },
    {
      id: '5',
      candidateName: 'David Wilson',
      candidateInitials: 'DW',
      position: 'Backend Developer',
      lastMessage: 'Thank you for the interview opportunity. I have some questions about...',
      timestamp: '1 day ago',
      unreadCount: 0,
      isBlocked: true,
      status: 'blocked',
      isOnline: false,
      messageType: 'text',
      senderType: 'candidate',
      conversationType: 'interview',
      candidateExperience: '6 years',
      appliedTime: '2 days ago',
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
        filtered = filtered.filter(msg => msg.unreadCount > 0 && !msg.isBlocked);
        break;
      case 'interviews':
        filtered = filtered.filter(msg => msg.conversationType === 'interview' && !msg.isBlocked);
        break;
      case 'proposals':
        filtered = filtered.filter(msg => msg.conversationType === 'proposal' && !msg.isBlocked);
        break;
      default:
        filtered = filtered.filter(msg => !msg.isBlocked);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(msg =>
        msg.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Get filter stats
  const getFilterStats = () => {
    return {
      all: messages.filter(m => !m.isBlocked).length,
      unread: messages.filter(m => m.unreadCount > 0 && !m.isBlocked).length,
      interviews: messages.filter(m => m.conversationType === 'interview' && !m.isBlocked).length,
      proposals: messages.filter(m => m.conversationType === 'proposal' && !m.isBlocked).length,
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
              setActiveFilter('blocked');
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
          { id: 'all', label: 'All', count: stats.all },
          { id: 'unread', label: 'Unread', count: stats.unread },
          { id: 'proposals', label: 'Proposals', count: stats.proposals },
          { id: 'interviews', label: 'Interviews', count: stats.interviews },
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
  const MessageItem = ({ item }) => {
    const getConversationTypeColor = () => {
      switch (item.conversationType) {
        case 'interview': return theme.colors.primary.orange;
        case 'proposal': return theme.colors.primary.teal;
        default: return theme.colors.text.tertiary;
      }
    };

    const getConversationTypeIcon = () => {
      switch (item.conversationType) {
        case 'interview': return 'calendar-outline';
        case 'proposal': return 'briefcase-outline';
        default: return 'chatbubble-outline';
      }
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/employer/messages/${item.id}`)}
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
          {/* Candidate Avatar */}
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
                {item.candidateInitials}
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