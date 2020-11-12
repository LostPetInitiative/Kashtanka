FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
COPY publish /publish
WORKDIR /publish

ENV KEYSPACE=kashtanka
ENV CASSANDRA_ADDRS=cass-0

EXPOSE 5000

CMD [ "./CassandraAPI" ]
