using IMFS.Web.Models.DBModel;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace IMFS.Web.Models.OPRDBModel
{
    [Table("QuoteAttachments")]
    public partial class QuoteAttachments : BaseEntity
    {
        [Key]
        public int Id { get; set; }
        public int QuoteId { get; set; }
        public string FileName { get; set; }
        public string Description { get; set; }
        public string PhysicalPath { get; set; }
        public string UploadBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? LastAccessDate { get; set; }

    }
}
