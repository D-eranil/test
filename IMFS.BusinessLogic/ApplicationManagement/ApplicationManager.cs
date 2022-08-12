using IMFS.DataAccess.Repository;
using IMFS.Web.Models.Application;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using IMFS.Web.Models.DBModel;
using Microsoft.Extensions.Configuration;
using System.IO;
using iTextSharp.text.pdf;
using IMFS.Core;

namespace IMFS.BusinessLogic.ApplicationManagement
{
    public class ApplicationManager : IApplicationManager
    {
        private readonly IRepository<Web.Models.DBModel.Applications> _applicationsRepository;
        private readonly IRepository<Web.Models.DBModel.FinanceType> _financeTypesRepository;
        private readonly IRepository<Web.Models.DBModel.Status> _statusRepository;
        private readonly IRepository<Web.Models.DBModel.ContactsXref> _contactsXrefRepository;
        private readonly IRepository<Web.Models.DBModel.Contacts> _contactsRepository;
        private readonly IRepository<Web.Models.DBModel.Funder> _fundersRepository;
        private readonly IRepository<Web.Models.DBModel.ContactsTypes> _contactTypesRepository;
        private readonly IRepository<Web.Models.DBModel.Quotes> _quotesRepository;

        public IConfiguration Configuration { get; }

        public ApplicationManager(IRepository<Web.Models.DBModel.Applications> applicationsRepository,
            IRepository<Web.Models.DBModel.FinanceType> financeTypesRepository,
            IRepository<Web.Models.DBModel.Status> statusRepository,
            IRepository<Web.Models.DBModel.ContactsXref> contactsXrefRepository,
            IRepository<Web.Models.DBModel.Contacts> contactsRepository,
            IRepository<Web.Models.DBModel.Funder> fundersRepository,
            IRepository<Web.Models.DBModel.ContactsTypes> contactTypesRepository,
            IRepository<Web.Models.DBModel.Quotes> quotesRepository,
            IConfiguration configuration)
        {
            _applicationsRepository = applicationsRepository;
            _financeTypesRepository = financeTypesRepository;
            _statusRepository = statusRepository;
            _contactsXrefRepository = contactsXrefRepository;
            _contactsRepository = contactsRepository;
            _fundersRepository = fundersRepository;
            _contactTypesRepository = contactTypesRepository;
            _quotesRepository = quotesRepository;
            Configuration = configuration;
        }

        public ApplicationDetailsResponseModel GetApplicationDetails(string applicationId)
        {
            var response = new ApplicationDetailsResponseModel();
            try
            {
                var inputApplicationId = Convert.ToInt32(applicationId);
                var status = (from st in _statusRepository.Table select st).ToList();

                ApplicationDetailsModel applicationDetailsModel = new ApplicationDetailsModel();
                var existingApplication = _applicationsRepository.Table.Where(a => a.Id == inputApplicationId).FirstOrDefault();
                if (existingApplication != null)
                {
                    applicationDetailsModel.Id = existingApplication.Id;
                    applicationDetailsModel.ApplicationNumber = existingApplication.ApplicationNumber;
                    applicationDetailsModel.AveAnnualSales = existingApplication.AveAnnualSales;
                    applicationDetailsModel.BusinessActivity = existingApplication.BusinessActivity;
                    applicationDetailsModel.CreatedDate = existingApplication.CreateDate;
                    applicationDetailsModel.FinanceDuration = existingApplication.FinanceDuration;
                    applicationDetailsModel.FinanceFrequency = existingApplication.FinanceFrequency;
                    applicationDetailsModel.FinanceFunder = existingApplication.FinanceFunder;
                    if (!string.IsNullOrEmpty(existingApplication.FinanceFunder))
                    {
                        int tempFunderId;
                        int.TryParse(existingApplication.FinanceFunder, out tempFunderId);

                        var funderRecord = _fundersRepository.GetById(Convert.ToInt32(tempFunderId));
                        if (funderRecord != null)
                        {
                            applicationDetailsModel.FinanceFunderName = funderRecord.FunderName;
                            applicationDetailsModel.FinanceFunderEmail = funderRecord.ContactEmailAdd;
                        }
                    }

                    applicationDetailsModel.FinanceLink = existingApplication.FinanceLink;
                    applicationDetailsModel.FinanceTotal = existingApplication.FinanceTotal;
                    applicationDetailsModel.FinanceType = existingApplication.FinanceType;
                    applicationDetailsModel.FinanceValue = existingApplication.FinanceValue;
                    if (existingApplication.FunderPlan.HasValue)
                        applicationDetailsModel.FunderPlan = existingApplication.FunderPlan.Value;

                    applicationDetailsModel.GoodsDescription = existingApplication.GoodsDescription;
                    applicationDetailsModel.GuarantorSecurityOwing = existingApplication.GuarantorSecurityOwing;
                    applicationDetailsModel.GuarantorSecurityValue = existingApplication.GuarantorSecurityValue;
                    applicationDetailsModel.IMFSContactEmail = existingApplication.IMFSContactEmail;
                    applicationDetailsModel.IMFSContactName = existingApplication.IMFSContactName;
                    applicationDetailsModel.IMFSContactPhone = existingApplication.IMFSContactPhone;
                    applicationDetailsModel.IsApplicationSigned = existingApplication.IsApplicationSigned;
                    applicationDetailsModel.IsGuarantorPropertyOwner = existingApplication.IsGuarantorPropertyOwner;
                    applicationDetailsModel.IsGuarantorSecurity = existingApplication.IsGuarantorSecurity;
                    applicationDetailsModel.QuoteID = existingApplication.QuoteId;
                    applicationDetailsModel.QuoteTotal = existingApplication.QuoteTotal;
                    if (existingApplication.ApplicationStatus.HasValue)
                    {
                        applicationDetailsModel.Status = existingApplication.ApplicationStatus.Value;
                        applicationDetailsModel.StatusDescription = status.Where(st => st.Id == existingApplication.ApplicationStatus.Value).FirstOrDefault().Description;
                    }

                    //Reseller Details
                    applicationDetailsModel.ResellerDetails.ResellerContactEmail = existingApplication.ResellerContactEmail;
                    applicationDetailsModel.ResellerDetails.ResellerContactName = existingApplication.ResellerContactName;
                    applicationDetailsModel.ResellerDetails.ResellerContactPhone = existingApplication.ResellerContactPhone;
                    applicationDetailsModel.ResellerDetails.ResellerID = existingApplication.ResellerID;
                    applicationDetailsModel.ResellerDetails.ResellerName = existingApplication.ResellerName;
                    applicationDetailsModel.ResellerDetails.ResellerContactEmail = existingApplication.ResellerContactEmail;

                    //Entity Details
                    applicationDetailsModel.EntityDetails.EntityTrustABN = existingApplication.EntityTrustABN;
                    applicationDetailsModel.EntityDetails.EntityTrustName = existingApplication.EntityTrustName;
                    applicationDetailsModel.EntityDetails.EntityTrustOther = existingApplication.EntityTrustOther;
                    applicationDetailsModel.EntityDetails.EntityTrustType = existingApplication.EntityTrustType;
                    applicationDetailsModel.EntityDetails.EntityType = existingApplication.EntityType;
                    applicationDetailsModel.EntityDetails.EntityTypeOther = existingApplication.EntityTypeOther;

                    //End Customer Details
                    applicationDetailsModel.EndCustomerDetails.EndCustomerABN = existingApplication.EndCustomerABN;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerContactEmail = existingApplication.EndCustomerContactEmail;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerContactName = existingApplication.EndCustomerContactName;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerContactPhone = existingApplication.EndCustomerContactPhone;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryAddressLine1 = existingApplication.EndCustomerDeliveryAddressLine1;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryAddressLine2 = existingApplication.EndCustomerDeliveryAddressLine2;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryCity = existingApplication.EndCustomerDeliveryCity;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryCountry = existingApplication.EndCustomerDeliveryCountry;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryPostcode = existingApplication.EndCustomerDeliveryPostcode;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryState = existingApplication.EndCustomerDeliveryState;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerFax = existingApplication.EndCustomerFax;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerName = existingApplication.EndCustomerName;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPhone = existingApplication.EndCustomerPhone;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPostalAddressLine1 = existingApplication.EndCustomerPostalAddressLine1;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPostalAddressLine2 = existingApplication.EndCustomerPostalAddressLine2;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPostalCity = existingApplication.EndCustomerPostalCity;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPostalCountry = existingApplication.EndCustomerPostalCountry;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPostalPostcode = existingApplication.EndCustomerPostalPostcode;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPostalState = existingApplication.EndCustomerPostalState;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryAddressLine1 = existingApplication.EndCustomerPrimaryAddressLine1;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryAddressLine2 = existingApplication.EndCustomerPrimaryAddressLine2;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryCity = existingApplication.EndCustomerPrimaryCity;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryCountry = existingApplication.EndCustomerPrimaryCountry;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryPostcode = existingApplication.EndCustomerPrimaryPostcode;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryState = existingApplication.EndCustomerPrimaryState;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerSignatoryName = existingApplication.EndCustomerSignatoryName;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerSignatoryPosition = existingApplication.EndCustomerSignatoryPosition;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerTradingAs = existingApplication.EndCustomerTradingAs;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerType = existingApplication.EndCustomerType;
                    applicationDetailsModel.EndCustomerDetails.EndCustomerYearsTrading = existingApplication.EndCustomerYearsTrading;

                    //Get Application Contacts
                    var applicationContacts = GetApplicationContacts(existingApplication.ApplicationNumber);

                    if (applicationContacts.Count > 0)
                        applicationDetailsModel.ApplicationContacts = applicationContacts;

                    response.ApplicationDetails = applicationDetailsModel;
                }
            }
            catch (Exception ex)
            {
                response.HasError = true;
                response.ErrorMessage = ex.Message;
            }
            return response;
        }

        private List<ApplicationContact> GetApplicationContacts(int applicationId)
        {
            var applicationContacts = new List<ApplicationContact>();
            try
            {
                var contactsXref = _contactsXrefRepository.Table.Where(c => c.ApplicationNumber == applicationId).ToList();
                foreach (var xref in contactsXref)
                {
                    var contact = _contactsRepository.Table.Where(c => c.ContactID == xref.ContactID).FirstOrDefault();
                    if (contact != null)
                    {
                        var applicationContact = new ApplicationContact();
                        applicationContact.ContactType = contact.ContactType;
                        if (contact.ContactType > 0)
                        {
                            var contactType = _contactTypesRepository.GetById(contact.ContactType);
                            if (contactType != null)
                                applicationContact.ContactDescription = contactType.ContactDescription;
                        }
                        applicationContact.ContactID = contact.ContactID;
                        applicationContact.ContactEmail = contact.ContactEmail;
                        applicationContact.ResellerID = contact.ResellerID;
                        applicationContact.ContactName = contact.ContactName;

                        applicationContact.ContactDOB = contact.ContactDOB;
                        applicationContact.ContactAddress = contact.ContactAddress;
                        applicationContact.ContactDriversLicNo = contact.ContactDriversLicNo;
                        applicationContact.ContactABNACN = contact.ContactABNACN;
                        applicationContact.ContactPosition = contact.ContactPosition;
                        applicationContact.IsContactSignatory = contact.IsContactSignatory;
                        applicationContact.ContactPhone = contact.ContactPhone;

                        //Add to the list
                        applicationContacts.Add(applicationContact);

                    }
                }

            }
            catch (Exception ex)
            {

            }
            return applicationContacts;
        }

        public ApplicationSearchResponseModel LookupApplicationNumber(ApplicationSearchModel appSearchModel, string resellerId)
        {
            var response = new ApplicationSearchResponseModel();
            try
            {
                var query = from apps in _applicationsRepository.Table select apps;
                if (appSearchModel.FromDate != null && appSearchModel.ToDate != null)
                {
                    var fromDate = appSearchModel.FromDate.Value.ToLocalTime();
                    var toDate = appSearchModel.ToDate.Value.ToLocalTime();

                    query = query.Where(q => q.CreateDate >= fromDate && q.CreateDate <= toDate);
                }

                var financeTypes = appSearchModel.FinanceType;

                if (financeTypes != null && financeTypes.Length > 0)
                {
                    query = query.Where(q => financeTypes.Contains(q.FinanceType));
                }

                if (appSearchModel.Status != null)
                {
                    query = query.Where(q => q.ApplicationStatus == appSearchModel.Status);
                }

                if (!string.IsNullOrEmpty(appSearchModel.EndCustomerName))
                {
                    query = query.Where(q => q.EndCustomerName.Contains(appSearchModel.EndCustomerName));
                }

                //Search Application Number with contains               
                if (appSearchModel.ApplicationNumber != null)
                {
                    string filter = Convert.ToString(appSearchModel.ApplicationNumber);
                    //if (appSearchModel.TriggerSource == "lookup")
                    query = query.Where(q => q.ApplicationNumber.ToString().Contains(filter));
                    //else
                    //    query = query.Where(q => q.ApplicationNumber == appSearchModel.ApplicationNumber);
                }

                if (!string.IsNullOrEmpty(resellerId))
                {
                    query = query.Where(q => q.ResellerID == resellerId);
                }

                //Status
                var status = (from st in _statusRepository.Table select st).ToList();
                var financeTypesList = (from fin in _financeTypesRepository.Table select fin).ToList();

                var results = query.Select(q => new ApplicationSearchResponse
                {
                    Id = q.Id,
                    ApplicationNumber = q.ApplicationNumber,
                    EndCustomerName = q.EndCustomerName,
                    FinanceType = (!string.IsNullOrEmpty(q.FinanceType)) ? q.FinanceType : string.Empty,
                    ResellerId = q.ResellerID,
                    ResellerName = q.ResellerName,
                    Status = q.ApplicationStatus,
                    QuoteTotal = q.QuoteTotal,
                    CreatedDate = q.CreateDate
                }).ToList();

                foreach (var result in results)
                {
                    result.StatusDescr = status.Where(st => st.Id == result.Status).FirstOrDefault().Description;
                    var finType = financeTypesList.Where(st => Convert.ToString(st.QuoteDurationType) == result.FinanceType).FirstOrDefault();
                    if (finType != null)
                        result.FinanceTypeName = finType.Description;

                }

                //Set the response
                response.SearchResult = results;
            }
            catch (Exception ex)
            {
                response.HasError = true;
                response.ErrorMessage = ex.Message;
            }

            return response;
        }

        public ApplicationSearchResponseModel SearchApplication(ApplicationSearchModel appSearchModel, string resellerId)
        {
            var response = new ApplicationSearchResponseModel();
            try
            {
                var query = from apps in _applicationsRepository.Table select apps;

                if (appSearchModel.FromDate != null && appSearchModel.ToDate != null)
                {
                    var fromDate = appSearchModel.FromDate.Value.ToLocalTime();
                    var toDate = appSearchModel.ToDate.Value.ToLocalTime();

                    query = query.Where(q => q.CreateDate >= fromDate && q.CreateDate <= toDate);
                }

                var financeTypes = appSearchModel.FinanceType;

                if (financeTypes != null && financeTypes.Length > 0)
                {
                    query = query.Where(q => financeTypes.Contains(q.FinanceType));
                }

                if (appSearchModel.Status != null)
                {
                    query = query.Where(q => q.ApplicationStatus == appSearchModel.Status);
                }

                if (!string.IsNullOrEmpty(appSearchModel.EndCustomerName))
                {
                    query = query.Where(q => q.EndCustomerName.Contains(appSearchModel.EndCustomerName));
                }

                if (appSearchModel.ApplicationNumber != null)
                {
                    query = query.Where(q => q.ApplicationNumber == appSearchModel.ApplicationNumber);
                }

                if (!string.IsNullOrEmpty(resellerId))
                {
                    query = query.Where(q => q.ResellerID == resellerId);
                }


                //Status
                var status = (from st in _statusRepository.Table select st).ToList();
                var financeTypesList = (from fin in _financeTypesRepository.Table select fin).ToList();

                var results = query.Select(q => new ApplicationSearchResponse
                {
                    Id = q.Id,
                    ApplicationNumber = q.ApplicationNumber,
                    EndCustomerName = q.EndCustomerName,
                    FinanceType = (!string.IsNullOrEmpty(q.FinanceType)) ? q.FinanceType : string.Empty,
                    ResellerId = q.ResellerID,
                    ResellerName = q.ResellerName,
                    Status = q.ApplicationStatus,
                    QuoteTotal = q.QuoteTotal,
                    CreatedDate = q.CreateDate
                }).ToList();

                foreach (var result in results)
                {
                    result.StatusDescr = status.Where(st => st.Id == result.Status).FirstOrDefault().Description;
                    var finType = financeTypesList.Where(st => Convert.ToString(st.QuoteDurationType) == result.FinanceType).FirstOrDefault();
                    if (finType != null)
                        result.FinanceTypeName = finType.Description;
                }

                //Set the response
                response.SearchResult = results;
            }
            catch (Exception ex)
            {
                response.HasError = true;
                response.ErrorMessage = ex.Message;
            }

            return response;
        }

        public ApplicationSaveResponseModel SaveApplication(ApplicationDetailsModel applicationDetailsModel, string userId)
        {
            var response = new ApplicationSaveResponseModel();
            try
            {

                var existingApplication = _applicationsRepository.Table.Where(a => a.Id == applicationDetailsModel.Id).FirstOrDefault();

                if (existingApplication != null)
                {
                    if (existingApplication.ApplicationStatus != applicationDetailsModel.Status)
                    {

                        existingApplication.ApplicationStatus = applicationDetailsModel.Status;

                        //if approved
                        if (applicationDetailsModel.Status == Configuration.GetValue<int>("ApplicationApprovedId"))
                        {
                            existingApplication.ApprovedBy = userId;
                            existingApplication.ApprovedDate = System.DateTime.Now.ToLocalTime();
                        }

                        //if rejected
                        if (applicationDetailsModel.Status == Configuration.GetValue<int>("ApplicationRejectedId"))
                        {
                            existingApplication.RejectedBy = userId;
                            existingApplication.RejectedDate = System.DateTime.Now.ToLocalTime();
                        }
                    }
                    //Entity Type Details 
                    existingApplication.EntityType = applicationDetailsModel.EntityDetails.EntityType;
                    existingApplication.EntityTypeOther = applicationDetailsModel.EntityDetails.EntityTypeOther;

                    existingApplication.EntityTrustType = applicationDetailsModel.EntityDetails.EntityTrustType;
                    existingApplication.EntityTrustOther = applicationDetailsModel.EntityDetails.EntityTrustOther;

                    existingApplication.EntityTrustName = applicationDetailsModel.EntityDetails.EntityTrustName;
                    existingApplication.EntityTrustABN = applicationDetailsModel.EntityDetails.EntityTrustABN;

                    existingApplication.EndCustomerName = applicationDetailsModel.EndCustomerDetails.EndCustomerName;
                    existingApplication.EndCustomerABN = applicationDetailsModel.EndCustomerDetails.EndCustomerABN;
                    existingApplication.EndCustomerTradingAs = applicationDetailsModel.EndCustomerDetails.EndCustomerTradingAs;
                    existingApplication.EndCustomerYearsTrading = applicationDetailsModel.EndCustomerDetails.EndCustomerYearsTrading;
                    existingApplication.EndCustomerPhone = applicationDetailsModel.EndCustomerDetails.EndCustomerPhone;
                    existingApplication.EndCustomerFax = applicationDetailsModel.EndCustomerDetails.EndCustomerFax;
                    existingApplication.BusinessActivity = applicationDetailsModel.BusinessActivity;
                    existingApplication.AveAnnualSales = applicationDetailsModel.AveAnnualSales;

                    existingApplication.EndCustomerContactName = applicationDetailsModel.EndCustomerDetails.EndCustomerContactName;
                    existingApplication.EndCustomerContactPhone = applicationDetailsModel.EndCustomerDetails.EndCustomerContactPhone;
                    existingApplication.EndCustomerContactEmail = applicationDetailsModel.EndCustomerDetails.EndCustomerContactEmail;


                    //Business Address
                    existingApplication.EndCustomerPrimaryAddressLine1 = applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryAddressLine1;
                    existingApplication.EndCustomerPrimaryAddressLine2 = applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryAddressLine2;
                    existingApplication.EndCustomerPrimaryCity = applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryCity;
                    existingApplication.EndCustomerPrimaryState = applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryState;
                    existingApplication.EndCustomerPrimaryPostcode = applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryPostcode;
                    existingApplication.EndCustomerPrimaryCountry = applicationDetailsModel.EndCustomerDetails.EndCustomerPrimaryCity;

                    //Postal Address     
                    existingApplication.EndCustomerPostalAddressLine1 = applicationDetailsModel.EndCustomerDetails.EndCustomerPostalAddressLine1;
                    existingApplication.EndCustomerPostalAddressLine2 = applicationDetailsModel.EndCustomerDetails.EndCustomerPostalAddressLine2;
                    existingApplication.EndCustomerPostalCity = applicationDetailsModel.EndCustomerDetails.EndCustomerPostalCity;
                    existingApplication.EndCustomerPostalState = applicationDetailsModel.EndCustomerDetails.EndCustomerPostalState;
                    existingApplication.EndCustomerPostalPostcode = applicationDetailsModel.EndCustomerDetails.EndCustomerPostalPostcode;
                    existingApplication.EndCustomerPostalCountry = applicationDetailsModel.EndCustomerDetails.EndCustomerPostalCountry;

                    //Delivery Address
                    existingApplication.EndCustomerDeliveryAddressLine1 = applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryAddressLine1;
                    existingApplication.EndCustomerDeliveryAddressLine2 = applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryAddressLine2;
                    existingApplication.EndCustomerDeliveryCity = applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryCity;
                    existingApplication.EndCustomerDeliveryState = applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryState;
                    existingApplication.EndCustomerDeliveryPostcode = applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryPostcode;
                    existingApplication.EndCustomerDeliveryCountry = applicationDetailsModel.EndCustomerDetails.EndCustomerDeliveryCountry;

                    //update in DB
                    _applicationsRepository.Update(existingApplication);

                    response.ApplicationId = existingApplication.Id;
                    response.ApplicationNumber = existingApplication.ApplicationNumber;

                }

                if (applicationDetailsModel.ApplicationContacts != null && applicationDetailsModel.ApplicationContacts.Count > 0)
                {
                    //Get all ContactsXref
                    var contactsXRef = _contactsXrefRepository.Table.Where(xref => xref.ApplicationNumber == applicationDetailsModel.ApplicationNumber).ToList();

                    foreach (var applicationContact in applicationDetailsModel.ApplicationContacts)
                    {
                        if (applicationContact.ContactID != null)
                        {
                            var contactFound = false;
                            if (contactsXRef != null)
                            {
                                foreach (var xref in contactsXRef)
                                {
                                    if (xref.ContactID == applicationContact.ContactID)
                                    {
                                        contactFound = true;
                                    }
                                }

                                if (!contactFound)
                                {
                                    //Add it to the Xref
                                    var contactXRef = new ContactsXref();
                                    contactXRef.ContactID = applicationContact.ContactID;
                                    contactXRef.ApplicationNumber = applicationDetailsModel.ApplicationNumber;
                                    _contactsXrefRepository.Insert(contactXRef);
                                }
                            }
                        }
                        else
                        {
                            //Create contact and add it to contactsXref
                            var contact = new Contacts();
                            contact.ContactID = Guid.NewGuid().ToString();
                            contact.ContactName = applicationContact.ContactName;
                            contact.ContactAddress = applicationContact.ContactAddress;
                            contact.ContactEmail = applicationContact.ContactEmail;

                            if (applicationContact.ContactDOB != null)
                            {
                                contact.ContactDOB = Convert.ToDateTime(applicationContact.ContactDOB).ToLocalTime().Date;
                            }

                            contact.ContactDriversLicNo = applicationContact.ContactDriversLicNo;
                            contact.ContactPhone = applicationContact.ContactPhone;
                            contact.ContactType = applicationContact.ContactType;
                            if (!string.IsNullOrEmpty(applicationContact.ContactABNACN))
                            {
                                contact.ContactABNACN = applicationContact.ContactABNACN;
                            }
                            contact.IsContactSignatory = applicationContact.IsContactSignatory;

                            //Add Contact
                            _contactsRepository.Insert(contact);

                            //Add it to the Xref
                            var contactXRef = new ContactsXref();
                            contactXRef.ContactID = contact.ContactID;
                            contactXRef.ApplicationNumber = applicationDetailsModel.ApplicationNumber;
                            _contactsXrefRepository.Insert(contactXRef);

                        }
                    }

                }

            }
            catch (Exception ex)
            {
                response.HasError = true;
                response.ErrorMessage = ex.Message;
            }

            return response;
        }

        public List<Web.Models.DBModel.Contacts> GetContacts(string resellerID)
        {
            return _contactsRepository.Table.Where(c => c.ResellerID == resellerID).ToList();
        }

        /// <summary>
        /// Guarantor Contacts are filtered for Contact Types 1,2,3 and 4
        /// </summary>
        /// <param name="resellerID"></param>
        /// <returns></returns>
        public List<Web.Models.DBModel.Contacts> GetGuarantorContacts(string resellerID)
        {
            return _contactsRepository.Table.Where(c => (c.ContactType == 1 || c.ContactType == 2 || c.ContactType == 3 || c.ContactType == 4) && c.ResellerID == resellerID).ToList();
        }

        /// <summary>
        /// Accountant Contacts are filtered for Contact Type 6
        /// </summary>
        /// <param name="resellerID"></param>
        /// <returns></returns>
        public List<Web.Models.DBModel.Contacts> GetAccountantContacts(string resellerID)
        {
            return _contactsRepository.Table.Where(c => c.ContactType == 6 && c.ResellerID == resellerID).ToList();
        }

        /// <summary>
        /// Trustee Contacts are filtered for Contact Type 6
        /// </summary>
        /// <param name="resellerID"></param>
        /// <returns></returns>
        public List<Web.Models.DBModel.Contacts> GetTrusteeContacts(string resellerID)
        {
            return _contactsRepository.Table.Where(c => c.ContactType == 5 && c.ResellerID == resellerID).ToList();
        }

        public List<Web.Models.DBModel.Contacts> GetBeneficialOwnersContacts(string resellerID)
        {
            return _contactsRepository.Table.Where(c => c.ContactType == 7 && c.ResellerID == resellerID).ToList();
        }

        public ApplicationDownloadResponse DownloadApplication(ApplicationDownloadInput inputModel)
        {
            var response = new ApplicationDownloadResponse();
            try
            {
                var applicationDetailsResponse = GetApplicationDetails(inputModel.Id.ToString());
                if (applicationDetailsResponse.HasError)
                {
                    response.HasError = true;
                    response.ErrorMessage = applicationDetailsResponse.ErrorMessage;
                    return response;
                }

                var path = GenerateApplicationPdf(applicationDetailsResponse.ApplicationDetails);
                if (path != null)
                {

                    response.FileName = path.Substring(path.LastIndexOf("\\") + 1);
                    if (response.FileName.Length > 200)
                    {
                        response.FileName = response.FileName.Substring(0, 200);
                    }
                    response.DownloadFile = System.IO.File.ReadAllBytes(path);
                }
            }
            catch (Exception ex)
            {
                response.HasError = true;
                response.ErrorMessage = ex.ToString();
            }
            return response;
        }

        private string GenerateApplicationPdf(ApplicationDetailsModel applicationDetails)
        {
            string outputFile = string.Empty;
            try
            {
                string pdfTemplate = Configuration.GetValue<string>("ApplicationPdfTemplate");
                string physicalPath = Configuration.GetValue<string>("EmailAttachmentTempRootDirectory") + "\\" + "LoggedInUser";
                // create own folder for each user id if it does not exist
                Tools.CreateFolder(Configuration.GetValue<string>("EmailAttachmentTempRootDirectory"), "LoggedInUser");
                string fileName = "IMFS Equipment Finance Application - " + System.DateTime.Now.ToLocalTime().ToString("ddMMyyyyHHmmss") + " - " + applicationDetails.ApplicationNumber + ".pdf";
                outputFile = physicalPath + "\\" + fileName;
                using (Stream pdfInputStream = new FileStream(path: pdfTemplate, mode: FileMode.Open))
                using (Stream resultPDFOutputStream = new FileStream(path: outputFile, mode: FileMode.Create))
                using (Stream resultPDFStream = FillPdfForm(pdfInputStream, applicationDetails))
                {
                    // set the position of the stream to 0 to avoid corrupted PDF. 
                    resultPDFStream.Position = 0;
                    resultPDFStream.CopyTo(resultPDFOutputStream);
                }

            }
            catch (Exception ex)
            {
                return null;
            }
            return outputFile;
        }


        private Stream FillPdfForm(Stream inputStream, ApplicationDetailsModel model)
        {
            Stream outStream = new MemoryStream();
            PdfReader pdfReader = null;
            PdfStamper pdfStamper = null;
            Stream inStream = null;
            try
            {
                pdfReader = new PdfReader(inputStream);
                pdfStamper = new PdfStamper(pdfReader, outStream);
                AcroFields form = pdfStamper.AcroFields;

                //Entity Type field
                if (model.EntityDetails.EntityType == "1")
                    form.SetField("EntityTypePick", "Company");
                if (model.EntityDetails.EntityType == "2")
                    form.SetField("EntityTypePick", "Partnership");
                if (model.EntityDetails.EntityType == "3")
                    form.SetField("EntityTypePick", "Trust");
                if (model.EntityDetails.EntityType == "4")
                    form.SetField("EntityTypePick", "Sole Trader");
                if (model.EntityDetails.EntityType == "5")
                    form.SetField("EntityTypePick", "Other");

                form.SetField("Entity_Other", model.EntityDetails.EntityTypeOther);

                form.SetField("Customer", model.EndCustomerDetails.EndCustomerName);
                form.SetField("ACNABN", model.EndCustomerDetails.EndCustomerABN);
                form.SetField("If trust name of trust", model.EntityDetails.EntityTrustName);
                form.SetField("Trust ABN", model.EntityDetails.EntityTrustABN);

                form.SetField("TrustTypePick", model.EntityDetails.EntityTrustType);
                form.SetField("TrustType_other", model.EntityDetails.EntityTrustOther);
                form.SetField("Trading name", model.EndCustomerDetails.EndCustomerTradingAs);

                form.SetField("Phone", model.EndCustomerDetails.EndCustomerPhone);
                form.SetField("Fax", model.EndCustomerDetails.EndCustomerFax);

                form.SetField("Finance quote number", Convert.ToString(model.QuoteID));
                form.SetField("Finance quote value", model.QuoteTotal.Value.ToString("0.00"));
                form.SetField("Equipment description", model.GoodsDescription);

                if (model.AveAnnualSales.HasValue)
                    form.SetField("Average annual sales", model.AveAnnualSales.Value.ToString("0.00"));

                if (model.IsGuarantorPropertyOwner == true)
                    form.SetField("GuarantorPropertyPick", "Yes");
                else if (model.IsGuarantorPropertyOwner == false)
                    form.SetField("GuarantorPropertyPick", "No");
                else
                    form.SetField("GuarantorPropertyPick", "--- Select ---");

                if (model.GuarantorSecurityValue.HasValue)
                    form.SetField("Guarantor_property_Value", model.GuarantorSecurityValue.Value.ToString("0.00"));

                if (model.GuarantorSecurityOwing.HasValue)
                    form.SetField("Guarantor_property_Owing", model.GuarantorSecurityOwing.Value.ToString("0.00"));


                form.SetField("Years in principal business activity", model.EndCustomerDetails.EndCustomerYearsTrading);
                form.SetField("Principal business activity", model.BusinessActivity);


                if (model.FinanceType == "1")
                    form.SetField("FinanceTypePicker", "Lease");
                if (model.FinanceType == "2")
                    form.SetField("FinanceTypePicker", "Rental");
                if (model.FinanceType == "4")
                    form.SetField("FinanceTypePicker", "Instalment");

                form.SetField("Finance Term", model.FinanceDuration);

                if (model.FinanceFrequency == "Monthly")
                    form.SetField("PaymentFrequencyPicker", "Monthly");
                if (model.FinanceFrequency == "Quarterly")
                    form.SetField("PaymentFrequencyPicker", "Quarterly");
                if (model.FinanceFrequency == "Yearly")
                    form.SetField("PaymentFrequencyPicker", "Yearly");

                if (model.FinanceValue.HasValue)
                    form.SetField("Finance quote payment", model.FinanceValue.Value.ToString("0.00"));

                //Business Address                
                form.SetField("BusinessAddressLine1", model.EndCustomerDetails.EndCustomerPrimaryAddressLine1);
                form.SetField("BusinessAddressLine2", model.EndCustomerDetails.EndCustomerPrimaryAddressLine2);
                form.SetField("BusinessAddressCity", model.EndCustomerDetails.EndCustomerPrimaryCity);
                form.SetField("BusinessAddressState", model.EndCustomerDetails.EndCustomerPrimaryState);
                form.SetField("BusinessAddressPostcode", model.EndCustomerDetails.EndCustomerPrimaryPostcode);
                form.SetField("BusinessAddressCountry", model.EndCustomerDetails.EndCustomerPrimaryCountry);

                //Postal Address                
                form.SetField("PostalAddressLine1", model.EndCustomerDetails.EndCustomerPostalAddressLine1);
                form.SetField("PostalAddressLine2", model.EndCustomerDetails.EndCustomerPostalAddressLine2);
                form.SetField("PostalAddressCity", model.EndCustomerDetails.EndCustomerPostalCity);
                form.SetField("PostalAddressState", model.EndCustomerDetails.EndCustomerPostalState);
                form.SetField("PostalAddressPostCode", model.EndCustomerDetails.EndCustomerPostalPostcode);
                form.SetField("PostalAddressCountry", model.EndCustomerDetails.EndCustomerPostalCountry);

                //Delivery Address
                form.SetField("DeliveryAddressLine1", model.EndCustomerDetails.EndCustomerDeliveryAddressLine1);
                form.SetField("DeliveryAddressLine2", model.EndCustomerDetails.EndCustomerDeliveryAddressLine2);
                form.SetField("DeliveryAddressCity", model.EndCustomerDetails.EndCustomerDeliveryCity);
                form.SetField("DeliveryAddressState", model.EndCustomerDetails.EndCustomerDeliveryState);
                form.SetField("DeliveryAddressPostCode", model.EndCustomerDetails.EndCustomerDeliveryPostcode);
                form.SetField("DeliveryAddressCountry", model.EndCustomerDetails.EndCustomerDeliveryCountry);

                form.SetField("Contact name", model.EndCustomerDetails.EndCustomerContactName);
                form.SetField("Mobile", model.EndCustomerDetails.EndCustomerContactPhone);
                form.SetField("Email", model.EndCustomerDetails.EndCustomerContactEmail);

                form.SetField("Full name", model.EndCustomerDetails.EndCustomerSignatoryName);
                form.SetField("Sales representative", model.ResellerDetails.ResellerContactName);
                form.SetField("Dealername", model.ResellerDetails.ResellerName);

                //Guarantors Contacts
                int guarantorCounter = 1;
                foreach (var guarantorContact in model.ApplicationContacts.Where(c => c.ContactType == 1 || c.ContactType == 2 || c.ContactType == 3 || c.ContactType == 4).ToList())
                {
                    //ContactType	ContactDescription
                    //    1             Director
                    //    2             Sole Trader
                    //    3             Partner
                    //    4             Guarantor

                    form.SetField("ContactName" + guarantorCounter, guarantorContact.ContactName);
                    if (guarantorContact.ContactType == 1)
                        form.SetField("ContactPicker" + guarantorCounter, "Director");
                    else if (guarantorContact.ContactType == 2)
                        form.SetField("ContactPicker" + guarantorCounter, "Sole Trader");
                    else if (guarantorContact.ContactType == 3)
                        form.SetField("ContactPicker" + guarantorCounter, "Partner");
                    else if (guarantorContact.ContactType == 4)
                        form.SetField("ContactPicker" + guarantorCounter, "Guarantor");

                    form.SetField("ContactResidentialAddress" + guarantorCounter, guarantorContact.ContactAddress);
                    form.SetField("ContactEmail" + guarantorCounter, guarantorContact.ContactEmail);
                    form.SetField("ContactDOB" + guarantorCounter, guarantorContact.ContactDOB != null ? guarantorContact.ContactDOB.Value.ToString("dd/MM/yyyy") : string.Empty);
                    form.SetField("ContactDrivers" + guarantorCounter, guarantorContact.ContactDriversLicNo);
                    form.SetField("ContactPhone" + guarantorCounter, guarantorContact.ContactPhone);

                    //Increment counter
                    guarantorCounter++;
                    if (guarantorCounter > 3)
                        continue;
                }


                //Trustee Contacts (5)
                int trusteeCounter = 1;
                foreach (var trusteeContact in model.ApplicationContacts.Where(c => c.ContactType == 5).ToList())
                {
                    form.SetField("TrusteeName" + trusteeCounter, trusteeContact.ContactName);
                    form.SetField("TrusteeABN" + trusteeCounter, trusteeContact.ContactABNACN);
                    form.SetField("TrusteeResidentialAddress" + trusteeCounter, trusteeContact.ContactAddress);
                    form.SetField("TrusteeEmail" + trusteeCounter, trusteeContact.ContactEmail);
                    form.SetField("TrusteeDOB" + trusteeCounter, trusteeContact.ContactDOB != null ? trusteeContact.ContactDOB.Value.ToString("dd/MM/yyyy") : string.Empty);
                    form.SetField("TrusteeDrivers" + trusteeCounter, trusteeContact.ContactDriversLicNo);
                    form.SetField("TrusteePhone" + trusteeCounter, trusteeContact.ContactPhone);

                    //Increment counter
                    trusteeCounter++;
                    if (trusteeCounter > 3)
                        continue;
                }


                //Accountant Contact   (6)             
                foreach (var accountantContact in model.ApplicationContacts.Where(c => c.ContactType == 6).ToList())
                {
                    form.SetField("Account_name", accountantContact.ContactName);
                    form.SetField("AccountPhone_number", accountantContact.ContactPhone);
                    form.SetField("AccountEmail", accountantContact.ContactEmail);
                }


                //Beneficial Owners Contacts (7)
                int beneficialCounter = 1;
                foreach (var ownerContact in model.ApplicationContacts.Where(c => c.ContactType == 7).ToList())
                {
                    form.SetField("OwnerName" + beneficialCounter, ownerContact.ContactName);
                    form.SetField("OwnersResidentialAddress" + beneficialCounter, ownerContact.ContactAddress);
                    form.SetField("OwnerEmail" + beneficialCounter, ownerContact.ContactEmail);
                    form.SetField("OwnersDOB" + beneficialCounter, ownerContact.ContactDOB != null ? ownerContact.ContactDOB.Value.ToString("dd/MM/yyyy") : string.Empty);
                    form.SetField("OwnerDrivers" + beneficialCounter, ownerContact.ContactDriversLicNo);
                    form.SetField("OwnerPhone" + beneficialCounter, ownerContact.ContactPhone);

                    //Increment counter
                    beneficialCounter++;
                    if (beneficialCounter > 3)
                        continue;
                }

                // set this if you want the result PDF to not be editable. 
                //pdfStamper.FormFlattening = true;
                pdfStamper.FormFlattening = false;
                return outStream;
            }
            finally
            {
                pdfStamper?.Close();
                pdfReader?.Close();
                inStream?.Close();
            }
        }

        public ApplicationUpdateResponseModel RejectApplication(int applicationId)
        {
            var response = new ApplicationUpdateResponseModel();
            try
            {
                var application = _applicationsRepository.Table.Where(a => a.Id == applicationId).FirstOrDefault();
                if (application != null)
                {
                    application.ApplicationStatus = Configuration.GetValue<int>("ApplicationRejectedId");
                    _applicationsRepository.Update(application);
                    response.ApplicationNumber = applicationId;
                }
            }
            catch (Exception ex)
            {
                response.HasError = true;
                response.ErrorMessage = ex.Message;
            }
            return response;
        }

        public ApplicationUpdateResponseModel CancelApplication(int applicationId)
        {
            var response = new ApplicationUpdateResponseModel();
            try
            {
                var application = _applicationsRepository.Table.Where(a => a.Id == applicationId).FirstOrDefault();
                if (application != null)
                {
                    application.ApplicationStatus = Configuration.GetValue<int>("ApplicationCancelledId");
                    _applicationsRepository.Update(application);
                    response.ApplicationNumber = applicationId;
                }
            }
            catch (Exception ex)
            {
                response.HasError = true;
                response.ErrorMessage = ex.Message;
            }
            return response;
        }

        public List<RecentApplicationsModel> GetRecentApplications(string resellerId)
        {
            var response = new List<RecentApplicationsModel>();
            try
            {

                return (from application in _applicationsRepository.Table
                        join status in _statusRepository.Table on application.ApplicationStatus equals status.Id
                        join financeType in _financeTypesRepository.Table on application.FinanceType equals financeType.Id.ToString()
                        join quote in _quotesRepository.Table on application.QuoteId equals quote.Id
                        where application.ResellerID == resellerId
                        select new RecentApplicationsModel
                        {
                            Id = application.Id,
                            ApplicationNumber = application.ApplicationNumber,
                            endUser = application.EndCustomerName != null || application.EndCustomerName != "" ? application.EndCustomerName : "N/A",
                            Status = status.Description != null || status.Description != "" ? status.Description : "N/A",
                            FinanaceAmount = application.FinanceTotal.HasValue ? application.FinanceTotal : 0,
                            FinanceType = financeType.Description != "" ? financeType.Description : "N/A",
                            CreatedDate = application.CreateDate,
                        }).OrderByDescending(x => x.CreatedDate).Take(10).ToList();
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public List<AwaitingInvoiceModel> GetAwaitingInvoices(string resellerId)
        {
            var response = new List<AwaitingInvoiceModel>();
            try
            {
                List<int> statusIDs = new List<int>() { 8, 12 };
                return (from application in _applicationsRepository.Table
                        join status in _statusRepository.Table on application.ApplicationStatus equals status.Id
                        join financeType in _financeTypesRepository.Table on application.FinanceType equals financeType.Id.ToString()
                        join quote in _quotesRepository.Table on application.QuoteId equals quote.Id
                        where
                        statusIDs.Contains(application.ApplicationStatus ?? default(int))
                        &&
                        quote.ResellerAccount == resellerId
                        select new AwaitingInvoiceModel
                        {
                            Id = application.Id,
                            ApplicationNumber = application.ApplicationNumber,
                            EndCustomerName = application.EndCustomerName != null || application.EndCustomerName != "" ? application.EndCustomerName : "N/A",
                            Status = status.Description != null || status.Description != "" ? status.Description : "N/A",
                            FinanaceAmount = application.FinanceTotal.HasValue ? application.FinanceTotal : 0,
                            FinanceType = financeType.Description != "" ? financeType.Description : "N/A",
                            CreatedDate = application.CreateDate,
                            ApprovedDate = application.ApprovedDate,

                        }).ToList();
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
