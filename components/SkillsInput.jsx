import CustomInput from '@/components/CustomInput';
import theme from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SkillsInput = ({
  skills = [],
  onSkillsChange,
  label = 'Skills (Add up to 10 skills)',
  placeholder = 'Type a skill...',
  maxSkills = 10,
  maxSkillLength = 30,
  required = false,
  error = null,
  style,
}) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    const skillText = newSkill.trim();

    if (!skillText) return;
    if (skills.length >= maxSkills) return;

    // Check if skill already exists (case insensitive)
    const existingSkill = skills.find(skill =>
      (typeof skill === 'string' ? skill : skill.skill_name)
        .toLowerCase() === skillText.toLowerCase()
    );

    if (existingSkill) return;

    // Create skill object (consistent with API format)
    const newSkillObj = {
      skill_name: skillText,
      proficiency_level: 'intermediate' // Default proficiency
    };

    onSkillsChange([...skills, newSkillObj]);
    setNewSkill('');
  };

  const removeSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onSkillsChange(updatedSkills);
  };

  const getSkillName = (skill) => {
    return typeof skill === 'string' ? skill : skill.skill_name || skill;
  };

  const handleSubmitEditing = () => {
    if (newSkill.trim() && skills.length < maxSkills && !skills.find(s =>
      getSkillName(s).toLowerCase() === newSkill.trim().toLowerCase()
    )) {
      addSkill();
    }
  };

  return (
    <View style={[{ marginBottom: theme.spacing.lg }, style]}>
      {/* Label */}
      <Text
        style={{
          fontSize: theme.typography.sizes.sm,
          fontFamily: theme.typography.fonts.medium,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.xs,
        }}
      >
        {label} {required && '*'}
      </Text>

      {/* Add Skill Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: theme.spacing.md,
        }}
      >
        <CustomInput
          value={newSkill}
          onChangeText={setNewSkill}
          placeholder={placeholder}
          style={{ flex: 1, marginBottom: 0, marginRight: theme.spacing.sm }}
          maxLength={maxSkillLength}
          returnKeyType="done"
          blurOnSubmit={false}
          onSubmitEditing={handleSubmitEditing}
        />
        <TouchableOpacity
          onPress={addSkill}
          disabled={!newSkill.trim() || skills.length >= maxSkills}
          style={{
            backgroundColor:
              newSkill.trim() && skills.length < maxSkills
                ? theme.colors.primary.teal
                : theme.colors.neutral.mediumGray,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.sm,
            justifyContent: "center",
            alignItems: "center",
            minWidth: 50,
            height: 50,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={theme.colors.neutral.white} />
        </TouchableOpacity>
      </View>

      {/* Skills Tags */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: theme.spacing.sm,
        }}
      >
        {skills.map((skill, index) => (
          <View
            key={`skill-${index}-${getSkillName(skill)}`}
            style={{
              backgroundColor: theme.colors.background.accent,
              borderRadius: theme.borderRadius.full,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
              marginRight: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.primary.teal,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontFamily: theme.typography.fonts.medium,
                color: theme.colors.primary.teal,
                marginRight: theme.spacing.xs,
              }}
            >
              {getSkillName(skill)}
            </Text>
            <TouchableOpacity
              onPress={() => removeSkill(index)}
              activeOpacity={0.7}
              style={{
                padding: 2, // Extra touch area
              }}
            >
              <Ionicons
                name="close"
                size={14}
                color={theme.colors.primary.teal}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Skills count */}
      <Text
        style={{
          fontSize: theme.typography.sizes.xs,
          fontFamily: theme.typography.fonts.regular,
          color: theme.colors.text.tertiary,
          textAlign: "right",
        }}
      >
        {skills.length}/{maxSkills} skills added
      </Text>

      {/* Error message */}
      {error && (
        <Text
          style={{
            fontSize: theme.typography.sizes.xs,
            fontFamily: theme.typography.fonts.regular,
            color: theme.colors.status.error,
            marginTop: theme.spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default SkillsInput;