var React = require('react');

const Actions = require('../data/actions');

module.exports = React.createClass({
	render: function() {
		return <div className="action-choices">
            <h3>Actions</h3>
            <ul>{Object.keys(Actions).map(key => Actions[key]).map(action => {
                return <li key={action.name} onClick={() => this.props.addToActionPool(action)}>
                    (d{action.dice}) {action.name}
                </li>})}
            </ul>
        </div>;
	}
});