var React = require('react');

module.exports = React.createClass({
	render: function() {
		return <div className="log">
            <h3>Log</h3>
            <ul>{this.props.log.map(logItem => {
                return <li key={logItem.key}>
                    {logItem.text}
                </li>})}
            </ul>
        </div>;
	}
});