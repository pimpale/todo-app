import { ValueType } from 'react-select';
import AsyncSelect from 'react-select/async';
import { isApiErrorCode } from '../utils/utils';

interface SearchMultiUserProps {
  name: string,
  disabled?: boolean,
  search: (input:string) => Promise<User[]>,
  isInvalid: boolean,
  setFn: (users: User[]) => void
}

type UserOption = {
  label: string,
  value: User
}

export default function SearchMultiUser(props: SearchMultiUserProps) {
  const promiseOptions = async function(input: string): Promise<UserOption[]> {
    const results = await props.search(input)

    if (isApiErrorCode(results)) {
      return [];
    }

    return results.map((x: User): UserOption => ({
      label: `${x.name} -- ${x.email}`,
      value: x
    }));
  };


  const onChange = (opt: ValueType<UserOption, true>) => {
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
