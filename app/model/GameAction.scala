package model

import play.api.libs.json.{Format, Reads, Writes}

object GameAction extends Enumeration {

  val MOVE_DICE: Int = 6
  val RANGED_ATTACK_DICE: Int = 4
  val MELEE_ATTACK_DICE: Int = 8
  val CAST_SPELL_DICE: Int = 10
  val BONUS_ACTION_DICE: Int = 6
  val CHANGE_EQUIPMENT_DICE: Int = 6
  val OTHER_ACTION_DICE: Int = 6

  def rollAction(action: GameAction.Value): Int = {
    action match {
      case MOVE => MOVE_DICE
      case RANGED_ATTACK => RANGED_ATTACK_DICE
      case MELEE_ATTACK => MELEE_ATTACK_DICE
      case CAST_SPELL => CAST_SPELL_DICE
      case BONUS_ACTION => BONUS_ACTION_DICE
      case CHANGE_EQUIPMENT => CHANGE_EQUIPMENT_DICE
      case OTHER_ACTION => OTHER_ACTION_DICE
    }
  }

  val MOVE, RANGED_ATTACK, MELEE_ATTACK, CAST_SPELL, BONUS_ACTION, CHANGE_EQUIPMENT, OTHER_ACTION = Value

  implicit val moveFormat: Format[GameAction.Value] = Format(
    Reads.enumNameReads(GameAction),
    Writes.enumNameWrites)
}