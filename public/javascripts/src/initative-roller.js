var React = require('react');
var ReactDOM = require('react-dom');

var ChooseName = require('./renderers/choose-name');
var ChooseActions = require('./renderers/choose-actions');
var ActionPool = require('./renderers/action-pool');
var TurnOrder = require('./renderers/turn-order');
var Log = require('./renderers/log');

var Roller = React.createClass({
	getInitialState: function() {
		return {
            nextActionKey: 0,
            nextTurnOrderKey: 0,
            nextLogKey: 0,
            actionPool: new Map(),
            serverConnection: this.connectToServer(),
            name: "",
            turnOrder: [],
            log: []
		};
	},

	connectToServer: function() {
        var connection = new WebSocket("ws://" + location.host + "/connect");
        connection.onmessage = event => {
            this.receiveGameTurn(JSON.parse(event.data));
        }
        connection.onclose = event => {
            console.log("WebSocket disconnected, reconnecting...");
            this.setState((previousState, currentProps) => {
                return {
                    serverConnection: this.connectToServer(),
                }
            });
        }
        return connection;
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
	addToTurnOrder: function(name, roll) {
		this.setState((previousState, currentProps) => {
			return {
                nextTurnOrderKey: previousState.nextTurnOrderKey + 1,
				turnOrder: [...previousState.turnOrder, {key: previousState.nextTurnOrderKey, name: name, roll: roll}],
			};
		});
	},
    emptyTurnOrder: function(actionPoolKey) {
		this.setState((previousState, currentProps) => {
			return {
				turnOrder: [],
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
	setName: function(newName) {
		this.setState((previousState, currentProps) => {
			return {
                name: newName,
			};
		});
	},
	receiveGameTurn: function(gameTurn) {
	    var rollTotal = gameTurn.rolls.reduce((prevVal, value) => {return prevVal + value.roll}, 0);
        this.addToTurnOrder(gameTurn.characterName, rollTotal);
        this.appendToLog(gameTurn.characterName + " rolled " +
            rollTotal +
            " = " + gameTurn.rolls.map(roll => {return roll.action + "{" + roll.roll + "}"}));
	},
    sendActionPoolToServer: function() {
        this.state.serverConnection.send(JSON.stringify({
            characterName: this.state.name,
            actions: Array.from(this.state.actionPool).map(([key, action]) => {
                return action.apiName;
            })
        }));
        this.emptyActionPool();
	},
    rollActionPoolSecretly: function() {
	    this.receiveGameTurn({
	        characterName: this.state.name,
	        rolls: Array.from(this.state.actionPool).map(([key, action]) => {
	            return {
                    action: action.apiName,
                    roll: Math.ceil(Math.random() * action.dice),
	            }
	        }),
	    });
        this.emptyActionPool();
	},
    
	render: function() {
		return <div>
		    <ChooseName name={this.state.name} setName={this.setName} />
            <ChooseActions addToActionPool={this.addToActionPool} />
            <ActionPool actionPool={this.state.actionPool} removeFromActionPool={this.removeFromActionPool} rollPublicly={this.sendActionPoolToServer} rollSecretly={this.rollActionPoolSecretly} />
            <TurnOrder turnOrder={this.state.turnOrder} emptyTurnOrder={this.emptyTurnOrder} />
            <Log log={this.state.log} />
		</div>;
	}
});

ReactDOM.render(
	<Roller />,
	document.getElementById('content')
);
