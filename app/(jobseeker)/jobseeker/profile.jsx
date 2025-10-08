import EditModal from '@/components/EditModal';
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
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Profile() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // User profile data from API
  const [userProfile, setUserProfile] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});

  // Fields that require admin approval for changes
  const criticalFields = [
    'full_name',
    'first_name',
    'last_name',
    'email',
    'mobile_number',
    'education',
    'institution',
    'current_position',
    'years_of_experience',
    'area_of_interest'
  ];

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await SecureStore.getItemAsync('user_id');
      console.log('🔍 Retrieved userId from SecureStore:', userId, typeof userId);

      if (!userId) {
        setError('User not found. Please log in again.');
        return;
      }

      console.log('🔄 Calling getFullProfile with userId:', userId);
      const response = await apiService.getFullProfile(userId);

      if (response.success) {
        setUserProfile(response.data);
        setPendingChanges(response.data.pending_changes || {});
        console.log('✅ Profile data loaded:', response.data);
      } else {
        setError(response.message || 'Failed to load profile data');
        console.log('❌ Failed to load profile:', response.errors);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.log('❌ Profile loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue || '');
    setShowEditModal(true);
  };

  const handleSaveField = async () => {
    if (!tempValue.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid value.');
      return;
    }

    setUpdating(true);

    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const response = await apiService.updateProfileField(userId, editingField, tempValue.trim());

      if (response.success) {
        if (response.requiresApproval) {
          // Add to pending changes
          setPendingChanges(prev => ({
            ...prev,
            [editingField]: {
              value: tempValue.trim(),
              submitted_at: new Date().toISOString().slice(0, 10),
              status: 'pending'
            }
          }));

          Alert.alert(
            'Change Submitted',
            'Your change has been submitted for admin approval. You will be notified once it\'s reviewed.',
            [{ text: 'OK' }]
          );
        } else {
          // Update profile immediately for non-critical fields
          if (editingField === 'skills') {
            // For skills, convert comma-separated string back to array
            const skillsArray = tempValue.trim().split(',').map(s => s.trim()).filter(s => s);
            setUserProfile(prev => ({
              ...prev,
              skills: skillsArray
            }));
          } else {
            setUserProfile(prev => ({
              ...prev,
              [editingField]: tempValue.trim()
            }));
          }

          Alert.alert(
            'Profile Updated',
            'Your profile has been updated successfully.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Update Failed',
          response.message || 'Failed to update profile. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Network error. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUpdating(false);
      setShowEditModal(false);
      setEditingField(null);
      setTempValue('');
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);

    try {
      // Clear all stored user data
      await Promise.all([
        SecureStore.deleteItemAsync('user_id'),
        SecureStore.deleteItemAsync('user_type'),
        SecureStore.deleteItemAsync('jwt_token'),
        SecureStore.deleteItemAsync('user_email'),
        SecureStore.deleteItemAsync('user_first_name'),
        SecureStore.deleteItemAsync('user_last_name'),
        SecureStore.deleteItemAsync('user_status')
      ]);

      // Call logout API
      await apiService.logout();

      Alert.alert(
        'Logged Out',
        'You have been logged out successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/choose-path')
          }
        ]
      );
    } catch (error) {
      console.log('Logout error:', error);
      // Still redirect even if logout API fails
      router.replace('/choose-path');
    }
  };

  const getDisplayValue = (field) => {
    if (!userProfile) return '';

    const pendingChange = pendingChanges[field];
    const currentValue = userProfile[field] || '';

    if (pendingChange && pendingChange.status === 'pending') {
      return `${currentValue} (pending approval)`;
    }
    return currentValue;
  };

  const isPending = (field) => {
    const pendingChange = pendingChanges[field];
    return pendingChange && pendingChange.status === 'pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          Loading your profile...
        </Text>
      </View>
    );
  }

  // Error Screen
  if (error && !userProfile) {
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
          Unable to Load Profile
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
          onPress={loadProfileData}
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

  // Header Component
  const Header = () => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
      }}
    >
      {/* Profile Avatar and Basic Info */}
      <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.primary.teal,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
            borderWidth: 3,
            borderColor: theme.colors.background.accent,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xxxl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.neutral.white,
            }}
          >
            {getInitials(userProfile?.full_name)}
          </Text>
        </View>

        <Text
          style={{
            fontSize: theme.typography.sizes.lg,
            fontFamily: theme.typography.fonts.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
          }}
        >
          {userProfile?.full_name || 'User Name'}
        </Text>

        <Text
          style={{
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.primary.teal,
            marginBottom: theme.spacing.xs,
          }}
        >
          {userProfile?.current_position || 'Job Title'}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name={userProfile?.is_verified ? "checkmark-circle" : "alert-circle"}
            size={16}
            color={userProfile?.is_verified ? theme.colors.status.success : theme.colors.status.warning}
            style={{ marginRight: theme.spacing.xs }}
          />
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: userProfile?.is_verified ? theme.colors.status.success : theme.colors.status.warning,
            }}
          >
            {userProfile?.is_verified ? 'Verified Profile' : 'Verification Pending'}
          </Text>
        </View>
      </View>

      {/* Profile Stats */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.sm,
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
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.teal,
            }}
          >
            {userProfile?.profile_completion || 0}%
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
            }}
          >
            Complete
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
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.orange,
            }}
          >
            {userProfile?.skills?.length || 0}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
            }}
          >
            Skills
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
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.status.success,
            }}
          >
            {userProfile?.years_of_experience || 0}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
            }}
          >
            Years Exp
          </Text>
        </View>
      </View>
    </View>
  );

  // Section Component
  const Section = ({ title, children, icon }) => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        margin: theme.spacing.lg,
        marginTop: 0,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.primary.teal}
            style={{ marginRight: theme.spacing.sm }}
          />
        )}
        <Text
          style={{
            fontSize: theme.typography.sizes.md,
            fontFamily: theme.typography.fonts.bold,
            color: theme.colors.text.primary,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  // Field Item Component
  const FieldItem = ({ label, value, field, editable = true, multiline = false }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
        minHeight: 50,
      }}
    >
      <View style={{ flex: 1, marginRight: theme.spacing.md }}>
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xs,
          }}
        >
          {label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.regular,
              color: isPending(field) ? theme.colors.primary.orange : theme.colors.text.primary,
              flex: 1,
              lineHeight: theme.typography.sizes.base * 1.3,
            }}
          >
            {getDisplayValue(field) || 'Not specified'}
          </Text>
          {isPending(field) && (
            <View
              style={{
                backgroundColor: theme.colors.primary.orange,
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
                PENDING
              </Text>
            </View>
          )}
        </View>
      </View>

      {editable && (
        <TouchableOpacity
          onPress={() => handleEditField(field, userProfile?.[field])}
          style={{
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: theme.colors.background.accent,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={theme.colors.primary.teal}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  // Skills Component
  const SkillsSection = () => (
    <View style={{ marginTop: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {userProfile?.skills?.map((skill, index) => (
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
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.primary.teal,
              }}
            >
              {typeof skill === 'string' ? skill : skill.skill_name || skill}
            </Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => {
          const skillsString = userProfile?.skills?.map(skill =>
            typeof skill === 'string' ? skill : skill.skill_name || skill
          ).join(', ') || '';
          handleEditField('skills', skillsString);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: theme.spacing.md,
          padding: theme.spacing.sm,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.background.accent,
        }}
        activeOpacity={0.8}
      >
        <Ionicons
          name="add-circle-outline"
          size={18}
          color={theme.colors.primary.teal}
          style={{ marginRight: theme.spacing.sm }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.primary.teal,
          }}
        >
          Edit Skills
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Pending Changes Section
  const PendingChangesSection = () => {
    const pendingItems = Object.entries(pendingChanges).filter(([_, change]) =>
      change && change.status === 'pending'
    );

    if (pendingItems.length === 0) return null;

    return (
      <Section title="Pending Changes" icon="time-outline">
        <View
          style={{
            backgroundColor: theme.colors.background.accent,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary.orange,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={theme.colors.primary.orange}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.primary.orange,
              }}
            >
              Changes Under Review
            </Text>
          </View>

          {pendingItems.map(([field, change]) => (
            <View key={field} style={{ marginBottom: theme.spacing.sm }}>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                }}
              >
                New Value: {change.value}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.tertiary,
                }}
              >
                Submitted: {formatDate(change.submitted_at)}
              </Text>
            </View>
          ))}

          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
              fontStyle: 'italic',
              marginTop: theme.spacing.xs,
            }}
          >
            Important profile changes require admin approval for security purposes.
          </Text>
        </View>
      </Section>
    );
  };


  // Logout Modal
  const LogoutModal = () => (
    <Modal
      visible={showLogoutModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.borderRadius.xl,
            width: '100%',
            maxWidth: 350,
            padding: theme.spacing.xl,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.status.error,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={28}
                color={theme.colors.neutral.white}
              />
            </View>

            <Text
              style={{
                fontSize: theme.typography.sizes.lg,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
                textAlign: 'center',
              }}
            >
              Logout
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}
            >
              Are you sure you want to logout?
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowLogoutModal(false)}
              style={{
                flex: 1,
                backgroundColor: theme.colors.neutral.lightGray,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.text.secondary,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flex: 1,
                backgroundColor: theme.colors.status.error,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: 'center',
              }}
              activeOpacity={0.9}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.neutral.white,
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.card}
      />

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
        locations={[0, 0.2, 1]}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
        <Header />

        <PendingChangesSection />

        {/* Personal Information */}
        <Section title="Personal Information" icon="person-outline">
          <FieldItem
            label="Full Name"
            value={userProfile?.full_name}
            field="full_name"
          />
          <FieldItem
            label="Email Address"
            value={userProfile?.email}
            field="email"
          />
          <FieldItem
            label="Mobile Number"
            value={userProfile?.mobile_number}
            field="mobile_number"
          />
          <FieldItem
            label="Address"
            value={userProfile?.full_address}
            field="full_address"
            multiline
          />
        </Section>

        {/* Professional Information */}
        <Section title="Professional Information" icon="briefcase-outline">
          <FieldItem
            label="Current Position"
            value={userProfile?.current_position}
            field="current_position"
          />
          <FieldItem
            label="Function"
            value={userProfile?.function}
            field="function"
          />
          <FieldItem
            label="Years of Experience"
            value={userProfile?.years_of_experience}
            field="years_of_experience"
          />
          <FieldItem
            label="Education"
            value={userProfile?.education}
            field="education"
          />
          <FieldItem
            label="Institution"
            value={userProfile?.institution}
            field="institution"
          />
          <FieldItem
            label="Preferred Location"
            value={userProfile?.location}
            field="location"
          />
          <FieldItem
            label="Industry Nature"
            value={userProfile?.industry_nature}
            field="industry_nature"
          />
          <FieldItem
            label="Work Type"
            value={userProfile?.work_type}
            field="work_type"
          />
          <FieldItem
            label="Area of Interest"
            value={userProfile?.area_of_interest}
            field="area_of_interest"
          />
        </Section>

        {/* Skills */}
        <Section title="Skills & Expertise" icon="code-slash-outline">
          <SkillsSection />
        </Section>

        {/* Account Information */}
        <Section title="Account Information" icon="settings-outline">
          <FieldItem
            label="Account Status"
            value={userProfile?.account_status}
            field="account_status"
            editable={false}
          />
          <FieldItem
            label="Subscription"
            value={`${userProfile?.subscription_status || 'Active'} (expires ${formatDate(userProfile?.subscription_expiry)})`}
            field="subscription"
            editable={false}
          />
          <FieldItem
            label="Member Since"
            value={formatDate(userProfile?.join_date)}
            field="join_date"
            editable={false}
          />
          <FieldItem
            label="Last Active"
            value={formatDate(userProfile?.last_active)}
            field="last_active"
            editable={false}
          />
        </Section>

        {/* Account Actions */}
        <Section title="Account Actions" icon="cog-outline">
          <TouchableOpacity
            onPress={() => setShowLogoutModal(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.light,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.status.error}
              style={{ marginRight: theme.spacing.md }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.status.error,
                }}
              >
                Logout
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.tertiary,
                }}
              >
                Sign out of your account
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Help & Support',
                'Contact our support team for assistance.',
                [{ text: 'OK' }]
              );
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.light,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={theme.colors.primary.teal}
              style={{ marginRight: theme.spacing.md }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.text.primary,
                }}
              >
                Help & Support
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.tertiary,
                }}
              >
                Get help with your account
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Privacy Policy',
                'View our privacy policy and terms of service.',
                [{ text: 'OK' }]
              );
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={theme.colors.primary.teal}
              style={{ marginRight: theme.spacing.md }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.text.primary,
                }}
              >
                Privacy & Terms
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.tertiary,
                }}
              >
                Review privacy policy and terms
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        </Section>
      </ScrollView>

      <EditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveField}
        field={editingField}
        value={tempValue}
        onChangeText={setTempValue}
        isLoading={updating}
        isCriticalField={criticalFields.includes(editingField)}
      />
      <LogoutModal />
    </View>
  );
}