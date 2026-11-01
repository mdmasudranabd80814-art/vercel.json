import React from 'react';
import UserProfile from '../components/UserProfile';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
        <UserProfile />
      </div>
    </div>
  );
}
