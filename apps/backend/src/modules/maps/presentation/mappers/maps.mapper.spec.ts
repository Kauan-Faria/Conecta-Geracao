import {
  GeocodeResult,
  PoiResult,
  PoiSearchResult,
  RouteResult,
  StaticRoute,
} from '../../domain/entities/maps.entities';
import { GeoPoint } from '../../domain/value-objects/geo-point.vo';
import { PoiCategory } from '../../domain/value-objects/poi-category.vo';
import { SearchRadius } from '../../domain/value-objects/search-radius.vo';
import {
  toGeocodeResponse,
  toPoiSearchResponse,
  toRouteResponse,
} from './maps.mapper';

describe('maps.mapper', () => {
  it('mapeia busca de POIs', () => {
    const search = PoiSearchResult.create({
      center: GeoPoint.create(-22.9, -47.0),
      radius: SearchRadius.create(5, 5, 10),
      category: PoiCategory.create('pharmacy'),
      results: [
        PoiResult.create({
          osmId: 'node/1',
          name: 'Farmácia',
          address: 'Rua A',
          lat: -22.91,
          lon: -47.01,
          distanceMeters: 100,
        }),
      ],
    });

    expect(toPoiSearchResponse(search)).toEqual({
      center: { lat: -22.9, lon: -47.0 },
      radiusKm: 5,
      category: 'pharmacy',
      results: [
        {
          osmId: 'node/1',
          name: 'Farmácia',
          address: 'Rua A',
          lat: -22.91,
          lon: -47.01,
          distanceMeters: 100,
        },
      ],
    });
  });

  it('mapeia geocode', () => {
    const geocode = GeocodeResult.create({
      point: GeoPoint.create(-22.9, -47.0),
      displayName: 'Centro',
    });

    expect(toGeocodeResponse(geocode)).toEqual({
      lat: -22.9,
      lon: -47.0,
      displayName: 'Centro',
    });
  });

  it('mapeia rota', () => {
    const staticRoute = StaticRoute.create({
      origin: GeoPoint.create(-22.9, -47.0),
      destination: GeoPoint.create(-22.91, -47.01),
      route: RouteResult.create({
        polyline: 'poly',
        distanceMeters: 500,
        durationSeconds: 60,
      }),
    });

    expect(toRouteResponse(staticRoute)).toEqual({
      polyline: 'poly',
      distanceMeters: 500,
      durationSeconds: 60,
    });
  });
});
