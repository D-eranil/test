import { Component, OnInit, Output,Input, EventEmitter } from '@angular/core';
import { SearchService } from "../../services/controller-services/searchservice";
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IMFSFormService } from 'src/app/services/utility-services/imfs-form-service';
import {AbnDetailsResponseModel, CompanySearchResponseModel} from '../../models/companySearchModal/companySearchModal';
import { IMFSUtilityService } from 'src/app/services/utility-services/imfs-utility-services';
import { JsUtilityService } from 'src/app/services/utility-services/js-utility.service';
@Component({
  selector: 'app-au-search-template',
  templateUrl: './au-search-template.component.html',
  styleUrls: ['./au-search-template.component.scss'],
  providers: [SearchService]
})
export class AuSearchTemplateComponent implements OnInit {
  submitted = false;
  searchPopupform: FormGroup;
  
  @Input() type:any = true;

  companyName: CompanySearchResponseModel[];

  filteredCompanyName: any[];

  selectedCompany: any[];

  selectedAbn: any ='';

  abnNumber:AbnDetailsResponseModel;

  filteredAbn: any[];

  selectedAbnSearch: any[];
  number="";
  selectedCompanyName: string = '';
  constructor(private searchService: SearchService, private searchPopForm: FormBuilder, private formUtility: IMFSFormService, private imfsUtilityService: IMFSUtilityService,) {}

  ngOnInit(): void {
    this.searchPopupform = this.searchPopForm.group({
      searchcompanyname: new FormControl('', Validators.required),
      searchabn: new FormControl('',[Validators.required])
  });
  }
  numberOnly(event:any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  filterCompany(event:any) {
    this.searchService.getBusinessName(event.query).subscribe(companyName => {
      this.companyName = companyName.names;
      console.log(this.companyName)
    this.filteredCompanyName = companyName.names;
    console.log(this.filteredCompanyName);
    },
    (err: any) => {
      console.log(err);
      this.imfsUtilityService.hideLoading();
      this.imfsUtilityService.showToastr('error', 'Failed', 'ABR Search currently unavailable');
      if(err.status == 500){
      this.imfsUtilityService.hideLoading();
      this.imfsUtilityService.showToastr('error', 'Failed', 'ABR Search currently unavailable');
      }
    }
    );
    
  }
  filterabn(event:any) {
    this.searchService.getAbn(event.query).subscribe(abnNum => {
      this.abnNumber = abnNum;
      let filtered: any[] = [];
    let query = event.query;
    let abnSearch = this.abnNumber;
    if (abnSearch.abn.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(abnSearch);
    }
    this.filteredAbn = filtered;
    },
    (err: any) => {
      console.log(err);
      this.imfsUtilityService.hideLoading();
      this.imfsUtilityService.showToastr('error', 'Failed', 'ABR Search currently unavailable');
      if(err.status == 500){
      this.imfsUtilityService.hideLoading();
      this.imfsUtilityService.showToastr('error', 'Failed', 'ABR Search currently unavailable');
      }
    }
    );
  }
  nameSelectedItem(event:any) {
    return event.name;
}
  abnSelectedItem(event:any) {
    return event.Abn;
}
  @Output() onDialogClose: EventEmitter<any> = new EventEmitter(); 
  closeDialog() {
    this.onDialogClose.emit();
    this.searchPopupform.reset();
  }
  @Output() selectSearchCompany: EventEmitter<string> = new EventEmitter();
  @Output() selectSearchAbn: EventEmitter<string> = new EventEmitter();
  onAddSelectCompany() {
    this.selectSearchCompany.emit(this.selectedCompanyName);
    this.selectSearchAbn.emit(this.selectedCompanyName);
    this.searchPopupform.reset();
    this.onDialogClose.emit();
  }
  onAddSelectAbn() {
    this.selectSearchCompany.emit(this.selectedAbn);
    this.selectSearchAbn.emit(this.selectedAbn);
    this.searchPopupform.reset();
    this.onDialogClose.emit();
  }
  get f() { return this.searchPopupform.controls; }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.searchPopupform.invalid) {
          return;
      }
    }

}
