import React from 'react';

/**
 * ErrorBoundary - Captura erros JavaScript na árvore de componentes
 * e exibe uma UI de fallback em vez de quebrar a aplicação
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Pode usar um serviço de logging de erros aqui
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="text-center mb-4">
                <i className="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
                <h2>Ops! Algo deu errado</h2>
                <p className="text-muted">
                  Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
                </p>
              </div>

              <div className="d-flex justify-content-center gap-2 mb-4">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-refresh me-2"></i>
                  Recarregar Página
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={this.handleReset}
                >
                  <i className="fas fa-undo me-2"></i>
                  Tentar Novamente
                </button>
              </div>

              {/* Detalhes técnicos (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="fas fa-bug me-2"></i>
                      Detalhes do Erro (Desenvolvimento)
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Erro:</strong>
                      <pre className="bg-light p-2 mt-1 small">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="bg-light p-2 mt-1 small" style={{ fontSize: '0.7rem' }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}