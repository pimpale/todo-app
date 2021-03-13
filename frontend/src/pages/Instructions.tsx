import React from 'react';
import SimpleLayout from '../components/SimpleLayout';
import Section from '../components/Section';

function Instructions() {
  return <SimpleLayout>
    <section>
      <h2>Registering & Logging In</h2>
      <p>
        Looking at the home page of 4cast, we can see at the top right corner a "register" button.
        Clicking on this button will redirect you to our register page where you will have to enter in your Name, Email, and Password.
        The last thing to do is to agree to the terms of services and click "Submit Form"
        This should send a verification link to the email you specified and upon clicking the link in the email, you are fully registed and ready to start "Optimizing Your Day"!
          (Note: the verification link only works for 15 minutes after it sent. Please check your spam folder if it is not in your inbox)
        
        From the verification link or from the home page of 4cast, we can see a "Login" button right next to "Register" that we used earlier.
        Simply fill out the bozes that require your email and password that was created and you are ready to use 4cast.
      </p>
      <br />
      <h2>The Sidebar</h2>
      <p>
        Inside the app, we can see a gray bar with 6 icons: Expand, Dashboard, Calendar, Search, Settings, and Log Out.
          - Expand increases the size of the sidebar and allows descriptions of the other icons, as well as a greeting so you know what account your are using.
          - Dashboard is the first thing you will see when entering the app. Here, we can see our upcoming Goals/Tasks along with info such their Name, Time, Description, and Utility.
          - Calendar is where we can see all of our current, future, and past events.
          - Search is where we can find our Tasks/Goals in one neat page.
          - Settings is where we can change our password.
      </p>
      <br />
      <h2>The Dashboard</h2>
      <p>
        
      </p>
    </section>
  </SimpleLayout>
}

export default Instructions;
