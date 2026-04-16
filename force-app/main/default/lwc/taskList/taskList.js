import { LightningElement, track, wire } from 'lwc';
import { graphql, gql } from 'lightning/graphql';
import CreateTaskModal from 'c/createTaskModal';
import Toast from 'lightning/toast';

export default class TaskList extends LightningElement {
    // Tasks data
    @track tasks;
    @track errors;
    refresh;

    @wire(graphql, {
        query: "$taskQuery"
    })
        handleTasks({ data, errors, refresh }) {
            if(data) {
                this.tasks = data.uiapi.query.Task.edges.map(edge => {
                    
                    return {
                        id: edge.node.Id,
                        name: edge.node.Subject.value,
                        completed: false
                    }
                });
            } else {
                this.errors = errors;
            }

            this.refresh = refresh;
        }

    // Getter for graphql query
    get taskQuery() {
        return gql`
            query {
                uiapi {
                    query {
                        Task(
                            where: { Status: { eq: "Not Started" } },
                            orderBy: { CreatedDate: { order: DESC } }
                        ) {
                            edges {
                                node {
                                    Id
                                    Subject { value }
                                    Status { value }
                                }
                            }
                        }
                    }
                }
            }
        `;
    }

    // Event Handler for Mark as Completed button
    handleItemClick(event) {
        this.tasks = this.tasks.map(task => {
            if(task.id == event.detail.id) {
                return event.detail;
            }

            return task;
        })
    }

    // Event Handler for creating new task
    async addNewTask() {
        const result = await CreateTaskModal.open({
            size: 'small'
        });

        if(result == 'success') {
            Toast.show({
                label: 'New Task Created',
                message: 'A new task created successfully',
                variant: 'success',
                mode: 'dismissible'
            });
            
            this.refresh();
        } else {
            Toast.show({
                label: 'Cancelled',
                message: 'Task creation cancelled',
                variant: 'info',
                mode: 'dismissible'
            });
        }
    }
}