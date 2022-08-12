using IMFS.BusinessLogic.ApplicationManagement;
using IMFS.BusinessLogic.RoleManagement;
using IMFS.Web.Api.Helper;
using IMFS.Web.Models.Application;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace IMFS.Web.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ApplicationController : BaseController
    {
        private readonly IApplicationManager _applicationManager;
        private readonly IConfiguration _configuration;
        private readonly IRoleManager _roleManager;
        private Logger _logger = LogManager.GetCurrentClassLogger();

        public ApplicationController(IApplicationManager applicationManager, IRoleManager roleManager, IConfiguration configuration)
        {
            _applicationManager = applicationManager;
            _configuration = configuration;
            _roleManager = roleManager;
        }

        [Route("SearchApplication")]
        [HttpPost]
        public IActionResult SearchApplication(ApplicationSearchModel appSearchModel)
        {
            try
            {
                ApplicationSearchResponseModel response;
                var claims = HttpContext.User.Claims;
                var userId = claims.FirstOrDefault(x => x.Type == "UserId")?.Value.ToLower();
                var role = _roleManager.GetUserRole(userId);
                var resellerId = claims.FirstOrDefault(x => x.Type == "imResellerId")?.Value.ToLower();
                if (role != null && (role.Name == "ResellerStandard" || role.Name == "ResellerAdmin"))
                {
                    _logger.Info("inside user search: " + userId);
                    response = _applicationManager.SearchApplication(appSearchModel, resellerId);
                }
                else
                {
                    response = _applicationManager.SearchApplication(appSearchModel, string.Empty);
                }


                if (response.HasError)
                {
                    return BadRequest(new { status = "Error", message = response.ErrorMessage });
                }
                else
                {
                    return Ok(new { status = "Success", message = "Application Search successfully", searchResult = response.SearchResult.OrderByDescending(a => a.CreatedDate) });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }
        }

        [Route("LookupApplicationNumber")]
        [HttpPost]
        public IActionResult LookupApplicationNumber(ApplicationSearchModel appSearchModel)
        {
            try
            {
                ApplicationSearchResponseModel response;
                var claims = HttpContext.User.Claims;
                var userId = claims.FirstOrDefault(x => x.Type == "UserId")?.Value.ToLower();
                var role = _roleManager.GetUserRole(userId);
                var resellerId = claims.FirstOrDefault(x => x.Type == "imResellerId")?.Value.ToLower();
                if (role != null && (role.Name == "ResellerStandard" || role.Name == "ResellerAdmin"))
                {
                    _logger.Info("inside application search: " + userId);
                    response = _applicationManager.LookupApplicationNumber(appSearchModel, resellerId);
                }
                else
                {
                    response = _applicationManager.LookupApplicationNumber(appSearchModel, string.Empty);
                }

                if (response.HasError)
                {
                    return BadRequest(new { status = "Error", message = response.ErrorMessage });
                }
                else
                {
                    return Ok(new { status = "Success", message = "Application Search successfully", searchResult = response.SearchResult.OrderByDescending(a => a.CreatedDate) });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }
        }

        [Route("GetApplicationDetails")]
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetApplicationDetails(string applicationId)
        {
            try
            {
                var response = _applicationManager.GetApplicationDetails(applicationId);
                if (response.HasError)
                {
                    return Ok(new { status = "Error", message = response.ErrorMessage });
                }
                else
                {
                    return Ok(new { status = "Success", message = "Application information retrieved successfully", applicationDetails = response.ApplicationDetails });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }

        }

        [Route("GetContacts")]
        [HttpGet]
        public IActionResult GetContacts(string resellerId)
        {
            try
            {
                //var claims = HttpContext.User.Claims;
                var response = _applicationManager.GetContacts(resellerId);

                return Ok(new { status = "Success", message = "Conatcts information retrieved successfully", searchResult = response });

            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }

        }

        [Route("SaveApplication")]
        [HttpPost]
        public IActionResult SaveApplication(Web.Models.Application.ApplicationDetailsModel applicationDetailsModel)
        {
            try
            {
                _logger.Info("Save application model: " + JsonConvert.SerializeObject(applicationDetailsModel));
                var claims = HttpContext.User.Claims;
                var userId = claims.FirstOrDefault(x => x.Type == "UserId")?.Value.ToLower();
                var response = _applicationManager.SaveApplication(applicationDetailsModel, userId);
                if (response.HasError)
                {
                    return BadRequest(new { status = "Failed", message = response.ErrorMessage });
                }
                else
                {
                    return Ok(new { status = "Success", message = "Application information updated successfully", data = response.ApplicationId });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }

        }

        [Route("DownloadApplication")]
        [HttpPost]
        public IActionResult DownloadApplication(ApplicationDownloadInput inputModel)
        {
            try
            {
                var result = _applicationManager.DownloadApplication(inputModel);
                if (result.HasError)
                {
                    return BadRequest(new { status = "Error", message = result.ErrorMessage });
                }
                else
                {
                    IMFSGlobals.CreateDownloadResponse(Response, result);
                    return File(result.DownloadFile, MimeTypes.GetMimeType(result.FileName), result.FileName);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }
        }

        [Route("RejectApplication")]
        [HttpGet]
        public IActionResult RejectApplication(int applicationId)
        {
            try
            {
                var response = _applicationManager.RejectApplication(applicationId);
                if (response.HasError)
                {
                    return BadRequest(new { status = "Failed", message = response.ErrorMessage });
                }
                else
                {
                    return Ok(new { status = "Success", message = "Application updated successfully" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }

        }


        [Route("CancelApplication")]
        [HttpGet]
        public IActionResult CancelApplication(int applicationId)
        {
            try
            {
                var response = _applicationManager.CancelApplication(applicationId);
                if (response.HasError)
                {
                    return BadRequest(new { status = "Failed", message = response.ErrorMessage });
                }
                else
                {
                    return Ok(new { status = "Success", message = "Application updated successfully" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }

        }

        /// <summary>
        /// Get the applications for this reseller
        /// </summary>
        /// <returns></returns>
        [Route("GetRecentApplications")]
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetRecentApplications()
        {
            try
            {
                //check user claim
                var claims = HttpContext.User.Claims;
                string resellerId = claims.FirstOrDefault(x => x.Type == "RessellerId")?.Value;
                if (string.IsNullOrEmpty(resellerId)) resellerId = "153200";

                var response = _applicationManager.GetRecentApplications(resellerId);
                if (response.Count > 0)
                    return Ok(new { status = "Success", message = "Recent applcations fetched successfully", recentAppDetails = response });
                else
                    return Ok(new { status = "Success", message = "No application found", recentAppDetails = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }

        }

        /// <summary>
        /// get awaiting invoices for the resller account
        /// </summary>
        /// <returns></returns>
        [Route("GetAwaitingInvoices")]
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAwaitingInvoices()
        {
            try
            {
                //check user claim
                var claims = HttpContext.User.Claims;
                string resellerId = claims.FirstOrDefault(x => x.Type == "RessellerId")?.Value;
                if (string.IsNullOrEmpty(resellerId)) resellerId = "153200";

                var response = _applicationManager.GetAwaitingInvoices(resellerId);
                if (response.Count > 0)
                    return Ok(new { status = "Success", message = "Awaiting invoices fetched successfully", recentInvoiceDetails = response });
                else
                    return Ok(new { status = "Success", message = "No invoice found", recentInvoiceDetails = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "Failed", error = ex.ToString() });
            }

        }
    }
}
