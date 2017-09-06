package controllers

import javax.inject._

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.stream.{ActorMaterializer, Materializer}
import play.api.libs.streams.ActorFlow
import play.api.mvc._

@Singleton
class ClientController @Inject()(cc:ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) {
  def socket = WebSocket.accept[String, String] { request =>
    ChatServer.connectClient
  }
}

object ChatServer {
  var clients = List[ActorRef]()

  def connectClient = {
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
    ActorFlow.actorRef { out =>
      clients = out :: clients
      Props(new ChatClient(out))
    }
  }

  def chat(message: String): Unit = {
    clients.foreach(client => {
      client ! (message)
    })
  }
}

class ChatClient(out: ActorRef) extends Actor {
  def receive = {
    case message: String => {
      ChatServer.chat(message)
    }
  }
}