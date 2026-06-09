import { MapAction, MapActionJson } from './map-action.vo';
export interface MessageMetadataJson {
    map_action?: MapActionJson;
}
export declare class MessageMetadata {
    static fromMapAction(mapAction: MapAction): MessageMetadataJson;
    static isEmpty(metadata: MessageMetadataJson | null | undefined): boolean;
}
