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
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function EmployerHome() {
  const [refreshing, setRefreshing] = useState(false);

  // Mock company data and statistics - redesigned for reverse recruitment
  const [dashboardData] = useState({
    company: {
      name: 'TechCorp Solutions',
      plan: 'Premium',
      planExpiry: '2025-07-15',
    },
    stats: {
      activeJobs: 12,
      totalCandidateMatches: 248,
      newMatches: 23,
      proposalsSent: 45,
      proposalsAccepted: 8,
      hiredThisMonth: 3,
    },
    matchedCandidates: [
      {
        id: '1',
        candidateName: 'John Smith',
        candidateInitials: 'JS',
        position: 'Senior React Developer',
        matchedJobTitle: 'Senior React Developer',
        discoveredTime: '2 hours ago',
        experience: '5 years',
        location: 'Mumbai',
        skills: ['React', 'Node.js', 'TypeScript'],
        matchPercentage: 95,
        status: 'discovered', // 'discovered', 'proposal_sent', 'accepted', 'rejected'
        proposalSentTime: null,
      },
      {
        id: '2',
        candidateName: 'Sarah Johnson',
        candidateInitials: 'SJ',
        position: 'Frontend Developer',
        matchedJobTitle: 'Frontend Developer',
        discoveredTime: '4 hours ago',
        experience: '3 years',
        location: 'Bangalore',
        skills: ['React', 'Vue.js', 'CSS'],
        matchPercentage: 88,
        status: 'proposal_sent',
        proposalSentTime: '2 hours ago',
      },
      {
        id: '3',
        candidateName: 'Mike Chen',
        candidateInitials: 'MC',
        position: 'Full Stack Developer',
        matchedJobTitle: 'Full Stack Developer',
        discoveredTime: '1 day ago',
        experience: '4 years',
        location: 'Pune',
        skills: ['React', 'Python', 'AWS'],
        matchPercentage: 82,
        status: 'accepted',
        proposalSentTime: '6 hours ago',
      },
    ],
    activeJobs: [
      {
        id: '1',
        title: 'Senior React Developer',
        location: 'Mumbai, Remote',
        postedDate: '2024-01-10',
        matchesFound: 45,
        proposalsSent: 12,
        status: 'active',
        urgency: 'high',
        salary: '₹8L - ₹15L',
      },
      {
        id: '2',
        title: 'Frontend Developer',
        location: 'Bangalore',
        postedDate: '2024-01-12',
        matchesFound: 32,
        proposalsSent: 8,
        status: 'active',
        urgency: 'medium',
        salary: '₹6L - ₹12L',
      },
      {
        id: '3',
        title: 'Full Stack Developer',
        location: 'Pune, Hybrid',
        postedDate: '2024-01-14',
        matchesFound: 28,
        proposalsSent: 5,
        status: 'active',
        urgency: 'low',
        salary: '₹7L - ₹13L',
      },
    ],
    recentActivity: [
      {
        id: '1',
        type: 'new_match',
        message: 'New candidate match found: John Smith for Senior React Developer',
        time: '2 hours ago',
        icon: 'person-outline',
        color: theme.colors.primary.teal,
      },
      {
        id: '2',
        type: 'proposal_accepted',
        message: 'Mike Chen accepted your job proposal for Full Stack Developer',
        time: '3 hours ago',
        icon: 'checkmark-circle-outline',
        color: theme.colors.status.success,
      },
      {
        id: '3',
        type: 'proposal_sent',
        message: 'Job proposal sent to Sarah Johnson for Frontend Developer',
        time: '5 hours ago',
        icon: 'paper-plane-outline',
        color: theme.colors.primary.orange,
      },
      {
        id: '4',
        type: 'job_posted',
        message: 'New job posting created: Backend Developer',
        time: '1 day ago',
        icon: 'briefcase-outline',
        color: theme.colors.primary.deepBlue,
      },
    ],
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Stats Cards Component - Updated for reverse recruitment
  const StatsCards = () => (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      {[
        {
          title: 'Active Jobs',
          value: dashboardData.stats.activeJobs,
          icon: 'briefcase-outline',
          color: theme.colors.primary.teal,
          onPress: () => router.push('/employer/jobs'),
        },
        {
          title: 'New Matches',
          value: dashboardData.stats.newMatches,
          icon: 'people-outline',
          color: theme.colors.primary.orange,
          onPress: () => router.push('/employer/candidates'),
        },
        {
          title: 'Proposals Sent',
          value: dashboardData.stats.proposalsSent,
          icon: 'paper-plane-outline',
          color: theme.colors.status.success,
          onPress: () => router.push('/employer/proposals'),
        },
        {
          title: 'Accepted',
          value: dashboardData.stats.proposalsAccepted,
          icon: 'checkmark-circle-outline',
          color: theme.colors.primary.deepBlue,
          onPress: () => router.push('/employer/accepted'),
        },
      ].map((stat, index) => (
        <TouchableOpacity
          key={index}
          onPress={stat.onPress}
          style={{
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['transparent', `${stat.color}10`]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: theme.borderRadius.lg,
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name={stat.icon}
              size={20}
              color={stat.color}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.text.secondary,
                flex: 1,
              }}
            >
              {stat.title}
            </Text>
          </View>
          <Text
            style={{
              fontSize: theme.typography.sizes.xxl,
              fontFamily: theme.typography.fonts.bold,
              color: stat.color,
              marginTop: theme.spacing.xs,
            }}
          >
            {stat.value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Candidate Match Card Component - Updated for discovery model
  const CandidateMatchCard = ({ item }) => {
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
        case 'discovered': return 'New Match';
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
          padding: theme.spacing.md,
          marginHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        }}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: item.status === 'discovered' 
                ? theme.colors.primary.orange 
                : theme.colors.background.accent,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: theme.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.bold,
                color: item.status === 'discovered' 
                  ? theme.colors.neutral.white 
                  : theme.colors.primary.teal,
              }}
            >
              {item.candidateInitials}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {item.candidateName}
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
              }}
            >
              Matches: {item.matchedJobTitle}
            </Text>
          </View>

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

        {/* Details */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.md }}>
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

          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.md }}>
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
              {item.experience}
            </Text>
          </View>

          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.tertiary,
            }}
          >
            Found {item.discoveredTime}
          </Text>
        </View>

        {/* Skills */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm }}>
          {item.skills.slice(0, 3).map((skill, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.colors.background.accent,
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
                  color: theme.colors.primary.teal,
                }}
              >
                {skill}
              </Text>
            </View>
          ))}
          {item.skills.length > 3 && (
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
                +{item.skills.length - 3}
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
              Send Proposal
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
              Waiting for Response
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
      </TouchableOpacity>
    );
  };

  // Job Card Component - Updated metrics
  const JobCard = ({ item }) => {
    const getUrgencyColor = () => {
      switch (item.urgency) {
        case 'high': return theme.colors.status.error;
        case 'medium': return theme.colors.status.warning;
        default: return theme.colors.status.success;
      }
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/jobs/${item.id}`)}
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        }}
        activeOpacity={0.9}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {item.title}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
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
                  marginRight: theme.spacing.md,
                }}
              >
                {item.location}
              </Text>

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

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.primary.teal,
                  marginRight: theme.spacing.md,
                }}
              >
                {item.matchesFound} matches found
              </Text>

              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                  marginRight: theme.spacing.md,
                }}
              >
                {item.proposalsSent} proposals sent
              </Text>
            </View>

            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.xs,
              }}
            >
              Posted {item.postedDate}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: `${getUrgencyColor()}15`,
              borderRadius: theme.borderRadius.sm,
              paddingHorizontal: theme.spacing.xs,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                fontFamily: theme.typography.fonts.medium,
                color: getUrgencyColor(),
                textTransform: 'capitalize',
              }}
            >
              {item.urgency} Priority
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Activity Item Component
  const ActivityItem = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: `${item.color}15`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <Ionicons
          name={item.icon}
          size={18}
          color={item.color}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.text.primary,
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
          {item.time}
        </Text>
      </View>
    </View>
  );

  // Create FlatList data
  const createFlatListData = () => {
    const data = [
      { type: 'stats', id: 'stats' },
      { type: 'matches-header', id: 'matches-header' },
      ...dashboardData.matchedCandidates.map((item, index) => ({ type: 'candidate_match', ...item, id: `match-${item.id}` })),
      { type: 'jobs-header', id: 'jobs-header' },
      ...dashboardData.activeJobs.map((item, index) => ({ type: 'job', ...item, id: `job-${item.id}` })),
      { type: 'activity-header', id: 'activity-header' },
      { type: 'activity-container', id: 'activity-container' },
    ];
    return data;
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'stats':
        return <StatsCards />;
      
      case 'matches-header':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              marginTop: theme.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.md,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.text.primary,
              }}
            >
              Candidate Matches
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/employer/candidates')}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.primary.teal,
                }}
              >
                Discover More
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'candidate_match':
        return <CandidateMatchCard item={item} />;
      
      case 'jobs-header':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              marginTop: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.md,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.text.primary,
              }}
            >
              Active Job Postings
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/employer/jobs')}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.primary.teal,
                }}
              >
                Manage All
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'job':
        return <JobCard item={item} />;
      
      case 'activity-header':
        return (
          <Text
            style={{
              fontSize: theme.typography.sizes.md,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.text.primary,
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              marginTop: theme.spacing.lg,
            }}
          >
            Recent Activity
          </Text>
        );
      
      case 'activity-container':
        return (
          <View
            style={{
              backgroundColor: theme.colors.background.card,
              marginHorizontal: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border.light,
              marginBottom: theme.spacing.xl,
            }}
          >
            {dashboardData.recentActivity.map((activityItem, index) => (
              <View key={activityItem.id}>
                <ActivityItem item={activityItem} />
                {index < dashboardData.recentActivity.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.border.light,
                      marginLeft: theme.spacing.lg + 36 + theme.spacing.md,
                      marginRight: theme.spacing.lg,
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

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

      <FlatList
        data={createFlatListData()}
        renderItem={renderItem}
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
    </View>
  );
}