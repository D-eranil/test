using System;
using System.Collections.Generic;
using System.Text;

namespace IMFS.Web.Models.BestRates
{
    public class BestRateByTotal
    {
		public double? Min { get; set; }
		public double? Max { get; set; }
		public double Value { get; set; }		
		public int? QuoteDurationID { get; set; }
		public int FinanceType { get; set; }
		public string PaymentType { get; set; }
		public int? FunderID { get; set; }
		public int? FunderPlanID { get; set; }
	}
}
