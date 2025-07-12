import { useSelector } from 'react-redux';
import './App.css';
import { useNavigate } from 'react-router';

export function App() {

  const authenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  if (!authenticated) {
    navigate('/login');
  }

  return (
    <>
      <h1>Parcel React App</h1>
      <p>Edit <code>src/App.tsx</code> to get started!</p>
    </>
  );
}
