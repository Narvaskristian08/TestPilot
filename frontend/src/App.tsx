import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { TestRunPage } from './pages/TestRunPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/test/:id" element={<TestRunPage />} />
      </Routes>
    </Router>
  );
}

export default App;
