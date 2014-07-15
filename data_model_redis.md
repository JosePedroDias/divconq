strings:
	get k
	set k v

lists:
	rpush k a
	lpush k b
	rpop k
	lpop k
	lrange k 0 -1          (get all items)
	ltrim k 0 2            (trim to first 3 items)
	brpop k, blpop k       (blocking pops, liberta qd houver elementos)
	llen k                 (length)

hash:
	hset k f v
	hmset k f1 v1 f2 v2
	hget k f1
	hmget k f1 f2
	hgetall k

sets:
	TODO

sorted sets:
	TODO

pubsub?

--------------


counter:job-kind (string)
counter:job      (string)
	incr k

job-kind:<id> (hash)
	fields:
		id (string),
		divide (string),
		conquer (string),
		worker (string)

job-request:<job-kind-id>:<id> (hash)
	fields:
		state (string),
		cfg (string)


job-kind:id