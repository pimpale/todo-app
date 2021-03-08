import Select from 'react-select'
import format from 'date-fns/format'
import {setHrMin} from '../utils/utils';

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


  const options = [];
  for (let hr = 0; hr < 24; hr++) {
    for (let min = 0; min < 60; min += 30) {
      if( props.minTime && props.minTime >= setHrMin(new Date(props.time), hr, min).valueOf()) {
          continue;
      }
      if( props.maxTime && props.maxTime <= setHrMin(new Date(props.time), hr, min).valueOf()) {
          continue;
      }
      options.push({ value: setHrMin(new Date(props.time), hr, min), label: format(setHrMin(new Date(props.time), hr, min), 'p') });
    }
  }

  return <>
    <Select<OptionType>
      className={props.className}
      options={options}
      defaultValue={{value: new Date(props.time), label: format(props.time, 'p')}}
      isClearable={false}
      onChange={o => props.setTime(o!.value.valueOf())}
    />
  </>
}

export default TimePicker;
