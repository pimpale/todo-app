import React from 'react'
import Select from 'react-select'
import setHours from 'date-fns/setHours';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import setMinutes from 'date-fns/setMinutes';

type TimePickerProps = {
  time: number,
  setTime: (a: number) => void;
  minTime?:number,
  maxTime?:number,
  className?: string
}

type OptionType = {
  label: string,
  value: Date
}

function TimePicker(props: TimePickerProps) {

  const setHrMin = (d:number,hr:number, min:number) => setMinutes(setHours(d, hr), min)

  const options = [];
  for (let hr = 0; hr < 24; hr++) {
    for (let min = 0; min < 60; min += 30) {
      if( props.minTime && props.minTime >= setHrMin(props.time, hr, min).valueOf()) {
          continue;
      }
      if( props.maxTime && props.maxTime <= setHrMin(props.time, hr, min).valueOf()) {
          continue;
      }
      options.push({ value: setHrMin(props.time, hr, min), label: `${hr}:${min}` });
    }
  }

  const defaultHr = getHours(props.time);
  const defaultMin = getMinutes(props.time);

  return <>
    <Select<OptionType>
      className={props.className}
      options={options}
      defaultValue={{value: new Date(props.time), label: `${defaultHr}:${defaultMin}`}}
      isClearable={false}
      onChange={o => props.setTime(o!.value.valueOf())}
    />
  </>
}

export default TimePicker;
