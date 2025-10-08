import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function MessageDetails() {
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const flatListRef = useRef(null);

  // Mock company data based on ID
  const [companyData] = useState({
    id: '1',
    name: 'TechCorp Solutions',
    initial: 'TC',
    isOnline: true,
    lastSeen: 'online',
    isBlocked: false,
  });

  // Mock messages data
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! Thank you for accepting our job proposal. We are excited to have you join our team.',
      timestamp: '2024-01-15 10:30',
      sender: 'company',
      type: 'text',
      status: 'read',
    },
    {
      id: '2',
      text: 'We would like to schedule an initial discussion about your role and responsibilities.',
      timestamp: '2024-01-15 10:32',
      sender: 'company',
      type: 'text',
      status: 'read',
    },
    {
      id: '3',
      text: 'Thank you for reaching out! I am very excited about this opportunity.',
      timestamp: '2024-01-15 10:45',
      sender: 'user',
      type: 'text',
      status: 'sent',
    },
    {
      id: '4',
      text: 'Could you please share some more details about the team structure and the projects I would be working on?',
      timestamp: '2024-01-15 10:46',
      sender: 'user',
      type: 'text',
      status: 'read',
    },
    {
      id: '5',
      text: 'Absolutely! Please find the detailed job description and team information attached.',
      timestamp: '2024-01-15 11:15',
      sender: 'company',
      type: 'file',
      fileName: 'Job_Description_Senior_React_Developer.pdf',
      fileSize: '245 KB',
      status: 'read',
    },
    {
      id: '6',
      text: 'Could you also share your updated CV so we can prepare for the discussion?',
      timestamp: '2024-01-15 11:16',
      sender: 'company',
      type: 'text',
      status: 'read',
    },
  ]);

  useEffect(() => {
    // Scroll to bottom when component mounts
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
  }, []);

  const sendMessage = () => {
    if (messageText.trim() && !isBlocked) {
      const newMessage = {
        id: Date.now().toString(),
        text: messageText.trim(),
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        sender: 'user',
        type: 'text',
        status: 'sent',
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Scroll to bottom
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);

      // Simulate company typing and response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Add a sample response
        const response = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. We will get back to you shortly.',
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          sender: 'company',
          type: 'text',
          status: 'sent',
        };
        setMessages(prev => [...prev, response]);
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }, 2000);
    }
  };

  const handleFileUpload = () => {
    if (isBlocked) return;
    
    Alert.alert(
      'Upload CV',
      'Choose an option',
      [
        { text: 'Choose from Files', onPress: () => uploadFromFiles() },
        { text: 'Take Photo', onPress: () => uploadFromCamera() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadFromFiles = () => {
    setIsSendingFile(true);
    // Simulate file upload
    setTimeout(() => {
      const fileMessage = {
        id: Date.now().toString(),
        text: 'CV_John_Smith_Updated.pdf',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        sender: 'user',
        type: 'file',
        fileName: 'CV_John_Smith_Updated.pdf',
        fileSize: '1.2 MB',
        status: 'sent',
      };
      setMessages(prev => [...prev, fileMessage]);
      setIsSendingFile(false);
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }, 2000);
  };

  const uploadFromCamera = () => {
    setIsSendingFile(true);
    // Simulate camera capture and upload
    setTimeout(() => {
      const fileMessage = {
        id: Date.now().toString(),
        text: 'CV_Photo_Capture.jpg',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        sender: 'user',
        type: 'file',
        fileName: 'CV_Photo_Capture.jpg',
        fileSize: '2.8 MB',
        status: 'sent',
      };
      setMessages(prev => [...prev, fileMessage]);
      setIsSendingFile(false);
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }, 3000);
  };

  const handleBlockCompany = () => {
    setIsBlocked(true);
    setShowBlockModal(false);
    setShowOptions(false);
    Alert.alert(
      'Company Blocked',
      `You have blocked ${companyData.name}. You will no longer receive messages from them.`,
      [{ text: 'OK' }]
    );
  };

  const handleReportCompany = () => {
    setShowReportModal(false);
    setShowOptions(false);
    Alert.alert(
      'Report Submitted',
      `Thank you for reporting ${companyData.name}. We will review your report and take appropriate action.`,
      [{ text: 'OK' }]
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
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
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.colors.background.accent,
            marginRight: theme.spacing.md,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={theme.colors.primary.teal}
          />
        </TouchableOpacity>

        <View style={{ position: 'relative', marginRight: theme.spacing.md }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.background.accent,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.bold,
                color: theme.colors.primary.teal,
              }}
            >
              {companyData.initial}
            </Text>
          </View>

          {companyData.isOnline && !isBlocked && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: 5,
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
              fontSize: theme.typography.sizes.base,
              fontFamily: theme.typography.fonts.semiBold,
              color: theme.colors.text.primary,
            }}
            numberOfLines={1}
          >
            {companyData.name}
          </Text>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: isBlocked 
                ? theme.colors.status.error 
                : companyData.isOnline 
                  ? theme.colors.status.success 
                  : theme.colors.text.tertiary,
            }}
          >
            {isBlocked ? 'Blocked' : companyData.lastSeen}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setShowOptions(true)}
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

  // Message Item Component
  const MessageItem = ({ item }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.xs,
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <View
          style={{
            maxWidth: '80%',
            backgroundColor: isUser 
              ? theme.colors.primary.teal 
              : theme.colors.background.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            borderWidth: isUser ? 0 : 1,
            borderColor: theme.colors.border.light,
            borderTopRightRadius: isUser ? theme.borderRadius.sm : theme.borderRadius.lg,
            borderTopLeftRadius: isUser ? theme.borderRadius.lg : theme.borderRadius.sm,
          }}
        >
          {item.type === 'file' ? (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: theme.spacing.xs,
                }}
              >
                <Ionicons
                  name="document-attach"
                  size={18}
                  color={isUser ? theme.colors.neutral.white : theme.colors.primary.teal}
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontFamily: theme.typography.fonts.semiBold,
                    color: isUser ? theme.colors.neutral.white : theme.colors.text.primary,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {item.fileName}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  fontFamily: theme.typography.fonts.regular,
                  color: isUser ? 'rgba(255,255,255,0.8)' : theme.colors.text.tertiary,
                }}
              >
                {item.fileSize}
              </Text>
            </View>
          ) : (
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.regular,
                color: isUser ? theme.colors.neutral.white : theme.colors.text.primary,
                lineHeight: theme.typography.sizes.base * 1.4,
              }}
            >
              {item.text}
            </Text>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.xs,
            gap: theme.spacing.xs,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.xs,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.tertiary,
            }}
          >
            {formatTime(item.timestamp)}
          </Text>
          
          {isUser && (
            <Ionicons
              name={
                item.status === 'sent' ? 'checkmark' :
                item.status === 'delivered' ? 'checkmark-done-outline' :
                'checkmark-done'
              }
              size={12}
              color={
                item.status === 'read' ? theme.colors.primary.teal : theme.colors.text.tertiary
              }
            />
          )}
        </View>
      </View>
    );
  };

  // Typing Indicator
  const TypingIndicator = () => (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xs,
        alignItems: 'flex-start',
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          borderTopLeftRadius: theme.borderRadius.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.text.tertiary,
                  opacity: 0.6,
                }}
              />
            ))}
          </View>
          <Text
            style={{
              fontSize: theme.typography.sizes.sm,
              fontFamily: theme.typography.fonts.regular,
              color: theme.colors.text.tertiary,
              marginLeft: theme.spacing.sm,
            }}
          >
            typing...
          </Text>
        </View>
      </View>
    </View>
  );

  // Options Modal
  const OptionsModal = () => (
    <Modal
      visible={showOptions}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowOptions(false)}
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
        onPress={() => setShowOptions(false)}
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
              Company Options
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setShowOptions(false);
              setShowBlockModal(true);
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
              name="ban-outline"
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
              Block Company
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowOptions(false);
              setShowReportModal(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: theme.spacing.lg,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="flag-outline"
              size={20}
              color={theme.colors.status.warning}
              style={{ marginRight: theme.spacing.md }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.status.warning,
              }}
            >
              Report Company
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Block Modal
  const BlockModal = () => (
    <Modal
      visible={showBlockModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowBlockModal(false)}
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
                name="ban"
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
              Block {companyData.name}?
            </Text>
            <Text
              style={{
                fontSize: theme.typography.sizes.base,
                fontFamily: theme.typography.fonts.regular,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                lineHeight: theme.typography.sizes.base * 1.4,
              }}
            >
              You will no longer receive messages from this company. They won't be notified that you blocked them.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setShowBlockModal(false)}
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
              onPress={handleBlockCompany}
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
                Block
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Report Modal
  const ReportModal = () => {
    const [selectedReason, setSelectedReason] = useState('');
    const reportReasons = [
      'Inappropriate behavior',
      'Spam or unwanted messages',
      'Fake job posting',
      'Harassment',
      'Scam or fraud',
      'Other'
    ];

    return (
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
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
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: theme.colors.status.warning,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: theme.spacing.md,
                }}
              >
                <Ionicons
                  name="flag"
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
                Report {companyData.name}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.sizes.sm,
                  fontFamily: theme.typography.fonts.regular,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                Help us understand what's happening
              </Text>
            </View>

            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.md,
              }}
            >
              Why are you reporting this company?
            </Text>

            <View style={{ marginBottom: theme.spacing.lg }}>
              {reportReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedReason(reason)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: index < reportReasons.length - 1 ? 1 : 0,
                    borderBottomColor: theme.colors.border.light,
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: selectedReason === reason 
                        ? theme.colors.primary.teal 
                        : theme.colors.border.medium,
                      backgroundColor: selectedReason === reason 
                        ? theme.colors.primary.teal 
                        : 'transparent',
                      marginRight: theme.spacing.md,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {selectedReason === reason && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.colors.neutral.white,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: theme.typography.sizes.base,
                      fontFamily: theme.typography.fonts.regular,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <TouchableOpacity
                onPress={() => setShowReportModal(false)}
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
                onPress={handleReportCompany}
                disabled={!selectedReason}
                style={{
                  flex: 1,
                  backgroundColor: selectedReason 
                    ? theme.colors.status.warning 
                    : theme.colors.neutral.mediumGray,
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
                  Report
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.card}
      />

      <Header />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => <MessageItem item={item} />}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Input Area */}
        {!isBlocked && (
          <View
            style={{
              backgroundColor: theme.colors.background.card,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border.light,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: theme.spacing.sm,
              }}
            >
              {/* File Upload Button */}
              <TouchableOpacity
                onPress={handleFileUpload}
                disabled={isSendingFile}
                style={{
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  backgroundColor: isSendingFile 
                    ? theme.colors.neutral.mediumGray
                    : theme.colors.background.accent,
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isSendingFile ? "hourglass-outline" : "attach-outline"}
                  size={20}
                  color={isSendingFile 
                    ? theme.colors.neutral.white
                    : theme.colors.primary.teal}
                />
              </TouchableOpacity>

              {/* Text Input */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.neutral.lightGray,
                  borderRadius: theme.borderRadius.lg,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  maxHeight: 100,
                }}
              >
                <TextInput
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder="Type your message..."
                  placeholderTextColor={theme.colors.text.placeholder}
                  multiline
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontFamily: theme.typography.fonts.regular,
                    color: theme.colors.text.primary,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!messageText.trim()}
                style={{
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  overflow: 'hidden',
                }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={messageText.trim() 
                    ? [theme.colors.primary.teal, theme.colors.secondary.darkTeal]
                    : [theme.colors.neutral.mediumGray, theme.colors.neutral.mediumGray]}
                  style={{
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.full,
                  }}
                >
                  <Ionicons
                    name="send"
                    size={18}
                    color={theme.colors.neutral.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Blocked State */}
        {isBlocked && (
          <View
            style={{
              backgroundColor: theme.colors.status.error,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="ban"
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
                You have blocked this company
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      <OptionsModal />
      <BlockModal />
      <ReportModal />
    </View>
  );
}