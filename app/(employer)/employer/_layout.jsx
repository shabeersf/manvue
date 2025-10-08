import SafeAreaWrapper from "@/components/SafeAreaWrapper";
import theme from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, usePathname } from "expo-router";
import React, { useState } from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function EmployerLayout() {
  const pathname = usePathname();
  const [companyProfile] = useState({
    name: "TechCorp Solutions",
    logo: null,
  });

  // Get current tab from pathname
  const getCurrentTab = () => {
    if (pathname.includes("/home")) return "home";
    if (pathname.includes("/candidates")) return "candidates";
    if (pathname.includes("/jobs")) return "jobs";
    if (pathname.includes("/chats")) return "messages";
    if (pathname.includes("/analytics")) return "analytics";
    if (pathname.includes("/company")) return "profile";
    return "home";
  };

  const currentTab = getCurrentTab();

  // Get page title based on current tab
  const getPageTitle = () => {
    switch (currentTab) {
      case "home":
        return "Manage your hiring pipeline";
      case "candidates":
        return "Discover top talent";
      case "jobs":
        return "Manage your job postings";
      case "messages":
        return "Connect with candidates";
      case "analytics":
        return "Track your hiring metrics";
      case "profile":
        return "Company settings and profile";
      default:
        return "Manage your hiring pipeline";
    }
  };

  // Get welcome message based on current tab
  const getWelcomeMessage = () => {
    switch (currentTab) {
      case "home":
        return companyProfile.name;
      case "candidates":
        return "Candidate Discovery";
      case "jobs":
        return "Job Management";
      case "messages":
        return "Messages";
      case "analytics":
        return "Analytics";
      case "profile":
        return "Company Profile";
      default:
        return companyProfile.name;
    }
  };

  // Header Component
  const Header = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.background.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Image
          source={require("@/assets/images/company/logo.png")}
          style={{
            width: 32,
            height: 32,
            marginRight: theme.spacing.sm,
          }}
          resizeMode="contain"
        />
        <View>
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.text.primary,
            }}
          >
            {getWelcomeMessage()}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
            }}
          >
            {getPageTitle()}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        {/* Post Job Button - only show on home and jobs */}
        {(currentTab === "home" || currentTab === "jobs") && (
          <TouchableOpacity
            onPress={() => router.push("/post-job")}
            style={{
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.primary.teal,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={theme.colors.neutral.white} />
          </TouchableOpacity>
        )}

        {/* Notifications */}
        <TouchableOpacity
          onPress={() => router.push("/employer/notifications")}
          style={{
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.colors.background.accent,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={theme.colors.primary.teal}
          />
          {/* Notification badge */}
          <View
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.status.error,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Bottom Tab Navigation
  const BottomTabs = () => {
    const tabs = [
      { id: "home", icon: "home", label: "Dashboard", route: "/employer/home" },
      {
        id: "candidates",
        icon: "people",
        label: "Candidates",
        route: "/employer/candidates",
      },
      { id: "jobs", icon: "briefcase", label: "Jobs", route: "/employer/jobs" },
      {
        id: "messages",
        icon: "chatbubbles",
        label: "Messages",
        route: "/employer/chats",
      },
      {
        id: "analytics",
        icon: "analytics",
        label: "Analytics",
        route: "/employer/analytics",
      },
      {
        id: "profile",
        icon: "business",
        label: "Company",
        route: "/employer/company",
      },
    ];

    return (
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.colors.background.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
          paddingBottom: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => router.push(tab.route)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: theme.spacing.xs,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={currentTab === tab.id ? tab.icon : `${tab.icon}-outline`}
              size={22}
              color={
                currentTab === tab.id
                  ? theme.colors.primary.teal
                  : theme.colors.text.tertiary
              }
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                fontFamily:
                  currentTab === tab.id
                    ? theme.typography.fonts.semiBold
                    : theme.typography.fonts.regular,
                color:
                  currentTab === tab.id
                    ? theme.colors.primary.teal
                    : theme.colors.text.tertiary,
                marginTop: theme.spacing.xs,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.card}
      />

      <View
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
        <SafeAreaWrapper>
          <Header />

          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="home" />
              <Stack.Screen name="candidates" />
              <Stack.Screen name="jobs" />
              <Stack.Screen name="messages" />
              <Stack.Screen name="analytics" />
              <Stack.Screen name="profile" />
            </Stack>
          </View>

          <BottomTabs />
        </SafeAreaWrapper>
      </View>
    </>
  );
}
