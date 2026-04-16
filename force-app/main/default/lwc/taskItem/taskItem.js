import { api, LightningElement, track } from 'lwc';
import updateTaskRecord from '@salesforce/apex/CustomTaskController.updateTaskRecord';
import { NavigationMixin } from 'lightning/navigation';

export default class TaskItem extends NavigationMixin(LightningElement) {
    @api task;
    
    // Event handler for Mark as Completed button
    async handleButtonClick() {
        let result;
        try {
            // Update the task record
            result = await updateTaskRecord({
                recordId: this.task.id, 
                subject: this.task.name, 
                status: 'Completed'
            });
        } catch(err) {
            console.log("error: ", err.body.message);
        }
        
        if(!result) return;

        // Update UI
        const taskText = this.template.querySelector('a');
        taskText.style.color = 'grey';
        taskText.style.textDecoration = 'line-through';

        // Custom event to pass updated task object
        const event = new CustomEvent('itemclick', {
            detail: {...this.task, completed: true}
        });
        this.dispatchEvent(event);
    }

    // Event handler for task navigation
    handleTaskNavigation() {
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.task.id,
                objectApiName: "Task",
                actionName: "view"
            }
        });
    }
}