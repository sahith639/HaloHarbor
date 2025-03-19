package nsf.controller;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.vertx.core.AbstractVerticle;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.predicate.ResponsePredicate;
import io.vertx.ext.web.handler.BodyHandler;
import nsf.util.JwtUtil;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import io.netty.handler.codec.http.QueryStringDecoder;
import io.vertx.core.*;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.mongo.MongoClientDeleteResult;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.ext.web.codec.BodyCodec;
import nsf.access.*;
import org.hyperledger.acy_py.generated.model.SendMessage;
import org.hyperledger.aries.AriesClient;
import org.hyperledger.aries.api.out_of_band.InvitationMessage;
import org.hyperledger.aries.api.out_of_band.OOBRecord;
import org.hyperledger.aries.api.out_of_band.ReceiveInvitationFilter;
import org.hyperledger.aries.api.present_proof.PresentationExchangeRecord;
import org.hyperledger.aries.api.present_proof.PresentationRequestCredentials;
import org.hyperledger.aries.api.present_proof.PresentationRequestCredentialsFilter;
import org.hyperledger.aries.api.present_proof.SendPresentationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.DecodeException;
import java.io.IOException;
import java.io.StringReader;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;
import java.util.HashMap;
import java.util.Map;
import io.vertx.ext.web.client.HttpResponse;
import edu.stanford.nlp.ling.*;
import edu.stanford.nlp.sentiment.SentimentCoreAnnotations;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.stream.Collectors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;




public class ControllerVerticle extends AbstractVerticle {
  private static final Logger logger = LoggerFactory.getLogger(ControllerVerticle.class);
  private String currentUserId; // Variable to store the current user ID

  private static ArrayList<String> divided = new ArrayList<String>();
  // TODO DI
  private final MongoClient mongoClient;
  private final AriesClient ariesClient;
  private final BaseAccessControlService accessControlService;
  private final BaseServProvService servProvService;
  private final BaseDataService dataService;
  private static JsonObject userSettings;
  private MongoClient oauthMongoClient;
  private MongoClient locationMongoClient;
  private ConcurrentHashMap<String, ConcurrentHashMap<Integer, String>> dataParts = new ConcurrentHashMap<>();
  private String accesstok;
  private String reftoken;
  private MongoClient userDataMongoClient;


  /**
   * Wait between making a connection to an SP and getting their
   * presentation_proof request.
   */
  private final Map<String, Promise<String>> waitingForPresentationReqCtxs = new ConcurrentHashMap<>();

  /**
   * Wait between sending a presentation_proof to an SP and receiving a basic
   * message response, confirming if it was verified or not.
   */
  private final Map<String, RoutingContext> waitingForPresentationResCtxs = new ConcurrentHashMap<>();

  private final Map<String, RoutingContext> waitingForCredentialCtx = new ConcurrentHashMap<>();

  private final Map<String, Promise<JsonObject>> waitingForServerInfoCtx = new ConcurrentHashMap<>();
  private final Map<String, RoutingContext> waitingForSharedDataAckCtx = new ConcurrentHashMap<>();
  private final Map<String, Promise<JsonObject>> waitingForConnResponse = new ConcurrentHashMap<>();

    private String clientId = "9WfA7mcX0FFYkHD5a_7RUg";
    private String clientSecret = "H_TsrD-Eoa4cqTr6XYVnPOvIXvK-KQ";
    private String redirectUri = "http://localhost:9080/oauth/reddit/callback";
    private String tokenUrl = "https://www.reddit.com/api/v1/access_token";
    private String authUrl = "https://www.reddit.com/api/v1/authorize";
    private String accessToken = null;
    private String userName = null;

    private String spotifyClientId = "bdeca1b0168b4dcfb8f69148dbeb41da";
    private String spotifyClientSecret = "1f0ce4a445fc4bde9a89d602e4dd30db";
    private String spotifyTokenUrl = "https://accounts.spotify.com/api/token";
    private String spotifyAuthUrl = "https://accounts.spotify.com/authorize";
    private String spotifyRedirectUri = "http://localhost:9080/oauth/spotify/callback";
    private String spotifyAccessToken;
    private WebClient webClient;
    private Map<String, Object> resultDA =null;


  Random random = new Random();

  public ControllerVerticle(MongoClient mongoClient, AriesClient ariesClient,
      BaseAccessControlService accessControlService,
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
      webClient = WebClient.create(vertx);
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

//Testing the mongodbConnection
  oauthMongoClient = MongoClient.createShared(vertx, new JsonObject()
        .put("connection_string", "mongodb://localhost:37017/oauthDatabase"));
    router.route().handler(BodyHandler.create().setHandleFileUploads(true));
    router.route().handler(ctx -> {
        ctx.response()
              .putHeader("Access-Control-Allow-Origin", "*")
              .putHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PATCH, PUT")
              .putHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, userId, X-Custom-Header, Another-Header") // Allow all necessary headers
              .putHeader("Access-Control-Allow-Credentials", "true");

      if (ctx.request().method() == HttpMethod.OPTIONS) {
        ctx.response().setStatusCode(200).end();
      } else {
        ctx.next();
      }
    });


    // TODO Refactor split up into multiple handler files.

    router.post("/auth/login").handler(this::handleLogin);
    router.post("/auth/signup").handler(this::handleSignUp);
    router.get("/api/secure-data").handler(this::authenticateJwt).handler(this::handleSecureData);

    router.get("/service-providers").handler(this::listServProvsHandler);
    router.get("/service-providers/:serviceProviderId").handler(this::getServProvDetailHandler);
    // router.get("/relevant-credential").handler(this::checkServiceProviderCredentialRequirements);
    router.post("/service-providers").handler(this::addServiceProviderHandler);
    // router.post("/service-providers/:serviceProviderId/verify").handler(this::verifyCredentialWithServProvider);
    router.post("/verify").handler(this::verifyCredentialWithServProvider);
    router.get("/service-providers/:serviceProviderId/data-menu").handler(this::getDataSharingSettingsHandler);
    router.put("/service-providers/:serviceProviderId/data-menu").handler(this::setDataMenuSettings);
    router.delete("/service-providers/:serviceProviderId").handler(this::removeServiceProviderHandler);
//    router.put("/access/:serviceProviderId").handler(this::setServiceProviderAccessControl);
// Initialize OAuth routes
  // router.get("/auth/google/initiate").handler(this::initiateOAuth);
  // router.get("/auth/google/xlab").handler(this::attemptFetchProfile);
  // Initialize OAuth routes
  router.get("/auth/google/initiate").handler(this::initiateOAuth);
  router.get("/auth/google/xlab").handler(this::handleOAuthCallback);
  
  
  router.get("/auth/fetchProfile").handler(this::attemptFetchProfile);
    //    router.put("/access/:serviceProviderId").handler(this::setServiceProviderAccessControl);
   

// router.get("/fetch/emails").handler(this::fetchEmails);
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
    router.post("/api/location").handler(this::handleLocationPost);
    router.post("/api/yt").handler(this::getYTData);

    //DataPlug

//      router.get("/").handler(ctx -> ctx.response().end("Index Page"));
      //router.get("/oauth/reddit/fetchSavedPosts").handler(ctx -> fetchData(ctx, "http://localhost:9080/oauth/reddit/savedPosts"));
      router.get("/oauth/reddit/fetchSavedPosts").handler(this::getUserSavedPosts);

      //router.get("/oauth/reddit/upVotedPosts").handler(ctx -> fetchData(ctx, "http://localhost:9080/oauth/reddit/upVoted"));
      router.get("/oauth/reddit/upVotedPosts").handler(this::getUserUpVotedPosts);

      //router.get("/oauth/reddit/downVotedPosts").handler(ctx -> fetchData(ctx, "http://localhost:9080/oauth/reddit/downVoted"));
      router.get("/oauth/reddit/downVotedPosts").handler(this::getUserDownVotedPosts);

      //router.get("/oauth/spotify/getTopArt").handler(ctx -> fetchData(ctx, "http://localhost:9080/oauth/spotify/getTopArtists"));
      router.get("/oauth/spotify/getTopArt").handler(this::getUserTopArtists);

      //router.get("/oauth/spotify/getPlaylists").handler(ctx -> fetchData(ctx, "http://localhost:9080/oauth/spotify/getUserPlaylists"));
      router.get("/oauth/spotify/getPlaylists").handler(this::getUserSavedPlaylists);

      router.get("/oauth/reddit/login").handler(this::redirectToReddit);
      router.get("/oauth/reddit/callback").handler(this::getToken);
      router.get("/oauth/reddit/savedPosts").handler(this::getUserSavedPosts);
      router.get("/oauth/reddit/upVoted").handler(this::getUserUpVotedPosts);
      router.get("/oauth/reddit/downVoted").handler(this::getUserDownVotedPosts);

      router.get("/oauth/spotify/login").handler(this::redirectToSpotify);
      router.get("/oauth/spotify/callback").handler(this::getSpotifyToken);
      router.get("/oauth/spotify/getTopArtists").handler(this::getUserTopArtists);
      router.get("/oauth/spotify/getUserPlaylists").handler(this::getUserSavedPlaylists);
      router.get("/oauth/spotify/StoreAllPlayListSongs").handler(this::StoreSongsByPlaylists);
      router.get("/oauth/spotify/getPlayListIDS").handler(this::getPlayListsIds);
      router.get("/oauth/logout").handler(this::logout);

      router.get("/oauth/saveUserDataSettings").handler(this::updateUserControlSettings);
      router.get("/oauth/fetchCollections").handler(this::getCollections);
      router.get("/oauth/getDAData").handler(this::getDAData);


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

    private void redirectToReddit(RoutingContext ctx) {
        String url = authUrl + "?client_id=" + clientId +
                "&response_type=code" +
                "&state=random_string" +
                "&redirect_uri=" + redirectUri +
                "&duration=permanent" +
                "&scope=identity history read";
        ctx.response().setStatusCode(302).putHeader("Location", url).end();
    }

    private void getToken(RoutingContext ctx) {
        String code = ctx.request().getParam("code");
        System.out.println("code:: " + code);
        if (code == null) {
            ctx.response().setStatusCode(400).end("Missing authorization code");
            return;
        }

        MultiMap form = MultiMap.caseInsensitiveMultiMap();
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", redirectUri);

        webClient.postAbs(tokenUrl)
                .basicAuthentication(clientId, clientSecret)
                .putHeader("Content-Type", "application/x-www-form-urlencoded")
                .putHeader("Content-Length", String.valueOf(form.toString().length()))
                .sendForm(form, ar -> {
                    if (ar.succeeded()) {
                        HttpResponse<Buffer> response = ar.result();
                        System.out.println("response body:: " + response.bodyAsString());
                        JsonObject responseBody = response.bodyAsJsonObject();
                        accessToken = responseBody.getString("access_token");
                        System.out.println("accessToken:: " + accessToken);
                        ctx.response().setStatusCode(302).putHeader("Location", "http://localhost:3001/oauth").end();
                    } else {
                        ctx.response().setStatusCode(400).end("OAuth failed");
                    }
                });
    }


    private void getUserSavedPosts(RoutingContext ctx) {
        if (!checkAuthorization(ctx)) return;
        String url = "https://oauth.reddit.com/user/" + userName + "/saved";
        fetchData(ctx, url,"Reddit_Saved_Posts");
    }

    private void getUserUpVotedPosts(RoutingContext ctx) {
        if (!checkAuthorization(ctx)) return;
        String url = "https://oauth.reddit.com/user/" + userName + "/upvoted";
        fetchData(ctx, url,"Reddit_Up_Voted_Posts");
    }

    private void addDocumentToUserDataControl(String docType){
        JsonObject query = new JsonObject().put("userId", currentUserId);

        userDataMongoClient.findOne("userDataAccess", query, null, res -> {
            if (res.succeeded()) {
                System.out.println("In If::");
                JsonObject existingData = res.result();
                if (existingData == null) {
                    // If no existing settings, create a new document with bodyMap
                    JsonObject newUserSettings = new JsonObject().put("userId", currentUserId).put(docType,true);

                    userDataMongoClient.insert("userDataAccess", newUserSettings, insertRes -> {

                    });
                } else {
                    System.out.println("In else::");
                    // Update existing document with bodyMap
                    Map<String, Object> bodyMap = existingData.getMap();
                    if(bodyMap.containsKey(docType)){
                        return;
                    }else{
                        bodyMap.put(docType,true);
                    }
                    System.out.println("In else bodyMap:"+bodyMap);
                    existingData.mergeIn(new JsonObject(bodyMap).put("userId", currentUserId));

                    userDataMongoClient.replaceDocuments("userDataAccess", query, existingData, updateRes -> {
                    });
                }
            }else {
                System.out.println("Error::");
            }
        });
    }

    private void updateUserControlSettings(RoutingContext ctx) {
        try {
            JsonObject requestBody = ctx.body().asJsonObject();
            Map<String, Object> bodyMap = requestBody.getMap();

            if (bodyMap == null || bodyMap.isEmpty()) {
                ctx.response().setStatusCode(400).end("{\"error\": \"Invalid JSON payload\"}");
                return;
            }

            JsonObject query = new JsonObject().put("userId", currentUserId);

            userDataMongoClient.findOne("userDataAccess", query, null, res -> {
                if (res.succeeded()) {
                    JsonObject existingData = res.result();
                    System.out.println("JsonObject:"+existingData);

                    if (existingData == null) {
                        // If no existing settings, create a new document with bodyMap
                        JsonObject newUserSettings = new JsonObject(bodyMap).put("userId", currentUserId);

                        userDataMongoClient.insert("userDataAccess", newUserSettings, insertRes -> {
                            if (insertRes.succeeded()) {
                                ctx.response().setStatusCode(201).end("{\"message\": \"User settings created successfully\"}");
                            } else {
                                ctx.response().setStatusCode(500).end("{\"error\": \"Failed to create user settings\"}");
                            }
                        });
                    } else {
                        // Update existing document with bodyMap
                        existingData.mergeIn(new JsonObject(bodyMap)); // Merge new values into existing document

                        userDataMongoClient.replaceDocuments("userDataAccess", query, existingData, updateRes -> {
                            if (updateRes.succeeded()) {
                                ctx.response().setStatusCode(200).end("{\"message\": \"User settings updated successfully\"}");
                            } else {
                                ctx.response().setStatusCode(500).end("{\"error\": \"Failed to update user settings\"}");
                            }
                        });
                    }
                } else {
                    ctx.response().setStatusCode(500).end("{\"error\": \"Database query failed\"}");
                }
            });

        } catch (Exception e) {
            ctx.response().setStatusCode(500).end("{\"error\": \"Failed to process request\"}");
        }
    }


    private void getUserDownVotedPosts(RoutingContext ctx) {
        if (!checkAuthorization(ctx)) return;
        String url = "https://oauth.reddit.com/user/" + userName + "/downvoted";
        fetchData(ctx, url,"Reddit_Doen_Voted_Posts");
    }

    private boolean checkAuthorization(RoutingContext ctx) {
        if (accessToken == null) {
            ctx.response().setStatusCode(401).end("{\"error\": \"Access token is null\"}");
            return false;
        }

        if (userName == null) {
            String url = "https://oauth.reddit.com/api/v1/me";
            webClient.getAbs(url)
                    .bearerTokenAuthentication(accessToken)
                    .send(ar -> {
                        if (ar.succeeded()) {
                            JsonObject responseBody = ar.result().bodyAsJsonObject();
                            userName = responseBody.getString("name");
                            System.out.println("UserName:: " + userName);
                        }
                    });
        }
        return true;
    }

    private void fetchData(RoutingContext ctx, String url, String collection) {
        webClient.getAbs(url)
                .bearerTokenAuthentication(accessToken)
                .send(ar -> {
                    if(ar.succeeded()) {
                        try {
                            String responseBody = ar.result().bodyAsString();
                            System.out.println("Response body:: " + responseBody);
                            //String filteredJson = filterJson(responseBody);
                            Map<String,Object> result = new ObjectMapper().readValue(responseBody, HashMap.class);
                            ctx.response().putHeader("Content-Type", "application/json")
                                    .end(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(fetchRedditData(result,collection)));
                                    //.end(.toString());

                        } catch (Exception e) {
                            ctx.response().setStatusCode(500).end("{\"error\": \"Failed to process data Please Try Again.\"}");
                        }
                    }else{
                        ctx.response().setStatusCode(500).end("{\"error\": \"Failed to fetch data\"}");
                    }
                    /**if (ar.succeeded()) {
                        ctx.response().putHeader("Content-Type", "application/json")
                                .end(ar.result().bodyAsJsonObject().encodePrettily());
                    } else {
                        ctx.response().setStatusCode(500).end("{\"error\": \"Failed to fetch data\"}");
                    }*/
                });
    }

    /**private static List<Map<String,Object>> fetchSpotifyData(Map<String,Object> map){
        List<Map<String,Object>> list=new ArrayList<>();
        AtomicReference<Map<String, Object>> result = new AtomicReference<>();

        List<Map<String,Object>> data = (List<Map<String,Object>>) map.get("items");
        data.forEach(a->{
            result.set(new HashMap<>());
            result.get().put("type", a.get("type"));
            result.get().put("name", a.get("name"));
            result.get().put("popularity", a.get("popularity"));
            result.get().put("uri", a.get("uri"));
            List<Map<String,Object>> images = (List<Map<String, Object>>) a.get("images");
            result.get().put("imageURL", images.get(0).get("url"));
            result.get().put("totalFollowers", ((Map<String,Object>) a.get("followers")).get("total").toString());
            list.add(result.get());
        });
        System.out.println(list);
        return list;
    }*/

    private  Map<String, String> fetchSpotifyData(Map<String, Object> map) {
        Map<String, String> result = new HashMap<>();

        List<Map<String, Object>> data = (List<Map<String, Object>>) map.get("items");

        if (data.isEmpty()) {
            result.put("Status", "Failure");
            result.put("DB Status", "No Data Found");
            return result;
        }

        data.forEach(a -> {
            List<Map<String, Object>> images = (List<Map<String, Object>>) a.get("images");

            JsonObject query = new JsonObject().put("name", a.get("name"));

            userDataMongoClient.find("spotify_data", query, res -> {
                if (res.succeeded()) {
                    List<JsonObject> existingRecords = res.result();
                    if (existingRecords.isEmpty()) {
                        JsonObject document = new JsonObject()
                                .put("type", a.get("type"))
                                .put("name", a.get("name"))
                                .put("popularity", a.get("popularity"))
                                .put("uri", a.get("uri"))
                                .put("imageURL", images.get(0).get("url"))
                                .put("totalFollowers", ((Map<String, Object>) a.get("followers")).get("total").toString());
                        userDataMongoClient.insert("spotify_data", document, insertRes -> {
                            if (insertRes.succeeded()) {
                                logger.info("Inserted Spotify data: " + a.get("name"));
                            } else {
                                logger.error("Insert Failed: " + insertRes.cause().getMessage());
                            }
                        });
                    } else {
                        logger.info("Spotify data already exists: " + a.get("name"));
                    }
                } else {
                    logger.error("Query Failed: " + res.cause().getMessage());
                }
            });
        });
        addDocumentToUserDataControl("spotify_data");

        result.put("Status", "Success");
        result.put("DB Status", "spotify Top Artists Data Inserted Successfully");

        return result;
    }


    /**private static List<Map<String,Object>> fetchSpotifyDataPlaylists(Map<String,Object> map){
        List<Map<String,Object>> list=new ArrayList<>();
        AtomicReference<Map<String, Object>> result = new AtomicReference<>();

        List<Map<String,Object>> data = (List<Map<String,Object>>) map.get("items");
        data.forEach(a->{
            result.set(new HashMap<>());
            result.get().put("totalPlayLists", map.get("total"));
            result.get().put("collaborative", a.get("collaborative"));
            result.get().put("name", a.get("name"));
            result.get().put("type", a.get("type"));
            result.get().put("public", a.get("public"));
            result.get().put("ownerName", ((Map<String,Object>) a.get("owner")).get("display_name"));
            result.get().put("totalTracks", ((Map<String,Object>) a.get("tracks")).get("total").toString());
            list.add(result.get());
        });
//        System.out.println(list);
        return list;
    }*/

    public void getDAData(RoutingContext ctx) {
        if (this.resultDA == null) {
            ctx.response().setStatusCode(500).end("{\"error\": \"No Data Found\"}");
            return;
        }

        Map<String, Object> temp = resultDA;
        resultDA = null;

        try {
            String jsonResponse = new ObjectMapper().writeValueAsString(temp);
            ctx.response().putHeader("Content-Type", "application/json")
                    .end(jsonResponse);
        } catch (JsonProcessingException e) {
            // Handle the exception if serialization fails
            ctx.response().setStatusCode(500).end("{\"error\": \"Failed to process data\"}");
        }
    }


    public void getCollections(RoutingContext ctx) {
        Promise<Map<String,Object>> promise = Promise.promise();

        // Fetch user data from MongoDB
        userDataMongoClient.findOne("userDataAccess", new JsonObject(), new JsonObject(), res -> {
            if (res.succeeded() && res.result() != null) {

                Map<String,Object> userData = res.result().getMap();
                userData.remove("_id"); // Remove MongoDB's internal ID field

                // Complete the promise with the retrieved user data
                promise.complete(userData);

                // Send the response after fetching the data from MongoDB
                try {
                    ctx.response().putHeader("Content-Type", "application/json")
                            .end(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(userData));
                } catch (JsonProcessingException e) {
                    ctx.response().setStatusCode(500).end("{\"error\": \"Failed to process JSON\"}");
                }
            } else {
                System.err.println("DB Status: Error Fetching User Data from DB - " + (res.cause() != null ? res.cause().getMessage() : "Unknown error"));
                promise.fail(res.cause());
                ctx.response().setStatusCode(500).end("{\"error\": \"Error fetching data from DB\"}");
            }
        });
    }

    public Future<Map<String, Object>> getCollectionsForSpecificUser(String userId) {
        Promise<Map<String, Object>> promise = Promise.promise();

        MongoClient userDataMongoClient1 = createUserDataMongoClient(userId);

        userDataMongoClient1.findOne("userDataAccess", new JsonObject(), new JsonObject(), res -> {
            if (res.succeeded() && res.result() != null) {
                Map<String, Object> userData = res.result().getMap();
                userData.remove("_id"); // Remove MongoDB's internal ID field
                promise.complete(userData);
            } else {
                System.err.println("DB Status: Error Fetching User Data from DB");
                promise.fail(res.cause());
            }
        });

        return promise.future(); // Return a Future, not the result directly
    }


    public void getPlayListsIds(RoutingContext ctx) {
        Promise<List<String>> promise = Promise.promise();

        // Define the query (empty query to match all documents) and projection (only 'id' field)
        JsonObject projection = new JsonObject().put("id", 1).put("name",1).put("_id", 0);

        // Fetch the playlist data from MongoDB with the projection
        userDataMongoClient.findWithOptions("spotify_data_DataPlaylists", new JsonObject(),
                new FindOptions().setFields(projection), res -> {
                    if (res.succeeded()) {
                        System.out.println("In success:: ");

                        List<String> ids = res.result().stream()
                                .map(json -> json.getString("id") + ":"+json.getString("name"))
                                .collect(Collectors.toList());

                        if (ids.isEmpty()) {
                            System.out.println("DB Status: No Data Found");
                        }

                        // Complete the promise with the retrieved playlist IDs
                        promise.complete(ids);

                        // Send the response after fetching the data from MongoDB
                        try {
                            ctx.response().putHeader("Content-Type", "application/json")
                                    .end(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(ids));
                        } catch (JsonProcessingException e) {
                            ctx.response().setStatusCode(500).end("{\"error\": \"Failed to process JSON\"}");
                        }
                    } else {
                        System.err.println("DB Status: Error Fetching Playlists Data from DB - " + res.cause().getMessage());
                        promise.fail(res.cause());
                        ctx.response().setStatusCode(500).end("{\"error\": \"Error fetching data from DB\"}");
                    }
                });
    }


    /**private  List<String> getPlayListsIds() {
        List<String> result = new ArrayList<>();

        final List<String>[] list = new List[]{new ArrayList<>()};

        JsonObject query = new JsonObject();
        JsonObject projection = new JsonObject().put("id", 1).put("_id", 0);
        JsonObject queryWithProjection = new JsonObject()
                .put("query", query)
                .put("fields", projection);
        this.mongoClient.findWithOptions("spotify_data_DataPlaylists", queryWithProjection, new FindOptions(), res -> {
            if (res.succeeded()) {
                // Extract 'id' from each document and collect into a List
                System.out.println("Res: "+ res.result());
                list[0] = res.result().stream()
                        .map(json -> json.getString("id"))
                        .collect(Collectors.toList());
                if(list[0].isEmpty()) {
                    result.add("DB Status: No Data Found");
                }
            } else {
                result.add("DB Status: Error Fetching Playlists Data from DB");
            }
        });

        System.out.println("Result: "+result);
        System.out.println("List: "+ list[0]);
        if(result.isEmpty()) {
            return list[0];
        }
        return  result;

    }*/

    private  Map<String, String> fetchSpotifyDataPlaylists(Map<String,Object> map) {
        Map<String, String> result = new HashMap<>();

        List<Map<String,Object>> data = (List<Map<String,Object>>) map.get("items");
        if (data.isEmpty()) {
            result.put("Status", "Failure");
            result.put("DB Status", "No Data Found");
            return result;
        }
        data.forEach(a->{
//            result.set(new HashMap<>());
//            result.get().put("totalPlayLists", map.get("total"));
//            //result.get().put("collaborative", a.get("collaborative"));
//            //result.get().put("name", a.get("name"));
//            result.get().put("type", a.get("type"));
//            result.get().put("public", a.get("public"));
//            result.get().put("ownerName", ((Map<String,Object>) a.get("owner")).get("display_name"));
//            result.get().put("totalTracks", ((Map<String,Object>) a.get("tracks")).get("total").toString());
//            list.add(result.get());

            JsonObject query = new JsonObject().put("name", a.get("name"));

            userDataMongoClient.find("spotify_data_DataPlaylists", query, res -> {
                if (res.succeeded()) {
                    List<JsonObject> existingRecords = res.result();
                    if (existingRecords.isEmpty()) {
                        JsonObject document = new JsonObject()
                                .put("totalPlayLists", map.get("total"))
                                .put("collaborative", a.get("collaborative"))
                                .put("name", a.get("name"))
                                .put("id", a.get("id"))
                                .put("type", a.get("type"))
                                .put("public", a.get("public"))
                                .put("ownerName", ((Map<String,Object>) a.get("owner")).get("display_name"))
                                .put("totalTracks", ((Map<String,Object>) a.get("tracks")).get("total").toString());
                        userDataMongoClient.insert("spotify_data_DataPlaylists", document, insertRes -> {
                            if (insertRes.succeeded()) {
                                logger.info("Inserted Spotify data: " + a.get("name"));
                            } else {
                                logger.error("Insert Failed: " + insertRes.cause().getMessage());
                            }
                        });
                    } else {
                        logger.info("Spotify data already exists: " + a.get("name"));
                    }
                } else {
                    logger.error("Query Failed: " + res.cause().getMessage());
                }
            });
        });

        addDocumentToUserDataControl("spotify_data_DataPlaylists");

        result.put("Status", "Success");
        result.put("DB Status", "DataPlaylists Data Inserted Successfully");
        return result;
    }

    /**private static List<Map<String,Object>> fetchRedditData(Map<String,Object> map, String collection){
        System.out.println("fetchRedditData.Map: "+ map);
        List<Map<String,Object>> list=new ArrayList<>();
        AtomicReference<Map<String, Object>> result = new AtomicReference<>();
        Map<String,Object> data = (Map<String,Object>) map.get("data");
        List<Map<String,Object>> children = (List<Map<String,Object>>) data.get("children");
        children.forEach(stringObjectMap -> {
            Map<String,Object> child = (Map<String,Object>) stringObjectMap.get("data");
            result.set(new HashMap<>());
            result.get().put("selftext", child.get("selftext"));
            result.get().put("title", child.get("title"));
            result.get().put("name", child.get("name"));
            result.get().put("subreddit_type", child.get("subreddit_type"));
            result.get().put("thumbnail", child.get("thumbnail"));
            result.get().put("url", child.get("url"));
            result.get().put("subreddit_id", child.get("subreddit_id"));
            result.get().put("id", child.get("id"));
            result.get().put("author", child.get("author"));
            list.add(result.get());
        });
        System.out.println(list);
        return list;
    }*/

    private  Map<String, String> fetchRedditData(Map<String,Object> map, String collection){
        Map<String, String> result = new HashMap<>();
        Map<String,Object> data = (Map<String,Object>) map.get("data");
        if (data.isEmpty()) {
            result.put("Status", "Failure");
            result.put("DB Status", "No Data Found");
            return result;
        }

        List<Map<String,Object>> children = (List<Map<String,Object>>) data.get("children");
        children.forEach(stringObjectMap -> {
            Map<String,Object> child = (Map<String,Object>) stringObjectMap.get("data");

            JsonObject query = new JsonObject().put("title", child.get("title"));

            userDataMongoClient.find(collection, query, res -> {
                if (res.succeeded()) {
                    List<JsonObject> existingRecords = res.result();
                    if (existingRecords.isEmpty()) {
                        JsonObject document = new JsonObject()
                                .put("selftext", child.get("selftext"))
                                .put("title", child.get("title"))
                                .put("name", child.get("name"))
                                .put("subreddit_type", child.get("subreddit_type"))
                                .put("thumbnail", child.get("thumbnail"))
                                .put("url", child.get("url"))
                                .put("subreddit_id", child.get("subreddit_id"))
                                .put("id", child.get("id"))
                                .put("author", child.get("author"));
                        userDataMongoClient.insert(collection, document, insertRes -> {
                            if (insertRes.succeeded()) {
                                logger.info("Inserted Reddit data: " + child.get("title"));
                            } else {
                                logger.error("Insert Failed: " + insertRes.cause().getMessage());
                            }
                        });
                    } else {
                        logger.info("Reddit data already exists: " + child.get("title"));
                    }
                } else {
                    logger.error("Query Failed: " + res.cause().getMessage());
                }
            });
        });
        addDocumentToUserDataControl(collection);
        result.put("Status", "Success");
        result.put("DB Status", collection+" Data Inserted");
        return result;
    }



    private void redirectToSpotify(RoutingContext ctx) {
        String url = spotifyAuthUrl + "?client_id=" + spotifyClientId +
                "&response_type=code" +
                "&state=random_string" +
                "&redirect_uri=" + spotifyRedirectUri +
                "&scope=user-library-read user-top-read playlist-read-private";

        ctx.response().setStatusCode(302).putHeader(HttpHeaders.LOCATION, url).end();
    }

    private void getSpotifyToken(RoutingContext ctx) {
        String code = ctx.request().getParam("code");
        System.out.println("code:: " + code);
        if (code == null) {
            ctx.response().setStatusCode(400).end("Missing authorization code");
            return;
        }

        MultiMap form = MultiMap.caseInsensitiveMultiMap();
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("redirect_uri", spotifyRedirectUri);

        webClient.postAbs(spotifyTokenUrl)
                .basicAuthentication(spotifyClientId, spotifyClientSecret)
                .putHeader("Content-Type", "application/x-www-form-urlencoded") // ✅ Correct content type
                .sendForm(form, ar -> {  // ✅ Send form instead of JSON
                    if (ar.succeeded()) {
                        HttpResponse<Buffer> response = ar.result();
                        System.out.println("response body:: " + response.bodyAsString());
                        JsonObject responseBody = response.bodyAsJsonObject();
                        spotifyAccessToken = responseBody.getString("access_token");
                        System.out.println("accessToken:: " + spotifyAccessToken);
                        ctx.response().setStatusCode(302).putHeader("Location", "http://localhost:3001/oauth").end();
                    } else {
                        ctx.response().setStatusCode(400).end("OAuth failed");
                    }
                });
    }


    private void getUserTopArtists(RoutingContext ctx) {
        if (spotifyAccessToken == null) {
            ctx.response().setStatusCode(401).end("Unauthorized");
            return;
        }

        webClient.getAbs("https://api.spotify.com/v1/me/top/artists")
                .putHeader("Authorization", "Bearer " + spotifyAccessToken)
                .expect(ResponsePredicate.SC_OK)
                .send(ar -> {
                    if(ar.succeeded()) {
                        try {
                            String responseBody = ar.result().bodyAsString();
                            System.out.println("Spotify Response body:: " + responseBody);
                            //String filteredJson = filterJson(responseBody);
                            Map<String,Object> result = new ObjectMapper().readValue(responseBody, HashMap.class);
                            ctx.response().putHeader("Content-Type", "application/json")
                                    .end(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(fetchSpotifyData(result)));
                            //.end(.toString());

                        } catch (Exception e) {
                            ctx.response().setStatusCode(500).end("{\"error\": \"Failed to process data\"}");
                        }
                    }else{
                        ctx.response().setStatusCode(500).end("{\"error\": \"Failed to fetch data\"}");
                    }
                    /**if (ar.succeeded()) {
                        ctx.response().putHeader("Content-Type", "application/json").end(ar.result().bodyAsString());
                    } else {
                        ctx.response().setStatusCode(400).end("Failed to fetch top artists");
                    }*/
                });
    }

    private void logout(RoutingContext ctx) {
        this.spotifyAccessToken=null;
        this.accessToken=null;
        this.resultDA=null;
        ctx.response().setStatusCode(200).end("Success");
    }

    //getPlayListsIds
    private void StoreSongsByPlaylists(RoutingContext ctx) {
        if (spotifyAccessToken == null) {
            ctx.response().setStatusCode(401).end("Unauthorized");
            return;
        }

        String id = ctx.pathParam("id");  // If using a path parameter
        if (id == null) {
            id = ctx.request().getParam("id");  // Try getting from query params
        }

        if (id == null || id.isEmpty()) {
            ctx.response().setStatusCode(400).end("Missing playlist ID");
            return;
        }


        List<Map<String, Object>> dMap = new ArrayList<>();
        final String albumName =id.split(":")[1];

        webClient.getAbs("https://api.spotify.com/v1/playlists/" + id.split(":")[0] + "/tracks")
                .putHeader("Authorization", "Bearer " + spotifyAccessToken)
                .expect(ResponsePredicate.SC_OK)
                .send(ar -> {
                    if (ar.succeeded()) {
                        try {
                            String responseBody = ar.result().bodyAsString();
                            System.out.println("Response Body: " + responseBody);

                            Map<String, Object> result = new ObjectMapper().readValue(responseBody, HashMap.class);
                            List<Map<String, Object>> items = (List<Map<String, Object>>) result.get("items");

                            for (Map<String, Object> a : items) {
                                Map<String, Object> data = new HashMap<>();
                                Map<String, Object> track = (Map<String, Object>) a.get("track");
                                if (track == null) continue; // Handle null track

                                Map<String, Object> album = (Map<String, Object>) track.get("album");
                                List<Map<String, Object>> artists = (List<Map<String, Object>>) album.get("artists");

                                List<Map<String, String>> list = new ArrayList<>();
                                for (Map<String, Object> artist : artists) {
                                    Map<String, String> map1 = new HashMap<>();
                                    map1.put("name", (String) artist.get("name"));
                                    map1.put("type", (String) artist.get("type"));
                                    list.add(map1);
                                }

                                data.put("id", track.get("id"));
                                data.put("type", album.get("type"));
                                data.put("album_type", album.get("album_type"));
                                data.put("name", track.get("name"));
                                data.put("artists", list);
                                data.put("popularity", track.get("popularity"));
                                data.put("PartOfPlayList",albumName);

                                dMap.add(data);
                            }
                            ctx.response().putHeader("Content-Type", "application/json")
                                    .end(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(saveData(dMap,albumName)));

                        } catch (Exception e) {
                            System.err.println("Error processing Spotify data for playlist ");
                            ctx.response().setStatusCode(500).end("Error processing Spotify data for playlist");
                        }
                    } else {
                        System.err.println("Failed to fetch playlist: ");
                        ctx.response().setStatusCode(500).end("Failed to fetch playlist: ");
                    }
                });
    }

    private Map<String, String>  saveData(List<Map<String, Object>> map,String albumName){
        Map<String, String> result = new HashMap<>();

        if (map.isEmpty()) {
            result.put("Status", "Failure");
            result.put("DB Status", "No Data Found");
            return result;
        }

        map.forEach(a->{
            JsonObject query = new JsonObject().put("id", a.get("id")).put("name", a.get("name"));
            userDataMongoClient.find("spotify_data_PlayListsSongs", query, res -> {
                if (res.succeeded()) {
                    List<JsonObject> existingRecords = res.result();
                    if (existingRecords.isEmpty()) {
                        JsonObject document = new JsonObject(a);
                        userDataMongoClient.insert("spotify_data_PlayListsSongs", document, insertRes -> {
                            if (insertRes.succeeded()) {
                                logger.info("Inserted Spotify data: " + a.get("name"));
                            } else {
                                logger.error("Insert Failed: " + insertRes.cause().getMessage());
                            }
                        });
                    } else {
                        logger.info("Spotify data already exists: " + a.get("name"));
                    }
                } else {
                    logger.error("Query Failed: " + res.cause().getMessage());
                }
            });
        });

        addDocumentToUserDataControl("spotify_data_PlayListsSongs");

        result.put("Status", "Success");
        result.put("DB Status", albumName+" Data Inserted Successfully");
        return result;
    }

    private void getUserSavedPlaylists(RoutingContext ctx) {
        if (spotifyAccessToken == null) {
            ctx.response().setStatusCode(401).end("Unauthorized");
            return;
        }

        webClient.getAbs("https://api.spotify.com/v1/me/playlists")
                .putHeader("Authorization", "Bearer " + spotifyAccessToken)
                .expect(ResponsePredicate.SC_OK)
                .send(ar -> {
                    if(ar.succeeded()) {
                        try {
                            String responseBody = ar.result().bodyAsString();
                            System.out.println("Spotify Response body:: " + responseBody);
                            //String filteredJson = filterJson(responseBody);
                            Map<String,Object> result = new ObjectMapper().readValue(responseBody, HashMap.class);
                            ctx.response().putHeader("Content-Type", "application/json")
                                    .end(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(fetchSpotifyDataPlaylists(result)));
                        } catch (Exception e) {
                            ctx.response().setStatusCode(500).end("{\"error\": \"Failed to process data\"}");
                        }
                    }else{
                        ctx.response().setStatusCode(500).end("{\"error\": \"Failed to fetch data\"}");
                    }
                    /**if (ar.succeeded()) {
                        ctx.response().putHeader("Content-Type", "application/json").end(ar.result().bodyAsString());
                    } else {
                        ctx.response().setStatusCode(400).end("Failed to fetch playlists");
                    }*/
                });
    }

  // would be useful in future if there's a plan to include third party data providers
  // private void getWatchHistory(RoutingContext ctx)
  // {
  //   WebClient webClient = WebClient.create(vertx);
  //   String url = "https://www.googleapis.com/youtube/v3/activities";
  //   webClient.getAbs(url)
  //           .addQueryParam("part", "snippet,contentDetails")
  //           .addQueryParam("mine", "true")
  //           .addQueryParam("maxResults", "10") // Limit the results
  //           .putHeader("Authorization", "Bearer " + accesstok)
  //           .as(BodyCodec.jsonObject())
  //           .send(ar -> {
  //               if (ar.succeeded()) {
  //                   // Successful response
  //                   JsonObject response = ar.result().body();
  //                   io.vertx.core.json.JsonArray items = response.getJsonArray("items");
  //                   ArrayList<WatchHistoryData> watchHistoryList = new ArrayList<>();
  //                   for (int i = 0; i < items.size(); i++) {
  //                     JsonObject item = items.getJsonObject(i);
  //                     JsonObject snippet = item.getJsonObject("snippet");
  //                     String title = snippet.getString("title", "No Title");
  //                     String description = snippet.getString("description", "No Description");

  //                     // Creating WatchHistoryData object and adding it to the list
  //                     watchHistoryList.add(new WatchHistoryData(title, description));
  //                   }
  //                   for (WatchHistoryData data : watchHistoryList) {
  //                     logger.info(data.toString());
  //                   }
  //                   //ctx.response().putHeader("Location", "http://localhost:3001/profile?accesstoken=" + accesstok +"&refreshToken=" + reftoken).setStatusCode(302).end();
  //               } else {
  //                   // Handle failure (could be token expiration, network issues, etc.)
  //                   logger.error("Failed to fetch watch history: " + ar.cause().getMessage());
  //                   //ctx.response().setStatusCode(500).end("Fetching yt data failed: " + ar.cause().getMessage());
  //               }
  //           });
  // }
 
  // private void getLikes(RoutingContext ctx)
  // {
  //   WebClient webClient = WebClient.create(vertx);
  //   String url = "https://www.googleapis.com/youtube/v3/videos";
  //   webClient.getAbs(url)
  //           .addQueryParam("part", "snippet,contentDetails")
  //           .addQueryParam("myRating", "like")
  //           .addQueryParam("maxResults", "10") // Limit the results
  //           .putHeader("Authorization", "Bearer " + accesstok)
  //           .as(BodyCodec.jsonObject())
  //           .send(ar -> {
  //               if (ar.succeeded()) {
  //                   // Successful response
  //                   JsonObject response = ar.result().body();
  //                   io.vertx.core.json.JsonArray items = response.getJsonArray("items");
  //                   ArrayList<LikesData> likesList = new ArrayList<>();
  //                   for (int i = 0; i < items.size(); i++) {
  //                     JsonObject item = items.getJsonObject(i);
  //                     JsonObject snippet = item.getJsonObject("snippet");
  //                     String title = snippet.getString("title", "No Title");
  //                     String description = snippet.getString("description", "No Description");
  //                     String channelTitle = snippet.getString("channelTitle", "No Channel Title");
  //                     JsonObject contentDetails = item.getJsonObject("contentDetails");
  //                     String duration = contentDetails.getString("duration", "No Duration");

  //                     // Creating SubsData object and adding it to the list
  //                     likesList.add(new LikesData(title, description, channelTitle,duration));
  //                   }
  //                   for (LikesData data : likesList) {
  //                     logger.info(data.toString());
  //                   }
  //                   getVideo("sdfdsfsd");
                    
  //                   //ctx.response().putHeader("Location", "http://localhost:3001/profile?accesstoken=" + accesstok +"&refreshToken=" + reftoken).setStatusCode(302).end();
  //               } else {
  //                   // Handle failure (could be token expiration, network issues, etc.)
  //                   logger.error("Failed to fetch watch history: " + ar.cause().getMessage());
  //                   //ctx.response().setStatusCode(500).end("Fetching yt data failed: " + ar.cause().getMessage());
  //               }
  //           });
  // }
  // private void getYTData1(RoutingContext context){
  //   Buffer uploadedFile = context.getBody();
  //   logger.info("Headers2323: "+ context.fileUploads().toString());
  //   logger.info("Headers: " + context.request().headers());
  //   logger.info("Context : " + context.getBodyAsString());
  //   if (uploadedFile == null || uploadedFile.length() == 0) {
  //     context.response().setStatusCode(400).end("File is missing or empty");
  //     logger.info("Here byt error 1");
  //   }
  
  //   try {
      
  //           String csvContent = uploadedFile.toString();
  //           CSVParser csvParser = CSVFormat.DEFAULT.withHeader().parse(new StringReader(csvContent));
  //           ArrayList<CommentsData> commentsList = new ArrayList<>();
  //           logger.info("Here byt error 2");
  //           for (CSVRecord record : csvParser) {
              
  //             String videoId = record.get("Video ID");
  //             String comment = record.get("Comment Text");

  //             CommentsData data = getVideo(videoId);
  //             data.comment = extractCommentText(comment);
  //             logger.info("Here byt error 3");
  //             data.sentiment = sentimentAnalysis(data.comment);
  //             logger.info("Here byt error 4");

  //           }
  //           context.response().setStatusCode(200).end("File processed successfully!");

  //       } catch (Exception e) {
  //           e.printStackTrace();
  //           context.response().setStatusCode(500).end("Failed to process file.");
  //       }
  //   }
  private void handleSignUp(RoutingContext context){
    JsonObject jsonBody = context.body().asJsonObject();
    String username = jsonBody.getString("username");
    String password = jsonBody.getString("password");
    JsonObject signupQuery = new JsonObject().put("Username", username);
    try{
      mongoClient.find("users",signupQuery, findAr->{
        if(findAr.succeeded()){
          List<JsonObject> documents = findAr.result();
          if(documents.size() == 0 || documents.isEmpty()){
            JsonObject newUser = new JsonObject().put("Username", username).put("Password", password);
            mongoClient.insert("users", newUser, addAr->{
              if(addAr.succeeded()){
                logger.info("New user details have been successfully added to the DB");
                context.response().setStatusCode(200).end("User was added ");
              }
              else{
                logger.info("Error while trying to add new user to the db");
                context.response().setStatusCode(500).end("Error while trying to insert user");
              }
            });
            
          }
          else{
            logger.info("User already exists with the specific username");
            context.response().setStatusCode(500).end("Provided username already exists please try another one");
          }
        }
        else {
          logger.error("Failed to fetch data from MongoDB: " + findAr.cause().getMessage());
          context.response().setStatusCode(500).end("Failed to fetch data from MongoDB");
        }
  
      });
    }
    catch (Exception e) {
      logger.error("Failed to fetch users", e);
      context.response().setStatusCode(500).end("Failed to find users.");
    }

  }
  private MongoClient createUserDataMongoClient(String id){
    String dname= id+"_db";
    JsonObject conf = new JsonObject().put("connection_string", "mongodb://host.docker.internal:37017/").put("db_name",dname);
    return  MongoClient.createShared(vertx,conf,dname);
  }

  private void getYTData(RoutingContext context) {
    if (context.fileUploads().isEmpty()) {
        context.response().setStatusCode(400).end("No files uploaded!");
        return;
    }

    context.fileUploads().forEach(fileUpload -> {
        try {
            Buffer fileBuffer = context.vertx().fileSystem().readFileBlocking(fileUpload.uploadedFileName());
            String fileContent = fileBuffer.toString();

            CSVParser csvParser = CSVFormat.DEFAULT
                    .withHeader()
                    .withIgnoreHeaderCase()
                    .withTrim()
                    .parse(new StringReader(fileContent));

            List<Future> futures = new ArrayList<>();
            AtomicInteger totalRecords = new AtomicInteger(0);

            // Process each CSV record
            for (CSVRecord record : csvParser) {
                String videoId = record.get("Video ID");
                String commentText = record.get("Comment Text");

                totalRecords.incrementAndGet(); // Count total records

                if (videoId == null || videoId.isEmpty()) {
                    logger.warn("Skipping record with missing Video ID.");
                    continue;
                }

                // Asynchronously fetch video details
                Future<CommentsData> future = getVideo(videoId).map(data -> {
                    if (data != null) {
                        data.comment = extractCommentText(commentText);
                        data.sentiment = sentimentAnalysis(data.comment);
                    }
                    return data;
                });

                futures.add(future);
            }

            logger.info("Total number of records to process = " + totalRecords.get());
            logger.info("curent user "+ currentUserId);
            JsonObject filter = new JsonObject().put("User ID", currentUserId);
            //createUserDataMongoClient(currentUserId);

            // Clear MongoDB collection before saving new records
            userDataMongoClient.removeDocuments("youtube", filter , clearAr -> {
                if (clearAr.succeeded()) {
                    logger.info("Cleared existing data in the 'youtube' collection.");

                    // Wait for all `getVideo` tasks to complete
                    CompositeFuture.join(futures).onComplete(ar -> {
                        List<CommentsData> successfulResults = futures.stream()
                                .filter(Future::succeeded)
                                .map(f -> (CommentsData) ((Future) f).result())
                                .collect(Collectors.toList());

                        logger.info("Number of successful results: " + successfulResults.size());

                        if (successfulResults.isEmpty()) {
                            // No successful records
                            context.response().setStatusCode(200).end("No records were successfully processed.");
                            return;
                        }

                        // Insert successful results into MongoDB
                        List<Future> saveFutures = new ArrayList<>();
                        successfulResults.forEach(data -> {
                            Future<Void> saveFuture = Future.future(promise -> {
                                JsonObject document = new JsonObject()
                                        .put("User ID", currentUserId)
                                        .put("Title of Video", data.title)
                                        .put("Description of Video", data.description)
                                        .put("Category ID", data.categoryId)
                                        .put("Comment", data.comment)
                                        .put("Sentiment", data.sentiment);

                                userDataMongoClient.insert("youtube", document, saveAr -> {
                                    if (saveAr.succeeded()) {
                                        logger.info("Successfully saved record for Video: " + data.title);
                                        promise.complete();
                                    } else {
                                        logger.error("Failed to save record for Video: " + data.title, saveAr.cause());
                                        promise.fail(saveAr.cause());
                                    }
                                });
                            });

                            saveFutures.add(saveFuture);
                        });

                        // Wait for all save operations to complete
                        CompositeFuture.all(saveFutures).onComplete(saveAr -> {
                            if (saveAr.succeeded()) {
                                context.response().setStatusCode(200).end("Processed and saved " + successfulResults.size() + " records successfully.");
                            } else {
                                logger.error("Failed to save some records.");
                                context.response().setStatusCode(200).end("Processed " + successfulResults.size() + " records, but some failed to save.");
                            }
                        });
                    });

                } else {
                    logger.error("Failed to clear the 'youtube' collection: " + clearAr.cause().getMessage());
                    context.response().setStatusCode(500).end("Failed to clear existing data in MongoDB.");
                }
            });

        } catch (Exception e) {
            logger.error("Error processing file: ", e);
            context.response().setStatusCode(500).end("Failed to process file.");
        }
    });
  }

  private Future<CommentsData> getVideo(String videoId)
  {
    Promise<CommentsData> promise = Promise.promise();
    WebClient webClient = WebClient.create(vertx);
    String url = "https://www.googleapis.com/youtube/v3/videos";
    CommentsData[] cData= new CommentsData[1];
    webClient.getAbs(url)
            .addQueryParam("part", "snippet,contentDetails")
            .addQueryParam("id", videoId)// get the specific video
            .putHeader("Authorization", "Bearer " + accesstok)
            .as(BodyCodec.jsonObject())
            .send(ar -> {
                if (ar.succeeded()) {
                  try{
                    JsonObject response = ar.result().body();
                    io.vertx.core.json.JsonArray items = response.getJsonArray("items");
                    if (items == null || items.isEmpty()) {
                        promise.fail("No video data found for Video ID: " + videoId);
                        return;
                    }
                    JsonObject item = items.getJsonObject(0);

                    JsonObject snippet = item.getJsonObject("snippet");
                    String title = snippet.getString("title", "No Title");
                    String description = snippet.getString("description", "No Description");
                    String categoryId = snippet.getString("categoryId", "N/A");

                    JsonObject contentDetails = item.getJsonObject("contentDetails");
                    String duration = contentDetails.getString("duration", "No Duration");
                    CommentsData data =  new CommentsData(title, description, categoryId,duration);
                    promise.complete(data);
                  }
                  catch (Exception e) {
                    // Handle any parsing errors
                    promise.fail("Failed to parse video details: " + e.getMessage());
                }
                  
                    //ctx.response().putHeader("Location", "http://localhost:3001/profile?accesstoken=" + accesstok +"&refreshToken=" + reftoken).setStatusCode(302).end();
                } 
                else {
                    // Handle failure (could be token expiration, network issues, etc.)
                    promise.fail("Failed to fetch video data: " + ar.cause().getMessage());
                    //ctx.response().setStatusCode(500).end("Fetching yt data failed: " + ar.cause().getMessage());
                }
                
            });
            return promise.future();
  }
  // extract comment from the comment tree we get from csv file
  private String extractCommentText(String jsonString) {
        try {
            // Parse the JSON string using ObjectMapper
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonString);
            JsonNode textNode = rootNode.path("text");

            return textNode.asText();
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

  //performing sentiment analysis and categorizing the comment
  private int sentimentAnalysis(String text) {
    if (text == null || text.isEmpty()){
      logger.info("Provided text is empty");
      return 0;
    } 

    // Set up Stanford CoreNLP pipeline
    Properties props = new Properties();
    props.setProperty("annotators", "tokenize, ssplit, parse, sentiment");
    StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
    Annotation annotation = new Annotation(text);
    pipeline.annotate(annotation);

    // Analyze sentiment for each sentence
    List<CoreMap> sentences = annotation.get(CoreAnnotations.SentencesAnnotation.class);
    int totalSentimentScore = 0;
    int sentenceCount = 0;

    for (CoreMap sentence : sentences) {
        String sentiment = sentence.get(SentimentCoreAnnotations.SentimentClass.class);

        // Map sentiment to numerical score
        int sentimentScore = sentiment.equalsIgnoreCase("Very positive") ? 2
                          : sentiment.equalsIgnoreCase("Positive") ? 1
                          : sentiment.equalsIgnoreCase("Neutral") ? 0
                          : sentiment.equalsIgnoreCase("Negative") ? -1
                          : sentiment.equalsIgnoreCase("Very negative") ? -2
                          : 0;

        totalSentimentScore += sentimentScore;
        sentenceCount++;
    }

    // Calculate average sentiment score
    double averageSentimentScore = (double) totalSentimentScore / sentenceCount;
    logger.info("sentement score is : Total- "+ totalSentimentScore +" Sentence - " +sentenceCount+ " average = "+averageSentimentScore);

    // Map average score to sentiment category
    if (averageSentimentScore > 0) return 1;
    if (averageSentimentScore == 0) return 0;
    return -1;
}

  private void handleLocationPost(RoutingContext context) {
    JsonObject json = context.getBodyAsJson();
    mongoClient.save("locationDataCollection", json, res -> {
      if (res.succeeded()) {
        context.response()
          .setStatusCode(200)
          .putHeader("Content-Type", "application/json")
          .end(new JsonObject().put("status", "Location data saved successfully!").encode());
      } else {
        logger.error("Failed to save location data: " + res.cause());
        context.response()
          .setStatusCode(500)
          .putHeader("Content-Type", "application/json")
          .end(new JsonObject().put("error", "Failed to save location data").encode());
      }
    });
}


private void saveLocationData(LocationData locationData, Handler<AsyncResult<Void>> resultHandler) {

  locationMongoClient = MongoClient.createShared(vertx, new JsonObject()
  .put("connection_string", "mongodb://localhost:37017/mapsDatabase"));

  JsonObject document = new JsonObject()
      .put("latitude", locationData.getLatitude())
      .put("longitude", locationData.getLongitude())
      .put("timestamp", locationData.getTimestamp());

      locationMongoClient.save("locationDataCollection", document, res -> {
      if (res.succeeded()) {
          resultHandler.handle(Future.succeededFuture());
      } else {
          resultHandler.handle(Future.failedFuture(res.cause()));
      }
  });
}
  // change the client ID accordingly to the need, same with scope
  private void initiateOAuth(io.vertx.ext.web.RoutingContext ctx) {
    String authorizationUri = "https://accounts.google.com/o/oauth2/auth?" +
            "client_id=821706558807-q9aj30q47rqjb2876isgcjk68jsii830.apps.googleusercontent.com&" +
            "response_type=code&" +
            "scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube&" +
            "redirect_uri=http://localhost:9080/auth/google/xlab&" +
            "access_type=offline&prompt=consent";
    ctx.response().putHeader("Location", authorizationUri).setStatusCode(302).end();
}


  private void getCollectedData(RoutingContext ctx){
    JsonObject allQuery = new JsonObject();
    mongoClient.find("shared_data_items", allQuery, h -> {
      if (h.succeeded()) {
        JsonArray response = new JsonArray(h.result());
        ctx.response().setStatusCode(200).end(response.encode());
      } else {
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
    // try{
    // Optional<List<ConnectionRecord>> invitationsOptional =
    // ariesClient.connections(ConnectionFilter.builder().state(ConnectionState.INVITATION).build());
    // List<ConnectionRecord> invitations = invitationsOptional.orElse(List.of());

    // JsonArray invitationsJson = new JsonArray();
    // invitations.forEach(record -> {
    // invitationsJson.add(new JsonObject().put("invKey",
    // record.getInvitationKey()));
    // });
    // }
    // catch(Exception e){
    // ctx.response().setStatusCode(500).end();
    // }
    logger.info("handler");

    JsonObject jsonObject;
    try {
      jsonObject = ctx.getBodyAsJson();
      String jsonString = jsonObject.encodePrettily(); // Or use .encode() for compact format
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
          final int pieces = Math.max(length / 350000, 1); // Number of pieces to divide the string into
          final int n = divided.length;
          Thread thread = new Thread(() -> {
            for (int i = 0; i < n; i++) {
              final String divided_str = divided[i];
              sendBasicMessage(connId, "TRAIN_RESPONSE",
                  new JsonObject().put("id", i).put("total", pieces).put("value", divided_str), null);
            }
          });
          thread.start();
        });
    ctx.response().setStatusCode(200).end();
    return;

  }

  public String[] divideString(String input) {
    // Check if input string is null or empty
    if (input == null || input.isEmpty()) {
      return new String[0];
    }

    int length = input.length();
    int pieces = Math.max(length / 350000, 1); // Number of pieces to divide the string into
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

  private void outOfBandHandler(RoutingContext ctx) {
    try {
      JsonObject message = ctx.body().asJsonObject();

      String user_connection_id = message.getString("connection_id");
      String invitation_message_id = message.getString("invi_msg_id");

      logger.info("out of band webhook: " + user_connection_id + ", " + invitation_message_id);

      ctx.response().setStatusCode(200).end();
    } catch (Exception e) {
      ctx.response().setStatusCode(500).end();
    }
  }

  private static Map<String, List<Integer>> parseCsv(String csvContent) {
    Map<String, List<Integer>> sentimentMap = new HashMap<>();
    String[] lines = csvContent.split("\n");

    for (int i = 1; i < lines.length; i += 1) {
      String[] row = lines[i].trim().split(",");

      if (row.length > 5) {
        try {
          int sentimentValue = Integer.parseInt(row[5].trim());
          String userId = row[0].trim();

          List<Integer> sentiments = sentimentMap.getOrDefault(userId, new ArrayList<>());
          sentiments.add(sentimentValue);
          sentimentMap.put(userId, sentiments);
        } catch (NumberFormatException e) {
          System.err.println("Invalid sentiment value at row " + (i + 1) + ": " + row[5]);
        }
      } else {
        System.err.println("Row " + (i + 1) + " does not have enough columns: " + lines[i]);
      }
    }

    return sentimentMap;
  }

  // private static JsonObject calculateAverageSleepPerDisorder(Map<String,
  // Double> sleepDurationMap) {
  // Map<String, Double> sleepPerDisorder = new HashMap<>();
  // Map<String, Integer> countPerDisorder = new HashMap<>();

  // // Calculate total sleep duration and count for each sleep disorder
  // for (Map.Entry<String, Double> entry : sleepDurationMap.entrySet()) {
  // String key = entry.getKey().toLowerCase(); // Assuming sleep disorders are
  // case insensitive
  // double value = entry.getValue();

  // sleepPerDisorder.put(key, sleepPerDisorder.getOrDefault(key, 0.0) + value);
  // countPerDisorder.put(key, countPerDisorder.getOrDefault(key, 0) + 1);
  // }

  // // Calculate average sleep duration per sleep disorder and construct
  // JsonObject
  // JsonObject result = new JsonObject();
  // for (Map.Entry<String, Double> entry : sleepPerDisorder.entrySet()) {
  // String key = entry.getKey();
  // double totalSleep = entry.getValue();
  // int count = countPerDisorder.get(key);
  // double averageSleep = totalSleep / count;

  // // Add sleep disorder and average sleep duration to JsonObject
  // JsonObject disorderEntry = new JsonObject()
  // .put("sleepDisorder", key)
  // .put("averageSleepDuration", averageSleep);
  // result.put(key, disorderEntry);
  // }

  // return result;
  // }

  private static ObjectNode calculateAverageSentimentPerUser(Map<String, List<Integer>> userSentimentMap) {
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode result = mapper.createObjectNode();
    System.out.println(userSentimentMap);
    System.out.println(result);
    System.out.println("--------------------------------");

    // Example of adding data to ObjectNode
    for (Map.Entry<String, List<Integer>> entry : userSentimentMap.entrySet()) {
      String userId = entry.getKey();
      double averageSentiment = calculateAverage(entry.getValue());
      result.put(userId, averageSentiment);
    }

    return result;
  }

  private static double calculateAverage(List<Integer> sentiments) {
    return sentiments.stream().mapToInt(Integer::intValue).average().orElse(0.0);
  }

    private Future<Map<String, Object>> getDat(Map<String, Object> data, String id, MongoClient userDataMongoClient1) {
        Promise<Map<String, Object>> finalPromise = Promise.promise();
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("id", id);
        List<Future> futures = new ArrayList<>();
        //MongoClient userDataMongoClient1 = createUserDataMongoClient(id);

        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if ((boolean) entry.getValue()) {
                String collectionName = entry.getKey();
                Promise<List<JsonObject>> promise = Promise.promise();
                futures.add(promise.future());

                userDataMongoClient1.find(collectionName, new JsonObject(), res2 -> {
                    if (res2.succeeded()) {
                        List<JsonObject> documents = res2.result();
                        resultData.put(collectionName, documents);
                        promise.complete(documents);
                    } else {
                        System.err.println("Error fetching data from " + collectionName + ": " + res2.cause().getMessage());
                        promise.fail(res2.cause());
                    }
                });
            }
        }

        // Wait for all futures to complete before resolving the final promise
        CompositeFuture.all(futures).onComplete(ar -> {
            if (ar.succeeded()) {
                System.out.println("All database calls succeeded");
                //System.out.println("Final resultData: " + resultData);
                finalPromise.complete(resultData);
            } else {
                System.out.println("Some database calls failed");
                finalPromise.fail("Failed to fetch all data");
            }
        });

        return finalPromise.future(); // Now the function returns a Future that resolves when all queries are done
    }


    /**private Map<String, List<JsonObject>> getDat(Map<String,Object> data, String id){
      Map<String, List<JsonObject>> resultData = new HashMap<>();
      List<Future> futures = new ArrayList<>();
      MongoClient userDataMongoClient1= createUserDataMongoClient(id);

      for (Map.Entry<String, Object> entry : data.entrySet()) {
          if ((boolean) entry.getValue()) {
              String collectionName = entry.getKey();
              Promise<List<JsonObject>> promise = Promise.promise();
              futures.add(promise.future());

              userDataMongoClient1.find(collectionName, new JsonObject(), res2 -> {
                  if (res2.succeeded()) {
                      List<JsonObject> documents = res2.result();
                      resultData.put(collectionName, documents);
                      promise.complete(documents);
                  } else {
                      System.err.println("Error fetching data from " + collectionName + ": " + res2.cause().getMessage());
                      promise.fail(res2.cause());
                  }
              });
          }
      }

      // Wait for all database queries to complete before sending a response
      CompositeFuture.all(futures).onComplete(ar -> {
          if (ar.succeeded()) {
              System.out.println("All calls Success");
              System.out.println("resultData::: "+resultData);
          }else{
              System.out.println("All calls Not Success");
          }
      });
      System.out.println("resultData:: "+resultData);
      return resultData;
  }*/

  HashSet<String> uniqueMessagesMap = new HashSet<>();

  private void basicMessageHandler(RoutingContext webhookCtx) {
    JsonObject message = webhookCtx.body().asJsonObject();
    System.out.println("messageLoki: " + message);

    String connId = message.getString("connection_id");
    logger.info("User conn id" + connId);

    JsonObject basicMessagePackage = new JsonObject(message.getString("content"));

    String uniqueMessageId = basicMessagePackage.getString("uniqueMessageId");
    if (uniqueMessagesMap.contains(uniqueMessageId)) {
      logger.warn("Duplicate message: " + message.encodePrettily());
      return;
    }
    uniqueMessagesMap.add(uniqueMessageId);

    // String threadNonceId = basicMessagePackage.getString("threadNonceId");
    String messageId = basicMessagePackage.getString("messageId");
    String messageTypeId = basicMessagePackage.getString("messageTypeId");
    Object payload = basicMessagePackage.getValue("payload");

    logger.info("Received basic message: ");

    switch (messageTypeId) {
        case "GETUSERCONTROLDATA": {
            //getCollectionsForSpecificUser()
            JsonObject userQuery = new JsonObject().put("connId", connId);
            System.out.println("GETUSERCONTROLDATA userQuery:: " + connId);
            mongoClient.findOne("service_providers", userQuery, null, res -> {
                if (res.succeeded()) {
                    JsonObject existingData = res.result();
                    String userId = existingData.getString("userId");
                    System.out.println("UserId: " + userId);
                    getCollectionsForSpecificUser(userId).onComplete(res1 -> {
                        if (res1.succeeded()) {
                            Map<String, Object> userData = res1.result();
                            System.out.println("User Data: " + userData);
                            sendBasicMessage(connId, "GETUSERCONTROLDATA", userData, null);
                        } else {
                            System.err.println("Error: " + res1.cause().getMessage());
                        }
                    });
                }
            });
        }
        break;
        case "DATAACQ": {
            JsonObject userQuery = new JsonObject().put("connId", connId);
            System.out.println("userQuery:: " + connId);
            Map<String, Object> mapData;
            if (payload instanceof JsonObject) {
                mapData = ((JsonObject) payload).getMap();
                System.out.println("payload: " + mapData);
            } else {
                mapData = null;
                System.err.println("Error: Payload is not a JsonObject");
            }


            mongoClient.findOne("service_providers", userQuery, null, res -> {
                if (res.succeeded()) {
                    JsonObject existingData = res.result();

                    if (existingData != null) {
                        String userId = existingData.getString("userId");
                        System.out.println("UserId: " + userId);
                        MongoClient userDataMongoClient1 = createUserDataMongoClient(userId);

                        // If userId is found, query the userDataAccess collection
                        JsonObject userQuery1 = new JsonObject().put("userId", userId);

                        if(mapData!=null || !mapData.isEmpty()){
                            System.out.println("In IF::: ");
                            getDat(mapData, userId,userDataMongoClient1).onComplete(ar -> {
                                if (ar.succeeded()) {
                                    //Map<String, Object> result = ar.result();
                                    //this.resultDA = ar.result();
                                    //System.out.println("Final Data: " + this.resultDA);
                                    sendBasicMessage(connId, "DATAACQSP", ar.result(), null);

                                } else {
                                    System.err.println("Failed to fetch data: " + ar.cause().getMessage());
                                }
                            });
                            //Map<String, List<JsonObject>> resultData = getDat(mapData, userId);
                        }else{
                            System.out.println("In Else::: ");
                            userDataMongoClient1.findOne("userDataAccess", userQuery1, null, res1 -> {
                                if (res1.succeeded()) {
                                    Map<String,Object> data = res1.result().getMap();
                                    data.remove("_id");data.remove("userId");
                                    System.out.println("Data: " + data);

                                    //Map<String, List<JsonObject>> resultData = getDat(data,userId);
                                    getDat(data, userId,userDataMongoClient1).onComplete(ar -> {
                                        if (ar.succeeded()) {
                                            //Map<String, Object> result = ar.result();
                                            //System.out.println("Final Data: " + result);
                                            //this.resultDA = ar.result();
                                            //System.out.println("Final Data: " + this.resultDA);
                                            sendBasicMessage(connId, "DATAACQSP", ar.result(), null);
                                        } else {
                                            System.err.println("Failed to fetch data: " + ar.cause().getMessage());
                                        }
                                    });
                                } else {
                                    System.out.println("Error Extracting Data from userDataAccess");
                                }
                            });
                        }

                    } else {
                        System.out.println("Existing data not found for connId: " + connId);
                    }
                } else {
                    System.out.println("Database query failed, User Not Found for connId: " + connId);
                }
            });
            break;
        }
        case "CONN_RESPONSE": {
        JsonObject payloadData = (JsonObject) payload;
        var promise = waitingForConnResponse.remove(connId);
        promise.complete(payloadData);
      }
        break;
      case "INFO_RESPONSE": {
        var waitingPromise = waitingForServerInfoCtx.remove(messageId);
        JsonObject payloadData = (JsonObject) payload;
        waitingPromise.complete(payloadData);
        // waitingCtx.response().setStatusCode(200).end(payloadData.encode());
      }
        break;
      case "VERIFY_RESPONSE": {
        var waitingCtx = waitingForPresentationResCtxs.remove(connId);
        boolean isSuccessful = (Boolean) payload;
        JsonObject query2 = new JsonObject().put("_id", connId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("presentationExchangeId", null)
            .put("verifiedWith", isSuccessful));
        mongoClient.updateCollection("service_providers", query2, update, res -> {
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
      case "SHARED_DATA_ACK": {
        var waitingCtx = waitingForSharedDataAckCtx.remove(messageId);
        int sharedCount = (Integer) payload;
        if (sharedCount < 0) {
          logger.warn("SP rejected shared data - not verified?");
        }
        JsonObject responseData = new JsonObject()
            .put("itemsSharedCount", sharedCount);
        waitingCtx.response().setStatusCode(200).end(responseData.encode());
      }
        break;
      /*
       * case "TRAIN":
       * {
       * JsonObject payloadData = (JsonObject)payload;
       * int id = payloadData.getInteger("id");
       * logger.info("id"+Integer.toString(id));
       * int total = payloadData.getInteger("total");
       * String content = payloadData.getString("value");
       * while(id>divided.size()){
       * divided.add(divided.size(),"QWERTY");
       * }
       * if(divided.size()==total && (divided.contains("QWERTY")) ){
       * 
       * divided.add(id , content);
       * payloadData = (JsonObject)Json.decodeValue(String.join("",divided));
       * logger.info("Sending payload");
       * WebClient webClient = WebClient.create(vertx, new
       * WebClientOptions().setSsl(true));
       * webClient.post(4600, "host.docker.internal", "/train") // Can be adjusted for
       * different HTTP methods (GET, PUT, etc.)
       * .sendJsonObject(payloadData).onSuccess(res -> {
       * });
       * logger.info("Sent payload");
       * divided.removeAll(divided);
       * }else{
       * divided.add(id , content);
       * }
       * }
       * break;
       * }
       */

      case "TRAIN": {
        JsonObject payloadData = (JsonObject) payload;
        int id = payloadData.getInteger("id");
        String client_id = payloadData.getString("client_id");
        logger.info("Client: " + client_id + " Received segment ID: " + id);

        int total = payloadData.getInteger("total");
        String content = payloadData.getString("value");
        // Get or create a map for storing segments for this specific connection
        ConcurrentHashMap<Integer, String> segments = dataParts.computeIfAbsent(connId, k -> new ConcurrentHashMap<>());

        // Store the current segment
        segments.put(id, content);

        // Check if all segments from 0 to total-1 are present
        if (segments.size() == total
            && segments.keySet().stream().sorted().reduce((a, b) -> a + 1 == b ? b : -1).orElse(-1) + 1 == total) {

          logger.info("Client: " + client_id + userSettings.encode());

          if (String.valueOf(userSettings.getBoolean(client_id)).equals("true")) {

            StringBuilder fullContent = new StringBuilder();
            for (int i = 0; i < total; i++) {
              fullContent.append(segments.get(i));
            }

            // Log that we are sending the complete payload
            logger.info("Sending full payload");
            JsonObject completeData = new JsonObject().put("completeData", fullContent.toString());

            WebClient webClient = WebClient.create(vertx, new WebClientOptions().setSsl(false));
            webClient.post(4600, "flclient", "/train")
                .sendJsonObject(completeData)
                .onSuccess(res -> logger.info("Payload sent successfully"))
                .onFailure(err -> logger.error("Failed to send payload: " + err.getMessage()));
          } else {
            logger.info("Rejecting the Training");
            JsonObject completeData = new JsonObject().put("value", "None").put("data",
                new JsonObject().put("client_id", client_id));
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
        JsonObject userquery1 = new JsonObject().put("connId", connId);
        mongoClient.findOne("service_providers", userquery1, null, ar -> {
          if (ar.succeeded()) {
            JsonObject user = ar.result();
            System.out.println("user: " + user);
            if (user != null) {
              AtomicBoolean hasRedditUpvotePermission = new AtomicBoolean(false);
              String userId = user.getString("userId");
              logger.info("Found user with ID: " + userId + " for connection: " + connId);
              MongoClient computeUserClient = createUserDataMongoClient(userId);
              // Query  if the user actually gave permission to use Reddit_upvote data
              
              computeUserClient.find("userDataAccess", new JsonObject(), res -> {
                if (res.succeeded()) {
                  JsonObject userDataAccess = res.result().get(0);
                  System.out.println("userDataAccess: " + userDataAccess);
                  // Check if the user has given permission to use Reddit_upvote data
                  hasRedditUpvotePermission.set(userDataAccess.getBoolean("Reddit_Up_Voted_Posts", false));
                  if (hasRedditUpvotePermission.get()) {
                    logger.info("User has given permission to use Reddit_upvote data.");
                    computeUserClient.find("Reddit_Up_Voted_Posts", new JsonObject(), result -> {
                      if (result.succeeded()) {
                        List<JsonObject> documents = result.result();
                        logger.info("Calling the reddit_compute function in the FLClient");
                        webClient.post(4600, "flclient", "/reditCompute")
                        .sendJson(new JsonArray(documents))
                        .onSuccess(response -> {
                            try {
                                // Parse response to JsonArray
                                JsonArray jsonArray = response.bodyAsJsonArray();
                                logger.info("Response from reddit_compute: " + jsonArray.encodePrettily());

                                // Create a set to store unique artist names
                                Set<String> uniqueArtists = new HashSet<>();

                              
                                for (int i = 0; i < jsonArray.size(); i++) {
                                    JsonArray innerArray = jsonArray.getJsonArray(i);
                                    // Add each string from inner array to the set
                                    for (int j = 0; j < innerArray.size(); j++) {
                                        uniqueArtists.add(innerArray.getString(j));
                                    }
                                }

                                // Convert set to list for final result
                                List<String> uniqueList = new ArrayList<>(uniqueArtists);
                                logger.info("Successfully processed " + uniqueList.size() + " unique items");

                                logger.info("uniqueList: " + uniqueList);       
                                // Send response
                                sendBasicMessage(connId, "COMPUTE_RESPONSE", new JsonObject().put(userId, uniqueList), null);
                                logger.info("Sent reddit payload back to the sp");
                            } catch (Exception e) {
                                logger.error("Failed to process response data: " + e.getMessage());
                            }
                        }) 
                        .onFailure(err -> {
                            logger.error("Failed to send payload: " + err.getMessage());
                        });

                
                      } else {
                        logger.error("Failed to fetch data from MongoDB: " + result.cause().getMessage());
                        computeUserClient.close();
                      }
                    });


                    
                  } else {
                    logger.warn("User has not given permission to use Reddit_upvote data.");
                    sendBasicMessage(connId, "COMPUTE_RESPONSE", new JsonObject().put(userId, "User has not given permission to use Reddit_upvote data."), null);
                  }
                } else {
                  logger.error("Failed to fetch user data access permissions: " + res.cause().getMessage());
                }
              });    

            } else {
              logger.warn("No user found for connection ID: " + connId);
            }
          } else {
            logger.error("Failed to query user for connection ID: " + connId, ar.cause());
          }
        });
      }
        break;
    }

    webhookCtx.response().setStatusCode(200).end();
  }


  private String generateMsgId(String connId) {
    // random nonce is needed to prevent async message threads from colliding with
    // eachother (i.e. if multiple messages are being sent over the same connection
    // at the same time -- so the nonce is used to link them).
    return connId + "-" + String.valueOf(random.nextInt());
  }

  private void sendBasicMessage(String connId, String messageTypeId, Object dataPayload, String messageId) {
    if (messageId == null) {
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
   * Not actually used according to the API docs:
   * https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow#:~:text=This%20parameter%20is%20used%20for%20validation%20only
   */
  private static final String REDIRECT_URI = "http://localhost:2999/profile";

  private Future<String> refreshSpotifyAccessToken() {
    JsonObject query = new JsonObject()
        .put("_id", "spotify");
    return mongoClient.find("data_sources", query)
        .compose(sharingData -> {
          Promise<String> promise = Promise.promise();
          if (sharingData.size() > 0) {
            JsonObject spotifySharingData = sharingData.get(0);
            String tempAccessToken = spotifySharingData.getString("temp_access_token");
            String refreshToken = spotifySharingData.getString("refresh_token");
            long expiresEpochSeconds = spotifySharingData.getLong("expires_epoch_seconds", 0L);

            long currentEpochSeconds = Instant.now().getEpochSecond();

            if (tempAccessToken == null || currentEpochSeconds - expiresEpochSeconds > 1800) {
              refreshSpotifyAccessToken(refreshToken)
                  .onSuccess(newAccessToken -> {
                    promise.complete(newAccessToken);
                  })
                  .onFailure(e -> {
                    logger.error("failed to get access token: " + e.toString());
                  });
            } else {
              promise.complete(tempAccessToken);
            }
          } else {
            promise.fail("Spotify not integrated!");
          }

          return promise.future();
        });
  }

  private Future<String> refreshSpotifyAccessToken(String refreshToken) {
    if (refreshToken == null || refreshToken.length() == 0) {
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

                if (newRefreshToken == null) {
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
                  if (h.succeeded()) {
                    logger.info("saved refreshed tokens: " + accessToken);
                    promise.complete(accessToken);
                  } else {
                    promise.fail("Failed to save new tokens.");
                  }
                });
              } else {
                promise.fail("Token response failed.");
                // resultHandler.handle(Future.failedFuture("Error refreshing token"));
              }
            });

    return promise.future();
  }

  private Future<JsonObject> callSpotifyApi(String url) {
    Promise<JsonObject> promise = Promise.promise();
    refreshSpotifyAccessToken()
        .onSuccess(accessToken -> {
          WebClient webClient = WebClient.create(vertx, new WebClientOptions().setSsl(true));

          webClient.getAbs(url)
              .putHeader("Authorization", "Bearer " + accessToken)
              .send(ar -> {
                if (ar.succeeded()) {
                  try {
                    JsonObject responseBody = ar.result().bodyAsJsonObject();
                    promise.complete(responseBody);
                  } catch (Exception e) {
                    promise.fail("Error calling spotify API: " + ar.result().statusCode() + " - "
                        + ar.result().bodyAsString() + " - " + ar.cause());
                  }
                } else {
                  promise.fail("Error calling spotify API: " + ar.result().statusCode() + " - "
                      + ar.result().bodyAsString() + " - " + ar.cause());
                }
              });
        })
        .onFailure(e -> {
          logger.error(e.toString());
        });
    return promise.future();
  }

  private Future<JsonObject> fetchSpotifyFavArtists() {
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

  private Future<JsonObject> fetchSpotifyFavSong() {
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

  private Future<Integer> fetchSpotifyFollowedArtistsCount() {
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

  private Future<String> fetchSpotifySubscriptionLevel() {
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

  private Future<String> fetchExampleData() {
    Promise<String> promise = Promise.promise();
    promise.complete("(example data)");
    return promise.future();
  }

  private void dataPullCallback(Supplier<Future> futureSupplier, Promise promise, String dataSourceKey,
      String dataItemKey, String servProvId) {
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
  private void setDataMenuSettings(RoutingContext ctx) {
    String servProvId = ctx.pathParam("serviceProviderId");
    var newDataMenuSettings = ctx.body().asJsonObject();

    JsonObject dataMenuDoc = new JsonObject()
        .put("_id", servProvId)
        .put("dataMenu", newDataMenuSettings);

    mongoClient.save("serv_prov_sharing", dataMenuDoc, h -> {
      if (h.succeeded()) {

        // List<Future<DataItemFetchedResponse>> futures = new ArrayList<>();
        List<Future> futures = new ArrayList<>();
        // List<Promise> promises = new ArrayList<>();

        try {
          for (String dataSourceKey : newDataMenuSettings.fieldNames()) {
            JsonObject dataSource = newDataMenuSettings.getJsonObject(dataSourceKey);
            JsonObject dataSourceItems = dataSource.getJsonObject("items");
            for (String dataItemKey : dataSourceItems.fieldNames()) {
              JsonObject dataItem = dataSourceItems.getJsonObject(dataItemKey);

              if (dataItem.getBoolean("selected", false)) {
                Promise<DataItemFetchedResponse> promise = Promise.promise();
                switch (dataSourceKey) {
                  case "spotify":
                    switch (dataItemKey) {
                      case "fav-artist":
                        dataPullCallback(this::fetchSpotifyFavArtists, promise, dataSourceKey, dataItemKey, servProvId);
                        break;
                      case "fav-song":
                        dataPullCallback(this::fetchSpotifyFavSong, promise, dataSourceKey, dataItemKey, servProvId);
                        break;
                      case "following-artists-count":
                        dataPullCallback(this::fetchSpotifyFollowedArtistsCount, promise, dataSourceKey, dataItemKey,
                            servProvId);
                        break;
                      case "spotify-subscription-level":
                        dataPullCallback(this::fetchSpotifySubscriptionLevel, promise, dataSourceKey, dataItemKey,
                            servProvId);
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
        } catch (Exception e) {
          logger.error(e.toString());
        }

        // for (Future future : futures){
        // future.onSuccess(favArtists -> {
        // // TODO generalize this and cache results.
        // return new DataItemFetchedResponse(dataSourceKey, dataItemKey, favArtists);
        //// promise.complete(new DataItemFetchedResponse(dataSourceKey, dataItemKey,
        // favArtists));
        // })
        // .onFailure(e -> {
        // logger.error(e.toString());
        // });
        // }

        // Wait for all data items to pull, and then send them all in one message:
        logger.info("waiting for " + futures.size() + " data pulling items...");
        CompositeFuture.join(futures)
            .onSuccess(compositeHandler -> {
              if (compositeHandler.succeeded()) {
                JsonObject query = new JsonObject()
                    .put("_id", servProvId);
                mongoClient.find("service_providers", query)
                    .onSuccess(servProvData -> {
                      String connId = servProvData.get(0).getString("connId");

                      // JsonObject dataSharePayload = new JsonObject();

                      int sharedCount = 0;
                      JsonArray dataShareItems = new JsonArray();
                      for (int i = 0; i < compositeHandler.result().size(); i++) {
                        // var x = compositeHandler.result().size();
                        //// var y = compositeHandler.result().failed(0);
                        DataItemFetchedResponse result = compositeHandler.result().resultAt(i);
                        if (!result.dontShare) {
                          JsonObject dataItemShare = new JsonObject();
                          dataItemShare.put("dataSourceId", result.dataSourceId);
                          dataItemShare.put("dataItemId", result.dataItemId);
                          dataItemShare.put("data", result.data);
                          dataShareItems.add(dataItemShare);

                          logger.info(
                              "Sharing " + result.dataSourceId + "-" + result.dataItemId + " to " + servProvId + "...");
                          sharedCount++;
                        }
                      }

                      if (sharedCount == 0) {
                        logger.info("Had no items to share to " + servProvId + ".");
                        JsonObject responseData = new JsonObject()
                            .put("itemsSharedCount", sharedCount);
                        ctx.response().setStatusCode(200).end(responseData.encode());
                      } else {
                        String messageId = generateMsgId(connId);
                        waitingForSharedDataAckCtx.put(messageId, ctx);
                        sendBasicMessage(connId, "SHARED_DATA", dataShareItems, messageId);
                        logger.info("Shared " + sharedCount + " items to " + servProvId + ".");
                      }

                      // Bookkeeping:
                      for (int i = 0; i < futures.size(); i++) {
                        DataItemFetchedResponse result = compositeHandler.result().resultAt(i);

                        // Update last_shared trackers:
                        if (!result.dontShare) {
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
                          if (!result.isCached) {
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
              } else {
                logger.error("composite failed");
                ctx.response().setStatusCode(500).end();
              }
            })
            .onFailure(e -> {
              logger.error(e.toString());
            });
      } else {
        ctx.response().setStatusCode(500).end();
      }
    });
  }

  private void getDataSharingSettingsHandler(RoutingContext ctx) {
    String servProvId = ctx.pathParam("serviceProviderId");
    getCurrentDataSharingSettings(servProvId)
        .onSuccess(dataSharingMenuOptional -> {
          boolean updateDataMenuFromServProv = dataSharingMenuOptional.isEmpty();
          JsonObject currentDataSharingMenu = dataSharingMenuOptional.orElseGet(JsonObject::new);

          if (updateDataMenuFromServProv) {
            logger.info("fetching data menu from server...");
            JsonObject query = new JsonObject()
                .put("_id", servProvId);
            mongoClient.find("service_providers", query)
                .onSuccess(servProvData -> {
                  String connId = servProvData.get(0).getString("connId");
                  fetchServProvInfo(connId)
                      .onSuccess(fetchedDataMenu -> {
                        try {
                          JsonObject dataMenu = fetchedDataMenu.getJsonObject("dataMenu");
                          for (String dataSourceKey : dataMenu.fieldNames()) {
                            JsonObject dataSource = dataMenu.getJsonObject(dataSourceKey);
                            JsonObject dataSourceItems = dataSource.getJsonObject("items");
                            for (String dataItemKey : dataSourceItems.fieldNames()) {
                              JsonObject dataItem = dataSourceItems.getJsonObject(dataItemKey);

                              // Only select items that were selected in the last menu:
                              if (currentDataSharingMenu.containsKey(dataSourceKey) &&
                                  currentDataSharingMenu.getJsonObject(dataSourceKey).getJsonObject("items")
                                      .getBoolean("selected", false)) {
                                dataItem.put("selected", true);
                              } else {
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
                        } catch (Exception e) {
                          logger.error(e.toString());
                        }
                      });
                });
          } else {
            ctx.response().setStatusCode(200).end(currentDataSharingMenu.encode());
          }
        })
        .onFailure(e -> {
          ctx.response().setStatusCode(500).end(e.toString());
        });
  }

  private Future<Optional<JsonObject>> getCurrentDataSharingSettings(String servProvId) {
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

  private Future<JsonObject> fetchServProvInfo(String connId) {
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
      if (h.succeeded()) {
        ctx.response().setStatusCode(200).end();
      } else {
        ctx.response().setStatusCode(500).end();
      }
    });
  }

  private void saveDataSourceDoc(String dataSourceId, JsonObject extraData, RoutingContext ctx) {
    JsonObject dataSourceDoc = extraData
        .put("_id", dataSourceId) // sets ID to prevent duplicates / maintain idempotency.
        .put("data_source_id", dataSourceId);

    mongoClient.save("data_sources", dataSourceDoc, h -> {
      if (h.succeeded()) {
        ctx.response().setStatusCode(200).end();
      } else {
        ctx.response().setStatusCode(500).end();
      }
    });
  }

  private void integrateDataSource(RoutingContext ctx) {
    String dataSourceId = ctx.body().asJsonObject().getString("dataSourceId");

    switch (dataSourceId) {
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

                    logger
                        .info("spotify response: " + ar.result().statusCode() + " - " + responseBody.encodePrettily());
                    logger.info("Access Token: " + accessToken);
                    logger.info("Refresh Token: " + refreshToken);

                    if (refreshToken == null) {
                      logger.info("null refresh token, ignoring.");
                      return;
                    }

                    saveDataSourceDoc(dataSourceId,
                        new JsonObject().put("expires_epoch_seconds", 0)
                            // .put("expires_epoch_seconds", Instant.now().getEpochSecond() + 1800)
                            // .put("temp_access_token", accessToken)
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

  private void getDataSources(RoutingContext ctx) {
    JsonObject query = new JsonObject();
    mongoClient.find("data_sources", query)
        .onSuccess((List<JsonObject> dataSources) -> {
          var dataSourcesMap = new JsonObject();
          for (var dataSourceDoc : dataSources) {
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

  private void listCredentials(RoutingContext ctx) {
    try {
      var credentialsOptional = ariesClient.credentials();
      var credentials = credentialsOptional.get();

      JsonObject response = new JsonObject();
      for (var credential : credentials) {
        response.put(credential.getCredentialDefinitionId(), "");
      }

      ctx.response().setStatusCode(200).end(response.encode());
    } catch (Exception e) {
      logger.error("Failed to accept issuer invitation.", e);
      ctx.response().setStatusCode(500).end(e.toString());
    }
  }

  private void addCredential(RoutingContext ctx) {
    String invitationUrl = ctx.body().asJsonObject().getString("invitationUrl");
    QueryStringDecoder queryStringDecoder = new QueryStringDecoder(invitationUrl);
    List<String> inviteQueryParams = queryStringDecoder.parameters().get("oob");
    if (inviteQueryParams == null || inviteQueryParams.size() != 1) {
      logger.error("Failed to find the single 'oob' query parameter in invitation URL");
      ctx.response().setStatusCode(400).end();
      return;
    }
    String invitationJsonBase64 = inviteQueryParams.get(0);
    byte[] invitationMsgBytes = Base64.getDecoder().decode(invitationJsonBase64);
    String invitationMsgJsonStr = new String(invitationMsgBytes, StandardCharsets.UTF_8);

    // Type type = new TypeToken<ReceiveInvitationRequest>(){}.getType();
    // ReceiveInvitationRequest invitationMsg = new
    // Gson().fromJson(invitationMsgJsonStr, type);
    Type type = new TypeToken<InvitationMessage<Object>>() {
    }.getType();
    InvitationMessage<Object> invitationMsg = new Gson().fromJson(invitationMsgJsonStr, type);

    try {
      // var connRecordOptional =
      // ariesClient.connectionsReceiveInvitation(invitationMsg,
      // ConnectionReceiveInvitationFilter.builder().build());
      // var connRecord = connRecordOptional.orElseThrow();
      // String connId = connRecord.getConnectionId();
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

  private void verifyCredentialWithServProvider(RoutingContext ctx) {
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

  // private void checkServiceProviderCredentialRequirements(RoutingContext ctx){
  //// String servProvId = ctx.pathParam("serviceProviderId");
  // String presentationExchangeId =
  // ctx.request().getParam("presentationExchangeId");
  //
  // try {
  // Optional<String> relevantCredentialId =
  // checkServiceProviderRelevantCredential(presentationExchangeId);
  // ctx.response().setStatusCode(200).send(relevantCredentialId.orElse(""));
  // } catch (IOException e) {
  // logger.error("Failed to get relevant credentials.", e);
  // ctx.response().setStatusCode(500).send(e.toString());
  // }
  // }

  private void getServProvDetailHandler(RoutingContext ctx) {
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
          if (presentationExchangeId != null) {
            try {
              var relevantCredId = checkServiceProviderRelevantCredential(presentationExchangeId);
              servProvData.put("relevantCredential", relevantCredId.orElse(""));
            } catch (Exception e) {
              logger.warn("Failed to do presentation exchange / relevant credential lookup." +
                  " Assuming that the presentation_exchange ID in the service_provider document is orphaned, and refers to"
                  +
                  " a now-deleted presentation exchange record. Simply not returning the relevantCredential in this case.");
              servProvData.put("relevantCredential", "");
              // promise.fail("Failed to do relevant credential query: " + e.toString());
            }
          }

          promise.complete(servProvData);

          return promise.future();
        });
  }

  private Optional<String> checkServiceProviderRelevantCredential(String presentationExchangeId) throws Exception {
    Optional<List<PresentationRequestCredentials>> relevantCredentialsOptional = Optional.empty();
    // try {
    relevantCredentialsOptional = ariesClient.presentProofRecordsCredentials(
        presentationExchangeId,
        PresentationRequestCredentialsFilter.builder()
            .referent(List.of("DL_number_referent"))
            .build());
    // } catch (IOException e) {
    // logger.error("Failed to get relevant credentials.", e);
    // ctx.response().setStatusCode(500).send(e.toString());
    // }

    String credentialId = null;
    if (relevantCredentialsOptional.isPresent()) {
      var relevantCredentials = relevantCredentialsOptional.orElseThrow();

      if (relevantCredentials.size() > 0) {
        var relevantCredential = relevantCredentials.get(0);
        credentialId = relevantCredential.getCredentialInfo().getReferent();
      }
    }

    if (credentialId == null) {
      // return no credentials.
      return Optional.empty();
    } else {
      return Optional.of(credentialId);
    }
  }

  private void presentProofUpdate(RoutingContext ctx) {
    try {
      JsonObject message = ctx.body().asJsonObject();

      logger.info("present_proof updated: " + message.encodePrettily());

      String state = message.getString("state");
      String presentationExchangeId = message.getString("presentation_exchange_id");
      String connId = message.getString("connection_id");

      if (state.equals("request_received")) {
        var waitingCtx = waitingForPresentationReqCtxs.remove(connId);

        try {
          var presentationRecordOptional = ariesClient.presentProofRecordsGetById(presentationExchangeId);
          var presentationRecord = presentationRecordOptional.orElseThrow();
          // String presReqName = presentationRecord.getPresentationRequest().getName();
          // JsonObject serverBannerData = new JsonObject(presReqName);

          waitingCtx.complete(presentationExchangeId);

        } catch (IOException e) {
          logger.error("Failed to get presentation record.", e);
          waitingCtx.fail(e);
          // waitingCtx.response().setStatusCode(500).send(e.toString());
        }
      }

      ctx.response().setStatusCode(200).end();
    } catch (Exception e) {
      ctx.response().setStatusCode(500).end();
    }
  }

  private void issueCredentialUpdate(RoutingContext ctx) {
    try {
      JsonObject message = ctx.body().asJsonObject();

      // Docs:
      // https://aca-py.org/latest/features/AdminAPI/#pairwise-connection-record-updated-connections
      String userConnectionId = message.getString("connection_id");
      String state = message.getString("state");
      String credentialId = message.getString("credential_id");

      logger.info("issue_credential updated: " + userConnectionId + ", " + state + ", " + credentialId + " - "
          + message.encodePrettily());

      if (state.equals("deleted")) {
        logger.info("issue_credential deleted, assuming added the credential properly.");
        waitingForCredentialCtx.remove(userConnectionId).end(credentialId);
        // ^ TODO add timeout timer to return 400 if no response.
      }

      ctx.response().setStatusCode(200).end();
    } catch (Exception e) {
      ctx.response().setStatusCode(500).end();
    }
  }

  private void connectionsUpdateHandler(RoutingContext ctx) {
    try {
      JsonObject message = ctx.body().asJsonObject();

      // Docs:
      // https://aca-py.org/latest/features/AdminAPI/#pairwise-connection-record-updated-connections
      String userConnectionId = message.getString("connection_id");
      String state = message.getString("state");
      String invitationKey = message.getString("invitation_key");

      logger.info("connection updated: " + userConnectionId + ", " + state + " - " + message.encodePrettily());

      ctx.response().setStatusCode(200).end();
    } catch (Exception e) {
      ctx.response().setStatusCode(500).end();
    }
  }

  private void handleLogin(RoutingContext context) {
    JsonObject jsonBody = context.body().asJsonObject();
    String username = jsonBody.getString("username");
    String password = jsonBody.getString("password");
    authenticateUser(username, password).onComplete(ar -> {
      if (ar.succeeded()) {
          boolean isAuthenticated = ar.result();
          if (isAuthenticated) {
              // User is authenticated
              String accessToken = JwtUtil.generateAccessToken(username);

              JsonObject responseBody = new JsonObject()
                      .put("accessToken", accessToken);
              
              userDataMongoClient = createUserDataMongoClient(username);

              context.response()
                    .putHeader("Content-Type", "application/json")
                    .end(responseBody.encode());
          } else {
              // Authentication failed
              context.response().setStatusCode(401).end("Invalid credentials");
          }
      } else {
          // Handle the error
          logger.info("Promise failed"+ar.cause());
          context.response().setStatusCode(500).end("Promise failed");
      }
  });
  }

  public Future<Boolean> authenticateUser(String username, String password) {
    Promise<Boolean> promise = Promise.promise();

    JsonObject existingUser = new JsonObject().put("Username", username);

    mongoClient.findOne("users", existingUser, null, findAr -> {
        if (findAr.succeeded()) {
            JsonObject userData = findAr.result();
            if (userData != null) {
                boolean isAuthenticated = username.equals(userData.getString("Username")) && password.equals(userData.getString("Password"));
                promise.complete(isAuthenticated);
            } else {
                promise.complete(false);
            }
        } else {
            logger.error("Error while trying to fetch the existing User", findAr.cause());
            promise.fail(findAr.cause());
        }
    });

    return promise.future();
}


private void authenticateJwt(RoutingContext context) {
    String authHeader = context.request().getHeader("Authorization");

    logger.info("Received Authorization Header: {}", authHeader); // Log the received header

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);  // Remove "Bearer " prefix
        logger.info("Extracted Token: {}", token); // Log the extracted token

        if (JwtUtil.validateToken(token)) {
          currentUserId = JwtUtil.getUserIdFromToken1(token); // Extract user ID and store it
          context.put("userId", currentUserId); // Store userId in the context for further use
          logger.info("User ID extracted: {}", currentUserId); // Log the extracted user ID
          context.next();  // Proceed to the next handler
        } else {
            logger.warn("Invalid or expired token provided."); // Log warning for invalid token
            context.response().setStatusCode(401).end("Invalid or expired token");
        }
    } else {
        logger.warn("Authorization header is missing or invalid."); // Log warning for missing header
        context.response().setStatusCode(401).end("Authorization header missing or invalid");
    }
}

  private void handleSecureData(RoutingContext context) {
    context.response().putHeader("Content-Type", "application/json")
           .end("{\"message\":\"This is protected data.\"}");
  }

  // Fetch service providers associated with a specific user ID
  

// Handler to list service providers based on the user ID extracted from the token
private void listServProvsHandler(RoutingContext ctx) {
    // Extract the user ID from the JWT token
    String userId = currentUserId; // Get the user ID from the context
    
    logger.info("Received request to list service providers for user ID: " + userId);

    if (currentUserId == null) {
        ctx.response()
           .setStatusCode(401) // Unauthorized if no user ID is found
           .end("Unauthorized: No valid token provided.");
        return;
    }

    // Retrieve service providers associated with the user ID
    servProvService.listServProvsByUserId(userId).onSuccess(servProvs -> {
        var servProvsArray = new JsonArray(servProvs);
        ctx.response()
           .setStatusCode(200)
           .putHeader(HttpHeaders.CONTENT_TYPE.toString(), "application/json")
           .end(servProvsArray.encodePrettily());
    }).onFailure(err -> {
        ctx.response()
           .setStatusCode(500)
           .end("Failed to retrieve service providers: " + err.getMessage());
    });
}




  /**
   * Handles post request for establishing a connection to a service provider
   * given an invitation message JSON from
   * that service provider in the post body. This tells the ACA-Py agent that we
   * have "received" the invitation
   * message, and progresses the state of the connection.
   */
  private void addServiceProviderHandler(RoutingContext ctx){
    //String userId = JwtUtil.getUserIdFromToken(ctx); // Implement this function to extract user ID from token

    // Deserialize Vertx body via Gson (since ACA-Py wrapper takes Gson-serializable InvitationMessage):
    String currentUser = ctx.request().getParam("userid"); // Get userId from query parameters
    logger.info("Received userId from query parameter: {}", currentUser);


    String invitationMsgUrl = ctx.request().getFormAttribute("invitationUrl");
    QueryStringDecoder queryStringDecoder = new QueryStringDecoder(invitationMsgUrl);
    List<String> oobQueryParams = queryStringDecoder.parameters().get("oob");
    if (oobQueryParams == null || oobQueryParams.size() != 1) {
      logger.error("Failed to find the single 'oob' query parameter in invitation URL");
      ctx.response().setStatusCode(400).end();
      return;
    }
    String invitationJsonBase64 = oobQueryParams.get(0);
    byte[] invitationMsgBytes = Base64.getDecoder().decode(invitationJsonBase64);
    String invitationMsgJsonStr = new String(invitationMsgBytes, StandardCharsets.UTF_8);
    String userId = currentUserId; // Get the user ID from the context

    Type type = new TypeToken<InvitationMessage<Object>>() {
    }.getType();
    InvitationMessage<Object> invitationMsg = new Gson().fromJson(invitationMsgJsonStr, type);

    try {
      Optional<OOBRecord> oobRecordOptional = ariesClient.outOfBandReceiveInvitation(invitationMsg,
          ReceiveInvitationFilter.builder().autoAccept(true).build());
      var oobRecord = oobRecordOptional.orElseThrow();
      String connId = String.valueOf(oobRecord.getConnectionId());
      logger.info("User Conn ID" + connId);

      // waitingForPresentationReqCtxs.put(connId, ctx);
      Promise<String> presentationReqPromise = Promise.promise();

      Promise<JsonObject> connResponsePromise = Promise.promise();
      CompositeFuture.all(connResponsePromise.future(), presentationReqPromise.future())
          .onSuccess(r -> {
            JsonObject connResponse = r.resultAt(0);

            boolean requiresCredential = connResponse.getBoolean("requiresCredential");

            JsonObject document = new JsonObject()
                .put("_id", connId)
                .put("connId", connId)
                .put("userId", userId) // Store the user ID here
                .put("bannerData", connResponse.getJsonObject("bannerData"));

            if (requiresCredential) {
              String presentationExchangeId = r.resultAt(1);
              document = document
                  .put("presentationExchangeId", presentationExchangeId);
            } else {
              document = document
                  .put("presentationExchangeId", null)
                  .put("verifiedWith", true);
            }

            // if (!isUsingCredentials){
            // document = document
            // .put("presentationExchangeId", null);
            // }

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
   * Handles delete request for removing a connection to a service provider,
   * thereby removing the service provider's
   * access.
   */
  private void removeServiceProviderHandler(RoutingContext ctx) {
    String servProvId = ctx.pathParam("serviceProviderId");

    // TODO REFACTOR 💀
    // Delete the service provider's access control policy, then delete the service
    // provider object:
    // NOTE on onFailure: Even if these documents don't exist in the database, they
    // will still succeed as futures
    // and simply not do anything. So if a future fails here then it is unexpected.
    accessControlService.deletePolicyById(servProvId)
        .onSuccess((MongoClientDeleteResult deletePolicyResult) -> {
          servProvService.getServProvConnId(servProvId)
              .onSuccess((String connId) -> {
                // Important order: the policy must be deleted before the service provider
                // object to avoid an orphaned
                // policy on failure.
                servProvService.deleteServProvConnMapping(servProvId)
                    .onSuccess((MongoClientDeleteResult deleteServProvObjResult) -> {
                      try {
                        ariesClient.connectionsRemove(connId); // TODO doesnt seem to remove connection on service
                                                               // provider side.
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

  //validity = 1=new entry, 2=updaterefreshtoken, 0=no updating
  //Currently testing with a singleuser emailid just for the dataplug
// Step 1: Attempt to Fetch Profile using stored token
private void attemptFetchProfile(RoutingContext ctx) {
  oauthMongoClient.findOne("tokens", new JsonObject().put("email", "shikharapagadala17@gmail.com"), null, res -> {
      if (res.succeeded()) {
          JsonObject tokenData = res.result();
          if (tokenData != null && !tokenData.isEmpty()) {
              long expiresAt = tokenData.getLong("expiresAt");
              if (System.currentTimeMillis() < expiresAt) {
                  // Token is still valid
                  fetchUserProfile(tokenData, ctx, tokenData.getString("accessToken"), 0);
              } else {
                  // Token expired, refresh it
                  refreshAccessToken(tokenData.getString("refreshToken"), ctx);
              }
          } else {
              // No token found, redirect to login
              ctx.response()
                  .putHeader("Location", "http://localhost:3001/profile")
                  .setStatusCode(302)
                  .end("No valid session found, please log in.");
          }
      } else {
          ctx.response().setStatusCode(500).end("Database query failed: " + res.cause().getMessage());
      }
  });
}


// Step 2: Fetch or Refresh Access Token
private void refreshAccessToken(String refreshToken, RoutingContext ctx) {
  WebClientOptions options = new WebClientOptions().setConnectTimeout(10000); // 10 seconds timeout
  WebClient webClient = WebClient.create(vertx, options);

  MultiMap formData = MultiMap.caseInsensitiveMultiMap();
  formData.add("client_id", "646074574769-ggemkk87qcdej7tanre38qjm20kn4f9m.apps.googleusercontent.com")
          .add("client_secret", "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")
          .add("refresh_token", refreshToken)
          .add("grant_type", "refresh_token");

  webClient.postAbs("https://oauth2.googleapis.com/token")
          .putHeader("Content-Type", "application/x-www-form-urlencoded")
          .as(BodyCodec.jsonObject())
          .sendForm(formData, ar -> {
              if (ar.succeeded()) {
                  HttpResponse<JsonObject> response = ar.result();
                  if (response.statusCode() == 200) {
                      JsonObject responseBody = response.body();
                      fetchUserProfile(responseBody, ctx, responseBody.getString("access_token"),2);
                  } else {
                      ctx.response().setStatusCode(response.statusCode()).end("Failed to refresh token: " + response.bodyAsString());
                  }
              } else {
                  ctx.response().setStatusCode(500).end("Token refresh request failed: " + ar.cause().toString());
              }
          });
}


private void fetchUserProfile(RoutingContext ctx) {
  Promise<JsonObject> promise = Promise.promise();
  WebClient client = WebClient.create(vertx);

  client.getAbs("https://www.googleapis.com/oauth2/v3/userinfo")
      .putHeader("Authorization", "Bearer " + "ya29.a0AeDClZDetKoxSCrTmKzkirPL1ZJxocoJxp1lvnKw2YvN2O6nUzmDg4Tm3Aif3jQlaVqy37W6_zMOjP50T3q8Fge7IRLg5tUQSZ-trjppKOjNrxpJs7XphsZ9qdfWBfDe7YIxQyIa1PdLldaJjOJHAUvSr7xMSyOjlCbNp8DlaCgYKASQSARMSFQHGX2MiwVyL2Nu3HSCRAbiJ4sWOtA0175")
     // .putHeader("Authorization", "Bearer " + accessToken)
      .as(BodyCodec.jsonObject())
      .send(ar -> {
          if (ar.succeeded()) {
              HttpResponse<JsonObject> userInfo = ar.result();
              JsonObject responseBody = userInfo.body();
              //updateTokenInDatabase(tokenData, ctx, userInfo,  accessToken);
              ctx.response()
              .putHeader("Location", "http://localhost:3001/profile?Fetchingprofile"+responseBody)
              .setStatusCode(302)
              .end();
          } else {
              ctx.response()
            .setStatusCode(500)
            .end("Failed to Fetch users profile " + ar.cause().getMessage());
          }
      });
}

 private void fetchUserProfile(JsonObject tokenData, RoutingContext ctx,String accessToken, int validity) {
  Promise<JsonObject> promise = Promise.promise();
  WebClient client = WebClient.create(vertx);

  client.getAbs("https://www.googleapis.com/oauth2/v3/userinfo")
      //.putHeader("Authorization", "Bearer " + "ya29.a0AeDClZC89mgtwaitFAGum2my-AWB257Q3634w8gDxN9D8ZfbKNregEKbEzwmUmCFqZAzEEDtLQHENfD2f4MJwh1Q48l2I-oH6Wtw5LdTcAnpDXQ8KmdlJf2CIUZYupDDpLuyOoVhGHtlyhNJ4Wja6-Iz0USaiB00MPDgyYyqaCgYKAYoSARMSFQHGX2MidCkb3Ec7d_Dx3ti4iGvVbQ0175")
      .putHeader("Authorization", "Bearer " + accessToken)
      .as(BodyCodec.jsonObject())
      .send(ar -> {
          if (ar.succeeded()) {
            HttpResponse<JsonObject> userInfo = ar.result();
            JsonObject responseBody = userInfo.body();
            if(validity==1){
             updateTokenInDatabase(tokenData, ctx, responseBody,  accessToken);
            }else if(validity==2){
              updateAccessTokenInDatabase(tokenData, ctx, responseBody,  accessToken);
            }
              logger.info("User's email: " + responseBody.getString("email"));
              ctx.response()
              .putHeader("Location", "http://localhost:3001/profile?Fetchingprofile"+responseBody.getString("email"))
              .setStatusCode(302)
              .end();
          } else {
              logger.error("Failed to fetch user profile: " + ar.cause().getMessage());
              ctx.response()
            .setStatusCode(500)
            .end("Failed to Fetch users profile " + ar.cause().getMessage());
          }
      });
}
// Update or Save Token in Database
private void updateTokenInDatabase(JsonObject tokenData, RoutingContext ctx,JsonObject userInfo, String accessToken) {
  JsonObject document = new JsonObject()
      .put("email", userInfo.getString("email"))
      .put("userInfo", userInfo)
      .put("accessToken", tokenData.getString("access_token"))
      .put("refreshToken", tokenData.getString("refresh_token"))
      .put("expiresIn", tokenData.getLong("expires_in"))
      .put("expiresAt", System.currentTimeMillis() + (tokenData.getLong("expires_in") * 1000));

       oauthMongoClient.save("tokens", document, res -> {
        if (res.succeeded()) {
            ctx.response()

            .putHeader("Location", "http://localhost:3001/profile?email="+userInfo+"&accT"+tokenData.getString("access_token")+"&accesstok"+accessToken)
            .setStatusCode(302)
          .end();
        } else {
            ctx.response()
              .setStatusCode(500)
              .end("Failed to save token data: " + res.cause().getMessage());
        }
    });
}


private void updateAccessTokenInDatabase(JsonObject tokenData, RoutingContext ctx, JsonObject userInfo, String accessToken) {
  JsonObject query = new JsonObject().put("email", "shikharapagadala17@gmail.com");
  JsonObject update = new JsonObject()
      .put("$set", new JsonObject()
          .put("accessToken", tokenData.getString("access_token"))
          .put("expiresIn", tokenData.getLong("expires_in"))
          .put("expiresAt", System.currentTimeMillis() + (tokenData.getLong("expires_in") * 1000)));

  oauthMongoClient.updateCollection("tokens", query, update, res -> {
      if (res.succeeded()) {
          ctx.response()
              .putHeader("Content-Type", "application/json")
              .end(new JsonObject().put("success", true).encode());
      } else {
          ctx.response()
              .setStatusCode(500)
              .end("Failed to update refresh token: " + res.cause().getMessage());
      }
  });
}

  private void handleOAuthCallback(io.vertx.ext.web.RoutingContext ctx) {
    String code = ctx.request().getParam("code");
    if (code == null) {
        ctx.response().end("No authorization code provided");
        return;
    }
    exchangeCodeForToken(code, ctx);
  }

  private void exchangeCodeForToken(String code, RoutingContext ctx) {
    WebClient webClient = WebClient.create(vertx);
    MultiMap formData = MultiMap.caseInsensitiveMultiMap();
            formData.add("client_id", "821706558807-q9aj30q47rqjb2876isgcjk68jsii830.apps.googleusercontent.com");
            formData.add("client_secret", "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");
            formData.add("code", code);
            formData.add("grant_type", "authorization_code");
            formData.add("redirect_uri", "http://localhost:9080/auth/google/xlab");

            webClient.postAbs("https://oauth2.googleapis.com/token")
                .putHeader("Content-Type", "application/x-www-form-urlencoded")
                .as(BodyCodec.jsonObject())  // Set BodyCodec to JsonObject
                .sendForm(formData, ar -> {
                    if (ar.succeeded()) {
                        HttpResponse<JsonObject> response = ar.result();
                        if (response.statusCode() == 200) {
                            JsonObject responseBody = response.body();
                            String accessToken = responseBody.getString("access_token");
                            String refreshToken = responseBody.getString("refresh_token");
                            String expiresIn = responseBody.getString("expires_in");
                            String tokenType = responseBody.getString("token_type");

                            fetchUserProfile( responseBody,  ctx,  responseBody.getString("access_token"),1);

                            accesstok = accessToken;
                            reftoken = refreshToken;
                           
                            //saveTokenData(response.body(), ctx);  
                            //saveTokenData(dataSourceDoc);

                             // Define the query to retrieve the document with ID "1"
                              JsonObject query = new JsonObject().put("id", "1");

                              // Execute the find operation
                              oauthMongoClient.find("oauth_tokens", query, res -> {
                                  if (res.succeeded()) {
                                      if (!res.result().isEmpty()) {
                                          JsonObject token1Data = res.result().get(0);
                                          String access_token1=token1Data.getString("accessToken");
                                          //console.log("AccessTokem"+access_token1);
                                          
                                      } else {
                                          
                                      }
                                  } else {
                                      System.err.println("Failed to retrieve the access token: " + res.cause().getMessage());
                                  }
                                  //mongoClient.close();
                              });

                            ctx.response()
                            .putHeader("Location", "http://localhost:3001/profile?accesstoken=" + accessToken+"&refreshToken=" + refreshToken
                            + "&expiresIn=" + expiresIn
                            + "&tokenType=" + tokenType)
                                .setStatusCode(302)
                                .end();
                          
                        } else {
                            ctx.response().setStatusCode(500).end("Failed to obtain access token: " + response.bodyAsString());
                        }
                    } else {
                        ctx.response().setStatusCode(500).end("Token exchange failed: " + ar.cause().getMessage());

                      }
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