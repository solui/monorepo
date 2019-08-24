import React, { useCallback, useReducer, useMemo } from 'react'
import styled from '@emotion/styled'

import Input from './Input'

const Title = styled.h2`
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 1em;
`

const inputStateReducer = (state, { id, value, valid, error }) => ({
  ...state,
  [id]: { value, valid, error },
})

// initial reducer state
const createInitialInputState = inputs => inputs.reduce((m, { id }) => {
  m[id] = { value: '', valid: false, error: '' }
  return m
}, {})

export const Panel = ({ title, inputs }) => {
  // reducer
  const [ inputState, updateInputState ] = useReducer(
    inputStateReducer, inputs, createInitialInputState
  )

  // input change handlers
  const onInputChange = useMemo(() => inputs.reduce((m, { id }) => {
    m[id] = (value, valid, error) => updateInputState({ id, value, valid, error })
    return m
  }, {}), [ updateInputState, inputs ])

  // check input validity
  const allInputsValid = useMemo(() => (
    Object.values(inputState).reduce((m, { valid }) => m && valid, true)
  ), [ inputState ])


  // execute handler
  const onExecute = useCallback(() => {
    if (allInputsValid) {
      console.log(inputState)
    }
  }, [ allInputsValid, inputState ])

  return (
    <div>
      <Title>{title}</Title>
      {inputs.map(({ id, config }) => (
        <Input
          key={id}
          id={id}
          onChange={onInputChange[id]}
          config={config}
          {...inputState[id]}
        />
      ))}
      <button onClick={onExecute} disabled={!allInputsValid}>
        Execute
      </button>
    </div>
  )
}

export class PanelBuilder {
  constructor (id, config) {
    this.id = id
    this.title = config.title
    this.inputs = []
    this.execSteps = []
  }

  addInput (id, config) {
    this.inputs.push({ id, config })
  }

  addExecutionStep (config) {
    this.execSteps.push(config)
  }

  getRenderedContent () {
    return <Panel title={this.title} inputs={this.inputs} execSteps={this.execSteps} />
  }
}