var React = require('react');

module.exports = React.createClass({
	render: function() {
		return <div className="turn-order">
            <h3>Turn Order</h3>
            <ul>{Array.from(this.props.turnOrder).sort((x,y) => x.roll - y.roll).map(character => {
                return <li key={character.key}>
                    {character.roll} - {character.name}
                </li>})}
            </ul>
            <input type="submit" value="Clear Turn Order" onClick={this.props.emptyTurnOrder}/>
        </div>;
	}
});