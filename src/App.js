import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import MapView from './MapView.jsx';
import AuthForm from './Login.jsx';



function App() {

  return (
    <Router>
       <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/dashboard" element={<MapView />} />
      </Routes>
      </Router>
  );
}

export default App;
