/**
 * @copyright
 * Copyright (c) 2014 IndigoUnited (https://github.com/IndigoUnited)
 * Copyright (c) 2021 Yannick Deubel (https://github.com/yandeu)
 *
 * @license {@link https://github.com/geckosio/geckos.io/blob/master/LICENSE BSD-3-Clause}
 *
 * @description
 * copied and modified from deep-sort-object@1.0.2 (https://github.com/IndigoUnited/js-deep-sort-object/blob/master/index.js)
 * previously licensed under MIT (https://github.com/IndigoUnited/js-deep-sort-object/blob/master/LICENSE)
 */

import { isPlainObject } from 'is-plain-object'

const isPlainArray = (arr: any) => Array.isArray(arr) && (arr.length > 0 ? typeof arr[0] == "object" : true)

const isValue = (val: any) => !isPlainObject(val) && !isPlainArray(val)

/** Sort objects by key; sort properties that are not itself an object on top. */
// @ts-ignore
const defaultSortFn = ([keyA, valueA], [keyB, valueB]) => {
  if (isValue(valueA) && isValue(valueB)) return keyA.localeCompare(keyB)
  if (isValue(valueA)) return -1
  if (isValue(valueB)) return 1

  return keyA.localeCompare(keyB)
}

const sort = (src: any, comparator?: any): any => {
  let out: any

  if (Array.isArray(src)) {
    return src.map(function (item) {
      return sort(item, comparator)
    })
  }

  if (isPlainObject(src)) {
    out = {}

    Object.entries(src)
      .sort(comparator || defaultSortFn)
      .forEach(function ([key, value]) {
        out[key] = sort(value, comparator)
      })

    return out
  }

  return src
}

export { sort as deepSortObject }
