import { LightningElement } from 'lwc';

// String shown whenever the calculator is cleared or empty.
const DEFAULT_DISPLAY = '0';

// Declarative description of every button so UI and behavior stay in sync.
const BUTTON_LAYOUT = [
    {
        id: 'row-1',
        buttons: [
            { id: 'btn-ac', label: 'AC', action: 'clear' },
            { id: 'btn-sign', label: '+/-', action: 'toggleSign' },
            { id: 'btn-percent', label: '%', action: 'percent' },
            { id: 'btn-divide', label: '÷', action: 'operator', value: '/' }
        ]
    },
    {
        id: 'row-2',
        buttons: [
            { id: 'btn-7', label: '7', action: 'digit', value: '7' },
            { id: 'btn-8', label: '8', action: 'digit', value: '8' },
            { id: 'btn-9', label: '9', action: 'digit', value: '9' },
            { id: 'btn-multiply', label: '×', action: 'operator', value: '*' }
        ]
    },
    {
        id: 'row-3',
        buttons: [
            { id: 'btn-4', label: '4', action: 'digit', value: '4' },
            { id: 'btn-5', label: '5', action: 'digit', value: '5' },
            { id: 'btn-6', label: '6', action: 'digit', value: '6' },
            { id: 'btn-subtract', label: '−', action: 'operator', value: '-' }
        ]
    },
    {
        id: 'row-4',
        buttons: [
            { id: 'btn-1', label: '1', action: 'digit', value: '1' },
            { id: 'btn-2', label: '2', action: 'digit', value: '2' },
            { id: 'btn-3', label: '3', action: 'digit', value: '3' },
            { id: 'btn-add', label: '+', action: 'operator', value: '+' }
        ]
    },
    {
        id: 'row-5',
        buttons: [
            { id: 'btn-0', label: '0', action: 'digit', value: '0', columnSpan: 2 },
            { id: 'btn-decimal', label: '.', action: 'decimal' },
            { id: 'btn-equals', label: '=', action: 'equals' }
        ]
    }
];

export default class SimpleCalculator extends LightningElement {
    // Displayed number string that mirrors what the user sees.
    displayValue = DEFAULT_DISPLAY;
    // Accumulated value held between operations.
    currentValue = null;
    // Operator awaiting the second operand, e.g. '+', '÷'.
    pendingOperator = null;
    // Indicates the next digit should start a new operand.
    awaitingNextValue = false;
    // Guards against further input until the calculator is cleared.
    hasError = false;

    get buttonRows() {
        // Shape layout metadata for the template and inject dynamic classes.
        return BUTTON_LAYOUT.map((row) => ({
            id: row.id,
            buttons: row.buttons.map((button) => ({
                ...button,
                className: this.resolveClassName(button),
                dataValue: button.value ?? ''
            }))
        }));
    }

    resolveClassName(button) {
        // Construct SLDS-friendly class string reflecting button role and state.
        const classes = ['slds-button', 'calc-button'];

        if (button.columnSpan === 2) {
            classes.push('double-span');
        }

        if (button.action === 'operator') {
            classes.push('slds-button_outline-brand', 'operator');
            if (this.pendingOperator === button.value && this.awaitingNextValue) {
                classes.push('active');
            }
        } else if (button.action === 'equals') {
            classes.push('slds-button_brand', 'equals');
        } else if (button.action === 'clear' || button.action === 'toggleSign' || button.action === 'percent') {
            classes.push('slds-button_inverse', 'utility');
        } else {
            classes.push('slds-button_neutral');
        }

        return classes.join(' ');
    }

    handleButtonClick(event) {
        // Route clicks to the correct handler based on declarative metadata.
        const { action, value } = event.currentTarget.dataset;

        switch (action) {
            case 'digit':
                this.inputDigit(value);
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'operator':
                this.handleOperator(value);
                break;
            case 'equals':
                this.handleEquals();
                break;
            case 'clear':
                this.resetCalculator();
                break;
            case 'toggleSign':
                this.toggleSign();
                break;
            case 'percent':
                this.applyPercent();
                break;
            default:
                break;
        }
    }

    inputDigit(digit) {
        // Append digits or start a fresh operand depending on context.
        if (this.hasError) {
            this.resetCalculator();
        }

        if (this.awaitingNextValue) {
            this.displayValue = digit;
            this.awaitingNextValue = false;
            return;
        }

        if (this.displayValue === DEFAULT_DISPLAY) {
            this.displayValue = digit;
        } else {
            this.displayValue += digit;
        }
    }

    inputDecimal() {
        // Insert a decimal point if the current operand does not already have one.
        if (this.hasError) {
            this.resetCalculator();
        }

        if (this.awaitingNextValue) {
            this.displayValue = '0.';
            this.awaitingNextValue = false;
            return;
        }

        if (!this.displayValue.includes('.')) {
            this.displayValue += '.';
        }
    }

    handleOperator(operator) {
        // Resolve the previous operation then stage the next operator.
        if (this.hasError) {
            return;
        }

        const inputValue = parseFloat(this.displayValue);

        if (this.pendingOperator && this.awaitingNextValue) {
            this.pendingOperator = operator;
            return;
        }

        if (this.currentValue === null) {
            this.currentValue = inputValue;
        } else if (this.pendingOperator) {
            const result = this.performCalculation(this.currentValue, inputValue, this.pendingOperator);
            if (result === null) {
                this.signalError();
                return;
            }
            this.currentValue = result;
            this.displayValue = this.formatResult(result);
        } else {
            this.currentValue = inputValue;
        }

        this.pendingOperator = operator;
        this.awaitingNextValue = true;
    }

    handleEquals() {
        // Finalize the pending calculation and show the result.
        if (this.hasError || !this.pendingOperator || this.awaitingNextValue) {
            return;
        }

        const inputValue = parseFloat(this.displayValue);
        const result = this.performCalculation(this.currentValue, inputValue, this.pendingOperator);

        if (result === null) {
            this.signalError();
            return;
        }

        this.displayValue = this.formatResult(result);
        this.currentValue = null;
        this.pendingOperator = null;
        this.awaitingNextValue = false;
    }

    toggleSign() {
        // Flip the sign of the current operand without clearing history.
        if (this.hasError || this.displayValue === DEFAULT_DISPLAY) {
            return;
        }

        const value = parseFloat(this.displayValue) * -1;
        this.displayValue = this.formatResult(value);
    }

    applyPercent() {
        // Convert the current value to its percentage (divide by 100).
        if (this.hasError) {
            return;
        }

        const value = parseFloat(this.displayValue);
        const result = value / 100;
        this.displayValue = this.formatResult(result);

        if (!this.pendingOperator) {
            this.currentValue = result;
        }
    }

    performCalculation(firstValue, secondValue, operator) {
        // Execute the arithmetic for the staged operator.
        switch (operator) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '*':
                return firstValue * secondValue;
            case '/':
                return secondValue === 0 ? null : firstValue / secondValue;
            default:
                return secondValue;
        }
    }

    formatResult(value) {
        // Trim floating point noise while keeping the output readable.
        const result = parseFloat(parseFloat(value).toPrecision(12));
        return Number.isFinite(result) ? result.toString() : DEFAULT_DISPLAY;
    }

    resetCalculator() {
        // Restore every internal flag to its initial, ready state.
        this.displayValue = DEFAULT_DISPLAY;
        this.currentValue = null;
        this.pendingOperator = null;
        this.awaitingNextValue = false;
        this.hasError = false;
    }

    signalError() {
        // Surface an error message and prevent further input until cleared.
        this.displayValue = 'Error';
        this.currentValue = null;
        this.pendingOperator = null;
        this.awaitingNextValue = false;
        this.hasError = true;
    }
}
