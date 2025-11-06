import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function EmployerHome() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employerUserId, setEmployerUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    company: {
      name: '',
      plan: 'Free',
      planType: 'free',
      planExpiry: null,
    },
    stats: {
      activeJobs: 0,
      totalCandidateMatches: 0,
      newMatches: 0,
      proposalsSent: 0,
      proposalsAccepted: 0,
      hiredThisMonth: 0,
    },
    matchedCandidates: [],
  });

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Load dashboard when user data is available
  useEffect(() => {
    if (employerUserId && companyId) {
      loadDashboard();
    }
  }, [employerUserId, companyId]);

  const loadUserData = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const storedCompanyId = await SecureStore.getItemAsync('company_id');

      if (userId && storedCompanyId) {
        setEmployerUserId(userId);
        setCompanyId(storedCompanyId);
      } else {
        Alert.alert('Error', 'User session not found. Please login again.');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const loadDashboard = async () => {
    if (!employerUserId || !companyId) return;

    try {
      setIsLoading(true);

      const params = {
        employer_user_id: parseInt(employerUserId),
        company_id: parseInt(companyId),
        match_limit: 5, // Show 5 recent matches
      };

      if (__DEV__) {
        console.log('📤 Loading dashboard with params:', params);
      }

      const response = await apiService.getEmployerHomeDashboard(params);

      if (__DEV__) {
        console.log('📦 Dashboard response:', response);
      }

      if (response.success) {
        setDashboardData(response.data);
      } else {
        console.error('❌ Failed to load dashboard:', response.message);
        // Alert.alert('Error', response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [employerUserId, companyId]);

  // Stats Cards Component
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
          onPress: () => router.push('/employer/candidates'),
        },
        {
          title: 'Accepted',
          value: dashboardData.stats.proposalsAccepted,
          icon: 'checkmark-circle-outline',
          color: theme.colors.primary.deepBlue,
          onPress: () => router.push('/employer/candidates'),
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
            ...theme.shadows.sm,
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

  // Candidate Match Card Component
  const CandidateMatchCard = ({ item }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'discovered':
          return theme.colors.primary.orange;
        case 'proposal_sent':
          return theme.colors.primary.deepBlue;
        case 'accepted':
          return theme.colors.status.success;
        case 'rejected':
          return theme.colors.status.error;
        default:
          return theme.colors.text.tertiary;
      }
    };

    const getStatusText = () => {
      switch (item.status) {
        case 'discovered':
          return 'New Match';
        case 'proposal_sent':
          return 'Proposal Sent';
        case 'accepted':
          return 'Accepted';
        case 'rejected':
          return 'Rejected';
        default:
          return 'Unknown';
      }
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/candidate-details/${item.user_id}`)}
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          ...theme.shadows.sm,
        }}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
          }}
        >
          {item.profileImage ? (
            <Image
              source={{ uri: item.profileImage }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: theme.spacing.md,
                borderWidth: 2,
                borderColor: getStatusColor(),
              }}
            />
          ) : (
            <LinearGradient
              colors={
                item.status === 'discovered'
                  ? [theme.colors.primary.orange, theme.colors.secondary.darkOrange]
                  : [theme.colors.primary.teal, theme.colors.secondary.darkTeal]
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: theme.spacing.md,
                borderWidth: 2,
                borderColor: getStatusColor(),
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.bold,
                  color: theme.colors.neutral.white,
                }}
              >
                {item.candidateInitials}
              </Text>
            </LinearGradient>
          )}

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
              numberOfLines={1}
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

            <LinearGradient
              colors={
                item.matchPercentage >= 80
                  ? [theme.colors.status.success, '#0D9488']
                  : item.matchPercentage >= 60
                  ? [theme.colors.primary.teal, theme.colors.secondary.darkTeal]
                  : [theme.colors.primary.orange, theme.colors.secondary.darkOrange]
              }
              style={{
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
            </LinearGradient>
          </View>
        </View>

        {/* Details */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: theme.spacing.md,
            }}
          >
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: theme.spacing.md,
            }}
          >
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
        {item.skills && item.skills.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: theme.spacing.sm,
              gap: theme.spacing.xs,
            }}
          >
            {item.skills.slice(0, 3).map((skill, index) => (
              <View
                key={`${item.id}_skill_${index}_${skill}`}
                style={{
                  backgroundColor: theme.colors.background.accent,
                  borderRadius: theme.borderRadius.sm,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
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
            {item.skills.length > 3 && (
              <View
                style={{
                  backgroundColor: theme.colors.neutral.lightGray,
                  borderRadius: theme.borderRadius.sm,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderWidth: 1,
                  borderColor: theme.colors.border.light,
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
        )}

        {/* Action based on status */}
        {item.status === 'discovered' && (
          <TouchableOpacity
            onPress={() => router.push(`/candidate-details/${item.user_id}`)}
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
              borderWidth: 1,
              borderColor: theme.colors.primary.deepBlue,
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
              Waiting for Response{' '}
              {item.proposalSentTime ? `• ${item.proposalSentTime}` : ''}
            </Text>
          </View>
        )}

        {item.status === 'accepted' && (
          <TouchableOpacity
            onPress={() => router.push(`/chat/${item.jobseeker_id}/${item.application_id}/${item.conversation_id}`)}
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
                          {/* {console.log("💬 Starting conversation with candidate:", item.application_id)} */}
            
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

  // Loading State
  const LoadingState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.xxxl,
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary.teal} />
      <Text
        style={{
          marginTop: theme.spacing.lg,
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.medium,
          color: theme.colors.text.secondary,
        }}
      >
        Loading dashboard...
      </Text>
    </View>
  );

  // Empty State
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
      <LinearGradient
        colors={[theme.colors.background.accent, theme.colors.background.primary]}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.xl,
        }}
      >
        <Ionicons name="people" size={40} color={theme.colors.primary.teal} />
      </LinearGradient>

      <Text
        style={{
          fontSize: theme.typography.sizes.xl,
          fontFamily: theme.typography.fonts.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.sm,
          textAlign: 'center',
        }}
      >
        No Candidate Matches Yet
      </Text>

      <Text
        style={{
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.regular,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: theme.typography.sizes.base * 1.5,
          marginBottom: theme.spacing.xl,
        }}
      >
        Create job postings to start discovering matching candidates
      </Text>

      <TouchableOpacity
        onPress={() => router.push('/post-job')}
        style={{
          backgroundColor: theme.colors.primary.teal,
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.xxl,
          paddingVertical: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          ...theme.shadows.md,
        }}
        activeOpacity={0.8}
      >
        <Ionicons
          name="add-circle"
          size={20}
          color={theme.colors.neutral.white}
          style={{ marginRight: theme.spacing.sm }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.neutral.white,
          }}
        >
          Post a Job
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Create FlatList data
  const createFlatListData = () => {
    const data = [{ type: 'stats', id: 'stats' }];

    if (dashboardData.matchedCandidates.length > 0) {
      data.push({ type: 'matches-header', id: 'matches-header' });
      dashboardData.matchedCandidates.forEach((item) => {
        data.push({ type: 'candidate_match', ...item });
      });
    }

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
              Recent Candidate Matches
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
                View All
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'candidate_match':
        return <CandidateMatchCard item={item} />;

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

      {isLoading ? (
        <LoadingState />
      ) : dashboardData.matchedCandidates.length === 0 ? (
        <View style={{ flex: 1 }}>
          <StatsCards />
          <EmptyState />
        </View>
      ) : (
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
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        />
      )}
    </View>
  );
}