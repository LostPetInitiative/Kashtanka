using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CassandraAPI
{
    public class PetCard
    {
        public string CardType { get; set; }
        public ContactInfo ContactInfo { get; set; }
        public DateTime EventTime { get; set; }
        public Guid GlobalID { get; set; }
        public string LocalID { get; set; }
        public Location Location { get; set; }
        public string PetType { get; set; }
        public string Provenance { get; set; }
        public string ProvenanceURL { get; set; }
    }

    public class ContactInfo
    {
        public string Comment { get; set; }
        public string Tel { get; set; }
    }

    public class Location
    {
        public string Address { get; set; }
        public double Lat { get; set; }
        public double Lon { get; set; }
    }

}
