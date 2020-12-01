using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SolrAPI
{
    public class StaticSolrSearchConfig : ISolrSearchConfig
    {
        public string SolrAddress { get; private set; }

        public string CollectionName { get; private set; }

        public int MaxReturnCount { get; private set; }

        public double LongTermSearchRadiusKm { get; private set; }

        public double ShortTermSearchRadiusKm { get; private set; }

        public TimeSpan ShortTermLength { get; private set; }

        public double SimilarityThreshold { get; private set; }

        public TimeSpan ReverseTimeGapLength { get; private set; }

        public StaticSolrSearchConfig(
            string address,
            string collectionName,
            int maxReturnCount,
            double longTermSearchRadiusKm,
            double shortTermSearchRadiusKm,
            TimeSpan shortTermLength,
            double similarityThreshold,
            TimeSpan reverseTimeGapLength
            ) {
            this.SolrAddress = address;
            this.CollectionName = collectionName;
            this.MaxReturnCount = maxReturnCount;
            this.LongTermSearchRadiusKm = longTermSearchRadiusKm;
            this.ShortTermSearchRadiusKm = shortTermSearchRadiusKm;
            this.ShortTermLength = shortTermLength;
            this.SimilarityThreshold = similarityThreshold;
            this.ReverseTimeGapLength = reverseTimeGapLength;
        }
    }
}
