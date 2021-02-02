package todo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

@RestControllerAdvice
public class ErrorHandler {

  Logger logger = LoggerFactory.getLogger(ApiController.class);

  @ExceptionHandler(value = { NoHandlerFoundException.class })
  public ResponseEntity<?> notFoundHandler() {
    return Errors.NOT_FOUND.getResponse();
  }


  @ExceptionHandler(value = { Exception.class })
  public ResponseEntity<?> generalHandler(Exception e) {
    logger.error("Internal Server Error:", e);
    return Errors.UNKNOWN.getResponse();
  }
}
