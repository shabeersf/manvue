import apiService from "@/services/apiService";
import theme from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function EmployerCandidates() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    total_matches: 0,
    new_discoveries: 0,
    proposals_sent: 0,
    accepted: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
  });
  const [employerUserId, setEmployerUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Auto-refresh interval ref
  const refreshIntervalRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load user data
  useEffect(() => {
    loadUserData();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Setup auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      if (employerUserId && companyId) {
        loadCandidates(true, true); // silent refresh
      }
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Load candidates when filters change
useFocusEffect(
  useCallback(() => {
    if (employerUserId && companyId) {
      loadCandidates(true);
    }
  }, [activeFilter, employerUserId, companyId])
);

  const loadUserData = async () => {
    try {
      const userId = await SecureStore.getItemAsync("user_id");
      const storedCompanyId = await SecureStore.getItemAsync("company_id");

      if (userId && storedCompanyId) {
        setEmployerUserId(userId);
        setCompanyId(storedCompanyId);
      } else {
        Alert.alert("Error", "User session not found. Please login again.");
        router.replace("/(auth)/login");
      }
    } catch (error) {
      console.error("❌ Failed to load user data:", error);
      Alert.alert("Error", "Failed to load user data");
    }
  };

  const loadCandidates = async (resetPagination = false, silentRefresh = false) => {
    if (!employerUserId || !companyId) return;

    try {
      if (resetPagination) {
        if (!silentRefresh) {
          setIsLoading(true);
        }
        setPagination({ limit: 20, offset: 0 });
      } else {
        setIsLoadingMore(true);
      }

      const params = {
        employer_user_id: parseInt(employerUserId),
        company_id: parseInt(companyId),
        status: activeFilter,
        search_query: searchQuery,
        limit: resetPagination ? 20 : pagination.limit,
        offset: resetPagination ? 0 : pagination.offset,
      };

      if (__DEV__ && !silentRefresh) {
        console.log("📤 Loading candidates with params:", params);
      }

      const response = await apiService.getMatchingCandidates(params);

      if (__DEV__ && !silentRefresh) {
        console.log("📦 Candidates response:", response);
      }

      if (response.success) {
        const newCandidates = response.data.candidates || [];
        const newStats = response.data.stats || {};
        const paginationData = response.data.pagination || {};
        const newTotalCount = response.data.total_count || 0;

        if (resetPagination) {
          setCandidates(newCandidates);
        } else {
          // Merge new candidates, avoiding duplicates by user_id
          setCandidates((prev) => {
            const existingIds = new Set(prev.map(c => c.user_id));
            const uniqueNew = newCandidates.filter(c => !existingIds.has(c.user_id));
            return [...prev, ...uniqueNew];
          });
        }

        setStats(newStats);
        setTotalCount(newTotalCount);
        setHasMore(paginationData.has_more || false);
        setPagination({
          limit: paginationData.limit || 20,
          offset: paginationData.offset + paginationData.current_count || 0,
        });
      } else {
        console.error("❌ Failed to load candidates:", response.message);
        if (!silentRefresh) {
          Alert.alert("Error", response.message || "Failed to load candidates");
        }
      }
    } catch (error) {
      console.error("❌ Error loading candidates:", error);
      if (!silentRefresh) {
        Alert.alert("Error", "Failed to load candidates. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCandidates(true);
  }, [employerUserId, companyId, activeFilter, searchQuery]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      loadCandidates(false);
    }
  };

  const handleSearch = () => {
    loadCandidates(true);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleSendProposal = (candidateUserId) => {
    router.push(`/candidate-details/${candidateUserId}`);
  };

  const handleViewCandidate = (candidateUserId) => {
    router.push(`/candidate-details/${candidateUserId}`);
  };

  const handleStartConversation = (item) => {
    router.push(`/chat/${item.jobseeker_id}/${item.application_id}/${item.conversation_id}`);
  };

  // Header Component
  const Header = () => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        ...theme.shadows.sm,
      }}
    >
      {/* Discovery Stats */}
      <View
        style={{
          flexDirection: "row",
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
            alignItems: "center",
            borderWidth: 1,
            borderColor: `${theme.colors.primary.teal}20`,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xxl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.teal,
            }}
          >
            {stats.total_matches}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
              textAlign: "center",
              marginTop: theme.spacing.xs,
            }}
          >
            Total Matches
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: `${theme.colors.primary.orange}10`,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            alignItems: "center",
            borderWidth: 1,
            borderColor: `${theme.colors.primary.orange}20`,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xxl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.orange,
            }}
          >
            {stats.new_discoveries}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
              textAlign: "center",
              marginTop: theme.spacing.xs,
            }}
          >
            New Finds
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: `${theme.colors.status.success}10`,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            alignItems: "center",
            borderWidth: 1,
            borderColor: `${theme.colors.status.success}20`,
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
              textAlign: "center",
              marginTop: theme.spacing.xs,
            }}
          >
            Accepted
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.neutral.lightGray,
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm + 2,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        }}
      >
        <Ionicons
          name="search"
          size={18}
          color={theme.colors.text.tertiary}
          style={{ marginRight: theme.spacing.sm }}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholder="Search by name, skills, position..."
          placeholderTextColor={theme.colors.text.placeholder}
          style={{
            flex: 1,
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.primary,
            paddingVertical: 0,
          }}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              loadCandidates(true);
            }}
            style={{ padding: theme.spacing.xs }}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View 
        style={{ 
          flexDirection: "row", 
          gap: theme.spacing.sm,
          flexWrap: "wrap",
        }}
      >
        {[
          { id: "all", label: "All", count: stats.total_matches, icon: "people" },
          { id: "discovered", label: "New", count: stats.new_discoveries, icon: "star" },
          { id: "submitted", label: "Proposals", count: stats.proposals_sent, icon: "paper-plane" },
          { id: "accepted", label: "Accepted", count: stats.accepted, icon: "checkmark-circle" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => handleFilterChange(filter.id)}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor:
                activeFilter === filter.id
                  ? theme.colors.primary.teal
                  : theme.colors.background.accent,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor:
                activeFilter === filter.id
                  ? theme.colors.primary.teal
                  : theme.colors.border.light,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={filter.icon}
              size={14}
              color={
                activeFilter === filter.id
                  ? theme.colors.neutral.white
                  : theme.colors.text.secondary
              }
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily:
                  activeFilter === filter.id
                    ? theme.typography.fonts.semiBold
                    : theme.typography.fonts.medium,
                color:
                  activeFilter === filter.id
                    ? theme.colors.neutral.white
                    : theme.colors.text.secondary,
              }}
            >
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <View
                style={{
                  backgroundColor:
                    activeFilter === filter.id
                      ? "rgba(255, 255, 255, 0.3)"
                      : theme.colors.primary.teal,
                  borderRadius: theme.borderRadius.full,
                  paddingHorizontal: theme.spacing.xs + 2,
                  paddingVertical: 2,
                  marginLeft: theme.spacing.xs,
                  minWidth: 20,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xs - 1,
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

  // Candidate Item Component
  const CandidateItem = ({ item, index }) => {
    const [itemFade] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    }, []);

    const getStatusColor = () => {
      switch (item.status) {
        case "discovered":
          return theme.colors.primary.orange;
        case "submitted":
          return theme.colors.primary.deepBlue;
        case "accepted":
          return theme.colors.status.success;
        case "rejected":
          return theme.colors.status.error;
        default:
          return theme.colors.text.tertiary;
      }
    };

    const getStatusText = () => {
      switch (item.status) {
        case "discovered":
          return "New Discovery";
        case "submitted":
          return "Proposal Sent";
        case "accepted":
          return "Accepted";
        case "rejected":
          return "Rejected";
        default:
          return "Unknown";
      }
    };

    const getStatusIcon = () => {
      switch (item.status) {
        case "discovered":
          return "star";
        case "submitted":
          return "paper-plane";
        case "accepted":
          return "checkmark-circle";
        case "rejected":
          return "close-circle";
        default:
          return "help-circle";
      }
    };

    return (
      <Animated.View style={{ opacity: itemFade }}>
        <TouchableOpacity
          onPress={() => handleViewCandidate(item.user_id)}
          style={{
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            ...theme.shadows.sm,
          }}
          activeOpacity={0.8}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: theme.spacing.md,
            }}
          >
            {/* Candidate Avatar */}
            <View style={{ position: "relative", marginRight: theme.spacing.md }}>
              {item.profileImage ? (
                <Image
                  source={{ uri: item.profileImage }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    borderWidth: 2,
                    borderColor: getStatusColor(),
                  }}
                />
              ) : (
                <LinearGradient
                  colors={
                    item.status === "discovered"
                      ? [theme.colors.primary.orange, theme.colors.secondary.darkOrange]
                      : [theme.colors.primary.teal, theme.colors.secondary.darkTeal]
                  }
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: getStatusColor(),
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.lg,
                      fontFamily: theme.typography.fonts.bold,
                      color: theme.colors.neutral.white,
                    }}
                  >
                    {item.initials}
                  </Text>
                </LinearGradient>
              )}

              {/* Online status */}
              {item.isAvailable && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
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
                  fontSize: theme.typography.sizes.md,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs,
                }}
                numberOfLines={1}
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
                numberOfLines={1}
              >
                {item.position}
                {item.company ? ` • ${item.company}` : ''}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.text.tertiary,
                }}
              >
                {item.experience}
              </Text>
            </View>

            {/* Status and Match */}
            <View style={{ alignItems: "flex-end" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: `${getStatusColor()}15`,
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  marginBottom: theme.spacing.sm,
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
                    fontFamily: theme.typography.fonts.semiBold,
                    color: getStatusColor(),
                  }}
                >
                  {getStatusText()}
                </Text>
              </View>

              <LinearGradient
                colors={
                  item.matchPercentage >= 80
                    ? [theme.colors.status.success, "#0D9488"]
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

          {/* Matched Job Title */}
          {item.matchedJobTitle && (
            <View
              style={{
                backgroundColor: theme.colors.background.accent,
                borderRadius: theme.borderRadius.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                marginBottom: theme.spacing.md,
                borderLeftWidth: 3,
                borderLeftColor: theme.colors.primary.teal,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.primary.teal,
                }}
                numberOfLines={1}
              >
                <Ionicons name="briefcase" size={14} color={theme.colors.primary.teal} />
                {' '}Matches: {item.matchedJobTitle}
              </Text>
            </View>
          )}

          {/* Details Grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: theme.spacing.md,
              gap: theme.spacing.md,
            }}
          >
            {item.location && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  minWidth: "45%",
                }}
              >
                <Ionicons
                  name="location"
                  size={14}
                  color={theme.colors.text.tertiary}
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.secondary,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </View>
            )}

            {item.salary && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  minWidth: "45%",
                }}
              >
                <Ionicons
                  name="cash"
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

            {item.education && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  minWidth: "45%",
                }}
              >
                <Ionicons
                  name="school"
                  size={14}
                  color={theme.colors.text.tertiary}
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.secondary,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {item.education}
                </Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                minWidth: "45%",
              }}
            >
              <Ionicons
                name="time"
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
                {item.lastActive}
              </Text>
            </View>
          </View>

          {/* Skills */}
          {item.skills && item.skills.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: theme.spacing.md,
                gap: theme.spacing.xs,
              }}
            >
              {item.skills.slice(0, 5).map((skill, skillIndex) => (
                <View
                  key={`skill_${item.id}_${skillIndex}_${skill}`}
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
              {item.skills.length > 5 && (
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
                      fontFamily: theme.typography.fonts.semiBold,
                      color: theme.colors.text.tertiary,
                    }}
                  >
                    +{item.skills.length - 5}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons based on status */}
          {item.status === "discovered" && (
            <TouchableOpacity
              onPress={() => handleSendProposal(item.user_id)}
              style={{
                backgroundColor: theme.colors.primary.teal,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                ...theme.shadows.sm,
              }}
              activeOpacity={0.8}
            >
              {console.log("🚀 Sending proposal to candidate:", item.status)}
              <Ionicons
                name="paper-plane"
                size={16}
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
                Send Job Proposal
              </Text>
            </TouchableOpacity>
          )}

          {item.status === "submitted" && (
            <View
              style={{
                backgroundColor: theme.colors.background.accent,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: theme.colors.primary.deepBlue,
              }}
            >
              <Ionicons
                name="hourglass-outline"
                size={16}
                color={theme.colors.primary.deepBlue}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.primary.deepBlue,
                }}
              >
                Proposal Sent {item.proposalSentTime ? `• ${item.proposalSentTime}` : ''}
              </Text>
            </View>
          )}

          {item.status === "accepted" && (
            <TouchableOpacity
              onPress={() => handleStartConversation(item)}
              style={{
                backgroundColor: theme.colors.status.success,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                ...theme.shadows.sm,
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={16}
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
                Start Conversation
              </Text>
            </TouchableOpacity>
          )}

          {/* Profile Completion Bar */}
          {item.profileCompletion > 0 && (
            <View style={{ marginTop: theme.spacing.md }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: theme.spacing.xs,
                }}
              >
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
                    color:
                      item.profileCompletion >= 80
                        ? theme.colors.status.success
                        : item.profileCompletion >= 50
                        ? theme.colors.primary.orange
                        : theme.colors.status.error,
                  }}
                >
                  {item.profileCompletion}%
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: theme.colors.neutral.lightGray,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={
                    item.profileCompletion >= 80
                      ? [theme.colors.status.success, "#0D9488"]
                      : item.profileCompletion >= 50
                      ? [theme.colors.primary.orange, theme.colors.secondary.darkOrange]
                      : [theme.colors.status.error, "#DC2626"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: `${item.profileCompletion}%`,
                    height: "100%",
                  }}
                />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Loading State
  const LoadingState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        Finding matching candidates...
      </Text>
    </View>
  );

  // Empty State Component
  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
          justifyContent: "center",
          alignItems: "center",
          marginBottom: theme.spacing.xl,
        }}
      >
        <Ionicons
          name={
            searchQuery
              ? "search"
              : activeFilter === "discovered"
              ? "star"
              : activeFilter === "submitted"
              ? "paper-plane"
              : activeFilter === "accepted"
              ? "checkmark-circle"
              : "people"
          }
          size={40}
          color={theme.colors.primary.teal}
        />
      </LinearGradient>

      <Text
        style={{
          fontSize: theme.typography.sizes.xl,
          fontFamily: theme.typography.fonts.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.sm,
          textAlign: "center",
        }}
      >
        {searchQuery
          ? "No candidates found"
          : activeFilter === "discovered"
          ? "No new discoveries"
          : activeFilter === "submitted"
          ? "No proposals sent"
          : activeFilter === "accepted"
          ? "No accepted proposals"
          : "No candidate matches yet"}
      </Text>

      <Text
        style={{
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.regular,
          color: theme.colors.text.secondary,
          textAlign: "center",
          lineHeight: theme.typography.sizes.base * 1.5,
          marginBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.md,
        }}
      >
        {searchQuery
          ? "Try adjusting your search terms or filters"
          : activeFilter === "discovered"
          ? "New candidate matches will appear here as they become available"
          : activeFilter === "submitted"
          ? "Candidates you send proposals to will appear here"
          : activeFilter === "accepted"
          ? "Candidates who accept your proposals will appear here"
          : "Create job postings to start discovering matching candidates"}
      </Text>

      {!searchQuery && activeFilter === "all" && (
        <TouchableOpacity
          onPress={() => router.push("/post-job")}
          style={{
            backgroundColor: theme.colors.primary.teal,
            borderRadius: theme.borderRadius.lg,
            paddingHorizontal: theme.spacing.xxl,
            paddingVertical: theme.spacing.md,
            flexDirection: "row",
            alignItems: "center",
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
      )}
    </View>
  );

  // Footer Loading Indicator
  const FooterLoadingIndicator = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={{ paddingVertical: theme.spacing.xl, alignItems: "center" }}>
        <ActivityIndicator size="small" color={theme.colors.primary.teal} />
        <Text
          style={{
            marginTop: theme.spacing.sm,
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.tertiary,
          }}
        >
          Loading more candidates...
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          theme.colors.background.accent,
          "rgba(27, 163, 163, 0.05)",
          theme.colors.background.primary,
        ]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        locations={[0, 0.3, 1]}
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <Header />

        {isLoading ? (
          <LoadingState />
        ) : candidates.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={candidates}
            renderItem={({ item, index }) => <CandidateItem item={item} index={index} />}
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={FooterLoadingIndicator}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
          />
        )}
      </Animated.View>
    </View>
  );
}