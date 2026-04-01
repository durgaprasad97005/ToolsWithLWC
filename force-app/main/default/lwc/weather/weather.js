import { LightningElement, track } from 'lwc';

// Static seed data keeps the component functional until live weather is wired in.
const DEFAULT_FORECAST = {
    temperature: 72,
    unit: 'F',
    condition: 'Partly Cloudy',
    location: 'San Francisco, CA',
    icon: 'utility:cloud'
};

export default class Weather extends LightningElement {
    // Tracked so future async updates automatically refresh the view.
    @track forecast = { ...DEFAULT_FORECAST };

    get iconName() {
        // lightning-icon expects a utility sprite identifier (e.g., utility:cloudy).
        return this.forecast.icon;
    }

    get displayTemperature() {
        // Render temperature with unit suffix (e.g., "72°F").
        return `${this.forecast.temperature}°${this.forecast.unit}`;
    }

    get displaySummary() {
        // Condition paired with location reads naturally in the card.
        return `${this.forecast.condition} · ${this.forecast.location}`;
    }
}
