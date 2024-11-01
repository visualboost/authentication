# Authentication Service (VisualBoost)

## Features
This authentication service includes a comprehensive set of features to manage user access and security, such as:

- **User Management**: Administrative tools to create, update, and manage users.
- **User Sign-In and Redirection**: Sign-in capabilities with automatic redirection to specified URLs.
- **Password Management**: Password reset functionality.
- **Two-Factor Authentication**: Security with two-factor authentication via email.
- **Blocking Capabilities**: Option to block specific email addresses and IPs.
- **Email Encryption**: Enhanced email security through encryption.
- **Role Management**: Assign roles and manage user permissions.
- **User Invitations**: Invite users via email.
- **Customizable Email Templates**: Dynamic templates for various email communications.

## Getting Started

To start the application, execute the Docker Compose file found in the `.docker` directory.

### Development

For local testing and development, navigate to the `.docker/dev` directory and follow the instructions in the `README.md` file located there.

### Testing

For minimal-effort testing in Swarm mode, go to the `.docker/test` directory and follow the instructions provided in its `README.md` file.

> **Important Note**: This setup is designed for testing only and should not be used in production, as secrets are not securely managed in this mode.

### Production

For a production-ready deployment, please refer to the instructions in the `README.md` file located in the `./docker/prod` directory.

## Customization Options

### Email Templates

The service uses customizable email templates for various user notifications and confirmations. You can replace these templates with your own versions as needed:

- **email_modified.html**: Confirmation email template when a user changes their email address. Includes placeholders `${username}` and `${confirmLink}`.
- **password_modified.html**: Template for confirmation email when a user changes their password. Contains placeholders `${username}` and `${confirmLink}`.
- **password_reset.html**: Template for password reset emails. Contains placeholders `${username}` and `${changePasswordLink}`.
- **registration.html**: Template for welcoming new users. Contains placeholders `${username}` and `${verificationLink}`.
- **two_factor.html**: Email template for two-factor authentication. Contains placeholders `${username}` and `${authCode}`.
- **user_invitation.html**: Template for inviting new users to the system. Contains placeholders `${username}` and `${inviteLink}`.
- **modification_expired.html**: Template displayed when a modification token has expired.

> **Note**: Templates containing "Link" placeholders must include these for the system to function correctly.

### Favicon

- **Required File Type**: SVG
- **Customization**: To use a custom favicon, add the volume mapping `"./favicon.svg:/usr/share/nginx/html/favicon.svg"` in the Docker Compose configuration for the React service.
