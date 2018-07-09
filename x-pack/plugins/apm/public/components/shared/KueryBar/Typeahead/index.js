/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Suggestions from './Suggestions';
import ClickOutside from './ClickOutside';
import {
  EuiButton,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiProgress,
  EuiIconTip
} from '@elastic/eui';

const KEY_CODES = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ENTER: 13,
  ESC: 27,
  TAB: 9
};

export class Typeahead extends Component {
  state = {
    isSuggestionsVisible: false,
    index: null,
    value: '',
    inputIsPristine: true
  };

  static getDerivedStateFromProps(props, state) {
    if (state.inputIsPristine && props.initialValue) {
      return {
        value: props.initialValue
      };
    }

    return null;
  }

  incrementIndex = currentIndex => {
    let nextIndex = currentIndex + 1;
    if (currentIndex === null || nextIndex >= this.props.suggestions.length) {
      nextIndex = 0;
    }
    this.setState({ index: nextIndex });
  };

  decrementIndex = currentIndex => {
    let previousIndex = currentIndex - 1;
    if (previousIndex < 0) {
      previousIndex = null;
    }
    this.setState({ index: previousIndex });
  };

  onKeyUp = event => {
    const { selectionStart } = event.target;
    const { value } = this.state;
    switch (event.keyCode) {
      case KEY_CODES.LEFT:
        this.setState({ isSuggestionsVisible: true });
        this.props.onChange(value, selectionStart);
        break;
      case KEY_CODES.RIGHT:
        this.setState({ isSuggestionsVisible: true });
        this.props.onChange(value, selectionStart);
        break;
    }
  };

  onKeyDown = event => {
    const { isSuggestionsVisible, index, value } = this.state;
    switch (event.keyCode) {
      case KEY_CODES.DOWN:
        event.preventDefault();
        if (isSuggestionsVisible) {
          this.incrementIndex(index);
        } else {
          this.setState({ isSuggestionsVisible: true, index: 0 });
        }
        break;
      case KEY_CODES.UP:
        event.preventDefault();
        if (isSuggestionsVisible) {
          this.decrementIndex(index);
        }
        break;
      case KEY_CODES.ENTER:
        event.preventDefault();
        if (isSuggestionsVisible && this.props.suggestions[index]) {
          this.selectSuggestion(this.props.suggestions[index]);
        } else {
          this.setState({ isSuggestionsVisible: false });
          this.props.onSubmit(value);
        }
        break;
      case KEY_CODES.ESC:
        event.preventDefault();
        this.setState({ isSuggestionsVisible: false });
        this.props.onSubmit(value);
        break;
      case KEY_CODES.TAB:
        this.setState({ isSuggestionsVisible: false });
        break;
    }
  };

  selectSuggestion = suggestion => {
    const nextInputValue =
      this.state.value.substr(0, suggestion.start) +
      suggestion.text +
      this.state.value.substr(suggestion.end);

    this.setState({ value: nextInputValue, index: null });
    this.props.onChange(nextInputValue, nextInputValue.length);
  };

  onClickOutside = () => {
    const { value } = this.state;
    this.setState({ isSuggestionsVisible: false });
    this.props.onSubmit(value);
  };

  onChangeInputValue = event => {
    const { value, selectionStart } = event.target;
    this.setState({
      value,
      inputIsPristine: false,
      isSuggestionsVisible: true,
      index: null
    });
    this.props.onChange(value, selectionStart);
  };

  onClickInput = event => {
    const { selectionStart } = event.target;
    this.props.onChange(this.state.value, selectionStart);
  };

  onClickSuggestion = suggestion => {
    this.selectSuggestion(suggestion);
    this.inputRef.focus();
  };

  onMouseEnterSuggestion = index => {
    this.setState({ index });
  };

  onSubmit = () => {
    this.props.onSubmit(this.state.value);
    this.setState({ isSuggestionsVisible: false });
  };

  render() {
    return (
      <ClickOutside
        onClickOutside={this.onClickOutside}
        style={{ position: 'relative' }}
      >
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem style={{ position: 'relative' }}>
            <EuiFieldSearch
              fullWidth
              style={{
                backgroundImage: 'none'
              }}
              placeholder="Search transactions or errors… (i.e. transaction.duration.us => 100000)"
              ref={node => (this.inputRef = node)}
              value={this.state.value}
              onKeyDown={this.onKeyDown}
              onKeyUp={this.onKeyUp}
              onChange={this.onChangeInputValue}
              onClick={this.onClickInput}
              autoComplete="off"
              spellCheck={false}
            />

            {this.props.isLoading && (
              <EuiProgress
                size="xs"
                color="accent"
                position="absolute"
                style={{
                  bottom: 0,
                  top: 'initial'
                }}
              />
            )}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton>Search</EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiIconTip
              content="The Query bar feature is still in beta. Help us report any issues or bugs by using the APM feedback link in the top."
              position="left"
            />
          </EuiFlexItem>
        </EuiFlexGroup>

        <Suggestions
          show={this.state.isSuggestionsVisible}
          suggestions={this.props.suggestions}
          index={this.state.index}
          onClick={this.onClickSuggestion}
          onMouseEnter={this.onMouseEnterSuggestion}
        />
      </ClickOutside>
    );
  }
}

Typeahead.propTypes = {
  initialValue: PropTypes.string,
  isLoading: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  suggestions: PropTypes.array.isRequired
};

Typeahead.defaultProps = {
  isLoading: false,
  suggestions: []
};
