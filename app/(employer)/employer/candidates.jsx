import apiService from "@/services/apiService";
import theme from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
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
} from "react-native";

const { width } = Dimensions.get("window");

export default function EmployerCandidates() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'discovered', 'proposal_sent', 'accepted'
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

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Load candidates when filters change
  useEffect(() => {
    if (employerUserId && companyId) {
      loadCandidates(true); // true = reset pagination
    }
  }, [activeFilter, employerUserId, companyId]);

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
      console.error("Failed to load user data:", error);
      Alert.alert("Error", "Failed to load user data");
    }
  };

  const loadCandidates = async (resetPagination = false) => {
    if (!employerUserId || !companyId) return;

    try {
      if (resetPagination) {
        setIsLoading(true);
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

      // console.log("📤 Loading candidates with params:", params);

      const response = await apiService.getMatchingCandidates(params);

      console.log("📦 Candidates response:", response);

      if (response.success) {
        const newCandidates = response.data.candidates || [];
        const totalCount = response.data.total_count || 0;
        const newStats = response.data.stats || {};
        const paginationData = response.data.pagination || {};

        if (resetPagination) {
          setCandidates(newCandidates);
        } else {
          setCandidates((prev) => [...prev, ...newCandidates]);
        }

        setStats(newStats);
        setHasMore(paginationData.has_more || false);
        setPagination({
          limit: paginationData.limit || 20,
          offset: (paginationData.offset || 0) + (paginationData.limit || 20),
        });
      } else {
        console.error("Failed to load candidates:", response.message);
        Alert.alert("Error", response.message || "Failed to load candidates");
      }
    } catch (error) {
      console.error("Error loading candidates:", error);
      Alert.alert("Error", "Failed to load candidates. Please try again.");
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
    // loadCandidates will be called by useEffect
  };

  const handleSendProposal = (candidateId) => {
    
            // Navigate to proposal screen with candidate ID
            router.push(`/candidate-details/${candidateId}`);
         
  };

  const handleViewCandidate = (candidateId) => {
    router.push(`/candidate-details/${candidateId}`);
  };

  const handleStartConversation = (candidateId) => {
    router.push(`/chats/${candidateId}`);
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
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
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
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
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
            alignItems: "center",
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
              textAlign: "center",
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
          onSubmitEditing={handleSearch}
          placeholder="Search by name, skills, position..."
          placeholderTextColor={theme.colors.text.placeholder}
          style={{
            flex: 1,
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.primary,
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
              name="close"
              size={16}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        {[
          { id: "all", label: "All Matches", count: stats.total_matches },
          { id: "discovered", label: "New", count: stats.new_discoveries },
          {
            id: "proposal_sent",
            label: "Proposals",
            count: stats.proposals_sent,
          },
          { id: "accepted", label: "Accepted", count: stats.accepted },
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
            }}
            activeOpacity={0.8}
          >
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
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                  marginLeft: theme.spacing.xs,
                  minWidth: 18,
                  alignItems: "center",
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

  // Candidate Item Component
  const CandidateItem = ({ item }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case "discovered":
          return theme.colors.primary.orange;
        case "proposal_sent":
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
        case "proposal_sent":
          return "Proposal Sent";
        case "accepted":
          return "Accepted";
        case "rejected":
          return "Rejected";
        default:
          return "Unknown";
      }
    };

    return (
      <TouchableOpacity
        onPress={() => handleViewCandidate(item.user_id)}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: theme.spacing.sm,
          }}
        >
          {/* Candidate Avatar */}
          <View style={{ position: "relative", marginRight: theme.spacing.md }}>
            {item.profileImage ? (
              <Image
                source={{ uri: item.profileImage }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
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
                  backgroundColor:
                    item.status === "discovered"
                      ? theme.colors.primary.orange
                      : theme.colors.background.accent,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: getStatusColor(),
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontFamily: theme.typography.fonts.bold,
                    color:
                      item.status === "discovered"
                        ? theme.colors.neutral.white
                        : theme.colors.primary.teal,
                  }}
                >
                  {item.initials}
                </Text>
              </View>
            )}

            {/* Online status */}
            {item.isAvailable && (
              <View
                style={{
                  position: "absolute",
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
            {item.matchedJobTitle && (
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.primary.teal,
                  marginBottom: theme.spacing.xs,
                }}
                numberOfLines={1}
              >
                Matches: {item.matchedJobTitle}
              </Text>
            )}
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
          <View style={{ alignItems: "flex-end" }}>
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                minWidth: "45%",
              }}
            >
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
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              minWidth: "45%",
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
              Found {item.discoveredTime}
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
            }}
          >
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
        )}

        {/* Action based on status */}
        {item.status === "discovered" && (
          <TouchableOpacity
            onPress={() => handleSendProposal(item.user_id)}
            style={{
              backgroundColor: theme.colors.primary.teal,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.sm,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
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

        {item.status === "proposal_sent" && (
          <View
            style={{
              backgroundColor: theme.colors.background.accent,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.sm,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
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

        {item.status === "accepted" && (
          <TouchableOpacity
            onPress={() => handleStartConversation(item.id)}
            style={{
              backgroundColor: theme.colors.status.success,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.sm,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
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
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${item.profileCompletion}%`,
                  height: "100%",
                  backgroundColor: theme.colors.primary.teal,
                }}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
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
          marginTop: theme.spacing.md,
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
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.background.accent,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: theme.spacing.lg,
        }}
      >
        <Ionicons
          name={
            searchQuery
              ? "search-outline"
              : activeFilter === "discovered"
              ? "person-add-outline"
              : activeFilter === "proposal_sent"
              ? "paper-plane-outline"
              : activeFilter === "accepted"
              ? "checkmark-circle-outline"
              : "people-outline"
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
          textAlign: "center",
        }}
      >
        {searchQuery
          ? "No candidates found"
          : activeFilter === "discovered"
          ? "No new discoveries"
          : activeFilter === "proposal_sent"
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
          lineHeight: theme.typography.sizes.base * 1.4,
          marginBottom: theme.spacing.lg,
        }}
      >
        {searchQuery
          ? "Try adjusting your search terms or filters"
          : activeFilter === "discovered"
          ? "New candidate matches will appear here as they become available"
          : activeFilter === "proposal_sent"
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
      <View style={{ paddingVertical: theme.spacing.lg, alignItems: "center" }}>
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
          "rgba(27, 163, 163, 0.02)",
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
      <Header />

      {isLoading ? (
        <LoadingState />
      ) : candidates.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={candidates}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={FooterLoadingIndicator}
        />
      )}
    </View>
  );
}
