import {SimpleLayout, BrandedComponentProps} from '@innexgo/common-react-components';

function About(props: BrandedComponentProps) {
  return <SimpleLayout branding={props.branding}>
    <section>
      <h2>Our Product</h2>
      <p>
        We have designed a state-of-the-art calendar that also doubles as a to-do app. Now there is no need for multiple apps for calendars and lists when we have the perfect
        solution for you, our all-in-one scheduler: "The insert our name here". Perfect for work. Perfect for students. Perfect for everyday users that need to find the extra
        time in their day.
      </p>
      <br />
      <h2>What Our Product Does</h2>
      <p>
        Our web-based application allows you to efficiently schedule your commitments from the day-to-day, week-to-week, and month-to-month. We know how hectic and convoluted
        life can be so we designed this scheduler to make it easy on our users.
      </p>
      <h4>Commitments</h4>
      <p>
        As students, we understand that there are immovable events in our day-to-day activities that prevent us from doing other things and so we have implemented a feature
        for our users to easily input these types of Commitments.
      </p>
      <h4>Automatic Scheduling</h4>
      <p>
        Our automatic scheduling algorithm allows events to be appropriately placed in the day and respects the Commitments you have in place. This algorithm can schedule
        your recurring tasks and appropriately place them to where it seems best fit. Of course, you can always rearrange the tasks placed for you by dragging them arround
        the calendar.
      </p>
      <h4>To-Do Feed</h4>
      <p>
        As a result of your Commitments and scheduled events, we have designed a To-Do feed that chronoligically lists out your tasks. This tool allows you to easly view your
        activities and remind you of upcoming events.
      </p>
      <h4>Short Term Goal Manager</h4>
      <p>
        On the go and need to quickly add something to your calendar? We got you! Our application also works from your phones. With this in mind, we have also made it
        possible to add Goals that can be done in your off-times or be pushed later in the day or week. We have also made it possible to break tasks into subgoals for
        planning to be easier.
      </p>
      <br />
      <h3>Technologies Used For This Product</h3>
      <p>
        In building our application, we used various programming languages: TypeScript, Java, JavaScript, React, HTML, CSS, and SQL.
      </p>
    </section>
  </SimpleLayout>
}

export default About;
