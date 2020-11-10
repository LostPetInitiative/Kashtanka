using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Cassandra;

namespace CassandraAPI.Storage
{
    public class Cassandra : IStorage
    {
        private readonly ICluster cluster;
        private readonly ISession session;
        private readonly string keyspace;

        public static IPEndPoint EndpointFromString(string str) {
            var parts = str.Split(":",StringSplitOptions.RemoveEmptyEntries);
            IPAddress addr;
            int port = 9042;
            if (parts.Length == 2)
            {
                addr = Dns.GetHostEntry(parts[0]).AddressList[0];
                port = int.Parse(parts[1]);
            }
            else {
                addr = IPAddress.Parse(parts[0]);
            }
            return new IPEndPoint(addr, port);
        }

        public Cassandra(string keyspace, params string[] contactPoints) {
            this.cluster = Cluster.Builder()
                     .AddContactPoints(contactPoints.Select(EndpointFromString))
                     .Build();
            this.keyspace = keyspace;
            this.session = cluster.Connect(this.keyspace);

            this.session.UserDefinedTypes.Define(UdtMap.For<Location>("location"));
            this.session.UserDefinedTypes.Define(UdtMap.For<ContactInfo>("contact_info"));
        }

        public static sbyte EncodePetType(string petType)
        {
            return petType switch
                {
                    "cat" => 1,
                    "dog" => 2,
                    _ => 0,
                };
        }

        public static string DecodePetType(sbyte code) {
            return code switch
                {
                    1 => "cat",
                    2 => "dog",
                    _   => "unknown"
                };
        }

        public static sbyte EncodeCardType(string cardType)
        {
            return cardType switch
            {
                "found" => 1,
                "lost" => 2,
                _ => 0
            };
        }

        public static string DecodeCardType(sbyte code)
        {
            return code switch
            {
                1 => "found",
                2 => "lost",
                _ => "unknown"
            };
        }

        public async Task<bool> AddPetCardAsync(PetCard card)
        {
            /*
            namespace text,
	        local_id text,
            provenance_url text,
	        pet_type tinyint,
            card_type tinyint,
	        event_time timestamp,
            location location,
	        contact_info contact_info,
            */

            var ps = session.Prepare("INSERT INTO cards_by_id (namespace, local_id, provenance_url, pet_type, card_type, event_time, location, contact_info) values (?,?,?,?, ?,?,?,?)");

            var statement = ps.Bind(
                card.Namespace,
                card.LocalID,
                card.ProvenanceURL,
                EncodePetType(card.PetType),
                EncodeCardType(card.CardType),
                card.EventTime,
                card.Location,
                card.ContactInfo
                );

            await session.ExecuteAsync(statement);

            return true;
        }

        public Task<bool> AddPetPhotoAsync(PetPhoto photo)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeletePetCardAsync(string ns, string localID)
        {
            throw new NotImplementedException();
        }

        public async Task<PetCard> GetPetCardAsync(string ns, string localID)
        {
            var ps = session.Prepare("SELECT * FROM cards_by_id WHERE namespace = ? AND local_id = ?");
            var statement = ps.Bind(ns, localID);
            var rows = await session.ExecuteAsync(statement);
            Row extracted = rows.FirstOrDefault();
            if (extracted != null)
            {
                return new PetCard()
                {
                    Namespace = extracted.GetValue<string>("namespace"),
                    LocalID = extracted.GetValue<string>("local_id"),
                    CardType = DecodeCardType(extracted.GetValue<sbyte>("card_type")),
                    ContactInfo = extracted.GetValue<ContactInfo>("contact_info"),
                    EventTime = extracted.GetValue<DateTime>("event_time"),
                    Location = extracted.GetValue<Location>("location"),
                    PetType = DecodePetType(extracted.GetValue<sbyte>("pet_type")),
                    ProvenanceURL = extracted.GetValue<string>("provenance_url")
                };
            }
            else
                return null;
        }

        public Task<IEnumerable<PetPhoto>> GetPetPhotosAsync(string ns, string localID)
        {
            throw new NotImplementedException();
        }
    }
}
