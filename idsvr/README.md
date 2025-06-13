# Curity Identity Server

The example deployment includes a PostgreSQL database that stores dynamic clients in a database.\
You can use it to view the OAuth settings for each dynamically registered client.\
To do so, first get a shell to the database container:

```bash
CONTAINER_ID=$(docker ps | grep postgres | awk '{print $1}')
docker exec -it $CONTAINER_ID bash
```

Then connect to the database.

```bash
export PGPASSWORD=Password1 && psql -p 5432 -d idsvr -U postgres
```

Then run a command like this to view each dynamic client's stored settings:.

```sql
select client_id, client_secret, scope, attributes from dynamically_registered_clients;
```
