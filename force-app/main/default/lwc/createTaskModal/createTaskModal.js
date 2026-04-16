import LightningModal from 'lightning/modal';
import createNewTask from '@salesforce/apex/CustomTaskController.createNewTask';

export default class CreateTaskModal extends LightningModal {
    subject;

    // Save button - event handler
    async handleSave() {
        if(this.subject == "" || this.subject == null || this.subject == undefined) {
            const inputEle = this.template.querySelector("lightning-input");
            inputEle.reportValidity();
            return;
        }

        try {
            const result = await createNewTask({ subject: this.subject });
            
            if(result) {
                this.close('success');
            } else {
                this.close();
            }
        } catch(err) {
            console.log(err);
        }
    }

    // Cancel button - event handler
    handleCancel() {
        this.close();
    }

    // Event handler to update the input for Subject
    handleInputChange(event) {
        this.subject = event.target.value;
    }
}