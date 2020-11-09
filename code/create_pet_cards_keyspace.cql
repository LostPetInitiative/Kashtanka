-- modify keyspace name
CREATE KEYSPACE pet_cards
	WITH REPLICATION = {
		'class': 'SimpleStrategy',
		'replication_factor': 3
	}
	AND DURABLE_WRITES = true;
