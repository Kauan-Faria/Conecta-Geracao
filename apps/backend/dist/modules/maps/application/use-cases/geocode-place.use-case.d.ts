import { Result } from '../../../../shared/result';
import { GeocodeResult } from '../../domain/entities/maps.entities';
import { DomainError } from '../../domain/errors/domain.errors';
import { GeocodingGateway } from '../ports/maps.gateways';
export declare class GeocodePlaceUseCase {
    private readonly geocoding;
    constructor(geocoding: GeocodingGateway);
    execute(queryText: string): Promise<Result<GeocodeResult, DomainError>>;
}
