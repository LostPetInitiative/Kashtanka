Cassandra-env.sh differs from the official one in a way is detects the amount of RAM and CPU cores available.
The original version accounts for whole nodes memory, while this custom version accounts for the K8s limited resources.
