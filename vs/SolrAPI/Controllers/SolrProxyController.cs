using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace SolrAPI.Controllers
{
    /// <summary>
    /// POCO
    /// </summary>
    public class GetMatchesRequest {
        public double Lat { get; set; }
        public double Lon { get; set; }
        public string Animal { get; set; }
        public double DistanceKm { get; set; }
        public DateTime Time { get; set; }
        public double[] Features { get; set; }
        public string FeaturesIdent { get; set; }
        public double SimilarityThreshold { get; set; }

        public override int GetHashCode()
        {
            return
                this.Lat.GetHashCode() ^ this.Lon.GetHashCode() ^
                this.Animal.GetHashCode() ^
                this.DistanceKm.GetHashCode() ^
                this.Time.GetHashCode() ^ this.Features.Select(f => f.GetHashCode()).Aggregate(0, (acc, elem) => acc ^ elem) ^
                this.Features.Length.GetHashCode() ^
                this.FeaturesIdent.GetHashCode() ^
                this.SimilarityThreshold.GetHashCode();
        }
    }

    [Route("[controller]")]
    [ApiController]
    public class SolrProxyController : ControllerBase
    {
        private readonly string solrStreamingExpressionsURL;

        public SolrProxyController(string solrBaseUrl,  string collectionName)
        {
            this.solrStreamingExpressionsURL = $"{solrBaseUrl}/solr/{collectionName}/stream";
        }

        [EnableCors]
        [HttpGet("GetMatches")]
        public async Task<ActionResult> GetMatches([FromBody]GetMatchesRequest request)
        {
            string requestHash = ((uint)request.GetHashCode()).ToString("X8");
            try
            {
                string featureDims = String.Join(',', Enumerable.Range(0, request.Features.Length).Select(idx => $"features_{request.FeaturesIdent}_{idx}_d"));
                string featuresTargetVal = String.Join(',', request.Features);
                int topCount = 100;
                string solrFindLostRequest =
                    $"top(n ={topCount}, having(select(search(kashtankacards, q = \"+animal:{request.Animal} +card_type:Found +{{!geofilt sfield=location pt={request.Lat},{request.Lon} d={request.DistanceKm}}', fl = \"id, event_time, {featureDims}\", sort = \"event_time asc\", qt = \"/export\"), id, cosineSimilarity(array({featureDims}), array({featuresTargetVal})) as similarity), gt(similarity, {request.SimilarityThreshold})),sort = \"similarity desc\")";
                Trace.TraceInformation($"{requestHash}: Got request. Issuing: {solrFindLostRequest}");

                WebClient wc = new WebClient();
                Response.Headers.Add("Content-Type", "application/json");
                var response = await wc.DownloadStringTaskAsync(this.solrStreamingExpressionsURL);

                return Ok(response);

            }
            catch (Exception err)
            {
                Trace.TraceError($"{requestHash}: Exception occurred {err}");
                return StatusCode(500, err.ToString());
            }
        }
    }
}
