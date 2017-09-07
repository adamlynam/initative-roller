var React = require('react');

module.exports = React.createClass({
	render: function() {
		return <div className="log">
            <h3>Log</h3>
            <div>{Array.from(this.props.log).reverse().map(logItem => {
                return <p key={logItem.key}>{logItem.text}</p>})}
            </div>
        </div>;
	}
});