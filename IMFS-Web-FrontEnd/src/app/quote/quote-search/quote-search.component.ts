import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import * as moment from 'moment';
import { combineLatest } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { QuoteSearchModel, QuoteSearchResponseModel } from 'src/app/models/quote/quote.model';
import { IMFSRoutes } from 'src/app/models/routes/imfs-routes';
import { HttpResponseData } from 'src/app/models/utility-models/response.model';
import { QuoteControllerService } from 'src/app/services/controller-services/quote-controller.service';
import { IMFSFormService } from 'src/app/services/utility-services/imfs-form-service';
import { IMFSUtilityService } from 'src/app/services/utility-services/imfs-utility-services';
import { StatusModel } from 'src/app/models/options/options.model';
import { OptionsControllerService } from 'src/app/services/controller-services/options-controller.service';


@Component({
    selector: 'app-quote-search',
    templateUrl: './quote-search.component.html',
    styleUrls: ['./quote-search.component.scss']
})


export class QuoteSearchComponent implements OnInit {
    quoteSearchForm: FormGroup;
    filteredQuotes: QuoteSearchResponseModel[];
    quoteStatusOptions: StatusModel[];
    createdDate: Date;
    quoteSearchModel: QuoteSearchModel;

    constructor(
        private formBuilder: FormBuilder,
        private imfsUtilities: IMFSUtilityService,
        private formUtility: IMFSFormService,
        private quoteControllerService: QuoteControllerService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private optionsControllerService: OptionsControllerService,
        private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.initForm();
        this.setDefaults();
        this.getQuoteStatus();
        this.searchQuotes();
    }

    initForm() {
        this.quoteSearchForm = this.formBuilder.group({
            QuoteNumber: new FormControl(''),
            QuoteStatus: new FormControl('', Validators.required),
            FinanceType: new FormControl('', Validators.required),
            CreatedDate: new FormControl(''),
            ExpiryDate: new FormControl(''),
            EndUser: new FormControl(''),
        });
    }

    setDefaults() {

        this.quoteSearchForm.controls.QuoteNumber.patchValue('');
        this.quoteSearchForm.controls.QuoteStatus.patchValue(0);
        this.quoteSearchForm.controls.FinanceType.patchValue('1');
        this.quoteSearchForm.controls.ExpiryDate.patchValue('');
        this.quoteSearchForm.controls.EndUser.patchValue('');

        const defaultCreateDate = moment().subtract(30, 'd').toDate();
        this.quoteSearchForm.controls.CreatedDate.patchValue(defaultCreateDate);

    }

    getQuoteStatus() {
        this.optionsControllerService.getStatus(false, true, false).subscribe(
            (response: StatusModel[]) => {
                this.imfsUtilities.hideLoading();
                if (response.length === 0) {
                    this.imfsUtilities.showToastr('error', 'Failed', 'No Status found');
                }
                else {
                    this.quoteStatusOptions = response;
                }
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('error', 'Failed', 'Error in Get Status');
            }
        );
    }

    onQuoteNumberSelect(event: any) {
        console.log(event);
        if (event) {

        } else {

        }
    }

    filterQuote(event: any) {

        this.quoteSearchModel = new QuoteSearchModel();
        if (this.quoteSearchForm.controls.FinanceType.value) {
            this.quoteSearchModel.quoteFinancetype = this.quoteSearchForm.controls.FinanceType.value;
        }
        if (this.quoteSearchForm.controls.QuoteNumber.value) {
            this.quoteSearchModel.quoteNumber = this.quoteSearchForm.controls.QuoteNumber.value as number;
        }
        if (this.quoteSearchForm.controls.QuoteStatus.value as number) {
            this.quoteSearchModel.quoteStatus = this.quoteSearchForm.controls.QuoteStatus.value as number;
        }

        if (this.quoteSearchForm.controls.EndUser.value) {
            this.quoteSearchModel.endUser = this.quoteSearchForm.controls.EndUser.value;
        }

        if (this.quoteSearchForm.controls.CreatedDate.value) {
            this.quoteSearchModel.createdDate = this.quoteSearchForm.controls.CreatedDate.value;
        }

        if (this.quoteSearchForm.controls.ExpiryDate.value) {
            this.quoteSearchModel.expiryDate = this.quoteSearchForm.controls.ExpiryDate.value;
        }
        this.quoteControllerService.lookupQuoteNumber(this.quoteSearchModel).subscribe(
            (response: HttpResponseData) => {
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('success', 'Success', 'Quote Search Success');
                this.filteredQuotes = response.searchResult;
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('error', 'Failed', 'Error Searching quote');
            }

        );
    }

    openQuote(quoteNumber: number) {
        void this.router.navigate([IMFSRoutes.Quote], { queryParams: { id: quoteNumber, mode: 'edit'}});
    }

    emailQuote(quoteNumber: number) {
        void this.router.navigate([IMFSRoutes.Email], { queryParams: { quoteId: quoteNumber } });
    }

    searchQuotes() {
        this.quoteSearchModel = new QuoteSearchModel();
        if (this.quoteSearchForm.controls.FinanceType.value) {
            this.quoteSearchModel.quoteFinancetype = this.quoteSearchForm.controls.FinanceType.value;
        }
        if (this.quoteSearchForm.controls.QuoteNumber.value) {
            this.quoteSearchModel.quoteNumber = this.quoteSearchForm.controls.QuoteNumber.value.quoteNumber as number;
        }
        if (this.quoteSearchForm.controls.QuoteStatus.value as number) {
            this.quoteSearchModel.quoteStatus = this.quoteSearchForm.controls.QuoteStatus.value as number;
        }

        if (this.quoteSearchForm.controls.EndUser.value) {
            this.quoteSearchModel.endUser = this.quoteSearchForm.controls.EndUser.value;
        }

        if (this.quoteSearchForm.controls.CreatedDate.value) {
            this.quoteSearchModel.createdDate = this.quoteSearchForm.controls.CreatedDate.value;
        }

        if (this.quoteSearchForm.controls.ExpiryDate.value) {
            this.quoteSearchModel.expiryDate = this.quoteSearchForm.controls.ExpiryDate.value;
        }

        this.imfsUtilities.showLoading('Searching Quotes...');
        // save quote details to server
        this.quoteControllerService.searchQuote(this.quoteSearchModel).subscribe(
            (response: HttpResponseData) => {
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('success', 'Success', 'Quote Search Success');
                this.filteredQuotes = response.searchResult;
            },
            (err: any) => {
                console.log(err);
                this.imfsUtilities.hideLoading();
                this.imfsUtilities.showToastr('error', 'Failed', 'Error Searching quote');
            }
        );

    }


}
