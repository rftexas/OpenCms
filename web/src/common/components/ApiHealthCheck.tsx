import React, { useState } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';

/**
 * API Health Check Component
 * 
 * Simple component to test API connectivity and verify the login endpoint
 * is reachable. Useful for debugging login issues.
 */
export const ApiHealthCheck: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const checkApiHealth = async () => {
        setStatus('loading');
        setMessage('');

        try {
            // First check if we can reach the API at all
            const response = await fetch('https://localhost:5001/api/authentication/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test', password: 'test' }),
            });

            if (response.status === 400 || response.status === 401) {
                // These are expected responses for invalid credentials
                setStatus('success');
                setMessage('✅ API is reachable! Login endpoint is responding.');
            } else if (response.ok) {
                setStatus('success');
                setMessage('✅ API is reachable and responding normally.');
            } else {
                setStatus('error');
                setMessage(`⚠️ API responded with status: ${response.status}`);
            }
        } catch (error) {
            setStatus('error');
            if (error instanceof TypeError && error.message.includes('fetch')) {
                setMessage('❌ Cannot connect to API. Make sure the .NET API is running on https://localhost:5001');
            } else {
                setMessage(`❌ Connection error: ${error}`);
            }
        }
    };

    const testLogin = async () => {
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('https://localhost:5001/api/authentication/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'testuser@example.com',
                    password: 'TestPassword123!'
                }),
            });

            console.log('Test login response:', response.status);
            const data = await response.json();
            console.log('Test login data:', data);

            if (response.ok) {
                setStatus('success');
                setMessage(`✅ Test login successful! User: ${data.firstName} ${data.lastName}`);
            } else {
                setStatus('error');
                setMessage(`❌ Login failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            setStatus('error');
            setMessage(`❌ Login test error: ${error}`);
        }
    };

    return (
        <Card className="m-3">
            <Card.Header>
                <h5>API Health Check</h5>
            </Card.Header>
            <Card.Body>
                <p className="text-muted">
                    Use this to verify API connectivity and test the login endpoint.
                </p>

                <div className="d-grid gap-2">
                    <Button
                        variant="outline-primary"
                        onClick={checkApiHealth}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Checking...' : 'Check API Health'}
                    </Button>

                    <Button
                        variant="outline-success"
                        onClick={testLogin}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Testing...' : 'Test Login (testuser@example.com)'}
                    </Button>
                </div>

                {message && (
                    <Alert
                        variant={status === 'success' ? 'success' : status === 'error' ? 'danger' : 'info'}
                        className="mt-3"
                    >
                        {message}
                    </Alert>
                )}

                <div className="mt-3">
                    <small className="text-muted">
                        <strong>Test Credentials:</strong><br />
                        Email: testuser@example.com<br />
                        Password: TestPassword123!
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
};
