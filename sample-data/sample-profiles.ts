export type TestResult = {
  name: string;
  value: string;
  referenceRange: string;
  severity: 'normal' | 'mild' | 'high' | 'low';
  explanation: string;
};

export type Profile = {
  id: string;
  name: string;
  relation: string;
  reports: {
    date: string;
    tests: TestResult[];
  }[];
};

export const sampleProfiles: Profile[] = [
  {
    id: 'dad',
    name: 'Dad',
    relation: 'Father',
    reports: [
      {
        date: '2026-01-15',
        tests: [
          {
            name: 'Cholesterol',
            value: '210 mg/dL',
            referenceRange: 'Upto 200',
            severity: 'high',
            explanation: 'Total cholesterol is above the recommended limit.',
          },
          {
            name: 'Haemoglobin',
            value: '14.2 g%',
            referenceRange: '14 - 16 g%',
            severity: 'normal',
            explanation: 'Haemoglobin is within the normal range.',
          },
        ],
      },
      {
        date: '2026-04-10',
        tests: [
          {
            name: 'Cholesterol',
            value: '225 mg/dL',
            referenceRange: 'Upto 200',
            severity: 'high',
            explanation: 'Cholesterol remains elevated and has increased since the last report.',
          },
          {
            name: 'Haemoglobin',
            value: '14.0 g%',
            referenceRange: '14 - 16 g%',
            severity: 'normal',
            explanation: 'Haemoglobin is within the normal range.',
          },
        ],
      },
    ],
  },
  {
    id: 'mom',
    name: 'Mom',
    relation: 'Mother',
    reports: [
      {
        date: '2026-02-05',
        tests: [
          {
            name: 'TSH',
            value: '5.8 mIU/L',
            referenceRange: '0.4 - 4.0',
            severity: 'high',
            explanation: 'Thyroid stimulating hormone is elevated, which may indicate an underactive thyroid.',
          },
          {
            name: 'Vitamin D',
            value: '18 ng/mL',
            referenceRange: '30 - 100',
            severity: 'low',
            explanation: 'Vitamin D level is below the recommended range.',
          },
        ],
      },
    ],
  },
];