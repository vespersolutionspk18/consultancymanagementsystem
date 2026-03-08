import styled from '@emotion/styled';
import { useCallback, useMemo } from 'react';

import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type RelationTableCardConfiguration } from '@/object-record/record-show/types/CardConfiguration';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'cms-shared/types';
import { IconPlus } from 'cms-ui/display';
import { Button } from 'cms-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'cms-ui/layout';

const StyledTableContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTableHeader = styled.thead`
  background-color: ${({ theme }) => theme.background.secondary};
  position: sticky;
  top: 0;
  z-index: 1;
`;

const StyledTableHeaderCell = styled.th`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  text-align: left;
  white-space: nowrap;
`;

const StyledTableBody = styled.tbody``;

const StyledTableRow = styled.tr`
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledTableCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type RelationTableCardProps = {
  configuration?: RelationTableCardConfiguration;
};

export const RelationTableCard = ({
  configuration,
}: RelationTableCardProps) => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const { objectMetadataItem: targetObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular: targetRecordIdentifier?.targetObjectNameSingular ?? '',
    },
  );

  // Find the relation field metadata
  const relationFieldMetadata = useMemo(() => {
    if (!configuration?.relationFieldName || !targetObjectMetadataItem) {
      return null;
    }
    return targetObjectMetadataItem.fields.find(
      (field) =>
        field.name === configuration.relationFieldName &&
        field.type === FieldMetadataType.RELATION,
    );
  }, [configuration?.relationFieldName, targetObjectMetadataItem]);

  // Get the related object name from the relation metadata
  const relatedObjectNameSingular = useMemo(() => {
    if (!relationFieldMetadata?.relation) {
      return null;
    }
    return relationFieldMetadata.relation.targetObjectMetadata.nameSingular;
  }, [relationFieldMetadata]);

  const { objectMetadataItem: relatedObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relatedObjectNameSingular ?? '',
    });

  // Get displayable fields for the table columns (exclude system and relation fields)
  const displayableFields = useMemo(() => {
    if (!relatedObjectMetadataItem) {
      return [];
    }
    return relatedObjectMetadataItem.fields.filter(
      (field) =>
        !field.isSystem &&
        field.isActive &&
        field.type !== FieldMetadataType.RELATION &&
        field.type !== FieldMetadataType.UUID &&
        field.type !== FieldMetadataType.POSITION &&
        field.type !== FieldMetadataType.ACTOR &&
        field.name !== 'createdAt' &&
        field.name !== 'updatedAt' &&
        field.name !== 'deletedAt',
    );
  }, [relatedObjectMetadataItem]);

  // Build the filter for fetching related records
  const filter = useMemo(() => {
    if (!targetRecordIdentifier?.id || !relationFieldMetadata?.relation) {
      return {};
    }
    // The foreign key field name is typically the target field name + 'Id'
    const foreignKeyFieldName =
      relationFieldMetadata.relation.targetFieldMetadata?.name;
    if (foreignKeyFieldName) {
      return {
        [`${foreignKeyFieldName}Id`]: {
          eq: targetRecordIdentifier.id,
        },
      };
    }
    return {};
  }, [targetRecordIdentifier?.id, relationFieldMetadata]);

  const { records, loading } = useFindManyRecords({
    objectNameSingular: relatedObjectNameSingular ?? '',
    filter,
    skip: !relatedObjectNameSingular || !targetRecordIdentifier?.id,
  });

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relatedObjectNameSingular ?? '',
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  // Get the foreign key field name for creating records linked to the parent
  const foreignKeyIdFieldName = useMemo(() => {
    if (!relationFieldMetadata?.relation?.targetFieldMetadata?.name) {
      return null;
    }
    return `${relationFieldMetadata.relation.targetFieldMetadata.name}Id`;
  }, [relationFieldMetadata]);

  const handleAddRecord = useCallback(async () => {
    if (!relatedObjectNameSingular || !targetRecordIdentifier?.id || !foreignKeyIdFieldName) {
      return;
    }

    const createdRecord = await createOneRecord({
      [foreignKeyIdFieldName]: targetRecordIdentifier.id,
    });

    if (createdRecord) {
      openRecordInCommandMenu({
        recordId: createdRecord.id,
        objectNameSingular: relatedObjectNameSingular,
        isNewRecord: true,
      });
    }
  }, [
    createOneRecord,
    foreignKeyIdFieldName,
    openRecordInCommandMenu,
    relatedObjectNameSingular,
    targetRecordIdentifier?.id,
  ]);

  const handleRowClick = useCallback(
    (recordId: string) => {
      if (!relatedObjectNameSingular) {
        return;
      }
      openRecordInCommandMenu({
        recordId,
        objectNameSingular: relatedObjectNameSingular,
        isNewRecord: false,
      });
    },
    [openRecordInCommandMenu, relatedObjectNameSingular],
  );

  const formatCellValue = (value: unknown, fieldType: FieldMetadataType): string => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (fieldType) {
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME:
        return new Date(value as string).toLocaleDateString();
      case FieldMetadataType.NUMBER:
        return String(value);
      case FieldMetadataType.CURRENCY:
        if (typeof value === 'object' && value !== null) {
          const currencyValue = value as { amountMicros?: number; currencyCode?: string };
          if (currencyValue.amountMicros !== undefined) {
            return `${(currencyValue.amountMicros / 1000000).toLocaleString()} ${currencyValue.currencyCode || ''}`.trim();
          }
        }
        return '-';
      case FieldMetadataType.RICH_TEXT_V2:
        if (typeof value === 'string') {
          // Strip HTML/markdown for table display
          return value.replace(/<[^>]*>/g, '').substring(0, 100);
        }
        return '-';
      default:
        return String(value);
    }
  };

  if (!configuration?.relationFieldName) {
    return null;
  }

  if (loading) {
    return (
      <StyledLoadingContainer>
        {t`Loading...`}
      </StyledLoadingContainer>
    );
  }

  if (!records || records.length === 0) {
    return (
      <AnimatedPlaceholderEmptyContainer
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noRecord" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No records`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`There are no ${configuration.title || 'records'} associated with this record.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconPlus}
          title={t`Add ${configuration.title || 'record'}`}
          variant="secondary"
          onClick={handleAddRecord}
        />
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledTableContainer>
      <StyledTitleRow>
        {configuration.title && <StyledTitle>{configuration.title}</StyledTitle>}
        <Button
          Icon={IconPlus}
          title={t`Add`}
          variant="secondary"
          size="small"
          onClick={handleAddRecord}
        />
      </StyledTitleRow>
      <StyledTable>
        <StyledTableHeader>
          <tr>
            {displayableFields.map((field) => (
              <StyledTableHeaderCell key={field.id}>
                {field.label}
              </StyledTableHeaderCell>
            ))}
          </tr>
        </StyledTableHeader>
        <StyledTableBody>
          {records.map((record) => (
            <StyledTableRow
              key={record.id}
              onClick={() => handleRowClick(record.id)}
            >
              {displayableFields.map((field) => (
                <StyledTableCell key={field.id}>
                  {formatCellValue(
                    (record as Record<string, unknown>)[field.name],
                    field.type,
                  )}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </StyledTableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};
