using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Cassandra;
using Cassandra.Mapping;

namespace CassandraAPI.Storage
{
    public class Cassandra : ICardStorage, IPhotoStorage
    {
        private readonly ICluster cluster;
        private readonly ISession session;
        private readonly string keyspace;

        public static IPEndPoint EndpointFromString(string str)
        {
            var parts = str.Split(":", StringSplitOptions.RemoveEmptyEntries);
            IPAddress addr;
            int port = 9042; // default port
            if (parts.Length == 2)
            {
                addr = Dns.GetHostEntry(parts[0]).AddressList[0];
                port = int.Parse(parts[1]);
            }
            else
            {
                addr = IPAddress.Parse(parts[0]);
            }
            return new IPEndPoint(addr, port);
        }

        private readonly PreparedStatement insertPetCardStatement;
        private readonly PreparedStatement deletePetCardStatement;
        private readonly PreparedStatement getPetCardStatement;

        private readonly PreparedStatement deleteSpecificPetImageStatement;
        private readonly PreparedStatement deleteAllPetImagesStatement;
        private readonly PreparedStatement getAllPetImagesStatementIncBin;
        private readonly PreparedStatement getAllPetImagesStatement;
        private readonly PreparedStatement getParticularPetImageStatement;
        private readonly PreparedStatement addPetImageStatement;

        public Cassandra(string keyspace, params string[] contactPoints)
        {
            this.cluster = Cluster.Builder()
                     .AddContactPoints(contactPoints.Select(EndpointFromString))
                     .WithApplicationName("RestAPI")
                     .WithCompression(CompressionType.LZ4)
                     .Build();
            this.keyspace = keyspace;
            this.session = cluster.Connect(this.keyspace);

            this.getPetCardStatement = session.Prepare("SELECT * FROM cards_by_id WHERE namespace = ? AND local_id = ?");
            this.insertPetCardStatement = session.Prepare("INSERT INTO cards_by_id (namespace, local_id, provenance_url, pet_type, card_type, event_time, location, contact_info) values (?,?,?,?, ?,?,?,?)");
            this.deletePetCardStatement = session.Prepare("DELETE FROM cards_by_id WHERE namespace = ? AND local_id = ?");

            this.deleteSpecificPetImageStatement = session.Prepare("DELETE FROM images_by_card_id WHERE namespace = ? AND local_id = ? AND image_num = ?");
            this.deleteAllPetImagesStatement = session.Prepare("DELETE FROM images_by_card_id WHERE namespace = ? AND local_id = ?");
            this.getAllPetImagesStatementIncBin = session.Prepare("SELECT * FROM images_by_card_id WHERE namespace = ? AND local_id = ?");
            this.getAllPetImagesStatement = session.Prepare("SELECT namespace,local_id,image_num,detection_confidence,detection_rotation FROM images_by_card_id WHERE namespace = ? AND local_id = ?");
            this.getParticularPetImageStatement = session.Prepare("SELECT * FROM images_by_card_id WHERE namespace = ? AND local_id = ? AND image_num = ?");
            this.addPetImageStatement = session.Prepare("INSERT INTO images_by_card_id (namespace, local_id, image_num, annotated_image, annotated_image_type, extracted_pet_image, detection_confidence, detection_rotation) values (?,?,?,?,?,?,?,?)");

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

        public static string DecodePetType(sbyte code)
        {
            return code switch
            {
                1 => "cat",
                2 => "dog",
                _ => "unknown"
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

            var statement = this.insertPetCardStatement.Bind(
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

        public async Task<bool> AddPetPhotoAsync(PetPhoto photo)
        {
                //namespace text,
                //local_id text,
                //image_num tinyint,
                //annotated_image blob,
                //annotated_image_type text,
                //extracted_pet_image blob,
                //detection_confidence double,
                //detection_rotation tinyint,
            var statement = this.addPetImageStatement.Bind(
                photo.Namespace,
                photo.LocalID,
                (sbyte)photo.ImageNum,
                photo.AnnotatedImage,
                photo.AnnotatedImageType,
                photo.ExtractedImage,
                photo.DetectionConfidence,
                (sbyte)photo.DetectionRotation
                );
            var res = await this.session.ExecuteAsync(statement);
            return true;
        }

        public async Task<bool> DeletePetCardAsync(string ns, string localID)
        {
            var statement = this.deletePetCardStatement.Bind(ns, localID);

            await session.ExecuteAsync(statement);

            return true;
        }

        public async Task<PetCard> GetPetCardAsync(string ns, string localID)
        {
            var statement = this.getPetCardStatement.Bind(ns, localID);
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

        private static PetPhoto CovertRowToPetPhoto(Row row, bool includeBinData) {
            //namespace text,
            //local_id text,
            //image_num tinyint,
            //annotated_image blob,
            //annotated_image_type text,
            //extracted_pet_image blob,
            //detection_confidence double,
            //detection_rotation tinyint,
            return new PetPhoto()
            {
                Namespace = row.GetValue<string>("namespace"),
                LocalID = row.GetValue<string>("local_id"),
                ImageNum = row.GetValue<sbyte>("image_num"),
                AnnotatedImage = includeBinData ? row.GetValue<byte[]>("annotated_image") : null,
                AnnotatedImageType = includeBinData ? row.GetValue<string>("annotated_image_type") : null,
                ExtractedImage = includeBinData ? row.GetValue<byte[]>("extracted_pet_image") : null,
                DetectionConfidence = row.GetValue<double>("detection_confidence"),
                DetectionRotation = row.GetValue<sbyte>("detection_rotation")
            };
        }

        public async IAsyncEnumerable<PetPhoto> GetPetPhotosAsync(string ns, string localID, bool includeBinData)
        {
            BoundStatement statement =
                includeBinData ?
                    this.getAllPetImagesStatementIncBin.Bind(ns,localID)
                    : this.getAllPetImagesStatement.Bind(ns, localID);
            var rows = await this.session.ExecuteAsync(statement);
            foreach (var row in rows) {
                yield return CovertRowToPetPhoto(row, includeBinData);
            }
        }

        public async Task<bool> DeletePetPhoto(string ns, string localID, int photoNum = -1)
        {
            BoundStatement statement = (photoNum == -1) ?
                (this.deleteAllPetImagesStatement.Bind(ns, localID)) :
                (this.deleteSpecificPetImageStatement.Bind(ns, localID, photoNum));
            await this.session.ExecuteAsync(statement);
            return true;
        }

        public async Task<PetPhoto> GetPetPhotoAsync(string ns, string localID, int imageNum)
        {
            var statement = this.getParticularPetImageStatement.Bind(ns, localID, (sbyte)imageNum);
            var row = (await this.session.ExecuteAsync(statement)).FirstOrDefault();
            if (row != null)
            {
                PetPhoto photo = CovertRowToPetPhoto(row, true);
                return photo;
            }
            else
            {
                return null;
            }
        }
    }
}
