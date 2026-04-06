import LightningModal from 'lightning/modal';
import CONTACT_NAME from '@salesforce/schema/Contact.Name';
import ACCOUNT_NAME from '@salesforce/schema/Contact.AccountId';
import TITLE from '@salesforce/schema/Contact.Title';
import PHONE from '@salesforce/schema/Contact.Phone';
import EMAIL from '@salesforce/schema/Contact.Email';

export default class CreateContactModal extends LightningModal {
    // Fields to populate
    fields = [CONTACT_NAME, ACCOUNT_NAME, TITLE, PHONE, EMAIL];

    // Event handler for submitting the form
    handleSave() {
        this.close("success");
    }
}