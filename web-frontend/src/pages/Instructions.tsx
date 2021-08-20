import {SimpleLayout, BrandedComponentProps} from '@innexgo/common-react-components';

function Instructions(props: BrandedComponentProps) {
  return <SimpleLayout branding={props.branding}>
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
      <br />
      <h2>The Dashboard</h2>
      <p>
        Looking at the Dashboard page we can see attributes of our Goals/Tasks, as well as a plus button to add them.
      </p>
      <br />
        <h4>Adding a Task</h4>
        <p>
          Click the plus button opens up a form for us to fill out attributes about our Goal/Task.
          At the top, we can see fields for the Date, Start and End Times, as well as a Utility Distribution.
            - The Utility Distribution can handle three diffent types: No Time Preference, Deadline, Interval.
              - No Time Preference: something like watching a movie can be done no matter what day it is or time
              - Deadline: something like finishing a homework assignment that has a no late policy restriction
              - Interval: something like an interview, or a metting, or even a class.
            - After choosing a distribution, you can move the little vertices of the graph to adhere to how important that particular goal is around certain times of the day.
              - for example, an interval distribution for a hw that has a late policy. Now the graph doesn't necesarily have to be a hard deadline but have a finite negative slope.
          At the bottom, we can see fields for inputting the Goal Name, Duration, and an optional Goal Desciption.
          Submitting the form, make the Goal/Task, but notice that it will say "Not Scheduled".
          To actually schedule the Goal/Task that was just made, we will need to head over to the Calendar Page and schedule it.
        </p>
      <br />
      <br />
      <h2>The Calendar</h2>
      <p>
        Lookin at the Calendar page, we can see a few things. At the top, we see buttons to scroll through the calendar, an optimize button, and a perspective changer in the form
        of "day" or "week"
      </p>
      <br />
        <h4>Adding a Goal/Task</h4>
        <p>
          If we have made Goals and Tasks through the Dashboard, we noticed that they were "Not Scheduled". 
          To schedule them, we will need to click-and-drag them to their appropriate time slots.
          Looking at the top left corner, we should see the Goals and Tasks we created through the Dashboard. 
          If we click on the places Goals, we can see that Time attribute will reflect what time you set it at.
          
          Adding a Goal/Task directly through the Calendar automatically schedules it for where you set it.
          Simply click and drag an empty spot on the calendar and fill out a form similar to how we added a Goal/Task through the Dashboard.
        </p>
        <br />
        <h4>Editing a Goal/Task</h4>
        <p>
          To edit a task through the Calendar, simply click on the task and "Manage Event" window will pop up.
          On the right, there is a column called "Actions" where we can choose to edit (clicking on the pencil) or delete (clicking on the x) the task.
          Clicking the edit button will bring out a form similar to making that task while clicking the delete button will bring a pop-up asking if you want to delete the event.
        </p>
        <h4>Optimizing Your Schedule</h4>
        <p>
          Now that we have task(s) on our calendar, we can optimize them!
          Clicking on the "optimize" button at the top brings out a new calendar view that shows us the taskts that can be optimized.
            - In this view we can see three new buttons: Start, Commit Changes, and Cancel Changes
          By choosing start, 4cast will automatically move your tasks around based on their utility distributions to find the best spot.
            (Note: this process will continue forever, so the user has to manually stop the optimization when they are satisfied with the results)
          Cicking on "Commit Changes" will reflect what was optimized to your regular calendar.
        </p>
    <br />
    <br />
    <h2>The Search</h2>
    <p>
      By clicking the magnifying glass on the sidebar, we are brought to the Search Page.
      At the top, you can see a search bar and can query for an exact task or tasks that have the same name. 
      After typing in what you want to look for, simply click "search" and 4cast will display the tasks with the keywords you searched for. 
      Like with the Calendar and Dashboard, you can edit and delete the tasks that pop up on this page.
    </p>
    <br />
    <br />
    <h2>Settings</h2>
    <p>
      The settings page allows you to change your password and is similar to other "change password" forms
    </p>
    </section>
  </SimpleLayout>
}

export default Instructions;
