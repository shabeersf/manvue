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
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function JobProposalDetails() {
  const { id } = useLocalSearchParams(); // application_id
  const [proposalStatus, setProposalStatus] = useState('pending');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proposalData, setProposalData] = useState(null);

  // Fetch proposal details on mount
  useEffect(() => {
    fetchProposalDetails();
  }, [id]);

  const fetchProposalDetails = async () => {
    try {
      setLoading(true);
      const result = await apiService.getApplicationDetails(parseInt(id));
      
      if (result.success) {
        setProposalData(result.data);
        setProposalStatus(result.data.proposalStatus || 'pending');
      } else {
        Alert.alert('Error', result.message || 'Failed to load proposal details');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      Alert.alert('Error', 'Something went wrong');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const result = await apiService.respondToProposal(
        parseInt(id),
        'accept',
        'I am interested in this opportunity!'
      );

      if (result.success) {
        setProposalStatus('accepted');
        setShowAcceptModal(false);
        Alert.alert('Success', result.message || 'Proposal accepted successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to accept proposal');
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const result = await apiService.respondToProposal(
        parseInt(id),
        'reject',
        'Thank you for your interest, but I am not interested at this time.'
      );

      if (result.success) {
        setProposalStatus('rejected');
        setShowRejectModal(false);
        Alert.alert('Success', result.message || 'Proposal rejected');
      } else {
        Alert.alert('Error', result.message || 'Failed to reject proposal');
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToMessages = () => {
    router.push('/jobseeker/messages');
  };

  // Loading State
  if (loading || !proposalData) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary.teal} />
        <Text style={{ 
          marginTop: theme.spacing.md,
          fontSize: theme.typography.sizes.base,
          fontFamily: theme.typography.fonts.medium,
          color: theme.colors.text.secondary 
        }}>
          Loading proposal details...
        </Text>
      </View>
    );
  }

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
            fontFamily: theme.typography.fonts.semiBold,
            color: theme.colors.primary.teal,
          }}
        >
          Proposal Received {proposalData.sentTime}
        </Text>
      </View>

      {/* Company name */}
      <Text
        style={{
          fontSize: theme.typography.sizes.xl,
          fontFamily: theme.typography.fonts.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xs,
        }}
      >
        {proposalData.companyName}
      </Text>

      {/* Position */}
      <Text
        style={{
          fontSize: theme.typography.sizes.lg,
          fontFamily: theme.typography.fonts.semiBold,
          color: theme.colors.primary.teal,
          marginBottom: theme.spacing.md,
        }}
      >
        {proposalData.position}
      </Text>

      {/* Job details row */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location-outline" size={16} color={theme.colors.text.tertiary} style={{ marginRight: theme.spacing.xs }} />
          <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
            {proposalData.location}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="briefcase-outline" size={16} color={theme.colors.text.tertiary} style={{ marginRight: theme.spacing.xs }} />
          <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
            {proposalData.employmentType}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.tertiary} style={{ marginRight: theme.spacing.xs }} />
          <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
            {proposalData.experience}
          </Text>
        </View>
      </View>

      {/* Salary */}
      {proposalData.salary && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <Ionicons name="cash-outline" size={18} color={theme.colors.primary.teal} style={{ marginRight: theme.spacing.sm }} />
          <Text style={{ fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.text.primary }}>
            {proposalData.salary}
          </Text>
        </View>
      )}

      {/* Skills */}
      {proposalData.skills && proposalData.skills.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
          {proposalData.skills.map((skill, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.colors.background.accent,
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderWidth: 1,
                borderColor: theme.colors.primary.teal,
              }}
            >
              <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.primary.teal }}>
                {skill}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Status Message Component
  const StatusMessage = () => {
    if (proposalStatus === 'accepted') {
      return (
        <View
          style={{
            backgroundColor: theme.colors.status.success + '15',
            borderWidth: 1,
            borderColor: theme.colors.status.success,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.status.success} style={{ marginRight: theme.spacing.md }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.status.success, marginBottom: 4 }}>
              Proposal Accepted!
            </Text>
            <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
              The employer has been notified. They will contact you soon.
            </Text>
            <TouchableOpacity onPress={handleGoToMessages} style={{ marginTop: theme.spacing.sm }}>
              <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.primary.teal }}>
                Go to Messages →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (proposalStatus === 'rejected') {
      return (
        <View
          style={{
            backgroundColor: theme.colors.status.error + '15',
            borderWidth: 1,
            borderColor: theme.colors.status.error,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="close-circle" size={24} color={theme.colors.status.error} style={{ marginRight: theme.spacing.md }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.status.error, marginBottom: 4 }}>
              Proposal Declined
            </Text>
            <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
              You have declined this job proposal. The employer has been notified.
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  // Proposal Message Section (Cover Letter)
  const ProposalMessage = () => {
    if (!proposalData.proposalMessage) return null;
    
    return (
      <View style={{ backgroundColor: theme.colors.background.card, marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border.light }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <Ionicons name="document-text-outline" size={20} color={theme.colors.primary.teal} style={{ marginRight: theme.spacing.sm }} />
          <Text style={{ fontSize: theme.typography.sizes.md, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.text.primary }}>
            Proposal Letter
          </Text>
        </View>
        <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary, lineHeight: theme.typography.sizes.sm * 1.6 }}>
          {proposalData.proposalMessage}
        </Text>
      </View>
    );
  };

  // Section Component
  const Section = ({ title, children }) => (
    <View style={{ backgroundColor: theme.colors.background.card, marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md, borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border.light }}>
      <Text style={{ fontSize: theme.typography.sizes.md, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.text.primary, marginBottom: theme.spacing.md }}>
        {title}
      </Text>
      {children}
    </View>
  );

  // List Item Component
  const ListItem = ({ text, icon = "arrow-forward-outline" }) => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
      <Ionicons name={icon} size={16} color={theme.colors.primary.teal} style={{ marginRight: theme.spacing.sm, marginTop: 2 }} />
      <Text style={{ flex: 1, fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary, lineHeight: theme.typography.sizes.sm * 1.5 }}>
        {text}
      </Text>
    </View>
  );

  // Accept Modal
  const AcceptModal = () => (
    <Modal visible={showAcceptModal} transparent={true} animationType="fade" onRequestClose={() => setShowAcceptModal(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg }}>
        <View style={{ backgroundColor: theme.colors.background.card, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl, width: '100%', maxWidth: 400 }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.status.success + '15', justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="checkmark-circle" size={32} color={theme.colors.status.success} />
            </View>
            <Text style={{ fontSize: theme.typography.sizes.lg, fontFamily: theme.typography.fonts.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.xs, textAlign: 'center' }}>
              Accept this Proposal?
            </Text>
            <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary, textAlign: 'center' }}>
              By accepting, you're showing interest in this position. The employer will be able to contact you directly.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowAcceptModal(false)}
              disabled={isProcessing}
              style={{ flex: 1, backgroundColor: theme.colors.neutral.lightGray, borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.text.secondary }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              disabled={isProcessing}
              style={{ flex: 1, backgroundColor: theme.colors.status.success, borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.neutral.white }}>
                {isProcessing ? 'Accepting...' : 'Yes, Accept'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Reject Modal
  const RejectModal = () => (
    <Modal visible={showRejectModal} transparent={true} animationType="fade" onRequestClose={() => setShowRejectModal(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg }}>
        <View style={{ backgroundColor: theme.colors.background.card, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl, width: '100%', maxWidth: 400 }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.status.error + '15', justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="close-circle" size={32} color={theme.colors.status.error} />
            </View>
            <Text style={{ fontSize: theme.typography.sizes.lg, fontFamily: theme.typography.fonts.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.xs, textAlign: 'center' }}>
              Decline this Proposal?
            </Text>
            <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary, textAlign: 'center' }}>
              The employer will be notified that you're not interested in this position.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowRejectModal(false)}
              disabled={isProcessing}
              style={{ flex: 1, backgroundColor: theme.colors.neutral.lightGray, borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.text.secondary }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReject}
              disabled={isProcessing}
              style={{ flex: 1, backgroundColor: theme.colors.status.error, borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing.md, alignItems: 'center' }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fonts.semiBold, color: theme.colors.neutral.white }}>
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

        <ProposalMessage />

        {proposalStatus !== 'rejected' && (
          <>
            {proposalData.description && (
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
            )}

            {proposalData.responsibilities && proposalData.responsibilities.length > 0 && (
              <Section title="Key Responsibilities">
                {proposalData.responsibilities.map((item, index) => (
                  <ListItem key={index} text={item} />
                ))}
              </Section>
            )}

            {proposalData.requirements && proposalData.requirements.length > 0 && (
              <Section title="Requirements">
                {proposalData.requirements.map((item, index) => (
                  <ListItem key={index} text={item} icon="checkmark-outline" />
                ))}
              </Section>
            )}

            {proposalData.benefits && proposalData.benefits.length > 0 && (
              <Section title="Benefits & Perks">
                {proposalData.benefits.map((item, index) => (
                  <ListItem key={index} text={item} icon="gift-outline" />
                ))}
              </Section>
            )}

            {proposalData.companyInfo && (
              <Section title="About Company">
                {proposalData.companyInfo.about && (
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
                )}
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
                  {proposalData.companyInfo.industry && (
                    <View style={{ minWidth: '45%' }}>
                      <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.text.tertiary }}>
                        Industry
                      </Text>
                      <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
                        {proposalData.companyInfo.industry}
                      </Text>
                    </View>
                  )}
                  {proposalData.companyInfo.size && (
                    <View style={{ minWidth: '45%' }}>
                      <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.text.tertiary }}>
                        Company Size
                      </Text>
                      <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
                        {proposalData.companyInfo.size}
                      </Text>
                    </View>
                  )}
                  {proposalData.companyInfo.founded && (
                    <View style={{ minWidth: '45%' }}>
                      <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.text.tertiary }}>
                        Founded
                      </Text>
                      <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.text.secondary }}>
                        {proposalData.companyInfo.founded}
                      </Text>
                    </View>
                  )}
                  {proposalData.companyInfo.website && (
                    <View style={{ minWidth: '45%' }}>
                      <Text style={{ fontSize: theme.typography.sizes.xs, fontFamily: theme.typography.fonts.medium, color: theme.colors.text.tertiary }}>
                        Website
                      </Text>
                      <Text style={{ fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fonts.regular, color: theme.colors.primary.teal }}>
                        {proposalData.companyInfo.website}
                      </Text>
                    </View>
                  )}
                </View>
              </Section>
            )}
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