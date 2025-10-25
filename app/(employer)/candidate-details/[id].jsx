import SendProposalModal from '@/components/SendProposalModal';
import apiService from '@/services/apiService';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function CandidateDetails() {
  const { id } = useLocalSearchParams(); // candidate_id from route params
  
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [candidateStatus, setCandidateStatus] = useState('discovered');

  // Load candidate details on mount
  useEffect(() => {
    if (id) {
      loadCandidateDetails();
    }
  }, [id]);

  const loadCandidateDetails = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await apiService.getCandidateDetails(parseInt(id));

      if (response.success && response.data) {
        setCandidateData(response.data);
        
        // Set status based on proposal_sent flag
        if (response.data.proposal_sent) {
          setCandidateStatus(response.data.status || 'proposal_sent');
        } else {
          setCandidateStatus('discovered');
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to load candidate details');
        if (!isRefresh) {
          router.back();
        }
      }
    } catch (error) {
      console.error('❌ Load candidate error:', error);
      Alert.alert('Error', 'Failed to load candidate details');
      if (!isRefresh) {
        router.back();
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleProposalSent = (proposalData) => {
    console.log('✅ Proposal sent successfully:', proposalData);
    
    // Update candidate status
    setCandidateStatus('proposal_sent');
    
    // Refresh candidate data to get updated proposal status
    loadCandidateDetails(true);
  };

  const handleSendProposal = () => {
    if (candidateStatus !== 'discovered') {
      Alert.alert(
        'Already Sent',
        'You have already sent a proposal to this candidate.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setShowProposalModal(true);
  };

  const getStatusColor = () => {
    switch (candidateStatus) {
      case 'discovered': return theme.colors.primary.orange;
      case 'proposal_sent': 
      case 'submitted': 
      case 'under_review': 
        return theme.colors.primary.deepBlue;
      case 'shortlisted':
      case 'interview_scheduled':
        return theme.colors.status.success;
      case 'rejected': return theme.colors.status.error;
      default: return theme.colors.text.tertiary;
    }
  };

  const getStatusText = () => {
    switch (candidateStatus) {
      case 'discovered': return 'New Discovery';
      case 'proposal_sent': 
      case 'submitted': 
        return 'Proposal Sent';
      case 'under_review': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'rejected': return 'Not Interested';
      default: return candidateStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Format salary display
  const formatSalary = (salary) => {
    if (!salary) return 'Not disclosed';
    const salaryNum = parseFloat(salary);
    if (salaryNum >= 100000) {
      return `₹${(salaryNum / 100000).toFixed(1)}L`;
    } else if (salaryNum >= 1000) {
      return `₹${(salaryNum / 1000).toFixed(0)}K`;
    }
    return `₹${salaryNum.toLocaleString('en-IN')}`;
  };

  // Format notice period
  const formatNoticePeriod = (period) => {
    if (!period) return 'Not specified';
    return period.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

      <Text
        style={{
          fontSize: theme.typography.sizes.md,
          fontFamily: theme.typography.fonts.semiBold,
          color: theme.colors.text.primary,
          flex: 1,
          textAlign: 'center',
        }}
      >
        Candidate Profile
      </Text>

      <View style={{ width: 40 }} />
    </View>
  );

  // Section Component
  const Section = ({ title, icon, children }) => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
        <Ionicons
          name={icon}
          size={20}
          color={theme.colors.primary.teal}
          style={{ marginRight: theme.spacing.sm }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.primary,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  // Info Row Component
  const InfoRow = ({ icon, label, value }) => {
    if (!value || value === 'Not specified' || value === 'null') return null;
    
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.md,
        }}
      >
        <Ionicons
          name={icon}
          size={16}
          color={theme.colors.primary.teal}
          style={{ marginRight: theme.spacing.sm, marginTop: 2 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.tertiary,
              marginBottom: 2,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.primary,
            }}
          >
            {value}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary.teal} />
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.md,
            }}
          >
            Loading candidate details...
          </Text>
        </View>
      </>
    );
  }

  if (!candidateData) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg }}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.text.tertiary}
          />
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.md,
              textAlign: 'center',
            }}
          >
            Candidate not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: theme.spacing.lg,
              paddingHorizontal: theme.spacing.xl,
              paddingVertical: theme.spacing.md,
              backgroundColor: theme.colors.primary.teal,
              borderRadius: theme.borderRadius.lg,
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
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <Header />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadCandidateDetails(true)}
              colors={[theme.colors.primary.teal]}
              tintColor={theme.colors.primary.teal}
            />
          }
        >
          {/* Profile Header Card */}
          <View
            style={{
              backgroundColor: theme.colors.background.card,
              padding: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            {/* Profile Image and Basic Info */}
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.colors.background.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: theme.spacing.md,
                  overflow: 'hidden',
                }}
              >
                {candidateData.profile_image ? (
                  <Image
                    source={{ 
                      uri: candidateData.profile_image.startsWith('http') 
                        ? candidateData.profile_image 
                        : `https://work.phpwebsites.in/manvue/photos/medium/${candidateData.profile_image}`
                    }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={48}
                    color={theme.colors.primary.teal}
                  />
                )}
              </View>

              <Text
                style={{
                  fontSize: theme.typography.sizes.xl,
                  fontFamily: theme.typography.fonts.bold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs,
                  textAlign: 'center',
                }}
              >
                {candidateData.name}
              </Text>

              {candidateData.current_title && (
                <Text
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontFamily: theme.typography.fonts.medium,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.xs,
                    textAlign: 'center',
                  }}
                >
                  {candidateData.current_title}
                </Text>
              )}

              {candidateData.current_company && (
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.tertiary,
                    marginBottom: theme.spacing.md,
                    textAlign: 'center',
                  }}
                >
                  at {candidateData.current_company}
                </Text>
              )}

              {/* Status Badge */}
              <View
                style={{
                  backgroundColor: `${getStatusColor()}15`,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.full,
                  borderWidth: 1,
                  borderColor: getStatusColor(),
                }}
              >
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
            </View>

            {/* Quick Stats */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: theme.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border.light,
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xl,
                    fontFamily: theme.typography.fonts.bold,
                    color: theme.colors.primary.teal,
                  }}
                >
                  {candidateData.experience || '0'}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xs,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.tertiary,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  Experience
                </Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xl,
                    fontFamily: theme.typography.fonts.bold,
                    color: theme.colors.primary.teal,
                  }}
                >
                  {candidateData.skills?.length || 0}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xs,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.tertiary,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  Skills
                </Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xl,
                    fontFamily: theme.typography.fonts.bold,
                    color: theme.colors.primary.teal,
                  }}
                >
                  {candidateData.profileCompletion || 0}%
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.sizes.xs,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.tertiary,
                    marginTop: theme.spacing.xs,
                  }}
                >
                  Profile
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <Section title="Contact Information" icon="mail-outline">
            <InfoRow icon="mail" label="Email" value={candidateData.email} />
            <InfoRow icon="call" label="Phone" value={candidateData.phone} />
            <InfoRow icon="location" label="Location" value={candidateData.location} />
            {candidateData.full_address && (
              <InfoRow icon="home" label="Full Address" value={candidateData.full_address} />
            )}
          </Section>

          {/* Bio */}
          {candidateData.bio && (
            <Section title="About" icon="document-text-outline">
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                  lineHeight: theme.typography.sizes.sm * 1.5,
                }}
              >
                {candidateData.bio}
              </Text>
            </Section>
          )}

          {/* Professional Details */}
          <Section title="Professional Details" icon="briefcase-outline">
            <InfoRow 
              icon="time" 
              label="Total Experience" 
              value={candidateData.experience} 
            />
            {candidateData.area_of_interest && (
              <InfoRow 
                icon="bulb" 
                label="Area of Interest" 
                value={candidateData.area_of_interest} 
              />
            )}
            {candidateData.function && (
              <InfoRow 
                icon="code-working" 
                label="Function" 
                value={candidateData.function} 
              />
            )}
            {candidateData.industry_nature && (
              <InfoRow 
                icon="business" 
                label="Industry" 
                value={candidateData.industry_nature} 
              />
            )}
            {candidateData.highest_education && (
              <InfoRow 
                icon="school" 
                label="Education" 
                value={candidateData.highest_education} 
              />
            )}
            {candidateData.specialization && (
              <InfoRow 
                icon="book" 
                label="Specialization" 
                value={candidateData.specialization} 
              />
            )}
          </Section>

          {/* Job Preferences */}
          <Section title="Job Preferences" icon="settings-outline">
            <InfoRow 
              icon="briefcase" 
              label="Job Type" 
              value={candidateData.job_type_preference?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
            />
            <InfoRow 
              icon="laptop" 
              label="Work Mode" 
              value={candidateData.work_mode_preference?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
            />
            <InfoRow 
              icon="timer" 
              label="Notice Period" 
              value={formatNoticePeriod(candidateData.notice_period)} 
            />
            <InfoRow 
              icon="airplane" 
              label="Willing to Relocate" 
              value={candidateData.willing_to_relocate ? 'Yes' : 'No'} 
            />
            <InfoRow 
              icon="checkmark-circle" 
              label="Availability" 
              value={candidateData.availability_status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
            />
          </Section>

          {/* Preferred Locations */}
          {candidateData.preferred_locations && candidateData.preferred_locations.length > 0 && (
            <Section title="Preferred Locations" icon="navigate-outline">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {candidateData.preferred_locations.map((location, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: theme.colors.background.accent,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.borderRadius.full,
                      marginRight: theme.spacing.sm,
                      marginBottom: theme.spacing.sm,
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
                      {typeof location === 'string' ? location : location.label || location.value}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Salary Expectations */}
          {(candidateData.current_salary || candidateData.expected_salary) && (
            <Section title="Salary Details" icon="cash-outline">
              {candidateData.current_salary && (
                <InfoRow 
                  icon="wallet" 
                  label="Current Salary" 
                  value={formatSalary(candidateData.current_salary)} 
                />
              )}
              {candidateData.expected_salary && (
                <InfoRow 
                  icon="trending-up" 
                  label="Expected Salary" 
                  value={formatSalary(candidateData.expected_salary)} 
                />
              )}
            </Section>
          )}

          {/* Social Links */}
          {(candidateData.linkedin_url || candidateData.github_url || candidateData.portfolio_url) && (
            <Section title="Online Presence" icon="link-outline">
              {candidateData.linkedin_url && (
                <TouchableOpacity
                  onPress={() => {
                    // Handle LinkedIn URL open
                    console.log('Open LinkedIn:', candidateData.linkedin_url);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="logo-linkedin"
                    size={20}
                    color={theme.colors.primary.teal}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.regular,
                      color: theme.colors.primary.teal,
                      textDecorationLine: 'underline',
                    }}
                  >
                    LinkedIn Profile
                  </Text>
                </TouchableOpacity>
              )}
              {candidateData.github_url && (
                <TouchableOpacity
                  onPress={() => {
                    // Handle GitHub URL open
                    console.log('Open GitHub:', candidateData.github_url);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="logo-github"
                    size={20}
                    color={theme.colors.primary.teal}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.regular,
                      color: theme.colors.primary.teal,
                      textDecorationLine: 'underline',
                    }}
                  >
                    GitHub Profile
                  </Text>
                </TouchableOpacity>
              )}
              {candidateData.portfolio_url && (
                <TouchableOpacity
                  onPress={() => {
                    // Handle Portfolio URL open
                    console.log('Open Portfolio:', candidateData.portfolio_url);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={theme.colors.primary.teal}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.regular,
                      color: theme.colors.primary.teal,
                      textDecorationLine: 'underline',
                    }}
                  >
                    Portfolio
                  </Text>
                </TouchableOpacity>
              )}
            </Section>
          )}

          {/* Skills */}
          {candidateData.skills && candidateData.skills.length > 0 && (
            <Section title="Skills" icon="code-slash-outline">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {candidateData.skills.map((skill, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: theme.colors.background.accent,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.borderRadius.full,
                      marginRight: theme.spacing.sm,
                      marginBottom: theme.spacing.sm,
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
                      {skill.skill_name}
                      {skill.years_of_experience > 0 && ` (${skill.years_of_experience}y)`}
                    </Text>
                    {skill.proficiency_level && (
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.xs,
                          fontFamily: theme.typography.fonts.regular,
                          color: theme.colors.text.tertiary,
                          marginTop: 2,
                        }}
                      >
                        {skill.proficiency_level}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Work Experience */}
          {candidateData.workExperience && candidateData.workExperience.length > 0 && (
            <Section title="Work Experience" icon="briefcase-outline">
              {candidateData.workExperience.map((exp, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: index < candidateData.workExperience.length - 1 ? theme.spacing.lg : 0,
                    paddingBottom: index < candidateData.workExperience.length - 1 ? theme.spacing.lg : 0,
                    borderBottomWidth: index < candidateData.workExperience.length - 1 ? 1 : 0,
                    borderBottomColor: theme.colors.border.light,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.xs }}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.base,
                          fontFamily: theme.typography.fonts.semiBold,
                          color: theme.colors.text.primary,
                        }}
                      >
                        {exp.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.sm,
                          fontFamily: theme.typography.fonts.medium,
                          color: theme.colors.text.secondary,
                          marginTop: theme.spacing.xs,
                        }}
                      >
                        {exp.company}
                      </Text>
                    </View>
                    {exp.is_current && (
                      <View
                        style={{
                          backgroundColor: theme.colors.status.success,
                          paddingHorizontal: theme.spacing.sm,
                          paddingVertical: 2,
                          borderRadius: theme.borderRadius.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: theme.typography.sizes.xs,
                            fontFamily: theme.typography.fonts.semiBold,
                            color: theme.colors.neutral.white,
                          }}
                        >
                          Current
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: theme.spacing.xs }}>
                    {exp.employment_type && (
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.xs,
                          fontFamily: theme.typography.fonts.regular,
                          color: theme.colors.text.tertiary,
                          marginRight: theme.spacing.sm,
                        }}
                      >
                        {exp.employment_type}
                      </Text>
                    )}
                    {exp.location && (
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.xs,
                          fontFamily: theme.typography.fonts.regular,
                          color: theme.colors.text.tertiary,
                          marginRight: theme.spacing.sm,
                        }}
                      >
                        • {exp.location}
                      </Text>
                    )}
                    {exp.duration && (
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.xs,
                          fontFamily: theme.typography.fonts.regular,
                          color: theme.colors.text.tertiary,
                        }}
                      >
                        • {exp.duration}
                      </Text>
                    )}
                  </View>

                  {exp.description && (
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.sm,
                        fontFamily: theme.typography.fonts.regular,
                        color: theme.colors.text.secondary,
                        marginTop: theme.spacing.sm,
                        lineHeight: theme.typography.sizes.sm * 1.5,
                      }}
                    >
                      {exp.description}
                    </Text>
                  )}
                </View>
              ))}
            </Section>
          )}

          {/* Education */}
          {candidateData.educationHistory && candidateData.educationHistory.length > 0 && (
            <Section title="Education" icon="school-outline">
              {candidateData.educationHistory.map((edu, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: index < candidateData.educationHistory.length - 1 ? theme.spacing.lg : 0,
                    paddingBottom: index < candidateData.educationHistory.length - 1 ? theme.spacing.lg : 0,
                    borderBottomWidth: index < candidateData.educationHistory.length - 1 ? 1 : 0,
                    borderBottomColor: theme.colors.border.light,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.base,
                      fontFamily: theme.typography.fonts.semiBold,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {edu.degree}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.medium,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {edu.institution}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    {edu.field_of_study && (
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.xs,
                          fontFamily: theme.typography.fonts.regular,
                          color: theme.colors.text.tertiary,
                          marginRight: theme.spacing.sm,
                        }}
                      >
                        {edu.field_of_study}
                      </Text>
                    )}
                    {edu.duration && (
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.xs,
                          fontFamily: theme.typography.fonts.regular,
                          color: theme.colors.text.tertiary,
                          marginRight: theme.spacing.sm,
                        }}
                      >
                        • {edu.duration}
                      </Text>
                    )}
                    {edu.grade && (
                      <Text
                        style={{
                          fontSize: theme.typography.sizes.xs,
                          fontFamily: theme.typography.fonts.regular,
                          color: theme.colors.text.tertiary,
                        }}
                      >
                        • {edu.grade}
                      </Text>
                    )}
                  </View>
                  {edu.description && (
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.sm,
                        fontFamily: theme.typography.fonts.regular,
                        color: theme.colors.text.secondary,
                        marginTop: theme.spacing.sm,
                        lineHeight: theme.typography.sizes.sm * 1.5,
                      }}
                    >
                      {edu.description}
                    </Text>
                  )}
                </View>
              ))}
            </Section>
          )}

          {/* Additional Info - if certifications or languages data becomes available */}
          {candidateData.certifications && candidateData.certifications.length > 0 && (
            <Section title="Certifications" icon="ribbon-outline">
              {candidateData.certifications.map((cert, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.status.success}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.regular,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    {cert}
                  </Text>
                </View>
              ))}
            </Section>
          )}

          {candidateData.languages && candidateData.languages.length > 0 && (
            <Section title="Languages" icon="language-outline">
              {candidateData.languages.map((lang, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.regular,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {lang.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.sm,
                      fontFamily: theme.typography.fonts.medium,
                      color: theme.colors.primary.teal,
                    }}
                  >
                    {lang.proficiency}
                  </Text>
                </View>
              ))}
            </Section>
          )}

          {/* Bottom padding for floating button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Action Button */}
        {candidateStatus === 'discovered' && (
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
            <TouchableOpacity
              onPress={handleSendProposal}
              style={{
                borderRadius: theme.borderRadius.lg,
                overflow: 'hidden',
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.colors.primary.teal, theme.colors.secondary.darkTeal]}
                style={{
                  paddingVertical: theme.spacing.lg,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="paper-plane"
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
                  Initiate Job Proposal
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Status message for proposal sent */}
        {(candidateStatus === 'proposal_sent' || candidateStatus === 'submitted') && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: theme.colors.primary.deepBlue,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="hourglass"
                size={18}
                color={theme.colors.neutral.white}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.neutral.white,
                }}
              >
                Job proposal sent - awaiting response
              </Text>
            </View>
          </View>
        )}

        {/* Status for other states */}
        {candidateStatus === 'under_review' && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: theme.colors.primary.deepBlue,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="eye-outline"
                size={18}
                color={theme.colors.neutral.white}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.neutral.white,
                }}
              >
                Candidate is reviewing your proposal
              </Text>
            </View>
          </View>
        )}

        {/* Send Proposal Modal */}
        <SendProposalModal
          visible={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          candidate={candidateData}
          onProposalSent={handleProposalSent}
        />
      </View>
    </>
  );
}