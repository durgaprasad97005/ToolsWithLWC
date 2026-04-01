import { LightningElement } from 'lwc';

// Core zones surfaced in the picker alongside the viewer's local zone for quick access.
const BASE_TIMEZONES = [
    'UTC',
    'America/Los_Angeles',
    'America/Chicago',
    'America/New_York',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Australia/Sydney'
];

export default class SimpleClock extends LightningElement {
    // Reactive ISO timestamp used by the formatted Lightning base components.
    currentTime = new Date().toISOString();
    // Stores the active IANA time zone identifier.
    selectedTimezone;
    // Mirrors the toggle state for 24-hour or 12-hour rendering.
    isTwentyFourHour = false;
    // Option list presented in the combobox.
    timezoneOptions = [];

    intervalId;
    localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    connectedCallback() {
        this.initializeTimezones();
        this.startClock();
    }

    disconnectedCallback() {
        window.clearInterval(this.intervalId);
        this.intervalId = undefined;
    }

    get hourFormat() {
        // lightning-formatted-time expects '12' or '24' for hour-format.
        return this.isTwentyFourHour ? '24' : '12';
    }

    get selectedTimezoneLabel() {
        const match = this.timezoneOptions.find((option) => option.value === this.selectedTimezone);
        return match ? match.label : this.selectedTimezone;
    }

    get relativeDescription() {
        // Express how far the selected zone is from the viewer's locale.
        const diffMinutes = this.computeDifferenceFromLocal(this.selectedTimezone);
        if (Math.abs(diffMinutes) < 1) {
            return 'Matches your local time';
        }

        const direction = diffMinutes > 0 ? 'ahead' : 'behind';
        const totalMinutes = Math.abs(Math.round(diffMinutes));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const parts = [];
        if (hours) {
            parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
        }
        if (minutes) {
            parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
        }

        return `${parts.join(' ')} ${direction}`;
    }

    get selectedTimezoneForDisplay() {
        return this.selectedTimezone || this.localTimezone;
    }

    initializeTimezones() {
        // Build a deduplicated, human-friendly option list.
        const zones = new Set([this.localTimezone, ...BASE_TIMEZONES]);
        this.selectedTimezone = this.localTimezone;
        this.timezoneOptions = Array.from(zones).map((zone) => ({
            value: zone,
            label: this.formatZoneLabel(zone)
        }));
    }

    startClock() {
        // Refresh the timestamp immediately and then tick every second.
        this.updateCurrentTime();
        this.intervalId = window.setInterval(() => this.updateCurrentTime(), 1000);
    }

    updateCurrentTime() {
        this.currentTime = new Date().toISOString();
    }

    handleTimezoneChange(event) {
        this.selectedTimezone = event.detail.value;
    }

    handleFormatToggle(event) {
        this.isTwentyFourHour = event.detail.checked;
    }

    handleRefresh() {
        this.updateCurrentTime();
    }

    openPreferences() {
        // Surface an event so hosting pages can provide advanced settings.
        this.dispatchEvent(new CustomEvent('preferencesrequest'));
    }

    computeDifferenceFromLocal(zone) {
        const now = new Date();
        const zoneDate = new Date(now.toLocaleString('en-US', { timeZone: zone }));
        return (zoneDate.getTime() - now.getTime()) / 60000;
    }

    formatZoneLabel(zone) {
        if (zone === this.localTimezone) {
            return `Local (${zone})`;
        }
        const offsetLabel = this.formatZoneOffset(zone);
        const readableName = zone.replace(/_/g, ' ');
        return `${readableName} (${offsetLabel})`;
    }

    formatZoneOffset(zone) {
        const now = new Date();
        const differenceToLocal = this.computeDifferenceFromLocal(zone);
        const localOffset = -now.getTimezoneOffset();
        const offsetMinutes = Math.round(differenceToLocal + localOffset);

        const sign = offsetMinutes >= 0 ? '+' : '-';
        const absoluteMinutes = Math.abs(offsetMinutes);
        const hours = Math.floor(absoluteMinutes / 60)
            .toString()
            .padStart(2, '0');
        const minutes = (absoluteMinutes % 60).toString().padStart(2, '0');

        return `UTC${sign}${hours}:${minutes}`;
    }
}
