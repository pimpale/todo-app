import React from 'react';
import SimpleLayout from '../components/SimpleLayout';
import Section from '../components/Section';


function Instructions() {
  return <SimpleLayout>
    <div className="px-3 py-3">
      <Section id="table_of_contents" name="Table of Contents">
        <ul>
          <li>Coffee</li>
          <li>Tea</li>
          <li>Please Insert Instructions Here</li>
          <li>Use Sections for each new section</li>
          <li>Prefer styling with react-bootstrap rather than manually setting css properties</li>
        </ul>
      </Section>
    </div>
  </SimpleLayout>

}

export default Instructions;
