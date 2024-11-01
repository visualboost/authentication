

# Setup Guide for Docker Environment with MongoDB and Secrets

This guide provides the steps to set up the authentication service.
  
---  

## Prerequisites

1. **Docker Installation**: Docker must be installed.
2. **Docker Swarm**: Docker Swarm should be initialized, or it will be initialized in Step 1.

---  

## Setup Steps

### 1. Initialize Docker Swarm

Run the following command to initialize Docker Swarm (if not already initialized):

   ````bash
   docker swarm init 
   ```` 

### 2. Define Secrets

Add the following secrets to your swarm using the following command:

**Linux:**

````shell
printf "<secret_value>" | docker secret create <secret_name> -
````

**Windows: (CMD)**

````shell
echo|set /p="<secret_value>" | docker secret create <secret_name> -
````
> **Note:**
> This command prevents blank lines at the end of the secret but does not allow creating secrets with multiple lines. For multi-line secrets, the ``echo`` command can be used.

Use the following command to remove a secret:
````shell
docker secret rm <secret_name>.
````

<br>

#### a. encryption_key

Define and encryption key with the following format <32_char_string>_<16_char_string> <br> (**Example**: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX_XXXXXXXXXXXXXXXX).
The encryption key is used to encrypt and decrypt sensitive data (e.g. email addresses).

**Linux:**

````shell
printf "<your_encryption_key>" | docker secret create encryption_key -
````

**Windows: (CMD)**

````shell
echo|set /p="<your_encryption_key>" | docker secret create encryption_key -
````

> **Important Notes**:
> - The encrypt key won't be used to hash passwords.
> - Using secret files is **not recommended for production**. Instead, create secrets directly with the `docker secret create` command.

<br>

#### b. auth_token_secret

The secret for creating and verifying JWT authentication tokens

**Linux:**

````shell
printf "<your_auth_token_secret>" | docker secret create auth_token_secret -
````

**Windows: (CMD)**

````shell
echo|set /p="<your_auth_token_secret>" | docker secret create auth_token_secret -
````

<br>

#### c. refresh_token_secret

The secret for creating and verifying JWT refresh tokens

**Linux:**

````shell
printf "<your_refresh_token_secret>" | docker secret create refresh_token_secret -
````

**Windows: (CMD)**

````shell
echo|set /p="<your_refresh_token_secret>" | docker secret create refresh_token_secret -
````

<br>

#### d. mail_config

Email configuration parameters.

````shell
printf "MAIL_HOST=<smtp_host>\nMAIL_PORT=<smtp_port>\nMAIL_USER=<mail_user>\nMAIL_PW=<mail_password>" | docker secret create mail_config -
````

**Windows: (CMD)**

````shell
(echo MAIL_HOST=<smtp_host>& echo MAIL_PORT=<smtp_port>& echo MAIL_USER=<mail_user>& echo MAIL_PW=<mail_password>) | docker secret create mail_config -
````
> **Note:**
> Use ``echo`` allows us to create a multiline secret.

<br>

#### e. mongo_port

Port used by the MongoDB instance. Default should be `40901`. Any changes require also updates in `docker-compose.yml` and `mongod.conf`.

**Linux:**

````shell
printf "40901" | docker secret create mongo_port -
````

**Windows: (CMD)**

````shell
echo|set /p="40901" | docker secret create mongo_port -
````

<br>

#### f. mongo_user

MongoDB username.

**Linux:**

````shell
printf "Admin" | docker secret create mongo_user -
````

**Windows: (CMD)**

````shell
echo|set /p="Admin" | docker secret create mongo_user -
````

<br>

#### g. mongo_password

MongoDB password.

**Linux:**

````shell
printf "<your_db_secret>" | docker secret create mongo_password -
````

**Windows: (CMD)**

````shell
echo|set /p="<your_db_secret>" | docker secret create mongo_password -
````


### 3. Define Configurations (Optional)

Configurations are localed in `./config/configuration.conf`.

- ``PROTOCOL`` : `HTTP` or `HTTPS`.
- ``DOMAIN`` : The domain of the application, .e.g. _localhost_ or _mydomain.com_.
- ``PORT_FRONTEND`` : The port of the react application, .e.g. **80** or **443**. Changes require updates in `docker-compose.yml`, `nginx.conf`, and `configuration.conf`.
- ``PORT_BACKEND`` : The port of the nodejs application. The default value is **40900**. Changes require updates in `configuration.conf` and `docker-compose.yml`.
- ``PROXY_BACKEND_ROUTE`` : The route to reach the backend service. The default value is `/api`. Changes require updates in `configuration.conf` and `docker-compose.yml` (Traefik).
- ``PROXY_BACKEND_PORT`` : The port to reach the backend service, .e.g.  **80** or **443**. The default value is `80`. Changes require updates in `configuration.conf` and `docker-compose.yml` (Traefik).

### 4. Define Mongo Replica Key

The key of for the mongodb replica set. A key's length must be between 6 and 1024 characters and may only contain characters in the base64 set.

### 4. Add an email address for Let's Encrypt

Add a valid email address to the ``traefix`` service in the ``docker-compose.yml`` file to automatically create a Let's Encrypt certificate during startup.

````yaml
  traefik:
    image: traefik:v2.9
    ...

    # Letsencrypt certificate for ssl connection
    - "--certificatesresolvers.sslresolver.acme.tlschallenge=true"
    - "--certificatesresolvers.sslresolver.acme.email=${<your_email>}" <-- Your email
    - "--certificatesresolvers.sslresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "443:443"
    ...
````

### 6. Run Docker Containers

Start the application with the following command:

````bash  
  docker stack deploy --compose-file docker-compose.yml authentication_stack
````