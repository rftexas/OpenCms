import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router';
import { App } from './App';
import { AnonymousLogin } from './authentication/login';
import ProtectedRoute from './authentication/protected-route';
import ResetPasswordPage from './authentication/reset-password';
import { SmartDashboard, Unauthorized } from './common/components';
import OrganizationScreen from './organization/OrganizationScreen';
import { store } from './store/store';
import { SuperUserDashboard, SuperUserGuard, SuperUserLayout } from './super-user';

let container = document.getElementById("app")!;
let root = createRoot(container)
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
        <Route path="/login" element={<AnonymousLogin />} />

        {/* Password Reset Route */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Smart Dashboard - routes users to appropriate dashboard based on role */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SmartDashboard />
          </ProtectedRoute>
        } />

        {/* Unauthorized Access */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Super User Routes */}
        <Route path="/super-user" element={
          <ProtectedRoute>
            <SuperUserGuard>
              <SuperUserLayout />
            </SuperUserGuard>
          </ProtectedRoute>
        }>
          {/* Default route - Organization Management */}
          <Route index element={<SuperUserDashboard />} />
          <Route path="organizations" element={<SuperUserDashboard />} />

          {/* Audit and Monitoring - Placeholder for future implementation */}
          <Route path="audit" element={
            <div className="container-fluid p-4">
              <h2>System-Wide Audit Logs</h2>
              <p className="text-muted">Coming soon - comprehensive audit logging and monitoring interface</p>
            </div>
          } />

          {/* Platform Settings - Placeholder for future implementation */}
          <Route path="settings" element={
            <div className="container-fluid p-4">
              <h2>Platform Configuration</h2>
              <p className="text-muted">Coming soon - system-wide settings and configuration management</p>
            </div>
          } />
        </Route>

        {/* Future Role-Based Routes */}
        {/* 
        <Route path="/admin" element={<ProtectedRoute><AdminGuard><AdminLayout /></AdminGuard></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        
        <Route path="/investigator" element={<ProtectedRoute><InvestigatorGuard><InvestigatorLayout /></InvestigatorGuard></ProtectedRoute>}>
          <Route index element={<InvestigatorDashboard />} />
          <Route path="cases" element={<CaseManagement />} />
          <Route path="cases/:id" element={<CaseDetails />} />
        </Route>
        
        <Route path="/reviewer" element={<ProtectedRoute><ReviewerGuard><ReviewerLayout /></ReviewerGuard></ProtectedRoute>}>
          <Route index element={<ReviewerDashboard />} />
          <Route path="reviews" element={<ReviewManagement />} />
        </Route>
        */}

        {/* Organization Route */}
        <Route path="/organizations" element={<ProtectedRoute><OrganizationScreen /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
