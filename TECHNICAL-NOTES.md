# Deployment

This page explains some additional deployment details.

## Dynamically Registered Client Settings

Connect to the PostgreSQL container this this command:

```bash
CONTAINER_ID=$(docker ps | grep postgres | awk '{print $1}')
docker exec -it $CONTAINER_ID bash
```

Then make a SQL connection:

```bash
export PGPASSWORD=Password1 && psql -p 5432 -d idsvr -U postgres
```

Then view the clients and their OAuth settings:

```sql
select * from dynamically_registered_clients;
```

### API Gateway

The Kong API gateway uses [routes](apigateway/kong.yml) to call backend components.\
The [phantom token plugin](https://github.com/curityio/nginx-lua-phantom-token-plugin) introspects opaque access tokens and forwards JWT access tokens to the API.
