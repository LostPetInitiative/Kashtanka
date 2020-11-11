using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CassandraAPI.Storage
{
    public interface ICardStorage
    {
        Task<PetCard> GetPetCardAsync(string ns, string localID);
        Task<bool> AddPetCardAsync(PetCard card);
        Task<bool> DeletePetCardAsync(string ns, string localID);
    }
}
