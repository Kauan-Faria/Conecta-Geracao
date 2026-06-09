import { GeocodeResult } from '../../domain/entities/maps.entities';
export declare class InMemoryGeocodeCache {
    private readonly forward;
    private readonly reverse;
    getForward(key: string, ttlMs: number): GeocodeResult | null;
    setForward(key: string, value: GeocodeResult, ttlMs: number): void;
    getReverse(key: string, ttlMs: number): GeocodeResult | null;
    setReverse(key: string, value: GeocodeResult, ttlMs: number): void;
    private get;
    private set;
}
