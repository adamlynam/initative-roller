var React = require('react');
var ReactDOM = require('react-dom');

var ChooseActions = require('./renderers/choose-actions');
var ActionPool = require('./renderers/action-pool');
var Log = require('./renderers/log');

var Roller = React.createClass({
	getInitialState: function() {
		return {
            nextActionKey: 0,
            actionPool: new Map(),
            nextLogKey: 0,
            log: []
		};
	},
	
	addToActionPool: function(action) {
		this.setState((previousState, currentProps) => {
			var actionPool = new Map(previousState.actionPool);
            var key = previousState.nextActionKey;
			actionPool.set(previousState.nextActionKey, action);
			return {
                nextActionKey: previousState.nextActionKey + 1,
				actionPool: actionPool,
			};
		});
	},
	removeFromActionPool: function(actionPoolKey) {
		this.setState((previousState, currentProps) => {
			var actionPool = new Map(previousState.actionPool);
            actionPool.delete(actionPoolKey);
			return {
				actionPool: actionPool,
			};
		});
	},
    emptyActionPool: function(actionPoolKey) {
		this.setState((previousState, currentProps) => {
			return {
				actionPool: new Map(),
			};
		});
	},
	appendToLog: function(logText) {
		this.setState((previousState, currentProps) => {
			return {
                nextLogKey: previousState.nextLogKey + 1,
				log: [...previousState.log, {key: previousState.nextLogKey, text: logText}],
			};
		});
	},
    rollActionPool: function() {
        var rolledResult = Array.from(this.state.actionPool).map(([key, action]) => {
            return Math.ceil(Math.random() * action.dice);
        });
        this.appendToLog("Rolled [" + rolledResult + "] = " + rolledResult.reduce((prevVal, value) => {return prevVal + value}, 0));
        this.emptyActionPool();
	},
    
	render: function() {
		return <div>
            <ChooseActions addToActionPool={this.addToActionPool} />
            <ActionPool actionPool={this.state.actionPool} removeFromActionPool={this.removeFromActionPool} rollActionPool={this.rollActionPool} />
            <Log log={this.state.log} />
		</div>;
	}
});

ReactDOM.render(
	<Roller />,
	document.getElementById('content')
);
