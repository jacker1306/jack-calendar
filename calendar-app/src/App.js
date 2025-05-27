import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import UserCalendar from './components/UserCalendar';
import AdminCalendar from './components/AdminCalendar';
import Login from './components/Login';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppBarTitle() {
  const navigate = useNavigate();
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
      <Button onClick={() => navigate('/')} color="inherit" sx={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
        Lịch shoot fes của Jack
      </Button>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <AppBarTitle />
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<UserCalendar />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminCalendar />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
