using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CassandraAPI.Storage;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace CassandraAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetCardsController : ControllerBase
    {
        private IStorage storage;
        public PetCardsController(IStorage storage)
        {
            this.storage = storage;
        }

        // GET api/<PetCardsController>/b524403d-bddf-4728-a6e9-4c8566c5ab76
        [HttpGet("{guid}")]
        public async Task<ActionResult<PetCard>> Get(Guid guid)
        {
            var result = await this.storage.GetPetCardAsync(guid);
            if (result == null)
                return NotFound();
            else
                return new ActionResult<PetCard>(result);
        }

        // POST api/<PetCardsController>
        [HttpPost]
        public async Task Post([FromBody] PetCard value)
        {
        }

        // DELETE api/<PetCardsController>/5
        [HttpDelete("{guid}")]
        public async Task Delete(Guid guid)
        {
        }
    }
}
