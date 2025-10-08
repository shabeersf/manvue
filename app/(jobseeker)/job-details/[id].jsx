import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function JobProposalDetails() {
  const { id } = useLocalSearchParams();
  const [proposalStatus, setProposalStatus] = useState('pending'); // 'pending', 'accepted', 'rejected'
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock job proposal data - replace with real API call using the id
  const [proposalData] = useState({
    id: '1',
    companyName: 'TechCorp Solutions',
    position: 'Senior React Developer',
    location: 'Mumbai, Remote',
    employmentType: 'Full-time',
    experience: '3-5 years',
    salary: '₹8,00,000 - ₹15,00,000',
    matchPercentage: 95,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    sentTime: '2 hours ago',
    description: 'We are impressed with your profile and would like to offer you the position of Senior React Developer. You will be responsible for developing and maintaining web applications using React.js and related technologies.',
    responsibilities: [
      'Develop and maintain React.js applications',
      'Collaborate with cross-functional teams to define and implement features',
      'Write clean, maintainable, and efficient code',
      'Participate in code reviews and maintain coding standards',
      'Optimize applications for maximum speed and scalability',
      'Stay up-to-date with emerging technologies and industry trends'
    ],
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of experience with React.js',
      'Strong knowledge of JavaScript ES6+',
      'Experience with state management (Redux/Context API)',
      'Familiarity with RESTful APIs',
      'Knowledge of version control systems (Git)',
      'Strong problem-solving skills and attention to detail'
    ],
    benefits: [
      'Competitive salary and performance bonuses',
      'Comprehensive health insurance',
      'Flexible working hours and remote work options',
      'Professional development opportunities',
      'Modern office environment with latest technology',
      'Team outings and company events'
    ],
    companyInfo: {
      industry: 'Information Technology',
      size: '500-1000 employees',
      founded: '2015',
      website: 'www.techcorpsolutions.com',
      about: 'TechCorp Solutions is a leading software development company specializing in web and mobile applications. We work with clients across various industries to deliver innovative technology solutions.'
    },
    proposalMessage: 'Hi! We have reviewed your profile and believe you would be a great fit for our Senior React Developer position. We are excited about the possibility of having you join our team and contribute to our innovative projects.',
    joiningDate: '2025-01-15',
    validUntil: '2025-01-10'
  });

  const handleAccept = async () => {
    setIsProcessing(true);
    // Mock API call
    setTimeout(() => {
      setIsProcessing(false);
      setProposalStatus('accepted');
      setShowAcceptModal(false);
    }, 2000);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    // Mock API call
    setTimeout(() => {
      setIsProcessing(false);
      setProposalStatus('rejected');
      setShowRejectModal(false);
    }, 2000);
  };

  const handleGoToMessages = () => {
    router.push('/jobseeker/messages');
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
        Job Proposal
      </Text>

      {/* Status indicator */}
      <View
        style={{
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.borderRadius.full,
          backgroundColor: 
            proposalStatus === 'accepted' ? theme.colors.status.success :
            proposalStatus === 'rejected' ? theme.colors.status.error :
            theme.colors.primary.orange,
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.neutral.white,
            textTransform: 'capitalize',
          }}
        >
          {proposalStatus}
        </Text>
      </View>
    </View>
  );

  // Proposal Header Card
  const ProposalHeaderCard = () => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        margin: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        opacity: proposalStatus === 'rejected' ? 0.6 : 1,
      }}
    >
      {/* Match percentage badge */}
      <View
        style={{
          position: 'absolute',
          top: theme.spacing.md,
          right: theme.spacing.md,
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
          {proposalData.matchPercentage}% Match
        </Text>
      </View>

      {/* Proposal indicator */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.background.accent,
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          alignSelf: 'flex-start',
          marginBottom: theme.spacing.md,
        }}
      >
        <Ionicons
          name="mail-outline"
          size={14}
          color={theme.colors.primary.teal}
          style={{ marginRight: theme.spacing.xs }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.primary.teal,
          }}
        >
          Job Proposal • {proposalData.sentTime}
        </Text>
      </View>

      {/* Company header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.background.accent,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.lg,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.primary.teal,
            }}
          >
            {proposalData.companyName.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: theme.typography.sizes.lg,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs,
            }}
          >
            {proposalData.position}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.primary.teal,
            }}
          >
            {proposalData.companyName}
          </Text>
        </View>
      </View>

      {/* Proposal message */}
      <View
        style={{
          backgroundColor: theme.colors.background.accent,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.primary.teal,
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.secondary,
            lineHeight: theme.typography.sizes.sm * 1.4,
            fontStyle: 'italic',
          }}
        >
          "{proposalData.proposalMessage}"
        </Text>
      </View>

      {/* Job info grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
          <Ionicons
            name="location-outline"
            size={16}
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
            {proposalData.location}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
          <Ionicons
            name="briefcase-outline"
            size={16}
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
            {proposalData.employmentType}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
          <Ionicons
            name="time-outline"
            size={16}
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
            {proposalData.experience}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
          <Ionicons
            name="cash-outline"
            size={16}
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
            {proposalData.salary}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
          <Ionicons
            name="calendar-outline"
            size={16}
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
            Join by {proposalData.joiningDate}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
          <Ionicons
            name="hourglass-outline"
            size={16}
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
            Valid until {proposalData.validUntil}
          </Text>
        </View>
      </View>

      {/* Skills */}
      <View style={{ marginTop: theme.spacing.md }}>
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}
        >
          Required Skills
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {proposalData.skills.map((skill, index) => (
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
        </View>
      </View>
    </View>
  );

  // Status Message Component
  const StatusMessage = () => {
    if (proposalStatus === 'pending') return null;

    return (
      <View
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          margin: theme.spacing.lg,
          marginTop: 0,
          borderWidth: 2,
          borderColor: proposalStatus === 'accepted' ? theme.colors.status.success : theme.colors.status.error,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: proposalStatus === 'accepted' ? theme.colors.status.success : theme.colors.status.error,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons
              name={proposalStatus === 'accepted' ? "checkmark" : "close"}
              size={28}
              color={theme.colors.neutral.white}
            />
          </View>
          
          <Text
            style={{
              fontSize: theme.typography.sizes.lg,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
              textAlign: 'center',
            }}
          >
            {proposalStatus === 'accepted' ? 'Proposal Accepted!' : 'Proposal Rejected'}
          </Text>
          
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              lineHeight: theme.typography.sizes.base * 1.4,
              marginBottom: theme.spacing.lg,
            }}
          >
            {proposalStatus === 'accepted' 
              ? `Congratulations! You have accepted the job proposal from ${proposalData.companyName}. Please check your messages for further details and next steps.`
              : `You have rejected the job proposal from ${proposalData.companyName}. This proposal is no longer active.`
            }
          </Text>

          {proposalStatus === 'accepted' && (
            <TouchableOpacity
              onPress={handleGoToMessages}
              style={{
                borderRadius: theme.borderRadius.lg,
                overflow: 'hidden',
                width: '100%',
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.colors.primary.teal, theme.colors.secondary.darkTeal]}
                style={{
                  paddingVertical: theme.spacing.md,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={18}
                  color={theme.colors.neutral.white}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontFamily: theme.typography.fonts.semiBold,
                    color: theme.colors.neutral.white,
                  }}
                >
                  Go to Messages
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Section Component
  const Section = ({ title, children }) => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        margin: theme.spacing.lg,
        marginTop: 0,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        opacity: proposalStatus === 'rejected' ? 0.6 : 1,
      }}
    >
      <Text
        style={{
          fontSize: theme.typography.sizes.md,
          fontFamily: theme.typography.fonts.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.md,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );

  // List Item Component
  const ListItem = ({ text, icon = "checkmark-circle-outline" }) => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
      <Ionicons
        name={icon}
        size={16}
        color={theme.colors.primary.teal}
        style={{ marginRight: theme.spacing.sm, marginTop: 2 }}
      />
      <Text
        style={{
          fontSize: theme.typography.sizes.sm,
          fontFamily: theme.typography.fonts.regular,
          color: theme.colors.text.secondary,
          flex: 1,
          lineHeight: theme.typography.sizes.sm * 1.4,
        }}
      >
        {text}
      </Text>
    </View>
  );

  // Accept Modal
  const AcceptModal = () => (
    <Modal
      visible={showAcceptModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAcceptModal(false)}
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
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.status.success,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              <Ionicons
                name="checkmark"
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
              Accept Job Proposal
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}
            >
              Are you sure you want to accept this job proposal from {proposalData.companyName}?
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowAcceptModal(false)}
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
              onPress={handleAccept}
              disabled={isProcessing}
              style={{
                flex: 1,
                backgroundColor: theme.colors.status.success,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              activeOpacity={0.9}
            >
              {isProcessing && (
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: theme.colors.neutral.white,
                    borderTopColor: 'transparent',
                    marginRight: theme.spacing.sm,
                  }}
                />
              )}
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.neutral.white,
                }}
              >
                {isProcessing ? 'Accepting...' : 'Accept'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Reject Modal
  const RejectModal = () => (
    <Modal
      visible={showRejectModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowRejectModal(false)}
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
                name="close"
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
              Reject Job Proposal
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}
            >
              Are you sure you want to reject this job proposal? This action cannot be undone.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowRejectModal(false)}
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
              onPress={handleReject}
              disabled={isProcessing}
              style={{
                flex: 1,
                backgroundColor: theme.colors.status.error,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              activeOpacity={0.9}
            >
              {isProcessing && (
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: theme.colors.neutral.white,
                    borderTopColor: 'transparent',
                    marginRight: theme.spacing.sm,
                  }}
                />
              )}
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.neutral.white,
                }}
              >
                {isProcessing ? 'Rejecting...' : 'Reject'}
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

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: proposalStatus === 'pending' ? 120 : 20 }}
      >
        <ProposalHeaderCard />
        
        <StatusMessage />

        {proposalStatus !== 'rejected' && (
          <>
            <Section title="Job Description">
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                  lineHeight: theme.typography.sizes.sm * 1.5,
                }}
              >
                {proposalData.description}
              </Text>
            </Section>

            <Section title="Key Responsibilities">
              {proposalData.responsibilities.map((item, index) => (
                <ListItem key={index} text={item} />
              ))}
            </Section>

            <Section title="Requirements">
              {proposalData.requirements.map((item, index) => (
                <ListItem key={index} text={item} icon="checkmark-outline" />
              ))}
            </Section>

            <Section title="Benefits & Perks">
              {proposalData.benefits.map((item, index) => (
                <ListItem key={index} text={item} icon="gift-outline" />
              ))}
            </Section>

            <Section title="About Company">
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                  lineHeight: theme.typography.sizes.sm * 1.5,
                  marginBottom: theme.spacing.md,
                }}
              >
                {proposalData.companyInfo.about}
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.text.tertiary }}>
                    Industry
                  </Text>
                  <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
                    {proposalData.companyInfo.industry}
                  </Text>
                </View>
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.text.tertiary }}>
                    Company Size
                  </Text>
                  <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
                    {proposalData.companyInfo.size}
                  </Text>
                </View>
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.text.tertiary }}>
                    Founded
                  </Text>
                  <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
                    {proposalData.companyInfo.founded}
                  </Text>
                </View>
                <View style={{ minWidth: '45%' }}>
                  <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.text.tertiary }}>
                    Website
                  </Text>
                  <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.primary.teal }}>
                    {proposalData.companyInfo.website}
                  </Text>
                </View>
              </View>
            </Section>
          </>
        )}
      </ScrollView>

      {/* Bottom Action Buttons - Only show if pending */}
      {proposalStatus === 'pending' && (
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
              onPress={() => setShowRejectModal(true)}
              style={{
                flex: 1,
                backgroundColor: theme.colors.status.error,
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="close-outline"
                size={18}
                color={theme.colors.neutral.white}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.neutral.white,
                }}
              >
                Reject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAcceptModal(true)}
              style={{
                flex: 1,
                borderRadius: theme.borderRadius.lg,
                overflow: 'hidden',
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.colors.status.success, '#0D9488']}
                style={{
                  paddingVertical: theme.spacing.md,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="checkmark-outline"
                  size={18}
                  color={theme.colors.neutral.white}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontFamily: theme.typography.fonts.semiBold,
                    color: theme.colors.neutral.white,
                  }}
                >
                  Accept
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <AcceptModal />
      <RejectModal />
    </View>
  );
}