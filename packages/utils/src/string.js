import slug from 'slugify'
import { keccak256 } from '@ethersproject/keccak256'
import validator from 'validator'

/**
 * Obfuscate given string.
 *
 * This replaces most characters in the string with the `*` character, and
 * intelligently handles email addresses such that their general structure
 * is left untouched.
 *
 * @example
 *
 * obfuscate('password') // p*******
 * obfuscate('test@me.com') // t***@m*.c**
 *
 * @param  {String} str Input
 * @return {String}
 */
export const obfuscate = str => {
  if (validator.isEmail(str)) {
    const [ name, at ] = str.split('@')
    const domain = at.split('.')
    return `${obfuscate(name)}@${domain.map(obfuscate).join('.')}`
  } else {
    const strLen = str.length
    if (1 < strLen) {
      return str.charAt(0) + '*'.repeat(strLen - 1)
    } else {
      return '*'
    }
  }
}

/**
 * Slugify given string.
 *
 * Note that this concatenates a random suffix in each call in order to ensure
 * slugs are somewhat unique, and as such is not idempotent.
 *
 * @param  {String} str Input
 * @return {String}
 */
export const slugify = str => slug(`${str} ${Math.random().toString(36).substr(2, 6)}`)

/**
 * Calculate Keccak256 hash of given data.
 *
 * @param  {*} data Input data. If not a `String` it will transform it via `JSON.stringify()` first.
 * @return {String} Hex hash without `0x` prefix.
 */
export const hash = data => keccak256(typeof data !== 'string' ? JSON.stringify(data) : data).substr(2)
