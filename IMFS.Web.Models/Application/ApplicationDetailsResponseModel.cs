using IMFS.Web.Models.Misc;
using System;
using System.Collections.Generic;
using System.Text;

namespace IMFS.Web.Models.Application
{
    public class ApplicationDetailsResponseModel: ErrorModel
    {
        public ApplicationDetailsModel ApplicationDetails { get; set; }

        public ApplicationDetailsResponseModel()
        {

        }
    }
}
