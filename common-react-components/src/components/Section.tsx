import React from 'react';

type SectionProps = {
  id: string
  name: string
}

const Section: React.FunctionComponent<SectionProps> = props => {
  return <section style={{
    overflow: "hidden",
    position: "relative",
  }}>
    <span
      id={props.id}
      style={{
        position: "absolute",
        top: "-100px",
        visibility: "hidden",
      }}></span>
    <div className="clearfix">
      <h2 style={{display: "inline"}} className="float-start">{props.name}</h2>
      <a href={`#${props.id}`} className="float-end text-muted"><h3>#</h3></a>
    </div>
    {props.children}
  </section>
}

export default Section;
