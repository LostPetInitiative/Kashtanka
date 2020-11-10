using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CassandraAPI.Storage
{
    public interface IStorage
    {
        Task<PetCard> GetPetCardAsync(string ns, string localID);
        Task<bool> AddPetCardAsync(PetCard card);
        Task<bool> DeletePetCardAsync(string ns, string localID);

        Task<IEnumerable<PetPhoto>> GetPetPhotosAsync(string ns, string localID);
        Task<bool> AddPetPhotoAsync(PetPhoto photo);
    }
}
