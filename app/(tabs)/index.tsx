import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GoogleGenAI } from '@google/genai';

import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatChip } from '@/components/ui/stat-chip';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ai = new GoogleGenAI({ apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY });

type TestResult = {
  name: string;
  value: string;
  referenceRange: string;
  severity: 'normal' | 'mild' | 'high' | 'low';
  explanation: string;
};

const PROMPT = `You are analyzing a medical lab report, which may span multiple pages/images.
Combine information across all provided pages and extract every test visible.
Respond ONLY with valid JSON, no other text, no markdown formatting, in this exact structure:
{
  "tests": [
    {
      "name": "test name",
      "value": "value with unit",
      "referenceRange": "range",
      "severity": "normal" | "mild" | "high" | "low",
      "explanation": "one simple sentence explaining what this means"
    }
  ]
}`;

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<{ uri: string; base64: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const analyzeMultipleWithGemini = async (items: { base64: string; mimeType: string }[]) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const parts: any[] = [{ text: PROMPT }];
      items.forEach((item) => {
        parts.push({ inlineData: { mimeType: item.mimeType, data: item.base64 } });
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts }],
      });

      let text = response.text ?? '';
      text = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(text);
      setResults(parsed.tests);
    } catch (err: any) {
      setError('Failed to analyze report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch {}
      const result = await cameraRef.current.takePictureAsync({ base64: true });
      if (result?.uri && result?.base64) {
        setPhotos((prev) => [...prev, { uri: result.uri, base64: result.base64! }]);
      }
    }
  };

  const submitPhotos = () => {
    if (photos.length === 0) return;
    analyzeMultipleWithGemini(photos.map((p) => ({ base64: p.base64, mimeType: 'image/jpeg' })));
  };

  const pickPdf = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled && result.assets?.[0]) {
      const fileUri = result.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      analyzeMultipleWithGemini([{ base64, mimeType: 'application/pdf' }]);
    }
  };

  const reset = () => {
    setPhotos([]);
    setResults(null);
    setError(null);
    setShowBrief(false);
  };

  const getBriefData = () => {
    if (!results) return null;

    const flagged = results.filter((t) => t.severity !== 'normal');
    const normalCount = results.length - flagged.length;

    const questions = flagged.map(
      (t) => `Is my ${t.name} level (${t.value}, ${t.severity}) something I should be concerned about?`
    );

    return {
      totalTests: results.length,
      normalCount,
      flaggedCount: flagged.length,
      flagged,
      questions,
    };
  };

  // Camera Permission View
  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View
        style={[
          styles.container,
          styles.permissionContainer,
          {
            backgroundColor: themeColors.background,
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View
          style={[
            styles.permissionCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View
            style={[
              styles.permissionIconCircle,
              { backgroundColor: themeColors.primaryLight },
            ]}
          >
            <MaterialIcons name="document-scanner" size={38} color={themeColors.primary} />
          </View>

          <Text style={[styles.permissionTitle, { color: themeColors.textPrimary }]}>
            Camera Access Required
          </Text>

          <Text style={[styles.permissionBody, { color: themeColors.textSecondary }]}>
            AI Health Scanner uses your camera to capture single or multi-page paper lab reports, extract biomarkers, and generate your doctor consultation summary.
          </Text>

          {/* Benefits List */}
          <View style={styles.permissionBenefitsList}>
            <View style={styles.benefitItem}>
              <MaterialIcons name="auto-awesome" size={16} color={themeColors.primary} />
              <Text style={[styles.benefitText, { color: themeColors.textPrimary }]}>
                Instant biomarker & reference range extraction
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialIcons name="translate" size={16} color={themeColors.primary} />
              <Text style={[styles.benefitText, { color: themeColors.textPrimary }]}>
                Plain-language explanations in clear English
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialIcons name="medical-services" size={16} color={themeColors.primary} />
              <Text style={[styles.benefitText, { color: themeColors.textPrimary }]}>
                Doctor visit questions & discussion guide
              </Text>
            </View>
          </View>

          <CustomButton
            title="Enable Camera Access"
            onPress={requestPermission}
            variant="primary"
            size="lg"
            fullWidth
            icon={<MaterialIcons name="lock-open" size={20} color="#FFFFFF" />}
          />

          <View style={{ height: Spacing.sm }} />

          <CustomButton
            title="Upload PDF Lab Report Instead"
            onPress={pickPdf}
            variant="secondary"
            size="md"
            fullWidth
            icon={<MaterialIcons name="picture-as-pdf" size={18} color={themeColors.primary} />}
          />
        </View>
      </View>
    );
  }

  // Doctor Visit Brief screen
  if (results && showBrief) {
    const brief = getBriefData();
    const flaggedTests = brief?.flagged ?? [];
    const questions = brief?.questions ?? [];
    const totalTests = brief?.totalTests ?? 0;
    const normalCount = brief?.normalCount ?? 0;
    const flaggedCount = brief?.flaggedCount ?? 0;
    const criticalCount = flaggedTests.filter((t) => t.severity === 'high' || t.severity === 'low').length;

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
        {/* Top Navigation Bar */}
        <View style={styles.briefTopNavBar}>
          <Pressable
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              } catch {}
              setShowBrief(false);
            }}
            style={({ pressed }) => [
              styles.briefBackNavButton,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
              pressed && styles.pressedOpacity,
            ]}
            accessibilityLabel="Back to Full Results"
          >
            <MaterialIcons name="arrow-back" size={18} color={themeColors.textPrimary} />
            <Text style={[styles.briefBackNavText, { color: themeColors.textPrimary }]}>
              Full Results
            </Text>
          </Pressable>

          <View
            style={[
              styles.briefClinicalTag,
              { backgroundColor: themeColors.primaryLight, borderColor: themeColors.border },
            ]}
          >
            <MaterialIcons name="verified" size={14} color={themeColors.primary} />
            <Text style={[styles.briefClinicalTagText, { color: themeColors.primary }]}>
              Doctor Consultation Brief
            </Text>
          </View>
        </View>

        {/* Doctor Visit Brief Main Header */}
        <View style={styles.briefHeaderCard}>
          <View style={styles.briefHeaderRow}>
            <View
              style={[
                styles.briefHeaderIconCircle,
                { backgroundColor: themeColors.primaryLight },
              ]}
            >
              <MaterialIcons name="medical-services" size={24} color={themeColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.briefMainTitle, { color: themeColors.textPrimary }]}>
                Doctor Visit Brief
              </Text>
              <Text style={[styles.briefSubTitle, { color: themeColors.textSecondary }]}>
                Synthesized consultation guide & targeted clinical questions
              </Text>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.briefStatChipRow}>
            <StatChip
              label="Tests Analyzed"
              value={totalTests}
              variant="default"
              size="sm"
            />
            <StatChip
              label="Normal"
              value={normalCount}
              variant="success"
              icon={<MaterialIcons name="check-circle" size={12} color={themeColors.success} />}
              size="sm"
            />
            {flaggedCount > 0 ? (
              <StatChip
                label="Discussion Flags"
                value={flaggedCount}
                variant={criticalCount > 0 ? 'danger' : 'warning'}
                icon={
                  <MaterialIcons
                    name="flag"
                    size={12}
                    color={criticalCount > 0 ? themeColors.danger : themeColors.warning}
                  />
                }
                size="sm"
              />
            ) : (
              <StatChip
                label="All In-Range"
                value="100%"
                variant="success"
                size="sm"
              />
            )}
          </View>
        </View>

        {/* Executive Triage Alert Banner */}
        {flaggedCount > 0 ? (
          <View
            style={[
              styles.briefAlertBanner,
              {
                backgroundColor: criticalCount > 0 ? themeColors.dangerBg : themeColors.warningBg,
                borderColor: criticalCount > 0 ? themeColors.dangerBorder : themeColors.warningBorder,
              },
            ]}
          >
            <MaterialIcons
              name={criticalCount > 0 ? 'priority-high' : 'info'}
              size={20}
              color={criticalCount > 0 ? themeColors.danger : themeColors.warning}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.briefAlertTitle,
                  { color: criticalCount > 0 ? themeColors.danger : themeColors.warning },
                ]}
              >
                {flaggedCount} {flaggedCount === 1 ? 'Biomarker Requires' : 'Biomarkers Require'} Discussion
              </Text>
              <Text
                style={[
                  styles.briefAlertBody,
                  { color: criticalCount > 0 ? themeColors.danger : themeColors.warning },
                ]}
              >
                Present this brief to your physician to review out-of-range biomarkers and establish next steps.
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.briefAlertBanner,
              {
                backgroundColor: themeColors.successBg,
                borderColor: themeColors.successBorder,
              },
            ]}
          >
            <MaterialIcons name="check-circle-outline" size={20} color={themeColors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.briefAlertTitle, { color: themeColors.success }]}>
                Optimal Report Findings
              </Text>
              <Text style={[styles.briefAlertBody, { color: themeColors.success }]}>
                All {totalTests} biomarkers are within standard reference ranges. No specific concerns flagged.
              </Text>
            </View>
          </View>
        )}

        {/* SECTION 1: Notable Findings / Priority Biomarkers */}
        {flaggedCount > 0 && (
          <View style={styles.briefSection}>
            <View style={styles.briefSectionHeader}>
              <View style={[styles.briefSectionIconBadge, { backgroundColor: themeColors.dangerBg }]}>
                <MaterialIcons name="flag" size={16} color={themeColors.danger} />
              </View>
              <View>
                <Text style={[styles.briefSectionTitle, { color: themeColors.textPrimary }]}>
                  Notable Findings ({flaggedCount})
                </Text>
                <Text style={[styles.briefSectionSub, { color: themeColors.textSecondary }]}>
                  Biomarkers deviating from standard reference ranges
                </Text>
              </View>
            </View>

            <View style={styles.briefCardsList}>
              {flaggedTests.map((test, i) => (
                <Card
                  key={i}
                  variant="default"
                  elevation="sm"
                  style={styles.briefTestCard}
                >
                  {/* Card Header */}
                  <View style={styles.briefTestCardHeader}>
                    <Text style={[styles.briefTestName, { color: themeColors.textPrimary }]}>
                      {test.name}
                    </Text>
                    <SeverityBadge severity={test.severity} size="sm" />
                  </View>

                  {/* Measured vs Normal Range */}
                  <View
                    style={[
                      styles.briefMetricGrid,
                      {
                        backgroundColor: themeColors.surfaceSubtle,
                        borderColor: themeColors.border,
                      },
                    ]}
                  >
                    <View style={styles.briefMetricCol}>
                      <Text style={[styles.briefMetricLabel, { color: themeColors.textSecondary }]}>
                        MEASURED RESULT
                      </Text>
                      <Text
                        style={[
                          styles.briefMetricValue,
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

                    <View style={[styles.briefMetricDivider, { backgroundColor: themeColors.border }]} />

                    <View style={styles.briefMetricCol}>
                      <Text style={[styles.briefMetricLabel, { color: themeColors.textSecondary }]}>
                        STANDARD RANGE
                      </Text>
                      <Text style={[styles.briefMetricRange, { color: themeColors.textSecondary }]}>
                        {test.referenceRange || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* AI Plain-Language Clinical Context */}
                  {test.explanation ? (
                    <View
                      style={[
                        styles.briefExplanationBox,
                        {
                          backgroundColor: themeColors.surfaceMuted,
                          borderLeftColor:
                            test.severity === 'mild'
                              ? themeColors.warning
                              : test.severity === 'high' || test.severity === 'low'
                              ? themeColors.danger
                              : themeColors.success,
                        },
                      ]}
                    >
                      <Text style={[styles.briefExplanationText, { color: themeColors.textPrimary }]}>
                        {test.explanation}
                      </Text>
                    </View>
                  ) : null}
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* SECTION 2: Questions to Ask Your Doctor */}
        {questions.length > 0 && (
          <View style={styles.briefSection}>
            <View style={styles.briefSectionHeader}>
              <View style={[styles.briefSectionIconBadge, { backgroundColor: themeColors.primaryLight }]}>
                <MaterialIcons name="forum" size={16} color={themeColors.primary} />
              </View>
              <View>
                <Text style={[styles.briefSectionTitle, { color: themeColors.textPrimary }]}>
                  Questions for Your Doctor ({questions.length})
                </Text>
                <Text style={[styles.briefSectionSub, { color: themeColors.textSecondary }]}>
                  Targeted questions prepared for your consultation
                </Text>
              </View>
            </View>

            <View style={styles.briefQuestionsList}>
              {questions.map((q, i) => (
                <View
                  key={i}
                  style={[
                    styles.briefQuestionCard,
                    {
                      backgroundColor: themeColors.surface,
                      borderColor: themeColors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.briefQuestionNumberCircle,
                      { backgroundColor: themeColors.primaryLight },
                    ]}
                  >
                    <Text style={[styles.briefQuestionNumberText, { color: themeColors.primary }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.briefQuestionContent, { color: themeColors.textPrimary }]}>
                      {q}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Normal / Zero-Flags State Details */}
        {flaggedCount === 0 && (
          <View
            style={[
              styles.briefZeroFlagsCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <View
              style={[
                styles.briefZeroFlagsIconCircle,
                { backgroundColor: themeColors.successBg },
              ]}
            >
              <MaterialIcons name="health-and-safety" size={32} color={themeColors.success} />
            </View>
            <Text style={[styles.briefZeroFlagsTitle, { color: themeColors.textPrimary }]}>
              All Biomarkers Within Standard Range
            </Text>
            <Text style={[styles.briefZeroFlagsDesc, { color: themeColors.textSecondary }]}>
              No specific clinical concerns were flagged during analysis. You can maintain your regular health routine and discuss general wellness optimization during your next checkup.
            </Text>
          </View>
        )}

        {/* SECTION 3: Appointment Preparation Tips */}
        <View
          style={[
            styles.briefTipsCard,
            {
              backgroundColor: themeColors.surfaceSubtle,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.briefTipsHeader}>
            <MaterialIcons name="lightbulb" size={18} color={themeColors.primary} />
            <Text style={[styles.briefTipsTitle, { color: themeColors.textPrimary }]}>
              Doctor Visit Tips
            </Text>
          </View>
          <View style={styles.briefTipsList}>
            <View style={styles.briefTipItem}>
              <Text style={[styles.briefTipBullet, { color: themeColors.primary }]}>•</Text>
              <Text style={[styles.briefTipText, { color: themeColors.textSecondary }]}>
                Share this summary directly with your physician at the start of your appointment.
              </Text>
            </View>
            <View style={styles.briefTipItem}>
              <Text style={[styles.briefTipBullet, { color: themeColors.primary }]}>•</Text>
              <Text style={[styles.briefTipText, { color: themeColors.textSecondary }]}>
                Mention any new symptoms, dietary shifts, or medications started recently.
              </Text>
            </View>
            <View style={styles.briefTipItem}>
              <Text style={[styles.briefTipBullet, { color: themeColors.primary }]}>•</Text>
              <Text style={[styles.briefTipText, { color: themeColors.textSecondary }]}>
                Ask if follow-up testing or periodic biomarker monitoring is recommended.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.briefActionsContainer}>
          <CustomButton
            title="Back to Full Results"
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              } catch {}
              setShowBrief(false);
            }}
            variant="primary"
            size="lg"
            fullWidth
            icon={<MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />}
          />

          <View style={{ height: Spacing.sm }} />

          <CustomButton
            title="Scan Another Report"
            onPress={reset}
            variant="outline"
            size="md"
            fullWidth
            icon={<MaterialIcons name="document-scanner" size={18} color={themeColors.textPrimary} />}
          />
        </View>
      </ScrollView>
    );
  }

  // Results Screen
  if (results) {
    const normalCount = results.filter((t) => t.severity === 'normal').length;
    const flaggedCount = results.length - normalCount;
    const criticalCount = results.filter((t) => t.severity === 'high' || t.severity === 'low').length;

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
        {/* Results Header */}
        <View style={styles.resultsHeaderContainer}>
          <View style={styles.resultsTitleRow}>
            <View style={[styles.resultsIconBadge, { backgroundColor: themeColors.primaryLight }]}>
              <MaterialIcons name="analytics" size={24} color={themeColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultsMainHeading, { color: themeColors.textPrimary }]}>
                Lab Analysis Results
              </Text>
              <Text style={[styles.resultsSubHeading, { color: themeColors.textSecondary }]}>
                Biomarkers, reference intervals & AI clinical summaries
              </Text>
            </View>
          </View>

          {/* Quick Metrics Summary Bar */}
          <View style={styles.statChipRow}>
            <StatChip
              label="Tests"
              value={results.length}
              variant="default"
              size="sm"
            />
            <StatChip
              label="Normal"
              value={normalCount}
              variant="success"
              icon={<MaterialIcons name="check-circle" size={12} color={themeColors.success} />}
              size="sm"
            />
            {flaggedCount > 0 && (
              <StatChip
                label="Needs Attention"
                value={flaggedCount}
                variant={criticalCount > 0 ? 'danger' : 'warning'}
                icon={
                  <MaterialIcons
                    name="warning"
                    size={12}
                    color={criticalCount > 0 ? themeColors.danger : themeColors.warning}
                  />
                }
                size="sm"
              />
            )}
          </View>
        </View>

        {/* Flagged Status Banner */}
        {flaggedCount > 0 ? (
          <View
            style={[
              styles.resultsAlertBanner,
              {
                backgroundColor: criticalCount > 0 ? themeColors.dangerBg : themeColors.warningBg,
                borderColor: criticalCount > 0 ? themeColors.dangerBorder : themeColors.warningBorder,
              },
            ]}
          >
            <MaterialIcons
              name={criticalCount > 0 ? 'error-outline' : 'info-outline'}
              size={18}
              color={criticalCount > 0 ? themeColors.danger : themeColors.warning}
            />
            <Text
              style={[
                styles.resultsAlertText,
                { color: criticalCount > 0 ? themeColors.danger : themeColors.warning },
              ]}
            >
              {flaggedCount} {flaggedCount === 1 ? 'biomarker is' : 'biomarkers are'} outside standard reference ranges. Tap &ldquo;Doctor Visit Brief&rdquo; below for consultation points.
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.resultsAlertBanner,
              {
                backgroundColor: themeColors.successBg,
                borderColor: themeColors.successBorder,
              },
            ]}
          >
            <MaterialIcons name="check-circle-outline" size={18} color={themeColors.success} />
            <Text style={[styles.resultsAlertText, { color: themeColors.success }]}>
              All tested biomarkers are within standard reference ranges.
            </Text>
          </View>
        )}

        {/* Test Cards List */}
        <View style={styles.testCardsList}>
          {results.map((test, i) => (
            <Card
              key={i}
              variant="default"
              elevation="sm"
              style={styles.testResultCard}
            >
              {/* Card Header: Test Name + Severity Badge */}
              <View style={styles.testCardHeader}>
                <Text style={[styles.testName, { color: themeColors.textPrimary }]}>
                  {test.name}
                </Text>
                <SeverityBadge severity={test.severity} size="sm" />
              </View>

              {/* Measured Value & Reference Range Container */}
              <View
                style={[
                  styles.metricGrid,
                  {
                    backgroundColor: themeColors.surfaceSubtle,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.metricColumn}>
                  <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>
                    MEASURED VALUE
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

                <View style={styles.metricColumn}>
                  <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>
                    STANDARD RANGE
                  </Text>
                  <Text style={[styles.metricRange, { color: themeColors.textSecondary }]}>
                    {test.referenceRange || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Range Status Bar Indicator */}
              <View style={styles.rangeBarContainer}>
                <View style={styles.rangeBarTrack}>
                  <View
                    style={[
                      styles.rangeBarSegment,
                      styles.rangeBarLow,
                      test.severity === 'low' && styles.rangeBarSegmentActive,
                    ]}
                  />
                  <View
                    style={[
                      styles.rangeBarSegment,
                      styles.rangeBarNormal,
                      test.severity === 'normal' && styles.rangeBarSegmentActive,
                    ]}
                  />
                  <View
                    style={[
                      styles.rangeBarSegment,
                      styles.rangeBarHigh,
                      (test.severity === 'high' || test.severity === 'mild') && styles.rangeBarSegmentActive,
                    ]}
                  />
                </View>
                <View style={styles.rangeBarLabels}>
                  <Text style={[styles.rangeBarLabelText, { color: themeColors.textMuted }]}>LOW</Text>
                  <Text style={[styles.rangeBarLabelText, { color: themeColors.textMuted }]}>NORMAL</Text>
                  <Text style={[styles.rangeBarLabelText, { color: themeColors.textMuted }]}>HIGH</Text>
                </View>
              </View>

              {/* AI Plain-Language Explanation */}
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
                  <View style={styles.explanationHeader}>
                    <MaterialIcons
                      name="auto-awesome"
                      size={13}
                      color={
                        test.severity === 'normal'
                          ? themeColors.success
                          : test.severity === 'mild'
                          ? themeColors.warning
                          : themeColors.danger
                      }
                    />
                    <Text style={[styles.explanationTitle, { color: themeColors.textSecondary }]}>
                      Plain-Language Interpretation
                    </Text>
                  </View>
                  <Text style={[styles.explanationText, { color: themeColors.textPrimary }]}>
                    {test.explanation}
                  </Text>
                </View>
              ) : null}
            </Card>
          ))}
        </View>

        {/* Bottom Actions Bar */}
        <View style={styles.resultsActionsContainer}>
          <CustomButton
            title="Generate Doctor Visit Brief"
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              } catch {}
              setShowBrief(true);
            }}
            variant="primary"
            size="lg"
            fullWidth
            icon={<MaterialIcons name="assignment" size={20} color="#FFFFFF" />}
          />

          <View style={{ height: Spacing.sm }} />

          <CustomButton
            title="Scan Another Report"
            onPress={reset}
            variant="outline"
            size="md"
            fullWidth
            icon={<MaterialIcons name="document-scanner" size={18} color={themeColors.textPrimary} />}
          />
        </View>
      </ScrollView>
    );
  }

  // Loading Screen
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          {
            backgroundColor: themeColors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View
          style={[
            styles.loadingCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View
            style={[
              styles.loadingIconCircle,
              { backgroundColor: themeColors.primaryLight },
            ]}
          >
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>

          <Text style={[styles.loadingTitle, { color: themeColors.textPrimary }]}>
            Analyzing Lab Report
          </Text>

          <Text style={[styles.loadingSubtitle, { color: themeColors.textSecondary }]}>
            Extracting biomarkers, calculating reference intervals, and generating plain-language clinical insights...
          </Text>

          <View style={styles.loadingStepsBox}>
            <View style={styles.loadingStepItem}>
              <MaterialIcons name="check-circle" size={14} color={themeColors.success} />
              <Text style={[styles.loadingStepText, { color: themeColors.textSecondary }]}>
                Report digitized & processed
              </Text>
            </View>
            <View style={styles.loadingStepItem}>
              <MaterialIcons name="hourglass-top" size={14} color={themeColors.primary} />
              <Text style={[styles.loadingStepText, { color: themeColors.textPrimary, fontWeight: '600' }]}>
                Matching lab biomarker ranges...
              </Text>
            </View>
            <View style={styles.loadingStepItem}>
              <MaterialIcons name="radio-button-unchecked" size={14} color={themeColors.textMuted} />
              <Text style={[styles.loadingStepText, { color: themeColors.textMuted }]}>
                Preparing Doctor Visit Brief
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.aiBadge,
              {
                backgroundColor: themeColors.surfaceSubtle,
                borderColor: themeColors.border,
              },
            ]}
          >
            <MaterialIcons name="auto-awesome" size={14} color={themeColors.primary} />
            <Text style={[styles.aiBadgeText, { color: themeColors.primary }]}>
              Powered by Gemini AI
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Error Screen
  if (error && photos.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.errorContainer,
          {
            backgroundColor: themeColors.background,
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View
          style={[
            styles.errorCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.dangerBorder,
            },
          ]}
        >
          <View
            style={[
              styles.errorIconCircle,
              { backgroundColor: themeColors.dangerBg },
            ]}
          >
            <MaterialIcons name="error-outline" size={36} color={themeColors.danger} />
          </View>

          <Text style={[styles.errorCardTitle, { color: themeColors.textPrimary }]}>
            Analysis Could Not Be Completed
          </Text>

          <Text style={[styles.errorCardMessage, { color: themeColors.danger }]}>
            {error}
          </Text>

          <Text style={[styles.errorCardHint, { color: themeColors.textSecondary }]}>
            Please ensure the report document is clear, well-lit, and text is readable without blur.
          </Text>

          <CustomButton
            title="Try Again"
            onPress={reset}
            variant="primary"
            size="lg"
            fullWidth
            icon={<MaterialIcons name="refresh" size={20} color="#FFFFFF" />}
          />

          <View style={{ height: Spacing.sm }} />

          <CustomButton
            title="Upload PDF Instead"
            onPress={pickPdf}
            variant="secondary"
            size="md"
            fullWidth
            icon={<MaterialIcons name="picture-as-pdf" size={18} color={themeColors.primary} />}
          />
        </View>
      </View>
    );
  }

  // Camera Scan View
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        {/* Top Header Overlay */}
        <View
          style={[
            styles.topHeaderOverlay,
            {
              top: insets.top + Spacing.sm,
            },
          ]}
        >
          <View style={styles.brandPill}>
            <MaterialIcons name="document-scanner" size={18} color="#FFFFFF" />
            <Text style={styles.brandPillText}>AI Health Scanner</Text>
          </View>

          {photos.length > 0 ? (
            <View style={styles.pageBadgePill}>
              <MaterialIcons name="photo-library" size={14} color="#FFFFFF" />
              <Text style={styles.pageBadgePillText}>
                {photos.length} {photos.length === 1 ? 'page' : 'pages'}
              </Text>
            </View>
          ) : (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Ready</Text>
            </View>
          )}
        </View>

        {/* Center Document Viewfinder Reticle */}
        <View style={styles.viewfinderContainer} pointerEvents="none">
          <View style={styles.reticleFrame}>
            {/* 4 Corner Brackets */}
            <View style={[styles.cornerBracket, styles.topLeftBracket]} />
            <View style={[styles.cornerBracket, styles.topRightBracket]} />
            <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
            <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

            {/* Subtle Alignment Instruction */}
            <View style={styles.alignmentHintContainer}>
              <View style={styles.alignmentHintPill}>
                <MaterialIcons name="crop-free" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.alignmentHintText}>
                  Position lab report inside frame
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Camera HUD */}
        <View
          style={[
            styles.bottomHudContainer,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.lg),
            },
          ]}
        >
          {/* Error Banner in HUD if error occurred during multi-page capture */}
          {error && (
            <View style={styles.hudErrorBanner}>
              <MaterialIcons name="error" size={16} color="#FFFFFF" />
              <Text style={styles.hudErrorText}>{error}</Text>
            </View>
          )}

          {/* Multi-Page Status Bar */}
          {photos.length > 0 && (
            <View style={styles.multiPageStatusBar}>
              <View style={styles.multiPageIndicator}>
                <MaterialIcons name="collections" size={16} color="#FFFFFF" />
                <Text style={styles.multiPageText}>
                  {photos.length} {photos.length === 1 ? 'page' : 'pages'} staged
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  } catch {}
                  setPhotos([]);
                }}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.pressedOpacity,
                ]}
              >
                <MaterialIcons name="delete-outline" size={16} color="#FFAAAA" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </Pressable>
            </View>
          )}

          {/* Main Controls Row: Upload PDF / Shutter Button / Analyze Action */}
          <View style={styles.hudControlsRow}>
            {/* Left Action: Upload PDF */}
            <Pressable
              onPress={pickPdf}
              style={({ pressed }) => [
                styles.hudPdfButton,
                pressed && styles.pressedScale,
              ]}
              accessibilityLabel="Upload PDF report"
            >
              <View style={styles.pdfIconBadge}>
                <MaterialIcons name="picture-as-pdf" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.hudPdfButtonLabel}>Upload PDF</Text>
              <Text style={styles.hudPdfButtonSub}>Digital Lab File</Text>
            </Pressable>

            {/* Center Action: Shutter Button */}
            <View style={styles.shutterContainer}>
              <Pressable
                onPress={takePhoto}
                style={({ pressed }) => [
                  styles.shutterOuterRing,
                  pressed && styles.shutterPressed,
                ]}
                accessibilityLabel="Take report photo"
              >
                <View style={styles.shutterInnerCircle} />
              </Pressable>
              <Text style={styles.shutterLabel}>
                {photos.length > 0 ? '+ Add Page' : 'Scan Page'}
              </Text>
            </View>

            {/* Right Action: Analyze Button or PDF/Info Badge */}
            {photos.length > 0 ? (
              <CustomButton
                title="Analyze"
                onPress={submitPhotos}
                variant="primary"
                size="md"
                style={styles.analyzeButton}
                icon={<MaterialIcons name="auto-awesome" size={16} color="#FFFFFF" />}
              />
            ) : (
              <View style={styles.hudInfoBadge}>
                <MaterialIcons name="auto-awesome" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={styles.hudInfoBadgeText}>AI Analysis</Text>
                <Text style={styles.hudInfoBadgeSub}>Instant OCR</Text>
              </View>
            )}
          </View>

          {/* Footer Guide text */}
          <View style={styles.hudFooterHint}>
            <Text style={styles.hudFooterHintText}>
              Scan multi-page blood tests, urinalysis, or upload digital PDF reports
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RETICLE_WIDTH = SCREEN_WIDTH * 0.84;
const RETICLE_HEIGHT = RETICLE_WIDTH * 1.32;
const CORNER_SIZE = 26;
const BORDER_WIDTH = 3.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },

  // Top Header Overlay
  topHeaderOverlay: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandPillText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    letterSpacing: 0.2,
  },
  pageBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pageBadgePillText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: Spacing.xs + 1,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.medium,
  },

  // Center Viewfinder
  viewfinderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  reticleFrame: {
    width: RETICLE_WIDTH,
    height: RETICLE_HEIGHT,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  cornerBracket: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  topLeftBracket: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderTopLeftRadius: 10,
  },
  topRightBracket: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderTopRightRadius: 10,
  },
  bottomLeftBracket: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderBottomLeftRadius: 10,
  },
  bottomRightBracket: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomRightRadius: 10,
  },
  alignmentHintContainer: {
    alignItems: 'center',
  },
  alignmentHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  alignmentHintText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },

  // Bottom Camera HUD
  bottomHudContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  hudErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  hudErrorText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  multiPageStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  multiPageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  multiPageText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.xs,
  },
  clearButtonText: {
    color: '#FFAAAA',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  hudControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hudPdfButton: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pdfIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  hudPdfButtonLabel: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  hudPdfButtonSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: Typography.sizes.xs - 3,
    fontWeight: Typography.weights.medium,
    marginTop: 1,
  },
  shutterContainer: {
    alignItems: 'center',
  },
  shutterOuterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...Shadows.md,
  },
  shutterInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  shutterLabel: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.semiBold,
    marginTop: 4,
  },
  shutterPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  analyzeButton: {
    width: 88,
  },
  hudInfoBadge: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hudInfoBadgeText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.semiBold,
    marginTop: 3,
  },
  hudInfoBadgeSub: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: Typography.sizes.xs - 3,
    marginTop: 1,
  },
  hudFooterHint: {
    alignItems: 'center',
    marginTop: Spacing.sm + 2,
  },
  hudFooterHintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: Typography.sizes.xs - 1,
    textAlign: 'center',
  },
  pressedScale: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  pressedOpacity: {
    opacity: 0.7,
  },

  // Results Screen Styles
  resultsHeaderContainer: {
    marginBottom: Spacing.md,
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  resultsIconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsMainHeading: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.xxl,
  },
  resultsSubHeading: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs + 3,
    marginTop: 2,
  },
  statChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    alignItems: 'center',
  },
  resultsAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  resultsAlertText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    lineHeight: 18,
    flex: 1,
  },
  testCardsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  testResultCard: {
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
  metricColumn: {
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

  // Range Bar Indicator
  rangeBarContainer: {
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  rangeBarTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 3,
    marginBottom: 3,
  },
  rangeBarSegment: {
    flex: 1,
    borderRadius: 2,
    opacity: 0.35,
  },
  rangeBarLow: {
    backgroundColor: '#EA580C',
  },
  rangeBarNormal: {
    backgroundColor: '#16A34A',
  },
  rangeBarHigh: {
    backgroundColor: '#DC2626',
  },
  rangeBarSegmentActive: {
    opacity: 1,
    height: 6,
  },
  rangeBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeBarLabelText: {
    fontSize: Typography.sizes.xs - 3,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.4,
  },

  explanationBox: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  explanationTitle: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.semiBold,
    letterSpacing: 0.2,
  },
  explanationText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm + 2,
  },
  resultsActionsContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.md,
  },
  loadingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  loadingTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs + 2,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  loadingStepsBox: {
    width: '100%',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: Spacing.lg,
  },
  loadingStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingStepText: {
    fontSize: Typography.sizes.xs,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  aiBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.md,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  errorCardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs + 2,
    textAlign: 'center',
  },
  errorCardMessage: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  errorCardHint: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs + 4,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  // Permission State
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.md,
  },
  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  permissionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs + 2,
    textAlign: 'center',
  },
  permissionBody: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  permissionBenefitsList: {
    width: '100%',
    gap: Spacing.sm + 2,
    marginBottom: Spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
    flex: 1,
  },

  // Doctor Visit Brief Styles
  briefTopNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  briefBackNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.sm,
  },
  briefBackNavText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
  },
  briefClinicalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  briefClinicalTagText: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  briefHeaderCard: {
    marginBottom: Spacing.md,
  },
  briefHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  briefHeaderIconCircle: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  briefMainTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.xxl,
  },
  briefSubTitle: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs + 3,
    marginTop: 2,
  },
  briefStatChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
    alignItems: 'center',
  },
  briefAlertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm + 2,
    marginBottom: Spacing.lg,
  },
  briefAlertTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  briefAlertBody: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs + 3,
  },
  briefSection: {
    marginBottom: Spacing.xl,
  },
  briefSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  briefSectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  briefSectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.md,
  },
  briefSectionSub: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs + 2,
  },
  briefCardsList: {
    gap: Spacing.md,
  },
  briefTestCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  briefTestCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  briefTestName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    flex: 1,
    lineHeight: 22,
  },
  briefMetricGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  briefMetricCol: {
    flex: 1,
  },
  briefMetricDivider: {
    width: 1,
    height: 32,
    marginHorizontal: Spacing.md,
  },
  briefMetricLabel: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  briefMetricValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  briefMetricRange: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  briefExplanationBox: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    marginTop: Spacing.xs,
  },
  briefExplanationText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm + 2,
  },
  briefQuestionsList: {
    gap: Spacing.sm,
  },
  briefQuestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  briefQuestionNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  briefQuestionNumberText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  briefQuestionContent: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.lineHeights.sm + 4,
  },
  briefZeroFlagsCard: {
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  briefZeroFlagsIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  briefZeroFlagsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  briefZeroFlagsDesc: {
    fontSize: Typography.sizes.xs + 1,
    lineHeight: Typography.lineHeights.xs + 5,
    textAlign: 'center',
  },
  briefTipsCard: {
    padding: Spacing.md + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  briefTipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm + 2,
  },
  briefTipsTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  briefTipsList: {
    gap: Spacing.xs + 2,
  },
  briefTipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs + 2,
  },
  briefTipBullet: {
    fontSize: Typography.sizes.md,
    lineHeight: Typography.lineHeights.sm,
    fontWeight: Typography.weights.bold,
  },
  briefTipText: {
    fontSize: Typography.sizes.xs + 1,
    lineHeight: Typography.lineHeights.xs + 5,
    flex: 1,
  },
  briefActionsContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
});