var React = require('react');

const Actions = require('../data/actions');

module.exports = React.createClass({
	render: function() {
		return <div className="name-choice">
            <h3>Name</h3>
            <input type="text" value={this.props.name} onChange={event => this.props.setName(event.target.value)} />
        </div>;
	}
});