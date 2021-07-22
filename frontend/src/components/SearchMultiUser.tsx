import { ValueType } from 'react-select';
import AsyncSelect from 'react-select/async';
import { UserData, isAuthErrorCode } from '@innexgo/frontend-auth-api';

interface SearchMultiUserProps {
  name: string,
  disabled?: boolean,
  search: (input:string) => Promise<UserData[]>,
  isInvalid: boolean,
  setFn: (userData: UserData[]) => void
}

type UserDataOption = {
  label: string,
  value: UserData
}

export default function SearchMultiUser(props: SearchMultiUserProps) {
  const promiseOptions = async function(input: string): Promise<UserDataOption[]> {
    const results = await props.search(input)

    if (isAuthErrorCode(results)) {
      return [];
    }

    return results.map((x: UserData): UserDataOption => ({
      label: x.name,
      value: x
    }));
  };


  const onChange = (opt: ValueType<UserDataOption, true>) => {
    if (opt == null) {
      props.setFn([]);
    } else {
      props.setFn(opt.map(x => x.value));
    }
  }

  return <AsyncSelect
    placeholder="Start typing to search"
    isClearable={true}
    onChange={onChange}
    cacheOptions={true}
    name={props.name}
    isDisabled={props.disabled}
    isMulti={true}
    components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
    noOptionsMessage={() => null}
    loadOptions={promiseOptions} />
}
