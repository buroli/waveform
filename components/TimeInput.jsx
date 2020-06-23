import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { secondsToHms } from '@/helpers/others';
import ArrowDownFull from '@/components/Icons/ArrowDownFull';

const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const StyledInput = styled.input`
  border: 1px solid ${p => p.theme.colors.lightGrey};
  background: white;
  color: #696b70;
  font-size: 14px;
  width: 40px;
  height: 30px;
  border-radius: 3px;
  padding: 0 4px;
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`;

const StyledLabel = styled.span`
  font-size: 14px;
  color: #696b70;
  margin: 0;
  margin-left: -4px;
  padding: 0 8px;
`;

const Arrowcontainer = styled.div`
  position: absolute;
  left: 24px;
  top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: 12px;
  height: 20px;
  padding: 0;
  margin: 0;
`;

const StyledArrowUp = styled(ArrowDownFull)`
  transform: rotate(180deg);
`;

const StyledArrowDown = styled(ArrowDownFull)``;

const TimeInput = props => {
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    const formattedValue = secondsToHms(props.value);
    const targetdValue = formattedValue.split(':')[props.index];
    setInputValue(targetdValue);
  }, [props.value]);

  const handleArrowClick = (action, incrementValue, value, id) => {
    props.handleArrowChange(action, incrementValue, value, id);
  };

  const handleInputChange = e => {
    props.handleChange(e, inputValue, props.value, props.incrementValue);
  };

  return (
    <Container style={{ display: 'inline-flex' }}>
      <StyledInput
        {...props}
        type="number"
        value={inputValue}
        name={props.name}
        onChange={handleInputChange}
        onFocus={props.onFocus}
      />
      <Arrowcontainer>
        <StyledArrowUp
          width="8px"
          height="8px"
          fill="#89C42C"
          name="arrowUp"
          onClick={() =>
            handleArrowClick(
              'increment',
              props.incrementValue,
              props.value,
              props.id
            )
          }
        />
        <StyledArrowDown
          width="8px"
          height="8px"
          fill="#89C42C"
          name="arrowDown"
          onClick={() =>
            handleArrowClick(
              'decrement',
              props.incrementValue,
              props.value,
              props.id
            )
          }
        />
      </Arrowcontainer>
      {props.label && <StyledLabel>{props.label}</StyledLabel>}
    </Container>
  );
};

TimeInput.proptypes = {
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

export default TimeInput;
