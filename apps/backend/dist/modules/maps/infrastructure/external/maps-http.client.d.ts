import { MapsConfig } from '../config/maps.config';
export declare class MapsHttpClient {
    private readonly config;
    constructor(config: MapsConfig);
    request(url: string, init?: RequestInit): Promise<Response>;
    assertOk(response: Response, service: string): void;
    private serviceFromUrl;
}
