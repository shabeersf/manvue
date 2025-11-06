import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function JobSeekerHome() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [jobseekerId, setJobseekerId] = useState(null);
  const [error, setError] = useState(null);
  
  // Matches/Proposals data
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  // Load user data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load proposals when jobseeker ID is available
  useEffect(() => {
    if (jobseekerId) {
      loadProposals();
    }
  }, [jobseekerId]);

  const loadInitialData = async () => {
    try {
      setError(null);
      const userId = await SecureStore.getItemAsync('user_id');

      if (!userId) {
        setError('User not found. Please log in again.');
        router.replace('/(auth)/login');
        return;
      }

      setJobseekerId(userId);

      // Load user dashboard data
      const response = await apiService.getHomeDashboard(userId, 'jobseeker');

      if (response.success) {
        setUserData(response.data);
        if (__DEV__) {
          console.log('✅ User data loaded:', response.data);
        }
      } else {
        console.error('❌ Failed to load user data:', response.message);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async (showLoader = true) => {
    if (!jobseekerId) return;

    try {
      if (showLoader && !refreshing) setLoading(true);

      const params = {
        jobseeker_id: parseInt(jobseekerId),
        status: 'pending', // Only show pending proposals on home
        search_query: '',
        limit: 10, // Show top 10 matches on home
        offset: 0,
      };

      if (__DEV__) {
        console.log('📤 Loading proposals with params:', params);
      }

      const response = await apiService.getJobseekerProposals(params);

      if (__DEV__) {
        console.log('📦 Proposals response:', response);
      }

      if (response.success) {
        setMatches(response.data.applications || []);
        setStats(response.data.stats || { total: 0, pending: 0, accepted: 0, rejected: 0 });
      } else {
        console.error('❌ Failed to load proposals:', response.message);
        setMatches([]);
      }
    } catch (error) {
      console.error('❌ Error loading proposals:', error);
      setMatches([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadInitialData(),
      loadProposals(false)
    ]);
    setRefreshing(false);
  }, [jobseekerId]);

  // Stats Cards Component
  const StatsCards = () => (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      {/* Profile Card */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          alignItems: 'center',
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(27, 163, 163, 0.05)']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: theme.borderRadius.lg,
          }}
        />
        <Ionicons
          name="person-circle-outline"
          size={24}
          color={theme.colors.primary.teal}
          style={{ marginBottom: theme.spacing.xs }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.lg,
            fontFamily: theme.typography.fonts.bold,
            color: theme.colors.primary.teal,
            marginBottom: 2,
          }}
        >
          {userData?.statistics?.profile_completion ? `${userData.statistics.profile_completion}%` : '--'}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          Profile
        </Text>
      </View>

      {/* Matches Card */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/matches')}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          alignItems: 'center',
        }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 138, 61, 0.05)']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: theme.borderRadius.lg,
          }}
        />
        <Ionicons
          name="heart-outline"
          size={24}
          color={theme.colors.primary.orange}
          style={{ marginBottom: theme.spacing.xs }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.lg,
            fontFamily: theme.typography.fonts.bold,
            color: theme.colors.primary.orange,
            marginBottom: 2,
          }}
        >
          {stats.pending || 0}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          Matches
        </Text>
      </TouchableOpacity>

      {/* Interviews Card */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          alignItems: 'center',
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(30, 74, 114, 0.05)']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: theme.borderRadius.lg,
          }}
        />
        <Ionicons
          name="calendar-outline"
          size={24}
          color={theme.colors.primary.deepBlue}
          style={{ marginBottom: theme.spacing.xs }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.lg,
            fontFamily: theme.typography.fonts.bold,
            color: theme.colors.primary.deepBlue,
            marginBottom: 2,
          }}
        >
          {userData?.statistics?.interview_scheduled || 0}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          Interviews
        </Text>
      </View>
    </View>
  );

  // Match/Proposal Card Component
  const MatchCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/job-details/${item.application_id}`)}
      style={{
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.sm,
      }}
      activeOpacity={0.9}
    >
      {/* Match percentage badge */}
      <View
        style={{
          position: 'absolute',
          top: theme.spacing.sm,
          right: theme.spacing.sm,
        }}
      >
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

      {/* Company header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
        {item.companyLogo ? (
          <Image
            source={{ uri: item.companyLogo }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              marginRight: theme.spacing.sm,
              borderWidth: 2,
              borderColor: theme.colors.primary.teal,
            }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.background.accent,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: theme.spacing.sm,
              borderWidth: 2,
              borderColor: theme.colors.primary.teal,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.primary.teal,
              }}
            >
              {item.companyInitial}
            </Text>
          </View>
        )}
        
        <View style={{ flex: 1, paddingRight: theme.spacing.xl }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.text.primary,
            }}
            numberOfLines={1}
          >
            {item.companyName}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
            }}
          >
            {item.proposalTime}
          </Text>
        </View>
      </View>

      {/* Position */}
      <Text
        style={{
          fontSize: theme.typography.sizes.md,
          fontFamily: theme.typography.fonts.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xs,
        }}
        numberOfLines={2}
      >
        {item.position}
      </Text>

      {/* Location and Salary */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm, gap: theme.spacing.md }}>
        {item.location && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
        )}

        {item.salary && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              numberOfLines={1}
            >
              {item.salary}
            </Text>
          </View>
        )}
      </View>

      {/* Skills */}
      {item.skills && item.skills.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm, gap: theme.spacing.xs }}>
          {item.skills.slice(0, 3).map((skill, index) => (
            <View
              key={`${item.id}_skill_${index}`}
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

      {/* Action button */}
      <TouchableOpacity
        style={{
          borderRadius: theme.borderRadius.md,
          overflow: 'hidden',
        }}
        onPress={() => router.push(`/job-details/${item.application_id}`)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[theme.colors.primary.teal, theme.colors.secondary.darkTeal]}
          style={{
            paddingVertical: theme.spacing.sm,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.neutral.white,
              marginRight: theme.spacing.xs,
            }}
          >
            View Proposal
          </Text>
          <Ionicons
            name="arrow-forward"
            size={14}
            color={theme.colors.neutral.white}
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Urgent badge */}
      {item.isUrgent && (
        <View
          style={{
            position: 'absolute',
            top: theme.spacing.sm,
            left: theme.spacing.sm,
            backgroundColor: theme.colors.status.error,
            borderRadius: theme.borderRadius.sm,
            paddingHorizontal: theme.spacing.xs,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.neutral.white,
            }}
          >
            URGENT
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Empty State for Matches
  const EmptyMatchesState = () => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        marginHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        marginBottom: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.colors.background.accent,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <Ionicons
          name="heart-outline"
          size={28}
          color={theme.colors.primary.teal}
        />
      </View>
      <Text
        style={{
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.semiBold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xs,
          textAlign: 'center',
        }}
      >
        No New Matches Yet
      </Text>
      <Text
        style={{
          fontSize: theme.typography.sizes.sm,
          fontFamily: theme.typography.fonts.regular,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: theme.typography.sizes.sm * 1.4,
        }}
      >
        Companies will appear here when they send you job proposals
      </Text>
    </View>
  );

  // Create FlatList data
  const createFlatListData = () => {
    const data = [{ type: 'stats', id: 'stats' }];

    // Add matches section
    data.push({ type: 'matches-header', id: 'matches-header' });
    
    if (matches.length > 0) {
      matches.forEach((match) => {
        data.push({ type: 'match', ...match });
      });
    } else {
      data.push({ type: 'empty-matches', id: 'empty-matches' });
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
              Your Matches {stats.pending > 0 && `(${stats.pending})`}
            </Text>
            {matches.length > 0 && (
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/matches')}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.medium,
                    color: theme.colors.primary.teal,
                  }}
                >
                  See All
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'match':
        return <MatchCard item={item} />;

      case 'empty-matches':
        return <EmptyMatchesState />;

      default:
        return null;
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
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
        <ActivityIndicator
          size="large"
          color={theme.colors.primary.teal}
          style={{ marginBottom: theme.spacing.md }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
        >
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  // Error Screen
  if (error && !userData) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
        }}
      >
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
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={theme.colors.status.error}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.lg,
            fontFamily: theme.typography.fonts.bold,
            color: theme.colors.text.primary,
            textAlign: 'center',
            marginBottom: theme.spacing.sm,
          }}
        >
          Oops! Something went wrong
        </Text>
        <Text
          style={{
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={loadInitialData}
          style={{
            backgroundColor: theme.colors.primary.teal,
            borderRadius: theme.borderRadius.lg,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.neutral.white,
            }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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

      {/* Welcome Header */}
      {userData && (
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.text.primary,
            }}
          >
            Welcome back, {userData.first_name}!
          </Text>
          {userData.profile?.current_job_title && (
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.xs,
              }}
            >
              {userData.profile.current_job_title}
            </Text>
          )}
        </View>
      )}

      <FlatList
        data={createFlatListData()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
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