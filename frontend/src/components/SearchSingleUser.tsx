import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { isApiErrorCode } from '../utils/utils';

interface SearchSingleUserProps {
  name: string,
  disabled?:boolean,
  search: (input: string) => Promise<User[]>,
  isInvalid: boolean,
  setFn: (user: User | null) => void
}

type UserOption = {
  label: string,
  value: User
}

export default function SearchSingleUser(props: SearchSingleUserProps) {
  const promiseOptions = async function(input: string): Promise<UserOption[]> {
    const results = await props.search(input);

    if (isApiErrorCode(results)) {
      return [];
    }

    return results.map((x: User): UserOption => ({
      label: `${x.name} -- ${x.email}`,
      value: x
    }));
  };


  const onChange = (opt:  ValueType<UserOption, false>) => {
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
