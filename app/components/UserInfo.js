import React from 'react';
import PropTypes from 'prop-types';
import UserRepos from './UserRepos';

const UserInfo = ({ user, repos }) => {
  if (!user) return null;

  return (
    <div className="row">
      <div className="col-lg-4">
        <img 
          src={user.avatar_url} 
          alt={`Avatar de ${user.login}`} 
          className="rounded-circle" 
          height="140" 
          width="140" 
        />
        <h2>{user.login}</h2>
        <p>{user.name}</p>
        <p>Followers: {user.followers} / Following: {user.following}</p>
        <p>
          <a 
            href={user.html_url} 
            className="btn btn-default"
            target="_blank" 
            rel="noopener noreferrer"
          >
            View Details
          </a>
        </p>
      </div>
      <div className="col-lg-8">
        <UserRepos repos={repos} />
      </div>
    </div>
  );
};

UserInfo.propTypes = {
  user: PropTypes.object,
  repos: PropTypes.array
};

export default UserInfo;
		