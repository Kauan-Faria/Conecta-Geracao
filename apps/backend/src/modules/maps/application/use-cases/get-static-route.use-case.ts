import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '../../../../shared/result';
import { StaticRoute } from '../../domain/entities/maps.entities';
import {
  DomainError,
  RouteNotFoundError,
  SameOriginDestinationError,
} from '../../domain/errors/domain.errors';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { OSRM_GATEWAY, OsrmGateway } from '../ports/maps.gateways';

@Injectable()
export class GetStaticRouteUseCase {
  constructor(
    @Inject(OSRM_GATEWAY)
    private readonly osrm: OsrmGateway,
  ) {}

  async execute(input: {
    originLat: number;
    originLon: number;
    destinationLat: number;
    destinationLon: number;
  }): Promise<Result<StaticRoute, DomainError>> {
    try {
      const origin = GeoPoint.create(input.originLat, input.originLon);
      const destination = GeoPoint.create(input.destinationLat, input.destinationLon);

      if (origin.equals(destination)) {
        return err(new SameOriginDestinationError());
      }

      const route = await this.osrm.getRoute(origin, destination);
      if (!route) {
        return err(new RouteNotFoundError());
      }

      return ok(
        StaticRoute.create({
          origin,
          destination,
          route,
        }),
      );
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
  }
}
