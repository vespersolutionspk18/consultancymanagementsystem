import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { type CMS_STANDARD_ALL_METADATA_NAME } from 'src/engine/workspace-manager/cms-standard-application/constants/cms-standard-all-metadata-name.constant';

export type CMSStandardAllFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  MetadataToFlatEntityMapsKey<
    (typeof CMS_STANDARD_ALL_METADATA_NAME)[number]
  >
>;
