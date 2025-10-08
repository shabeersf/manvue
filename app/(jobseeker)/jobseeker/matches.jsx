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

export default function Matches() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'

  // Mock matches data - companies interested in the user
  const [matches] = useState([
    {
      id: '1',
      companyName: 'TechCorp Solutions',
      companyInitial: 'TC',
      position: 'Senior React Developer',
      location: 'Mumbai, Remote',
      salary: '₹8,00,000 - ₹15,00,000',
      matchPercentage: 95,
      skills: ['React', 'Node.js', 'TypeScript'],
      proposalTime: '2 hours ago',
      status: 'accepted', // 'pending', 'accepted', 'rejected'
      employmentType: 'Full-time',
      experience: '3-5 years',
      isUrgent: false,
      companySize: '500-1000',
      industry: 'Information Technology',
      benefits: ['Health Insurance', 'Remote Work', 'Learning Budget'],
    },
    {
      id: '2',
      companyName: 'Digital Innovations',
      companyInitial: 'DI',
      position: 'Full Stack Developer',
      location: 'Bangalore',
      salary: '₹7,00,000 - ₹12,00,000',
      matchPercentage: 88,
      skills: ['React Native', 'Python', 'AWS'],
      proposalTime: '5 hours ago',
      status: 'pending',
      employmentType: 'Full-time',
      experience: '2-4 years',
      isUrgent: true,
      companySize: '100-500',
      industry: 'Software Development',
      benefits: ['Flexible Hours', 'Stock Options', 'Health Coverage'],
    },
    {
      id: '3',
      companyName: 'StartupHub',
      companyInitial: 'SH',
      position: 'Frontend Engineer',
      location: 'Pune, Hybrid',
      salary: '₹6,50,000 - ₹10,00,000',
      matchPercentage: 82,
      skills: ['React', 'Vue.js', 'JavaScript'],
      proposalTime: '1 day ago',
      status: 'pending',
      employmentType: 'Full-time',
      experience: '2-3 years',
      isUrgent: false,
      companySize: '50-100',
      industry: 'E-commerce',
      benefits: ['Startup Equity', 'Flexible Work', 'Team Events'],
    },
    {
      id: '4',
      companyName: 'InnovateCorp',
      companyInitial: 'IC',
      position: 'React Native Developer',
      location: 'Delhi, On-site',
      salary: '₹9,00,000 - ₹16,00,000',
      matchPercentage: 91,
      skills: ['React Native', 'Mobile Dev', 'Firebase'],
      proposalTime: '2 days ago',
      status: 'pending',
      employmentType: 'Full-time',
      experience: '3-6 years',
      isUrgent: true,
      companySize: '1000+',
      industry: 'Fintech',
      benefits: ['Premium Healthcare', 'Performance Bonus', 'Training'],
    },
    {
      id: '5',
      companyName: 'DevSolutions Ltd',
      companyInitial: 'DS',
      position: 'Senior Frontend Developer',
      location: 'Chennai, Remote',
      salary: '₹7,50,000 - ₹13,00,000',
      matchPercentage: 78,
      skills: ['React', 'Angular', 'TypeScript'],
      proposalTime: '3 days ago',
      status: 'rejected',
      employmentType: 'Full-time',
      experience: '4-7 years',
      isUrgent: false,
      companySize: '200-500',
      industry: 'Consulting',
      benefits: ['Work from Home', 'Health Insurance', 'Annual Bonus'],
    },
    {
      id: '6',
      companyName: 'FutureTech',
      companyInitial: 'FT',
      position: 'Lead Developer',
      location: 'Hyderabad, Hybrid',
      salary: '₹12,00,000 - ₹20,00,000',
      matchPercentage: 89,
      skills: ['React', 'Leadership', 'Architecture'],
      proposalTime: '4 days ago',
      status: 'pending',
      employmentType: 'Full-time',
      experience: '5-8 years',
      isUrgent: false,
      companySize: '500-1000',
      industry: 'AI/ML',
      benefits: ['Stock Options', 'Premium Benefits', 'Innovation Time'],
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Filter matches based on active filter and search query
  const getFilteredMatches = () => {
    let filtered = matches;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(match => match.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(match =>
        match.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Get stats for filters
  const getFilterStats = () => {
    return {
      all: matches.length,
      pending: matches.filter(m => m.status === 'pending').length,
      accepted: matches.filter(m => m.status === 'accepted').length,
      rejected: matches.filter(m => m.status === 'rejected').length,
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
            {matches.length}
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
          { id: 'all', label: 'All', count: stats.all },
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
        onPress={() => router.push(`/job-details/${item.id}`)}
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          marginHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          opacity: item.status === 'rejected' ? 0.7 : 1,
        }}
        activeOpacity={0.9}
      >
        {/* Header Row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
          {/* Company Avatar */}
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
              }}
            >
              {item.employmentType}
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
              {item.experience}
            </Text>
          </View>
        </View>

        {/* Skills */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md }}>
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
        </View>

        {/* Benefits */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md }}>
          {item.benefits.slice(0, 3).map((benefit, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: theme.spacing.md,
                marginBottom: theme.spacing.xs,
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

          <TouchableOpacity
            onPress={() => router.push(`/job-details/${item.id}`)}
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

  const filteredMatches = getFilteredMatches();

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
      
      {filteredMatches.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredMatches}
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