import CustomDropdown from '@/components/CustomDropdown';
import CustomInput from '@/components/CustomInput';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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
} from 'react-native';

const { width } = Dimensions.get('window');

export default function EmployerSignup() {
  // Form State
  const [formData, setFormData] = useState({
    // Contact Person Info
    firstName: '',
    lastName: '',
    mobileNumber: '',
    gender: '',

    // Company Info
    companyName: '',
    fullAddress: '',
    city: '',
    state: '',
    gstNumber: '',
    industry: '',
    companyWebsite: '',
    companySize: '',
    companyType: '',
    foundedYear: '',
    companyDescription: '',

    // Login Credentials
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Dropdown Options
  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "prefer_not_to_say" },
  ];

  const companySizeOptions = [
    { label: "1-10 employees", value: "1-10" },
    { label: "11-50 employees", value: "11-50" },
    { label: "51-200 employees", value: "51-200" },
    { label: "201-500 employees", value: "201-500" },
    { label: "501-1000 employees", value: "501-1000" },
    { label: "1000+ employees", value: "1000+" },
  ];

  const companyTypeOptions = [
    { label: "Startup", value: "startup" },
    { label: "Corporate", value: "corporate" },
    { label: "Government", value: "government" },
    { label: "Non-Profit", value: "non_profit" },
    { label: "Freelance", value: "freelance" },
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

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear signup error when user starts typing
    if (signupError) {
      setSignupError("");
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Contact person validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    // Company validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.gstNumber.trim()) {
      newErrors.gstNumber = 'GST number is required';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Please enter a valid GST number';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    // URL validation
    const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    if (formData.companyWebsite && !urlRegex.test(formData.companyWebsite)) {
      newErrors.companyWebsite = 'Invalid website URL';
    }

    // Founded year validation
    if (formData.foundedYear && (formData.foundedYear < 1800 || formData.foundedYear > new Date().getFullYear())) {
      newErrors.foundedYear = 'Invalid founded year';
    }

    // Login credentials
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsRegistering(true);
    setSignupError("");

    try {
      const response = await apiService.employerSignup({
        // Contact Person
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
        gender: formData.gender || null,

        // Company Info
        companyName: formData.companyName,
        fullAddress: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        gstNumber: formData.gstNumber,
        industry: formData.industry,
        companyWebsite: formData.companyWebsite,
        companySize: formData.companySize,
        companyType: formData.companyType || 'startup',
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        companyDescription: formData.companyDescription,

        // Login Credentials
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        setShowSuccessModal(true);
      } else {
        // Handle validation errors from backend - display exact errors from API
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          // Display all errors from the API
          setSignupError(response.errors.join('\n'));
        } else if (response.message) {
          setSignupError(response.message);
        } else {
          setSignupError('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSignupError('Network error. Please check your internet connection and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle success completion
  const handleSuccess = () => {
    setShowSuccessModal(false);
    router.replace('/employer-login');
  };

  return (
    <SafeAreaWrapper backgroundColor={theme.colors.background.primary}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.primary}
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={[
          'rgba(30, 74, 114, 0.08)',
          'rgba(30, 74, 114, 0.02)',
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
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
              Company Registration
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
              }}
            >
              Register your company to hire talent
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
          {/* Contact Person Information */}
          <Text
            style={{
              fontSize: theme.typography.sizes.md,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.lg,
            }}
          >
            Contact Person Information
          </Text>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="Enter first name"
                icon="person-outline"
                error={errors.firstName}
                required
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Enter last name"
                icon="person-outline"
                error={errors.lastName}
                required
              />
            </View>
          </View>

          <CustomInput
            label="Mobile Number"
            value={formData.mobileNumber}
            onChangeText={(value) => updateFormData('mobileNumber', value)}
            placeholder="Enter 10-digit mobile number"
            icon="call-outline"
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.mobileNumber}
            required
          />

          <CustomDropdown
            label="Gender"
            value={formData.gender}
            onSelect={(value) => updateFormData('gender', value)}
            options={genderOptions}
            placeholder="Select gender (optional)"
            icon="person-outline"
            error={errors.gender}
          />

          {/* Company Information Section */}
          <Text
            style={{
              fontSize: theme.typography.sizes.md,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.lg,
            }}
          >
            Company Information
          </Text>

          <CustomInput
            label="Company Name"
            value={formData.companyName}
            onChangeText={(value) => updateFormData('companyName', value)}
            placeholder="Enter your company name"
            icon="business-outline"
            error={errors.companyName}
            required
          />

          <CustomInput
            label="GST Number"
            value={formData.gstNumber}
            onChangeText={(value) => updateFormData('gstNumber', value.toUpperCase())}
            placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
            icon="document-text-outline"
            maxLength={15}
            error={errors.gstNumber}
            required
          />

          <CustomDropdown
            label="Industry"
            value={formData.industry}
            onSelect={(value) => updateFormData('industry', value)}
            options={industryOptions}
            placeholder="Select industry"
            icon="business-outline"
            error={errors.industry}
            required
          />

          <CustomInput
            label="Company Website"
            value={formData.companyWebsite}
            onChangeText={(value) => updateFormData('companyWebsite', value)}
            placeholder="https://www.example.com (Optional)"
            icon="globe-outline"
            keyboardType="url"
            autoCapitalize="none"
            error={errors.companyWebsite}
          />

          <CustomDropdown
            label="Company Size"
            value={formData.companySize}
            onSelect={(value) => updateFormData('companySize', value)}
            options={companySizeOptions}
            placeholder="Select company size (optional)"
            icon="people-outline"
            error={errors.companySize}
          />

          <CustomDropdown
            label="Company Type"
            value={formData.companyType}
            onSelect={(value) => updateFormData('companyType', value)}
            options={companyTypeOptions}
            placeholder="Select company type (optional)"
            icon="business-outline"
            error={errors.companyType}
          />

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Founded Year"
                value={formData.foundedYear?.toString() || ''}
                onChangeText={(value) => updateFormData('foundedYear', value)}
                placeholder="e.g., 2020"
                icon="calendar-outline"
                keyboardType="number-pad"
                maxLength={4}
                error={errors.foundedYear}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="City"
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                placeholder="Enter city"
                icon="location-outline"
                error={errors.city}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="State"
                value={formData.state}
                onChangeText={(value) => updateFormData('state', value)}
                placeholder="Enter state"
                icon="location-outline"
                error={errors.state}
              />
            </View>
          </View>

          <CustomInput
            label="Full Address"
            value={formData.fullAddress}
            onChangeText={(value) => updateFormData('fullAddress', value)}
            placeholder="Complete company address (Optional)"
            icon="home-outline"
            multiline
            numberOfLines={2}
            error={errors.fullAddress}
          />

          <CustomInput
            label="Company Description"
            value={formData.companyDescription}
            onChangeText={(value) => updateFormData('companyDescription', value)}
            placeholder="Brief description about your company (Optional)"
            icon="document-text-outline"
            multiline
            numberOfLines={3}
            error={errors.companyDescription}
          />

          {/* Login Credentials Section */}
          <Text
            style={{
              fontSize: theme.typography.sizes.md,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.lg,
            }}
          >
            Login Credentials
          </Text>

          <CustomInput
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value.toLowerCase())}
            placeholder="Enter your email address"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            required
          />

          <CustomInput
            label="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            placeholder="Create a password (min 6 characters)"
            icon="lock-closed-outline"
            secureTextEntry
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            error={errors.password}
            required
          />

          <CustomInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            placeholder="Re-enter your password"
            icon="lock-closed-outline"
            secureTextEntry
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            required
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

          {/* Terms and Conditions */}
          <View style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.lg }}>
            <TouchableOpacity
              onPress={() => {
                setAcceptedTerms(!acceptedTerms);
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }));
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                paddingVertical: theme.spacing.sm,
              }}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: acceptedTerms ? theme.colors.primary.deepBlue : theme.colors.border.medium,
                  backgroundColor: acceptedTerms ? theme.colors.primary.deepBlue : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.spacing.sm,
                  marginTop: 2,
                }}
              >
                {acceptedTerms && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={theme.colors.neutral.white}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.secondary,
                    lineHeight: theme.typography.sizes.sm * 1.4,
                  }}
                >
                  I accept the{' '}
                  <Text
                    style={{
                      color: theme.colors.primary.deepBlue,
                      fontFamily: theme.typography.fonts.semiBold,
                      textDecorationLine: 'underline',
                    }}
                  >
                    Terms and Conditions
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={{
                      color: theme.colors.primary.deepBlue,
                      fontFamily: theme.typography.fonts.semiBold,
                      textDecorationLine: 'underline',
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>

            {errors.terms && (
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.lg,
                }}
              >
                {errors.terms}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isRegistering}
            style={{
              borderRadius: theme.borderRadius.lg,
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
              overflow: 'hidden',
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.colors.primary.deepBlue, theme.colors.secondary.darkBlue]}
              style={{
                paddingVertical: theme.spacing.lg,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                opacity: isRegistering ? 0.7 : 1,
              }}
            >
              {isRegistering && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: theme.colors.neutral.white,
                    borderTopColor: 'transparent',
                    marginRight: theme.spacing.sm,
                  }}
                />
              )}
              <Ionicons
                name={isRegistering ? "hourglass-outline" : "briefcase-outline"}
                size={20}
                color={theme.colors.neutral.white}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.md,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.neutral.white,
                }}
              >
                {isRegistering ? 'Registering...' : 'Register Company'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: theme.spacing.md,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.tertiary,
              }}
            >
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/employer-login')}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.primary.deepBlue,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
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
              maxWidth: 400,
              padding: theme.spacing.xl,
              alignItems: 'center',
            }}
          >
            {/* Success Icon with Logo */}
            <View
              style={{
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.colors.status.success,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: theme.spacing.md,
                }}
              >
                <Ionicons
                  name="checkmark"
                  size={40}
                  color={theme.colors.neutral.white}
                />
              </View>
              
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
                textAlign: 'center',
              }}
            >
              Registration Successful!
            </Text>

            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginBottom: theme.spacing.lg,
                lineHeight: theme.typography.sizes.base * 1.5,
              }}
            >
              Your company registration is pending admin approval. You'll receive a notification once approved.
            </Text>

            <TouchableOpacity
              onPress={handleSuccess}
              style={{
                width: '100%',
                borderRadius: theme.borderRadius.lg,
                overflow: 'hidden',
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.colors.primary.deepBlue, theme.colors.secondary.darkBlue]}
                style={{
                  paddingVertical: theme.spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontFamily: theme.typography.fonts.semiBold,
                    color: theme.colors.neutral.white,
                  }}
                >
                  Continue to Login
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}