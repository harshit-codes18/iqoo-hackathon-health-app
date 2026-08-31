import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/card';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatChip } from '@/components/ui/stat-chip';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sampleProfiles } from '../../sample-data/sample-profiles';

export default function FamilyScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [selectedProfileId, setSelectedProfileId] = useState(sampleProfiles[0].id);

  const selectedProfile = sampleProfiles.find((p) => p.id === selectedProfileId)!;
  const latestReport = selectedProfile.reports[selectedProfile.reports.length - 1];

  const handleProfileSelect = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    setSelectedProfileId(id);
  };

  const normalTestsCount = latestReport.tests.filter((t) => t.severity === 'normal').length;
  const flaggedTestsCount = latestReport.tests.length - normalTestsCount;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={{
        padding: Spacing.lg,
        paddingTop: insets.top + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xxl,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.headerIconBadge, { backgroundColor: themeColors.primaryLight }]}>
            <MaterialIcons name="people" size={24} color={themeColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.mainHeading, { color: themeColors.textPrimary }]}>
              Family Health Vault
            </Text>
            <Text style={[styles.subHeading, { color: themeColors.textSecondary }]}>
              Longitudinal biomarker history and medical records
            </Text>
          </View>
        </View>

        {/* Member Selector Tabs */}
        <View style={styles.memberTabsRow}>
          {sampleProfiles.map((profile) => {
            const isActive = selectedProfileId === profile.id;
            return (
              <Pressable
                key={profile.id}
                onPress={() => handleProfileSelect(profile.id)}
                style={({ pressed }) => [
                  styles.memberTabButton,
                  {
                    backgroundColor: isActive ? themeColors.primary : themeColors.surface,
                    borderColor: isActive ? themeColors.primary : themeColors.border,
                  },
                  pressed && styles.pressedOpacity,
                ]}
              >
                <View
                  style={[
                    styles.memberAvatarCircle,
                    {
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : themeColors.surfaceSubtle,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={profile.id === 'dad' ? 'face' : 'face-3'}
                    size={18}
                    color={isActive ? '#FFFFFF' : themeColors.primary}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.memberNameText,
                      { color: isActive ? '#FFFFFF' : themeColors.textPrimary },
                    ]}
                  >
                    {profile.name}
                  </Text>
                  <Text
                    style={[
                      styles.memberRelationText,
                      { color: isActive ? 'rgba(255,255,255,0.8)' : themeColors.textSecondary },
                    ]}
                  >
                    {profile.relation}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Member Profile Summary Card */}
      <Card
        variant="default"
        elevation="sm"
        style={styles.profileSummaryCard}
      >
        <View style={styles.profileSummaryHeader}>
          <View
            style={[
              styles.largeAvatarCircle,
              { backgroundColor: themeColors.primaryLight },
            ]}
          >
            <MaterialIcons
              name={selectedProfile.id === 'dad' ? 'face' : 'face-3'}
              size={28}
              color={themeColors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.profileNameRow}>
              <Text style={[styles.profileName, { color: themeColors.textPrimary }]}>
                {selectedProfile.name}
              </Text>
              <View
                style={[
                  styles.relationBadge,
                  {
                    backgroundColor: themeColors.surfaceSubtle,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text style={[styles.relationBadgeText, { color: themeColors.textSecondary }]}>
                  {selectedProfile.relation}
                </Text>
              </View>
            </View>
            <Text style={[styles.profileMeta, { color: themeColors.textSecondary }]}>
              {selectedProfile.reports.length} {selectedProfile.reports.length === 1 ? 'Report' : 'Reports'} on file • Latest: {latestReport.date}
            </Text>
          </View>
        </View>

        {/* Biomarker Status Summary */}
        <View style={styles.profileStatChipsRow}>
          <StatChip
            label="Total Tests"
            value={latestReport.tests.length}
            variant="default"
            size="sm"
          />
          <StatChip
            label="In Range"
            value={normalTestsCount}
            variant="success"
            icon={<MaterialIcons name="check-circle" size={12} color={themeColors.success} />}
            size="sm"
          />
          {flaggedTestsCount > 0 ? (
            <StatChip
              label="Flagged"
              value={flaggedTestsCount}
              variant="warning"
              icon={<MaterialIcons name="warning" size={12} color={themeColors.warning} />}
              size="sm"
            />
          ) : (
            <StatChip
              label="Optimal"
              value="100%"
              variant="success"
              size="sm"
            />
          )}
        </View>
      </Card>

      {/* Latest Report Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <MaterialIcons name="event-note" size={20} color={themeColors.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Latest Lab Report
            </Text>
          </View>
          <View
            style={[
              styles.dateTag,
              {
                backgroundColor: themeColors.primaryLight,
                borderColor: themeColors.border,
              },
            ]}
          >
            <MaterialIcons name="calendar-today" size={12} color={themeColors.primary} />
            <Text style={[styles.dateTagText, { color: themeColors.primary }]}>
              {latestReport.date}
            </Text>
          </View>
        </View>

        {/* Test Cards List */}
        <View style={styles.testsList}>
          {latestReport.tests.map((test, i) => (
            <Card
              key={i}
              variant="default"
              elevation="sm"
              style={styles.testCard}
            >
              {/* Card Header */}
              <View style={styles.testCardHeader}>
                <Text style={[styles.testName, { color: themeColors.textPrimary }]}>
                  {test.name}
                </Text>
                <SeverityBadge severity={test.severity} size="sm" />
              </View>

              {/* Metric Grid */}
              <View
                style={[
                  styles.metricGrid,
                  {
                    backgroundColor: themeColors.surfaceSubtle,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.metricCol}>
                  <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>
                    RECORDED VALUE
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      {
                        color:
                          test.severity === 'high' || test.severity === 'low'
                            ? themeColors.danger
                            : test.severity === 'mild'
                            ? themeColors.warning
                            : themeColors.textPrimary,
                      },
                    ]}
                  >
                    {test.value}
                  </Text>
                </View>

                <View style={[styles.metricDivider, { backgroundColor: themeColors.border }]} />

                <View style={styles.metricCol}>
                  <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>
                    REFERENCE RANGE
                  </Text>
                  <Text style={[styles.metricRange, { color: themeColors.textSecondary }]}>
                    {test.referenceRange || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* AI Clinical Summary Box */}
              {test.explanation ? (
                <View
                  style={[
                    styles.explanationBox,
                    {
                      backgroundColor: themeColors.surfaceMuted,
                      borderLeftColor:
                        test.severity === 'normal'
                          ? themeColors.success
                          : test.severity === 'mild'
                          ? themeColors.warning
                          : themeColors.danger,
                    },
                  ]}
                >
                  <Text style={[styles.explanationText, { color: themeColors.textPrimary }]}>
                    {test.explanation}
                  </Text>
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      </View>

      {/* Report History Timeline */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <MaterialIcons name="history" size={20} color={themeColors.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Report History ({selectedProfile.reports.length})
            </Text>
          </View>
        </View>

        <View style={styles.historyList}>
          {selectedProfile.reports.map((report, i) => {
            const isLatest = i === selectedProfile.reports.length - 1;
            const flaggedInReport = report.tests.filter((t) => t.severity !== 'normal').length;

            return (
              <View
                key={i}
                style={[
                  styles.historyCard,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: isLatest ? themeColors.primary : themeColors.border,
                  },
                ]}
              >
                <View style={styles.historyCardLeft}>
                  <View
                    style={[
                      styles.historyTimelineDot,
                      {
                        backgroundColor: isLatest ? themeColors.primary : themeColors.borderStrong,
                      },
                    ]}
                  />
                  <View>
                    <View style={styles.historyDateRow}>
                      <Text style={[styles.historyDateText, { color: themeColors.textPrimary }]}>
                        {report.date}
                      </Text>
                      {isLatest && (
                        <View
                          style={[
                            styles.latestBadge,
                            { backgroundColor: themeColors.primaryLight },
                          ]}
                        >
                          <Text style={[styles.latestBadgeText, { color: themeColors.primary }]}>
                            LATEST
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.historySubText, { color: themeColors.textSecondary }]}>
                      {report.tests.length} tests analyzed
                      {flaggedInReport > 0
                        ? ` • ${flaggedInReport} flagged biomarker${flaggedInReport > 1 ? 's' : ''}`
                        : ' • All in range'}
                    </Text>
                  </View>
                </View>

                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={flaggedInReport > 0 ? themeColors.warning : themeColors.success}
                />
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainHeading: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.xxl,
  },
  subHeading: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs + 3,
    marginTop: 2,
  },
  memberTabsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  memberTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  memberAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberNameText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  memberRelationText: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.medium,
    marginTop: 1,
  },
  profileSummaryCard: {
    padding: Spacing.md + 2,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
  },
  profileSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  largeAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  profileName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  relationBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  relationBadgeText: {
    fontSize: Typography.sizes.xs - 2,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  profileMeta: {
    fontSize: Typography.sizes.xs,
  },
  profileStatChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xxs + 2,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  dateTagText: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.bold,
  },
  testsList: {
    gap: Spacing.md,
  },
  testCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  testName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    flex: 1,
    lineHeight: 22,
  },
  metricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metricCol: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 32,
    marginHorizontal: Spacing.md,
  },
  metricLabel: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  metricRange: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  explanationBox: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    marginTop: Spacing.xs,
  },
  explanationText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm + 2,
  },
  historyList: {
    gap: Spacing.sm,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  historyTimelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  historyDateText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  latestBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
  },
  latestBadgeText: {
    fontSize: Typography.sizes.xs - 3,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  historySubText: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  pressedOpacity: {
    opacity: 0.8,
  },
});