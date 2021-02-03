import React from 'react';
import { Link } from 'react-router-dom';

import SimpleLayout from '../components/SimpleLayout';
import Section from '../components/Section';


function Home() {
  return (
    <SimpleLayout>

        <Section id="getstarted" name="Get Started For Free">
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Integer ornare ante placerat odio lacinia condimentum.
            Quisque dignissim vulputate vestibulum.
            Pellentesque mollis enim vel ornare laoreet.
            Donec sagittis eget turpis non malesuada.
            Donec ullamcorper eleifend ullamcorper.
            In eget felis malesuada, porttitor dolor viverra, cursus elit.
            Proin dictum neque vel sapien suscipit faucibus.
            Nulla ullamcorper nibh in purus finibus, elementum rhoncus dolor placerat.
            Fusce hendrerit libero elit, sit amet mattis nisi porttitor ac.
            <Link to="/register">Register</Link>
          </div>
        </Section>

        <Section id="getstarted" name="Get Started For Free">
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Integer ornare ante placerat odio lacinia condimentum.
            Quisque dignissim vulputate vestibulum.
            Pellentesque mollis enim vel ornare laoreet.
            Donec sagittis eget turpis non malesuada.
            Donec ullamcorper eleifend ullamcorper.
            In eget felis malesuada, porttitor dolor viverra, cursus elit.
            Proin dictum neque vel sapien suscipit faucibus.
            Nulla ullamcorper nibh in purus finibus, elementum rhoncus dolor placerat.
            Fusce hendrerit libero elit, sit amet mattis nisi porttitor ac.
            <Link to="/register">Register</Link>
          </div>
        </Section>
    </SimpleLayout>
  )
}

export default Home;
