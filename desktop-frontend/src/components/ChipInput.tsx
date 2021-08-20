import React from 'react';
import { Badge } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';

/**Type of Input-Props */
export type ChipInputProps = {
  placeholder: string,
  /**Emits index */
  onRemove: (index: number) => void;
  /**Array of chips */
  chips: string[];
  /**Emits value */
  onSubmit: (value: string) => void;
};

// TODO
// we need to give the outer border a focus state
// we need to figure out a better scroll for the thing

export default class ReactChipInput extends React.Component<ChipInputProps> {
  /**Ref object for input */
  formControlRef: any;

  /**Ref object for outer */
  divRef: any;


  constructor(props: Readonly<ChipInputProps>) {
    super(props);
    this.formControlRef = React.createRef();
  }

  /**This is needed, as chips array will get changed frequently. */
  componentDidUpdate(prevProps: Readonly<ChipInputProps>) {
    if (prevProps.chips.length !== this.props.chips.length) {
      this.formControlRef.current.value = '';
    }
  }
  render() {
    return (
      /**The main container div, funnels focus down to the inner input */
      <div
        ref={this.divRef}
        tabIndex={-1}
        className="form-control"
        style={{ height: "auto" }}
        onFocus={() => this.formControlRef.current.focus()}
        onBlur={() => this.formControlRef.current.blur()}
      >
        {/* Each chip is bootstrap's col */}
        {this.props.chips.map((chip, index) => (
          <Badge key={index} bg="secondary" className="mx-1 mb-1">
            {chip}
            {/* The icon which helps user, if user wants to remove the chip */}
            <X
              className={['ml-2'].join(' ')}
              onClick={() => this.props.onRemove(index)}
            />
          </Badge>
        ))}
        {/* The input, from which value is read and chip is added accordingly */}
        <input
          ref={this.formControlRef}
          name="chipInput"
          placeholder={this.props.placeholder}
          aria-label="Chip Input"
          autoComplete="off"
          style={{
            outline: "none",
            border: "none",
          }}
          onKeyDown={(e: any) => {
            if (e.keyCode === 13) {
              e.preventDefault();
              this.props.onSubmit(this.formControlRef.current.value);
            }
          }}
        />
      </div>
    );
  }
}
