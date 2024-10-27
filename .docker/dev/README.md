

# Setup Guide for Docker Environment with MongoDB and Secrets (Development)

This guide provides the steps to set up the authentication service for development.

> **Important Notes:** This setup should not be used only for development and not for production. 

### Prerequisites

1. **Docker Installation**: Docker must be installed.

---  

### 1. Configuration

The application is nearly fully preconfigured and ready for use. However, to ensure full functionality, please complete the email parameters by providing the following information:

- **SMTP Server Hostname**: Configure the `MAIL_HOST` variable with the SMTP server hostname.
- **SMTP Port**: Specify the SMTP port in the `MAIL_PORT` variable.
- **Email User**: Enter the email account username in the `MAIL_USER` variable.
- **Password**: Input the associated password in the `MAIL_PW` variable.

This configuration will enable the application to send emails.

### 2. Run Docker Containers

Start the application with the following command:

````bash  
  docker-compose up 
````

After the application starts successfully, the console will display: `HTTP: Listening on port 40900`.<br> 
The application can be accessed at http://localhost:80.<br> 
By default, the backend application runs on port `40900`, and the MongoDB instance runs on port `40901`.