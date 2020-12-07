using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace SolrAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:3000");
                        //builder.WithHeaders("Accept: application/json", "Content-Type: application/json");
                        builder.AllowAnyHeader();
                        builder.AllowAnyMethod();
                    });
            });

            services.AddControllers();

            string solrUrl = Environment.GetEnvironmentVariable("SOLR_URL");
            string collectionName = Environment.GetEnvironmentVariable("COLLECTION_NAME");
            if (solrUrl == null || collectionName == null)
            {
                Trace.TraceWarning("SOLR_URL or COLLECTION_NAME env var is not found. ");
                Environment.Exit(1);
            }
            else
            {
                int maxReturnCount = int.Parse(Environment.GetEnvironmentVariable("MAX_RETURN_COUNT") ?? "100");
                Trace.TraceInformation($"MAX_RETURN_COUNT: {maxReturnCount}");
                
                double longTermSearchRadiusKm = double.Parse(Environment.GetEnvironmentVariable("LONG_TERM_SEARCH_RADIUS_KM") ?? "20.0");
                Trace.TraceInformation($"LONG_TERM_SEARCH_RADIUS_KM: {longTermSearchRadiusKm}");

                double shortTermSearchRadiusKm = double.Parse(Environment.GetEnvironmentVariable("SHORT_TERM_SEARCH_RADIUS_KM") ?? "1000.0");
                Trace.TraceInformation($"SHORT_TERM_SEARCH_RADIUS_KM: {shortTermSearchRadiusKm}");

                TimeSpan shortTermLength = TimeSpan.FromDays(int.Parse(Environment.GetEnvironmentVariable("SHORT_TERM_LENGTH_DAYS") ?? "30"));
                Trace.TraceInformation($"SHORT_TERM_LENGTH_DAYS: {shortTermLength}");

                TimeSpan reverseTimeGapLength = TimeSpan.FromDays(int.Parse(Environment.GetEnvironmentVariable("REVERSE_TIME_GAP_LENGTH_DAYS") ?? "14"));
                Trace.TraceInformation($"REVERSE_TIME_GAP_LENGTH_DAYS: {reverseTimeGapLength}");

                double similarityThreshold = double.Parse(Environment.GetEnvironmentVariable("SIMILARITY_THRESHOLD") ?? "0.95");
                Trace.TraceInformation($"SIMILARITY_THRESHOLD: {similarityThreshold}");

                //services.AddSingleton(typeof(IPhotoStorage), storage);
                services.AddSingleton(typeof(ISolrSearchConfig),
                    new StaticSolrSearchConfig(solrUrl, collectionName,
                        maxReturnCount,
                        longTermSearchRadiusKm,
                        shortTermSearchRadiusKm,
                        shortTermLength,
                        similarityThreshold,
                        reverseTimeGapLength
                    ));
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            app.UseCors();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
