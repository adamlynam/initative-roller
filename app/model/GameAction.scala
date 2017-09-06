package model

import play.api.libs.json.{Format, Reads, Writes}

object GameAction extends Enumeration {
  val MOVE, RANGED_ATTACK, MELEE_ATTACK, CAST_SPELL, BONUS_ACTION, OTHER_ACTION = Value

  implicit val moveFormat: Format[GameAction.Value] = Format(
    Reads.enumNameReads(GameAction),
    Writes.enumNameWrites)
}