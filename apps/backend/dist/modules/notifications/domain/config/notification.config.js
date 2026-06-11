"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInactivityThresholdHours = getInactivityThresholdHours;
exports.getReminderCooldownHours = getReminderCooldownHours;
exports.getNotificationJobBatchLimit = getNotificationJobBatchLimit;
exports.isFcmEnabled = isFcmEnabled;
exports.getTipWeeklyDays = getTipWeeklyDays;
exports.getCampaignBatchLimit = getCampaignBatchLimit;
exports.getTipJobBatchLimit = getTipJobBatchLimit;
exports.getInternalServiceKey = getInternalServiceKey;
function getInactivityThresholdHours() {
    const raw = Number.parseInt(process.env.NOTIFICATION_INACTIVITY_HOURS ?? '24', 10);
    if (Number.isNaN(raw))
        return 24;
    return Math.min(168, Math.max(1, raw));
}
function getReminderCooldownHours() {
    const raw = Number.parseInt(process.env.NOTIFICATION_REMINDER_COOLDOWN_HOURS ?? '24', 10);
    if (Number.isNaN(raw))
        return 24;
    return Math.min(168, Math.max(1, raw));
}
function getNotificationJobBatchLimit() {
    const raw = Number.parseInt(process.env.NOTIFICATION_JOB_BATCH_LIMIT ?? '500', 10);
    if (Number.isNaN(raw))
        return 500;
    return Math.min(5000, Math.max(1, raw));
}
function isFcmEnabled() {
    return process.env.FCM_ENABLED === 'true';
}
function getTipWeeklyDays() {
    const raw = Number.parseInt(process.env.NOTIFICATION_TIP_WEEKLY_DAYS ?? '7', 10);
    if (Number.isNaN(raw))
        return 7;
    return Math.min(30, Math.max(1, raw));
}
function getCampaignBatchLimit() {
    const raw = Number.parseInt(process.env.NOTIFICATION_CAMPAIGN_BATCH_LIMIT ?? '500', 10);
    if (Number.isNaN(raw))
        return 500;
    return Math.min(5000, Math.max(1, raw));
}
function getTipJobBatchLimit() {
    const raw = Number.parseInt(process.env.NOTIFICATION_TIP_JOB_BATCH_LIMIT ?? '1000', 10);
    if (Number.isNaN(raw))
        return 1000;
    return Math.min(5000, Math.max(1, raw));
}
function getInternalServiceKey() {
    return process.env.NOTIFICATIONS_INTERNAL_SERVICE_KEY?.trim() || undefined;
}
//# sourceMappingURL=notification.config.js.map