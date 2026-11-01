import React from 'react';
import UserProfile from './UserProfile';

export const Profile: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return <UserProfile onClose={onClose} />;
};

export default Profile;
