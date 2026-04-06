import { LightningElement, track, wire } from 'lwc';
import { gql, graphql } from "lightning/graphql";
import CreateContactModal from 'c/createContactModal';

export default class ContactManagementSystem extends LightningElement {
    // Properties
    searchKey="";
    totalContactsCount;
    graphqlResult;
    @track contactList;
    @track errors;

    // graphql query using wire decorator
    @wire(graphql, {
        query: gql`
            query getContactsInfo($searchKey: String) {
                uiapi {
                    query {
                        Contact(
                            where: { Name: { like: $searchKey } }, 
                            first: 6
                        ) {
                            totalCount
                            edges {
                                node {
                                    Id
                                    Name {
                                        value
                                    }
                                    Account {
                                        Id
                                        Name {
                                            value
                                        }
                                    }
                                    Title {
                                        value
                                    }
                                    Phone {
                                        value
                                    }
                                    Email { 
                                        value
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `, 
        variables: "$variables"
    })
        getContactsInfo(result) {
            this.graphqlResult = result;

            if(result.data) {
                this.contactList = result.data.uiapi.query.Contact.edges.map(edge => edge.node);
                this.totalContactsCount = result.data.uiapi.query.Contact.totalCount;
            }
            else 
                this.errors = result.errors;
        }

    // Add Contact action's event hanlder
    async handleButtonClick() {
        const result = await CreateContactModal.open({
            size: 'small'
        });

        if(result === 'success') {
            await this.graphqlResult.refresh();
        }
    }

    // Search input box hanlder method
    handleSearchKey(event) {
        this.searchKey = event.target.value;
    }

    // Getter for the variables for graphql
    get variables() {
        return {
            searchKey: `%${this.searchKey}%`
        };
    }
}