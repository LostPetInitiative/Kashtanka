using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using CassandraAPI.Storage;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace CassandraAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PetCardsController : ControllerBase
    {
        private ICardStorage storage;
        public PetCardsController(ICardStorage storage)
        {
            this.storage = storage;
        }

        // GET <PetCardsController>/pet911ru/rf123
        [HttpGet("{ns}/{localID}")]
        public async Task<ActionResult<PetCard>> Get(string ns, string localID)
        {
            try
            {
                Trace.TraceInformation($"Getting card for {ns}/{localID}");
                var result = await this.storage.GetPetCardAsync(ns, localID);
                if (result == null)
                {
                    Trace.TraceInformation($"card for {ns}/{localID} not found");
                    return NotFound();
                }
                else
                {
                    Trace.TraceInformation($"Successfully retrieved card for {ns}/{localID}");
                    return new ActionResult<PetCard>(result);
                }
            }
            catch (Exception err)
            {
                Trace.TraceError($"Except card for {ns}/{localID}: {err}");
                return StatusCode(500, err.ToString());
            }
        }

        // POST <PetCardsController>
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] PetCard value)
        {
            try
            {
                Trace.TraceInformation($"Storing {value.Namespace}/{value.LocalID} into storage");
                var res = await this.storage.AddPetCardAsync(value);
                if (res)
                {
                    Trace.TraceInformation($"Stored {value.Namespace}/{value.LocalID}");
                    return Ok();
                }
                else
                {
                    Trace.TraceWarning($"Error while storing {value.Namespace}/{value.LocalID}");
                    return StatusCode(500);
                }
            }
            catch (Exception err) {
                Trace.TraceError($"Exception while storing {value.Namespace}/{value.LocalID}: {err}");
                return StatusCode(500, err.ToString());
            }
            
        }

        // DELETE <PetCardsController>/pet911ru/rf123
        [HttpDelete("{ns}/{localID}")]
        public async Task<ActionResult> Delete(string ns, string localID)
        {
            try
            {
                Trace.TraceInformation($"Received delete request for {ns}/{localID}");
                var res = await this.storage.DeletePetCardAsync(ns, localID);
                if (res)
                {
                    Trace.TraceInformation($"Successfully deleted {ns}/{localID} from storage");
                    return Ok();
                }
                else
                {
                    Trace.TraceError($"Failed to delete {ns}/{localID}");
                    return StatusCode(500);
                }
            }
            catch (Exception err)
            {
                Trace.TraceError($"Exception while deleting {ns}/{localID}: {err}");
                return StatusCode(500, err.ToString());
            }
        }
    }
}
