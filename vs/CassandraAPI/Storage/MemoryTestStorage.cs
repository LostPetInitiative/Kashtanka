using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CassandraAPI.Storage
{
    public class MemoryTestStorage : IStorage
    {
        public Task<Guid> AddPetCardAsync(PetCard card)
        {
            throw new NotImplementedException();
        }

        public Task<bool> AddPetPhotoAsync(PetPhoto photo)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeletePetCardAsync(Guid guid)
        {
            throw new NotImplementedException();
        }

        public Task<PetCard> GetPetCardAsync(Guid guid)
        {
            // only serves single card
            if (guid == new Guid("b524403d-bddf-4728-a6e9-4c8566c5ab76"))
            {
                var res = new PetCard();
                res.CardType = "found";
                res.ContactInfo = new ContactInfo() { Comment="This is comment", Tel= "911"};
                res.EventTime = new DateTime(2010, 1, 1);
                res.GlobalID = new Guid("b524403d-bddf-4728-a6e9-4c8566c5ab76");
                res.LocalID = "rf12332123";
                res.Location = new Location() { Address="Moscow", Lat=55.3, Lon=37.5};
                res.PetType = "cat";
                res.Provenance = "fake";
                res.ProvenanceURL = "http://fake.ru/rf12332123";
                return Task.FromResult(res);
            }
            else
                return Task.FromResult<PetCard>(null);
        }

        public Task<IEnumerable<PetPhoto>> GetPetPhotosAsync(Guid guid)
        {
            if (guid == new Guid("b524403d-bddf-4728-a6e9-4c8566c5ab76"))
            {
                var res = new PetPhoto[] {
                    new PetPhoto() {
                        AnnotatedImage = new byte[] { 0,1,3,53,31,4,5},
                        AnnotatedImageType = "jpg",
                        CardGlobalID = guid,
                        DetectionConfidence= 0.32,
                        DetectionRotation =0, 
                        ImageNum = 0
                    },
                    new PetPhoto() {
                        AnnotatedImage = new byte[] { 0,1,34,56,75,3,53,31,4,5},
                        AnnotatedImageType = "jpg",
                        CardGlobalID = guid,
                        DetectionConfidence= 0.87,
                        DetectionRotation =2,
                        ImageNum = 1
                    },
                };
                return Task.FromResult(res.AsEnumerable());
            }
            else
                return null;
        }
    }
}
