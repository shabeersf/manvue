import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
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

export default function JobSeekerHome() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Load user data from API
  const loadUserData = async () => {
    try {
      setError(null);
      const userId = await SecureStore.getItemAsync('user_id');

      if (!userId) {
        setError('User not found. Please log in again.');
        return;
      }

      const response = await apiService.getHomeDashboard(userId, 'jobseeker');

      if (response.success) {
        setUserData(response.data);
        setJobRecommendations(response.data.job_recommendations || []);
        setRecentActivity(response.data.recent_activity || []);
        console.log('✅ User data loaded:', response.data);
      } else {
        setError(response.message || 'Failed to load user data');
        console.log('❌ Failed to load user data:', response.errors);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.log('❌ Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Use dynamic job recommendations from API
  const getJobRecommendations = () => {
    return jobRecommendations.length > 0 ? jobRecommendations : [];
  };

  // Recent activity will come from API data
  const getRecentActivity = () => {
    if (!recentActivity || recentActivity.length === 0) return [];

    return recentActivity.map((activity, index) => ({
      id: index.toString(),
      type: activity.type,
      message: activity.message,
      time: formatDate(activity.date),
      icon: getActivityIcon(activity.type),
      color: getActivityColor(activity.type),
      status: activity.status
    }));
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'application':
        return 'document-text-outline';
      case 'interview':
        return 'videocam-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'profile_view':
        return 'eye-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'application':
        return theme.colors.primary.teal;
      case 'interview':
        return theme.colors.primary.orange;
      case 'message':
        return theme.colors.primary.deepBlue;
      case 'profile_view':
        return theme.colors.status.success;
      default:
        return theme.colors.text.secondary;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'Recently';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Stats Cards Component
  const StatsCards = () => (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.md,
        justifyContent: 'space-between',
      }}
    >
      {/* Profile Card */}
      <View
        style={{
          flex: 1,
          aspectRatio: 1,
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          justifyContent: 'space-between',
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
        {/* Text at the top */}
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
        >
          Profile
        </Text>

        {/* Number and Icon at the bottom */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.teal,
              marginBottom: theme.spacing.xs,
            }}
          >
            {userData?.statistics?.profile_completion ? `${userData.statistics.profile_completion}%` : '--'}
          </Text>
          <Ionicons
            name="person-circle-outline"
            size={20}
            color={theme.colors.primary.teal}
          />
        </View>
      </View>

      {/* Applications Card */}
      <View
        style={{
          flex: 1,
          aspectRatio: 1,
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          justifyContent: 'space-between',
        }}
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
        {/* Text at the top */}
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
        >
          Applications
        </Text>

        {/* Number and Icon at the bottom */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.orange,
              marginBottom: theme.spacing.xs,
            }}
          >
            {userData?.statistics?.total_applications || 0}
          </Text>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={theme.colors.primary.orange}
          />
        </View>
      </View>

      {/* Interviews Card */}
      <View
        style={{
          flex: 1,
          aspectRatio: 1,
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          justifyContent: 'space-between',
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
        {/* Text at the top */}
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
        >
          Interviews
        </Text>

        {/* Number and Icon at the bottom */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.deepBlue,
              marginBottom: theme.spacing.xs,
            }}
          >
            {userData?.statistics?.interview_scheduled || 0}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.primary.deepBlue}
          />
        </View>
      </View>
    </View>
  );

  // Job Recommendations Card
  const RecommendationCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/job-details/${item.job_id}`)}
      style={{
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      }}
      activeOpacity={0.9}
    >
      {/* Match percentage badge */}
      <View
        style={{
          position: 'absolute',
          top: theme.spacing.sm,
          right: theme.spacing.sm,
          backgroundColor: item.employer_viewed ? theme.colors.primary.orange : theme.colors.status.success,
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
          {item.employer_viewed ? 'Viewed You' : `${item.match_percentage}% Match`}
        </Text>
      </View>

      {/* Company header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.background.accent,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.teal,
            }}
          >
            {item.company_name.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.text.primary,
            }}
          >
            {item.company_name}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
            }}
          >
            {item.posted_time}
          </Text>
        </View>
      </View>

      {/* Position and location */}
      <Text
        style={{
          fontSize: theme.typography.sizes.md,
          fontFamily: theme.typography.fonts.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xs,
        }}
      >
        {item.position}
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
          }}
        >
          {item.location}
        </Text>
      </View>

      {/* Skills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm }}>
        {item.skills.map((skill, index) => (
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
      </View>

      {/* Action buttons */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: theme.colors.neutral.lightGray,
            borderRadius: theme.borderRadius.md,
            paddingVertical: theme.spacing.sm,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
            }}
          >
            Save for Later
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            borderRadius: theme.borderRadius.md,
            overflow: 'hidden',
          }}
          onPress={() => router.push(`/job-details/${item.job_id}`)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.colors.primary.teal, theme.colors.secondary.darkTeal]}
            style={{
              paddingVertical: theme.spacing.sm,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.neutral.white,
              }}
            >
              View Details
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Recent Activity Item
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

  // Create a single data array for the FlatList
  const createFlatListData = () => {
    const recommendations = getJobRecommendations();
    const data = [
      { type: 'stats', id: 'stats' },
    ];

    if (recommendations.length > 0) {
      data.push(
        { type: 'recommendations-header', id: 'recommendations-header' },
        ...recommendations.slice(0, 5).map(item => ({ type: 'recommendation', ...item }))
      );
    }

    data.push(
      { type: 'activity-header', id: 'activity-header' },
      { type: 'activity-container', id: 'activity-container' }
    );

    return data;
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'stats':
        return <StatsCards />;
      
      case 'recommendations-header':
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
              Recommended Jobs ({getJobRecommendations().length})
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
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
          </View>
        );
      
      case 'recommendation':
        return <RecommendationCard item={item} />;
      
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
        const activities = getRecentActivity();
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
            {activities.length > 0 ? (
              <>
                {activities.map((activityItem, index) => (
                  <React.Fragment key={activityItem.id}>
                    <ActivityItem item={activityItem} />
                    {index < activities.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: theme.colors.border.light,
                          marginLeft: theme.spacing.lg + 36 + theme.spacing.md,
                          marginRight: theme.spacing.lg,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <View style={{
                padding: theme.spacing.lg,
                alignItems: 'center'
              }}>
                <Text style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.tertiary,
                  textAlign: 'center'
                }}>
                  No recent activity. Start applying for jobs to see updates here!
                </Text>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
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
        <Text style={{
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.medium,
          color: theme.colors.text.secondary,
          textAlign: 'center'
        }}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  // Error Screen
  if (error && !userData) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg
      }}>
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
        <Text style={{
          fontSize: theme.typography.sizes.lg,
          fontFamily: theme.typography.fonts.bold,
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: theme.spacing.sm
        }}>
          Oops! Something went wrong
        </Text>
        <Text style={{
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.regular,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginBottom: theme.spacing.xl
        }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={loadUserData}
          style={{
            backgroundColor: theme.colors.primary.teal,
            borderRadius: theme.borderRadius.lg,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md
          }}
          activeOpacity={0.8}
        >
          <Text style={{
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.neutral.white
          }}>
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

      {/* Welcome Header with User Data */}
      {userData && (
        <View style={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.md
        }}>
          <Text style={{
            fontSize: theme.typography.sizes.xl,
            fontFamily: theme.typography.fonts.bold,
            color: theme.colors.text.primary,
          }}>
            Welcome back, {userData.first_name}!
          </Text>
          {userData.profile?.current_job_title && (
            <Text style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.xs
            }}>
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