// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout            from './components/Layout';
import Home              from './pages/Home';
import About             from './pages/About';
import Profile           from './pages/Profile';
import Dashboard         from './pages/Dashboard';
import Reliability       from './pages/Reliability';
import { ChatProvider }  from './contexts/ChatContext';

function App() {
  return (
    <ChatProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="profile" element={<Profile />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reliability" element={<Reliability />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ChatProvider>
  );
}

export default App;
