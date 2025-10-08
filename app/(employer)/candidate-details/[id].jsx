import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function CandidateDetails() {
  const { id } = useLocalSearchParams();
  const [showActionModal, setShowActionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [candidateStatus, setCandidateStatus] = useState('discovered'); // 'discovered', 'proposal_sent', 'accepted', 'rejected'

  // Mock available jobs for proposal
  const [availableJobs] = useState([
    { id: '1', title: 'Senior React Developer', location: 'Mumbai, Remote' },
    { id: '2', title: 'Frontend Developer', location: 'Bangalore' },
    { id: '3', title: 'Full Stack Developer', location: 'Pune, Hybrid' },
  ]);

  // Mock candidate data - redesigned for reverse recruitment
  const [candidateData] = useState({
    id: '1',
    name: 'John Smith',
    initials: 'JS',
    position: 'Senior React Developer',
    experience: '5 years',
    location: 'Mumbai, Remote',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Redux', 'GraphQL', 'Docker'],
    education: 'B.Tech Computer Science',
    institution: 'Indian Institute of Technology, Mumbai',
    matchPercentage: 95,
    status: 'discovered', // 'discovered', 'proposal_sent', 'accepted', 'rejected'
    matchedJobTitle: 'Senior React Developer',
    discoveredTime: '2 hours ago',
    proposalSentTime: null,
    salary: '₹12L - ₹18L',
    profileCompletion: 92,
    isAvailable: true,
    lastActive: 'Active now',
    email: 'john.smith@email.com',
    phone: '+91 9876543210',
    
    // Detailed Information
    summary: 'Experienced React developer with 5+ years of expertise in building scalable web applications. Passionate about clean code, performance optimization, and modern development practices.',
    
    workExperience: [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'Tech Solutions Ltd',
        duration: '2022 - Present',
        location: 'Mumbai',
        description: 'Led a team of 4 developers in building a complex e-commerce platform using React, TypeScript, and Node.js.',
        achievements: [
          'Improved application performance by 40%',
          'Implemented automated testing reducing bugs by 60%',
          'Mentored 3 junior developers'
        ]
      },
      {
        id: '2',
        title: 'React Developer',
        company: 'StartupX',
        duration: '2020 - 2022',
        location: 'Pune',
        description: 'Developed and maintained multiple React applications for various clients.',
        achievements: [
          'Built 8+ responsive web applications',
          'Integrated 15+ third-party APIs',
          'Reduced loading time by 35%'
        ]
      }
    ],
    
    educationHistory: [
      {
        id: '1',
        degree: 'B.Tech Computer Science',
        institution: 'Indian Institute of Technology, Mumbai',
        year: '2019',
        grade: 'CGPA: 8.5/10'
      }
    ],
    
    projects: [
      {
        id: '1',
        name: 'E-commerce Dashboard',
        description: 'A comprehensive admin dashboard for managing e-commerce operations with real-time analytics.',
        technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        link: 'github.com/johnsmith/ecommerce-dashboard'
      },
      {
        id: '2',
        name: 'Task Management App',
        description: 'A collaborative task management application with real-time updates and team collaboration features.',
        technologies: ['React', 'Redux', 'Firebase', 'Material-UI'],
        link: 'github.com/johnsmith/task-manager'
      }
    ],
    
    certifications: [
      'AWS Certified Developer Associate',
      'Google Cloud Professional Developer',
      'MongoDB Certified Developer'
    ],
    
    languages: [
      { name: 'English', proficiency: 'Fluent' },
      { name: 'Hindi', proficiency: 'Native' },
      { name: 'Marathi', proficiency: 'Conversational' }
    ]
  });

  const handleSendProposal = () => {
    if (!selectedJob || !proposalMessage.trim()) {
      Alert.alert('Missing Information', 'Please select a job and write a proposal message.');
      return;
    }

    setShowProposalModal(false);
    setCandidateStatus('proposal_sent');
    setSelectedJob('');
    setProposalMessage('');
    
    Alert.alert(
      'Proposal Sent!',
      `Your job proposal has been sent to ${candidateData.name}. You'll be notified when they respond.`,
      [{ text: 'OK' }]
    );
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    setShowMessageModal(false);
    setMessageText('');
    
    Alert.alert(
      'Message Sent',
      'Your message has been sent to the candidate.',
      [{ text: 'OK' }]
    );
  };

  const handleMarkNotInterested = () => {
    setCandidateStatus('rejected');
    setShowActionModal(false);
    
    Alert.alert(
      'Candidate Marked as Not Interested',
      'This candidate has been removed from your discovery list.',
      [{ text: 'OK' }]
    );
  };

  const handleAddToShortlist = () => {
    setShowActionModal(false);
    
    Alert.alert(
      'Added to Shortlist',
      'This candidate has been added to your shortlist for future reference.',
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = () => {
    switch (candidateStatus) {
      case 'discovered': return theme.colors.primary.orange;
      case 'proposal_sent': return theme.colors.primary.deepBlue;
      case 'accepted': return theme.colors.status.success;
      case 'rejected': return theme.colors.status.error;
      default: return theme.colors.text.tertiary;
    }
  };

  const getStatusText = () => {
    switch (candidateStatus) {
      case 'discovered': return 'New Discovery';
      case 'proposal_sent': return 'Proposal Sent';
      case 'accepted': return 'Proposal Accepted';
      case 'rejected': return 'Not Interested';
      default: return 'Unknown';
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

      <TouchableOpacity
        onPress={() => setShowActionModal(true)}
        style={{
          padding: theme.spacing.sm,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.background.accent,
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color={theme.colors.primary.teal}
        />
      </TouchableOpacity>
    </View>
  );

  // Candidate Header Card
  const CandidateHeaderCard = () => (
    <View
      style={{
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        margin: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
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
          {candidateData.matchPercentage}% Match
        </Text>
      </View>

      {/* Candidate header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
        <View style={{ position: 'relative', marginRight: theme.spacing.md }}>
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: candidateStatus === 'discovered' 
                ? theme.colors.primary.orange 
                : theme.colors.primary.teal,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: theme.colors.background.accent,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.lg,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.neutral.white,
              }}
            >
              {candidateData.initials}
            </Text>
          </View>

          {candidateData.isAvailable && (
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: theme.colors.status.success,
                borderWidth: 2,
                borderColor: theme.colors.background.card,
              }}
            />
          )}
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
            {candidateData.name}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.primary.teal,
              marginBottom: theme.spacing.xs,
            }}
          >
            {candidateData.position}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.medium,
              color: getStatusColor(),
              marginBottom: theme.spacing.xs,
            }}
          >
            Matches: {candidateData.matchedJobTitle}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
            }}
          >
            {candidateData.lastActive}
          </Text>
        </View>
      </View>

      {/* Status */}
      <View
        style={{
          backgroundColor: `${getStatusColor()}15`,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={getStatusColor()}
          style={{ marginRight: theme.spacing.sm }}
        />
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.medium,
            color: getStatusColor(),
          }}
        >
          Status: {getStatusText()} • Discovered {candidateData.discoveredTime}
        </Text>
      </View>

      {/* Contact Info */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md, gap: theme.spacing.md }}>
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
            {candidateData.location}
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
            {candidateData.experience}
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
            {candidateData.salary}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '45%' }}>
          <Ionicons
            name="school-outline"
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
            {candidateData.education}
          </Text>
        </View>
      </View>

      {/* Skills */}
      <View>
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}
        >
          Skills
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {candidateData.skills.map((skill, index) => (
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

  // Experience Item Component
  const ExperienceItem = ({ item }) => (
    <View
      style={{
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
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
        {item.title}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.medium,
            color: theme.colors.primary.teal,
            marginRight: theme.spacing.md,
          }}
        >
          {item.company}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.secondary,
          }}
        >
          {item.duration} • {item.location}
        </Text>
      </View>
      <Text
        style={{
          fontSize: theme.typography.sizes.sm,
          fontFamily: theme.typography.fonts.regular,
          color: theme.colors.text.secondary,
          lineHeight: theme.typography.sizes.sm * 1.4,
          marginBottom: theme.spacing.sm,
        }}
      >
        {item.description}
      </Text>
      {item.achievements && (
        <View>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs,
            }}
          >
            Key Achievements:
          </Text>
          {item.achievements.map((achievement, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: theme.spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  color: theme.colors.primary.teal,
                  marginRight: theme.spacing.xs,
                }}
              >
                •
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                  flex: 1,
                }}
              >
                {achievement}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Action Modal (Three Dots Menu)
  const ActionModal = () => (
    <Modal
      visible={showActionModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowActionModal(false)}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
        }}
        activeOpacity={1}
        onPress={() => setShowActionModal(false)}
      >
        <View
          style={{
            backgroundColor: theme.colors.background.card,
            borderRadius: theme.borderRadius.xl,
            width: '100%',
            maxWidth: 300,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.md,
                fontFamily: theme.typography.fonts.semiBold,
                color: theme.colors.text.primary,
                textAlign: 'center',
              }}
            >
              Candidate Actions
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setShowActionModal(false);
              setShowMessageModal(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.light,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={theme.colors.primary.teal}
              style={{ marginRight: theme.spacing.md }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.text.primary,
              }}
            >
              Send Message
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAddToShortlist}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.light,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="star-outline"
              size={20}
              color={theme.colors.status.success}
              style={{ marginRight: theme.spacing.md }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.status.success,
              }}
            >
              Add to Shortlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMarkNotInterested}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: theme.spacing.lg,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={theme.colors.status.error}
              style={{ marginRight: theme.spacing.md }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.status.error,
              }}
            >
              Not Interested
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Send Proposal Modal
  const SendProposalModal = () => (
  <Modal
    visible={showProposalModal}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowProposalModal(false)}
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
          maxHeight: '80%',
        }}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: theme.typography.sizes.lg,
            fontFamily: theme.typography.fonts.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
          }}
        >
          Send Job Proposal
        </Text>

        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
          }}
        >
          Send a personalized job proposal to {candidateData.name}
        </Text>

        {/* Job Selection */}
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}
        >
          Select Job Position
        </Text>

        <ScrollView
          style={{ maxHeight: 120, marginBottom: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {availableJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => setSelectedJob(job.id)}
              style={{
                backgroundColor:
                  selectedJob === job.id
                    ? theme.colors.background.accent
                    : theme.colors.neutral.lightGray,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
                borderWidth: selectedJob === job.id ? 2 : 1,
                borderColor:
                  selectedJob === job.id
                    ? theme.colors.primary.teal
                    : theme.colors.border.light,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.text.primary,
                }}
              >
                {job.title}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                }}
              >
                {job.location}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Proposal Message */}
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}
        >
          Proposal Message
        </Text>

        <TextInput
          value={proposalMessage}
          onChangeText={setProposalMessage}
          placeholder="Write a personalized message..."
          placeholderTextColor={theme.colors.text.placeholder}
          multiline
          numberOfLines={4}
          style={{
            backgroundColor: theme.colors.neutral.lightGray,
            borderRadius: theme.borderRadius.lg,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            fontSize: theme.typography.sizes.base,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg,
            textAlignVertical: 'top',
            height: 100,
          }}
        />

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <TouchableOpacity
            onPress={() => setShowProposalModal(false)}
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
            onPress={handleSendProposal}
            disabled={!selectedJob || !proposalMessage.trim()}
            style={{
              flex: 1,
              borderRadius: theme.borderRadius.lg,
              overflow: 'hidden',
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                selectedJob && proposalMessage.trim()
                  ? [theme.colors.primary.teal, theme.colors.secondary.darkTeal]
                  : [theme.colors.neutral.mediumGray, theme.colors.neutral.mediumGray]
              }
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
                Send Proposal
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);


  // Message Modal
  const MessageModal = () => (
    <Modal
      visible={showMessageModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMessageModal(false)}
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
          <Text
            style={{
              fontSize: theme.typography.sizes.lg,
              fontFamily: theme.typography.fonts.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
              textAlign: 'center',
            }}
          >
            Send Message
          </Text>

          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginBottom: theme.spacing.lg,
            }}
          >
            Send a message to {candidateData.name}
          </Text>

          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.text.placeholder}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: theme.colors.neutral.lightGray,
              borderRadius: theme.borderRadius.lg,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.md,
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.lg,
              textAlignVertical: 'top',
              height: 100,
            }}
          />

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowMessageModal(false)}
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
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
              style={{
                flex: 1,
                borderRadius: theme.borderRadius.lg,
                overflow: 'hidden',
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={messageText.trim() 
                  ? [theme.colors.primary.teal, theme.colors.secondary.darkTeal]
                  : [theme.colors.neutral.mediumGray, theme.colors.neutral.mediumGray]}
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
                  Send
                </Text>
              </LinearGradient>
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
        contentContainerStyle={{ paddingBottom: candidateStatus === 'discovered' ? 120 : 20 }}
      >
        <CandidateHeaderCard />

        <Section title="Summary" icon="document-text-outline">
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.sizes.sm * 1.5,
            }}
          >
            {candidateData.summary}
          </Text>
        </Section>

        <Section title="Work Experience" icon="briefcase-outline">
          {candidateData.workExperience.map((item) => (
            <ExperienceItem key={item.id} item={item} />
          ))}
        </Section>

        <Section title="Education" icon="school-outline">
          {candidateData.educationHistory.map((item) => (
            <View key={item.id} style={{ marginBottom: theme.spacing.md }}>
              <Text
                style={{
                  fontSize: theme.typography.sizes.base,
                  fontFamily: theme.typography.fonts.semiBold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {item.degree}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.medium,
                  color: theme.colors.primary.teal,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {item.institution}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                }}
              >
                {item.year} • {item.grade}
              </Text>
            </View>
          ))}
        </Section>

        <Section title="Projects" icon="code-slash-outline">
          {candidateData.projects.map((item) => (
            <View
              key={item.id}
              style={{
                marginBottom: theme.spacing.md,
                paddingBottom: theme.spacing.md,
                borderBottomWidth: 1,
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
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                  lineHeight: theme.typography.sizes.sm * 1.4,
                  marginBottom: theme.spacing.sm,
                }}
              >
                {item.description}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm }}>
                {item.technologies.map((tech, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: theme.colors.background.accent,
                      borderRadius: theme.borderRadius.sm,
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: theme.spacing.xs,
                      marginRight: theme.spacing.xs,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.xs,
                        fontFamily: theme.typography.fonts.medium,
                        color: theme.colors.primary.teal,
                      }}
                    >
                      {tech}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.primary.teal,
                }}
              >
                {item.link}
              </Text>
            </View>
          ))}
        </Section>

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
                name="checkmark-circle-outline"
                size={16}
                color={theme.colors.status.success}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text
                style={{
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
      </ScrollView>

      {/* Bottom Send Proposal Button - Only show if discovered */}
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
            onPress={() => setShowProposalModal(true)}
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
                Send Job Proposal
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Status message for non-discovered candidates */}
      {candidateStatus === 'proposal_sent' && (
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

      {candidateStatus === 'accepted' && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.status.success,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => router.push(`/employer/messages/${candidateData.id}`)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubbles"
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
              Proposal accepted - Start conversation
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ActionModal />
      <SendProposalModal />
      <MessageModal />
    </View>
  );
}