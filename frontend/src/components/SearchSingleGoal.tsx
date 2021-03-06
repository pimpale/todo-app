import React from 'react'
import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { isApiErrorCode } from '../utils/utils';


interface SearchSingleGoalProps {
  name: string,
  disabled?: boolean,
  search: (input: string) => Promise<GoalData[]>,
  isInvalid: boolean,
  setFn: (Goal: GoalData | null) => void
  searchState: (sprops: string) => void
}

type GoalDataOption = {
  label: string,
  value: GoalData
}

export default function SearchSingleGoal(props: SearchSingleGoalProps) {
  const promiseOptions = async function(input: string): Promise<GoalDataOption[]> {
    const results = await props.search(input);

    if (isApiErrorCode(results)) {
      return [];
    }

    return results.map((x: GoalData): GoalDataOption => ({
      label: `${x.name}`,
      value: x
    }));
  };


  const onChange = (opt: ValueType<GoalDataOption, false>) => {
    if (opt == null) {
      props.setFn(null);
    } else {
      props.setFn(opt.value);
    }
  }

  /*components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }} */ 
  return <AsyncSelect
    placeholder="Search for Goals"
    defaultOptions
    isClearable={true}
    onChange={onChange}
    cacheOptions={true}
    name={props.name}
    loadOptions={promiseOptions} />
}
