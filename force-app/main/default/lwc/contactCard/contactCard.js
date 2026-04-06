import { api, LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

export default class ContactCard extends NavigationMixin(LightningElement) {
    @api contactId;
    @api contactName;
    @api accountId;
    @api accountName;
    @api title;
    @api phone;
    @api email;

    // Navigate to Contact record
    handleContactClick() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.contactId,
                objectApiName: "Contact",
                actionName: "view"
            }
        });
    }

    // Navigate to Account record
    handleAccountClick() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.accountId,
                objectApiName: "Account",
                actionName: "view"
            }
        });
    }
}