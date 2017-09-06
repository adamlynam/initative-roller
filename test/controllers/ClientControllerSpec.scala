package controllers

import java.util.concurrent.TimeUnit

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{Message, TextMessage, WebSocketRequest}
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Flow, Keep, Sink, Source}
import model.{ActionPool, GameAction, GameTurn, RolledAction}
import org.scalatestplus.play._
import org.scalatestplus.play.guice._
import play.api.libs.json.Json
import play.api.test._
import play.api.test.Helpers._

import scala.concurrent.duration.FiniteDuration
import scala.concurrent.{Await, Future}
import scala.concurrent.ExecutionContext.Implicits.global

/**
 * Add your spec here.
 * You can mock out a whole application including requests, plugins etc.
 *
 * For more information, see https://www.playframework.com/documentation/latest/ScalaTestingWithScalaTest
 */
class ClientControllerSpec extends PlaySpec with GuiceOneAppPerTest with Injecting {
  val TEST_SERVER_PORT = 3333
  "ClientController GET" should {

    implicit val system = ActorSystem()
    implicit val materializer = ActorMaterializer()
    implicit val actionPoolFormat = Json.format[ActionPool]
    implicit val rolledActionFormat = Json.format[RolledAction]
    implicit val gameTurnFormat = Json.format[GameTurn]

    "send ActionPool JSON and receive rolled GameTurn JSON back to all clients" in {
      running(TestServer(TEST_SERVER_PORT), HTMLUNIT) { _ =>
        val actionPool = ActionPool(
          characterName = "[TestCharacter]",
          actions = List(GameAction.MOVE))

        val (_, completeFirst) =
          Http().singleWebSocketRequest(
            WebSocketRequest("ws://localhost:" + TEST_SERVER_PORT + "/connect"),
            Flow.fromSinkAndSourceMat({
              Sink.head: Sink[Message, Future[Message]]
            },{
              Source.maybe
            })(Keep.both))

        val (_, completeSecond) =
          Http().singleWebSocketRequest(
            WebSocketRequest("ws://localhost:" + TEST_SERVER_PORT + "/connect"),
            Flow.fromSinkAndSourceMat({
              Sink.head: Sink[Message, Future[Message]]
            },{
              Source.single(TextMessage(Json.toJson[ActionPool](actionPool).toString))
                .concatMat(Source.maybe[Message])(Keep.right)
            })(Keep.left))

        completeSecond.map {
          case message: TextMessage.Strict => {
            val responseJson = Json.fromJson[GameTurn](Json.parse(message.text))
            responseJson.get.characterName mustBe "[asdTestCharacter]"
            responseJson.get.rolls.head.action mustBe GameAction.MOVE
            completeFirst._2.success(None)
          }
        }

        Await.result(completeFirst._1, FiniteDuration(5, TimeUnit.SECONDS)) match {
          case message: TextMessage.Strict => {
            val responseJson = Json.fromJson[GameTurn](Json.parse(message.text))
            responseJson.get.characterName mustBe "[TestCharacter]"
            responseJson.get.rolls.head.action mustBe GameAction.MOVE
          }
        }
      }
    }
  }
}
