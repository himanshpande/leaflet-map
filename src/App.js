import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import MapView from './MapView';
import Login from './Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <div>
      <div>
      {isLoggedIn ? (
        <MapView onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
    </div>
  );
}

export default App;
