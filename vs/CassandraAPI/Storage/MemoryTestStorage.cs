﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CassandraAPI.Storage
{
    public class MemoryTestStorage : ICardStorage, IPhotoStorage
    {
        public Task<bool> AddPetCardAsync(PetCard card)
        {
            throw new NotImplementedException();
        }

        public Task<bool> AddPetPhotoAsync(PetPhoto photo)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeletePetCardAsync(string ns, string localID)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeletePetPhoto(string ns, string localID, int photoNum = -1)
        {
            throw new NotImplementedException();
        }

        public Task<PetCard> GetPetCardAsync(string ns, string localID)
        {
            // only serves single card
            if (ns == "pet911ru" && localID == "rf123")
            {
                var res = new PetCard
                {
                    CardType = "found",
                    ContactInfo = new ContactInfo() { Comment = "This is comment", Tel = "911" },
                    EventTime = new DateTime(2010, 1, 1),
                    Namespace = "pet911ru",
                    LocalID = "rf123",
                    Location = new Location() { Address = "Moscow", Lat = 55.3, Lon = 37.5 },
                    PetType = "cat",
                    ProvenanceURL = "http://fake.ru/rf12332123"
                };
                return Task.FromResult(res);
            }
            else
                return Task.FromResult<PetCard>(null);
        }

        public Task<PetPhoto> GetPetPhotoAsync(string ns, string localID, int imageNum)
        {
            throw new NotImplementedException();
        }

        public async IAsyncEnumerable<PetPhoto> GetPetPhotosAsync(string ns, string localID, bool includeBinData)
        {
            if (ns == "pet911ru" && localID == "rf123")
            {
                yield return
                    new PetPhoto()
                    {
                        AnnotatedImage = includeBinData ? (new byte[] { 0, 1, 3, 53, 31, 4, 5 }) : null,
                        ExtractedImage = includeBinData ? (new byte[] { 0, 1, 3, 53, 31, 4, 5 }) : null,
                        AnnotatedImageType = "jpg",
                        Namespace = "pet911ru",
                        LocalID = "rf123",
                        DetectionConfidence = 0.32,
                        DetectionRotation = 0,
                        ImageNum = 0
                    };
                yield return new PetPhoto()
                {
                    AnnotatedImage = includeBinData ? (new byte[] { 0, 1, 3, 53, 34, 4, 5 }) : null,
                    ExtractedImage = includeBinData ? (new byte[] { 0, 1, 3, 53, 31, 63, 5 }) : null,

                    AnnotatedImageType = "jpg",
                    Namespace = "pet911ru",
                    LocalID = "rf123",
                    DetectionConfidence = 0.87,
                    DetectionRotation = 2,
                    ImageNum = 1
                };
            }
            else
                yield return null;
        }
    }
}
