import { _, promiseSerial } from '../utils'
import { checkAddressIsValid } from './specUtils'

const _process = async (ctx, inputId, config) => ctx.callbacks.getInput(ctx.id, inputId, config)

const INPUTS = {
  address: {
    process: async (ctx, inputId, config) => {
      const result = await ctx.callbacks.getInput(ctx.id, inputId, config)

      if (result) {
        await checkAddressIsValid(ctx, result, config.addressType)
      }

      return result
    },
  },
  uint: {
    process: _process
  },
  int: {
    process: _process
  },
  bool: {
    process: _process
  },
  string: {
    process: _process
  },
  bytes32: {
    process: _process
  },
}

export const processList = async (ctx, inputs) => (
  promiseSerial(inputs, async (inputId, inputConfig) => {
    const newCtx = { ...ctx, id: `${ctx.parentId}.inputs.${inputId}` }

    if (_.isEmpty(inputConfig)) {
      ctx.errors.add(newCtx.id, `must not be empty`)
    } else {
      const { title, type } = inputConfig

      if (!title) {
        ctx.errors.add(newCtx.id, `must have a title`)
      }

      if (!INPUTS[type]) {
        ctx.errors.add(newCtx.id, `must have a valid type: ${Object.keys(INPUTS).join(', ')}`)
      }

      ctx.inputs[inputId] = await INPUTS[type].process(newCtx, inputId, inputConfig)
    }
  })
)
