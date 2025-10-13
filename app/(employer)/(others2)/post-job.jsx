import CustomDropdown from '@/components/CustomDropdown';
import CustomInput from '@/components/CustomInput';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import SkillsInput from '@/components/SkillsInput';
import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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

export default function CreateJob() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    locationCity: '',
    locationState: '',
    employmentType: '',
    workMode: '',
    experienceMin: '0',
    experienceMax: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'annual',
    jobDescription: '',
    jobResponsibilities: '',
    jobRequirements: '',
    benefits: '',
    educationRequirement: '',
    positionsAvailable: '1',
    priorityLevel: 'medium',
    applicationDeadline: '',
    jobCategory: '',
  });

  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [postError, setPostError] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Dropdown options matching database schema
  const employmentTypeOptions = [
    { label: "Full-Time", value: "full_time" },
    { label: "Part-Time", value: "part_time" },
    { label: "Contract", value: "contract" },
    { label: "Freelance", value: "freelance" },
    { label: "Internship", value: "internship" },
  ];

  const workModeOptions = [
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
    { label: "On-Site", value: "on_site" },
  ];

  const salaryTypeOptions = [
    { label: "Annual", value: "annual" },
    { label: "Monthly", value: "monthly" },
    { label: "Hourly", value: "hourly" },
    { label: "Per Project", value: "per_project" },
  ];

  const priorityLevelOptions = [
    { label: 'Low Priority', value: 'low' },
    { label: 'Medium Priority', value: 'medium' },
    { label: 'High Priority', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
  ];

  const jobCategoryOptions = [
    { label: "Software Development", value: "Software Development" },
    { label: "Product Management", value: "Product Management" },
    { label: "Design", value: "Design" },
    { label: "Marketing", value: "Marketing" },
    { label: "Sales", value: "Sales" },
    { label: "Human Resources", value: "Human Resources" },
    { label: "Finance", value: "Finance" },
    { label: "Operations", value: "Operations" },
    { label: "Customer Support", value: "Customer Support" },
    { label: "Data Science", value: "Data Science" },
    { label: "Other", value: "Other" },
  ];

  // Load skills, user_id, and company_id on mount
  useEffect(() => {
    loadSkills();
    loadUserData();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await apiService.getSkills();
      if (response.success) {
        setAvailableSkills(response.data.map(skill => ({
          label: skill.skill_name,
          value: skill.skill_id,
          category: skill.skill_category
        })));
      }
    } catch (error) {
      console.log('Error loading skills:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUserId = await SecureStore.getItemAsync('user_id');
      const storedCompanyId = await SecureStore.getItemAsync('company_id');

      console.log('📋 Loaded from SecureStore:', {
        userId: storedUserId,
        companyId: storedCompanyId
      });

      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      } else {
        setPostError('User ID not found. Please login again.');
      }

      if (storedCompanyId) {
        setCompanyId(parseInt(storedCompanyId));
      } else {
        setPostError('Company ID not found. Please login again.');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setPostError('Error loading user information.');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (postError) {
      setPostError("");
    }
  };

  const handleSkillsChange = (newSkills) => {
    setSkills(newSkills);
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.locationCity.trim()) newErrors.locationCity = 'City is required';
    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
    if (!formData.workMode) newErrors.workMode = 'Work mode is required';
    if (!formData.jobDescription.trim()) newErrors.jobDescription = 'Job description is required';
    if (!formData.jobResponsibilities.trim()) newErrors.jobResponsibilities = 'Responsibilities are required';
    if (!formData.jobRequirements.trim()) newErrors.jobRequirements = 'Requirements are required';

    if (skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    // Salary validation
    if (formData.salaryMin && formData.salaryMax) {
      const minSalary = parseFloat(formData.salaryMin);
      const maxSalary = parseFloat(formData.salaryMax);

      if (minSalary >= maxSalary) {
        newErrors.salaryMax = 'Maximum salary should be higher than minimum';
      }
    }

    // Experience validation
    if (formData.experienceMin && formData.experienceMax) {
      const minExp = parseInt(formData.experienceMin);
      const maxExp = parseInt(formData.experienceMax);

      if (minExp > maxExp) {
        newErrors.experienceMax = 'Maximum experience should be higher than minimum';
      }
    }

    // Positions validation
    if (formData.positionsAvailable && parseInt(formData.positionsAvailable) < 1) {
      newErrors.positionsAvailable = 'At least 1 position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    if (!userId) {
      console.log('❌ User ID not found');
      setPostError('User ID not found. Please login again.');
      return;
    }

    if (!companyId) {
      console.log('❌ Company ID not found');
      setPostError('Company ID not found. Please login again.');
      return;
    }

    setIsSubmitting(true);
    setPostError("");

    try {
      const jobData = {
        // User and Company IDs (required)
        userId: userId,
        companyId: companyId,

        // Job data
        jobTitle: formData.jobTitle,
        department: formData.department,
        locationCity: formData.locationCity,
        locationState: formData.locationState,
        employmentType: formData.employmentType,
        workMode: formData.workMode,
        experienceMin: parseInt(formData.experienceMin) || 0,
        experienceMax: formData.experienceMax ? parseInt(formData.experienceMax) : null,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        salaryType: formData.salaryType,
        jobDescription: formData.jobDescription,
        jobResponsibilities: formData.jobResponsibilities,
        jobRequirements: formData.jobRequirements,
        benefits: formData.benefits,
        educationRequirement: formData.educationRequirement,
        positionsAvailable: parseInt(formData.positionsAvailable) || 1,
        priorityLevel: formData.priorityLevel,
        applicationDeadline: formData.applicationDeadline || null,
        jobCategory: formData.jobCategory,
        skills: skills.map(skill => ({
          skill_id: skill.skill_id || skill.value, // Support both formats
          is_required: 1,
          proficiency_required: skill.proficiency_level || 'intermediate',
          priority: 'must_have'
        })),
        jobStatus: isDraft ? 'draft' : 'active',
      };

      console.log('📤 Posting job with data:', {
        userId,
        companyId,
        jobTitle: jobData.jobTitle,
        skillsCount: skills.length,
        isDraft
      });

      const response = await apiService.postJob(jobData);

      console.log('📥 API Response:', response);

      if (response.success) {
        console.log('✅ Job posted successfully!', response.data);
        setShowSuccessModal(true);
      } else {
        // Display detailed error messages from the API
        let errorMessage = '';

        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          // Show all validation errors
          errorMessage = response.errors.join('\n• ');
          errorMessage = '• ' + errorMessage;
          console.log('❌ Validation errors:', response.errors);
        } else if (response.message) {
          // Show general error message
          errorMessage = response.message;
        } else {
          // Fallback error message
          errorMessage = isDraft ? 'Failed to save draft' : 'Failed to publish job';
        }

        console.log('❌ Job post failed:', errorMessage);
        setPostError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Post job exception:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setPostError('Network error. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit(true);
  };

  const handlePublish = () => {
    handleSubmit(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace('/employer/jobs');
  };

  // Generate sample job data for testing
  const generateSampleJob = () => {
    setFormData({
      jobTitle: 'Senior React Native Developer',
      department: 'Engineering',
      locationCity: 'Mumbai',
      locationState: 'Maharashtra',
      employmentType: 'full_time',
      workMode: 'hybrid',
      experienceMin: '3',
      experienceMax: '5',
      salaryMin: '1200000',
      salaryMax: '1800000',
      salaryType: 'annual',
      jobDescription: 'We are looking for an experienced React Native developer to join our dynamic team. You will be responsible for developing high-quality mobile applications for both iOS and Android platforms. This role requires strong problem-solving skills and the ability to work in a fast-paced environment.',
      jobResponsibilities: '• Design and build advanced applications for iOS and Android\n• Collaborate with cross-functional teams to define and ship new features\n• Work on bug fixing and improving application performance\n• Continuously discover and implement new technologies\n• Maintain code quality and organization',
      jobRequirements: '• 3+ years of React Native development experience\n• Strong proficiency in JavaScript and TypeScript\n• Experience with Redux or similar state management\n• Knowledge of RESTful APIs and third-party libraries\n• Understanding of mobile app architecture and design patterns',
      benefits: '• Competitive salary package\n• Health insurance for employee and family\n• Flexible working hours\n• Work from home options\n• Professional development budget\n• Annual performance bonuses',
      educationRequirement: "Bachelor's degree in Computer Science or related field",
      positionsAvailable: '2',
      priorityLevel: 'high',
      applicationDeadline: '2025-12-31',
      jobCategory: 'Software Development',
    });

    // Set sample skills (React Native, JavaScript, TypeScript)
    // Using skill_name format that SkillsInput expects
    setSkills([
      { skill_name: 'React Native', skill_id: 8 },
      { skill_name: 'JavaScript', skill_id: 1 },
      { skill_name: 'TypeScript', skill_id: 18 },
      { skill_name: 'Redux', skill_id: 19 },
      { skill_name: 'Node.js', skill_id: 4 },
    ]);

    if (postError) {
      setPostError("");
    }
  };

  // Header Component
  const Header = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.background.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          padding: theme.spacing.sm,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.background.accent,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={theme.colors.primary.teal}
        />
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text
          style={{
            fontSize: theme.typography.sizes.md,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.primary,
          }}
        >
          Create Job Posting
        </Text>
        <TouchableOpacity
          onPress={generateSampleJob}
          disabled={isSubmitting}
          style={{
            marginTop: 2,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 2,
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.status.warning,
              textDecorationLine: 'underline',
            }}
          >
            🧪 Generate Sample
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSaveDraft}
        disabled={isSubmitting}
        style={{
          backgroundColor: theme.colors.background.accent,
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          opacity: isSubmitting ? 0.5 : 1,
        }}
        activeOpacity={0.8}
      >
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.primary.teal,
          }}
        >
          Save Draft
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Success Modal
  const SuccessModal = () => (
    <Modal visible={showSuccessModal} transparent={true} animationType="fade">
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
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.colors.status.success,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: theme.spacing.lg,
            }}
          >
            <Ionicons
              name="checkmark"
              size={40}
              color={theme.colors.neutral.white}
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
            Job Posted Successfully!
          </Text>

          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginBottom: theme.spacing.xl,
              lineHeight: theme.typography.sizes.base * 1.5,
            }}
          >
            Your job posting is now live and candidates can start applying.
          </Text>

          <TouchableOpacity
            onPress={handleSuccessClose}
            style={{
              width: '100%',
              borderRadius: theme.borderRadius.lg,
              overflow: 'hidden',
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
                View Jobs
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaWrapper backgroundColor={theme.colors.background.primary} edges={['left', 'right', 'bottom']}>
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

      <Header />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.lg,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information Section */}
          <View
            style={{
              backgroundColor: theme.colors.background.card,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              borderWidth: 1,
              borderColor: theme.colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.md,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.lg,
              }}
            >
              Basic Information
            </Text>

            <CustomInput
              label="Job Title"
              value={formData.jobTitle}
              onChangeText={(value) => updateFormData('jobTitle', value)}
              placeholder="e.g., Senior React Developer"
              icon="briefcase-outline"
              error={errors.jobTitle}
              required
            />

            <CustomInput
              label="Department"
              value={formData.department}
              onChangeText={(value) => updateFormData('department', value)}
              placeholder="e.g., Engineering, Marketing, Sales"
              icon="business-outline"
              error={errors.department}
            />

            <CustomDropdown
              label="Job Category"
              value={formData.jobCategory}
              onSelect={(value) => updateFormData('jobCategory', value)}
              options={jobCategoryOptions}
              placeholder="Select job category"
              icon="grid-outline"
              error={errors.jobCategory}
            />

            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="City"
                  value={formData.locationCity}
                  onChangeText={(value) => updateFormData('locationCity', value)}
                  placeholder="e.g., Mumbai"
                  icon="location-outline"
                  error={errors.locationCity}
                  required
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="State"
                  value={formData.locationState}
                  onChangeText={(value) => updateFormData('locationState', value)}
                  placeholder="e.g., Maharashtra"
                  icon="location-outline"
                  error={errors.locationState}
                />
              </View>
            </View>

            <CustomDropdown
              label="Employment Type"
              value={formData.employmentType}
              onSelect={(value) => updateFormData('employmentType', value)}
              options={employmentTypeOptions}
              placeholder="Select employment type"
              icon="time-outline"
              error={errors.employmentType}
              required
            />

            <CustomDropdown
              label="Work Mode"
              value={formData.workMode}
              onSelect={(value) => updateFormData('workMode', value)}
              options={workModeOptions}
              placeholder="Select work mode"
              icon="home-outline"
              error={errors.workMode}
              required
            />

            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Min Experience (Years)"
                  value={formData.experienceMin}
                  onChangeText={(value) => updateFormData('experienceMin', value)}
                  placeholder="0"
                  icon="school-outline"
                  keyboardType="number-pad"
                  error={errors.experienceMin}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Max Experience (Years)"
                  value={formData.experienceMax}
                  onChangeText={(value) => updateFormData('experienceMax', value)}
                  placeholder="e.g., 5"
                  icon="school-outline"
                  keyboardType="number-pad"
                  error={errors.experienceMax}
                />
              </View>
            </View>

            <CustomInput
              label="Number of Positions"
              value={formData.positionsAvailable}
              onChangeText={(value) => updateFormData('positionsAvailable', value)}
              placeholder="1"
              icon="people-outline"
              keyboardType="number-pad"
              error={errors.positionsAvailable}
            />
          </View>

          {/* Compensation Section */}
          <View
            style={{
              backgroundColor: theme.colors.background.card,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              borderWidth: 1,
              borderColor: theme.colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.md,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.lg,
              }}
            >
              Compensation
            </Text>

            <CustomDropdown
              label="Salary Type"
              value={formData.salaryType}
              onSelect={(value) => updateFormData('salaryType', value)}
              options={salaryTypeOptions}
              placeholder="Select salary type"
              icon="cash-outline"
              error={errors.salaryType}
            />

            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Minimum Salary (₹)"
                  value={formData.salaryMin}
                  onChangeText={(value) => updateFormData('salaryMin', value)}
                  placeholder="e.g., 800000"
                  icon="cash-outline"
                  keyboardType="numeric"
                  error={errors.salaryMin}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Maximum Salary (₹)"
                  value={formData.salaryMax}
                  onChangeText={(value) => updateFormData('salaryMax', value)}
                  placeholder="e.g., 1500000"
                  icon="cash-outline"
                  keyboardType="numeric"
                  error={errors.salaryMax}
                />
              </View>
            </View>
          </View>

          {/* Job Details Section */}
          <View
            style={{
              backgroundColor: theme.colors.background.card,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              borderWidth: 1,
              borderColor: theme.colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.md,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.lg,
              }}
            >
              Job Details
            </Text>

            <CustomInput
              label="Job Description"
              value={formData.jobDescription}
              onChangeText={(value) => updateFormData('jobDescription', value)}
              placeholder="Describe the role, company culture, and what makes this position exciting..."
              icon="document-text-outline"
              error={errors.jobDescription}
              multiline
              numberOfLines={5}
              required
            />

            <CustomInput
              label="Key Responsibilities"
              value={formData.jobResponsibilities}
              onChangeText={(value) => updateFormData('jobResponsibilities', value)}
              placeholder="• Lead development of React applications&#10;• Mentor junior developers&#10;• Collaborate with design team..."
              icon="list-outline"
              error={errors.jobResponsibilities}
              multiline
              numberOfLines={5}
              required
            />

            <CustomInput
              label="Requirements"
              value={formData.jobRequirements}
              onChangeText={(value) => updateFormData('jobRequirements', value)}
              placeholder="• 3+ years React experience&#10;• Strong JavaScript knowledge&#10;• Experience with REST APIs..."
              icon="checkmark-done-outline"
              error={errors.jobRequirements}
              multiline
              numberOfLines={5}
              required
            />

            <CustomInput
              label="Education Requirement"
              value={formData.educationRequirement}
              onChangeText={(value) => updateFormData('educationRequirement', value)}
              placeholder="e.g., Bachelor's in Computer Science or equivalent"
              icon="school-outline"
              error={errors.educationRequirement}
            />

            <CustomInput
              label="Benefits & Perks"
              value={formData.benefits}
              onChangeText={(value) => updateFormData('benefits', value)}
              placeholder="• Health insurance&#10;• Flexible working hours&#10;• Professional development budget..."
              icon="gift-outline"
              error={errors.benefits}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Skills & Priority Section */}
          <View
            style={{
              backgroundColor: theme.colors.background.card,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              borderWidth: 1,
              borderColor: theme.colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.md,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.lg,
              }}
            >
              Skills & Priority
            </Text>

            <SkillsInput
              skills={skills}
              onSkillsChange={handleSkillsChange}
              label="Required Skills *"
              required={true}
              error={errors.skills}
            />

            <CustomDropdown
              label="Priority Level"
              value={formData.priorityLevel}
              onSelect={(value) => updateFormData('priorityLevel', value)}
              options={priorityLevelOptions}
              placeholder="Select priority level"
              icon="flag-outline"
              error={errors.priorityLevel}
            />

            <CustomInput
              label="Application Deadline"
              value={formData.applicationDeadline}
              onChangeText={(value) => updateFormData('applicationDeadline', value)}
              placeholder="YYYY-MM-DD (e.g., 2025-12-31)"
              icon="calendar-outline"
              error={errors.applicationDeadline}
            />
          </View>

          {/* Post Error Message */}
          {postError ? (
            <View
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.lg,
                borderLeftWidth: 3,
                borderLeftColor: theme.colors.status.error,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.xs }}>
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color={theme.colors.status.error}
                  style={{ marginRight: theme.spacing.sm, marginTop: 2 }}
                />
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.bold,
                    color: theme.colors.status.error,
                  }}
                >
                  Error
                </Text>
              </View>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.status.error,
                  lineHeight: theme.typography.sizes.sm * 1.5,
                }}
              >
                {postError}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background.card,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={handleSaveDraft}
              disabled={isSubmitting}
              style={{
                flex: 1,
                backgroundColor: theme.colors.background.accent,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.primary.teal,
                opacity: isSubmitting ? 0.5 : 1,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.primary.teal,
                }}
              >
                Save Draft
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePublish}
              disabled={isSubmitting}
              style={{
                flex: 2,
                borderRadius: theme.borderRadius.lg,
                overflow: 'hidden',
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  isSubmitting
                    ? [theme.colors.neutral.mediumGray, theme.colors.neutral.mediumGray]
                    : [theme.colors.primary.teal, theme.colors.secondary.darkTeal]
                }
                style={{
                  paddingVertical: theme.spacing.md,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                {isSubmitting && (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.neutral.white}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                )}
                <Text
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontFamily: theme.typography.fonts.semiBold,
                    color: theme.colors.neutral.white,
                  }}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Job'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal />
    </SafeAreaWrapper>
  );
}
