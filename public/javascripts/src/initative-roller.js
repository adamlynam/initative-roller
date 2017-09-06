var React = require('react');
var ReactDOM = require('react-dom');

var ChooseActions = require('./renderers/choose-actions');
var ActionPool = require('./renderers/action-pool');
var Log = require('./renderers/log');

var Roller = React.createClass({
	getInitialState: function() {
	    var serverConnection = new WebSocket("ws://" + location.host + "/connect");
        serverConnection.onmessage = event => {
            this.receiveGameTurn(JSON.parse(event.data));
        }
		return {
            nextActionKey: 0,
            actionPool: new Map(),
            nextLogKey: 0,
            serverConnection: serverConnection,
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
	receiveGameTurn: function(gameTurn) {
        this.appendToLog(gameTurn.characterName + " rolled " +
            gameTurn.rolls.reduce((prevVal, value) => {return prevVal + value.roll}, 0) +
            " = " + gameTurn.rolls.map(roll => {return roll.action + "{" + roll.roll + "}"}))
	},
    rollActionPool: function() {
        this.state.serverConnection.send(JSON.stringify({
            characterName: "Test",
            actions: Array.from(this.state.actionPool).map(([key, action]) => {
                return action.name;
            })
        }));
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
