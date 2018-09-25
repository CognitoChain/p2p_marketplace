import React, { Component } from "react";
import { DropdownToggle, DropdownMenu, DropdownItem, InputGroup, Input, InputGroupButtonDropdown, InputGroupAddon} from 'reactstrap';

class TokenSelect extends Component {
    render() {
        const { name, dropdownFieldName, dropdownFieldDefaultValue, onChange, defaultValue, tokens, dropdownOpen, toggleDropDown } = this.props;
        return (
            <InputGroup>
                <InputGroupButtonDropdown addonType="prepend" isOpen={dropdownOpen} toggle={() => toggleDropDown(dropdownFieldName)}>
                    <DropdownToggle color="info" caret>
                        {dropdownFieldDefaultValue}
                    </DropdownToggle>
                    <DropdownMenu>
                        {tokens.map((token) => (
                            <DropdownItem key={token.symbol} value={token.symbol} name={dropdownFieldName} onClick={onChange}>
                                {`${token.symbol} (${token.name})`}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </InputGroupButtonDropdown>
                <Input name={name} onChange={onChange} type="number" value={defaultValue}/>
                <InputGroupAddon addonType="append">{dropdownFieldDefaultValue}</InputGroupAddon>
            </InputGroup>
        );
    }
}

export default TokenSelect;