import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitePage.css'; // Import the CSS file for styles

const InvitePage = () => {
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add logic to validate the invite code
    if (inviteCode) {
      navigate('/auth'); // Redirect to AuthPage if the invite code is valid
    }
  };

  return (
    <div className="invite-container">
      <div className="gradient-overlay"></div>
      <form onSubmit={handleSubmit} className="invite-form">
        <h2 className="invite-title">Enter Invite Code</h2>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Invite Code"
          className="invite-input"
          required
        />
        <button type="submit" className="invite-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default InvitePage; 