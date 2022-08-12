using IMFS.Web.Models.Application;
using IMFS.Web.Models.DBModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace IMFS.BusinessLogic.ApplicationManagement
{
    public interface IApplicationManager
    {
        ApplicationDetailsResponseModel GetApplicationDetails(string applicationId);

        ApplicationSearchResponseModel SearchApplication(ApplicationSearchModel quoteSearchModel, string resellerId);

        ApplicationSearchResponseModel LookupApplicationNumber(ApplicationSearchModel quoteSearchModel, string resellerId);

        ApplicationSaveResponseModel SaveApplication(ApplicationDetailsModel applicationDetailsModel, string userId);

        List<Contacts> GetContacts(string resellerID);

        List<Contacts> GetGuarantorContacts(string resellerID);

        List<Contacts> GetAccountantContacts(string resellerID);

        List<Contacts> GetTrusteeContacts(string resellerID);

        List<Contacts> GetBeneficialOwnersContacts(string resellerID);

        ApplicationDownloadResponse DownloadApplication(ApplicationDownloadInput inputModel);

        ApplicationUpdateResponseModel RejectApplication(int applicationId);
        ApplicationUpdateResponseModel CancelApplication(int applicationId);

        List<RecentApplicationsModel> GetRecentApplications(string resellerId);

        List<AwaitingInvoiceModel> GetAwaitingInvoices(string resellerId);
    }
}
