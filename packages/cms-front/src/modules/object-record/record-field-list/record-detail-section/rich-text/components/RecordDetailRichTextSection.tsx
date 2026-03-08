import { useContext, useMemo } from 'react';
import { useRecoilCallback } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordDetailSectionContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailSectionContainer';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldRichTextV2Value } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { parseInitialBlocknote } from '@/ui/input/editor/utils/parseInitialBlocknote';
import { prepareBodyWithSignedUrls } from '@/ui/input/editor/utils/prepareBodyWithSignedUrls';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'cms-shared/utils';

const StyledEditorContainer = styled.div`
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
  min-height: 200px;
`;

type RecordDetailRichTextSectionProps = {
  loading: boolean;
};

export const RecordDetailRichTextSection = ({
  loading,
}: RecordDetailRichTextSectionProps) => {
  const { recordId, fieldDefinition, isRecordFieldReadOnly } =
    useContext(FieldContext);
  const fieldName = fieldDefinition.metadata.fieldName;
  const objectNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular ?? '';

  const cache = useApolloCoreClient().cache;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fieldValue = useRecoilValue<FieldRichTextV2Value | null>(
    recordStoreFamilySelector({ recordId, fieldName }),
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular,
  });

  const persistBodyDebounced = useDebouncedCallback((blocknote: string) => {
    if (isRecordFieldReadOnly) return;

    updateOneRecord({
      idToUpdate: recordId,
      updateOneRecordInput: {
        [fieldName]: {
          blocknote,
          markdown: null,
        },
      },
    });
  }, 300);

  const handleBodyChange = useRecoilCallback(
    ({ set }) =>
      (newStringifiedBody: string) => {
        if (isRecordFieldReadOnly) return;

        set(recordStoreFamilyState(recordId), (oldRecord) => {
          if (!oldRecord) return oldRecord;
          return {
            ...oldRecord,
            id: recordId,
            [fieldName]: {
              blocknote: newStringifiedBody,
              markdown: null,
            },
          };
        });

        modifyRecordFromCache({
          recordId,
          fieldModifiers: {
            [fieldName]: () => {
              return {
                blocknote: newStringifiedBody,
                markdown: null,
              };
            },
          },
          cache,
          objectMetadataItem,
        });

        persistBodyDebounced(prepareBodyWithSignedUrls(newStringifiedBody));
      },
    [
      recordId,
      fieldName,
      cache,
      objectMetadataItem,
      persistBodyDebounced,
      isRecordFieldReadOnly,
    ],
  );

  const handleBodyChangeDebounced = useDebouncedCallback(handleBodyChange, 500);

  const handleEditorChange = () => {
    const newStringifiedBody = JSON.stringify(editor.document) ?? '';
    handleBodyChangeDebounced(newStringifiedBody);
  };

  const initialBody = useMemo(() => {
    if (!isDefined(fieldValue)) {
      return undefined;
    }

    return parseInitialBlocknote(
      fieldValue?.blocknote,
      `Failed to parse body for field ${fieldName}`,
    );
  }, [fieldValue, fieldName]);

  const editor = useCreateBlockNote({
    initialContent: initialBody,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
  });

  if (loading) return null;

  return (
    <RecordDetailSectionContainer
      title={fieldDefinition.label}
      areRecordsAvailable={true}
      hideRightAdornmentOnMouseLeave={true}
    >
      <StyledEditorContainer>
        <BlockEditor
          onChange={handleEditorChange}
          editor={editor}
          readonly={isRecordFieldReadOnly ?? false}
        />
      </StyledEditorContainer>
    </RecordDetailSectionContainer>
  );
};
