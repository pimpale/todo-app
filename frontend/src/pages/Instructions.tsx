import React from 'react';
import SimpleLayout from '../components/SimpleLayout';
import Section from '../components/Section';

function Instructions() {
  return <SimpleLayout>
    <section>
      <h2>Getting Started</h2>
      <br />
      <h4>Registering</h4>
      <p>
        Looking at the home page of 4cast, we can see at the top right corner a "register" button.
        Clicking on this button will redirect you to our register page where you will have to enter in your Name, Email, and Password.
        The last thing to do is to agree to the terms of services and click "Submit Form"
        This should send a verification link to the email you specified and upon clicking the link in the email, you are fully registed and ready to start "Optimizing Your Day"!
          (Note: the verification link only works for 15 minutes after it sent. Please check your spam folder if it is not in your inbox)
      </p>
      <br />
      <h4>Logging In</h4>
    </section>
  </SimpleLayout>
}

export default Instructions;
