import { MapAction, MapActionJson } from './map-action.vo';

export interface MessageMetadataJson {
  map_action?: MapActionJson;
}

export class MessageMetadata {
  static fromMapAction(mapAction: MapAction): MessageMetadataJson {
    return { map_action: mapAction.toJson() };
  }

  static isEmpty(metadata: MessageMetadataJson | null | undefined): boolean {
    return !metadata || !metadata.map_action;
  }
}
