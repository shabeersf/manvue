import SafeAreaWrapper from "@/components/SafeAreaWrapper";
import theme from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, usePathname } from "expo-router";
import React, { useState } from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function JobSeekerLayout() {
  const pathname = usePathname();
  const [userProfile] = useState({
    name: "John Smith",
  });

  // Get current tab from pathname
  const getCurrentTab = () => {
    if (pathname.includes("/home")) return "home";
    if (pathname.includes("/matches")) return "matches";
    if (pathname.includes("/messages")) return "messages";
    if (pathname.includes("/interviews")) return "interviews";
    if (pathname.includes("/profile")) return "profile";
    return "home";
  };

  const currentTab = getCurrentTab();

  // Get page title based on current tab
  const getPageTitle = () => {
    switch (currentTab) {
      case "home":
        return "Find your next opportunity";
      case "matches":
        return "Companies interested in you";
      case "messages":
        return "Chat with employers";
      case "interviews":
        return "Manage your interviews";
      case "profile":
        return "Your professional profile";
      default:
        return "Find your next opportunity";
    }
  };

  // Get welcome message based on current tab
  const getWelcomeMessage = () => {
    switch (currentTab) {
      case "home":
        return `Welcome back, ${userProfile.name}`;
      case "matches":
        return "Your Matches";
      case "messages":
        return "Messages";
      case "interviews":
        return "Interviews";
      case "profile":
        return "Profile";
      default:
        return `Welcome back, ${userProfile.name}`;
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
        {/* Search Icon - only show on home */}
        {/* {currentTab === "home" && (
          <TouchableOpacity
            onPress={() => router.push("/search")}
            style={{
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.background.accent,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.colors.primary.teal}
            />
          </TouchableOpacity>
        )} */}

        {/* Notifications */}
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
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
      { id: "home", icon: "home", label: "Home", route: "/jobseeker/home" },
      {
        id: "matches",
        icon: "heart",
        label: "Matches",
        route: "/jobseeker/matches",
      },
      {
        id: "messages",
        icon: "chatbubbles",
        label: "Messages",
        route: "/jobseeker/messages",
      },
      {
        id: "interviews",
        icon: "videocam",
        label: "Interviews",
        route: "/jobseeker/interviews",
      },
      {
        id: "profile",
        icon: "person",
        label: "Profile",
        route: "/jobseeker/profile",
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
              size={24}
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
              <Stack.Screen name="matches" />
              <Stack.Screen name="messages" />
              <Stack.Screen name="interviews" />
              <Stack.Screen name="profile" />
            </Stack>
          </View>

          <BottomTabs />
        </SafeAreaWrapper>
      </View>
    </>
  );
}
