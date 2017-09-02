var React = require('react');

module.exports = React.createClass({
	render: function() {
		return <div className="action-pool">
            <h3>Action Pool</h3>
            <ul>{Array.from(this.props.actionPool).map(([key, action]) => {
                return <li key={key} onClick={() => this.props.removeFromActionPool(key)}>
                    {action.name}
                </li>})}
            </ul>
            <input type="submit" value="Roll Initative" onClick={this.props.rollActionPool}/>
        </div>;
	}
});