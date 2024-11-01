

# Setup Guide for Docker Environment with MongoDB and Secrets

This guide provides the steps to set up the authentication service.
  
---  

### Prerequisites

1. **Docker Installation**: Docker must be installed.
2. **Docker Swarm**: Docker Swarm should be initialized, or it will be initialized in Step 1.

---  

## Setup Steps

### 1. Initialize Docker Swarm

Run the following command to initialize Docker Swarm (if not already initialized):

   ````bash
   docker swarm init 
   ```` 

### 2. Define Secrets and Configuration

#### Secrets:

Secrets are localed in `./config/secrets`.

- ``encryption_key.conf`` : Define and encryption key with the following format <32_char_string>_<16_char_string> <br> (**Example**: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX_XXXXXXXXXXXXXXXX).
  The encryption key is used to encrypt and decrypt sensitive data (e.g. email addresses).

> **Important Notes**:
> - The encrypt key won't be used to hash passwords.
> - Using secret files is **not recommended for production**. Instead, create secrets directly with the `docker secret create` command.

- ``auth_token_secret.conf`` : The secret for creating and verifying JWT authentication tokens
- ``refresh_token_secret.conf`` : The secret for creating and verifying JWT refresh tokens
- ``mail_config.conf``: Email configuration parameters
- ``mongo_port.conf``: Port used by the MongoDB instance. Any changes require also updates in `docker-compose.yml` and `mongod.conf`.
- ``mongo_user.conf``: MongoDB username
- ``mongo_password.conf``: MongoDB password

#### Configurations (Optional)

Configurations are localed in `./config/configuration.conf`.

- ``PROTOCOL`` : `HTTP` or `HTTPS`.
- ``DOMAIN`` : The domain of the application, .e.g. _localhost_ or _mydomain.com_.
- ``PORT_FRONTEND`` : The port of the react application, .e.g. **80** or **443**. Changes require updates in `docker-compose.yml`, `nginx.conf`, and `configuration.conf`.
- ``PORT_BACKEND`` : The port of the nodejs application. The default value is **40900**. Changes require updates in `configuration.conf` and `docker-compose.yml`.
- ``PROXY_BACKEND_ROUTE`` : The route to reach the backend service. The default value is `/api`. Changes require updates in `configuration.conf` and `docker-compose.yml` (Traefik).
- ``PROXY_BACKEND_PORT`` : The port to reach the backend service, .e.g.  **80** or **443**. The default value is `80`. Changes require updates in `configuration.conf` and `docker-compose.yml` (Traefik).

#### Mongo Replica Key

The key of for the mongodb replica set. A key's length must be between 6 and 1024 characters and may only contain characters in the base64 set.

### 3. Run Docker Containers

Start the application with the following command:

````bash  
  docker-compose up 
````