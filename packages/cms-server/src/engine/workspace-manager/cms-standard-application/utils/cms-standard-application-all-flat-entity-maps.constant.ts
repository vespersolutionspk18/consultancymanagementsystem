import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type CMSStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/cms-standard-application/types/cms-standard-all-flat-entity-maps.type';
import { buildStandardFlatAgentMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/agent-metadata/build-standard-flat-agent-metadata-maps.util';
import { buildStandardFlatFieldMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/field-metadata/build-standard-flat-field-metadata-maps.util';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/cms-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { buildStandardFlatIndexMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/index/build-standard-flat-index-metadata-maps.util';
import { buildStandardFlatObjectMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/object-metadata/build-standard-flat-object-metadata-maps.util';
import { buildStandardFlatRoleMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/role-metadata/build-standard-flat-role-metadata-maps.util';
import { buildStandardFlatViewFieldMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/view-field/build-standard-flat-view-field-metadata-maps.util';
import { buildStandardFlatViewFilterMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/view-filter/build-standard-flat-view-filter-metadata-maps.util';
import { buildStandardFlatViewGroupMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/view-group/build-standard-flat-view-group-metadata-maps.util';
import { buildStandardFlatViewMetadataMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/view/build-standard-flat-view-metadata-maps.util';

export type ComputeCMSStandardApplicationAllFlatEntityMapsArgs = {
  now: string;
  workspaceId: string;
  cmsStandardApplicationId: string;
};

export const computeCMSStandardApplicationAllFlatEntityMaps = ({
  now,
  workspaceId,
  cmsStandardApplicationId,
}: ComputeCMSStandardApplicationAllFlatEntityMapsArgs): CMSStandardAllFlatEntityMaps => {
  const standardObjectMetadataRelatedEntityIds =
    getStandardObjectMetadataRelatedEntityIds();

  const flatObjectMetadataMaps = buildStandardFlatObjectMetadataMaps({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    cmsStandardApplicationId,
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
    },
  });

  const flatFieldMetadataMaps = buildStandardFlatFieldMetadataMaps({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps,
    },
    cmsStandardApplicationId,
  });

  const flatIndexMaps = buildStandardFlatIndexMetadataMaps({
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    workspaceId,
    cmsStandardApplicationId,
  });

  const flatViewMaps = buildStandardFlatViewMetadataMaps({
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    cmsStandardApplicationId,
    workspaceId,
  });

  const flatViewGroupMaps = buildStandardFlatViewGroupMetadataMaps({
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatViewMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    cmsStandardApplicationId,
    workspaceId,
  });

  const flatViewFilterMaps = buildStandardFlatViewFilterMetadataMaps({
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatViewMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    cmsStandardApplicationId,
    workspaceId,
  });

  const flatViewFieldMaps = buildStandardFlatViewFieldMetadataMaps({
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    cmsStandardApplicationId,
    workspaceId,
  });

  const flatRoleMaps = buildStandardFlatRoleMetadataMaps({
    now,
    workspaceId,
    cmsStandardApplicationId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps: undefined,
  });

  const flatAgentMaps = buildStandardFlatAgentMetadataMaps({
    now,
    workspaceId,
    cmsStandardApplicationId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps: {
      flatRoleMaps,
    },
  });

  return {
    flatViewFieldMaps,
    flatViewFilterMaps,
    flatViewGroupMaps,
    flatViewMaps,
    flatIndexMaps,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatRoleMaps,
    flatAgentMaps,
  };
};
