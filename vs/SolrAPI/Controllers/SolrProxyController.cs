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
using System.Net.Http;
using System.Web;

namespace SolrAPI.Controllers
{
    /// <summary>
    /// POCO
    /// </summary>
    public class GetMatchesRequest {
        public double Lat { get; set; }
        public double Lon { get; set; }
        public string Animal { get; set; }
        public DateTime EventTime { get; set; }
        public double[] Features { get; set; }
        public string FeaturesIdent { get; set; }
        public string EventType { get; set; }

        public override int GetHashCode()
        {
            return
                this.Lat.GetHashCode() ^ this.Lon.GetHashCode() ^
                (this.Animal?.GetHashCode() ?? 0) ^
                this.EventTime.GetHashCode() ^ this.Features.Select(f => f.GetHashCode()).Aggregate(0, (acc, elem) => acc ^ elem) ^
                this.Features.Length.GetHashCode() ^
                (this.FeaturesIdent?.GetHashCode() ?? 0);
        }
    }

    [Route("")]
    [ApiController]
    public class SolrProxyController : ControllerBase
    {
        private readonly string solrStreamingExpressionsURL;
        private readonly string solrSelectExpressionsURL;
        private readonly ISolrSearchConfig searchConfig;

        public SolrProxyController(ISolrSearchConfig solrAddress)
        {
            this.searchConfig = solrAddress;
            this.solrStreamingExpressionsURL = $"{solrAddress.SolrAddress}/solr/{solrAddress.CollectionName}/stream";
            this.solrSelectExpressionsURL = $"{solrAddress.SolrAddress}/solr/{solrAddress.CollectionName}/select";
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="requestID">How to identify the request in logs</param>
        /// <param name="requstURL"></param>
        /// <param name="response">Where to write proxied data</param>
        /// <returns></returns>
        private static async Task ProxyHttpGet(string requestID, string requstURL, HttpResponse response) {
            WebClient wc = new WebClient();
            Trace.TraceInformation($"{requestID}: Issung request {requstURL}.");
            var responseData = await wc.DownloadDataTaskAsync(requstURL);
            Trace.TraceInformation($"{requestID}: Got reply of {responseData.Length} bytes from Solr, transmitting.");

            response.StatusCode = 200;
            response.ContentType = "application/json";
            response.ContentLength = responseData.Length;
            await response.StartAsync();
            await response.BodyWriter.WriteAsync(responseData);
            await response.BodyWriter.FlushAsync();
            await response.BodyWriter.CompleteAsync();
            await response.CompleteAsync();
        }

        [EnableCors]
        [HttpPost("MatchedCardsSearch")]
        public async Task MatchedCardsSearch([FromBody]GetMatchesRequest request)
        {
            string requestHash = ((uint)request.GetHashCode()).ToString("X8");
            Trace.TraceInformation($"{requestHash}: Got request.");
            try
            {
                string featureDims = String.Join(",", Enumerable.Range(0, request.Features.Length).Select(idx => $"features_{request.FeaturesIdent}_{idx}_d"));
                string featuresTargetVal = String.Join(',', request.Features);
                
                DateTime shortTermSearchStart = request.EventType switch
                {
                    "Found" => (request.EventTime - this.searchConfig.ShortTermLength), // looking back in time
                    "Lost" => (request.EventTime - this.searchConfig.ReverseTimeGapLength),
                    _ => throw new ArgumentException($"Unknown EventType: {request.EventType}")
                };

                DateTime shortTermSearchEnd = request.EventType switch
                {
                    "Found" => (request.EventTime + this.searchConfig.ReverseTimeGapLength), 
                    "Lost" => (request.EventTime + this.searchConfig.ShortTermLength),
                    _ => throw new ArgumentException($"Unknown EventType: {request.EventType}")
                };

                string toISO(DateTime d) => d.ToString("o", System.Globalization.CultureInfo.InvariantCulture);

                string shortTermTimeSpec = $"event_time:[{toISO(shortTermSearchStart)} TO {toISO(shortTermSearchEnd)}]";
                string shortTermSpaceSpec = $"{{!geofilt sfield=location pt={request.Lat},{request.Lon} d={this.searchConfig.ShortTermSearchRadiusKm}}}";
                string shortTermSearchTerm = $"{shortTermTimeSpec} AND {shortTermSpaceSpec}";

                string longTermTimeSpec = request.EventType switch
                {
                    "Found" => $"event_time:[ * TO {toISO(request.EventTime + this.searchConfig.ReverseTimeGapLength)}]",
                    "Lost" => $"event_time:[{toISO(request.EventTime - this.searchConfig.ReverseTimeGapLength)} TO *]",
                    _ => throw new ArgumentException($"Unknown EventType: {request.EventType}")
                };
                string longTermSpaceSpec = $"{{!geofilt sfield=location pt={request.Lat},{request.Lon} d={this.searchConfig.LongTermSearchRadiusKm}}}";
                string longTermSearchTerm = $"{longTermTimeSpec} AND {longTermSpaceSpec}";

                string typeSearchTerm = request.EventType switch
                {
                    "Found" => "card_type:Lost",
                    "Lost" => "card_type:Found",
                    _ => throw new ArgumentException($"Unknown EventType: {request.EventType}")
                };


                string solrFindLostRequest =
                    $"top(n={this.searchConfig.MaxReturnCount},having(select(search({this.searchConfig.CollectionName},q=\"animal:{request.Animal} AND {typeSearchTerm} AND (({shortTermSearchTerm})OR({longTermSearchTerm}))\",fl=\"id, event_time, {featureDims}\",sort=\"event_time asc\",qt=\"/export\"),id,cosineSimilarity(array({featureDims}), array({featuresTargetVal})) as similarity), gt(similarity, {this.searchConfig.SimilarityThreshold})),sort=\"similarity desc\")";
                //Trace.TraceInformation($"{requestHash}: Got request. Issuing: {solrFindLostRequest}");
                

                string finalURL = $"{this.solrStreamingExpressionsURL}?expr={HttpUtility.UrlEncode(solrFindLostRequest)}";
                await ProxyHttpGet(requestHash, finalURL, Response);


                Trace.TraceInformation($"{requestHash}: Transmitted successfully");
            }
            catch (Exception err)
            {
                Trace.TraceError($"{requestHash}: Exception occurred {err}");
                string errorMsg = err.ToString();
                Response.StatusCode = 500;
                Response.ContentLength = ASCIIEncoding.Unicode.GetByteCount(errorMsg);
                await Response.WriteAsync(errorMsg);
                await Response.CompleteAsync();
            }
        }

        [EnableCors]
        [HttpGet("LatestCards")]
        public async Task LatestCards([FromQuery]int maxCardsCount=10, [FromQuery] string cardType=null) {
            maxCardsCount = Math.Min(1000, maxCardsCount);

            string typeConstraint = cardType?.ToLowerInvariant() switch
            {
                "lost" => "card_type:Lost",
                "found" => "card_type:Found",
                _ => string.Empty
            };

            Trace.TraceInformation($"Fetching no more than {maxCardsCount} latest cards (card type constraint: {typeConstraint})");

            Dictionary<string, string> requestParams = new Dictionary<string, string>();
            requestParams.Add("q","*:*");
            requestParams.Add("sort", "card_creation_time desc");
            requestParams.Add("fl", "id");
            requestParams.Add("rows", $"{maxCardsCount}");
            if (!string.IsNullOrEmpty(typeConstraint)) {
                requestParams.Add("fq", typeConstraint);
            }

            string queryStr =
                string.Join('&', requestParams.Select(kvp => $"{HttpUtility.UrlEncode(kvp.Key)}={HttpUtility.UrlEncode(kvp.Value)}"));

            string finalURL = $"{this.solrSelectExpressionsURL}?{queryStr}";
            try {
                await ProxyHttpGet("latest cards request", finalURL, Response);
            }
            catch (Exception err)
            {
                string errorMsg = $"Exception occurred during latest cards fetch: {err}";
                Trace.TraceError(errorMsg);
                Response.StatusCode = 500;
                Response.ContentLength = ASCIIEncoding.Unicode.GetByteCount(errorMsg);
                await Response.WriteAsync(errorMsg);
                await Response.CompleteAsync();
            }
        }
    }
}
