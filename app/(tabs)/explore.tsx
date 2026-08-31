import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/card';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CategoryType = 'all' | 'cbc' | 'lipid' | 'metabolic' | 'thyroid' | 'vitamins';

interface BiomarkerGuideItem {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  categoryIcon: keyof typeof MaterialIcons.glyphMap;
  standardRange: string;
  unit: string;
  whatItMeasures: string;
  elevatedMeans: string;
  lowMeans: string;
  doctorQuestion: string;
}

const BIOMARKERS_DATA: BiomarkerGuideItem[] = [
  {
    id: 'cholesterol',
    name: 'Total Cholesterol',
    category: 'lipid',
    categoryLabel: 'Lipid / Heart',
    categoryIcon: 'favorite',
    standardRange: '< 200',
    unit: 'mg/dL',
    whatItMeasures: 'Total amount of cholesterol in blood, including LDL (bad) and HDL (good).',
    elevatedMeans: 'Increased risk of arterial plaque buildup and cardiovascular disease.',
    lowMeans: 'Rare; may occasionally indicate malnutrition or severe liver impairment.',
    doctorQuestion: 'What is my LDL/HDL breakdown and do I need dietary changes or statins?',
  },
  {
    id: 'hba1c',
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'metabolic',
    categoryLabel: 'Metabolic / Sugar',
    categoryIcon: 'water-drop',
    standardRange: '< 5.7',
    unit: '%',
    whatItMeasures: 'Average blood sugar levels over the past 2 to 3 months.',
    elevatedMeans: '5.7%–6.4% indicates prediabetes; 6.5%+ suggests diabetes.',
    lowMeans: 'Uncommon; could reflect recent blood loss or specific anemias.',
    doctorQuestion: 'Should we schedule regular glucose monitoring or lifestyle adjustments?',
  },
  {
    id: 'hemoglobin',
    name: 'Haemoglobin (Hb)',
    category: 'cbc',
    categoryLabel: 'Complete Blood (CBC)',
    categoryIcon: 'opacity',
    standardRange: '13.5 - 17.5',
    unit: 'g/dL',
    whatItMeasures: 'Oxygen-carrying protein in red blood cells.',
    elevatedMeans: 'May be caused by dehydration, high altitude, or lung conditions.',
    lowMeans: 'Indicates anemia, which can cause chronic fatigue, dizziness, or weakness.',
    doctorQuestion: 'Do I need iron supplementation or further investigations for anemia?',
  },
  {
    id: 'tsh',
    name: 'TSH (Thyroid Stimulating Hormone)',
    category: 'thyroid',
    categoryLabel: 'Thyroid & Hormones',
    categoryIcon: 'healing',
    standardRange: '0.4 - 4.0',
    unit: 'mIU/L',
    whatItMeasures: 'Pituitary hormone regulating metabolism through thyroid gland stimulation.',
    elevatedMeans: 'Hypothyroidism (underactive thyroid), leading to fatigue, weight gain, or cold intolerance.',
    lowMeans: 'Hyperthyroidism (overactive thyroid), causing rapid heart rate or weight loss.',
    doctorQuestion: 'Should we test Free T3/T4 antibodies to evaluate thyroid balance?',
  },
  {
    id: 'vitamind',
    name: 'Vitamin D (25-Hydroxy)',
    category: 'vitamins',
    categoryLabel: 'Vitamins & Minerals',
    categoryIcon: 'wb-sunny',
    standardRange: '30 - 100',
    unit: 'ng/mL',
    whatItMeasures: 'Key nutrient essential for bone density, immune response, and calcium absorption.',
    elevatedMeans: 'Rare; usually caused by excessive high-dose supplement intake.',
    lowMeans: 'Common deficiency causing fatigue, bone loss, muscle aches, and lowered immunity.',
    doctorQuestion: 'What weekly or daily Vitamin D3 dosage is optimal to restore my levels?',
  },
  {
    id: 'glucose',
    name: 'Fasting Blood Glucose',
    category: 'metabolic',
    categoryLabel: 'Metabolic / Sugar',
    categoryIcon: 'water-drop',
    standardRange: '70 - 99',
    unit: 'mg/dL',
    whatItMeasures: 'Immediate blood sugar concentration following an 8 to 12 hour overnight fast.',
    elevatedMeans: '100–125 mg/dL indicates impaired fasting glucose; 126+ mg/dL suggests diabetes.',
    lowMeans: 'Hypoglycemia (< 70 mg/dL), potentially causing shakiness, sweating, or confusion.',
    doctorQuestion: 'How does this fasting value correlate with my HbA1c average?',
  },
  {
    id: 'vitaminb12',
    name: 'Vitamin B12 (Cobalamin)',
    category: 'vitamins',
    categoryLabel: 'Vitamins & Minerals',
    categoryIcon: 'wb-sunny',
    standardRange: '200 - 900',
    unit: 'pg/mL',
    whatItMeasures: 'Essential vitamin for neurological health, nerve function, and red blood cell formation.',
    elevatedMeans: 'Generally harmless as excess is excreted; may indicate supplement overuse.',
    lowMeans: 'Can cause tingling/numbness in limbs, memory fog, fatigue, and megaloblastic anemia.',
    doctorQuestion: 'Would oral methylcobalamin or dietary changes be best for my B12 level?',
  },
  {
    id: 'creatinine',
    name: 'Serum Creatinine & eGFR',
    category: 'metabolic',
    categoryLabel: 'Metabolic / Kidney',
    categoryIcon: 'filter-vintage',
    standardRange: '0.7 - 1.3',
    unit: 'mg/dL',
    whatItMeasures: 'Waste product filtered by kidneys, measuring renal filtration capacity.',
    elevatedMeans: 'May indicate reduced kidney filtration, dehydration, or high muscle breakdown.',
    lowMeans: 'Low muscle mass or protein malnutrition.',
    doctorQuestion: 'Is my kidney filtration rate (eGFR) healthy for my age and profile?',
  },
];

const CATEGORIES: { id: CategoryType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'all', label: 'All Panels', icon: 'grid-view' },
  { id: 'cbc', label: 'CBC Blood', icon: 'opacity' },
  { id: 'lipid', label: 'Lipid / Heart', icon: 'favorite' },
  { id: 'metabolic', label: 'Metabolic', icon: 'water-drop' },
  { id: 'thyroid', label: 'Thyroid', icon: 'healing' },
  { id: 'vitamins', label: 'Vitamins', icon: 'wb-sunny' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [expandedId, setExpandedId] = useState<string | null>('cholesterol');

  const filteredBiomarkers =
    selectedCategory === 'all'
      ? BIOMARKERS_DATA
      : BIOMARKERS_DATA.filter((item) => item.category === selectedCategory);

  const handleCategoryPress = (catId: CategoryType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    setSelectedCategory(catId);
  };

  const handleToggleCard = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
            <MaterialIcons name="menu-book" size={22} color={themeColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.mainHeading, { color: themeColors.textPrimary }]}>
              Health Reference Guide
            </Text>
            <Text style={[styles.subHeading, { color: themeColors.textSecondary }]}>
              Understand biomarkers, standard reference ranges, and lab tests
            </Text>
          </View>
        </View>

        {/* Quick Summary Pill Banner */}
        <View
          style={[
            styles.summaryBanner,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: themeColors.primary }]}>8+</Text>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>
              Core Biomarkers
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: themeColors.secondary }]}>5</Text>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>
              Lab Panels
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: themeColors.success }]}>100%</Text>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>
              Plain English
            </Text>
          </View>
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesSection}>
        <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>
          Browse by Panel
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => handleCategoryPress(cat.id)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? themeColors.primary : themeColors.surface,
                    borderColor: isActive ? themeColors.primary : themeColors.border,
                  },
                  pressed && styles.pressedOpacity,
                ]}
              >
                <MaterialIcons
                  name={cat.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : themeColors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isActive ? '#FFFFFF' : themeColors.textPrimary,
                      fontWeight: isActive
                        ? Typography.weights.bold
                        : Typography.weights.medium,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Biomarker Directory Cards */}
      <View style={styles.cardsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>
            Biomarker Directory ({filteredBiomarkers.length})
          </Text>
          <Text style={[styles.sectionSubText, { color: themeColors.textMuted }]}>
            Tap to expand clinical insights
          </Text>
        </View>

        <View style={styles.cardsList}>
          {filteredBiomarkers.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <Card
                key={item.id}
                variant="default"
                elevation="sm"
                style={styles.biomarkerCard}
              >
                {/* Header / Clickable Toggle */}
                <Pressable
                  onPress={() => handleToggleCard(item.id)}
                  style={styles.cardHeaderPressable}
                >
                  <View style={styles.cardHeaderTop}>
                    <View style={styles.cardTitleBlock}>
                      <View
                        style={[
                          styles.cardCategoryPill,
                          {
                            backgroundColor: themeColors.surfaceSubtle,
                            borderColor: themeColors.border,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={item.categoryIcon}
                          size={12}
                          color={themeColors.primary}
                        />
                        <Text
                          style={[
                            styles.cardCategoryPillText,
                            { color: themeColors.textSecondary },
                          ]}
                        >
                          {item.categoryLabel}
                        </Text>
                      </View>
                      <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
                        {item.name}
                      </Text>
                    </View>

                    <View style={styles.cardHeaderRight}>
                      <View
                        style={[
                          styles.rangeBadge,
                          {
                            backgroundColor: themeColors.primaryLight,
                            borderColor: themeColors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.rangeBadgeLabel, { color: themeColors.textSecondary }]}>
                          TARGET
                        </Text>
                        <Text style={[styles.rangeBadgeValue, { color: themeColors.primary }]}>
                          {item.standardRange} {item.unit}
                        </Text>
                      </View>

                      <MaterialIcons
                        name={isExpanded ? 'expand-less' : 'expand-more'}
                        size={22}
                        color={themeColors.textSecondary}
                      />
                    </View>
                  </View>

                  <Text
                    style={[styles.cardSummaryLine, { color: themeColors.textSecondary }]}
                    numberOfLines={isExpanded ? undefined : 2}
                  >
                    {item.whatItMeasures}
                  </Text>
                </Pressable>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <View style={styles.cardExpandedContent}>
                    <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

                    {/* Elevated Context */}
                    <View
                      style={[
                        styles.interpretationRow,
                        {
                          backgroundColor: themeColors.dangerBg,
                          borderColor: themeColors.dangerBorder,
                        },
                      ]}
                    >
                      <MaterialIcons name="arrow-upward" size={16} color={themeColors.danger} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.interpretationLabel, { color: themeColors.danger }]}>
                          IF ELEVATED / HIGH
                        </Text>
                        <Text style={[styles.interpretationText, { color: themeColors.textPrimary }]}>
                          {item.elevatedMeans}
                        </Text>
                      </View>
                    </View>

                    {/* Low Context */}
                    <View
                      style={[
                        styles.interpretationRow,
                        {
                          backgroundColor: themeColors.warningBg,
                          borderColor: themeColors.warningBorder,
                        },
                      ]}
                    >
                      <MaterialIcons name="arrow-downward" size={16} color={themeColors.warning} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.interpretationLabel, { color: themeColors.warning }]}>
                          IF LOW / DEFICIENT
                        </Text>
                        <Text style={[styles.interpretationText, { color: themeColors.textPrimary }]}>
                          {item.lowMeans}
                        </Text>
                      </View>
                    </View>

                    {/* Doctor Question Box */}
                    <View
                      style={[
                        styles.doctorQuestionBox,
                        {
                          backgroundColor: themeColors.surfaceSubtle,
                          borderColor: themeColors.border,
                        },
                      ]}
                    >
                      <View style={styles.doctorQuestionHeader}>
                        <MaterialIcons name="forum" size={14} color={themeColors.primary} />
                        <Text
                          style={[
                            styles.doctorQuestionTitle,
                            { color: themeColors.primary },
                          ]}
                        >
                          Doctor Discussion Point
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.doctorQuestionText,
                          { color: themeColors.textPrimary },
                        ]}
                      >
                        &ldquo;{item.doctorQuestion}&rdquo;
                      </Text>
                    </View>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </View>

      {/* Lab Prep & Fasting Guide Card */}
      <View
        style={[
          styles.prepCard,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
        ]}
      >
        <View style={styles.prepHeaderRow}>
          <View
            style={[
              styles.prepIconBadge,
              { backgroundColor: themeColors.primaryLight },
            ]}
          >
            <MaterialIcons name="tips-and-updates" size={20} color={themeColors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.prepHeading, { color: themeColors.textPrimary }]}>
              Tips for Accurate Lab Results
            </Text>
            <Text style={[styles.prepSubHeading, { color: themeColors.textSecondary }]}>
              How to prepare before your blood collection
            </Text>
          </View>
        </View>

        <View style={styles.prepItemsList}>
          <View style={styles.prepItem}>
            <View style={[styles.prepNumberCircle, { backgroundColor: themeColors.primaryLight }]}>
              <Text style={[styles.prepNumberText, { color: themeColors.primary }]}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.prepItemTitle, { color: themeColors.textPrimary }]}>
                Fast When Required (8–12 Hours)
              </Text>
              <Text style={[styles.prepItemBody, { color: themeColors.textSecondary }]}>
                Lipid panels and fasting blood glucose require abstaining from food and sugary beverages.
              </Text>
            </View>
          </View>

          <View style={styles.prepItem}>
            <View style={[styles.prepNumberCircle, { backgroundColor: themeColors.primaryLight }]}>
              <Text style={[styles.prepNumberText, { color: themeColors.primary }]}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.prepItemTitle, { color: themeColors.textPrimary }]}>
                Stay Well Hydrated
              </Text>
              <Text style={[styles.prepItemBody, { color: themeColors.textSecondary }]}>
                Drink plenty of plain water before your draw. Hydration expands veins and prevents artificial hemoconcentration.
              </Text>
            </View>
          </View>

          <View style={styles.prepItem}>
            <View style={[styles.prepNumberCircle, { backgroundColor: themeColors.primaryLight }]}>
              <Text style={[styles.prepNumberText, { color: themeColors.primary }]}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.prepItemTitle, { color: themeColors.textPrimary }]}>
                Record Current Medications & Supplements
              </Text>
              <Text style={[styles.prepItemBody, { color: themeColors.textSecondary }]}>
                Biotin, vitamins, and NSAIDs can interfere with thyroid and hormone immunoassays. Mention them to your lab.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Clinical Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <MaterialIcons name="info-outline" size={14} color={themeColors.textMuted} />
        <Text style={[styles.disclaimerText, { color: themeColors.textMuted }]}>
          Educational Reference Only. Standard ranges vary across testing methodologies and labs. Always review test results directly with your licensed physician.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: Spacing.lg,
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
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.xl,
  },
  summaryLabel: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
  categoriesSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionSubText: {
    fontSize: Typography.sizes.xs,
  },
  categoryChipsScroll: {
    gap: Spacing.xs + 2,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.sm,
  },
  categoryChipText: {
    fontSize: Typography.sizes.xs,
  },
  cardsSection: {
    marginBottom: Spacing.xl,
  },
  cardsList: {
    gap: Spacing.md,
  },
  biomarkerCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  cardHeaderPressable: {
    padding: Spacing.md,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginBottom: 4,
  },
  cardCategoryPillText: {
    fontSize: Typography.sizes.xs - 2,
    fontWeight: Typography.weights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    lineHeight: 22,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  rangeBadge: {
    alignItems: 'flex-end',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  rangeBadgeLabel: {
    fontSize: Typography.sizes.xs - 3,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  rangeBadgeValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  cardSummaryLine: {
    fontSize: Typography.sizes.xs + 1,
    lineHeight: Typography.lineHeights.xs + 4,
  },
  cardExpandedContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.xs,
  },
  interpretationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  interpretationLabel: {
    fontSize: Typography.sizes.xs - 2,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  interpretationText: {
    fontSize: Typography.sizes.xs + 1,
    lineHeight: Typography.lineHeights.xs + 4,
  },
  doctorQuestionBox: {
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  doctorQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorQuestionTitle: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.3,
  },
  doctorQuestionText: {
    fontSize: Typography.sizes.xs + 1,
    fontStyle: 'italic',
    lineHeight: Typography.lineHeights.xs + 4,
  },
  prepCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  prepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  prepIconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prepHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  prepSubHeading: {
    fontSize: Typography.sizes.xs,
    marginTop: 1,
  },
  prepItemsList: {
    gap: Spacing.md,
  },
  prepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  prepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  prepNumberText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  prepItemTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
  },
  prepItemBody: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs + 3,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  disclaimerText: {
    fontSize: Typography.sizes.xs - 1,
    lineHeight: Typography.lineHeights.xs + 2,
    flex: 1,
  },
  pressedOpacity: {
    opacity: 0.75,
  },
});
