"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
class Campaign {
    constructor(props) {
        this.id = props.id;
        this.title = props.title;
        this.body = props.body;
        this.deepLink = props.deepLink;
        this.segmentType = props.segmentType;
        this.segmentPayload = props.segmentPayload;
        this.status = props.status;
        this.requestedBy = props.requestedBy;
        this.requestedAt = props.requestedAt;
        this.completedAt = props.completedAt;
        this.sentCount = props.sentCount;
        this.skippedCount = props.skippedCount;
        this.idempotencyKey = props.idempotencyKey;
    }
    static createPending(props) {
        return new Campaign({
            title: props.title,
            body: props.body,
            deepLink: props.deepLink,
            segmentType: props.segmentType,
            segmentPayload: props.segmentPayload ?? null,
            status: 'pending',
            requestedBy: props.requestedBy,
            requestedAt: new Date(),
            completedAt: null,
            sentCount: 0,
            skippedCount: 0,
            idempotencyKey: props.idempotencyKey ?? null,
        });
    }
    markProcessing() {
        return new Campaign({ ...this.toProps(), status: 'processing' });
    }
    markCompleted(sentCount, skippedCount) {
        return new Campaign({
            ...this.toProps(),
            status: 'completed',
            completedAt: new Date(),
            sentCount,
            skippedCount,
        });
    }
    static reconstitute(props) {
        return new Campaign({
            id: props.id,
            title: props.title,
            body: props.body,
            deepLink: props.deepLink,
            segmentType: props.segmentType,
            segmentPayload: props.segmentPayload ?? null,
            status: props.status,
            requestedBy: props.requestedBy,
            requestedAt: props.requestedAt ?? new Date(),
            completedAt: props.completedAt ?? null,
            sentCount: props.sentCount,
            skippedCount: props.skippedCount,
            idempotencyKey: props.idempotencyKey ?? null,
        });
    }
    toProps() {
        return {
            id: this.id,
            title: this.title,
            body: this.body,
            deepLink: this.deepLink,
            segmentType: this.segmentType,
            segmentPayload: this.segmentPayload,
            status: this.status,
            requestedBy: this.requestedBy,
            requestedAt: this.requestedAt,
            completedAt: this.completedAt,
            sentCount: this.sentCount,
            skippedCount: this.skippedCount,
            idempotencyKey: this.idempotencyKey,
        };
    }
}
exports.Campaign = Campaign;
//# sourceMappingURL=campaign.entity.js.map