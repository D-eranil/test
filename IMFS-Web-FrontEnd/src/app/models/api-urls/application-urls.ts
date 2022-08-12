import { environment } from 'src/environments/environment';

const controllerName = 'application';
const baseUrl: string = environment.API_BASE + '/' + controllerName + '/';

export const ApplicationUrls = {
    GetApplicationDetails: baseUrl + 'GetApplicationDetails',
    SaveApplication: baseUrl + 'SaveApplication',
    SearchApplication: baseUrl + 'SearchApplication',
    LookupApplicationNumber: baseUrl + 'LookupApplicationNumber',
    GetContacts: baseUrl + 'GetContacts',
    DownloadApplication: baseUrl + 'DownloadApplication',
    RejectApplication: baseUrl + 'RejectApplication',
    CancelApplication: baseUrl + 'CancelApplication',
    RecentApplication: baseUrl + 'getRecentApplications',
    AwaitingInvoice: baseUrl + 'getAwaitingInvoices'
};
