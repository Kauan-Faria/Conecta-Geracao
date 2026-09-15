import { MapAction, MapActionJson } from './map-action.vo';
import { isReplyMode, ReplyMode } from './reply-mode.vo';

export interface MessageMetadataJson {
  map_action?: MapActionJson;
  replyMode?: ReplyMode;
}

export class MessageMetadata {
  static fromMapAction(mapAction: MapAction): MessageMetadataJson {
    return { map_action: mapAction.toJson() };
  }

  static compose(input: {
    replyMode?: ReplyMode;
    mapAction?: MapAction;
  }): MessageMetadataJson | null {
    const json: MessageMetadataJson = {};
    if (input.replyMode) {
      json.replyMode = input.replyMode;
    }
    if (input.mapAction) {
      json.map_action = input.mapAction.toJson();
    }
    return this.isEmpty(json) ? null : json;
  }

  static isEmpty(metadata: MessageMetadataJson | null | undefined): boolean {
    return !metadata || (!metadata.map_action && !metadata.replyMode);
  }

  static replyModeOf(metadata: MessageMetadataJson | null | undefined): ReplyMode | undefined {
    return metadata && isReplyMode(metadata.replyMode) ? metadata.replyMode : undefined;
  }
}
