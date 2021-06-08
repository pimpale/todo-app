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
    goalData.timeUtilityFunction = fillTimeUtilityFunction(
        timeUtilityFunctionService.getByTimeUtilityFunctionId(goalData.timeUtilityFunctionId));
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


  @RequestMapping("/goal/new/")
  public ResponseEntity<?> newGoal( //
      @RequestParam String name, //
      @RequestParam String description, //
      @RequestParam long durationEstimate, //
      @RequestParam long timeUtilityFunctionId, //
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
    goalData.durationEstimate = durationEstimate;
    goalData.timeUtilityFunctionId = timeUtilityFunctionId;
    goalData.scheduled = false;
    goalData.duration = 0;
    goalData.startTime = 0;
    goalData.status = GoalDataStatusKind.PENDING;
    goalDataService.add(goalData);

    return new ResponseEntity<>(fillGoalData(goalData), HttpStatus.OK);
  }

  @RequestMapping("/goal/newScheduled/")
  public ResponseEntity<?> newGoalScheduled( //
      @RequestParam String name, //
      @RequestParam String description, //
      @RequestParam long durationEstimate, //
      @RequestParam long timeUtilityFunctionId, //
      @RequestParam long duration, //
      @RequestParam long startTime, //
      @RequestParam String apiKey) {
    ApiKey key = getApiKeyIfValid(apiKey);
    if (key == null) {
      return Errors.API_KEY_NONEXISTENT.getResponse();
    }

    if(duration <= 0 || duration >= Utils.INT_MAX) {
        return Errors.NEGATIVE_DURATION.getResponse();
    }

    if(startTime <= 0 || startTime >= Utils.INT_MAX) {
        return Errors.NEGATIVE_START_TIME.getResponse();
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
    goalData.durationEstimate = durationEstimate;
    goalData.timeUtilityFunctionId = timeUtilityFunctionId;
    goalData.scheduled = true;
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
    goalData.durationEstimate = durationEstimate;
    goalData.timeUtilityFunctionId = timeUtilityFunctionId;
    goalData.scheduled = false;
    goalData.duration = 0;
    goalData.startTime = 0;
    goalData.status = status;
    goalDataService.add(goalData);

    return new ResponseEntity<>(fillGoalData(goalData), HttpStatus.OK);
  }


  @RequestMapping("/goalData/newScheduled/")
  public ResponseEntity<?> newGoalDataScheduled( //
      @RequestParam long goalId, //
      @RequestParam String name, //
      @RequestParam String description, //
      @RequestParam long durationEstimate, //
      @RequestParam long timeUtilityFunctionId, //
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

    if(duration <= 0 || duration >= Utils.INT_MAX) {
        return Errors.NEGATIVE_DURATION.getResponse();
    }

    if(startTime <= 0 || startTime >= Utils.INT_MAX) {
        return Errors.NEGATIVE_START_TIME.getResponse();
    }

    GoalData goalData = new GoalData();
    goalData.goalId = goal.goalId;
    goalData.creationTime = System.currentTimeMillis();
    goalData.creatorUserId = key.creatorUserId;
    goalData.name = name;
    goalData.description = description;
    goalData.durationEstimate = durationEstimate;
    goalData.timeUtilityFunctionId = timeUtilityFunctionId;
    goalData.scheduled = true;
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
