import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function EmployerCandidates() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'discovered', 'proposal_sent', 'accepted'

  // Mock candidates data - redesigned for reverse recruitment
  const [candidates] = useState([
    {
      id: '1',
      name: 'John Smith',
      initials: 'JS',
      position: 'Senior React Developer',
      experience: '5 years',
      location: 'Mumbai, Remote',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
      education: 'B.Tech Computer Science',
      institution: 'IIT Mumbai',
      matchPercentage: 95,
      status: 'discovered', // 'discovered', 'proposal_sent', 'accepted', 'rejected'
      matchedJobTitle: 'Senior React Developer',
      discoveredTime: '2 hours ago',
      proposalSentTime: null,
      salary: '₹12L - ₹18L',
      profileCompletion: 92,
      isAvailable: true,
      lastActive: 'Active now',
      resumeUrl: null,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      initials: 'SJ',
      position: 'Frontend Developer',
      experience: '3 years',
      location: 'Bangalore, Hybrid',
      skills: ['React', 'Vue.js', 'CSS', 'JavaScript', 'Figma'],
      education: 'M.Tech Software Engineering',
      institution: 'BITS Pilani',
      matchPercentage: 88,
      status: 'proposal_sent',
      matchedJobTitle: 'Frontend Developer',
      discoveredTime: '5 hours ago',
      proposalSentTime: '2 hours ago',
      salary: '₹8L - ₹14L',
      profileCompletion: 88,
      isAvailable: true,
      lastActive: '2 hours ago',
      resumeUrl: null,
    },
    {
      id: '3',
      name: 'Mike Chen',
      initials: 'MC',
      position: 'Full Stack Developer',
      experience: '4 years',
      location: 'Pune, On-site',
      skills: ['React', 'Python', 'Django', 'PostgreSQL', 'Docker'],
      education: 'B.E. Information Technology',
      institution: 'Pune University',
      matchPercentage: 82,
      status: 'accepted',
      matchedJobTitle: 'Full Stack Developer',
      discoveredTime: '1 day ago',
      proposalSentTime: '8 hours ago',
      salary: '₹10L - ₹16L',
      profileCompletion: 85,
      isAvailable: false,
      lastActive: '1 day ago',
      resumeUrl: null,
    },
    {
      id: '4',
      name: 'Priya Sharma',
      initials: 'PS',
      position: 'React Native Developer',
      experience: '3.5 years',
      location: 'Delhi, Remote',
      skills: ['React Native', 'Mobile Development', 'Firebase', 'Redux'],
      education: 'MCA',
      institution: 'Delhi University',
      matchPercentage: 91,
      status: 'discovered',
      matchedJobTitle: 'Mobile App Developer',
      discoveredTime: '3 hours ago',
      proposalSentTime: null,
      salary: '₹9L - ₹15L',
      profileCompletion: 90,
      isAvailable: true,
      lastActive: 'Active now',
      resumeUrl: null,
    },
    {
      id: '5',
      name: 'Rahul Kumar',
      initials: 'RK',
      position: 'Backend Developer',
      experience: '6 years',
      location: 'Hyderabad, Hybrid',
      skills: ['Node.js', 'Python', 'AWS', 'Microservices', 'Kubernetes'],
      education: 'B.Tech Computer Science',
      institution: 'NIT Warangal',
      matchPercentage: 87,
      status: 'proposal_sent',
      matchedJobTitle: 'Senior Backend Developer',
      discoveredTime: '6 hours ago',
      proposalSentTime: '4 hours ago',
      salary: '₹14L - ₹22L',
      profileCompletion: 94,
      isAvailable: true,
      lastActive: '30 mins ago',
      resumeUrl: null,
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Filter candidates based on active filter and search query
  const getFilteredCandidates = () => {
    let filtered = candidates;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        candidate.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.matchedJobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Get filter stats
  const getFilterStats = () => {
    return {
      all: candidates.length,
      discovered: candidates.filter(c => c.status === 'discovered').length,
      proposal_sent: candidates.filter(c => c.status === 'proposal_sent').length,
      accepted: candidates.filter(c => c.status === 'accepted').length,
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
      {/* Discovery Stats */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background.accent,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.teal,
            }}
          >
            {candidates.length}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Total Matches
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background.accent,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.orange,
            }}
          >
            {stats.discovered}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            New Discoveries
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background.accent,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.status.success,
            }}
          >
            {stats.accepted}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Accepted
          </Text>
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
          placeholder="Search by name, skills, position, or matching job..."
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
          { id: 'all', label: 'All Matches', count: stats.all },
          { id: 'discovered', label: 'New', count: stats.discovered },
          { id: 'proposal_sent', label: 'Proposals Sent', count: stats.proposal_sent },
          { id: 'accepted', label: 'Accepted', count: stats.accepted },
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

  // Candidate Item Component - Redesigned for discovery model
  const CandidateItem = ({ item }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'discovered': return theme.colors.primary.orange;
        case 'proposal_sent': return theme.colors.primary.deepBlue;
        case 'accepted': return theme.colors.status.success;
        case 'rejected': return theme.colors.status.error;
        default: return theme.colors.text.tertiary;
      }
    };

    const getStatusText = () => {
      switch (item.status) {
        case 'discovered': return 'New Discovery';
        case 'proposal_sent': return 'Proposal Sent';
        case 'accepted': return 'Accepted';
        case 'rejected': return 'Rejected';
        default: return 'Unknown';
      }
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/candidate-details/${item.id}`)}
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          marginHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        }}
        activeOpacity={0.9}
      >
        {/* Header Row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
          {/* Candidate Avatar */}
          <View style={{ position: 'relative', marginRight: theme.spacing.md }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: item.status === 'discovered' 
                  ? theme.colors.primary.orange 
                  : theme.colors.background.accent,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: getStatusColor(),
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.bold,
                  color: item.status === 'discovered' 
                    ? theme.colors.neutral.white 
                    : theme.colors.primary.teal,
                }}
              >
                {item.initials}
              </Text>
            </View>

            {/* Online status */}
            {item.isAvailable && (
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

          {/* Candidate Info */}
          <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {item.position} • {item.experience}
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.primary.teal,
                marginBottom: theme.spacing.xs,
              }}
            >
              Matches: {item.matchedJobTitle}
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.tertiary,
              }}
            >
              {item.lastActive}
            </Text>
          </View>

          {/* Status and Match */}
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={{
                backgroundColor: `${getStatusColor()}15`,
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.xs,
                paddingVertical: 2,
                marginBottom: theme.spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.medium,
                  color: getStatusColor(),
                }}
              >
                {getStatusText()}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: theme.colors.status.success,
                borderRadius: theme.borderRadius.full,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.bold,
                  color: theme.colors.neutral.white,
                }}
              >
                {item.matchPercentage}% Match
              </Text>
            </View>
          </View>
        </View>

        {/* Details Row */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md, gap: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.text.tertiary}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
              }}
            >
              {item.location}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
            <Ionicons
              name="cash-outline"
              size={14}
              color={theme.colors.text.tertiary}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
              }}
            >
              {item.salary}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
            <Ionicons
              name="school-outline"
              size={14}
              color={theme.colors.text.tertiary}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
              }}
              numberOfLines={1}
            >
              {item.education}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.colors.text.tertiary}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
              }}
            >
              Found {item.discoveredTime}
            </Text>
          </View>
        </View>

        {/* Skills */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md }}>
          {item.skills.slice(0, 4).map((skill, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.colors.background.accent,
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                marginRight: theme.spacing.xs,
                marginBottom: theme.spacing.xs,
                borderWidth: 1,
                borderColor: theme.colors.primary.teal,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.primary.teal,
                }}
              >
                {skill}
              </Text>
            </View>
          ))}
          {item.skills.length > 4 && (
            <View
              style={{
                backgroundColor: theme.colors.neutral.lightGray,
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                marginRight: theme.spacing.xs,
                marginBottom: theme.spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.text.tertiary,
                }}
              >
                +{item.skills.length - 4}
              </Text>
            </View>
          )}
        </View>

        {/* Action based on status */}
        {item.status === 'discovered' && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary.teal,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.sm,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="paper-plane-outline"
              size={16}
              color={theme.colors.neutral.white}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.neutral.white,
              }}
            >
              Send Job Proposal
            </Text>
          </TouchableOpacity>
        )}

        {item.status === 'proposal_sent' && (
          <View
            style={{
              backgroundColor: theme.colors.background.accent,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.sm,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={theme.colors.primary.deepBlue}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.primary.deepBlue,
              }}
            >
              Proposal Sent {item.proposalSentTime}
            </Text>
          </View>
        )}

        {item.status === 'accepted' && (
          <TouchableOpacity
            onPress={() => router.push(`/employer/messages/${item.id}`)}
            style={{
              backgroundColor: theme.colors.status.success,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.sm,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={theme.colors.neutral.white}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.neutral.white,
              }}
            >
              Start Conversation
            </Text>
          </TouchableOpacity>
        )}

        {/* Profile Completion Bar */}
        <View style={{ marginTop: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.text.secondary,
              }}
            >
              Profile Completion
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.primary.teal,
              }}
            >
              {item.profileCompletion}%
            </Text>
          </View>
          <View
            style={{
              height: 4,
              backgroundColor: theme.colors.neutral.lightGray,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${item.profileCompletion}%`,
                height: '100%',
                backgroundColor: theme.colors.primary.teal,
              }}
            />
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
            searchQuery ? 'search-outline' :
            activeFilter === 'discovered' ? 'person-add-outline' :
            activeFilter === 'proposal_sent' ? 'paper-plane-outline' :
            activeFilter === 'accepted' ? 'checkmark-circle-outline' :
            'people-outline'
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
        {searchQuery ? 'No candidates found' :
         activeFilter === 'discovered' ? 'No new discoveries' :
         activeFilter === 'proposal_sent' ? 'No proposals sent' :
         activeFilter === 'accepted' ? 'No accepted proposals' :
         'No candidate matches yet'}
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
        {searchQuery ? 'Try adjusting your search terms or filters' :
         activeFilter === 'discovered' ? 'New candidate matches will appear here as they become available' :
         activeFilter === 'proposal_sent' ? 'Candidates you send proposals to will appear here' :
         activeFilter === 'accepted' ? 'Candidates who accept your proposals will appear here' :
         'Create job postings to start discovering matching candidates'}
      </Text>
    </View>
  );

  const filteredCandidates = getFilteredCandidates();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          theme.colors.background.accent,
          'rgba(27, 163, 163, 0.02)',
          theme.colors.background.primary,
        ]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        locations={[0, 0.3, 1]}
      />

      <Header />
      
      {filteredCandidates.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredCandidates}
          renderItem={({ item }) => <CandidateItem item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: theme.spacing.md }}
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