import { Result } from '../../../../shared/result';
import { GeocodeResult } from '../../domain/entities/maps.entities';
import { DomainError } from '../../domain/errors/domain.errors';
import { NominatimGateway } from '../ports/maps.gateways';
export declare class GeocodePlaceUseCase {
    private readonly nominatim;
    constructor(nominatim: NominatimGateway);
    execute(queryText: string): Promise<Result<GeocodeResult, DomainError>>;
}
