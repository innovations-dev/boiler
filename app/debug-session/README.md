# Session Debugging Tools

This directory contains tools for debugging Better-Auth sessions in the application. These tools are designed to help diagnose session-related issues and provide insights into how the authentication system is working.

## Components

### 1. Session Test Dashboard (`session-test-client.tsx`)

A client-side React component that provides a real-time dashboard for testing session validation. Features include:

- Testing multiple session validation endpoints
- Displaying session status, cookie information, and session details
- Support for multi-session information
- Real-time refreshing of session data

### 2. Server-Side Session Debug (`session-debug-server.tsx`)

A server component that displays session information retrieved directly on the server. This component:

- Shows session validation status
- Displays user and session details
- Lists headers and cookies
- Shows multi-session information when available

## API Endpoints

### 1. Auth Debug Endpoint (`/api/auth-debug`)

A comprehensive endpoint that uses Better-Auth's native methods to retrieve and display session information:

- Session validation status
- Cookie information
- Header details
- Multi-session data

### 2. Auth Inspect Endpoint (`/api/auth-inspect`)

Shows detailed information about the Better-Auth session structure.

### 3. Auth Test Endpoint (`/api/auth-test`)

Tests session validation using Better-Auth methods.

## Utility Functions

The `lib/auth/debug-session.ts` file contains utility functions for session debugging:

- `debugSession()`: Retrieves comprehensive session information using Better-Auth's native methods
- `getDebugCookieInfo()`: Extracts and formats cookie information from request headers

## Usage

1. Navigate to `/debug-session` in your browser to access the debugging dashboard
2. Use the client-side dashboard to test session validation in real-time
3. View server-side session information for a more direct view of the session state
4. Access the API endpoints directly for raw session data

## Security Considerations

These debugging tools should be disabled or protected in production environments. They are intended for development and testing purposes only.

## Troubleshooting Common Issues

### Session Cookie Present but Session Not Valid

This can occur due to:

- Expired session token
- Invalid session token format
- Session revoked on the server
- Cross-domain cookie issues

### Session Valid in Middleware but Not in Components

This might be caused by:

- Different validation methods being used
- Headers not being properly passed
- Cookie access differences between middleware and components

### Multi-Session Issues

If multi-session functionality isn't working:

- Ensure the Better-Auth version supports multi-sessions
- Check that the API is properly configured
- Verify that the session token has the necessary permissions
