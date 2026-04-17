import { LightningElement, track, wire } from 'lwc';
import { graphql, gql } from 'lightning/graphql';

// Columns for the Datatable
const columns = [
    { label: 'Name', fieldName: 'name', sortable: true }, 
    { label: 'Email', fieldName: 'email', sortable: true }, 
    { label: 'Phone', fieldName: 'phone' }
];

export default class ContactDatatable extends LightningElement {
    // Properties
    columns = columns;
    @track contacts;
    searchKey = "";
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    // Query records with graphql api
    @wire(graphql, { query: "$contactQuery", variables: "$variables" })
        hanldeContactData({ data, errors, refresh }) {
            if(data) {
                this.contacts = data.uiapi?.query.Contact.edges.map(edge => {
                    return {
                        id: edge.node.Id, 
                        name: edge.node.Name.value,
                        email: edge.node.Email.value ? edge.node.Email.value : "", 
                        phone: edge.node.Phone.value ? edge.node.Phone.value : ""
                    };
                });
            }
        }

    // Getter to return graphql query
    get contactQuery() {
        return gql`
            query queryContactRecords( $searchKey: String ) {
                uiapi {
                    query {
                        Contact( where: { Name: { like: $searchKey } }, first: 200 ) {
                            edges {
                                node {
                                    Id
                                    Name { value }
                                    Email { value }
                                    Phone { value }
                                }
                            }
                        }
                    }
                }
            }
        `;
    }

    // Getter to return variables for grapql query
    get variables() {
        return {
            searchKey: `%${this.searchKey}%`
        };
    }

    // Event handler for search input
    handleSearch(event) {
        this.searchKey = event.target.value;
    }

    sortBy(field, reverse, primer) {
        const key = primer 
                ? function (x) {
                    return primer(x[field]);
                  }
                : function (x) {
                    return x[field];
                  };

        return function (a, b) {
            // Closures
            a = key(a);
            b = key(b);

            return reverse * ((a > b) - (b > a));
        };
    }

    // Event handler for sorting
    handleSorting(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;

        const cloneData = [...this.contacts];
        cloneData.sort(this.sortBy(sortedBy, sortDirection == 'asc' ? 1 : -1, (value) => value.toLowerCase()));
        this.contacts = cloneData;

        this.sortedBy = sortedBy;
        this.sortDirection = sortDirection;
    }
}