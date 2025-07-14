import React from 'react';

/**
 * RepositoryList - Componente para listar repositórios
 */
export const RepositoryList = ({ repositories, totalRepositories, isLoading, fromCache }) => {
  if (!repositories || repositories.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-code-branch fa-3x text-muted mb-3"></i>
        <h4>Nenhum repositório encontrado</h4>
        <p className="text-muted">Este usuário não possui repositórios públicos.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="fas fa-code-branch me-2"></i>
          Repositórios ({repositories.length})
        </h4>
        {fromCache && (
          <span className="badge bg-info">
            <i className="fas fa-database me-1"></i>
            Cache
          </span>
        )}
      </div>

      <div className="row">
        {repositories.map(repo => (
          <div key={repo.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title">
                  <a 
                    href={repo.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    {repo.name}
                  </a>
                  {repo.isFork && (
                    <span className="badge bg-secondary ms-2">Fork</span>
                  )}
                </h6>
                
                {repo.description && (
                  <p className="card-text text-muted small">
                    {repo.description}
                  </p>
                )}

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-3">
                    {repo.language && (
                      <small className="text-muted">
                        <i className="fas fa-circle me-1" style={{ color: getLanguageColor(repo.language) }}></i>
                        {repo.language}
                      </small>
                    )}
                    
                    <small className="text-muted">
                      <i className="fas fa-star me-1"></i>
                      {repo.formattedStars}
                    </small>
                    
                    <small className="text-muted">
                      <i className="fas fa-code-branch me-1"></i>
                      {repo.formattedForks}
                    </small>
                  </div>

                  {repo.isActiveRepository && (
                    <span className="badge bg-success">Ativo</span>
                  )}
                </div>

                {repo.formattedUpdatedAt && (
                  <small className="text-muted d-block mt-2">
                    Atualizado em {repo.formattedUpdatedAt}
                  </small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Retorna cor para linguagem de programação
 */
const getLanguageColor = (language) => {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#239120',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#fa7343',
    'Kotlin': '#F18E33',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Vue': '#2c3e50',
    'React': '#61dafb'
  };
  
  return colors[language] || '#586069';
};