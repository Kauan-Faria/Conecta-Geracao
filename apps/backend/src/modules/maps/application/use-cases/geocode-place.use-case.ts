import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '../../../../shared/result';
import { GeocodeResult } from '../../domain/entities/maps.entities';
import {
  DomainError,
  PlaceNotFoundError,
} from '../../domain/errors/domain.errors';
import { PlaceQuery } from '../../domain/value-objects/place-query.vo';
import { NOMINATIM_GATEWAY, NominatimGateway } from '../ports/maps.gateways';

@Injectable()
export class GeocodePlaceUseCase {
  constructor(
    @Inject(NOMINATIM_GATEWAY)
    private readonly nominatim: NominatimGateway,
  ) {}

  async execute(queryText: string): Promise<Result<GeocodeResult, DomainError>> {
    try {
      const query = PlaceQuery.create(queryText);
      const result = await this.nominatim.geocode(query);

      if (!result) {
        return err(new PlaceNotFoundError());
      }

      return ok(result);
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
  }
}
