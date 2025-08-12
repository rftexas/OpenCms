import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import './App.css';
import { useAppDispatch } from './store/hooks/redux';
import { validateToken } from './store/slices/authSlice';

export function App() {
  const { isAuthenticated, isLoading, token } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Check for existing token on app startup
  React.useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (storedToken && !isAuthenticated) {
      dispatch(validateToken(storedToken));
    }
  }, [dispatch, isAuthenticated]);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">OpenCms</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/organizations">Organizations</Nav.Link>
              {/* Add other navigation links here */}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <h1>Parcel React App</h1>
      <p>Edit <code>src/App.tsx</code> to get started!</p>
    </>
  );
}
