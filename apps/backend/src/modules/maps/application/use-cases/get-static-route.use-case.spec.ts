import { GetStaticRouteUseCase } from './get-static-route.use-case';
import { RouteResult } from '../../domain/entities/maps.entities';
import { RouteGateway } from '../ports/maps.gateways';

describe('GetStaticRouteUseCase', () => {
  const route = RouteResult.create({
    polyline: 'abc123',
    distanceMeters: 1200,
    durationSeconds: 180,
  });

  it('retorna rota quando Google Directions responde', async () => {
    const routeGateway: Pick<RouteGateway, 'getRoute'> = {
      getRoute: jest.fn().mockResolvedValue(route),
    };
    const useCase = new GetStaticRouteUseCase(routeGateway as RouteGateway);

    const result = await useCase.execute({
      originLat: -22.9056,
      originLon: -47.0608,
      destinationLat: -22.91,
      destinationLon: -47.065,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.route.polyline).toBe('abc123');
    }
  });

  it('rejeita origem igual ao destino', async () => {
    const routeGateway: Pick<RouteGateway, 'getRoute'> = {
      getRoute: jest.fn(),
    };
    const useCase = new GetStaticRouteUseCase(routeGateway as RouteGateway);

    const result = await useCase.execute({
      originLat: -22.9056,
      originLon: -47.0608,
      destinationLat: -22.9056,
      destinationLon: -47.0608,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('SAME_ORIGIN_DESTINATION');
    }
    expect(routeGateway.getRoute).not.toHaveBeenCalled();
  });

  it('retorna erro quando Google Directions não encontra rota', async () => {
    const routeGateway: Pick<RouteGateway, 'getRoute'> = {
      getRoute: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetStaticRouteUseCase(routeGateway as RouteGateway);

    const result = await useCase.execute({
      originLat: -22.9056,
      originLon: -47.0608,
      destinationLat: -22.91,
      destinationLon: -47.065,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('ROUTE_NOT_FOUND');
    }
  });
});
