import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { MessageService, SortEvent } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { IMFSUtilityService } from 'src/app/services/utility-services/imfs-utility-services';
import { JsUtilityService } from 'src/app/services/utility-services/js-utility.service';
import { EmailControllerService } from 'src/app/services/controller-services/email-controller.service';
import { AttachmentControllerService } from 'src/app/services/controller-services/attachment-controller.service';
import { EmailAttachment } from 'src/app/models/email/email.model';
import { HttpResponseData } from 'src/app/models/utility-models/response.model';

@Component({
    selector: 'app-email-upload-modal',
    templateUrl: './email-upload-modal.component.html',
})
export class EmailUploadModalComponent implements OnInit {
    displayDialog = false;
    tempEmailId: string;
    @Output() refreshAttachmentFilesEmit = new EventEmitter();

    filesToUpload: File[] = [];
    fileNamesToUpload: string;

    filesUploaded: EmailAttachment[] = [];

    @ViewChild('fileUpload') fileUpload: FileUpload;

    constructor(
        private imfsUtilityService: IMFSUtilityService,
        private jsUtilityService: JsUtilityService,
        private emailControllerService: EmailControllerService,
        private attachmentControllerService: AttachmentControllerService,
        private messageService: MessageService,
    ) {
    }

    ngOnInit() {

    }

    open(tempEmailId: string) {
        this.tempEmailId = tempEmailId;
        this.displayDialog = true;
        this.filesToUpload = [];
        this.fileNamesToUpload = '';
        this.fileUpload.clear();   // clear all existing files
    }

    onSelect(event: any) {

        const fileNames: string[] = [];

        for (const file of event.files) {
            this.filesToUpload.push(new File([file], file.name));
            fileNames.push(file.name);
        }

        this.fileNamesToUpload = fileNames.join('\n').toString();


        if (!this.filesToUpload) {
            return;
        }

        const formData: FormData = new FormData();
        formData.append('tempEmailId', this.tempEmailId);

        for (const file of this.filesToUpload) {
            formData.append('Files', file, file.name);
        }

        this.imfsUtilityService.showLoading('Saving temp file...');
        this.attachmentControllerService.saveEmailAttachmentTempFile(formData).subscribe(
            (response: EmailAttachment[]) => {

                this.imfsUtilityService.hideLoading();

                for (const emailAttachment of response) {
                    this.filesUploaded.push(emailAttachment);
                }

                this.refreshAttachmentFilesEmit.emit();
            },
            (err: any) => {
                this.imfsUtilityService.hideLoading();
                console.log(err);
                this.imfsUtilityService.showToastr('error', 'Error', 'Unable to upload file.');
            }
        );

    }

    onRemove(event: any) {
        const formData: FormData = new FormData();
        formData.append('tempEmailId', this.tempEmailId);

        const file = event.file;
        const fileToDelete = this.filesUploaded.find(x => x.fileName === file.name);

        this.imfsUtilityService.showLoading('Deleting temp file...');
        this.attachmentControllerService.removeEmailAttachmentTempFile(fileToDelete?.id).subscribe(
            (response: HttpResponseData) => {

                this.imfsUtilityService.hideLoading();
                this.refreshAttachmentFilesEmit.emit();
            },
            (err: any) => {
                this.imfsUtilityService.hideLoading();
                console.log(err);
                this.imfsUtilityService.showToastr('error', 'Error', 'Unable to delete file.');
            }
        );
    }

    uploadFiles() {

    }

    closeDialog() {

    }
}
