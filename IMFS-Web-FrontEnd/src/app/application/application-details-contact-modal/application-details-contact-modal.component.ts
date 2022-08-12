import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApplicationContact } from 'src/app/models/application/application.model';
import { ContactTypeOptions } from 'src/app/models/drop-down-options/drop-down-options.model';
import { HttpResponseData } from 'src/app/models/utility-models/response.model';
import { ApplicationControllerService } from 'src/app/services/controller-services/application-controller.service';
import { IMFSUtilityService } from 'src/app/services/utility-services/imfs-utility-services';


@Component({
    selector: 'app-application-details-contact-modal',
    templateUrl: './application-details-contact-modal.component.html',
    styleUrls: ['./application-details-contact-modal.component.scss']
})

export class ApplicationDetailsContactModalComponent implements OnInit {

    currentItem: ApplicationContact = new ApplicationContact();
    displayDialog = false;
    header = 'Application Contact';
    guarantorContact = false;
    trusteeContact = false;
    todayDate: Date;
    contactTypes = ContactTypeOptions;
    selectedContact: ApplicationContact;
    contacts: ApplicationContact[] = [];
    filteredContacts: ApplicationContact[] = [];
    contactType: string;
    selectedContactType: string;
    resellerId: string;

    @Output() refreshEmit = new EventEmitter();


    constructor(
        private imfsUtilityService: IMFSUtilityService,
        private applicationControllerService: ApplicationControllerService,

    ) { }

    ngOnInit() {

        this.todayDate = new Date();

    }

    open(type: string, resellerId: string) {

        this.resellerId = resellerId;
        this.contactType = type;
        this.getContacts();


        if (type === 'Guarantor') {
            this.guarantorContact = true;
            this.trusteeContact = false;
        }

        if (type === 'Trustee') {
            this.guarantorContact = false;
            this.trusteeContact = true;
        }

        if (type === 'BeneficialOwner') {
            this.guarantorContact = false;
            this.trusteeContact = false;
        }


        this.displayDialog = true;
        // this.currentItem = _.cloneDeep(editItem);
    }

    getContacts() {
        this.imfsUtilityService.showLoading('Loading...');
        this.applicationControllerService.getContacts(this.resellerId).subscribe(
            (response: HttpResponseData) => {
                this.imfsUtilityService.hideLoading();
                this.filteredContacts = response.searchResult;
                if (this.contactType === 'Guarantor') {
                    const filteredContactsByType = this.filteredContacts.filter(c => c.contactType === 1 ||
                        c.contactType === 2 || c.contactType === 3 || c.contactType === 4);
                    this.contacts = filteredContactsByType;
                }

                if (this.contactType === 'Trustee') {
                    const filteredContactsByType = this.filteredContacts.filter(c => c.contactType === 5);
                    this.contacts = filteredContactsByType;
                }

                if (this.contactType === 'BeneficialOwner') {
                    const filteredContactsByType = this.filteredContacts.filter(c => c.contactType === 7);
                    this.contacts = filteredContactsByType;
                }
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilityService.hideLoading();
                this.imfsUtilityService.showToastr('error', 'Failed', 'Error in getting quote');
            }
        );
    }



    // open(editItem: ApplicationContact) {
    //     this.displayDialog = true;
    //     this.currentItem = _.cloneDeep(editItem);
    // }

    saveContact() {

        if (this.selectedContact) {
            this.refreshEmit.emit(this.selectedContact);
        }
        else {

            if (!this.currentItem.contactName) {
                this.imfsUtilityService.showToastr('warning', 'Warning', 'Please enter Name');
                return;
            }

            if (!this.currentItem.contactEmail) {
                this.imfsUtilityService.showToastr('warning', 'Warning', 'Please enter Email');
                return;
            }

            if (!this.currentItem.contactAddress) {
                this.imfsUtilityService.showToastr('warning', 'Warning', 'Please enter Address');
                return;
            }

            if (!this.currentItem.contactDOB) {
                this.imfsUtilityService.showToastr('warning', 'Warning', 'Please enter DoB');
                return;
            }

            if (!this.currentItem.contactDriversLicNo) {
                this.imfsUtilityService.showToastr('warning', 'Warning', 'Please enter Drivers Licence No');
                return;
            }

            if (!this.currentItem.contactPhone) {
                this.imfsUtilityService.showToastr('warning', 'Warning', 'Please enter Phone');
                return;
            }

            if (!this.currentItem.isContactSignatory) {
                this.imfsUtilityService.showToastr('warning', 'Warning', 'Please select Contract Signatory');
                return;
            }

            if (this.contactType === 'Guarantor') {

                if (!this.selectedContactType) {
                    this.imfsUtilityService.showToastr('warning', 'Warning', 'Please select Contact Type');
                    return;
                }
                else {
                    this.currentItem.contactType = Number(this.selectedContactType);
                }

            }

            if (this.contactType === 'Trustee') {
                this.currentItem.contactType = 5;
                if (!this.currentItem.contactABNACN) {
                    this.imfsUtilityService.showToastr('warning', 'Warning', 'Please enter Contact ABN');
                    return;
                }
            }

            if (this.contactType === 'BeneficialOwner') {
                this.currentItem.contactType = 7;
            }

            this.refreshEmit.emit(this.currentItem);

        }

        this.displayDialog = false;

        // this.imfsUtilityService.showLoading('Saving...');

        // this.financeProductTypeControllerService.saveFinanceProductTypes(this.currentItem).subscribe(
        //     (response: HttpResponseData) => {
        //         this.imfsUtilityService.hideLoading();
        //         if (response.status === 'Success') {
        //             this.imfsUtilityService.showToastr('success', 'Save Successful', 'Finance Product Type information saved.');
        //             this.displayDialog = false;
        //             this.refreshEmit.emit();
        //         } else {
        //             this.imfsUtilityService.showToastr('error', 'Error', response.message);
        //         }
        //     },
        //     (err: any) => {
        //         console.log(err);
        //         this.imfsUtilityService.hideLoading();
        //         this.imfsUtilityService.showToastr('error', 'Failed', 'Unable to save finance Product type');
        //     }

        // );
    }

}
