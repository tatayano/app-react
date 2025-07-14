import React from 'react';

/**
 * Analytics - Componente para exibir análises dos repositórios
 */
export const Analytics = ({ analytics, user, repositories, stats }) => {
  if (!analytics) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
        <h4>Analytics não disponível</h4>
        <p className="text-muted">Não foi possível gerar análises para este usuário.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="fas fa-chart-bar me-2"></i>
          Analytics de {user?.login}
        </h4>
      </div>

      <div className="row">
        {/* Overview */}
        <div className="col-md-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="fas fa-eye me-2"></i>
                Visão Geral
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h5 className="text-primary">{analytics.overview?.totalRepositories || 0}</h5>
                  <small className="text-muted">Total de Repositórios</small>
                </div>
                <div className="col-md-3">
                  <h5 className="text-success">{analytics.overview?.originalRepositories || 0}</h5>
                  <small className="text-muted">Repositórios Originais</small>
                </div>
                <div className="col-md-3">
                  <h5 className="text-info">{analytics.overview?.forkedRepositories || 0}</h5>
                  <small className="text-muted">Repositórios Forkados</small>
                </div>
                <div className="col-md-3">
                  <h5 className="text-warning">{analytics.languages?.total || 0}</h5>
                  <small className="text-muted">Linguagens Usadas</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Languages */}
        {analytics.languages && (
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">
                  <i className="fas fa-code me-2"></i>
                  Linguagens Mais Usadas
                </h6>
              </div>
              <div className="card-body">
                {analytics.languages.distribution?.slice(0, 5).map((lang, index) => (
                  <div key={lang.language} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>{lang.language}</span>
                      <small className="text-muted">{lang.repositories} repos ({lang.percentage}%)</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${lang.percentage}%`,
                          backgroundColor: getLanguageColor(lang.language) 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity */}
        {analytics.activity && (
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">
                  <i className="fas fa-clock me-2"></i>
                  Atividade
                </h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <h6 className="text-success">{analytics.activity.activeRepositories}</h6>
                    <small className="text-muted">Repos Ativos</small>
                  </div>
                  <div className="col-6 mb-3">
                    <h6 className="text-muted">{analytics.activity.inactiveRepositories}</h6>
                    <small className="text-muted">Repos Inativos</small>
                  </div>
                  <div className="col-6">
                    <h6 className="text-primary">{analytics.activity.newRepositories}</h6>
                    <small className="text-muted">Repos Novos</small>
                  </div>
                  <div className="col-6">
                    <h6 className="text-info">{analytics.activity.activityPercentage}%</h6>
                    <small className="text-muted">Taxa de Atividade</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popularity */}
        {analytics.popularity && (
          <div className="col-md-12 mb-4">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">
                  <i className="fas fa-star me-2"></i>
                  Popularidade
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <h5 className="text-warning">{analytics.popularity.totalStars}</h5>
                    <small className="text-muted">Total de Estrelas</small>
                  </div>
                  <div className="col-md-4 text-center">
                    <h5 className="text-info">{analytics.popularity.totalForks}</h5>
                    <small className="text-muted">Total de Forks</small>
                  </div>
                  <div className="col-md-4 text-center">
                    <h5 className="text-primary">{analytics.popularity.averageStars}</h5>
                    <small className="text-muted">Média de Estrelas</small>
                  </div>
                </div>

                {analytics.popularity.topRepositories?.length > 0 && (
                  <div className="mt-4">
                    <h6>Top Repositórios</h6>
                    <div className="list-group list-group-flush">
                      {analytics.popularity.topRepositories.slice(0, 3).map((repo, index) => (
                        <div key={repo.name} className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <div>
                            <strong>{repo.name}</strong>
                            {repo.language && (
                              <span className="badge bg-light text-dark ms-2">{repo.language}</span>
                            )}
                          </div>
                          <div>
                            <span className="badge bg-warning me-1">
                              <i className="fas fa-star me-1"></i>
                              {repo.stars}
                            </span>
                            <span className="badge bg-info">
                              <i className="fas fa-code-branch me-1"></i>
                              {repo.forks}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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