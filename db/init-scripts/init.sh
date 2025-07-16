psql -U postgres -d postgres -c "CREATE USER liquibase WITH PASSWORD 'liquibase';"

psql -U postgres -d postgres -c "CREATE USER keycloak WITH PASSWORD 'keycloak';"
psql -U postgres -d postgres -c "CREATE DATABASE keycloak;"
psql -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;"

psql -U postgres -d keycloak -c "GRANT ALL ON SCHEMA public to keycloak; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO keycloak; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO keycloak; GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO keycloak; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO keycloak; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO keycloak; GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO keycloak;"
    

psql -U postgres -d postgres -c "CREATE USER opencms WITH PASSWORD 'opencms';"
psql -U postgres -d postgres -c "CREATE DATABASE opencms;"
psql -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE opencms TO opencms;"

psql -U postgres -d opencms -c "GRANT ALL ON SCHEMA public to opencms; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO opencms; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO opencms; GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO opencms; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO opencms; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO opencms; GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO opencms;"

psql -U postgres -d opencms -c "GRANT ALL ON SCHEMA public to liquibase; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO liquibase; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO liquibase; GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO liquibase; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO liquibase; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO liquibase; GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO liquibase;"