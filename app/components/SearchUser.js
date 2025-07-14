import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import GitHubUserService from '../services/GitHubUserService';

const SearchUser = ({ updateUser, updateRepos }) => {
  const usernameRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current.value;
    
    if (!username.trim()) return;

    try {
      const [userResponse, reposResponse] = await Promise.all([
        GitHubUserService.getByUsername(username),
        GitHubUserService.getReposByUsername(username)
      ]);
      
      updateUser(userResponse.data);
      updateRepos(reposResponse.data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  return (
    <div className="jumbotron">
      <h1>GitHub Info</h1>
      <div className="row">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              className="form-control"
              placeholder="Ex: octocat"
              ref={usernameRef}
            />
          </div>
          <button 
            className="btn btn-primary"
            type="submit"
          >
            Buscar
          </button>
        </form>
      </div>
    </div>
  );
};

SearchUser.propTypes = {
  updateUser: PropTypes.func.isRequired,
  updateRepos: PropTypes.func.isRequired
};

export default SearchUser;