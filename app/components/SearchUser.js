import React, { useState, useTransition } from 'react';
import PropTypes from 'prop-types';
import GitHubUserService from '../services/GitHubUserService';

const SearchUser = ({ updateUser, updateRepos }) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    
    if (!username.trim()) return;

    startTransition(async () => {
      try {
        setError(null);
        const [userResponse, reposResponse] = await Promise.all([
          GitHubUserService.getByUsername(username),
          GitHubUserService.getReposByUsername(username)
        ]);
        
        updateUser(userResponse.data);
        updateRepos(reposResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setError('Usuário não encontrado ou erro na busca. Tente novamente.');
      }
    });
  };

  return (
    <div className="card">
      <div className="card-body">
        <h1 className="card-title text-center mb-4">GitHub Info</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input 
              id="username"
              name="username"
              type="text" 
              className="form-control"
              placeholder="Ex: octocat"
              required
            />
          </div>
          <div className="d-grid">
            <button 
              className="btn btn-primary"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </button>
          </div>
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}
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