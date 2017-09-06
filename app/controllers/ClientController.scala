package controllers

import javax.inject._

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.stream.{ActorMaterializer, Materializer}
import model.{ActionPool, GameAction, GameTurn, RolledAction}
import play.api.libs.json.{JsValue, Json}
import play.api.libs.streams.ActorFlow
import play.api.mvc._

import scala.util.Random

@Singleton
class ClientController @Inject()(cc:ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) {
  def socket = WebSocket.accept[JsValue, JsValue] { request =>
    ChatServer.connectClient
  }
}

object ChatServer {
  implicit val rolledActionFormat = Json.format[RolledAction]
  implicit val gameTurnFormat = Json.format[GameTurn]

  var clients = List[ActorRef]()

  def connectClient = {
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
    ActorFlow.actorRef { out =>
      clients = out :: clients
      Props(new ChatClient(out))
    }
  }

  def sendTurn(turn: GameTurn): Unit = {
    clients.foreach(client => {
      client ! Json.toJson[GameTurn](turn)
    })
  }
}

class ChatClient(out: ActorRef) extends Actor {
  implicit val actionPoolFormat = Json.format[ActionPool]

  def receive = {
    case message: JsValue => {
      ChatServer.sendTurn(rollActionPool(Json.fromJson[ActionPool](message).get))
    }
  }

  def rollAction(action: GameAction.Value): RolledAction = {
    RolledAction(
      action = action,
      roll = (new Random).nextInt(GameAction.rollAction(action))
    )
  }

  def rollActionPool(actionPool: ActionPool): GameTurn = {
    GameTurn(
      characterName = actionPool.characterName,
      rolls = actionPool.actions.map(rollAction))
  }
}
