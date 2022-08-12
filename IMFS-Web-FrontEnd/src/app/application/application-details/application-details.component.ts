import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import * as moment from 'moment';
import { ConfirmationService, ConfirmEventType, MenuItem, MessageService } from 'primeng/api';
import { combineLatest } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import {
    ApplicationContact, ApplicationDetailsModel, ApplicationDetailsResponseModel,
    ApplicationDownloadInput, EndCustomerDetails, EntityDetails, ResellerDetails
} from 'src/app/models/application/application.model';

import { DurationOptions, PaymentFrequencyOptions, QuoteStatusOptions, ApplicationStatusOptions, EntityTypeOptions, TrustTypeOptions, IsGuarantorProperty } from 'src/app/models/drop-down-options/drop-down-options.model';
import { StatusModel } from 'src/app/models/options/options.model';
import { IMFSRoutes } from 'src/app/models/routes/imfs-routes';
import { HttpResponseData } from 'src/app/models/utility-models/response.model';
import { ApplicationControllerService } from 'src/app/services/controller-services/application-controller.service';
import { EmailControllerService } from 'src/app/services/controller-services/email-controller.service';
import { OptionsControllerService } from 'src/app/services/controller-services/options-controller.service';
import { AuthenticationService } from 'src/app/services/utility-services/authenication.service';
import { IMFSFormService } from 'src/app/services/utility-services/imfs-form-service';
import { IMFSUtilityService } from 'src/app/services/utility-services/imfs-utility-services';
import { JsUtilityService } from 'src/app/services/utility-services/js-utility.service';
import { ApplicationDetailsContactModalComponent } from '../application-details-contact-modal/application-details-contact-modal.component';
import { ApplicationEmailHistoryModalComponent } from '../application-email-history-modal/application-email-history-modal.component';
// import { QuoteEmailHistoryModalComponent } from '../quote-email-history-modal/quote-email-history-modal.component';
import { QuoteDocuments } from 'src/app/models/quote/quote.model';
import { QuoteControllerService } from 'src/app/services/controller-services/quote-controller.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApplicationDocUploadPopupComponent } from '../application-doc-upload-popup/application-doc-upload-popup.component';
@Component({
    selector: 'app-application-details',
    templateUrl: './application-details.component.html',
    styleUrls: ['./application-details.component.scss']
})


export class ApplicationDetailsComponent implements OnInit {
    header = 'Application Details';
    applicationCustomerDetailsForm: FormGroup;
    financeInformationForm: FormGroup;
    signatoriesForm: FormGroup;
    durationOptions = DurationOptions;
    entityTypeOptions = EntityTypeOptions;
    paymentFrequencyOptions = PaymentFrequencyOptions;
    applicationStatusOptions: StatusModel[];
    trustTypeOptions = TrustTypeOptions;
    active = true;
    applicationIdGlobal = 0;
    resellerIdGlobal = '';
    activeTabIndex = 0;
    applicationApproved = 12;
    guarantorTableData: ApplicationContact[] = [];
    trusteeTableData: ApplicationContact[] = [];
    accountantTableData: ApplicationContact[] = [];
    beneficialOwnersTableData: ApplicationContact[] = [];
    applicationDetails = new ApplicationDetailsModel();
    otherEntityType = 5;
    otherTrustType = 'Other';
    IMStaffRole = false;
    IMStaffAdminRole = false;
    ResellerStandardRole = false;
    controlReadOnly: boolean;
    activeIndex: any;
    custDetails: boolean = true;
    financeInfo: boolean;
    signatories: boolean;
    documents: boolean;
    itemsForSteps: any[]
    entityTrustTypeRadio: any;
    entityTypeRadio: any;
    isGuarantorProperty = IsGuarantorProperty;
    getfileApplicationid: number | any

    @ViewChild('contactModal') contactModal: ApplicationDetailsContactModalComponent;
    @ViewChild('emailHistoryModal') emailHistoryModal: ApplicationEmailHistoryModalComponent;
    @ViewChild('ApplicationDocUploadPopupComponent') ApplicationDocUploadPopupComponent: ApplicationDocUploadPopupComponent;

    constructor(
        private formBuilder: FormBuilder,
        private imfsUtilityService: IMFSUtilityService,
        private jsUtilityService: JsUtilityService,
        private formUtility: IMFSFormService,
        private optionsControllerService: OptionsControllerService,
        private emailControllerService: EmailControllerService,
        private applicationControllerService: ApplicationControllerService,
        private authenticationService: AuthenticationService,
        private quoteControllerService: QuoteControllerService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private http: HttpClient,
        private messageService: MessageService) {
    }

    ngOnInit() {
        this.initForm();
        this.activeTabIndex = 0;
        this.applicationIdGlobal = 0;
        this.getApplicationStatus();
        this.route.queryParamMap.subscribe((queryParams) => {
            this.getfileApplicationid = queryParams.get("id")
            console.log(this.getfileApplicationid);
        })
        this.getFiles();
        // that.todayDate = new Date();
        const obsComb = combineLatest([this.route.paramMap, this.route.queryParams]);

        obsComb.pipe(takeWhile(() => this.active)).subscribe((params: any) => {
            //const applicationId = params[0].get('id');
            //const mode = params['mode'];

            this.route.queryParamMap.subscribe(queryParams => {
                const applicationId = queryParams.get("id");
                const mode = queryParams.get("mode");

                if (mode === "view") {
                    this.controlReadOnly = true;
                }

                if (applicationId) {
                    this.header = 'Application Details';
                    if (this.authenticationService.userHasRole('IMStaffAdmin')) {
                        this.IMStaffAdminRole = true;
                    }
                    this.getApplicationDetails(parseInt(applicationId));
                    this.applicationIdGlobal = parseInt(applicationId);
                    this.setFormControlsByPermission();
                }
            });
        });

        this.itemsForSteps = [{ label: 'Customer Details' }, { label: 'Finance Information' }, { label: 'Signatories' }, { label: 'Documents' }]


        this.navigateApplication(0, 'next');


        // this.downloadMenuItems = [
        //     {label: 'Generate Proposal (xlsx)', icon: 'pi pi-cloud-download', command: () => {
        //         this.downloadQuote('Proposal');
        //     },
        // },
        // ];
    }

    initForm() {
        this.applicationCustomerDetailsForm = this.formBuilder.group({
            Id: new FormControl({ value: '', disabled: true }),
            ApplicationNumber: new FormControl({ value: '', disabled: true }),
            Status: new FormControl(''),
            CreatedDate: new FormControl({ value: '', disabled: true }),
            EntityType: new FormControl(''),
            EntityTrustType: new FormControl(''),
            EntityTypeOther: new FormControl(''),
            EntityTrustOther: new FormControl(''),
            EntityTrustName: new FormControl(''),
            EntityTrustABN: new FormControl(''),
            FinanceFunder: new FormControl(''),
            FinanceFunderName: new FormControl(''),
            FinanceFunderEmail: new FormControl(''),
            EndCustomerName: new FormControl(''),
            EndCustomerABN: new FormControl(''),
            EndCustomerTradingAs: new FormControl(''),
            EndCustomerPhone: new FormControl(''),
            BusinessActivity: new FormControl(''),
            EndCustomerFax: new FormControl(''),
            EndCustomerYearsTrading: new FormControl(''),
            AveAnnualSales: new FormControl(''),
            EndCustomerContactName: new FormControl(''),
            EndCustomerContactPhone: new FormControl(''),
            EndCustomerContactEmail: new FormControl(''),
            EndCustomerPrimaryAddressLine1: new FormControl(''),
            EndCustomerPrimaryAddressLine2: new FormControl(''),
            EndCustomerPrimaryCity: new FormControl(''),
            EndCustomerPrimaryState: new FormControl(''),
            EndCustomerPrimaryCountry: new FormControl(''),
            EndCustomerPrimaryPostcode: new FormControl(''),

            EndCustomerPostalAddressLine1: new FormControl(''),
            EndCustomerPostalAddressLine2: new FormControl(''),
            EndCustomerPostalCity: new FormControl(''),
            EndCustomerPostalState: new FormControl(''),
            EndCustomerPostalCountry: new FormControl(''),
            EndCustomerPostalPostcode: new FormControl(''),

            EndCustomerDeliveryAddressLine1: new FormControl(''),
            EndCustomerDeliveryAddressLine2: new FormControl(''),
            EndCustomerDeliveryCity: new FormControl(''),
            EndCustomerDeliveryState: new FormControl(''),
            EndCustomerDeliveryCountry: new FormControl(''),
            EndCustomerDeliveryPostcode: new FormControl(''),
        });

        this.financeInformationForm = this.formBuilder.group({
            QuoteID: new FormControl({ value: '', disabled: true }),
            GoodsDescription: new FormControl(''),
            FinanceTotal: new FormControl(''),
            QuoteTotal: new FormControl(''),
            FinanceFunderName: new FormControl(''),
            FinanceType: new FormControl(''),
            FinanceFrequency: new FormControl(''),
            FinanceDuration: new FormControl(''),
            FinanceValue: new FormControl(''),
            ResellerName: new FormControl(''),
            ResellerContactName: new FormControl(''),
            ResellerId: new FormControl('')
        });

        this.signatoriesForm = this.formBuilder.group({
            IsGuarantorPropertyOwner: new FormControl(''),
            GuarantorSecurityValue: new FormControl(''),
            GuarantorSecurityOwing: new FormControl(''),

            items: this.formBuilder.array([this.createTableRow(new ApplicationContact())]),

            guarantorItems: this.formBuilder.array([this.createTableRow(new ApplicationContact())]),
            trusteeItems: this.formBuilder.array([this.createTableRow(new ApplicationContact())]),
            accountantItems: this.formBuilder.array([this.createTableRow(new ApplicationContact())]),
            beneficialOwners: this.formBuilder.array([this.createTableRow(new ApplicationContact())]),

        });
        const that = this;

    }


    getApplicationStatus() {
        this.optionsControllerService.getStatus(false, false, true).subscribe(
            (response: StatusModel[]) => {
                this.imfsUtilityService.hideLoading();
                if (response.length === 0) {
                    this.imfsUtilityService.showToastr('error', 'Failed', 'No Status found');
                }
                else {
                    this.applicationStatusOptions = response;
                }
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilityService.hideLoading();
                this.imfsUtilityService.showToastr('error', 'Failed', 'Error in Get Status');
            }
        );
    }

    getApplicationDetails(applicationId: number) {
        this.imfsUtilityService.showLoading('Loading...');
        this.applicationControllerService.getApplicationDetails(applicationId).subscribe(
            (response: ApplicationDetailsResponseModel) => {
                this.imfsUtilityService.hideLoading();
                this.resellerIdGlobal = response.applicationDetails.resellerDetails.resellerID;
                this.setFormValue(response.applicationDetails);

                // Disable form if it has been End Customer Accepted
                // if (Number(response.applicationDetails.status) === this.applicationApproved) {
                //     this.applicationCustomerDetailsForm.disable();
                //     this.financeInformationForm.disable();
                //     this.signatoriesForm.disable();
                // }

            },
            (err: any) => {
                console.log(err);
                this.imfsUtilityService.hideLoading();
                this.imfsUtilityService.showToastr('error', 'Failed', 'Error in getting Application Details');
            }
        );

    }


    createTableRow(item: ApplicationContact): FormGroup {
        return this.formBuilder.group({
            ContactType: item.contactType,
            ContactDescription: item.contactDescription,
            ContactID: item.contactID,
            ContactEmail: item.contactEmail,
            ResellerID: item.resellerID,
            ContactName: item.contactName,
            ContactDOB: item.contactDOB,
            ContactAddress: item.contactAddress,
            ContactDriversLicNo: item.contactDriversLicNo,
            ContactABNACN: item.contactABNACN,
            ContactPosition: item.contactPosition,
            IsContactSignatory: item.isContactSignatory,
            ContactPhone: item.contactPhone
        });
    }

    get guarantorItems(): FormArray {
        if (this.signatoriesForm) {
            return this.signatoriesForm.get('guarantorItems') as FormArray;
        }
        return this.formBuilder.array([this.createTableRow(new ApplicationContact())]);
    }

    get trusteeItems(): FormArray {
        if (this.signatoriesForm) {
            return this.signatoriesForm.get('trusteeItems') as FormArray;
        }
        return this.formBuilder.array([this.createTableRow(new ApplicationContact())]);
    }

    get accountantItems(): FormArray {
        if (this.signatoriesForm) {
            return this.signatoriesForm.get('accountantItems') as FormArray;
        }
        return this.formBuilder.array([this.createTableRow(new ApplicationContact())]);
    }

    get beneficialOwners(): FormArray {
        if (this.signatoriesForm) {
            return this.signatoriesForm.get('beneficialOwners') as FormArray;
        }
        return this.formBuilder.array([this.createTableRow(new ApplicationContact())]);
    }


    setFormValue(applicationDetails: ApplicationDetailsModel): void {

        this.applicationCustomerDetailsForm.patchValue({
            Id: applicationDetails.id,
            ApplicationNumber: applicationDetails.applicationNumber,
            Status: applicationDetails.status,
            CreatedDate: moment(applicationDetails.createdDate).toDate(),
            FinanceFunder: applicationDetails.financeFunder,
            FinanceFunderEmail: applicationDetails.financeFunderEmail,
            EntityType: applicationDetails.entityDetails.entityType,
            EntityTrustType: applicationDetails.entityDetails.entityTrustType,
            EntityTypeOther: applicationDetails.entityDetails.entityTypeOther,
            EntityTrustOther: applicationDetails.entityDetails.entityTrustOther,
            EntityTrustName: applicationDetails.entityDetails.entityTrustName,
            EntityTrustABN: applicationDetails.entityDetails.entityTrustABN,
            EndCustomerName: applicationDetails.endCustomerDetails.endCustomerName,
            EndCustomerABN: applicationDetails.endCustomerDetails.endCustomerABN,
            EndCustomerTradingAs: applicationDetails.endCustomerDetails.endCustomerTradingAs,
            EndCustomerPhone: applicationDetails.endCustomerDetails.endCustomerPhone,
            BusinessActivity: applicationDetails.businessActivity,
            EndCustomerFax: applicationDetails.endCustomerDetails.endCustomerFax,
            EndCustomerYearsTrading: applicationDetails.endCustomerDetails.endCustomerYearsTrading,
            AveAnnualSales: applicationDetails.aveAnnualSales,
            EndCustomerContactName: applicationDetails.endCustomerDetails.endCustomerContactName,
            EndCustomerContactPhone: applicationDetails.endCustomerDetails.endCustomerContactPhone,
            EndCustomerContactEmail: applicationDetails.endCustomerDetails.endCustomerContactEmail,
            EndCustomerPrimaryAddressLine1: applicationDetails.endCustomerDetails.endCustomerPrimaryAddressLine1,
            EndCustomerPrimaryAddressLine2: applicationDetails.endCustomerDetails.endCustomerPrimaryAddressLine2,
            EndCustomerPrimaryCity: applicationDetails.endCustomerDetails.endCustomerPrimaryCity,
            EndCustomerPrimaryState: applicationDetails.endCustomerDetails.endCustomerPrimaryState,
            EndCustomerPrimaryCountry: applicationDetails.endCustomerDetails.endCustomerPrimaryCountry,
            EndCustomerPrimaryPostcode: applicationDetails.endCustomerDetails.endCustomerPrimaryPostcode,

            EndCustomerPostalAddressLine1: applicationDetails.endCustomerDetails.endCustomerPostalAddressLine1,
            EndCustomerPostalAddressLine2: applicationDetails.endCustomerDetails.endCustomerPostalAddressLine2,
            EndCustomerPostalCity: applicationDetails.endCustomerDetails.endCustomerPostalCity,
            EndCustomerPostalState: applicationDetails.endCustomerDetails.endCustomerPostalState,
            EndCustomerPostalCountry: applicationDetails.endCustomerDetails.endCustomerPostalCountry,
            EndCustomerPostalPostcode: applicationDetails.endCustomerDetails.endCustomerPostalPostcode,

            EndCustomerDeliveryAddressLine1: applicationDetails.endCustomerDetails.endCustomerDeliveryAddressLine1,
            EndCustomerDeliveryAddressLine2: applicationDetails.endCustomerDetails.endCustomerDeliveryAddressLine2,
            EndCustomerDeliveryCity: applicationDetails.endCustomerDetails.endCustomerDeliveryCity,
            EndCustomerDeliveryState: applicationDetails.endCustomerDetails.endCustomerDeliveryState,
            EndCustomerDeliveryCountry: applicationDetails.endCustomerDetails.endCustomerDeliveryCountry,
            EndCustomerDeliveryPostcode: applicationDetails.endCustomerDetails.endCustomerDeliveryPostcode,

        });

        this.guarantorItems.clear();
        this.trusteeItems.clear();
        this.accountantItems.clear();
        this.beneficialOwners.clear();

        applicationDetails.applicationContacts.forEach((applicationContact: ApplicationContact) => {

            // tslint:disable-next-line: max-line-length
            if (applicationContact.contactType === 1 || applicationContact.contactType === 2 || applicationContact.contactType === 3 || applicationContact.contactType === 4) {
                this.guarantorItems.push(this.createTableRow(applicationContact));
            }

            if (applicationContact.contactType === 5) {
                this.trusteeItems.push(this.createTableRow(applicationContact));
            }

            if (applicationContact.contactType === 6) {
                this.accountantItems.push(this.createTableRow(applicationContact));
            }

            if (applicationContact.contactType === 7) {
                this.beneficialOwners.push(this.createTableRow(applicationContact));
            }

        });

        this.financeInformationForm.patchValue({
            QuoteID: applicationDetails.quoteID,
            GoodsDescription: applicationDetails.goodsDescription,
            FinanceTotal: applicationDetails.financeTotal,
            QuoteTotal: applicationDetails.quoteTotal,
            FinanceFunderName: applicationDetails.financeFunderName,
            FinanceType: applicationDetails.financeType,
            FinanceFrequency: applicationDetails.financeFrequency,
            FinanceDuration: applicationDetails.financeDuration,
            FinanceValue: applicationDetails.financeValue,
            ResellerName: applicationDetails.resellerDetails.resellerName,
            ResellerContactName: applicationDetails.resellerDetails.resellerContactName,
            ResellerId: applicationDetails.resellerDetails.resellerID
        });

        this.items.clear();
        applicationDetails.applicationContacts.forEach((appContact: ApplicationContact) => {

            this.items.push(this.createTableRow(appContact));
        });

        this.signatoriesForm.patchValue({
            IsGuarantorPropertyOwner: applicationDetails.isGuarantorPropertyOwner,
            GuarantorSecurityValue: applicationDetails.guarantorSecurityValue,
            GuarantorSecurityOwing: applicationDetails.guarantorSecurityOwing,
        });


    }

    setFormControlsByPermission() {
        if (this.IMStaffAdminRole) {
            this.applicationCustomerDetailsForm.get('Status')?.enable();
        }
        else {
            this.applicationCustomerDetailsForm.get('Status')?.disable();
        }
    }

    tabChange(event: any) {
        if (event.index === 1) {
            // quote header text
            // if (!this.applicationCustomerDetailsForm.valid) {
            //     this.imfsUtilityService.showToastr('error', 'Invalid Input', 'Please enter all required fields.');
            //     setTimeout(() => {
            //         this.activeTabIndex = 0;
            //     }, 0);
            // }
        } else if (event.index === 2) {
            // going to summary tab
            // if (this.quoteLineForm.valid) {
            //     this.imfsUtilities.showToastr('error', 'Invalid Input', 'Please enter all required fields.');
            //     setTimeout(() => {
            //         this.activeTabIndex = 0;
            //     }, 0);
            // }
        }
    }


    getApplicationGuarantorItems() {
        return this.guarantorItems;
    }

    getApplicationTrusteeItems() {

    }

    getApplicationAccountantItems() {

    }

    getApplicationBeneficialOwnersItems() {

    }

    saveApplication() {

        const applicationDetails = this.convertFormToModel();

        this.imfsUtilityService.showLoading('Saving...');
        // save quote details to server
        this.applicationControllerService.saveApplication(applicationDetails).subscribe(
            (response: HttpResponseData) => {
                this.imfsUtilityService.hideLoading();
                this.imfsUtilityService.showToastr('success', 'Success', 'Application Updated Successfully:' + response.data);
                //void this.router.navigate([IMFSRoutes.Application, response.data]);
                void this.router.navigate([IMFSRoutes.Application], { queryParams: { id: response.data, mode: 'edit'}});
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilityService.hideLoading();
                this.imfsUtilityService.showToastr('error', 'Failed', 'Error Saving Application');
            }
        );

    }


    convertFormToModel() {
        // const quoteDetails = new QuoteDetailsModel();
        this.applicationDetails = new ApplicationDetailsModel();
        this.applicationDetails.entityDetails = new EntityDetails();
        this.applicationDetails.endCustomerDetails = new EndCustomerDetails();
        this.applicationDetails.resellerDetails = new ResellerDetails();
        this.applicationDetails.applicationContacts = [];

        this.applicationDetails.id = this.applicationCustomerDetailsForm.get('Id')?.value;
        this.applicationDetails.applicationNumber = this.applicationCustomerDetailsForm.get('ApplicationNumber')?.value;
        this.applicationDetails.status = this.applicationCustomerDetailsForm.get('Status')?.value;
        this.applicationDetails.entityDetails.entityType = this.entityTypeRadio ? this.entityTypeRadio : ""
        this.applicationDetails.entityDetails.entityTrustName = this.applicationCustomerDetailsForm.get('EntityTrustName')?.value;
        this.applicationDetails.entityDetails.entityTrustABN = this.applicationCustomerDetailsForm.get('EntityTrustABN')?.value;

        if (this.applicationCustomerDetailsForm.get('EntityType')?.value === this.otherEntityType) {
            this.applicationDetails.entityDetails.entityTypeOther = this.applicationCustomerDetailsForm.get('EntityTypeOther')?.value;
        }

        this.applicationDetails.entityDetails.entityTrustType = this.applicationCustomerDetailsForm.get('EntityTrustType')?.value;

        if (this.applicationCustomerDetailsForm.get('EntityTrustType')?.value === this.otherTrustType) {
            this.applicationDetails.entityDetails.entityTrustOther = this.applicationCustomerDetailsForm.get('EntityTrustOther')?.value;
        }

        this.applicationDetails.endCustomerDetails.endCustomerName = this.applicationCustomerDetailsForm.get('EndCustomerName')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerABN = this.applicationCustomerDetailsForm.get('EndCustomerABN')?.value;
        // tslint:disable-next-line: max-line-length
        this.applicationDetails.endCustomerDetails.endCustomerTradingAs = this.applicationCustomerDetailsForm.get('EndCustomerTradingAs')?.value;
        // tslint:disable-next-line: max-line-length
        this.applicationDetails.endCustomerDetails.endCustomerPhone = this.applicationCustomerDetailsForm.get('EndCustomerPhone')?.value;
        this.applicationDetails.businessActivity = this.applicationCustomerDetailsForm.get('BusinessActivity')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerFax = this.applicationCustomerDetailsForm.get('EndCustomerFax')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerYearsTrading = this.applicationCustomerDetailsForm.get('EndCustomerYearsTrading')?.value;
        this.applicationDetails.aveAnnualSales = this.applicationCustomerDetailsForm.get('AveAnnualSales')?.value;
        // tslint:disable-next-line: max-line-length
        this.applicationDetails.endCustomerDetails.endCustomerContactName = this.applicationCustomerDetailsForm.get('EndCustomerContactName')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerContactEmail = this.applicationCustomerDetailsForm.get('EndCustomerContactEmail')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerContactPhone = this.applicationCustomerDetailsForm.get('EndCustomerContactPhone')?.value;


        // Business Address
        this.applicationDetails.endCustomerDetails.endCustomerPrimaryAddressLine1 = this.applicationCustomerDetailsForm.get('EndCustomerPrimaryAddressLine1')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerPrimaryAddressLine2 = this.applicationCustomerDetailsForm.get('EndCustomerPrimaryAddressLine2')?.value;
        // tslint:disable-next-line: max-line-length
        this.applicationDetails.endCustomerDetails.endCustomerPrimaryCity = this.applicationCustomerDetailsForm.get('EndCustomerPrimaryCity')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerPrimaryState = this.applicationCustomerDetailsForm.get('EndCustomerPrimaryState')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerPrimaryPostcode = this.applicationCustomerDetailsForm.get('EndCustomerPrimaryPostcode')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerPrimaryCountry = this.applicationCustomerDetailsForm.get('EndCustomerPrimaryCountry')?.value;

        // Postal Address
        this.applicationDetails.endCustomerDetails.endCustomerPostalAddressLine1 = this.applicationCustomerDetailsForm.get('EndCustomerPostalAddressLine1')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerPostalAddressLine2 = this.applicationCustomerDetailsForm.get('EndCustomerPostalAddressLine2')?.value;
        // tslint:disable-next-line: max-line-length
        this.applicationDetails.endCustomerDetails.endCustomerPostalCity = this.applicationCustomerDetailsForm.get('EndCustomerPostalCity')?.value;
        // tslint:disable-next-line: max-line-length
        this.applicationDetails.endCustomerDetails.endCustomerPostalState = this.applicationCustomerDetailsForm.get('EndCustomerPostalState')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerPostalPostcode = this.applicationCustomerDetailsForm.get('EndCustomerPostalPostcode')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerPostalCountry = this.applicationCustomerDetailsForm.get('EndCustomerPostalCountry')?.value;

        // Delivery Address
        this.applicationDetails.endCustomerDetails.endCustomerDeliveryAddressLine1 = this.applicationCustomerDetailsForm.get('EndCustomerDeliveryAddressLine1')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerDeliveryAddressLine2 = this.applicationCustomerDetailsForm.get('EndCustomerDeliveryAddressLine2')?.value;
        // tslint:disable-next-line: max-line-length
        this.applicationDetails.endCustomerDetails.endCustomerDeliveryCity = this.applicationCustomerDetailsForm.get('EndCustomerDeliveryCity')?.value;
        // tslint:disable-next-line: max-line-length
        this.applicationDetails.endCustomerDetails.endCustomerDeliveryState = this.applicationCustomerDetailsForm.get('EndCustomerDeliveryState')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerDeliveryPostcode = this.applicationCustomerDetailsForm.get('EndCustomerDeliveryPostcode')?.value;
        this.applicationDetails.endCustomerDetails.endCustomerDeliveryCountry = this.applicationCustomerDetailsForm.get('EndCustomerDeliveryCountry')?.value;

        this.guarantorItems.controls.forEach((item: AbstractControl) => {
            const appContact = new ApplicationContact();

            appContact.contactID = item.get('ContactID')?.value;
            appContact.contactName = item.get('ContactName')?.value;
            appContact.contactEmail = item.get('ContactEmail')?.value;
            appContact.contactAddress = item.get('ContactAddress')?.value;
            appContact.contactDOB = item.get('ContactDOB')?.value;
            appContact.contactDriversLicNo = item.get('ContactDriversLicNo')?.value;
            appContact.contactPhone = item.get('ContactPhone')?.value;
            appContact.contactType = item.get('ContactType')?.value;
            appContact.contactABNACN = item.get('ContactABNACN')?.value;

            // Add to the list
            this.applicationDetails.applicationContacts.push(appContact);
        });

        this.trusteeItems.controls.forEach((item: AbstractControl) => {
            const appContact = new ApplicationContact();

            appContact.contactID = item.get('ContactID')?.value;
            appContact.contactName = item.get('ContactName')?.value;
            appContact.contactEmail = item.get('ContactEmail')?.value;
            appContact.contactAddress = item.get('ContactAddress')?.value;
            appContact.contactDOB = item.get('ContactDOB')?.value;
            appContact.contactDriversLicNo = item.get('ContactDriversLicNo')?.value;
            appContact.contactPhone = item.get('ContactPhone')?.value;
            appContact.contactType = item.get('ContactType')?.value;
            appContact.contactABNACN = item.get('ContactABNACN')?.value;

            // Add to the list
            this.applicationDetails.applicationContacts.push(appContact);
        });

        this.beneficialOwners.controls.forEach((item: AbstractControl) => {
            const appContact = new ApplicationContact();

            appContact.contactID = item.get('ContactID')?.value;
            appContact.contactName = item.get('ContactName')?.value;
            appContact.contactEmail = item.get('ContactEmail')?.value;
            appContact.contactAddress = item.get('ContactAddress')?.value;
            appContact.contactDOB = item.get('ContactDOB')?.value;
            appContact.contactDriversLicNo = item.get('ContactDriversLicNo')?.value;
            appContact.contactPhone = item.get('ContactPhone')?.value;
            appContact.contactType = item.get('ContactType')?.value;
            appContact.contactABNACN = item.get('ContactABNACN')?.value;

            // Add to the list
            this.applicationDetails.applicationContacts.push(appContact);
        });


        return this.applicationDetails;
    }

    getFormData(rowData: any, key: string) {

        if (key === 'ContactDOB') {
            return moment(rowData.get(key).value).format('DD/MM/YYYY');
        }
        if (rowData && rowData.get(key)) {
            return rowData.get(key).value;
        }
        return '';
    }


    get items(): FormArray {
        if (this.signatoriesForm) {
            return this.signatoriesForm.get('items') as FormArray;
        }
        return this.formBuilder.array([this.createTableRow(new ApplicationContact())]);
    }


    insertNewGuarantorItem() {
        const applicationContact = new ApplicationContact();
        this.guarantorItems.push(this.createTableRow(applicationContact));
    }

    downloadApplication() {

        this.imfsUtilityService.showLoading('Downloading...');
        const applicationDownloadInput = new ApplicationDownloadInput();
        applicationDownloadInput.ApplicationNumber = this.getFormData(this.applicationCustomerDetailsForm, 'ApplicationNumber');

        this.applicationControllerService.downloadApplication(applicationDownloadInput).subscribe(
            (res: any) => {
                this.jsUtilityService.fileSaveAs(res);
                this.imfsUtilityService.hideLoading();
            },
            (err: any) => {
                this.imfsUtilityService.hideLoading();
                console.log(err);
                this.imfsUtilityService.showToastr('error', 'Error', 'Unable to download file.');
            }
        );

    }

    emailApplication(applicationNumber: number) {
        // tslint:disable-next-line: max-line-length
        void this.router.navigate([IMFSRoutes.Email], {
            queryParams: {
                applicationId: applicationNumber,
                toEmail: this.applicationCustomerDetailsForm.controls.EndCustomerContactEmail.value
            }
        });
    }


    getApplicationId() {
        return this.applicationCustomerDetailsForm.controls.Id.value;
    }

    emailFunder(applicationNumber: number) {
        void this.router.navigate([IMFSRoutes.Email], {
            queryParams: {
                applicationId: applicationNumber,
                toEmail: this.applicationCustomerDetailsForm.controls.FinanceFunderEmail.value
            }
        });
    }

    openEmailHistoryModal() {
        this.emailHistoryModal.open(this.applicationCustomerDetailsForm.controls.ApplicationNumber.value);
    }

    openContactModal(type: string) {
        this.contactModal.open(type, this.resellerIdGlobal);
    }

    onContactSelected(event: any) {
        if (this.contactModal.selectedContact) {

            // this.contactModal.selectedContact.contactDOB = moment(this.contactModal.selectedContact.contactDOB).toDate();

            if (this.contactModal.selectedContact.contactType === 1 || this.contactModal.selectedContact.contactType === 2 ||
                this.contactModal.selectedContact.contactType === 3 || this.contactModal.selectedContact.contactType === 4) {
                this.guarantorItems.push(this.createTableRow(this.contactModal.selectedContact));
            }
            if (this.contactModal.selectedContact.contactType === 5) {
                this.trusteeItems.push(this.createTableRow(this.contactModal.selectedContact));
            }

            if (this.contactModal.selectedContact.contactType === 6) {
                this.accountantItems.push(this.createTableRow(this.contactModal.selectedContact));
            }
            if (this.contactModal.selectedContact.contactType === 7) {
                this.beneficialOwners.push(this.createTableRow(this.contactModal.selectedContact));
            }
        }
        else if (this.contactModal.currentItem.contactName) {
            const dt = moment(this.contactModal.currentItem.contactDOB).format('DD/MM/YYYY');
            // this.contactModal.currentItem.contactDOB = moment(this.contactModal.currentItem.contactDOB).format('dd/MM/yyyy');

            if (this.contactModal.currentItem.contactType === 1 || this.contactModal.currentItem.contactType === 2 ||
                this.contactModal.currentItem.contactType === 3 || this.contactModal.currentItem.contactType === 4) {
                this.guarantorItems.push(this.createTableRow(this.contactModal.currentItem));
            }
            if (this.contactModal.currentItem.contactType === 5) {
                this.trusteeItems.push(this.createTableRow(this.contactModal.currentItem));
            }

            if (this.contactModal.currentItem.contactType === 6) {
                this.accountantItems.push(this.createTableRow(this.contactModal.currentItem));
            }
            if (this.contactModal.currentItem.contactType === 7) {
                this.beneficialOwners.push(this.createTableRow(this.contactModal.currentItem));
            }
        }


    }


    navigateApplication(value: any, back: any) {

        if (back == 'back') {
            value = this.activeIndex - 1
        }
        if (value == 0) {
            this.custDetails = true
            this.financeInfo = false
            this.signatories = false
            this.documents = false
            this.activeIndex = 0

        } else if (value == 1) {
            this.custDetails = false
            this.financeInfo = true
            this.signatories = false
            this.activeIndex = 1
            this.documents = false

        } else if (value == 2) {
            this.custDetails = false
            this.financeInfo = false
            this.signatories = true
            this.documents = false
            this.activeIndex = 2

        } else if (value == 3) {
            this.custDetails = false
            this.financeInfo = false
            this.signatories = false
            this.documents = true
            this.activeIndex = 3
        }
    }

    displayDocumentUploadModal = false;
    //uploadFilebutton:boolean=true;
    showDocumentUploadDialog() {
        if (this.getfileApplicationid) {
            this.displayDocumentUploadModal = true;
        }
        else {
            this.imfsUtilityService.showToastr('error', 'Save Data', 'Please save the quote before uploading the file');
            this.displayDocumentUploadModal = false;
        }
    }
    closeDocumentPopupDialog(): void {
        this.displayDocumentUploadModal = false;
    }
    filesLists: any;
    filelist = new QuoteDocuments();

    getFiles() {
        if ( this.getfileApplicationid &&  this.getfileApplicationid > 0) {
            this.applicationControllerService.getApplicationFileList( this.getfileApplicationid).subscribe((response: QuoteDocuments) => {
                this.filesLists = response;
                console.log(this.filesLists);
            });
        }
    }
    getRemoveFile(event: any) {
        this.getFiles();
    }

    onDeleteFile(fileId: number) {

        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),

            body: {
                FileId: fileId
            }

        }

        this.confirmationService.confirm({
            message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.http.post(environment.API_BASE + '/Quote/DeleteQuoteAttachments', options).subscribe((response) => {
                    this.imfsUtilityService.showToastr('success', 'Success', 'File deleted successfully');
                    this.getRemoveFile('');

                },
                    (err: any) => {
                        console.log(err);
                        this.imfsUtilityService.hideLoading();
                        this.imfsUtilityService.showToastr('error', 'Failed', 'Error in deleting file');
                    })
            },
            reject: () => {
            }

        });
    }
    downloadDocumentFile(fileId: number) {
        if (!fileId) {
            return;
        }
        this.applicationControllerService.downloadQuoteAttachment(fileId).subscribe((response: any) => {
            console.log(response);
            const fileObj = this.filesLists?.filter((file: QuoteDocuments) => file?.fileId === fileId)[0];
            const fileName = fileObj?.fileName;
            const fileContent = response.body;
            console.log(response?.fileName);
            const blob = new Blob([fileContent], { type: 'application/octet-stream; charset=utf-8' });
            saveAs(blob, fileName);
        })
    }
    lastStepTab(){
        this.saveApplication();
        this.documents=true
        this.activeIndex=3
        this.signatories=false 
    }


}
