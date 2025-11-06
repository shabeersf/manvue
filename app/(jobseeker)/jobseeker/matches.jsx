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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Matches() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'
  const [jobseekerId, setJobseekerId] = useState(null);
  
  // Data states
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    has_more: false,
  });

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Load proposals when user data is available or filter changes
  useEffect(() => {
    if (jobseekerId) {
      loadProposals();
    }
  }, [jobseekerId, activeFilter]);

  // Debounced search
  useEffect(() => {
    if (!jobseekerId) return;
    
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadProposals();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUserData = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      
      if (userId) {
        setJobseekerId(userId);
      } else {
        Alert.alert('Error', 'User session not found. Please login again.');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const loadProposals = async (showLoader = true) => {
    if (!jobseekerId) return;

    try {
      if (showLoader) setIsLoading(true);

      const params = {
        jobseeker_id: parseInt(jobseekerId),
        status: activeFilter,
        search_query: searchQuery.trim(),
        limit: 50,
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
        setPagination(response.data.pagination || { total: 0, limit: 50, offset: 0, has_more: false });
      } else {
        console.error('❌ Failed to load proposals:', response.message);
        Alert.alert('Error', response.message || 'Failed to load proposals');
        setMatches([]);
      }
    } catch (error) {
      console.error('❌ Error loading proposals:', error);
      Alert.alert('Error', 'Failed to load proposals. Please try again.');
      setMatches([]);
    } finally {
      if (showLoader) setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProposals(false);
  }, [jobseekerId, activeFilter, searchQuery]);

  // Navigate to job details
  const handleMatchPress = (item) => {
    router.push(`/job-details/${item.application_id}`);
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
      {/* Stats Cards */}
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
              fontSize: theme.typography.sizes.xxl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.teal,
            }}
          >
            {stats.total}
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
              fontSize: theme.typography.sizes.xxl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.orange,
            }}
          >
            {stats.pending}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Pending
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
              fontSize: theme.typography.sizes.xxl,
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
          placeholder="Search companies or positions..."
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
          { id: 'all', label: 'All', count: stats.total },
          { id: 'pending', label: 'Pending', count: stats.pending },
          { id: 'accepted', label: 'Accepted', count: stats.accepted },
          { id: 'rejected', label: 'Rejected', count: stats.rejected },
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

  // Match Item Component
  const MatchItem = ({ item }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'accepted': return theme.colors.status.success;
        case 'rejected': return theme.colors.status.error;
        default: return theme.colors.primary.orange;
      }
    };

    const getStatusIcon = () => {
      switch (item.status) {
        case 'accepted': return 'checkmark-circle';
        case 'rejected': return 'close-circle';
        default: return 'time';
      }
    };

    return (
      <TouchableOpacity
        onPress={() => handleMatchPress(item)}
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          marginHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          opacity: item.status === 'rejected' ? 0.7 : 1,
          ...theme.shadows.sm,
        }}
        activeOpacity={0.9}
      >
        {/* Header Row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
          {/* Company Avatar */}
          {item.companyLogo ? (
            <Image
              source={{ uri: item.companyLogo }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginRight: theme.spacing.md,
                borderWidth: 2,
                borderColor: getStatusColor(),
              }}
            />
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: theme.colors.background.accent,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: theme.spacing.md,
                borderWidth: 2,
                borderColor: getStatusColor(),
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.bold,
                  color: theme.colors.primary.teal,
                }}
              >
                {item.companyInitial}
              </Text>
            </View>
          )}

          {/* Company Info */}
          <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs }}>
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.text.primary,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {item.companyName}
              </Text>
              {item.isUrgent && (
                <View
                  style={{
                    backgroundColor: theme.colors.status.error,
                    borderRadius: theme.borderRadius.sm,
                    paddingHorizontal: theme.spacing.xs,
                    paddingVertical: 2,
                    marginLeft: theme.spacing.xs,
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
            </View>

            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}
            >
              {item.industry} • {item.companySize} employees
            </Text>
          </View>

          {/* Status and Match */}
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: `${getStatusColor()}15`,
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.xs,
                paddingVertical: 2,
                marginBottom: theme.spacing.xs,
              }}
            >
              <Ionicons
                name={getStatusIcon()}
                size={12}
                color={getStatusColor()}
                style={{ marginRight: theme.spacing.xs }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.medium,
                  color: getStatusColor(),
                  textTransform: 'capitalize',
                }}
              >
                {item.status}
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

        {/* Position Details */}
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

        {/* Job Info */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md, gap: theme.spacing.md }}>
          {item.location && (
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
                numberOfLines={1}
              >
                {item.location}
              </Text>
            </View>
          )}

          {item.salary && (
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
                numberOfLines={1}
              >
                {item.salary}
              </Text>
            </View>
          )}

          {item.employmentType && (
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={theme.colors.text.tertiary}
                style={{ marginRight: theme.spacing.xs }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                  textTransform: 'capitalize',
                }}
              >
                {item.employmentType.replace('_', '-')}
              </Text>
            </View>
          )}

          {item.experience && (
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
                {item.experience}
              </Text>
            </View>
          )}
        </View>

        {/* Skills */}
        {item.skills && item.skills.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md, gap: theme.spacing.xs }}>
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

        {/* Benefits */}
        {item.benefits && item.benefits.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md, gap: theme.spacing.xs }}>
            {item.benefits.slice(0, 3).map((benefit, index) => (
              <View
                key={`${item.id}_benefit_${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="checkmark-outline"
                  size={12}
                  color={theme.colors.status.success}
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xs,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.tertiary,
            }}
          >
            Received {item.proposalTime}
          </Text>
{/* {console.log("🚀 Sending proposal to candidate:", item.application_id)} */}
          <TouchableOpacity
            onPress={() => handleMatchPress(item)}
            style={{
              borderRadius: theme.borderRadius.md,
              overflow: 'hidden',
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.colors.primary.teal, theme.colors.secondary.darkTeal]}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
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
                View Details
              </Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={theme.colors.neutral.white}
              />
            </LinearGradient>
          </TouchableOpacity>
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
            activeFilter === 'pending' ? 'time-outline' :
            activeFilter === 'accepted' ? 'checkmark-circle-outline' :
            activeFilter === 'rejected' ? 'close-circle-outline' :
            'heart-outline'
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
        {searchQuery ? 'No matches found' :
         activeFilter === 'pending' ? 'No pending proposals' :
         activeFilter === 'accepted' ? 'No accepted proposals' :
         activeFilter === 'rejected' ? 'No rejected proposals' :
         'No matches yet'}
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
         activeFilter === 'pending' ? 'All proposals have been reviewed' :
         activeFilter === 'accepted' ? 'No accepted proposals to show' :
         activeFilter === 'rejected' ? 'No rejected proposals to show' :
         'Companies will appear here when they show interest in your profile'}
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
          Loading proposals...
        </Text>
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

      <Header />
      
      {matches.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={matches}
          renderItem={({ item }) => <MatchItem item={item} />}
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