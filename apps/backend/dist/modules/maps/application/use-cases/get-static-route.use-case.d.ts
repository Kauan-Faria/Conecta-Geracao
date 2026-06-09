import { Result } from '../../../../shared/result';
import { StaticRoute } from '../../domain/entities/maps.entities';
import { DomainError } from '../../domain/errors/domain.errors';
import { OsrmGateway } from '../ports/maps.gateways';
export declare class GetStaticRouteUseCase {
    private readonly osrm;
    constructor(osrm: OsrmGateway);
    execute(input: {
        originLat: number;
        originLon: number;
        destinationLat: number;
        destinationLon: number;
    }): Promise<Result<StaticRoute, DomainError>>;
}
