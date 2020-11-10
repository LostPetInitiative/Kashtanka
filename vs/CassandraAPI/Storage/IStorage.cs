using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CassandraAPI.Storage
{
    public interface IStorage
    {
        Task<PetCard> GetPetCardAsync(Guid guid);
        Task<Guid> AddPetCardAsync(PetCard card);
        Task<bool> DeletePetCardAsync(Guid guid);

        Task<IEnumerable<PetPhoto>> GetPetPhotosAsync(Guid guid);
        Task<bool> AddPetPhotoAsync(PetPhoto photo);
    }
}
