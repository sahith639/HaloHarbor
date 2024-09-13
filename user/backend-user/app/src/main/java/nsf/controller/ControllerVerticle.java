package nsf.controller;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import io.netty.handler.codec.http.QueryStringDecoder;
import io.vertx.core.*;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerOptions; //add
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.mongo.MongoClientDeleteResult;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.ext.web.codec.BodyCodec;
import io.vertx.ext.web.handler.BodyHandler;
import nsf.access.*;
import org.hyperledger.acy_py.generated.model.SendMessage;
import org.hyperledger.aries.AriesClient;
import org.hyperledger.aries.api.connection.ConnectionReceiveInvitationFilter;
import org.hyperledger.aries.api.connection.ReceiveInvitationRequest;
import org.hyperledger.aries.api.out_of_band.InvitationMessage;
import org.hyperledger.aries.api.out_of_band.OOBRecord;
import org.hyperledger.aries.api.out_of_band.ReceiveInvitationFilter;
import org.hyperledger.aries.api.present_proof.PresentationExchangeRecord;
import org.hyperledger.aries.api.present_proof.PresentationRequestCredentials;
import org.hyperledger.aries.api.present_proof.PresentationRequestCredentialsFilter;
import org.hyperledger.aries.api.present_proof.SendPresentationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.vertx.ext.web.FileUpload;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.DecodeException;
import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.file.FileSystem;
import java.util.HashMap;
import java.util.Map;

public class ControllerVerticle extends AbstractVerticle {
  private static final Logger logger = LoggerFactory.getLogger(ControllerVerticle.class);
  private static ArrayList<String> divided = new ArrayList<String>();
  // TODO DI
  private final MongoClient mongoClient;
  private final AriesClient ariesClient;
  private final BaseAccessControlService accessControlService;
  private final BaseServProvService servProvService;
  private final BaseDataService dataService;
  private static JsonObject userSettings;
  private ConcurrentHashMap<String, ConcurrentHashMap<Integer, String>> dataParts = new ConcurrentHashMap<>();


  /**
   * Wait between making a connection to an SP and getting their presentation_proof request.
   */
  private final Map<String, Promise<String>> waitingForPresentationReqCtxs = new ConcurrentHashMap<>();

  /**
   * Wait between sending a presentation_proof to an SP and receiving a basic message response, confirming if it was verified or not.
   */
  private final Map<String, RoutingContext> waitingForPresentationResCtxs = new ConcurrentHashMap<>();

  private final Map<String, RoutingContext> waitingForCredentialCtx = new ConcurrentHashMap<>();

  private final Map<String, Promise<JsonObject>> waitingForServerInfoCtx = new ConcurrentHashMap<>();
  private final Map<String, RoutingContext> waitingForSharedDataAckCtx = new ConcurrentHashMap<>();
  private final Map<String, Promise<JsonObject>> waitingForConnResponse = new ConcurrentHashMap<>();

  Random random = new Random();

  public ControllerVerticle(MongoClient mongoClient, AriesClient ariesClient, BaseAccessControlService accessControlService,
                            BaseServProvService servProvService, BaseDataService dataService) {
    this.mongoClient = mongoClient;
    this.ariesClient = ariesClient;
    this.accessControlService = accessControlService;
    this.servProvService = servProvService;
    this.dataService = dataService;
  }

  @Override
  public void start(Promise<Void> promise) {
    Router router = Router.router(vertx);
//    router.route().handler(CorsHandler.create("*")
//        .allowedMethod(HttpMethod.GET)
//        .allowedMethod(HttpMethod.POST)
//        .allowedMethod(HttpMethod.OPTIONS)
//        .allowedMethod(HttpMethod.DELETE)
//        .allowedMethod(HttpMethod.PATCH)
//        .allowedMethod(HttpMethod.PUT)
//        .allowCredentials(true)
//        .allowedHeader("Access-Control-Allow-Headers")
//        .allowedHeader("Authorization")
//        .allowedHeader("Access-Control-Allow-Method")
//        .allowedHeader("Access-Control-Allow-Origin")
//        .allowedHeader("Access-Control-Allow-Credentials")
//        .allowedHeader("Content-Type"));
    router.route().handler(BodyHandler.create());

    router.route().handler(ctx -> {
        ctx.response()
              .putHeader("Access-Control-Allow-Origin", "*")
              .putHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PATCH, PUT")
              .putHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
              .putHeader("Access-Control-Allow-Credentials", "true");

        if (ctx.request().method() == HttpMethod.OPTIONS) {
            ctx.response().setStatusCode(200).end();
        } else {
            ctx.next();
        }
    });

    // TODO Refactor split up into multiple handler files.

    router.get("/service-providers").handler(this::listServProvsHandler);
    router.get("/service-providers/:serviceProviderId").handler(this::getServProvDetailHandler);
//    router.get("/relevant-credential").handler(this::checkServiceProviderCredentialRequirements);
    router.post("/service-providers").handler(this::addServiceProviderHandler);
//    router.post("/service-providers/:serviceProviderId/verify").handler(this::verifyCredentialWithServProvider);
    router.post("/verify").handler(this::verifyCredentialWithServProvider);
    router.get("/service-providers/:serviceProviderId/data-menu").handler(this::getDataSharingSettingsHandler);
    router.put("/service-providers/:serviceProviderId/data-menu").handler(this::setDataMenuSettings);
    router.delete("/service-providers/:serviceProviderId").handler(this::removeServiceProviderHandler);
//    router.put("/access/:serviceProviderId").handler(this::setServiceProviderAccessControl);

    router.get("/credentials").handler(this::listCredentials);
    router.post("/add-credential").handler(this::addCredential);

    router.post("/push-new-data").handler(new PushDataHandler(ariesClient, accessControlService, servProvService,
        dataService, PushDataTransformer::transformPushableData));

    router.get("/data-sources").handler(this::getDataSources);
    router.post("/data-sources").handler(this::integrateDataSource);
    router.delete("/data-sources/:dataSourceId").handler(this::removeDataSource);

    router.post("/get-data").handler(new GetDataHandler(dataService));

    router.get("/shared-data").handler(this::getCollectedData);

    router.post("/train-response").handler(this::trainResponseHandler);
    router.post("/user-settings").handler(this::userSettingsHandler);

    router.post("/webhook/topic/connections").handler(this::connectionsUpdateHandler);
    router.post("/webhook/topic/issue_credential").handler(this::issueCredentialUpdate);
    router.post("/webhook/topic/present_proof").handler(this::presentProofUpdate);
    router.post("/webhook/topic/out_of_band").handler(this::outOfBandHandler);
    router.post("/webhook/topic/basicmessages").handler(this::basicMessageHandler);
    userSettings = new JsonObject().put("0",true).put("1",true).put("2",true);
    int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "9080"));
    vertx.createHttpServer()
        .requestHandler(router)
        .listen(port)
        .onSuccess(server -> {
          // TODO LOGGING
          logger.info(String.format("server running! (Should be listening at port %s)", port));
          promise.complete();
        })
        .onFailure(promise::fail);
  }


  private void getCollectedData(RoutingContext ctx){
    JsonObject allQuery = new JsonObject();
    mongoClient.find("shared_data_items", allQuery, h -> {
      if (h.succeeded()){
        JsonArray response = new JsonArray(h.result());
        ctx.response().setStatusCode(200).end(response.encode());
      }
      else{
        ctx.response().setStatusCode(500).end();
      }
    });
  }


private void userSettingsHandler(RoutingContext ctx) {
    
    
    JsonObject jsonObject;
            try {
                jsonObject = ctx.getBodyAsJson();
                for (String key : jsonObject.fieldNames()) {
                    if (userSettings.containsKey(key)) {
                        userSettings.put(key, jsonObject.getValue(key));
                    }
                }
                logger.info("user setting updated " + jsonObject.encode());
            } catch (DecodeException e) {
                logger.error("Invalid JSON format");
                return;
            }
     
      ctx.response().setStatusCode(200).end();
      return;

    }

private void trainResponseHandler(RoutingContext ctx) {
    //     try{
    //        Optional<List<ConnectionRecord>> invitationsOptional = ariesClient.connections(ConnectionFilter.builder().state(ConnectionState.INVITATION).build());
    //        List<ConnectionRecord> invitations = invitationsOptional.orElse(List.of());

    //        JsonArray invitationsJson = new JsonArray();
    //        invitations.forEach(record -> {
    //            invitationsJson.add(new JsonObject().put("invKey", record.getInvitationKey()));
    //        });
    //    }
    //    catch(Exception e){
    //        ctx.response().setStatusCode(500).end();
    //    }
     logger.info("handler");
    
    JsonObject jsonObject;
            try {
                jsonObject = ctx.getBodyAsJson();
                String jsonString = jsonObject.encodePrettily();  // Or use .encode() for compact format
                  // Attempt to parse JSON
                logger.info(Integer.toString(jsonString.length()));
            } catch (DecodeException e) {
                logger.error("Invalid JSON format");
                return;
            }
     logger.info("handler1");
      var query = new JsonObject();
      mongoClient.find("service_providers", query)
      .onSuccess(servProvData -> {
        String connId = servProvData.get(0).getString("connId");
        final String[] divided = divideString(jsonObject.encode());
        logger.info(Integer.toString(divided[0].length()));
        int length = jsonObject.encodePrettily().length();
        final int pieces = Math.max(length/350000,1); // Number of pieces to divide the string into
        final int n = divided.length;
        Thread thread = new Thread(() -> {
            for (int i = 0; i < n; i++) {
                final String divided_str = divided[i];                               
                sendBasicMessage(connId, "TRAIN_RESPONSE", new JsonObject().put("id",i).put("total",pieces).put("value",divided_str), null);
            }
        });
        thread.start();
      });
      ctx.response().setStatusCode(200).end();
      return;

    }

    public  String[] divideString(String input) {
        // Check if input string is null or empty
        if (input == null || input.isEmpty()) {
            return new String[0];
        }
        
        int length = input.length();
        int pieces = Math.max(length/350000,1); // Number of pieces to divide the string into
        int pieceSize = length / pieces; // Size of each piece
        int remainder = length % pieces; // Remainder if string length is not divisible by pieces
        
        String[] divided = new String[pieces];
        
        // Divide the string into pieces
        int startIndex = 0;
        for (int i = 0; i < pieces; i++) {
            int endIndex = startIndex + pieceSize + (i < remainder ? 1 : 0);
            divided[i] = input.substring(startIndex, endIndex);
            startIndex = endIndex;
        }
        
        return divided;
    }

  private void outOfBandHandler(RoutingContext ctx){
    try{
      JsonObject message = ctx.body().asJsonObject();

      String user_connection_id = message.getString("connection_id");
      String invitation_message_id = message.getString("invi_msg_id");

      logger.info("out of band webhook: " + user_connection_id + ", " + invitation_message_id);

      ctx.response().setStatusCode(200).end();
    }
    catch(Exception e){
      ctx.response().setStatusCode(500).end();
    }
  }

  private static Map<String, Double> parseCsv(String csvContent) {
    Map<String, Double> sleepDurationMap = new HashMap<>();
    String[] lines = csvContent.split("\n");

    for (int i = 1; i < lines.length; i += 1) {
        String[] row = lines[i].trim().split(",");
        double value = Double.parseDouble(row[4].trim());
        sleepDurationMap.put(row[12], value);
    }

    return sleepDurationMap;
  }

  private static JsonObject calculateAverageSleepPerDisorder(Map<String, Double> sleepDurationMap) {
      Map<String, Double> sleepPerDisorder = new HashMap<>();
      Map<String, Integer> countPerDisorder = new HashMap<>();

      // Calculate total sleep duration and count for each sleep disorder
      for (Map.Entry<String, Double> entry : sleepDurationMap.entrySet()) {
          String key = entry.getKey().toLowerCase(); // Assuming sleep disorders are case insensitive
          double value = entry.getValue();

          sleepPerDisorder.put(key, sleepPerDisorder.getOrDefault(key, 0.0) + value);
          countPerDisorder.put(key, countPerDisorder.getOrDefault(key, 0) + 1);
      }

      // Calculate average sleep duration per sleep disorder and construct JsonObject
      JsonObject result = new JsonObject();
      for (Map.Entry<String, Double> entry : sleepPerDisorder.entrySet()) {
          String key = entry.getKey();
          double totalSleep = entry.getValue();
          int count = countPerDisorder.get(key);
          double averageSleep = totalSleep / count;

          // Add sleep disorder and average sleep duration to JsonObject
          JsonObject disorderEntry = new JsonObject()
                  .put("sleepDisorder", key)
                  .put("averageSleepDuration", averageSleep);
          result.put(key, disorderEntry);
      }

      return result;
  }

  HashSet<String> uniqueMessagesMap = new HashSet<>();

  private void basicMessageHandler(RoutingContext webhookCtx){
    JsonObject message = webhookCtx.body().asJsonObject();

    String connId = message.getString("connection_id");
    JsonObject basicMessagePackage = new JsonObject(message.getString("content"));

    String uniqueMessageId = basicMessagePackage.getString("uniqueMessageId");
    if (uniqueMessagesMap.contains(uniqueMessageId)){
      logger.warn("Duplicate message: " + message.encodePrettily());
      return;
    }
    uniqueMessagesMap.add(uniqueMessageId);

//        String threadNonceId = basicMessagePackage.getString("threadNonceId");
    String messageId = basicMessagePackage.getString("messageId");
    String messageTypeId = basicMessagePackage.getString("messageTypeId");
    Object payload = basicMessagePackage.getValue("payload");

    logger.info("Received basic message: " );

    switch (messageTypeId){
      case "CONN_RESPONSE":
      {
        JsonObject payloadData = (JsonObject)payload;
        var promise = waitingForConnResponse.remove(connId);
        promise.complete(payloadData);
      }
      break;
      case "INFO_RESPONSE":
      {        
        var waitingPromise = waitingForServerInfoCtx.remove(messageId);
        JsonObject payloadData = (JsonObject)payload;
        waitingPromise.complete(payloadData);
      //        waitingCtx.response().setStatusCode(200).end(payloadData.encode());
      }        break;
      case "VERIFY_RESPONSE":
      {
        var waitingCtx = waitingForPresentationResCtxs.remove(connId);
        boolean isSuccessful = (Boolean)payload;
        JsonObject query = new JsonObject().put("_id", connId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("presentationExchangeId", null)
            .put("verifiedWith", isSuccessful));
        mongoClient.updateCollection("service_providers", query, update, res -> {
          if (res.succeeded()) {
            logger.info("Updated servprov verification status: " + isSuccessful);
            waitingCtx.response().setStatusCode(200).end(isSuccessful ? "true" : "false");
          } else {
            logger.error("Failed to update document: " + res.cause().getMessage());
            waitingCtx.response().setStatusCode(500).end();
          }
        });
      }
        break;
      case "SHARED_DATA_ACK":
      {
        var waitingCtx = waitingForSharedDataAckCtx.remove(messageId);
        int sharedCount = (Integer)payload;
        if (sharedCount < 0){
          logger.warn("SP rejected shared data - not verified?");
        }
        JsonObject responseData = new JsonObject()
            .put("itemsSharedCount", sharedCount);
        waitingCtx.response().setStatusCode(200).end(responseData.encode());
      }
        break;
      /*case "TRAIN":
      {
        JsonObject payloadData = (JsonObject)payload;
        int id = payloadData.getInteger("id");
        logger.info("id"+Integer.toString(id));
        int total = payloadData.getInteger("total");
        String content = payloadData.getString("value");
        while(id>divided.size()){
          divided.add(divided.size(),"QWERTY");
        }
        if(divided.size()==total && (divided.contains("QWERTY")) ){
        
          divided.add(id , content);
          payloadData = (JsonObject)Json.decodeValue(String.join("",divided));
          logger.info("Sending payload");
          WebClient webClient = WebClient.create(vertx, new WebClientOptions().setSsl(true));
          webClient.post(4600, "host.docker.internal", "/train")  // Can be adjusted for different HTTP methods (GET, PUT, etc.)
            .sendJsonObject(payloadData).onSuccess(res -> {
            });
          logger.info("Sent payload");
          divided.removeAll(divided);
        }else{
          divided.add(id , content);
        }
      }
      break;
    }*/

    case "TRAIN":
    {   
        JsonObject payloadData = (JsonObject)payload;
        int id = payloadData.getInteger("id");
        String client_id = payloadData.getString("client_id");
        logger.info("Client: "+ client_id +" Received segment ID: " + id);

        int total = payloadData.getInteger("total");
        String content = payloadData.getString("value");
        // Get or create a map for storing segments for this specific connection
        ConcurrentHashMap<Integer, String> segments = dataParts.computeIfAbsent(connId, k -> new ConcurrentHashMap<>());
      
        // Store the current segment
        segments.put(id, content);

        // Check if all segments from 0 to total-1 are present
        if (segments.size() == total && segments.keySet().stream().sorted().reduce((a, b) -> a + 1 == b ? b : -1).orElse(-1) + 1 == total) {
            
            logger.info("Client: "+ client_id + userSettings.encode());
            
            if(String.valueOf(userSettings.getBoolean(client_id)).equals("true")){

              StringBuilder fullContent = new StringBuilder();
              for (int i = 0; i < total; i++) {
                  fullContent.append(segments.get(i));
              }
              
              // Log that we are sending the complete payload
              logger.info("Sending full payload");
              JsonObject completeData = new JsonObject().put("completeData", fullContent.toString());

              WebClient webClient = WebClient.create(vertx, new WebClientOptions().setSsl(false));
              webClient.post(4600, "localhost", "/train") 
                  .sendJsonObject(completeData)
                  .onSuccess(res -> logger.info("Payload sent successfully"))
                  .onFailure(err -> logger.error("Failed to send payload: " + err.getMessage()));
            }else{
                  logger.info("Rejecting the Training");
                  JsonObject completeData = new JsonObject().put("value", "None").put("data", new JsonObject().put("client_id", client_id));
                  WebClient webClient = WebClient.create(vertx, new WebClientOptions().setSsl(false));
                  webClient.post(9080, "localhost", "/train-response") 
                          .sendJsonObject(completeData)
                          .onSuccess(res -> logger.info("Payload sent successfully"))
                          .onFailure(err -> logger.error("Failed to send payload: " + err.getMessage()));
                }
                  // Clear the segments map for this connection to free up memory
                  dataParts.remove(connId);
          } else {
              // Log waiting for more segments
              logger.info("Waiting for more segments. Current count: " + segments.size() + "/" + total);
          }

        
      }
      break;
      case "COMPUTE":
            {
              String filePath = "sleep_data.csv"; // Replace with your CSV file path
              FileSystem fileSystem = vertx.fileSystem();
              // Read the CSV file
              logger.info(System.getProperty("user.dir"));
              
              fileSystem.readFile(filePath, result -> {
                  if (result.succeeded()) {
                      Buffer buffer = result.result();
                      String csvContent = buffer.toString();

                      // Parse the CSV content into key-value pairs
                      Map<String, Double> sleepDurationMap = parseCsv(csvContent);

                      // Calculate average sleep duration per sleep disorder
                      JsonObject averageSleepPerDisorder = calculateAverageSleepPerDisorder(sleepDurationMap);
                      logger.info("handler2");
                      sendBasicMessage(connId, "COMPUTE_RESPONSE", averageSleepPerDisorder, null);
                      // Output the result
                      logger.info("Average Sleep Duration per Sleep Disorder:");

                  } else {
                      logger.info("Failed to read the file: " + result.cause());
                  }
              });
              
            }
            break;
    }

    webhookCtx.response().setStatusCode(200).end();
  }


  private String generateMsgId(String connId){
    // random nonce is needed to prevent async message threads from colliding with eachother (i.e. if multiple messages are being sent over the same connection at the same time -- so the nonce is used to link them).
    return connId + "-" + String.valueOf(random.nextInt());
  }

  private void sendBasicMessage(String connId, String messageTypeId, Object dataPayload, String messageId){
    if (messageId == null){
      messageId = generateMsgId(connId);
    }

    JsonObject packagedJsonObj = new JsonObject()
        .put("uniqueMessageId", messageId + "-" + String.valueOf(random.nextInt()))
        .put("messageId", messageId)
        .put("messageTypeId", messageTypeId)
        .put("payload", dataPayload);

    SendMessage basicMessageResponse = SendMessage.builder()
        .content(packagedJsonObj.encode())
        .build();

    try {
      ariesClient.connectionsSendMessage(connId, basicMessageResponse);
    } catch (IOException e) {
      logger.error("Failed to send info response to " + connId + ": " + e.toString());
    }
  }


  private static final String SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
  private static final String SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
  private static final String SPOTIFY_CLIENT_ID = "12ae5783c2a64348a38bec41901e54db";
  private static final String SPOTIFY_CLIENT_SECRET = "088dae8acf30486f83c4672262ee0504";
  /**
   * Not actually used according to the API docs: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow#:~:text=This%20parameter%20is%20used%20for%20validation%20only
   */
  private static final String REDIRECT_URI = "http://localhost:2999/profile";

  private Future<String> refreshSpotifyAccessToken(){
    JsonObject query = new JsonObject()
        .put("_id", "spotify");
    return mongoClient.find("data_sources", query)
        .compose(sharingData -> {
          Promise<String> promise = Promise.promise();
          if (sharingData.size() > 0){
            JsonObject spotifySharingData = sharingData.get(0);
            String tempAccessToken = spotifySharingData.getString("temp_access_token");
            String refreshToken = spotifySharingData.getString("refresh_token");
            long expiresEpochSeconds = spotifySharingData.getLong("expires_epoch_seconds", 0L);

            long currentEpochSeconds = Instant.now().getEpochSecond();

            if (tempAccessToken == null || currentEpochSeconds - expiresEpochSeconds > 1800){
              refreshSpotifyAccessToken(refreshToken)
                  .onSuccess(newAccessToken -> {
                    promise.complete(newAccessToken);
                  })
                  .onFailure(e -> {
                    logger.error("failed to get access token: " + e.toString());
                  });
            }
            else{
              promise.complete(tempAccessToken);
            }
          }
          else{
            promise.fail("Spotify not integrated!");
          }

          return promise.future();
        });
  }
  private Future<String> refreshSpotifyAccessToken(String refreshToken){
    if (refreshToken == null || refreshToken.length() == 0){
      logger.error("empty refresh token");
      return Future.failedFuture(new Exception());
    }

    WebClient webClient = WebClient.create(vertx, new WebClientOptions().setSsl(true));

    Promise<String> promise = Promise.promise();

    logger.info("Refreshing spotify tokens with refresh token: " + refreshToken);
    webClient.postAbs(SPOTIFY_TOKEN_URL)
        .putHeader("Content-Type", "application/x-www-form-urlencoded")
        .basicAuthentication(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
        .sendForm(
            MultiMap.caseInsensitiveMultiMap()
                .add("grant_type", "refresh_token")
                .add("refresh_token", refreshToken),
            response -> {
              if (response.succeeded()) {
                JsonObject responseBody = response.result().bodyAsJsonObject();

                String accessToken = responseBody.getString("access_token");
                String newRefreshToken = responseBody.getString("refresh_token");

                if (newRefreshToken == null){
                  logger.info("new refresh token not included. reusing the previous refresh token: " + refreshToken);
                  newRefreshToken = refreshToken;
                }

                // Save token:
                JsonObject dataSourceDoc = new JsonObject()
                    .put("_id", "spotify")
                    .put("data_source_id", "spotify")
                    .put("expires_epoch_seconds", Instant.now().getEpochSecond() + 1800)
                    .put("temp_access_token", accessToken)
                    .put("refresh_token", newRefreshToken);

                mongoClient.save("data_sources", dataSourceDoc, h -> {
                  if (h.succeeded()){
                    logger.info("saved refreshed tokens: " + accessToken);
                    promise.complete(accessToken);
                  }
                  else{
                    promise.fail("Failed to save new tokens.");
                  }
                });
              } else {
                promise.fail("Token response failed.");
//                resultHandler.handle(Future.failedFuture("Error refreshing token"));
              }
            });

    return promise.future();
  }

  private Future<JsonObject> callSpotifyApi(String url){
    Promise<JsonObject> promise = Promise.promise();
    refreshSpotifyAccessToken()
        .onSuccess(accessToken -> {
          WebClient webClient = WebClient.create(vertx, new WebClientOptions().setSsl(true));

          webClient.getAbs(url)
              .putHeader("Authorization", "Bearer " + accessToken)
              .send(ar -> {
                if (ar.succeeded()) {
                  try{
                    JsonObject responseBody = ar.result().bodyAsJsonObject();
                    promise.complete(responseBody);
                  }
                  catch (Exception e){
                    promise.fail("Error calling spotify API: " + ar.result().statusCode() + " - " + ar.result().bodyAsString() + " - " + ar.cause());
                  }
                } else {
                  promise.fail("Error calling spotify API: " + ar.result().statusCode() + " - " + ar.result().bodyAsString() + " - " + ar.cause());
                }
              });
        })
        .onFailure(e -> {
          logger.error(e.toString());
        });
    return promise.future();
  }

  private Future<JsonObject> fetchSpotifyFavArtists(){
    Promise<JsonObject> promise = Promise.promise();
    callSpotifyApi(SPOTIFY_API_BASE_URL + "/me/top/artists?time_range=long_term&limit=1&offset=0")
        .onSuccess(responseBody -> {
          JsonArray artists = responseBody.getJsonArray("items");
          JsonObject top = artists.getJsonObject(0);
          logger.info("User's fav artist: " + top.encodePrettily());
          promise.complete(top);
        })
        .onFailure(e -> {
          logger.error(e.toString());
        });
    return promise.future();
  }

  private Future<JsonObject> fetchSpotifyFavSong(){
    Promise<JsonObject> promise = Promise.promise();
    callSpotifyApi(SPOTIFY_API_BASE_URL + "/me/top/tracks?time_range=long_term&limit=1&offset=0")
        .onSuccess(responseBody -> {
          JsonArray tracks = responseBody.getJsonArray("items");
          JsonObject top = tracks.getJsonObject(0);
          logger.info("User's fav song: " + top.encodePrettily());
          promise.complete(top);
        })
        .onFailure(e -> {
          logger.error(e.toString());
        });
    return promise.future();
  }

  private Future<Integer> fetchSpotifyFollowedArtistsCount(){
    Promise<Integer> promise = Promise.promise();
    callSpotifyApi(SPOTIFY_API_BASE_URL + "/me/following?type=artist")
        .onSuccess(responseBody -> {
          int followingCount = responseBody.getJsonObject("artists").getInteger("total");
          logger.info("User's followed artists count: " + followingCount);
          promise.complete(followingCount);
        })
        .onFailure(e -> {
          logger.error(e.toString());
        });
    return promise.future();
  }

  private Future<String> fetchSpotifySubscriptionLevel(){
    Promise<String> promise = Promise.promise();
    callSpotifyApi(SPOTIFY_API_BASE_URL + "/me")
        .onSuccess(responseBody -> {
          String product = responseBody.getString("product");
          promise.complete(product);
        })
        .onFailure(e -> {
          logger.error(e.toString());
        });
    return promise.future();
  }

  private Future<String> fetchExampleData(){
    Promise<String> promise = Promise.promise();
    promise.complete("(example data)");
    return promise.future();
  }

  private void dataPullCallback(Supplier<Future> futureSupplier, Promise promise, String dataSourceKey, String dataItemKey, String servProvId){
    JsonObject lastSharedQuery = new JsonObject()
        .put("_id", dataSourceKey + "-" + dataItemKey + "--" + servProvId);
    mongoClient.find("last_shared_data", lastSharedQuery)
        .onSuccess(lastSharedResults -> {
          // Check if we should share this data item at this moment:
          if (lastSharedResults.size() > 0) {
            // && lastSharedResults.get(0).getLong("shared_timestamp") > x
            logger.info("Already shared data item: " + dataSourceKey + "-" + dataItemKey + "--" + servProvId);
            promise.complete(DataItemFetchedResponse.dontShareData());
            return;
          }

          JsonObject cacheQuery = new JsonObject()
              .put("_id", dataSourceKey + "-" + dataItemKey);
          mongoClient.find("cached_pulled_data", cacheQuery)
              .onSuccess(cacheResults -> {
                if (cacheResults.size() > 0) {
                  logger.info("Using cache for data item: " + dataSourceKey + "-" + dataItemKey);
                  Object cachedData = cacheResults.get(0).getValue("data");
                  promise.complete(new DataItemFetchedResponse(dataSourceKey, dataItemKey, cachedData, true));
                } else {
                  futureSupplier.get()
                      .onSuccess(result -> {
                        promise.complete(new DataItemFetchedResponse(dataSourceKey, dataItemKey, result, false));
                      })
                      .onFailure(e -> {
                        logger.error(e.toString());
                      });
                }
              });
        });
  }

  /** Sets data sharing settings, and immediately shares relevant items. */
  private void setDataMenuSettings(RoutingContext ctx){
    String servProvId = ctx.pathParam("serviceProviderId");
    var newDataMenuSettings = ctx.body().asJsonObject();

    JsonObject dataMenuDoc = new JsonObject()
        .put("_id", servProvId)
        .put("dataMenu", newDataMenuSettings);

    mongoClient.save("serv_prov_sharing", dataMenuDoc, h -> {
      if (h.succeeded()){

//        List<Future<DataItemFetchedResponse>> futures = new ArrayList<>();
        List<Future> futures = new ArrayList<>();
//        List<Promise> promises = new ArrayList<>();

        try{
          for (String dataSourceKey : newDataMenuSettings.fieldNames()) {
            JsonObject dataSource = newDataMenuSettings.getJsonObject(dataSourceKey);
            JsonObject dataSourceItems = dataSource.getJsonObject("items");
            for (String dataItemKey : dataSourceItems.fieldNames()) {
              JsonObject dataItem = dataSourceItems.getJsonObject(dataItemKey);

              if (dataItem.getBoolean("selected", false)){
                Promise<DataItemFetchedResponse> promise = Promise.promise();
                switch (dataSourceKey){
                  case "spotify":
                    switch (dataItemKey){
                      case "fav-artist":
                        dataPullCallback(this::fetchSpotifyFavArtists, promise, dataSourceKey, dataItemKey, servProvId);
                        break;
                      case "fav-song":
                        dataPullCallback(this::fetchSpotifyFavSong, promise, dataSourceKey, dataItemKey, servProvId);
                        break;
                      case "following-artists-count":
                        dataPullCallback(this::fetchSpotifyFollowedArtistsCount, promise, dataSourceKey, dataItemKey, servProvId);
                        break;
                      case "spotify-subscription-level":
                        dataPullCallback(this::fetchSpotifySubscriptionLevel, promise, dataSourceKey, dataItemKey, servProvId);
                        break;
                      default:
                        logger.error("unknown data item: " + dataItemKey);
                        break;
                    }
                    break;

                  case "test-example":
                    switch (dataItemKey) {
                      case "example":
                        dataPullCallback(this::fetchExampleData, promise, dataSourceKey, dataItemKey, servProvId);
                        break;
                    }
                    break;

                  default:
                    logger.error("unknown data source: " + dataSourceKey);
                    break;
                }
                futures.add(promise.future());
              }
            }
          }
        }
        catch (Exception e){
          logger.error(e.toString());
        }

//        for (Future future : futures){
//          future.onSuccess(favArtists -> {
//                // TODO generalize this and cache results.
//            return new DataItemFetchedResponse(dataSourceKey, dataItemKey, favArtists);
////                promise.complete(new DataItemFetchedResponse(dataSourceKey, dataItemKey, favArtists));
//              })
//              .onFailure(e -> {
//                logger.error(e.toString());
//              });
//        }

        // Wait for all data items to pull, and then send them all in one message:
        logger.info("waiting for " + futures.size() + " data pulling items...");
        CompositeFuture.join(futures)
            .onSuccess(compositeHandler -> {
              if (compositeHandler.succeeded()){
                JsonObject query = new JsonObject()
                    .put("_id", servProvId);
                mongoClient.find("service_providers", query)
                    .onSuccess(servProvData -> {
                      String connId = servProvData.get(0).getString("connId");

                      //                JsonObject dataSharePayload = new JsonObject();

                      int sharedCount = 0;
                      JsonArray dataShareItems = new JsonArray();
                      for (int i = 0; i < compositeHandler.result().size(); i++) {
//                        var x = compositeHandler.result().size();
////                        var y = compositeHandler.result().failed(0);
                        DataItemFetchedResponse result = compositeHandler.result().resultAt(i);
                        if (!result.dontShare){
                          JsonObject dataItemShare = new JsonObject();
                          dataItemShare.put("dataSourceId", result.dataSourceId);
                          dataItemShare.put("dataItemId", result.dataItemId);
                          dataItemShare.put("data", result.data);
                          dataShareItems.add(dataItemShare);

                          logger.info("Sharing " + result.dataSourceId + "-" + result.dataItemId + " to " + servProvId + "...");
                          sharedCount++;
                        }
                      }

                      if (sharedCount == 0){
                        logger.info("Had no items to share to " + servProvId + ".");
                        JsonObject responseData = new JsonObject()
                            .put("itemsSharedCount", sharedCount);
                        ctx.response().setStatusCode(200).end(responseData.encode());
                      }
                      else{
                        String messageId = generateMsgId(connId);
                        waitingForSharedDataAckCtx.put(messageId, ctx);
                        sendBasicMessage(connId, "SHARED_DATA", dataShareItems, messageId);
                        logger.info("Shared " + sharedCount + " items to " + servProvId + ".");
                      }


                      // Bookkeeping:
                      for (int i = 0; i < futures.size(); i++) {
                        DataItemFetchedResponse result = compositeHandler.result().resultAt(i);

                        // Update last_shared trackers:
                        if (!result.dontShare){
                          JsonObject lastSharedDoc = new JsonObject()
                              .put("_id", result.dataSourceId + "-" + result.dataItemId + "--" + servProvId);
                          mongoClient.save("last_shared_data", lastSharedDoc)
                              .onFailure(e -> {
                                logger.error(e.toString());
                              });

                          // Save results to activity history collection:
                          JsonObject activityDoc = new JsonObject()
                              .put("servProvId", servProvId)
                              .put("epoch_seconds", Instant.now().getEpochSecond())
                              .put("dataSourceId", result.dataSourceId)
                              .put("dataItemId", result.dataItemId)
                              .put("data", result.data);
                          mongoClient.save("shared_data_items", activityDoc)
                              .onFailure(e -> {
                                logger.error(e.toString());
                              });


                          // Save results to cache:
                          if (!result.isCached){
                            // If the data item is not cached, then cache it:
                            JsonObject cachedDocument = new JsonObject()
                                .put("_id", result.dataSourceId + "-" + result.dataItemId)
                                .put("data", result.data);
                            mongoClient.save("cached_pulled_data", cachedDocument)
                                .onFailure(e -> {
                                  logger.error(e.toString());
                                });
                          }
                        }
                      }
                    });
              }
              else{
                logger.error("composite failed");
                ctx.response().setStatusCode(500).end();
              }
            })
            .onFailure(e -> {
              logger.error(e.toString());
            });
      }
      else{
        ctx.response().setStatusCode(500).end();
      }
    });
  }

  private void getDataSharingSettingsHandler(RoutingContext ctx){
    String servProvId = ctx.pathParam("serviceProviderId");
    getCurrentDataSharingSettings(servProvId)
        .onSuccess(dataSharingMenuOptional -> {
          boolean updateDataMenuFromServProv = dataSharingMenuOptional.isEmpty();
          JsonObject currentDataSharingMenu = dataSharingMenuOptional.orElseGet(JsonObject::new);

          if (updateDataMenuFromServProv){
            logger.info("fetching data menu from server...");
            JsonObject query = new JsonObject()
                .put("_id", servProvId);
            mongoClient.find("service_providers", query)
                .onSuccess(servProvData -> {
                  String connId = servProvData.get(0).getString("connId");
                  fetchServProvInfo(connId)
                      .onSuccess(fetchedDataMenu -> {
                        try{
                          JsonObject dataMenu = fetchedDataMenu.getJsonObject("dataMenu");
                          for (String dataSourceKey : dataMenu.fieldNames()) {
                            JsonObject dataSource = dataMenu.getJsonObject(dataSourceKey);
                            JsonObject dataSourceItems = dataSource.getJsonObject("items");
                            for (String dataItemKey : dataSourceItems.fieldNames()) {
                              JsonObject dataItem = dataSourceItems.getJsonObject(dataItemKey);

                              // Only select items that were selected in the last menu:
                              if (currentDataSharingMenu.containsKey(dataSourceKey) &&
                                  currentDataSharingMenu.getJsonObject(dataSourceKey).getJsonObject("items").getBoolean("selected", false)){
                                dataItem.put("selected", true);
                              }
                              else{
                                // Deselect all items by default:
                                dataItem.put("selected", false);
                              }
                            }
                          }

                          var document = new JsonObject()
                              .put("_id", servProvId)
                              .put("dataMenu", dataMenu);
                          ctx.response().setStatusCode(200).end(document.encode());
                          mongoClient.save("serv_prov_sharing", document);
                        }
                        catch (Exception e){
                          logger.error(e.toString());
                        }
                      });
                });
          }
          else{
            ctx.response().setStatusCode(200).end(currentDataSharingMenu.encode());
          }
        })
        .onFailure(e -> {
          ctx.response().setStatusCode(500).end(e.toString());
        });
  }

  private Future<Optional<JsonObject>> getCurrentDataSharingSettings(String servProvId){
    JsonObject query = new JsonObject()
        .put("_id", servProvId);
    return mongoClient.find("serv_prov_sharing", query)
        .compose(servProvSharingResults -> {
          Promise<Optional<JsonObject>> promise = Promise.promise();

          if (servProvSharingResults.size() == 0) {
            promise.complete(Optional.empty());
          } else {
            promise.complete(Optional.of(servProvSharingResults.get(0)));
          }
          return promise.future();
        });
  }

  private Future<JsonObject> fetchServProvInfo(String connId){
    Promise<JsonObject> promise = Promise.promise();

    String messageId = generateMsgId(connId);
    waitingForServerInfoCtx.put(messageId, promise);

    sendBasicMessage(connId, "INFO_REQUEST", null, messageId);
    return promise.future();
  }

  private void removeDataSource(RoutingContext ctx) {
    String dataSourceId = ctx.pathParam("dataSourceId");
    JsonObject query = new JsonObject()
        .put("_id", dataSourceId);
    mongoClient.removeDocument("data_sources", query, h -> {
      if (h.succeeded()){
        ctx.response().setStatusCode(200).end();
      }
      else{
        ctx.response().setStatusCode(500).end();
      }
    });
  }

  private void saveDataSourceDoc(String dataSourceId, JsonObject extraData, RoutingContext ctx){
    JsonObject dataSourceDoc = extraData
        .put("_id", dataSourceId) // sets ID to prevent duplicates / maintain idempotency.
        .put("data_source_id", dataSourceId);

    mongoClient.save("data_sources", dataSourceDoc, h -> {
      if (h.succeeded()){
        ctx.response().setStatusCode(200).end();
      }
      else{
        ctx.response().setStatusCode(500).end();
      }
    });
  }

  private void integrateDataSource(RoutingContext ctx){
    String dataSourceId = ctx.body().asJsonObject().getString("dataSourceId");

    switch (dataSourceId){
      case "spotify":
        String code = ctx.body().asJsonObject().getString("code");
        String redirectUri = ctx.body().asJsonObject().getString("redirectUri");

        WebClient webClient = WebClient.create(vertx);

        String tokenEndpoint = "https://accounts.spotify.com/api/token";
        webClient.postAbs(tokenEndpoint)
            .putHeader("Content-Type", "application/x-www-form-urlencoded")
            .basicAuthentication(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
            .sendForm(
                MultiMap.caseInsensitiveMultiMap()
                    .add("grant_type", "authorization_code")
                    .add("code", code)
                    .add("redirect_uri", redirectUri),
                ar -> {
                  if (ar.succeeded()) {
                    JsonObject responseBody = ar.result().bodyAsJsonObject();
                    String accessToken = responseBody.getString("access_token");
                    String refreshToken = responseBody.getString("refresh_token");

                    logger.info("spotify response: " + ar.result().statusCode() + " - " + responseBody.encodePrettily());
                    logger.info("Access Token: " + accessToken);
                    logger.info("Refresh Token: " + refreshToken);

                    if (refreshToken == null){
                      logger.info("null refresh token, ignoring.");
                      return;
                    }

                    saveDataSourceDoc(dataSourceId,
                        new JsonObject().put("expires_epoch_seconds", 0)
//                    .put("expires_epoch_seconds", Instant.now().getEpochSecond() + 1800)
//                    .put("temp_access_token", accessToken)
                            .put("refresh_token", refreshToken),
                      ctx);

                  } else {
                    // Handle failure
                    ctx.response().setStatusCode(500).end("Error exchanging code for tokens");
                  }
                });
        break;

      case "test-example":
        saveDataSourceDoc(dataSourceId, new JsonObject(), ctx);
        break;
    }
  }

  private void getDataSources(RoutingContext ctx){
    JsonObject query = new JsonObject();
    mongoClient.find("data_sources", query)
        .onSuccess((List<JsonObject> dataSources) -> {
          var dataSourcesMap = new JsonObject();
          for (var dataSourceDoc : dataSources){
            dataSourcesMap.put(dataSourceDoc.getString("data_source_id"), dataSourceDoc);
          }

          ctx.response()
              .setStatusCode(200)
              .putHeader(HttpHeaders.CONTENT_TYPE.toString(), "application/json")
              .end(dataSourcesMap.encodePrettily());
        })
        .onFailure(e -> {
          ctx.response().setStatusCode(500).end(e.toString());
        });
  }

  private void listCredentials(RoutingContext ctx){
    try {
      var credentialsOptional = ariesClient.credentials();
      var credentials = credentialsOptional.get();

      JsonObject response = new JsonObject();
      for (var credential : credentials){
        response.put(credential.getCredentialDefinitionId(), "");
      }

      ctx.response().setStatusCode(200).end(response.encode());
    } catch (Exception e) {
      logger.error("Failed to accept issuer invitation.", e);
      ctx.response().setStatusCode(500).end(e.toString());
    }
  }

  private void addCredential(RoutingContext ctx){
    String invitationUrl = ctx.body().asJsonObject().getString("invitationUrl");
    QueryStringDecoder queryStringDecoder = new QueryStringDecoder(invitationUrl);
    List<String> inviteQueryParams = queryStringDecoder.parameters().get("oob");
    if (inviteQueryParams == null || inviteQueryParams.size() != 1){
      logger.error("Failed to find the single 'oob' query parameter in invitation URL");
      ctx.response().setStatusCode(400).end();
      return;
    }
    String invitationJsonBase64 = inviteQueryParams.get(0);
    byte[] invitationMsgBytes = Base64.getDecoder().decode(invitationJsonBase64);
    String invitationMsgJsonStr = new String(invitationMsgBytes, StandardCharsets.UTF_8);

//    Type type = new TypeToken<ReceiveInvitationRequest>(){}.getType();
//    ReceiveInvitationRequest invitationMsg = new Gson().fromJson(invitationMsgJsonStr, type);
    Type type = new TypeToken<InvitationMessage<Object>>(){}.getType();
    InvitationMessage<Object> invitationMsg = new Gson().fromJson(invitationMsgJsonStr, type);

    try {
//      var connRecordOptional = ariesClient.connectionsReceiveInvitation(invitationMsg,
//          ConnectionReceiveInvitationFilter.builder().build());
//      var connRecord = connRecordOptional.orElseThrow();
//      String connId = connRecord.getConnectionId();
      Optional<OOBRecord> oobRecordOptional = ariesClient.outOfBandReceiveInvitation(invitationMsg,
          ReceiveInvitationFilter.builder().autoAccept(true).build());
      var oobRecord = oobRecordOptional.orElseThrow();
      String connId = String.valueOf(oobRecord.getConnectionId());
      waitingForCredentialCtx.put(connId, ctx);

      logger.info("Accepted issuer invitation: " + connId);
    } catch (IOException e) {
      logger.error("Failed to accept issuer invitation.", e);
      ctx.response().setStatusCode(500).end(e.toString());
    }
  }

  private void verifyCredentialWithServProvider(RoutingContext ctx){
    String presentationExchangeId = ctx.request().getParam("presentationExchangeId");
    String credentialId = ctx.request().getParam("credId"); // frontend has Cred ID from detail.relevantCredential.

    Optional<PresentationExchangeRecord> presentationProofResponseOptional = null;
    try {
      var requiredAttributesMap = Map.of(
          "DL_number_referent",
          SendPresentationRequest.IndyRequestedCredsRequestedAttr.builder()
              .credId(credentialId)
              .revealed(true)
              .build());

      presentationProofResponseOptional = ariesClient.presentProofRecordsSendPresentation(
          presentationExchangeId,
          SendPresentationRequest.builder()
              .autoRemove(true)
              .requestedAttributes(
                  requiredAttributesMap)
              .build());

      var connId = presentationProofResponseOptional.get().getConnectionId();
      var presentationProofResponse = presentationProofResponseOptional.orElseThrow();
      waitingForPresentationResCtxs.put(connId, ctx);
      // now wait for basic message to see if verified or not...
    } catch (IOException e) {
      logger.error("Failed to send presentation proof.", e);
      ctx.response().setStatusCode(500).send(e.toString());
    }
  }

//  private void checkServiceProviderCredentialRequirements(RoutingContext ctx){
////    String servProvId = ctx.pathParam("serviceProviderId");
//    String presentationExchangeId = ctx.request().getParam("presentationExchangeId");
//
//    try {
//      Optional<String> relevantCredentialId = checkServiceProviderRelevantCredential(presentationExchangeId);
//      ctx.response().setStatusCode(200).send(relevantCredentialId.orElse(""));
//    } catch (IOException e) {
//      logger.error("Failed to get relevant credentials.", e);
//      ctx.response().setStatusCode(500).send(e.toString());
//    }
//  }

  private void getServProvDetailHandler(RoutingContext ctx){
    String servProvId = ctx.pathParam("serviceProviderId");
    getServProvDetail(servProvId)
        .onSuccess(servProvData -> {
          ctx.response().end(servProvData.encode());
        })
        .onFailure(e -> {
          ctx.response().setStatusCode(500).send(e.toString());
        });
  }

  private Future<JsonObject> getServProvDetail(String servProvId) {
    return servProvService.getServProvData(servProvId)
        .compose(servProvData -> {
          Promise<JsonObject> promise = Promise.promise();


            String presentationExchangeId = servProvData
                .getString("presentationExchangeId");

            // If we still need to verify, then lookup if the relevant credential exists:
            if (presentationExchangeId != null){
              try {
                var relevantCredId = checkServiceProviderRelevantCredential(presentationExchangeId);
                servProvData.put("relevantCredential", relevantCredId.orElse(""));
              } catch (Exception e) {
                logger.warn("Failed to do presentation exchange / relevant credential lookup." +
                    " Assuming that the presentation_exchange ID in the service_provider document is orphaned, and refers to" +
                    " a now-deleted presentation exchange record. Simply not returning the relevantCredential in this case.");
                servProvData.put("relevantCredential", "");
//              promise.fail("Failed to do relevant credential query: " + e.toString());
              }
            }

            promise.complete(servProvData);

          return promise.future();
        });
  }

  private Optional<String> checkServiceProviderRelevantCredential(String presentationExchangeId) throws Exception {
    Optional<List<PresentationRequestCredentials>> relevantCredentialsOptional = Optional.empty();
//    try {
      relevantCredentialsOptional = ariesClient.presentProofRecordsCredentials(
          presentationExchangeId,
          PresentationRequestCredentialsFilter.builder()
              .referent(List.of("DL_number_referent"))
              .build());
//    } catch (IOException e) {
//      logger.error("Failed to get relevant credentials.", e);
//      ctx.response().setStatusCode(500).send(e.toString());
//    }

    String credentialId = null;
    if (relevantCredentialsOptional.isPresent()){
      var relevantCredentials = relevantCredentialsOptional.orElseThrow();

      if (relevantCredentials.size() > 0){
        var relevantCredential = relevantCredentials.get(0);
        credentialId = relevantCredential.getCredentialInfo().getReferent();
      }
    }

    if (credentialId == null){
      // return no credentials.
      return Optional.empty();
    }
    else{
      return Optional.of(credentialId);
    }
  }

  private void presentProofUpdate(RoutingContext ctx){
    try{
      JsonObject message = ctx.body().asJsonObject();

      logger.info("present_proof updated: " + message.encodePrettily());

      String state = message.getString("state");
      String presentationExchangeId = message.getString("presentation_exchange_id");
      String connId = message.getString("connection_id");

      if (state.equals("request_received")){
        var waitingCtx = waitingForPresentationReqCtxs.remove(connId);

        try {
          var presentationRecordOptional = ariesClient.presentProofRecordsGetById(presentationExchangeId);
          var presentationRecord = presentationRecordOptional.orElseThrow();
//          String presReqName = presentationRecord.getPresentationRequest().getName();
//          JsonObject serverBannerData = new JsonObject(presReqName);

          waitingCtx.complete(presentationExchangeId);

        } catch (IOException e) {
          logger.error("Failed to get presentation record.", e);
          waitingCtx.fail(e);
//          waitingCtx.response().setStatusCode(500).send(e.toString());
        }
      }

      ctx.response().setStatusCode(200).end();
    }
    catch(Exception e){
      ctx.response().setStatusCode(500).end();
    }
  }


  private void issueCredentialUpdate(RoutingContext ctx){
    try{
      JsonObject message = ctx.body().asJsonObject();

      // Docs: https://aca-py.org/latest/features/AdminAPI/#pairwise-connection-record-updated-connections
      String userConnectionId = message.getString("connection_id");
      String state = message.getString("state");
      String credentialId = message.getString("credential_id");

      logger.info("issue_credential updated: " + userConnectionId + ", " + state + ", " + credentialId + " - " + message.encodePrettily());

      if (state.equals("deleted")){
        logger.info("issue_credential deleted, assuming added the credential properly.");
        waitingForCredentialCtx.remove(userConnectionId).end(credentialId);
        // ^ TODO add timeout timer to return 400 if no response.
      }

      ctx.response().setStatusCode(200).end();
    }
    catch(Exception e){
      ctx.response().setStatusCode(500).end();
    }
  }

  private void connectionsUpdateHandler(RoutingContext ctx){
      try{
          JsonObject message = ctx.body().asJsonObject();

          // Docs: https://aca-py.org/latest/features/AdminAPI/#pairwise-connection-record-updated-connections
          String userConnectionId = message.getString("connection_id");
          String state = message.getString("state");
          String invitationKey = message.getString("invitation_key");

          logger.info("connection updated: " + userConnectionId + ", " + state + " - " + message.encodePrettily());

          ctx.response().setStatusCode(200).end();
      }
      catch(Exception e){
          ctx.response().setStatusCode(500).end();
      }
  }

  public void listServProvsHandler(RoutingContext ctx){
      servProvService.listServProvs().onSuccess((List<JsonObject> servProvs) -> {
          var servProvsArray = new JsonArray(servProvs);
          ctx.response()
              .setStatusCode(200)
              .putHeader(HttpHeaders.CONTENT_TYPE.toString(), "application/json")
              .end(servProvsArray.encodePrettily());
      });
  }

  /**
   * Handles post request for establishing a connection to a service provider given an invitation message JSON from
   * that service provider in the post body. This tells the ACA-Py agent that we have "received" the invitation
   * message, and progresses the state of the connection.
   */
  private void addServiceProviderHandler(RoutingContext ctx){
    // Deserialize Vertx body via Gson (since ACA-Py wrapper takes Gson-serializable InvitationMessage):
    String invitationMsgUrl = ctx.request().getFormAttribute("invitationUrl");
    QueryStringDecoder queryStringDecoder = new QueryStringDecoder(invitationMsgUrl);
    List<String> oobQueryParams = queryStringDecoder.parameters().get("oob");
    if (oobQueryParams == null || oobQueryParams.size() != 1){
      logger.error("Failed to find the single 'oob' query parameter in invitation URL");
      ctx.response().setStatusCode(400).end();
      return;
    }
    String invitationJsonBase64 = oobQueryParams.get(0);
    byte[] invitationMsgBytes = Base64.getDecoder().decode(invitationJsonBase64);
    String invitationMsgJsonStr = new String(invitationMsgBytes, StandardCharsets.UTF_8);

    Type type = new TypeToken<InvitationMessage<Object>>(){}.getType();
    InvitationMessage<Object> invitationMsg = new Gson().fromJson(invitationMsgJsonStr, type);

    try {
      Optional<OOBRecord> oobRecordOptional = ariesClient.outOfBandReceiveInvitation(invitationMsg,
          ReceiveInvitationFilter.builder().autoAccept(true).build());
      var oobRecord = oobRecordOptional.orElseThrow();
      String connId = String.valueOf(oobRecord.getConnectionId());

//      waitingForPresentationReqCtxs.put(connId, ctx);
      Promise<String> presentationReqPromise = Promise.promise();

      Promise<JsonObject> connResponsePromise = Promise.promise();
      CompositeFuture.all(connResponsePromise.future(), presentationReqPromise.future())
          .onSuccess(r -> {
            JsonObject connResponse = r.resultAt(0);

            boolean requiresCredential = connResponse.getBoolean("requiresCredential");

            JsonObject document = new JsonObject()
                .put("_id", connId)
                .put("connId", connId)
                .put("bannerData", connResponse.getJsonObject("bannerData"));

            if (requiresCredential){
              String presentationExchangeId = r.resultAt(1);
              document = document
                  .put("presentationExchangeId", presentationExchangeId);
            }
            else{
              document = document
                  .put("presentationExchangeId", null)
                  .put("verifiedWith", true);
            }

//          if (!isUsingCredentials){
//            document = document
//                .put("presentationExchangeId", null);
//          }

            this.mongoClient.save("service_providers", document)
                .onSuccess((Void) -> {
                  logger.info("Added Service Provider mapping.");

                  getServProvDetail(connId)
                      .onSuccess(servProvData -> {
                        ctx.response().end(servProvData.encode());
                      })
                      .onFailure(e -> {
                        ctx.response().setStatusCode(500).send(e.toString());
                      });
                })
                .onFailure((Throwable e) -> {
                  logger.error("Failed to set ServProv mapping.", e);
                  ctx.response().setStatusCode(500).send(e.toString());
                });
          })
          .onFailure(e -> {
            logger.error(e.toString());
          });

      waitingForConnResponse.put(connId, connResponsePromise);
      waitingForPresentationReqCtxs.put(connId, presentationReqPromise);
    } catch (IOException e) {
      logger.error("Failed to add Service Provider.", e);
      ctx.response().setStatusCode(500).end();
      throw new RuntimeException(e);
    }
  }

  /**
   * Handles delete request for removing a connection to a service provider, thereby removing the service provider's
   * access.
   */
  private void removeServiceProviderHandler(RoutingContext ctx){
    String servProvId = ctx.pathParam("serviceProviderId");

    // TODO REFACTOR 💀
    // Delete the service provider's access control policy, then delete the service provider object:
    // NOTE on onFailure: Even if these documents don't exist in the database, they will still succeed as futures
    //  and simply not do anything. So if a future fails here then it is unexpected.
    accessControlService.deletePolicyById(servProvId)
        .onSuccess((MongoClientDeleteResult deletePolicyResult) -> {
          servProvService.getServProvConnId(servProvId)
              .onSuccess((String connId) -> {
                // Important order: the policy must be deleted before the service provider object to avoid an orphaned
                // policy on failure.
                servProvService.deleteServProvConnMapping(servProvId)
                    .onSuccess((MongoClientDeleteResult deleteServProvObjResult) -> {
                      try {
                        ariesClient.connectionsRemove(connId); // TODO doesnt seem to remove connection on service provider side.
                      } catch (IOException e) {
                        logger.error("Failed to remove Service Provider connection.", e);
                        ctx.response().setStatusCode(500).end();
                        throw new RuntimeException(e);
                      }
                      logger.info("Deleted Service Provider.");
                      ctx.response().setStatusCode(200).end();
                    })
                    .onFailure((Throwable e) -> {
                      logger.error("Failed to delete Service Provider object.", e);
                      ctx.response().setStatusCode(500).send(e.toString());
                    });
              })
              .onFailure((Throwable e) -> {
                logger.error("Failed to get Service Provider object.", e);
                ctx.response().setStatusCode(500).send(e.toString());
              });
        })
        .onFailure((Throwable e) -> {
          logger.error("Failed to delete Service Provider access control policy.", e);
          ctx.response().setStatusCode(500).send(e.toString());
        });
  }

//  /**
//   * REMARK: Currently access control is quite limited and does not allow fine-grain per-resource access control, as
//   * the access rules of a single service provider are currently defined by independent
//   */
//  private void setServiceProviderAccessControl(RoutingContext ctx){
//    String serviceProviderId = ctx.pathParam("serviceProviderId");
//
//    JsonObject product = ctx.body().asJsonObject();
//    PolicyModel policyModel = product.mapTo(PolicyModel.class);
//
//    servProvService.getServProv(serviceProviderId)
//        .onSuccess((Optional<JsonObject> nullableJsonObj) -> {
//          if (nullableJsonObj.isPresent()){
//            accessControlService.createPolicyById(policyModel.toEntity(serviceProviderId))
//                .onSuccess((String nullableResponse) -> {
//                  logger.info("Updated policy for ServProv: " + serviceProviderId);
//                  ctx.response().setStatusCode(200).end();
//                })
//                .onFailure((Throwable e) -> {
//                  logger.error("Failed to set policy for ServProv.", e);
//                  ctx.response().setStatusCode(500).send(e.toString());
//                });
//          }
//          else{
//            ctx.response().setStatusCode(400).send("Service Provider not found. Make sure you have added the Service " +
//                "Provider.");
//          }
//        })
//        .onFailure((Throwable e) ->{
//          logger.error("Failed to set access control policy.", e);
//          ctx.response().setStatusCode(500).send(e.toString());
//        });
//  }
}