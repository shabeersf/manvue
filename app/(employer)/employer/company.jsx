import CompanyEditModal from '@/components/CompanyEditModal';
import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function CompanyProfile() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // User credentials
  const [userId, setUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  // Company profile data
  const [companyProfile, setCompanyProfile] = useState({
    // Basic Info
    companyName: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    website: '',
    headquarters: '',

    // Contact Info
    email: '',
    phone: '',
    address: '',

    // Company Details
    description: '',

    // Subscription & Account
    accountStatus: '',
    joinDate: '',
    totalJobsPosted: 0,
    totalHires: 0,

    // Statistics
    statistics: {
      total_jobs_posted: 0,
      total_hires: 0,
      active_jobs: 0,
    },
  });

  // Load user data from SecureStore
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserId = await SecureStore.getItemAsync('user_id');
      const storedCompanyId = await SecureStore.getItemAsync('company_id');

      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      }

      if (storedCompanyId) {
        setCompanyId(parseInt(storedCompanyId));
      }

      if (storedUserId) {
        await fetchCompanyProfile(storedUserId, storedCompanyId);
      } else {
        Alert.alert('Error', 'User not logged in');
        router.replace('/choose-path');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  // Fetch company profile from API
  const fetchCompanyProfile = async (uid, cid) => {
    try {
      setLoading(true);

      const response = await apiService.getCompanyProfile(uid, cid);

      if (response.success && response.data) {
        const data = response.data;

        // Set company ID if not already set
        if (!companyId && data.company_id) {
          setCompanyId(data.company_id);
          await SecureStore.setItemAsync('company_id', data.company_id.toString());
        }

        setCompanyProfile({
          // Basic Info
          companyName: data.company_name || '',
          industry: data.industry || '',
          companySize: data.company_size || '',
          foundedYear: data.founded_year ? data.founded_year.toString() : '',
          website: data.company_website || '',
          headquarters: data.headquarters || '',

          // Contact Info
          email: data.email || '',
          phone: data.phone || '',
          address: data.headquarters_address || '',

          // Company Details
          description: data.company_description || '',

          // Subscription & Account
          accountStatus: data.status || '',
          joinDate: data.created_at || '',

          // Statistics
          statistics: data.statistics || {
            total_jobs_posted: 0,
            total_hires: 0,
            active_jobs: 0,
          },

          // Store company_id
          company_id: data.company_id,
          user_id: data.user_id,
        });

        setLoading(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to load company profile');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      Alert.alert('Error', 'Failed to load company profile');
      setLoading(false);
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompanyProfile(userId, companyId);
    setRefreshing(false);
  };

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditingValue(currentValue || '');
    setShowEditModal(true);
  };

  const handleSaveField = async (value) => {
    if (!value.trim()) {
      Alert.alert('Error', 'Value cannot be empty');
      return;
    }

    setUpdating(true);

    try {
      const response = await apiService.updateCompanyField(
        companyId,
        userId,
        editingField,
        value.trim()
      );

      if (response.success) {
        // Update local state
        setCompanyProfile(prev => ({
          ...prev,
          [editingField]: value.trim()
        }));

        Alert.alert('Success', response.message || 'Company profile updated successfully');

        setShowEditModal(false);
        setEditingField(null);
        setEditingValue('');

        // Refresh data to get latest from server
        await fetchCompanyProfile(userId, companyId);
      } else {
        Alert.alert(
          'Error',
          response.errors?.join(', ') || response.message || 'Failed to update company profile'
        );
      }
    } catch (error) {
      console.error('Error updating company field:', error);
      Alert.alert('Error', 'Failed to update company profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingField(null);
    setEditingValue('');
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);

    try {
      const response = await apiService.logout();

      if (response.success) {
        router.replace('/choose-path');
      } else {
        Alert.alert('Error', 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local data and redirect
      router.replace('/choose-path');
    }
  };

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
      {/* Company Logo and Basic Info */}
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
              fontSize: theme.typography.sizes.xxl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.neutral.white,
            }}
          >
            {companyProfile.companyName.charAt(0) || 'C'}
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
          {companyProfile.companyName || 'Company Name'}
        </Text>

        <Text
          style={{
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.primary.teal,
            marginBottom: theme.spacing.xs,
          }}
        >
          {companyProfile.industry || 'Industry'}
        </Text>

        {companyProfile.accountStatus === 'active' && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.status.success}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.status.success,
              }}
            >
              Verified Company
            </Text>
          </View>
        )}
      </View>

      {/* Company Stats */}
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
            {companyProfile.statistics?.total_jobs_posted || 0}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
            }}
          >
            Jobs Posted
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
            {companyProfile.statistics?.total_hires || 0}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
            }}
          >
            Successful Hires
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
            {companyProfile.statistics?.active_jobs || 0}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.secondary,
            }}
          >
            Active Jobs
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
  const FieldItem = ({ label, value, field, editable = true }) => (
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
        <Text
          style={{
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.primary,
            lineHeight: theme.typography.sizes.base * 1.3,
          }}
        >
          {value || 'Not provided'}
        </Text>
      </View>

      {editable && (
        <TouchableOpacity
          onPress={() => handleEditField(field, value)}
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

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary }}>
        <ActivityIndicator size="large" color={theme.colors.primary.teal} />
        <Text style={{ marginTop: theme.spacing.md, fontSize: theme.typography.sizes.base, color: theme.colors.text.secondary }}>
          Loading company profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.card}
      />

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary.teal]}
            tintColor={theme.colors.primary.teal}
          />
        }
      >
        <Header />

        {/* Company Information */}
        <Section title="Company Information" icon="business-outline">
          <FieldItem
            label="Company Name"
            value={companyProfile.companyName}
            field="companyName"
          />
          <FieldItem
            label="Industry"
            value={companyProfile.industry}
            field="industry"
          />
          <FieldItem
            label="Company Size"
            value={companyProfile.companySize}
            field="companySize"
          />
          <FieldItem
            label="Founded Year"
            value={companyProfile.foundedYear}
            field="foundedYear"
          />
          <FieldItem
            label="Website"
            value={companyProfile.website}
            field="website"
          />
          <FieldItem
            label="Headquarters"
            value={companyProfile.headquarters}
            field="headquarters"
          />
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information" icon="call-outline">
          <FieldItem
            label="Email Address"
            value={companyProfile.email}
            field="email"
          />
          <FieldItem
            label="Phone Number"
            value={companyProfile.phone}
            field="phone"
          />
          <FieldItem
            label="Address"
            value={companyProfile.address}
            field="address"
          />
        </Section>

        {/* Company Details */}
        <Section title="About Company" icon="document-text-outline">
          <FieldItem
            label="Company Description"
            value={companyProfile.description}
            field="description"
          />
        </Section>

        {/* Account Information */}
        <Section title="Account Information" icon="settings-outline">
          <FieldItem
            label="Account Status"
            value={companyProfile.accountStatus}
            field="accountStatus"
            editable={false}
          />
          <FieldItem
            label="Member Since"
            value={companyProfile.joinDate}
            field="joinDate"
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
        </Section>
      </ScrollView>

      <CompanyEditModal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        onSave={handleSaveField}
        fieldName={editingField}
        initialValue={editingValue}
        updating={updating}
      />
      <LogoutModal />
    </View>
  );
}
