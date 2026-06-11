import { Result } from '../../../../shared/result';
import { StaticRoute } from '../../domain/entities/maps.entities';
import { DomainError } from '../../domain/errors/domain.errors';
import { RouteGateway } from '../ports/maps.gateways';
export declare class GetStaticRouteUseCase {
    private readonly routeGateway;
    constructor(routeGateway: RouteGateway);
    execute(input: {
        originLat: number;
        originLon: number;
        destinationLat: number;
        destinationLon: number;
    }): Promise<Result<StaticRoute, DomainError>>;
}
