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
        public Location Location { get; set; }
        public string PetType { get; set; }
        public string ProvenanceURL { get; set; }
        public Dictionary<string, double[]> Features { get; set; }
    }

    public class ContactInfo
    {
        public string Comment { get; set; }
        public string Tel { get; set; }
        public string VK { get; set; }
        public string Email { get; set; }
    }

    public class Location
    {
        public string Address { get; set; }
        public string CoordsProvenance { get; set; }
        public double Lat { get; set; }
        public double Lon { get; set; }
    }

}
