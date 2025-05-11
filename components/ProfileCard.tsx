//file path :-ai-saas-antonio-main/components/ProfileCard.tsx
import React from "react";

// components/ProfileCard.jsx
export default function ProfileCard({ user }) {
    return (
      <div className="profile-card">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  }
  