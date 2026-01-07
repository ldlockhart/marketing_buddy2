import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignBuilder from './pages/CampaignBuilder';
import EmailEditor from './pages/EmailEditor';
import Audiences from './pages/Audiences';
import Revenue from './pages/Revenue';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/campaigns" element={
            <ProtectedRoute>
              <Layout>
                <Campaigns />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/campaigns/new" element={
            <ProtectedRoute>
              <CampaignBuilder />
            </ProtectedRoute>
          } />

          <Route path="/campaigns/:id/edit" element={
            <ProtectedRoute>
              <CampaignBuilder />
            </ProtectedRoute>
          } />

          <Route path="/editor" element={
            <ProtectedRoute>
              <EmailEditor />
            </ProtectedRoute>
          } />

          <Route path="/campaigns/:campaignId/editor" element={
            <ProtectedRoute>
              <EmailEditor />
            </ProtectedRoute>
          } />

          <Route path="/audiences" element={
            <ProtectedRoute>
              <Layout>
                <Audiences />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/revenue" element={
            <ProtectedRoute>
              <Layout>
                <Revenue />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
