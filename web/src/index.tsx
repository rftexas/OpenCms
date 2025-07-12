import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { App } from './App';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AnonymousLogin } from './authentication/login';
import ProtectedRoute from './authentication/protected-route';

let container = document.getElementById("app")!;
let root = createRoot(container)
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
        <Route path="/login" element={<AnonymousLogin />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
