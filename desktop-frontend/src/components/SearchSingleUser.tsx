import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { UserData} from '@innexgo/frontend-auth-api';

interface SearchSingleUserProps {
  name: string,
  disabled?:boolean,
  search: (input: string) => Promise<UserData[]>,
  isInvalid: boolean,
  setFn: (user: UserData | null) => void
}

type UserDataOption = {
  label: string,
  value: UserData
}

export default function SearchSingleUser(props: SearchSingleUserProps) {
  const promiseOptions = async function(input: string): Promise<UserDataOption[]> {
    const results = await props.search(input);

    return results.map((x: UserData): UserDataOption => ({
      label: x.name,
      value: x
    }));
  };


  const onChange = (opt:  ValueType<UserDataOption, false>) => {
    if (opt == null) {
      props.setFn(null);
    } else {
      props.setFn(opt.value)
    }
  }

  return <AsyncSelect
    placeholder="Start typing to search"
    isClearable={true}
    onChange={onChange}
    name={props.name}
    cacheOptions={true}
    isDisabled={props.disabled}
    components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
    noOptionsMessage={() => null}
    loadOptions={promiseOptions} />
}
