import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import * as moment from 'moment';
import { combineLatest } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { DurationOptions, FinanceTypes, PaymentFrequencyOptions, QuoteStatusOptions } from 'src/app/models/drop-down-options/drop-down-options.model';

import { IMFSRoutes } from 'src/app/models/routes/imfs-routes';
import { HttpResponseData } from 'src/app/models/utility-models/response.model';
import { IMFSFormService } from 'src/app/services/utility-services/imfs-form-service';
import { IMFSUtilityService } from 'src/app/services/utility-services/imfs-utility-services';
import { ApplicationSearchModel, ApplicationSearchResponseModel } from 'src/app/models/application/application.model';
import { ApplicationControllerService } from 'src/app/services/controller-services/application-controller.service';
import { AuthenticationService } from 'src/app/services/utility-services/authenication.service';
import { StatusModel } from 'src/app/models/options/options.model';
import { OptionsControllerService } from 'src/app/services/controller-services/options-controller.service';


@Component({
    selector: 'app-application-search',
    templateUrl: './application-search.component.html',
    styleUrls: ['./application-search.component.scss']
})


export class ApplicationSearchComponent implements OnInit {
    applicationSearchForm: FormGroup;
    filteredApplications: ApplicationSearchResponseModel[];
    applicationStatusOptions: StatusModel[];
    financetype: string[];
    applicationSearchModel: ApplicationSearchModel;
    IMStaffRole = false;
    ResellerStandardRole = false;
    selectedValuesCheck: any;
    fromDate: any;
    toDate: any=new Date();
    applicationNumber:any

    constructor(
        private formBuilder: FormBuilder,
        private imfsUtilities: IMFSUtilityService,
        private formUtility: IMFSFormService,
        private applicationControllerService: ApplicationControllerService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private authenticationService: AuthenticationService,
        private optionsControllerService: OptionsControllerService,
        private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.initForm();
        this.setDefaults();
        this.getApplicationStatus();
        this.filterApplication();
        this.searchApplications();
        if (this.authenticationService.userHasRole('ResellerStandard') || this.authenticationService.userHasRole('ResellerAdmin')) {
            this.ResellerStandardRole = true;
        }
        this.setMinDate()
    }

    initForm() {
        this.applicationSearchForm = this.formBuilder.group({
            ApplicationNumber: new FormControl(''),
            Status: new FormControl(''),
            FinanceTypeLeasing: new FormControl(''),
            FinanceTypeRental: new FormControl(''),
            FinanceTypeInstalments: new FormControl(''),
            fromDate: new FormControl(''),
            toDate: new FormControl(''),
            EndCustomerName: new FormControl(''),
        });
    }
    setDefaults() {
        this.applicationSearchForm.controls.ApplicationNumber.patchValue('');
        this.applicationSearchForm.controls.Status.patchValue(0);
        this.applicationSearchForm.controls.FinanceTypeLeasing.patchValue(['1']);
        this.applicationSearchForm.controls.FinanceTypeRental.patchValue('');
        this.applicationSearchForm.controls.FinanceTypeInstalments.patchValue('');
        this.applicationSearchForm.controls.EndCustomerName.patchValue('');

        const defaultCreateDate = moment().subtract(3, 'M').toDate();
        this.applicationSearchForm.controls.fromDate.patchValue(defaultCreateDate);
        this.applicationSearchForm.controls.toDate.patchValue(new Date());

    }
    setMinDate(){
        this.fromDate = this.applicationSearchForm.controls.fromDate.value;
    }
    setMaxDate(){
        this.toDate = this.applicationSearchForm.controls.toDate.value;
    }
    getApplicationStatus() {
        this.optionsControllerService.getStatus(false, false, true).subscribe(
            (response: StatusModel[]) => {
                this.imfsUtilities.hideLoading();
                if (response.length === 0) {
                    this.imfsUtilities.showToastr('error', 'Failed', 'No Status found');
                }
                else {
                    this.applicationStatusOptions = response;
                }
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('error', 'Failed', 'Error in Get Status');
            }
        );
    }

    onApplicationNumberSelect(event: any) {
        console.log(event);
        if (event) {

        } else {

        }
    }

    setSearchFilter() {
    
        this.applicationSearchModel = new ApplicationSearchModel();
        this.financetype = []

        if (this.applicationSearchForm.controls.FinanceTypeLeasing.value) {
            if (this.applicationSearchForm.controls.FinanceTypeLeasing.value != '') {
                this.financetype.push(this.applicationSearchForm.controls.FinanceTypeLeasing?.value[0]);
            }
        }

        if (this.applicationSearchForm.controls.FinanceTypeRental.value) {
            if (this.applicationSearchForm.controls.FinanceTypeRental.value != '') {
                this.financetype.push(this.applicationSearchForm.controls.FinanceTypeRental?.value[0]);
            } 
        }

        if (this.applicationSearchForm.controls.FinanceTypeInstalments.value) {
            if (this.applicationSearchForm.controls.FinanceTypeInstalments.value != '') {
                this.financetype.push(this.applicationSearchForm.controls.FinanceTypeInstalments?.value[0]);
            }
        } 

        if (this.applicationSearchForm.controls.ApplicationNumber.value) {
            // tslint:disable-next-line: max-line-length
            this.applicationSearchModel.applicationNumber = Number(this.applicationNumber.applicationNumber?this.applicationNumber.applicationNumber:this.applicationNumber)
        }
        if (this.applicationSearchForm.controls.Status.value as number) {
            this.applicationSearchModel.status = this.applicationSearchForm.controls.Status.value as number;
        }

        if (this.applicationSearchForm.controls.EndCustomerName.value) {
            this.applicationSearchModel.endCustomerName = this.applicationSearchForm.controls.EndCustomerName.value;
        }

        if (this.applicationSearchForm.controls.fromDate.value) {
            this.applicationSearchModel.fromDate = this.applicationSearchForm.controls.fromDate.value;
        }
        if (this.applicationSearchForm.controls.toDate.value) {
            this.applicationSearchModel.toDate = this.applicationSearchForm.controls.toDate.value;
        }

        if (this.financetype.length > 0) {
            this.applicationSearchModel.financeType = this.financetype;
        } 
        else if (this.financetype.length === 0) {
            this.financetype = [''];
        }
    }

    filterApplication(type?:string) {
        
        this.setSearchFilter();
        this.applicationSearchModel.TriggerSource=type;
        this.applicationControllerService.lookupApplicationNumber(this.applicationSearchModel).subscribe(
            (response: HttpResponseData) => {
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('success', 'Success', 'Application Search Success');
                this.filteredApplications = response.searchResult;
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('error', 'Failed', 'Error Searching application');
            }

        );
    }

    openApplication(applicationId: number) {
        void this.router.navigate([IMFSRoutes.Application], { queryParams: { id: applicationId, mode: 'edit' } });
    }

    emailApplication(applicationId: number) {
        void this.router.navigate([IMFSRoutes.Email], { queryParams: { applicationId: applicationId } });
    }

    cancelApplication(applicationId: number) {
        this.applicationControllerService.cancelApplication(applicationId).subscribe(
            (response: HttpResponseData) => {
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('success', 'Success', 'Application Updated Successfully');
                this.searchApplications();
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('error', 'Failed', 'Error Updating Application');
            }
        );
    }

    searchApplications() {
        this.setSearchFilter();

        this.imfsUtilities.showLoading('Searching Applications...');
        // search application details to server
        this.applicationControllerService.searchApplication(this.applicationSearchModel).subscribe(
            (response: HttpResponseData) => {
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('success', 'Success', 'Application Search Success');
                this.filteredApplications = response.searchResult;
                
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('error', 'Failed', 'Error Searching Application');
            }
        );

    }


}
