import React, { useState } from "react";
import { Button, Card, Container, Form, Toast } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";

const ResetPasswordPage: React.FC = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const initialEmail = params.get("email") || "";
    const initialToken = params.get("token") || "";
    const [email, setEmail] = useState(initialEmail);
    const [token, setToken] = useState(initialToken);
    const [newPassword, setNewPassword] = useState("");
    const [showError, setShowError] = useState("");
    const [showSuccess, setShowSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowError("");
        setShowSuccess("");
        setIsLoading(true);
        try {
            const response = await fetch("https://localhost:5001/api/authentication/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, newPassword })
            });
            if (response.ok) {
                setShowSuccess("Your password has been reset. You may now log in.");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                const data = await response.json();
                setShowError(data.message || "Failed to reset password.");
            }
        } catch (err) {
            setShowError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Toast
                onClose={() => setShowError("")}
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
            <Toast
                onClose={() => setShowSuccess("")}
                show={!!showSuccess}
                className="position-fixed top-0 end-0 m-3"
                bg="success"
                autohide={true}
                delay={3000}
            >
                <Toast.Body>
                    <div className="text-center text-white">
                        <p className="mb-0">{showSuccess}</p>
                    </div>
                </Toast.Body>
            </Toast>
            <Card style={{ maxWidth: 400, margin: "60px auto", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <div className="login-logo mb-2" style={{ fontSize: "2rem", fontWeight: "bold", color: "#0d6efd" }}>
                            Reset Password
                        </div>
                        <div className="text-muted">Enter the code from your email and set a new password.</div>
                    </div>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Reset Token</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Paste your reset code here"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ResetPasswordPage;
