import React, { Component } from 'react';
import { getEmailAddresses } from '../api/addressesAPI'
import { validateEmail } from '../utils/helpers'

export class Autocomplete extends Component {

  state = {
    activeOption: 0,
    filteredOptions: [],
    showOptions: false,
    userInput: '',
    options: [],
    selectedRecipients: []
  };

  async componentDidMount(){
    const options = await getEmailAddresses();
      this.setState({ options })
  }

  onChange = (e) => {

    const { options } = this.state;
    const userInput = e.currentTarget.value;

    const filteredOptions = options.filter(
      (optionName) =>
        optionName.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    this.setState({
      activeOption: 0,
      filteredOptions,
      showOptions: true,
      userInput: e.currentTarget.value
    });
  };

  onClick = (e) => {
    this.addRecipient(e.currentTarget.innerText);
  };

  onKeyDown = (e) => {
    const { activeOption, filteredOptions } = this.state;

    // action for enter and tab key
    if (e.keyCode === 13 || e.keyCode === 9) {
      const address = filteredOptions[activeOption] || e.target.value
      this.addRecipient(address)
    }
    
    // action for up arrow key
    if (e.keyCode === 38) {
      if (activeOption === 0) {
        return;
      }
      this.setState({ activeOption: activeOption - 1 });
    }
    
    // action for down arrow key
    if (e.keyCode === 40) {
      if (activeOption === filteredOptions.length - 1) {
        return;
      }
      this.setState({ activeOption: activeOption + 1 });
    }
  };

  addRecipient = (address) => {
    const selectedRecipients = this.state.selectedRecipients;
    const isInRecipients = selectedRecipients.find( recipient => recipient.address === address);
    if (!isInRecipients){
      selectedRecipients.push({ address, valid: validateEmail(address)});
    }
    this.setState({
      activeOption: 0,
      filteredOptions: [],
      showOptions: false,
      userInput: '',
      selectedRecipients
    });
  }

  removeRecipient = (address) => {
    const { selectedRecipients } = this.state;
    const filtered = selectedRecipients.filter(recipient => recipient.address !== address)
    this.setState({ selectedRecipients: filtered })
  }

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,
      removeRecipient,
      state: { activeOption, filteredOptions, showOptions, userInput, selectedRecipients }
    } = this;
    let optionList;
    if (showOptions && userInput) {
      if (filteredOptions.length) {
        optionList = (
          <ul className="options">
            {filteredOptions.map((optionName, index) => {
              let className;
              if (index === activeOption) {
                className = 'option-active';
              }
              return (
                <li className={className} key={optionName} onClick={onClick}>
                  {optionName}
                </li>
              );
            })}
          </ul>
        );
      }
    }
    return (
      <React.Fragment>
        <div className="search">
          <div>
            {selectedRecipients.map( recipient => {
              return (
              <span key={recipient.address} className={recipient.valid ? 'valid-email': 'invalid-email' }>{recipient.address} <button className="delete-recipient" onClick={() => removeRecipient(recipient.address)}>X</button></span>
              )
            })}
          </div>
          <input
            type="text"
            className="search-box"
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={userInput}
            placeholder="Enter recipients…"
          />
        </div>
        {optionList}
      </React.Fragment>
    );
  }
}

export default Autocomplete;