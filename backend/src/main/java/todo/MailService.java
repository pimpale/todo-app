package todo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.amazonaws.regions.Regions;
import com.amazonaws.auth.EnvironmentVariableCredentialsProvider;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.amazonaws.services.simpleemail.model.Body;
import com.amazonaws.services.simpleemail.model.Content;
import com.amazonaws.services.simpleemail.model.Destination;
import com.amazonaws.services.simpleemail.model.Message;
import com.amazonaws.services.simpleemail.model.SendEmailRequest;

@Service
public class MailService {

  @Value("${NOREPLY_EMAIL_ADDR}")
  private String emailAddr;

  private EnvironmentVariableCredentialsProvider awsCredentialProvider = new EnvironmentVariableCredentialsProvider();

  private AmazonSimpleEmailService amazonSESClient = //
      AmazonSimpleEmailServiceClientBuilder.standard() //
          .withCredentials(new AWSStaticCredentialsProvider(awsCredentialProvider.getCredentials())) //
          .withRegion(Regions.US_WEST_1).build(); //

  public void send(String destination, String subject, String content) {
    SendEmailRequest request = new SendEmailRequest() //
        .withDestination( //
            new Destination().withToAddresses(destination)) //
        .withMessage(new Message() //
            .withBody(new Body() //
                .withHtml(new Content() //
                    .withCharset("UTF-8").withData(content))) //
            .withSubject(new Content() //
                .withCharset("UTF-8").withData(subject))) //
        .withSource(emailAddr); //

    amazonSESClient.sendEmail(request);
  }

  public boolean emailExistsInBlacklist(String s) {
      return false;
  }
}
