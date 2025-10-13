import CustomInput from "@/components/CustomInput";
import SafeAreaWrapper from "@/components/SafeAreaWrapper";
import theme from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ForgotPassword() {
  // Get user type from query params (employer or jobseeker)
  const params = useLocalSearchParams();
  const userType = params.type || 'jobseeker';

  // Form step state
  const [step, setStep] = useState(1); // 1: Email/Mobile, 2: OTP, 3: New Password

  // Form data
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Step 1: Validate Email/Mobile
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.emailOrMobile.trim()) {
      newErrors.emailOrMobile = "Email or mobile number is required";
    } else {
      const isEmail = formData.emailOrMobile.includes('@');
      if (isEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailOrMobile)) {
          newErrors.emailOrMobile = "Please enter a valid email address";
        }
      } else {
        if (!/^[+]?[1-9][\d]{9,14}$/.test(formData.emailOrMobile.replace(/\s/g, ''))) {
          newErrors.emailOrMobile = "Please enter a valid mobile number";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2: Validate OTP
  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = "Please enter a valid 6-digit OTP";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3: Validate New Password
  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    setSuccessMessage("");

    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For now, just proceed to OTP step
      setSuccessMessage("OTP sent successfully! Please check your email/phone.");
      setTimeout(() => {
        setStep(2);
        setSuccessMessage("");
      }, 1500);

    } catch (error) {
      console.error('Send OTP error:', error);
      setErrors({ emailOrMobile: "Failed to send OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setSuccessMessage("");

    try {
      // TODO: Replace with actual API call
      // For now, accept hardcoded OTP: 123456
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (formData.otp !== "123456") {
        setErrors({ otp: "Invalid OTP. Please try again or use 123456 for testing." });
        setIsLoading(false);
        return;
      }

      setSuccessMessage("OTP verified successfully!");
      setTimeout(() => {
        setStep(3);
        setSuccessMessage("");
      }, 1000);

    } catch (error) {
      console.error('Verify OTP error:', error);
      setErrors({ otp: "Failed to verify OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    setSuccessMessage("");

    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage("Password reset successfully! Redirecting to login...");

      // Redirect to appropriate login page after 2 seconds
      setTimeout(() => {
        if (userType === 'employer') {
          router.replace('/employer-login');
        } else {
          router.replace('/signin');
        }
      }, 2000);

    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ newPassword: "Failed to reset password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    setSuccessMessage("OTP resent successfully!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  // Floating decorative element
  const FloatingElement = ({ style, color, size = 60 }) => {
    const translateY = floatingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -12],
    });

    const opacity = floatingAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.6, 1, 0.6],
    });

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ translateY }],
            opacity,
          },
          style,
        ]}
      />
    );
  };

  // Get theme colors based on user type
  const getThemeColor = () => {
    return userType === 'employer'
      ? theme.colors.primary.deepBlue
      : theme.colors.primary.teal;
  };

  const getSecondaryColor = () => {
    return userType === 'employer'
      ? theme.colors.secondary.darkBlue
      : theme.colors.secondary.darkTeal;
  };

  const getAccentColor = () => {
    return userType === 'employer'
      ? 'rgba(30, 74, 114, 0.08)'
      : 'rgba(27, 163, 163, 0.08)';
  };

  // Progress indicator
  const ProgressIndicator = () => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    }}>
      {[1, 2, 3].map((stepNumber) => (
        <View key={stepNumber} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: step >= stepNumber ? getThemeColor() : theme.colors.neutral.lightGray,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {step > stepNumber ? (
              <Ionicons name="checkmark" size={18} color={theme.colors.neutral.white} />
            ) : (
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.bold,
                  color: step >= stepNumber ? theme.colors.neutral.white : theme.colors.text.tertiary,
                }}
              >
                {stepNumber}
              </Text>
            )}
          </View>
          {stepNumber < 3 && (
            <View
              style={{
                width: 40,
                height: 2,
                backgroundColor: step > stepNumber ? getThemeColor() : theme.colors.neutral.lightGray,
                marginHorizontal: theme.spacing.xs,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaWrapper>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.primary}
        translucent={false}
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={[
          userType === 'employer'
            ? 'rgba(30, 74, 114, 0.08)'
            : theme.colors.background.accent,
          userType === 'employer'
            ? 'rgba(30, 74, 114, 0.03)'
            : 'rgba(27, 163, 163, 0.05)',
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

      {/* Floating Decorative Elements */}
      <FloatingElement
        style={{ top: height * 0.1, right: -20 }}
        color={getAccentColor()}
        size={70}
      />
      <FloatingElement
        style={{ top: height * 0.35, left: -25 }}
        color="rgba(255, 138, 61, 0.06)"
        size={50}
      />
      <FloatingElement
        style={{ bottom: height * 0.2, right: -15 }}
        color={getAccentColor()}
        size={60}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Back Button */}
          <Animated.View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.xl,
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                  setErrors({});
                } else {
                  router.back();
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.text.primary}
                style={{ marginRight: theme.spacing.xs }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.text.primary,
                }}
              >
                Back
              </Text>
            </TouchableOpacity>

            {/* Logo and Title */}
            <View style={{ alignItems: "center", marginBottom: theme.spacing.lg }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: theme.colors.neutral.white,
                  justifyContent: "center",
                  alignItems: "center",
                  ...theme.shadows.md,
                  marginBottom: theme.spacing.md,
                  borderWidth: 2,
                  borderColor: userType === 'employer'
                    ? 'rgba(30, 74, 114, 0.1)'
                    : theme.colors.background.accent,
                }}
              >
                <Image
                  source={require("@/assets/images/company/logo.png")}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  }}
                  resizeMode="contain"
                />
              </View>

              <Text
                style={{
                  fontSize: theme.typography.sizes.lg,
                  fontFamily: theme.typography.fonts.bold,
                  color: theme.colors.text.primary,
                  textAlign: "center",
                  marginBottom: theme.spacing.xs,
                }}
              >
                {step === 1 && "Reset Password"}
                {step === 2 && "Verify OTP"}
                {step === 3 && "Create New Password"}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.tertiary,
                  textAlign: "center",
                  paddingHorizontal: theme.spacing.md,
                }}
              >
                {step === 1 && "Enter your email or mobile number to receive OTP"}
                {step === 2 && "Enter the 6-digit code sent to your email/phone"}
                {step === 3 && "Create a strong password for your account"}
              </Text>
            </View>

            {/* Progress Indicator */}
            <ProgressIndicator />
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={{
              flex: 1,
              paddingHorizontal: theme.spacing.lg,
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }}
          >
            {/* Form Card */}
            <View style={{
              backgroundColor: theme.colors.neutral.white,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.lg,
              ...theme.shadows.lg,
              borderWidth: 1,
              borderColor: theme.colors.border.light,
              marginBottom: theme.spacing.md,
            }}>
              {/* Subtle gradient background */}
              <LinearGradient
                colors={['transparent', userType === 'employer'
                  ? 'rgba(30, 74, 114, 0.03)'
                  : 'rgba(27, 163, 163, 0.03)']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: theme.borderRadius.xl,
                }}
              />

              {/* Step 1: Email/Mobile Input */}
              {step === 1 && (
                <>
                  <CustomInput
                    label="Email or Mobile Number"
                    value={formData.emailOrMobile}
                    onChangeText={(value) => handleInputChange("emailOrMobile", value)}
                    placeholder="Enter your email or mobile number"
                    error={errors.emailOrMobile}
                    icon={userType === 'employer' ? "business-outline" : "person-outline"}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <LinearGradient
                    colors={[getThemeColor(), getSecondaryColor()]}
                    style={{
                      borderRadius: theme.borderRadius.lg,
                      ...theme.shadows.md,
                      opacity: isLoading ? 0.7 : 1,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TouchableOpacity
                      onPress={handleSendOTP}
                      disabled={isLoading}
                      style={{
                        paddingVertical: theme.spacing.md,
                        alignItems: "center",
                        borderRadius: theme.borderRadius.lg,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                      activeOpacity={0.9}
                    >
                      {isLoading ? (
                        <>
                          <Ionicons
                            name="hourglass-outline"
                            size={18}
                            color={theme.colors.neutral.white}
                            style={{ marginRight: theme.spacing.xs }}
                          />
                          <Text
                            style={{
                              color: theme.colors.neutral.white,
                              fontSize: theme.typography.sizes.sm,
                              fontFamily: theme.typography.fonts.bold,
                            }}
                          >
                            Sending OTP...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons
                            name="mail-outline"
                            size={18}
                            color={theme.colors.neutral.white}
                            style={{ marginRight: theme.spacing.xs }}
                          />
                          <Text
                            style={{
                              color: theme.colors.neutral.white,
                              fontSize: theme.typography.sizes.sm,
                              fontFamily: theme.typography.fonts.bold,
                            }}
                          >
                            Send OTP
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </LinearGradient>
                </>
              )}

              {/* Step 2: OTP Input */}
              {step === 2 && (
                <>
                  <CustomInput
                    label="Enter OTP"
                    value={formData.otp}
                    onChangeText={(value) => handleInputChange("otp", value)}
                    placeholder="Enter 6-digit OTP"
                    error={errors.otp}
                    icon="keypad-outline"
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  {/* Info message for testing */}
                  <View
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      marginBottom: theme.spacing.lg,
                      borderLeftWidth: 3,
                      borderLeftColor: theme.colors.status.info,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.xs,
                        fontFamily: theme.typography.fonts.medium,
                        color: theme.colors.status.info,
                        textAlign: 'center',
                      }}
                    >
                      💡 For testing, use OTP: <Text style={{ fontFamily: theme.typography.fonts.bold }}>123456</Text>
                    </Text>
                  </View>

                  <LinearGradient
                    colors={[getThemeColor(), getSecondaryColor()]}
                    style={{
                      borderRadius: theme.borderRadius.lg,
                      ...theme.shadows.md,
                      opacity: isLoading ? 0.7 : 1,
                      marginBottom: theme.spacing.md,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TouchableOpacity
                      onPress={handleVerifyOTP}
                      disabled={isLoading}
                      style={{
                        paddingVertical: theme.spacing.md,
                        alignItems: "center",
                        borderRadius: theme.borderRadius.lg,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                      activeOpacity={0.9}
                    >
                      {isLoading ? (
                        <>
                          <Ionicons
                            name="hourglass-outline"
                            size={18}
                            color={theme.colors.neutral.white}
                            style={{ marginRight: theme.spacing.xs }}
                          />
                          <Text
                            style={{
                              color: theme.colors.neutral.white,
                              fontSize: theme.typography.sizes.sm,
                              fontFamily: theme.typography.fonts.bold,
                            }}
                          >
                            Verifying...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={18}
                            color={theme.colors.neutral.white}
                            style={{ marginRight: theme.spacing.xs }}
                          />
                          <Text
                            style={{
                              color: theme.colors.neutral.white,
                              fontSize: theme.typography.sizes.sm,
                              fontFamily: theme.typography.fonts.bold,
                            }}
                          >
                            Verify OTP
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </LinearGradient>

                  {/* Resend OTP */}
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    style={{
                      alignSelf: "center",
                      paddingVertical: theme.spacing.sm,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.sm,
                        fontFamily: theme.typography.fonts.semiBold,
                        color: getThemeColor(),
                        textAlign: 'center',
                      }}
                    >
                      Didn't receive OTP? Resend
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 3: New Password Input */}
              {step === 3 && (
                <>
                  <CustomInput
                    label="New Password"
                    value={formData.newPassword}
                    onChangeText={(value) => handleInputChange("newPassword", value)}
                    placeholder="Enter new password (min 6 characters)"
                    secureTextEntry
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    error={errors.newPassword}
                    icon="lock-closed-outline"
                  />

                  <CustomInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange("confirmPassword", value)}
                    placeholder="Re-enter your password"
                    secureTextEntry
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    error={errors.confirmPassword}
                    icon="lock-closed-outline"
                  />

                  <LinearGradient
                    colors={[getThemeColor(), getSecondaryColor()]}
                    style={{
                      borderRadius: theme.borderRadius.lg,
                      ...theme.shadows.md,
                      opacity: isLoading ? 0.7 : 1,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TouchableOpacity
                      onPress={handleResetPassword}
                      disabled={isLoading}
                      style={{
                        paddingVertical: theme.spacing.md,
                        alignItems: "center",
                        borderRadius: theme.borderRadius.lg,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                      activeOpacity={0.9}
                    >
                      {isLoading ? (
                        <>
                          <Ionicons
                            name="hourglass-outline"
                            size={18}
                            color={theme.colors.neutral.white}
                            style={{ marginRight: theme.spacing.xs }}
                          />
                          <Text
                            style={{
                              color: theme.colors.neutral.white,
                              fontSize: theme.typography.sizes.sm,
                              fontFamily: theme.typography.fonts.bold,
                            }}
                          >
                            Resetting Password...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={18}
                            color={theme.colors.neutral.white}
                            style={{ marginRight: theme.spacing.xs }}
                          />
                          <Text
                            style={{
                              color: theme.colors.neutral.white,
                              fontSize: theme.typography.sizes.sm,
                              fontFamily: theme.typography.fonts.bold,
                            }}
                          >
                            Reset Password
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </LinearGradient>
                </>
              )}

              {/* Success Message */}
              {successMessage ? (
                <View
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    marginTop: theme.spacing.md,
                    borderLeftWidth: 3,
                    borderLeftColor: theme.colors.status.success,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.medium,
                      color: theme.colors.status.success,
                      textAlign: 'center',
                    }}
                  >
                    {successMessage}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Footer - Remember Password */}
            <View
              style={{
                alignItems: "center",
                paddingBottom: theme.spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.tertiary,
                }}
              >
                Remember your password?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (userType === 'employer') {
                    router.replace('/employer-login');
                  } else {
                    router.replace('/signin');
                  }
                }}
                style={{
                  paddingVertical: theme.spacing.sm,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.bold,
                    color: getThemeColor(),
                  }}
                >
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
