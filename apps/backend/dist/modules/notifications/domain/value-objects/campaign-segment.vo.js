"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignSegment = void 0;
const domain_errors_1 = require("../errors/domain.errors");
class CampaignSegment {
    constructor(type, firebaseUids) {
        this.type = type;
        this.firebaseUids = firebaseUids;
    }
    static create(props) {
        if (props.type === 'uid_list') {
            const uids = props.firebaseUids?.map((u) => u.trim()).filter(Boolean) ?? [];
            if (uids.length === 0) {
                throw new domain_errors_1.InvalidCampaignSegmentError('Segmento uid_list exige ao menos um firebaseUid.');
            }
            return new CampaignSegment('uid_list', uids);
        }
        return new CampaignSegment('all_active', null);
    }
}
exports.CampaignSegment = CampaignSegment;
//# sourceMappingURL=campaign-segment.vo.js.map