import CustomDropdown from "@/components/CustomDropdown";
import CustomInput from "@/components/CustomInput";
import SafeAreaWrapper from "@/components/SafeAreaWrapper";
import SkillsInput from "@/components/SkillsInput";
import VerificationModal from "@/components/VerificationModal";
import apiService from "@/services/apiService";
import theme from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function Signup() {
  // Form State - Force jobseeker only, no employer option
  const [userType, setUserType] = useState("jobseeker");
  const [formData, setFormData] = useState({
  // Common fields
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
  date_of_birth: "",
  gender: "",
  location_city: "",
  location_state: "",
  bio: "",

  // Job seeker specific fields
  current_job_title: "",
  current_company: "",
  experience_years: 0,
  experience_months: 0,
  current_salary: "",
  expected_salary: "",
  notice_period: "",
  job_type_preference: [],
  work_mode_preference: [],
  willing_to_relocate: 0,
  availability_status: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  profile_visibility: "",

  // Employer specific fields
  company_name: "",
  company_website: "",
  company_size: "",
  industry: "",
  company_type: "",
  founded_year: '',
  headquarters_address: "",
  headquarters_city: "",
  headquarters_state: "",
  company_description: "",
});

  const [skills, setSkills] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Email verification state (for new verification-first flow)
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  // Dropdown Options
  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "prefer_not_to_say" },
  ];

  const jobTypeOptions = [
    { label: "Full-Time", value: "full_time" },
    { label: "Part-Time", value: "part_time" },
    { label: "Contract", value: "contract" },
    { label: "Freelance", value: "freelance" },
    { label: "Internship", value: "internship" },
  ];

  const companyTypeOptions = [
    { label: "Startup", value: "startup" },
    { label: "Corporate", value: "corporate" },
    { label: "Government", value: "government" },
    { label: "Non-Profit", value: "non_profit" },
    { label: "Freelance", value: "freelance" },
  ];

  const profileVisibilityOptions = [
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
    { label: "Companies Only", value: "companies_only" },
  ];

  const workModeOptions = [
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
    { label: "On-site", value: "on_site" },
  ];

  const noticePeriodOptions = [
    { label: "Immediate", value: "immediate" },
    { label: "15 Days", value: "15_days" },
    { label: "1 Month", value: "1_month" },
    { label: "2 Months", value: "2_months" },
    { label: "3 Months", value: "3_months" },
    { label: "More than 3 Months", value: "more_than_3_months" },
  ];

  const companySizeOptions = [
    { label: "1-10 employees", value: "1-10" },
    { label: "11-50 employees", value: "11-50" },
    { label: "51-200 employees", value: "51-200" },
    { label: "201-500 employees", value: "201-500" },
    { label: "501-1000 employees", value: "501-1000" },
    { label: "1000+ employees", value: "1000+" },
  ];

  const industryOptions = [
    { label: "Information Technology", value: "Information Technology" },
    { label: "Healthcare", value: "Healthcare" },
    { label: "Finance & Banking", value: "Finance & Banking" },
    { label: "Education", value: "Education" },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Retail & E-commerce", value: "Retail & E-commerce" },
    { label: "Construction", value: "Construction" },
    { label: "Hospitality", value: "Hospitality" },
    { label: "Media & Entertainment", value: "Media & Entertainment" },
    { label: "Government", value: "Government" },
    { label: "Other", value: "Other" },
  ];

  const availabilityOptions = [
    { label: "Open to work", value: "open_to_work" },
    { label: "Not looking", value: "not_looking" },
    { label: "Passively looking", value: "passively_looking" },
  ];

  // Load skills on component mount
  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await apiService.getSkills();
      if (response.success) {
        setAvailableSkills(response.data.map(skill => ({
          label: skill.skill_name,
          value: skill.skill_name,
          category: skill.skill_category
        })));
      }
    } catch (error) {
      console.log('Error loading skills:', error);
    }
  };

  // Image picker functions
  const pickProfileImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access photos');
        return;
      }

      // Show action sheet for image source selection
      Alert.alert(
        'Select Image',
        'Choose image source',
        [
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Photo Library', onPress: () => openImageLibrary() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Input handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Clear signup error when user starts typing
    if (signupError) {
      setSignupError("");
    }
  };

  // Skills management - now handled by SkillsInput component
  const handleSkillsChange = (newSkills) => {
    setSkills(newSkills);
    // Clear skills error if exists
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: null }));
    }
    // Clear signup error when user modifies skills
    if (signupError) {
      setSignupError("");
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Confirm password is required";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    // Mandatory dropdown validations
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.notice_period) newErrors.notice_period = "Notice period is required";
    if (!formData.job_type_preference || formData.job_type_preference.length === 0) {
      newErrors.job_type_preference = "Job type preference is required";
    }
    if (!formData.work_mode_preference || formData.work_mode_preference.length === 0) {
      newErrors.work_mode_preference = "Work mode preference is required";
    }
    if (!formData.availability_status) newErrors.availability_status = "Availability status is required";
    if (!formData.profile_visibility) newErrors.profile_visibility = "Profile visibility is required";

    // URL validations
    const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

    if (formData.linkedin_url && !urlRegex.test(formData.linkedin_url)) {
      newErrors.linkedin_url = "Invalid LinkedIn URL";
    }
    if (formData.github_url && !urlRegex.test(formData.github_url)) {
      newErrors.github_url = "Invalid GitHub URL";
    }
    if (formData.portfolio_url && !urlRegex.test(formData.portfolio_url)) {
      newErrors.portfolio_url = "Invalid Portfolio URL";
    }
    if (formData.company_website && !urlRegex.test(formData.company_website)) {
      newErrors.company_website = "Invalid Company website URL";
    }

    // Founded year validation
    if (formData.founded_year && (formData.founded_year < 1800 || formData.founded_year > new Date().getFullYear())) {
      newErrors.founded_year = "Invalid founded year";
    }

    // Jobseeker-specific validations
    if (skills.length === 0) newErrors.skills = "At least one skill is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setSignupError('Please fix the validation errors above and try again');
      return;
    }

    setIsLoading(true);
    setSignupError("");

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();

      // Add user type first
      formDataToSend.append('user_type', userType);

      // Add only essential fields to reduce complexity
      const essentialFields = [
        'first_name', 'last_name', 'email', 'phone', 'password',
        'date_of_birth', 'gender', 'location_city', 'location_state'
      ];

      // Add essential fields first
      essentialFields.forEach(key => {
        if (formData[key] && formData[key] !== '') {
          formDataToSend.append(key, formData[key].toString());
        }
      });

      // Add jobseeker-specific fields
      if (formData.current_job_title) formDataToSend.append('current_job_title', formData.current_job_title);
      if (formData.experience_years !== undefined) formDataToSend.append('experience_years', formData.experience_years.toString());
      if (formData.experience_months !== undefined) formDataToSend.append('experience_months', formData.experience_months.toString());

      // Add skills for jobseekers
      if (skills.length > 0) {
        formDataToSend.append('skills', JSON.stringify(skills));
      }

      // Skip profile image for now to reduce complexity
      // if (profileImage) {
      //   const imageUri = profileImage.uri;
      //   const imageName = profileImage.fileName || `profile_${Date.now()}.jpg`;
      //   const imageType = profileImage.mimeType || 'image/jpeg';

      //   formDataToSend.append('profile_image', {
      //     uri: imageUri,
      //     name: imageName,
      //     type: imageType,
      //   });
      // }

      // Log what we're sending for debugging
      // console.log('📤 Sending signup data:');
      // console.log('User type:', userType);
      // console.log('Skills count:', skills.length);
      // console.log('Profile image:', profileImage ? 'Selected' : 'None');

      // Log FormData contents
      // console.log('📋 FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        if (key === 'profile_image') {
          console.log(`${key}:`, 'File object');
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await apiService.signup(formDataToSend);
      console.log("📦 Full signup response:", response);

      if (response.success) {
        // New flow: Check if verification is required (should always be true now)
        if (response.requires_verification || response.data?.verification_required) {
          // Store email for verification modal
          setSignupEmail(formData.email);

          // Show verification modal
          setShowVerificationModal(true);
          setIsLoading(false);

          console.log('✅ Signup data submitted, verification modal shown');
          return;
        }

        // Fallback (should not reach here with new flow, but keeping for safety)
        console.warn('⚠️ Unexpected response: verification not required');
        setSignupError('Unexpected response from server. Please try again.');

      } else {
        console.log("response",response)
        // Handle validation errors from server - display exact errors from API
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          setSignupError(response.errors.join('\n'));
        } else if (response.message) {
          setSignupError(response.message);
        } else {
          setSignupError('Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      setSignupError('Network error. Please check your internet connection and try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to jobseeker home
    router.push('/jobseeker/home');
  };

  // Verification handler (called when verification succeeds)
  const handleVerificationSuccess = (userData) => {
    console.log('✅ Verification successful, user data received:', userData);
    // The VerificationModal component handles navigation automatically
  };

  // Close verification modal handler
  const handleCloseVerification = () => {
    setShowVerificationModal(false);
    // Optionally navigate back or show a message
  };

  // User Type Selection Card
  const UserTypeCard = ({
    type,
    title,
    description,
    icon,
    isSelected,
    onPress,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: theme.colors.background.card,
        borderWidth: 2,
        borderColor: isSelected
          ? theme.colors.primary.teal
          : theme.colors.border.light,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: isSelected
            ? theme.colors.primary.teal
            : theme.colors.neutral.lightGray,
          justifyContent: "center",
          alignItems: "center",
          marginRight: theme.spacing.md,
        }}
      >
        <Ionicons
          name={icon}
          size={24}
          color={
            isSelected ? theme.colors.neutral.white : theme.colors.text.tertiary
          }
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: theme.typography.sizes.md,
            fontFamily: theme.typography.fonts.semiBold,
            color: isSelected
              ? theme.colors.primary.teal
              : theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.secondary,
          }}
        >
          {description}
        </Text>
      </View>
      {isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={theme.colors.primary.teal}
        />
      )}
    </TouchableOpacity>
  );



  // Success Modal
  const SuccessModal = () => (
    <Modal visible={showSuccessModal} transparent={true} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.borderRadius.xl,
            width: "100%",
            maxWidth: 400,
            padding: theme.spacing.xl,
            alignItems: "center",
          }}
        >
          {/* Success Icon with Logo */}
          <View
            style={{
              alignItems: "center",
              marginBottom: theme.spacing.lg,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.status.success,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <Ionicons
                name="checkmark"
                size={40}
                color={theme.colors.neutral.white}
              />
            </View>

            {/* Logo */}
            <Image
              source={require("@/assets/images/company/logo.png")}
              style={{
                width: 36,
                height: 36,
              }}
              resizeMode="contain"
            />
          </View>

          <Text
            style={{
              fontSize: theme.typography.sizes.xl,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
              textAlign: "center",
            }}
          >
            Welcome to Manvue!
          </Text>

          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
              textAlign: "center",
              marginBottom: theme.spacing.xl,
              lineHeight: theme.typography.sizes.base * 1.5,
            }}
          >
            Your account has been created successfully. You can now start
            exploring amazing career opportunities.
          </Text>

          <TouchableOpacity
            onPress={handleSuccessModalClose}
            style={{
              width: "100%",
              borderRadius: theme.borderRadius.lg,
              overflow: "hidden",
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[
                theme.colors.primary.teal,
                theme.colors.secondary.darkTeal,
              ]}
              style={{
                paddingVertical: theme.spacing.md,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.neutral.white,
                }}
              >
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaWrapper backgroundColor={theme.colors.background.primary}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.primary}
      />

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.light,
            backgroundColor: theme.colors.background.card,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: theme.spacing.sm,
              marginRight: theme.spacing.md,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require("@/assets/images/company/logo.png")}
            style={{
              width: 32,
              height: 32,
              marginRight: theme.spacing.md,
            }}
            resizeMode="contain"
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: theme.typography.sizes.lg,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.text.primary,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
              }}
            >
              Job Seeker Registration
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Jobseeker Registration Form */}
          {userType && (
            <View>
              {/* Personal Information */}
              <Text
                style={{
                  fontSize: theme.typography.sizes.md,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Personal Information
              </Text>

              <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    label="First Name"
                    value={formData.first_name}
                    onChangeText={(value) => handleInputChange("first_name", value)}
                    placeholder="Enter first name"
                    icon="person-outline"
                    error={errors.first_name}
                    required
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    label="Last Name"
                    value={formData.last_name}
                    onChangeText={(value) => handleInputChange("last_name", value)}
                    placeholder="Enter last name"
                    icon="person-outline"
                    error={errors.last_name}
                    required
                  />
                </View>
              </View>

              <CustomInput
                label="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="Enter your email address"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                required
              />

              <CustomInput
                label="Phone Number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                placeholder="Enter 10-digit phone number"
                icon="call-outline"
                keyboardType="phone-pad"
                maxLength={10}
                error={errors.phone}
                required
              />

              <CustomInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Enter password (min 6 characters)"
                icon="lock-closed-outline"
                secureTextEntry
                error={errors.password}
                required
              />

              <CustomInput
                label="Confirm Password"
                value={formData.confirm_password}
                onChangeText={(value) => handleInputChange("confirm_password", value)}
                placeholder="Re-enter password"
                icon="lock-closed-outline"
                secureTextEntry
                error={errors.confirm_password}
                required
              />

              <CustomDropdown
                label="Gender"
                value={formData.gender}
                onSelect={(value) => handleInputChange("gender", value)}
                options={genderOptions}
                placeholder="Choose option"
                icon="person-outline"
                error={errors.gender}
                required
              />

              <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    label="City"
                    value={formData.location_city}
                    onChangeText={(value) => handleInputChange("location_city", value)}
                    placeholder="Enter city"
                    icon="location-outline"
                    error={errors.location_city}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    label="State"
                    value={formData.location_state}
                    onChangeText={(value) => handleInputChange("location_state", value)}
                    placeholder="Enter state"
                    icon="location-outline"
                    error={errors.location_state}
                  />
                </View>
              </View>

              {/* Profile Image Section */}
              <View style={{ marginBottom: theme.spacing.lg }}>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.medium,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  Profile Picture (Optional)
                </Text>
                <TouchableOpacity
                  onPress={pickProfileImage}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.colors.background.card,
                    borderWidth: 1.5,
                    borderColor: theme.colors.border.light,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                  }}
                  activeOpacity={0.7}
                >
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage.uri }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        marginRight: theme.spacing.md,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: theme.colors.neutral.lightGray,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: theme.spacing.md,
                      }}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={24}
                        color={theme.colors.text.tertiary}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.base,
                        fontFamily: theme.typography.fonts.medium,
                        color: theme.colors.text.primary,
                      }}
                    >
                      {profileImage ? 'Change Photo' : 'Add Profile Photo'}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.sm,
                        fontFamily: theme.typography.fonts.regular,
                        color: theme.colors.text.tertiary,
                      }}
                    >
                      {profileImage ? (profileImage.fileName || 'Image selected') : 'Tap to select from camera or gallery'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>

              {/* Job Seeker-specific Fields */}
              {userType === "jobseeker" && (
                <>
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.md,
                      fontFamily: theme.typography.fonts.semiBold,
                      color: theme.colors.text.primary,
                      marginTop: theme.spacing.xl,
                      marginBottom: theme.spacing.lg,
                    }}
                  >
                    Professional Information
                  </Text>

                  <CustomInput
                    label="Current Job Title"
                    value={formData.current_job_title}
                    onChangeText={(value) => handleInputChange("current_job_title", value)}
                    placeholder="e.g., Software Engineer (Optional)"
                    icon="briefcase-outline"
                    error={errors.current_job_title}
                  />

                  <CustomInput
                    label="Current Company"
                    value={formData.current_company}
                    onChangeText={(value) => handleInputChange("current_company", value)}
                    placeholder="Company name (Optional)"
                    icon="business-outline"
                    error={errors.current_company}
                  />

                  <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                    <View style={{ flex: 1 }}>
                      <CustomInput
                        label="Experience (Years)"
                        value={formData.experience_years.toString()}
                        onChangeText={(value) => handleInputChange("experience_years", parseInt(value) || 0)}
                        placeholder="0"
                        icon="time-outline"
                        keyboardType="number-pad"
                        error={errors.experience_years}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <CustomInput
                        label="Experience (Months)"
                        value={formData.experience_months.toString()}
                        onChangeText={(value) => handleInputChange("experience_months", parseInt(value) || 0)}
                        placeholder="0"
                        icon="time-outline"
                        keyboardType="number-pad"
                        error={errors.experience_months}
                      />
                    </View>
                  </View>

                  <CustomInput
                    label="Current Salary (Annual)"
                    value={formData.current_salary}
                    onChangeText={(value) => handleInputChange("current_salary", value)}
                    placeholder="e.g., 500000 (in INR, Optional)"
                    icon="cash-outline"
                    keyboardType="numeric"
                    error={errors.current_salary}
                  />

                  <CustomInput
                    label="Expected Salary (Annual)"
                    value={formData.expected_salary}
                    onChangeText={(value) => handleInputChange("expected_salary", value)}
                    placeholder="e.g., 600000 (in INR)"
                    icon="cash-outline"
                    keyboardType="numeric"
                    error={errors.expected_salary}
                  />

                  <CustomDropdown
                    label="Notice Period"
                    value={formData.notice_period}
                    onSelect={(value) => handleInputChange("notice_period", value)}
                    options={noticePeriodOptions}
                    placeholder="Choose option"
                    icon="calendar-outline"
                    error={errors.notice_period}
                    required
                  />

                  <CustomDropdown
                    label="Job Type Preference (Multiple allowed)"
                    value={Array.isArray(formData.job_type_preference) ? formData.job_type_preference[0] : formData.job_type_preference}
                    onSelect={(value) => {
                      const currentValues = Array.isArray(formData.job_type_preference) ? formData.job_type_preference : [formData.job_type_preference].filter(Boolean);
                      const newValues = currentValues.includes(value) ? currentValues : [...currentValues, value];
                      handleInputChange("job_type_preference", newValues.slice(0, 3)); // Max 3 selections
                    }}
                    options={jobTypeOptions}
                    placeholder="Choose option"
                    icon="briefcase-outline"
                    error={errors.job_type_preference}
                    required
                  />

                  <CustomDropdown
                    label="Work Mode Preference (Multiple allowed)"
                    value={Array.isArray(formData.work_mode_preference) ? formData.work_mode_preference[0] : formData.work_mode_preference}
                    onSelect={(value) => {
                      const currentValues = Array.isArray(formData.work_mode_preference) ? formData.work_mode_preference : [formData.work_mode_preference].filter(Boolean);
                      const newValues = currentValues.includes(value) ? currentValues : [...currentValues, value];
                      handleInputChange("work_mode_preference", newValues.slice(0, 3)); // Max 3 selections
                    }}
                    options={workModeOptions}
                    placeholder="Choose option"
                    icon="home-outline"
                    error={errors.work_mode_preference}
                    required
                  />

                  <CustomDropdown
                    label="Availability Status"
                    value={formData.availability_status}
                    onSelect={(value) => handleInputChange("availability_status", value)}
                    options={availabilityOptions}
                    placeholder="Choose option"
                    icon="checkmark-circle-outline"
                    error={errors.availability_status}
                    required
                  />

                  <CustomDropdown
                    label="Profile Visibility"
                    value={formData.profile_visibility}
                    onSelect={(value) => handleInputChange("profile_visibility", value)}
                    options={profileVisibilityOptions}
                    placeholder="Choose option"
                    icon="eye-outline"
                    error={errors.profile_visibility}
                    required
                  />

                  {/* Professional URLs Section */}
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.md,
                      fontFamily: theme.typography.fonts.semiBold,
                      color: theme.colors.text.primary,
                      marginTop: theme.spacing.xl,
                      marginBottom: theme.spacing.lg,
                    }}
                  >
                    Professional Links (Optional)
                  </Text>

                  <CustomInput
                    label="LinkedIn URL"
                    value={formData.linkedin_url}
                    onChangeText={(value) => handleInputChange("linkedin_url", value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    icon="logo-linkedin"
                    keyboardType="url"
                    autoCapitalize="none"
                    error={errors.linkedin_url}
                  />

                  <CustomInput
                    label="GitHub URL"
                    value={formData.github_url}
                    onChangeText={(value) => handleInputChange("github_url", value)}
                    placeholder="https://github.com/yourusername"
                    icon="logo-github"
                    keyboardType="url"
                    autoCapitalize="none"
                    error={errors.github_url}
                  />

                  <CustomInput
                    label="Portfolio URL"
                    value={formData.portfolio_url}
                    onChangeText={(value) => handleInputChange("portfolio_url", value)}
                    placeholder="https://yourportfolio.com"
                    icon="globe-outline"
                    keyboardType="url"
                    autoCapitalize="none"
                    error={errors.portfolio_url}
                  />

                  {/* Skills Section for Job Seekers */}
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.md,
                      fontFamily: theme.typography.fonts.semiBold,
                      color: theme.colors.text.primary,
                      marginTop: theme.spacing.xl,
                      marginBottom: theme.spacing.lg,
                    }}
                  >
                    Skills & Expertise
                  </Text>

                  <SkillsInput
                    skills={skills}
                    onSkillsChange={handleSkillsChange}
                    label={`Skills (Add up to 10 skills) ${userType === 'jobseeker' ? '*' : ''}`}
                    required={userType === 'jobseeker'}
                    error={errors.skills}
                  />
                </>
              )}

              {/* Bio Section */}
              <Text
                style={{
                  fontSize: theme.typography.sizes.md,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.text.primary,
                  marginTop: theme.spacing.xl,
                  marginBottom: theme.spacing.lg,
                }}
              >
                About You
              </Text>

              <CustomInput
                label="Bio"
                value={formData.bio}
                onChangeText={(value) => handleInputChange("bio", value)}
                placeholder="Tell us about yourself... (Optional)"
                icon="person-outline"
                multiline
                numberOfLines={3}
                error={errors.bio}
              />

              {/* Signup Error Message */}
              {signupError ? (
                <View
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    marginTop: theme.spacing.lg,
                    borderLeftWidth: 3,
                    borderLeftColor: theme.colors.status.error,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.medium,
                      color: theme.colors.status.error,
                      textAlign: 'center',
                    }}
                  >
                    {signupError}
                  </Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={{
                  borderRadius: theme.borderRadius.lg,
                  marginTop: theme.spacing.xl,
                  marginBottom: theme.spacing.xl,
                  overflow: "hidden",
                  opacity: isLoading ? 0.7 : 1,
                }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[
                    theme.colors.primary.teal,
                    theme.colors.secondary.darkTeal,
                  ]}
                  style={{
                    paddingVertical: theme.spacing.lg,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.neutral.white}
                    />
                  ) : (
                    <>
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.md,
                          fontFamily: theme.typography.fonts.semiBold,
                          color: theme.colors.neutral.white,
                          marginRight: theme.spacing.sm,
                        }}
                      >
                        Create Account
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={theme.colors.neutral.white}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Email Verification Modal - New Separate Component */}
      <VerificationModal
        visible={showVerificationModal}
        email={signupEmail}
        userType={userType}
        onVerified={handleVerificationSuccess}
        onClose={handleCloseVerification}
      />

      {/* Success Modal */}
      <SuccessModal />
    </SafeAreaWrapper>
  );
}
