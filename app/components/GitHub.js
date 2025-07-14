import React, { useState } from 'react';
import SearchUser from './SearchUser';
import UserInfo from './UserInfo';

const GitHub = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const updateRepos = (reposData) => {
    setRepos(reposData);
  };

  return (
    <div className="container">
      <SearchUser 
        updateUser={updateUser}
        updateRepos={updateRepos}
      />
      <UserInfo
        user={user}
        repos={repos}
      />
    </div>
  );
};

export default GitHub;