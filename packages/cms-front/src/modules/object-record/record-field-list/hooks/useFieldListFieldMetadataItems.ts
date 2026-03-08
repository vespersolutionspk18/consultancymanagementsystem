import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import groupBy from 'lodash.groupby';
import { FieldMetadataType } from 'cms-shared/types';
import { isDefined } from 'cms-shared/utils';

type UseFieldListFieldMetadataItemsProps = {
  objectNameSingular: string;
  excludeFieldMetadataIds?: string[];
  excludeFieldNames?: string[];
  excludeRelationFieldNames?: string[];
  includeRelationFieldNames?: string[];
  excludeCreatedAtAndUpdatedAt?: boolean;
  showRelationSections?: boolean;
};

export const useFieldListFieldMetadataItems = ({
  objectNameSingular,
  excludeFieldMetadataIds = [],
  excludeFieldNames = [],
  excludeRelationFieldNames = [],
  includeRelationFieldNames,
  showRelationSections = true,
  excludeCreatedAtAndUpdatedAt = true,
}: UseFieldListFieldMetadataItemsProps) => {
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const availableFieldMetadataItems = objectMetadataItem.readableFields
    .filter(
      (fieldMetadataItem) =>
        isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
        fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id &&
        !excludeFieldMetadataIds.includes(fieldMetadataItem.id) &&
        !excludeFieldNames.includes(fieldMetadataItem.name) &&
        (!excludeCreatedAtAndUpdatedAt ||
          (fieldMetadataItem.name !== 'createdAt' &&
            fieldMetadataItem.name !== 'deletedAt')) &&
        (showRelationSections ||
          (fieldMetadataItem.type !== FieldMetadataType.RELATION &&
            fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION)),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) => {
      // Custom ordering for Company: sectors, then expertise, then accountOwner
      if (objectNameSingular === CoreObjectNameSingular.Company) {
        const customOrder: Record<string, number> = {
          sectors: 0,
          expertise: 1,
          accountOwner: 2,
        };
        const orderA = customOrder[fieldMetadataItemA.name] ?? 999;
        const orderB = customOrder[fieldMetadataItemB.name] ?? 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
      }
      // Custom ordering for Project: sectors, then rich text fields, then companies
      if (objectNameSingular === CoreObjectNameSingular.Project) {
        const customOrder: Record<string, number> = {
          sectors: 0,
          documentsAvailableAndApplication: 1,
          procurementDetails: 2,
          companies: 3,
        };
        const orderA = customOrder[fieldMetadataItemA.name] ?? 999;
        const orderB = customOrder[fieldMetadataItemB.name] ?? 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
      }
      return fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name);
    });

  const { inlineFieldMetadataItems, relationFieldMetadataItems } = groupBy(
    availableFieldMetadataItems
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.name !== 'createdAt' &&
          fieldMetadataItem.name !== 'deletedAt',
      )
      .filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type !== FieldMetadataType.RICH_TEXT_V2,
      ),
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.RELATION ||
      fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION
        ? 'relationFieldMetadataItems'
        : 'inlineFieldMetadataItems',
  );

  const inlineRelationFieldMetadataItems = (
    relationFieldMetadataItems ?? []
  ).filter(
    (fieldMetadataItem) =>
      (objectNameSingular === CoreObjectNameSingular.Note &&
        fieldMetadataItem.name === 'noteTargets') ||
      (objectNameSingular === CoreObjectNameSingular.Task &&
        fieldMetadataItem.name === 'taskTargets'),
  );

  const boxedRelationFieldMetadataItems = (relationFieldMetadataItems ?? [])
    .filter(
      (fieldMetadataItem) =>
        !(
          (objectNameSingular === CoreObjectNameSingular.Note &&
            fieldMetadataItem.name === 'noteTargets') ||
          (objectNameSingular === CoreObjectNameSingular.Task &&
            fieldMetadataItem.name === 'taskTargets')
        ),
    )
    .filter(
      (fieldMetadataItem) =>
        !excludeRelationFieldNames.includes(fieldMetadataItem.name),
    )
    .filter(
      (fieldMetadataItem) =>
        !includeRelationFieldNames ||
        includeRelationFieldNames.length === 0 ||
        includeRelationFieldNames.includes(fieldMetadataItem.name),
    )
    .filter((fieldMetadataItem) => {
      const canReadRelation =
        isDefined(fieldMetadataItem.relation?.targetObjectMetadata.id) &&
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          fieldMetadataItem.relation?.targetObjectMetadata.id,
        ).canReadObjectRecords;

      const canReadMorphRelation = fieldMetadataItem?.morphRelations?.every(
        (morphRelation) =>
          isDefined(morphRelation.targetObjectMetadata.id) &&
          getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            morphRelation.targetObjectMetadata.id,
          ).canReadObjectRecords,
      );

      return canReadRelation || canReadMorphRelation;
    });

  // Rich text fields for Project and Company (to be rendered after sectors)
  const richTextV2FieldMetadataItems =
    objectNameSingular === CoreObjectNameSingular.Project ||
    objectNameSingular === CoreObjectNameSingular.Company
      ? availableFieldMetadataItems
          .filter(
            (fieldMetadataItem) =>
              fieldMetadataItem.type === FieldMetadataType.RICH_TEXT_V2,
          )
          .sort((a, b) => {
            const order: Record<string, number> = {
              // Project fields
              documentsAvailableAndApplication: 0,
              procurementDetails: 1,
              // Company fields
              expertise: 0,
            };
            return (order[a.name] ?? 999) - (order[b.name] ?? 999);
          })
      : [];

  return {
    inlineFieldMetadataItems,
    inlineRelationFieldMetadataItems,
    boxedRelationFieldMetadataItems,
    richTextV2FieldMetadataItems,
  };
};
