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
    public class PetPhotosController : ControllerBase
    {
        private IStorage storage;
        public PetPhotosController(IStorage storage)
        {
            this.storage = storage;
        }

        // GET: api/<PetPhotoController>/b524403d-bddf-4728-a6e9-4c8566c5ab76
        [HttpGet("{guid}")]
        public async Task<IEnumerable<PetPhotoMarshaled>> Get(Guid guid)
        {
            var photos = await this.storage.GetPetPhotosAsync(guid);
            return photos.Select(photo => new PetPhotoMarshaled(photo));
        }

        // POST api/<PetPhotoController>/
        [HttpPost()]
        public async Task<ActionResult> Post(PetPhotoMarshaled photo)
        {
            if (await this.storage.AddPetPhotoAsync(photo.ToPetPhoto()))
                return Ok();
            else
                return StatusCode(500);
        }
    }
}
