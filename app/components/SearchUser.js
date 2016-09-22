var React = require('react');
var GitHubUserService = require('../services/GitHubUserService');

var SearchUser = React.createClass({
	handleSubmit: function(e){
		e.preventDefault();
		GitHubUserService.getByUsername(this.refs.username.value)
			.then(function(response){
				this.props.updateUser(response.data);
			}.bind(this));

		GitHubUserService.getReposByUsername(this.refs.username.value)
			.then(function(response){
				this.props.updateRepos(response.data);
			}.bind(this));
	},
	render: function(){
		return (
			<div className="jumbotron">
				<h1>GitHub info</h1>
				<div className="row">
					<form onSubmit={this.handleSubmit}>
						<div className="form-group">
							<label htmlFor="">Username</label>
							<input 
								type="text" 
								className="form-control"
								placeholder="Ex: Tata"
								ref="username"
								/>
						</div>
						<button 
							className="btn btn-primary"
							type="submit"
							>Buscar</button>
					</form>
				</div>
			</div>
		);
	}
});

SearchUser.propTypes = {
    updateUser: React.PropTypes.func.isRequired,
    updateRepos: React.PropTypes.func.isRequired
};

module.exports = SearchUser;