import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Form, Button } from "react-bootstrap";
import { WiDaySunny } from "react-icons/wi";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "user" && password === "1234") {
      onLogin();
    } else {
      alert("Invalid credentials. Try user/1234");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: 'linear-gradient(to right, #00c6ff, #0072ff)',
      }}
    >
      <Card className="p-4 shadow-lg rounded" style={{ width: '350px', position: 'relative' }}>
        {/* Weather Icon */}
        <div className="text-center mb-3" style={{ fontSize: '3rem', color: '#ffdd00' }}>
          <WiDaySunny />
        </div>

        <h3 className="text-center mb-4" style={{ fontWeight: '700', color: '#333' }}>Weather App Login</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Control
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow-sm"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formPassword">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm"
              required
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2"
            style={{
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            Login
          </Button>
        </Form>

        {/* Optional footer */}
        <div className="mt-3 text-center text-muted" style={{ fontSize: '0.85rem' }}>
          Use username: <strong>user</strong> | Password: <strong>1234</strong>
        </div>

        {/* Cloud animation */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-30px',
          fontSize: '5rem',
          color: 'rgba(255,255,255,0.3)',
          animation: 'floatCloud 6s ease-in-out infinite alternate'
        }}>
          ☁️
        </div>
      </Card>

      <style>{`
        @keyframes floatCloud {
          0% { transform: translateY(0px) }
          100% { transform: translateY(20px) }
        }
      `}</style>
    </div>
  );
}

export default Login;
