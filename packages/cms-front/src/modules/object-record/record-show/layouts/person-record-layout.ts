import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';

export const PERSON_RECORD_LAYOUT: RecordLayout = {
  tabs: {
    // Override fields tab to exclude the new relation fields from Home view
    fields: {
      title: 'Fields',
      icon: 'IconList',
      position: 100,
      cards: [
        {
          type: CardType.FieldCard,
          configuration: {
            excludeRelationFieldNames: [
              'educations',
              'certifications',
              'pastExperiences',
              'employmentRecords',
            ],
          },
        },
      ],
      hide: {
        ifMobile: false,
        ifDesktop: true,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    // Position 210-230: Right after Home (Timeline at 200), before Tasks (300)
    education: {
      title: 'Education',
      position: 210,
      icon: 'IconSchool',
      cards: [
        {
          type: CardType.RelationTableCard,
          configuration: {
            relationFieldName: 'educations',
            title: 'Education',
          },
        },
      ],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Education],
        ifRelationsMissing: ['educations'],
      },
    },
    certifications: {
      title: 'Certifications',
      position: 215,
      icon: 'IconCertificate',
      cards: [
        {
          type: CardType.RelationTableCard,
          configuration: {
            relationFieldName: 'certifications',
            title: 'Certifications',
          },
        },
      ],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Certification],
        ifRelationsMissing: ['certifications'],
      },
    },
    pastExperience: {
      title: 'Past Experience',
      position: 220,
      icon: 'IconBriefcase',
      cards: [
        {
          type: CardType.RelationTableCard,
          configuration: {
            relationFieldName: 'pastExperiences',
            title: 'Past Experience',
          },
        },
      ],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.PastExperience],
        ifRelationsMissing: ['pastExperiences'],
      },
    },
    employmentRecord: {
      title: 'Employment Record',
      position: 225,
      icon: 'IconBuilding',
      cards: [
        {
          type: CardType.RelationTableCard,
          configuration: {
            relationFieldName: 'employmentRecords',
            title: 'Employment Record',
          },
        },
      ],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.EmploymentRecord],
        ifRelationsMissing: ['employmentRecords'],
      },
    },
    emails: {
      title: 'Emails',
      position: 600,
      icon: 'IconMail',
      cards: [{ type: CardType.EmailCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    calendar: {
      title: 'Calendar',
      position: 700,
      icon: 'IconCalendarEvent',
      cards: [{ type: CardType.CalendarCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
  },
};
