import React, { useState } from "react";
import { Button, Card, Container, Form, Modal, Row, Toast } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/hooks/redux";
import { loginUser } from "../store/slices/authSlice";

export const AnonymousLogin: React.FC = () => {
    const [showForgot, setShowForgot] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showError, setShowError] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Show toast error if invalid credentials from backend
    const { error: authError, isAuthenticated, isLoading } = useAppSelector(s => s.auth);

    React.useEffect(() => {
        if (authError) {
            setShowError(authError);
        }
    }, [authError]);

    // Redirect on successful authentication
    React.useEffect(() => {
        if (isAuthenticated) {
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Show error if either field is empty
        if (!email.trim() && !password.trim()) {
            setShowError("Please enter both email and password.");
            return;
        }
        if (!email.trim()) {
            setShowError("Please enter your email address.");
            return;
        }
        if (!password.trim()) {
            setShowError("Please enter your password.");
            return;
        }

        // Clear any existing errors
        setShowError('');

        // Dispatch login action
        const result = await dispatch(loginUser({ email, password, rememberMe }));

        // Handle any additional login logic if needed
        if (loginUser.rejected.match(result)) {
            // Error will be shown via the authError useEffect
            console.log('Login failed:', result.payload);
        }
    };

    return (
        <>
            <Container>
                <Toast
                    onClose={() => setShowError('')}
                    show={!!showError}
                    className="position-fixed top-0 end-0 m-3"
                    bg="danger"
                    autohide={true}
                    delay={3000}
                >
                    <Toast.Body>
                        <div className="text-center text-white">
                            <p className="mb-0">{showError}</p>
                        </div>
                    </Toast.Body>
                </Toast>

                <Row className="justify-content-center" style={{ marginTop: "60px" }}>
                    <Card style={{ maxWidth: 400, borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <div
                                    className="login-logo mb-2"
                                    style={{
                                        fontSize: "2.5rem",
                                        fontWeight: "bold",
                                        color: "#0d6efd",
                                        letterSpacing: "1px",
                                    }}
                                >
                                    OpenCMS
                                </div>
                                <div className="text-muted">Sign in to your account</div>
                            </div>

                            <Form onSubmit={handleLogin}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="username"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </Form.Group>

                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    <Form.Check
                                        type="checkbox"
                                        id="rememberMe"
                                        label="Remember me"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                </div>


                                <Button type="submit" variant="primary" className="w-100" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                                <div className="mb-3 d-flex justify-content-between align-items-right mt-3">
                                    <Button
                                        variant="link"
                                        className="p-0"
                                        style={{ fontSize: "0.95em" }}
                                        onClick={() => setShowForgot(true)}
                                    >
                                        Forgot password?
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Row>
            </Container>
            <ForgotPasswordModal show={showForgot} onClose={() => setShowForgot(false)} />
        </>
    );
};

type ForgotPasswordModalProps = {
    show: boolean;
    onClose: () => void;
};

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
    const [resetEmail, setResetEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add your password reset logic here
        console.log("Reset email:", resetEmail);
        onClose();
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Reset Password</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Enter your email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="you@company.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            id="resetEmail"
                        />
                    </Form.Group>
                    <div className="text-muted" style={{ fontSize: "0.95em" }}>
                        We'll send you a link to reset your password.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Send Reset Link
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};