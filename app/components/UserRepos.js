import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const UserRepos = ({ repos }) => {
  const [reposCount, setReposCount] = useState(0);
  const [sortBy, setSortBy] = useState('stars');

  useEffect(() => {
    setReposCount(repos.length);
  }, [repos]);

  // Com React 19, o compilador otimiza automaticamente, mas mantemos useMemo para clareza
  const sortedRepos = useMemo(() => {
    const sorted = [...repos].sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.updated_at) - new Date(a.updated_at);
        default:
          return 0;
      }
    });
    return sorted;
  }, [repos, sortBy]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (repos.length === 0) {
    return (
      <div className="text-center">
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          Nenhum repositório encontrado.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-code-branch me-2"></i>
          {reposCount} repositório{reposCount !== 1 ? 's' : ''}
        </h2>
        <div className="form-group">
          <select 
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="stars">Mais estrelas</option>
            <option value="name">Nome (A-Z)</option>
            <option value="updated">Mais recente</option>
          </select>
        </div>
      </div>

      <div className="row">
        {sortedRepos.map((repo) => (
          <div key={repo.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title text-truncate me-2" title={repo.name}>
                    <i className="fas fa-book me-1"></i>
                    {repo.name}
                  </h5>
                  <span className="badge bg-primary">
                    <i className="fas fa-star me-1"></i>
                    {repo.stargazers_count}
                  </span>
                </div>
                
                <p className="card-text text-muted small flex-grow-1">
                  {repo.description || 'Sem descrição disponível'}
                </p>

                <div className="mb-3">
                  <div className="d-flex justify-content-between text-muted small">
                    <span>
                      <i className="fas fa-code me-1"></i>
                      {repo.language || 'N/A'}
                    </span>
                    <span>
                      <i className="fas fa-calendar me-1"></i>
                      {formatDate(repo.updated_at)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mt-1">
                    <span>
                      <i className="fas fa-code-branch me-1"></i>
                      {repo.forks_count} forks
                    </span>
                    <span>
                      <i className="fas fa-eye me-1"></i>
                      {repo.watchers_count} watchers
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="btn-group w-100" role="group">
                    <a 
                      href={repo.html_url} 
                      className="btn btn-primary btn-sm" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Ver repositório"
                    >
                      <i className="fas fa-external-link-alt me-1"></i>
                      Código
                    </a>
                    <a 
                      href={`${repo.html_url}/issues`} 
                      className="btn btn-outline-secondary btn-sm" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Ver issues"
                    >
                      <i className="fas fa-bug me-1"></i>
                      Issues
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

UserRepos.propTypes = {
  repos: PropTypes.array.isRequired
};

export default UserRepos;