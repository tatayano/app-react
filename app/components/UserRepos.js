import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const UserRepos = ({ repos }) => {
  const [reposCount, setReposCount] = useState(0);

  useEffect(() => {
    setReposCount(repos.length);
  }, [repos]);

  const reposList = repos.map((repo) => (
    <div key={repo.id} className="thumbnail">
      <div className="caption">	
        <h3>
          {repo.name}
          <span className="badge">{repo.stargazers_count} STARS</span>
        </h3>
        <p>{repo.description || 'Sem descrição disponível'}</p>
        <p>
          <a 
            href={repo.html_url} 
            className="btn btn-primary" 
            role="button"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Repository
          </a>
          <a 
            href={`${repo.html_url}/issues`} 
            className="btn btn-default" 
            role="button"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Issues
          </a>
        </p>
      </div>
    </div>
  ));

  return (
    <div>
      <h2>{reposCount} repositórios</h2>
      {reposList}
    </div>
  );
};

UserRepos.propTypes = {
  repos: PropTypes.array.isRequired
};

export default UserRepos;