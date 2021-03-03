package todo;

import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping(value = { "/api" })
public class ApiController {

  Logger logger = LoggerFactory.getLogger(ApiController.class);

  @Autowired
  ApiKeyService apiKeyService;
  @Autowired
  UserService userService;
  @Autowired
  SubscriptionService subscriptionService;
  @Autowired
  VerificationChallengeService verificationChallengeService;
  @Autowired
  MailService mailService;
  @Autowired
  PasswordService passwordService;
  @Autowired
  PasswordResetService passwordResetService;
  @Autowired
  GoalService goalService;
  @Autowired
  GoalDataService goalDataService;
  @Autowired
  PastEventService pastEventService;
  @Autowired
  PastEventDataService pastEventDataService;
  @Autowired
  TimeUtilityFunctionService timeUtilityFunctionService;
  @Autowired
  TimeUtilityFunctionPointService timeUtilityFunctionPointService;

  // The website where this application is hosted
  @Value("${WEBSITE_URL}")
  String websiteUrl;

  // Name of the site
  @Value("${SERVICE_NAME}")
  String serviceName;

  final static int fiveMinutes = 5 * 60 * 1000;
  final static int fifteenMinutes = 15 * 60 * 1000;

  // Helper Methods

  /**
   * Fills in jackson objects (User) for ApiKey
   *
   * @param apiKey - ApiKey object
   * @return apiKey with filled jackson objects
   */
  ApiKey fillApiKey(ApiKey apiKey) {
    apiKey.creator = fillUser(userService.getByUserId(apiKey.creatorUserId));
    return apiKey;
  }

  /**
   * Fills in jackson objects for User
   *
   * @param user - User object
   * @return User object with filled jackson objects
   */
  User fillUser(User user) {
    return user;
  }

  /**
   * Fills in jackson objects for Subscription
   *
   * @param subscription - Subscription object
   * @return Subscription object with filled jackson objects
   */
  Subscription fillSubscription(Subscription subscription) {
    subscription.creator = fillUser(userService.getByUserId(subscription.creatorUserId));
    return subscription;
  }

  /**
   * Fills in jackson objects for PasswordReset
   *
   * @param passwordReset - PasswordReset object
   * @return PasswordReset object with filled jackson objects
   */
  PasswordReset fillPasswordReset(PasswordReset passwordReset) {
    return passwordReset;
  }

  /**
   * Fills in jackson objects for Password
   *
   * @param password - Password object
   * @return Password object with filled jackson objects
   */
  Password fillPassword(Password password) {
    password.creator = fillUser(userService.getByUserId(password.creatorUserId));
    password.user = fillUser(userService.getByUserId(password.userId));
    password.passwordReset = fillPasswordReset(
        passwordResetService.getByPasswordResetKeyHash(password.passwordResetKeyHash));
    return password;
  }

  /**
   * Fills in jackson objects for VerificationChallenge
   *
   * @param emailVerificationChallenge - VerificationChallenge object
   * @return VerificationChallenge object with filled jackson objects
   */
  VerificationChallenge fillVerificationChallenge(VerificationChallenge verificationChallenge) {
    return verificationChallenge;
  }

  /**
   * Fills in jackson objects for Goal
   *
   * @param goal - Goal object
   * @return Goal object with filled jackson objects
   */
  Goal fillGoal(Goal goal) {
    goal.creator = fillUser(userService.getByUserId(goal.creatorUserId));
    return goal;
  }

  /**
   * Fills in jackson objects for GoalData
   *
   * @param goalData - GoalData object
   * @return GoalData object with filled jackson objects
   */
  GoalData fillGoalData(GoalData goalData) {
    goalData.creator = fillUser(userService.getByUserId(goalData.creatorUserId));
    goalData.goal = fillGoal(goalService.getByGoalId(goalData.goalId));
    return goalData;
  }

  /**
   * Fills in jackson objects for PastEvent
   *
   * @param pastEvent - PastEvent object
   * @return PastEvent object with filled jackson objects
   */
  PastEvent fillPastEvent(PastEvent pastEvent) {
    pastEvent.creator = fillUser(userService.getByUserId(pastEvent.creatorUserId));
    return pastEvent;
  }

  /**
   * Fills in jackson objects for PastEventData
   *
   * @param pastEventData - PastEventData object
   * @return PastEventData object with filled jackson objects
   */
  PastEventData fillPastEventData(PastEventData pastEventData) {
    pastEventData.creator = fillUser(userService.getByUserId(pastEventData.creatorUserId));
    pastEventData.pastEvent = fillPastEvent(pastEventService.getByPastEventId(pastEventData.pastEventId));
    return pastEventData;
  }

  /**
   * Fills in jackson objects for TimeUtilityFunction
   *
   * @param timeUtilityFunction - TimeUtilityFunction object
   * @return TimeUtilityFunction object with filled jackson objects
   */
  TimeUtilityFunction fillTimeUtilityFunction(TimeUtilityFunction timeUtilityFunction) {
    timeUtilityFunction.creator = fillUser(userService.getByUserId(timeUtilityFunction.creatorUserId));
    return timeUtilityFunction;
  }

  /**
   * Fills in jackson objects for TimeUtilityFunctionPoint
   *
   * @param timeUtilityFunctionPoint - TimeUtilityFunctionPoint object
   * @return TimeUtilityFunctionPoint object with filled jackson objects
   */
  TimeUtilityFunctionPoint fillTimeUtilityFunctionPoint(TimeUtilityFunctionPoint timeUtilityFunctionPoint) {
    timeUtilityFunctionPoint.creator = fillUser(userService.getByUserId(timeUtilityFunctionPoint.creatorUserId));
    timeUtilityFunctionPoint.timeUtilityFunction = fillTimeUtilityFunction(
        timeUtilityFunctionService.getByTimeUtilityFunctionId(timeUtilityFunctionPoint.timeUtilityFunctionId));
    return timeUtilityFunctionPoint;
  }

  /**
   * Returns an apiKey if valid
   *
   * @param key - apikey code of the User
   * @return ApiKey or null if invalid
   */
  ApiKey getApiKeyIfValid(String key) {
    ApiKey apiKey = apiKeyService.getByApiKeyHash(Utils.hashGeneratedKey(key));
    if (apiKey != null //
        && apiKey.creationTime + apiKey.duration > System.currentTimeMillis() //
        && apiKey.apiKeyKind == ApiKeyKind.VALID) {
      return apiKey;
    }
    return null;
  }

  /**
   * Returns true if the passwordPhrase matches the most recent password
   * 
   * @param userId         - valid user id
   * @param passwordPhrase - passwordPhrase to test with user
   * @return returns true if user's most recent password exists, isn't cancelled,
   *         and matches the passwordPhrase
   */
  boolean isValidPassword(long userId, String passwordPhrase) {
    Password password = passwordService.getByUserId(userId);
    return password != null && password.passwordKind != PasswordKind.CANCEL
        && Utils.matchesPassword(passwordPhrase, password.passwordHash);
  }

  /**
   * Create a new apiKey for a User
   *
   * @param userId         the id of the User
   * @param email          email of the User
   * @param expirationTime time in milliseconds since 1970 when this key is due to
   *                       expire
   * @param password       User password
   * @return ResponseEntity with ApiKey of User and HttpStatus.OK code if
   *         successful
   * @throws ResponseEntity with HttpStatus.UNAUTHORIZED if the User is
   *                        unauthorized
   * @throws ResponseEntity with HttpStatus.BAD_REQUEST if the process is
   *                        unsuccessful
   */
  @RequestMapping("/apiKey/newValid/")
  public ResponseEntity<?> newValidApiKey( //
      @RequestParam String userEmail, //
      @RequestParam String userPassword, //
      @RequestParam long duration) {
    // Ensure user is valid
    User u = userService.getByEmail(userEmail);
    if (u == null) {
      return Errors.USER_NONEXISTENT.getResponse();
    }

    if (!isValidPassword(u.userId, userPassword)) {
      return Errors.PASSWORD_INCORRECT.getResponse();
    }

    // randomly generate key
    String key = Utils.generateKey();

    // now actually make apiKey
    ApiKey apiKey = new ApiKey();
    apiKey.apiKeyHash = Utils.hashGeneratedKey(key);
    apiKey.creatorUserId = u.userId;
    apiKey.creationTime = System.currentTimeMillis();
    apiKey.duration = duration;
    apiKey.key = key;
    apiKey.apiKeyKind = ApiKeyKind.VALID;
    apiKeyService.add(apiKey);
    return new ResponseEntity<>(fillApiKey(apiKey), HttpStatus.OK);
  }

  @RequestMapping("/apiKey/newCancel/")
  public ResponseEntity<?> newCancelApiKey( //
      @RequestParam String apiKeyToCancel, //
      @RequestParam String apiKey) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    // check if api key to cancel is valid
    ApiKey toCancel = getApiKeyIfValid(apiKeyToCancel);
    if (toCancel == null) {
      return Errors.API_KEY_NONEXISTENT.getResponse();
    }

    // check that both creators are the same
    if (key.creatorUserId != toCancel.creatorUserId) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    // now actually make apiKey
    ApiKey newApiKey = new ApiKey();
    newApiKey.apiKeyHash = Utils.hashGeneratedKey(apiKeyToCancel);
    newApiKey.creatorUserId = key.creatorUserId;
    newApiKey.creationTime = System.currentTimeMillis();
    newApiKey.key = apiKeyToCancel;
    newApiKey.apiKeyKind = ApiKeyKind.VALID;
    newApiKey.duration = 0;

    apiKeyService.add(newApiKey);
    return new ResponseEntity<>(fillApiKey(newApiKey), HttpStatus.OK);
  }

  @RequestMapping("/verificationChallenge/new/")
  public ResponseEntity<?> newVerificationChallenge( //
      @RequestParam String userName, //
      @RequestParam String userEmail, //
      @RequestParam String userPassword) {
    if (Utils.isEmpty(userEmail)) {
      return Errors.USER_EMAIL_EMPTY.getResponse();
    }

    if (Utils.isEmpty(userName)) {
      return Errors.USER_NAME_EMPTY.getResponse();
    }
    if (userService.existsByEmail(userEmail)) {
      return Errors.USER_EXISTENT.getResponse();
    }
    if (!Utils.securePassword(userPassword)) {
      return Errors.PASSWORD_INSECURE.getResponse();
    }

    Long lastEmailSent = verificationChallengeService.getLastCreationTimeByEmail(userEmail);
    if (lastEmailSent != null && System.currentTimeMillis() < (lastEmailSent + fiveMinutes)) {
      return Errors.EMAIL_RATELIMIT.getResponse();
    }

    if (mailService.emailExistsInBlacklist(userEmail)) {
      return Errors.EMAIL_BLACKLISTED.getResponse();
    }

    // randomly generate key
    String rawKey = Utils.generateKey();

    VerificationChallenge evc = new VerificationChallenge();
    evc.name = userName.toUpperCase();
    evc.email = userEmail;
    evc.creationTime = System.currentTimeMillis();
    evc.verificationChallengeKeyHash = Utils.hashGeneratedKey(rawKey);
    evc.passwordHash = Utils.encodePassword(userPassword);
    verificationChallengeService.add(evc);

    mailService.send(userEmail, serviceName + ": Email Verification",
        "<p>Required email verification requested under the name: " + evc.name + "</p>" //
            + "<p>If you did not make this request, then feel free to ignore.</p>" //
            + "<p>This link is valid for up to 15 minutes.</p>" //
            + "<p>Do not share this link with others.</p>" //
            + "<p>Verification link: " //
            + websiteUrl + "/register_confirm?verificationChallengeKey=" + rawKey //
            + "</p>"); //

    return new ResponseEntity<>(fillVerificationChallenge(evc), HttpStatus.OK);
  }

  @RequestMapping("/user/new/")
  public ResponseEntity<?> newUser(@RequestParam String verificationChallengeKey) {
    VerificationChallenge evc = verificationChallengeService
        .getByVerificationChallengeKeyHash(Utils.hashGeneratedKey(verificationChallengeKey));

    if (evc == null) {
      return Errors.VERIFICATION_CHALLENGE_NONEXISTENT.getResponse();
    }

    if (userService.existsByVerificationChallengeKeyHash(evc.verificationChallengeKeyHash)) {
      return Errors.USER_EXISTENT.getResponse();
    }

    if (userService.existsByEmail(evc.email)) {
      return Errors.USER_EXISTENT.getResponse();
    }

    final long now = System.currentTimeMillis();

    if ((evc.creationTime + fifteenMinutes) < now) {
      return Errors.VERIFICATION_CHALLENGE_TIMED_OUT.getResponse();
    }

    User u = new User();
    u.creationTime = System.currentTimeMillis();
    u.name = evc.name;
    u.email = evc.email;
    u.verificationChallengeKeyHash = evc.verificationChallengeKeyHash;
    userService.add(u);

    Password p = new Password();
    p.creationTime = System.currentTimeMillis();
    p.creatorUserId = u.userId;
    p.userId = u.userId;
    p.passwordHash = evc.passwordHash;
    p.passwordKind = PasswordKind.CHANGE;
    p.passwordResetKeyHash = "";
    passwordService.add(p);
    return new ResponseEntity<>(fillUser(u), HttpStatus.OK);
  }

  @RequestMapping("/passwordReset/new/")
  public ResponseEntity<?> newPasswordReset(@RequestParam String userEmail) {
    if (mailService.emailExistsInBlacklist(userEmail)) {
      return Errors.EMAIL_BLACKLISTED.getResponse();
    }

    User user = userService.getByEmail(userEmail);
    if (user == null) {
      return Errors.USER_NONEXISTENT.getResponse();
    }

    // generate raw random key
    String rawKey = Utils.generateKey();

    PasswordReset pr = new PasswordReset();
    pr.passwordResetKeyHash = Utils.hashGeneratedKey(rawKey);
    pr.creationTime = System.currentTimeMillis();
    pr.creatorUserId = user.userId;

    mailService.send(user.email, serviceName + ": Password Reset", //
        "<p>Requested password reset service.</p>" + //
            "<p>If you did not make this request, then feel free to ignore.</p>" + //
            "<p>This link is valid for up to 15 minutes.</p>" + //
            "<p>Do not share this link with others.</p>" + //
            "<p>Password Change link: " + //
            websiteUrl + "/reset_password?resetKey=" + rawKey + "</p>" //
    ); //

    passwordResetService.add(pr);
    return new ResponseEntity<>(fillPasswordReset(pr), HttpStatus.OK);
  }

  // This method updates the password for same user only
  @RequestMapping("/password/newChange/")
  public ResponseEntity<?> newPasswordChange( //
      @RequestParam long userId, //
      @RequestParam String newPassword, //
      @RequestParam String apiKey //
  ) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    if (key.creatorUserId != userId) {
      return Errors.PASSWORD_CANNOT_CREATE_FOR_OTHERS.getResponse();
    }

    if (!Utils.securePassword(newPassword)) {
      return Errors.PASSWORD_INSECURE.getResponse();
    }

    Password password = new Password();
    password.creationTime = System.currentTimeMillis();
    password.creatorUserId = key.creatorUserId;
    password.userId = key.creatorUserId;
    password.passwordKind = PasswordKind.CHANGE;
    password.passwordHash = Utils.encodePassword(newPassword);
    password.passwordResetKeyHash = "";

    passwordService.add(password);
    return new ResponseEntity<>(fillPassword(password), HttpStatus.OK);
  }

  // This method updates the password for same user only
  @RequestMapping("/password/newCancel/")
  public ResponseEntity<?> newPasswordCancel( //
      @RequestParam long userId, //
      @RequestParam String apiKey //
  ) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    if (key.creatorUserId != userId) {
      return Errors.PASSWORD_CANNOT_CREATE_FOR_OTHERS.getResponse();
    }

    Password password = new Password();
    password.creationTime = System.currentTimeMillis();
    password.creatorUserId = key.creatorUserId;
    password.userId = key.creatorUserId;
    password.passwordKind = PasswordKind.CANCEL;
    password.passwordHash = "";
    password.passwordResetKeyHash = "";

    passwordService.add(password);
    return new ResponseEntity<>(fillPassword(password), HttpStatus.OK);
  }

  @RequestMapping("/password/newReset/")
  public ResponseEntity<?> newPasswordReset( //
      @RequestParam String passwordResetKey, //
      @RequestParam String newPassword //
  ) {

    PasswordReset psr = passwordResetService.getByPasswordResetKeyHash(Utils.hashGeneratedKey(passwordResetKey));

    if (psr == null) {
      return Errors.PASSWORD_RESET_NONEXISTENT.getResponse();
    }

    // deny if timed out
    if (System.currentTimeMillis() > (psr.creationTime + fifteenMinutes)) {
      return Errors.PASSWORD_RESET_TIMED_OUT.getResponse();
    }

    // deny if password already exists created from this psr
    if (passwordService.existsByPasswordResetKeyHash(psr.passwordResetKeyHash)) {
      return Errors.PASSWORD_EXISTENT.getResponse();
    }

    // reject insecure passwords
    if (!Utils.securePassword(newPassword)) {
      return Errors.PASSWORD_INSECURE.getResponse();
    }

    Password password = new Password();
    password.creationTime = System.currentTimeMillis();
    password.creatorUserId = psr.creatorUserId;
    password.userId = psr.creatorUserId;
    password.passwordKind = PasswordKind.RESET;
    password.passwordHash = Utils.encodePassword(newPassword);
    password.passwordResetKeyHash = psr.passwordResetKeyHash;

    passwordService.add(password);
    return new ResponseEntity<>(fillPassword(password), HttpStatus.OK);
  }

  @RequestMapping("/subscription/new/")
  public ResponseEntity<?> newSubscription( //
      @RequestParam SubscriptionKind subscriptionKind, //
      @RequestParam String apiKey) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_NONEXISTENT.getResponse();
    }

    Subscription subscription = new Subscription();
    subscription.creationTime = System.currentTimeMillis();
    subscription.creatorUserId = key.creatorUserId;
    subscription.subscriptionKind = subscriptionKind;
    subscription.maxUses = 1;
    subscriptionService.add(subscription);

    return new ResponseEntity<>(fillSubscription(subscription), HttpStatus.OK);
  }

  @RequestMapping("/goal/new/")
  public ResponseEntity<?> newGoal( //
      @RequestParam String name, //
      @RequestParam String description, //
      @RequestParam long durationEstimate, //
      @RequestParam long timeUtilityFunctionId, //
      @RequestParam boolean scheduled, //
      @RequestParam long startTime, //
      @RequestParam long duration, //
      @RequestParam String apiKey) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_NONEXISTENT.getResponse();
    }

    Goal goal = new Goal();
    goal.creationTime = System.currentTimeMillis();
    goal.creatorUserId = key.creatorUserId;
    goalService.add(goal);

    GoalData goalData = new GoalData();
    goalData.goalId = goal.goalId;
    goalData.creationTime = System.currentTimeMillis();
    goalData.creatorUserId = key.creatorUserId;
    goalData.name = name;
    goalData.description = description;
    goalData.duration = durationEstimate;
    goalData.timeUtilityFunctionId = timeUtilityFunctionId;
    goalData.scheduled = scheduled;
    goalData.duration = duration;
    goalData.startTime = startTime;
    goalData.status = GoalDataStatusKind.PENDING;
    goalDataService.add(goalData);

    return new ResponseEntity<>(fillGoalData(goalData), HttpStatus.OK);
  }

  @RequestMapping("/goalData/new/")
  public ResponseEntity<?> newGoalData( //
      @RequestParam long goalId, //
      @RequestParam String name, //
      @RequestParam String description, //
      @RequestParam long durationEstimate, //
      @RequestParam long timeUtilityFunctionId, //
      @RequestParam boolean scheduled, //
      @RequestParam long startTime, //
      @RequestParam long duration, //
      @RequestParam GoalDataStatusKind status, //
      @RequestParam String apiKey) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_NONEXISTENT.getResponse();
    }

    Goal goal = goalService.getByGoalId(goalId);
    if (goal == null) {
      return Errors.GOAL_NONEXISTENT.getResponse();
    }

    if (goal.creatorUserId != key.creatorUserId) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    GoalData goalData = new GoalData();
    goalData.goalId = goal.goalId;
    goalData.creationTime = System.currentTimeMillis();
    goalData.creatorUserId = key.creatorUserId;
    goalData.name = name;
    goalData.description = description;
    goalData.duration = durationEstimate;
    goalData.timeUtilityFunctionId = timeUtilityFunctionId;
    goalData.scheduled = scheduled;
    goalData.duration = duration;
    goalData.startTime = startTime;
    goalData.status = status;
    goalDataService.add(goalData);

    return new ResponseEntity<>(fillGoalData(goalData), HttpStatus.OK);
  }

  @Transactional
  @RequestMapping("/timeUtilityFunction/new/")
  public ResponseEntity<?> newTimeUtilityFunction( //
      @RequestParam long[] startTimes, //
      @RequestParam long[] utils, //
      @RequestParam String apiKey
  ) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_NONEXISTENT.getResponse();
    }

    if(startTimes.length < 1  || startTimes.length != utils.length) {
      return Errors.TIME_UTILITY_FUNCTION_NOT_VALID.getResponse();
    }

    TimeUtilityFunction timeUtilityFunction = new TimeUtilityFunction();
    timeUtilityFunction.creationTime = System.currentTimeMillis();
    timeUtilityFunction.creatorUserId = key.creatorUserId;
    timeUtilityFunctionService.add(timeUtilityFunction);

    for(int i = 0; i < startTimes.length; i++) {
      TimeUtilityFunctionPoint timeUtilityFunctionPoint = new TimeUtilityFunctionPoint();
      timeUtilityFunctionPoint.creationTime = System.currentTimeMillis();
      timeUtilityFunctionPoint.creatorUserId = key.creatorUserId;
      timeUtilityFunctionPoint.timeUtilityFunctionId = timeUtilityFunction.timeUtilityFunctionId;
      timeUtilityFunctionPoint.startTime = startTimes[i];
      timeUtilityFunctionPoint.utils = utils[i];
      timeUtilityFunctionPointService.add(timeUtilityFunctionPoint);
    }
    return new ResponseEntity<>(fillTimeUtilityFunction(timeUtilityFunction), HttpStatus.OK);
  }

  @RequestMapping("/pastEvent/new/")
  public ResponseEntity<?> newPastEvent( //
      @RequestParam String name, //
      @RequestParam String description, //
      @RequestParam long startTime, //
      @RequestParam long duration, //
      @RequestParam String apiKey) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_NONEXISTENT.getResponse();
    }

    PastEvent pastEvent = new PastEvent();
    pastEvent.creationTime = System.currentTimeMillis();
    pastEvent.creatorUserId = key.creatorUserId;
    pastEventService.add(pastEvent);

    PastEventData pastEventData = new PastEventData();
    pastEventData.pastEventId = pastEvent.pastEventId;
    pastEventData.creationTime = System.currentTimeMillis();
    pastEventData.creatorUserId = key.creatorUserId;
    pastEventData.name = name;
    pastEventData.description = description;
    pastEventData.startTime = startTime;
    pastEventData.duration = duration;
    pastEventData.active = true;
    pastEventDataService.add(pastEventData);

    return new ResponseEntity<>(fillPastEventData(pastEventData), HttpStatus.OK);
  }

  @RequestMapping("/pastEventData/new/")
  public ResponseEntity<?> newPastEventData( //
      @RequestParam long pastEventId, //
      @RequestParam String name, //
      @RequestParam String description, //
      @RequestParam long startTime, //
      @RequestParam long duration, //
      @RequestParam boolean active, //
      @RequestParam String apiKey) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_NONEXISTENT.getResponse();
    }

    PastEvent pastEvent = pastEventService.getByPastEventId(pastEventId);
    if (pastEvent == null) {
      return Errors.PAST_EVENT_NONEXISTENT.getResponse();
    }

    if (pastEvent.creatorUserId != key.creatorUserId) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    PastEventData pastEventData = new PastEventData();
    pastEventData.pastEventId = pastEvent.pastEventId;
    pastEventData.creationTime = System.currentTimeMillis();
    pastEventData.creatorUserId = key.creatorUserId;
    pastEventData.name = name;
    pastEventData.description = description;
    pastEventData.startTime = startTime;
    pastEventData.duration = duration;
    pastEventData.active = active;
    pastEventDataService.add(pastEventData);

    return new ResponseEntity<>(fillPastEventData(pastEventData), HttpStatus.OK);
  }

  @RequestMapping("/password/")
  public ResponseEntity<?> viewPassword( //
      @RequestParam(required = false) Long passwordId, //
      @RequestParam(required = false) Long creationTime, //
      @RequestParam(required = false) Long minCreationTime, //
      @RequestParam(required = false) Long maxCreationTime, //
      @RequestParam(required = false) Long creatorUserId, //
      @RequestParam(required = false) Long userId, //
      @RequestParam(required = false) PasswordKind passwordKind, //
      @RequestParam(defaultValue = "false") boolean onlyRecent, //
      @RequestParam(defaultValue = "0") long offset, //
      @RequestParam(defaultValue = "100") long count, //
      @RequestParam String apiKey //
  ) {

    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    Stream<Password> list = passwordService.query( //
        passwordId, //
        creationTime, //
        minCreationTime, //
        maxCreationTime, //
        creatorUserId, //
        userId, //
        passwordKind, //
        onlyRecent, //
        offset, //
        count //
    ).map(x -> fillPassword(x));
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

  @RequestMapping("/apiKey/")
  public ResponseEntity<?> viewApiKey( //
      @RequestParam(required = false) Long apiKeyId, //
      @RequestParam(required = false) Long creatorUserId, //
      @RequestParam(required = false) Long creationTime, //
      @RequestParam(required = false) Long minCreationTime, //
      @RequestParam(required = false) Long maxCreationTime, //
      @RequestParam(required = false) Long duration, //
      @RequestParam(required = false) Long minDuration, //
      @RequestParam(required = false) Long maxDuration, //
      @RequestParam(required = false) ApiKeyKind apiKeyKind, //
      @RequestParam(defaultValue = "false") boolean onlyRecent, //
      @RequestParam(defaultValue = "0") long offset, //
      @RequestParam(defaultValue = "100") long count, //
      @RequestParam String apiKey //
  ) {

    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    Stream<ApiKey> list = apiKeyService.query( //
        apiKeyId, //
        creatorUserId, //
        creationTime, //
        minCreationTime, //
        maxCreationTime, //
        duration, //
        minDuration, //
        maxDuration, //
        apiKeyKind, //
        onlyRecent, //
        offset, //
        count //
    ).map(x -> fillApiKey(x));
    return new ResponseEntity<>(list, HttpStatus.OK);
  }


  @RequestMapping("/goal/")
  public ResponseEntity<?> viewGoal( //
      @RequestParam(required = false) Long goalId, //
      @RequestParam(required = false) Long creationTime, //
      @RequestParam(required = false) Long minCreationTime, //
      @RequestParam(required = false) Long maxCreationTime, //
      @RequestParam(required = false) Long creatorUserId, //
      @RequestParam(defaultValue = "0") long offset, //
      @RequestParam(defaultValue = "100") long count, //
      @RequestParam String apiKey //
  ) {

    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    Stream<Goal> list = goalService.query( //
        goalId, //
        creationTime, //
        minCreationTime, //
        maxCreationTime, //
        creatorUserId, //
        offset, //
        count //
    ).map(x -> fillGoal(x));
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

  @RequestMapping("/goalData/")
  public ResponseEntity<?> viewGoalData( //
      @RequestParam(required = false) Long goalDataId, //
      @RequestParam(required = false) Long creationTime, //
      @RequestParam(required = false) Long minCreationTime, //
      @RequestParam(required = false) Long maxCreationTime, //
      @RequestParam(required = false) Long creatorUserId, //
      @RequestParam(required = false) Long goalId, //
      @RequestParam(required = false) String name, //
      @RequestParam(required = false) String partialName, //
      @RequestParam(required = false) String description, //
      @RequestParam(required = false) String partialDescription, //
      @RequestParam(required = false) Long durationEstimate, //
      @RequestParam(required = false) Long minDurationEstimate, //
      @RequestParam(required = false) Long maxDurationEstimate, //
      @RequestParam(required = false) Long timeUtilityFunctionId, //
      @RequestParam(required = false) Boolean scheduled, //
      @RequestParam(required = false) Long duration, //
      @RequestParam(required = false) Long minDuration, //
      @RequestParam(required = false) Long maxDuration, //
      @RequestParam(required = false) Long startTime, //
      @RequestParam(required = false) Long minStartTime, //
      @RequestParam(required = false) Long maxStartTime, //
      @RequestParam(required = false) GoalDataStatusKind status, //
      @RequestParam(defaultValue = "false") boolean onlyRecent, //
      @RequestParam(defaultValue = "0") long offset, //
      @RequestParam(defaultValue = "100") long count, //
      @RequestParam String apiKey //
  ) {

    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    Stream<GoalData> list = goalDataService.query( //
       goalDataId, //
       creationTime, //
       minCreationTime, //
       maxCreationTime, //
       creatorUserId, //
       goalId, //
       name, //
       partialName, //
       description, //
       partialDescription, //
       durationEstimate, //
       minDurationEstimate, //
       maxDurationEstimate, //
       timeUtilityFunctionId, //
       scheduled, //
       duration, //
       minDuration, //
       maxDuration, //
       startTime, //
       minStartTime, //
       maxStartTime, //
       status, //
       onlyRecent, //
       offset, //
       count //
    ).map(x -> fillGoalData(x));
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

  @RequestMapping("/pastEvent/")
  public ResponseEntity<?> viewPastEvent( //
      @RequestParam(required = false) Long pastEventId, //
      @RequestParam(required = false) Long creationTime, //
      @RequestParam(required = false) Long minCreationTime, //
      @RequestParam(required = false) Long maxCreationTime, //
      @RequestParam(required = false) Long creatorUserId, //
      @RequestParam(defaultValue = "0") long offset, //
      @RequestParam(defaultValue = "100") long count, //
      @RequestParam String apiKey //
  ) {

    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    Stream<PastEvent> list = pastEventService.query( //
        pastEventId, //
        creationTime, //
        minCreationTime, //
        maxCreationTime, //
        creatorUserId, //
        offset, //
        count //
    ).map(x -> fillPastEvent(x));
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

  @RequestMapping("/pastEventData/")
  public ResponseEntity<?> viewPastEventData( //
      @RequestParam(required = false) Long pastEventDataId, //
      @RequestParam(required = false) Long creationTime, //
      @RequestParam(required = false) Long minCreationTime, //
      @RequestParam(required = false) Long maxCreationTime, //
      @RequestParam(required = false) Long creatorUserId, //
      @RequestParam(required = false) Long pastEventId, //
      @RequestParam(required = false) String name, //
      @RequestParam(required = false) String partialName, //
      @RequestParam(required = false) String description, //
      @RequestParam(required = false) String partialDescription, //
      @RequestParam(required = false) Long startTime, //
      @RequestParam(required = false) Long minStartTime, //
      @RequestParam(required = false) Long maxStartTime, //
      @RequestParam(required = false) Long duration, //
      @RequestParam(required = false) Long minDuration, //
      @RequestParam(required = false) Long maxDuration, //
      @RequestParam(required = false) Boolean active, //
      @RequestParam(defaultValue = "false") boolean onlyRecent, //
      @RequestParam(defaultValue = "0") long offset, //
      @RequestParam(defaultValue = "100") long count, //
      @RequestParam String apiKey //
  ) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    Stream<PastEventData> list = pastEventDataService.query( //
        pastEventDataId, //
        creationTime, //
        minCreationTime, //
        maxCreationTime, //
        creatorUserId, //
        pastEventId, //
        name, //
        partialName, //
        description, //
        partialDescription, //
        startTime, //
        minStartTime, //
        maxStartTime, //
        duration, //
        minDuration, //
        maxDuration, //
        active, //
        onlyRecent, //
        offset, //
        count //
    ).map(x -> fillPastEventData(x));
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

  @RequestMapping("/timeUtilityFunction/")
  public ResponseEntity<?> viewTimeUtilityFunction( //
      @RequestParam(required = false) Long timeUtilityFunctionId, //
      @RequestParam(required = false) Long creationTime, //
      @RequestParam(required = false) Long minCreationTime, //
      @RequestParam(required = false) Long maxCreationTime, //
      @RequestParam(required = false) Long creatorUserId, //
      @RequestParam(defaultValue = "0") long offset, //
      @RequestParam(defaultValue = "100") long count, //
      @RequestParam String apiKey //
  ) {

    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    Stream<TimeUtilityFunction> list = timeUtilityFunctionService.query( //
        timeUtilityFunctionId, //
        creationTime, //
        minCreationTime, //
        maxCreationTime, //
        creatorUserId, //
        offset, //
        count //
    ).map(x -> fillTimeUtilityFunction(x));
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

  @RequestMapping("/timeUtilityFunctionPoint/")
  public ResponseEntity<?> viewTimeUtilityFunctionPoint( //
      @RequestParam(required = false) Long timeUtilityFunctionPointId, //
      @RequestParam(required = false) Long creationTime, //
      @RequestParam(required = false) Long minCreationTime, //
      @RequestParam(required = false) Long maxCreationTime, //
      @RequestParam(required = false) Long creatorUserId, //
      @RequestParam(required = false) Long timeUtilityFunctionId, //
      @RequestParam(required = false) Long startTime, //
      @RequestParam(required = false) Long minStartTime, //
      @RequestParam(required = false) Long maxStartTime, //
      @RequestParam(required = false) Long utils, //
      @RequestParam(required = false) Long minUtils, //
      @RequestParam(required = false) Long maxUtils, //
      @RequestParam(defaultValue = "0") long offset, //
      @RequestParam(defaultValue = "100") long count, //
      @RequestParam String apiKey //
  ) {

    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_UNAUTHORIZED.getResponse();
    }

    Stream<TimeUtilityFunctionPoint> list = timeUtilityFunctionPointService.query( //
        timeUtilityFunctionPointId, //
        creationTime, //
        minCreationTime, //
        maxCreationTime, //
        creatorUserId, //
        timeUtilityFunctionId, //
        startTime, //
        minStartTime, //
        maxStartTime, //
        utils, //
        minUtils, //
        maxUtils, //
        offset, //
        count //
    ).map(x -> fillTimeUtilityFunctionPoint(x));
    return new ResponseEntity<>(list, HttpStatus.OK);
  }

}
