import React, { Component } from "react";
import { DropdownToggle, DropdownMenu, DropdownItem, InputGroup, Input, InputGroupButtonDropdown, InputGroupAddon} from 'reactstrap';

const TIME_UNITS = [
    {
        label: "Hour",
        value: "hours",
    },
    {
        label: "Day",
        value: "days",
    },
    {
        label: "Week",
        value: "weeks",
    },
    {
        label: "Month",
        value: "months",
    },
    {
        label: "Year",
        value: "years",
    },
];

class TimeUnitSelect extends Component {
    render() {
        const { name, dropdownFieldName, dropdownFieldDefaultValue, onChange, defaultValue, dropdownOpen, toggleDropDown } = this.props;

        return (
            <InputGroup>
                <InputGroupButtonDropdown addonType="prepend" isOpen={dropdownOpen} toggle={() => toggleDropDown(dropdownFieldName)}>
                    <DropdownToggle color="info" caret>
                        {dropdownFieldDefaultValue.replace(/^./, dropdownFieldDefaultValue[0].toUpperCase())}
                    </DropdownToggle>
                    <DropdownMenu>
                        {TIME_UNITS.map((unit) => (
                            <DropdownItem key={unit.value} value={unit.value} name={dropdownFieldName} onClick={onChange}>
                                {unit.label}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </InputGroupButtonDropdown>
                <Input name={name} onChange={onChange} type="number" value={defaultValue}/>
                <InputGroupAddon addonType="append"> 
                    {dropdownFieldDefaultValue.replace(/^./, dropdownFieldDefaultValue[0].toUpperCase())}
                </InputGroupAddon>
            </InputGroup>
        );
    }
}

export default TimeUnitSelect;
