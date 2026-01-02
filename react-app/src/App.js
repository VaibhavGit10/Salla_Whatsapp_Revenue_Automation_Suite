import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Components/Sidebar';

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/flows" element={<div>Automations</div>} />
          <Route path="/logs" element={<div>History Logs</div>} />
          <Route path="/settings" element={<div>API Settings</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
