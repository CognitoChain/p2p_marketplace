import React, { Component } from "react";
import { DropdownToggle, DropdownMenu, DropdownItem, InputGroup, Input, InputGroupButtonDropdown, InputGroupAddon} from 'reactstrap';

class TokenSelect extends Component {

    keyCallback(evt){
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if ((charCode >= 48 && charCode <= 57) || (charCode >= 96 && charCode <= 105)) { 
            return true;
        }
        return false;
    }

    render() {
        const { name, dropdownFieldName, dropdownFieldDefaultValue, onChange, defaultValue, tokens, dropdownOpen, toggleDropDown,allowedTokens,disableValue } = this.props;
        return (
            <InputGroup>
                <InputGroupButtonDropdown addonType="prepend" isOpen={dropdownOpen} toggle={() => toggleDropDown(dropdownFieldName)}>
                    <DropdownToggle color="info" caret>
                        {dropdownFieldDefaultValue}
                    </DropdownToggle>
                    <DropdownMenu>
                        {tokens.map((token) => {
                            if(allowedTokens === false || (allowedTokens === true && token.balance > 0)){
                                return  <DropdownItem disabled={disableValue == token.symbol} key={token.symbol} value={token.symbol} name={dropdownFieldName}          onClick={onChange}>
                                            {`${token.symbol} (${token.name})`}
                                        </DropdownItem>;        
                            }
                            return false;
                        })}
                    </DropdownMenu>
                </InputGroupButtonDropdown>
                <Input name={name} onChange={onChange} type="number" min="0" onKeyPress={this.keyCallback} value={defaultValue}/>
                <InputGroupAddon addonType="append">{dropdownFieldDefaultValue}</InputGroupAddon>
            </InputGroup>
        );
    }
}

export default TokenSelect;