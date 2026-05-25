import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TravelPlanFormPage from "./pages/TravelPlanFormPage";
import TravelPlanDetailPage from "./pages/TravelPlanDetailPage";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)" }}>
      {children}
    </main>
  </>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout><DashboardPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/plans/new" element={
            <PrivateRoute>
              <Layout><TravelPlanFormPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/plans/:id/edit" element={
            <PrivateRoute>
              <Layout><TravelPlanFormPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="/plans/:id" element={
            <PrivateRoute>
              <Layout><TravelPlanDetailPage /></Layout>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;