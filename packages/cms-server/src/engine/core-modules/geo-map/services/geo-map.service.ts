import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'cms-shared/utils';

import {
  type AutocompleteSanitizedResult,
  sanitizeAutocompleteResults,
} from 'src/engine/core-modules/geo-map/utils/sanitize-autocomplete-results.util';
import {
  type AddressFields,
  sanitizePlaceDetailsResults,
} from 'src/engine/core-modules/geo-map/utils/sanitize-place-details-results.util';
import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

@Injectable()
export class GeoMapService {
  private apiMapKey: string | undefined;
  constructor(
    private readonly cmsConfigService: CMSConfigService,
    private readonly httpService: HttpService,
  ) {
    if (
      !this.cmsConfigService.get(
        'IS_MAPS_AND_ADDRESS_AUTOCOMPLETE_ENABLED',
      ) ||
      !this.cmsConfigService.get('GOOGLE_MAP_API_KEY')
    ) {
      return;
    }
    this.apiMapKey = this.cmsConfigService.get('GOOGLE_MAP_API_KEY');
  }

  public async getAutoCompleteAddress(
    address: string,
    token: string,
    country?: string,
    isFieldCity?: boolean,
  ): Promise<AutocompleteSanitizedResult[] | undefined> {
    if (!isNonEmptyString(address?.trim())) {
      return [];
    }

    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&sessiontoken=${token}&key=${this.apiMapKey}`;

    if (isNonEmptyString(country)) {
      url += `&components=country:${country}`;
    }
    if (isDefined(isFieldCity) && isFieldCity === true) {
      url += `&types=(cities)`;
    }
    const result = await this.httpService.axiosRef.get(url);

    if (result.data.status === 'OK') {
      return sanitizeAutocompleteResults(result.data.predictions);
    }

    return [];
  }

  public async getAddressDetails(
    placeId: string,
    token: string,
  ): Promise<AddressFields | undefined> {
    const result = await this.httpService.axiosRef.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&sessiontoken=${token}&fields=address_components%2Cgeometry&key=${this.apiMapKey}`,
    );

    if (result.data.status === 'OK') {
      return sanitizePlaceDetailsResults(
        result.data.result?.address_components,
        result.data.result?.geometry?.location,
      );
    }

    return {};
  }
}
