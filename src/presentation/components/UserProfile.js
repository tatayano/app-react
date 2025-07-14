import React from 'react';

/**
 * UserProfile - Componente para exibir informações do usuário
 */
export const UserProfile = ({ user, stats, isLoading, fromCache }) => {
  if (!user) return null;

  return (
    <div className="row">
      <div className="col-md-4 mb-4">
        <div className="card">
          <div className="card-body text-center">
            <img 
              src={user.avatarUrl} 
              alt={`Avatar de ${user.login}`}
              className="rounded-circle mb-3 shadow"
              style={{ width: '120px', height: '120px' }}
            />
            <h4 className="card-title">{user.name || user.login}</h4>
            <p className="text-muted">@{user.login}</p>
            
            {user.bio && (
              <p className="card-text">{user.bio}</p>
            )}

            <div className="row text-center">
              <div className="col">
                <h6 className="mb-0">{user.formattedFollowers}</h6>
                <small className="text-muted">Seguidores</small>
              </div>
              <div className="col">
                <h6 className="mb-0">{user.formattedFollowing}</h6>
                <small className="text-muted">Seguindo</small>
              </div>
              <div className="col">
                <h6 className="mb-0">{user.formattedPublicRepos}</h6>
                <small className="text-muted">Repos</small>
              </div>
            </div>

            <div className="mt-3">
              <a 
                href={user.htmlUrl} 
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-github me-2"></i>
                Ver no GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">
              <i className="fas fa-info-circle me-2"></i>
              Informações Detalhadas
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              {user.company && (
                <div className="col-md-6 mb-3">
                  <strong><i className="fas fa-building me-2"></i>Empresa:</strong>
                  <br />
                  {user.company}
                </div>
              )}
              
              {user.location && (
                <div className="col-md-6 mb-3">
                  <strong><i className="fas fa-map-marker-alt me-2"></i>Localização:</strong>
                  <br />
                  {user.location}
                </div>
              )}
              
              {user.blog && (
                <div className="col-md-6 mb-3">
                  <strong><i className="fas fa-link me-2"></i>Website:</strong>
                  <br />
                  <a href={user.blog} target="_blank" rel="noopener noreferrer">
                    {user.blog}
                  </a>
                </div>
              )}
              
              {user.email && (
                <div className="col-md-6 mb-3">
                  <strong><i className="fas fa-envelope me-2"></i>Email:</strong>
                  <br />
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </div>
              )}
            </div>

            {user.formattedCreatedAt && (
              <div className="mt-3 pt-3 border-top">
                <small className="text-muted">
                  <i className="fas fa-calendar me-2"></i>
                  Membro desde {user.formattedCreatedAt}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};