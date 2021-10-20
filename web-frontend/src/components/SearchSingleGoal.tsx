import AsyncSelect from 'react-select/async';
import { SingleValue } from 'react-select';
import { GoalData } from '@innexgo/frontend-todo-app-api';

interface SearchSingleGoalProps {
  name: string,
  disabled?: boolean,
  search: (input: string) => Promise<GoalData[]>,
  isInvalid: boolean,
  setFn: (Goal: GoalData | null) => void
}

type GoalDataOption = {
  label: string,
  value: GoalData
}

export default function SearchSingleGoal(props: SearchSingleGoalProps) {
  const promiseOptions = async function(input: string): Promise<GoalDataOption[]> {
    const results = await props.search(input);

    return results.map((x: GoalData): GoalDataOption => ({
      label: `${x.name}`,
      value: x
    }));
  };


  const onChange = (opt: SingleValue<GoalDataOption>) => {
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
