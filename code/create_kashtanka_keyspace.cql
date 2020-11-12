-- modify keyspace name
CREATE KEYSPACE kashtanka
	WITH REPLICATION = {
		'class': 'SimpleStrategy',
		'replication_factor': 3
	}
	AND DURABLE_WRITES = true;
