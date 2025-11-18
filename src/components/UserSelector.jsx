import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './UserSelector.css';

function UserSelector({ users, currentRecipient, onSelectUser, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(user =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, users]);

  const handleSelectUser = (username) => {
    onSelectUser(username);
    onClose();
  };

  return (
    <div className="user-selector-overlay" onClick={onClose}>
      <div className="user-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-selector-header">
          <h3>📟 SELECT RECIPIENT</h3>
          <button className="user-selector-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="user-selector-search">
          <input
            type="text"
            className="user-selector-search-input"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="user-selector-list">
          {filteredUsers.length === 0 ? (
            <div className="user-selector-empty">
              NO USERS FOUND
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.username}
                className={`user-selector-item ${
                  currentRecipient === user.username ? 'selected' : ''
                }`}
                onClick={() => handleSelectUser(user.username)}
              >
                <div className="user-selector-item-info">
                  <span className="user-selector-username">
                    {user.username}
                  </span>
                  <span
                    className={`user-selector-status ${
                      user.online ? 'online' : 'offline'
                    }`}
                  >
                    {user.online ? '● ONLINE' : '○ OFFLINE'}
                  </span>
                </div>
                {currentRecipient === user.username && (
                  <span className="user-selector-checkmark">✓</span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="user-selector-footer">
          <div className="user-selector-count">
            {filteredUsers.length} USER{filteredUsers.length !== 1 ? 'S' : ''} AVAILABLE
          </div>
        </div>
      </div>
    </div>
  );
}

UserSelector.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    username: PropTypes.string.isRequired,
    online: PropTypes.bool,
    lastSeen: PropTypes.string
  })).isRequired,
  currentRecipient: PropTypes.string,
  onSelectUser: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default React.memo(UserSelector);
