import { renderHook } from '@testing-library/react';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useObjectMetadataItemById', () => {
  const projectObjectMetadata = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'project',
  );

  if (!projectObjectMetadata) {
    throw new Error('Project object metadata not found');
  }

  it('should return correct properties', async () => {
    const { result } = renderHook(
      () =>
        useObjectMetadataItemById({
          objectId: projectObjectMetadata.id,
        }),
      {
        wrapper: Wrapper,
      },
    );

    const { objectMetadataItem } = result.current;

    expect(objectMetadataItem?.id).toBe(projectObjectMetadata.id);
  });

  it('should throw an error when invalid ID is provided', async () => {
    expect(() =>
      renderHook(() => useObjectMetadataItemById({ objectId: 'invalid-id' }), {
        wrapper: Wrapper,
      }),
    ).toThrow(`Object metadata item not found for id invalid-id`);
  });
});
