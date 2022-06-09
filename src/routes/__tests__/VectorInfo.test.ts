import fs from 'fs'
import { describe, expect, it, beforeEach } from 'vitest'
import { mockGet, mockFetch } from 'vi-fetch'

import { get } from '../vectorinfo.json'

beforeEach(() => {
  mockFetch.clearAll()
})

describe('Route : Vector Info : Parameter Errors', () => {
  it('should return an error if no url parameters', async () => {
    const res = await get({})
    expect(res.code).toEqual(400)
    expect(res.message).toEqual('Bad request. Please verify the URL and/or parameters.')
  })

  it('should return an error if url attribute missing searchParams', async () => {
    const res = await get({
      url: undefined,
    })
    expect(res.code).toEqual(400)
    expect(res.message).toEqual('Bad request. Please verify the URL and/or parameters.')
  })

  it('should return an error if searchParams missing path or layer name parameters', async () => {
    const res = await get({
      url: {
        searchParams: undefined,
      },
    })
    expect(res.code).toEqual(400)
    expect(res.message).toEqual('Bad request. Please verify the URL and/or parameters.')
  })

  it('should return an error if searchParams missing path or layer name parameters', async () => {
    const searchParams = new URLSearchParams('foo=1&bar=2')

    const res = await get({
      url: {
        searchParams,
      },
    })

    expect(res.code).toEqual(400)
    expect(res.message).toEqual('Bad request. Please verify the URL and/or parameters.')
  })
})

describe('Route : Vector Info : Fetch : Fail : No Layer', () => {
  it('should return an error message upon fail of fetch', async () => {
    const path = 'http://localhost/test.pbf'
    const searchParams = new URLSearchParams(`path=${path}&layer_name=NGA_DepRationAdm2`)
    const mock = mockGet(path).willResolve()

    const res = await get({
      url: {
        searchParams,
      },
    })

    expect(mock).toHaveFetched()
    expect(res.body[0].code).toEqual(500)
    expect(res.body[0].message).toEqual("We couldn't find a layer with that name.")
  })
})

describe('Route : Vector Info : Fetch : Success', () => {
  it('should return an array of properties with a path and layer parameters', async () => {
    const path = 'http://localhost/test.pbf'
    const searchParams = new URLSearchParams(`path=${path}&layer_name=NGA_DepRationAdm2`)
    const pbf = fs.readFileSync(`${__dirname}/0.pbf`)
    const mock = mockGet(path).willResolve(pbf)

    const res = await get({
      url: {
        searchParams,
      },
    })

    expect(mock).toHaveFetched()
    expect(res.body.length).toEqual(9)
  })

  it('should return a string property with valid object keys and object types', async () => {
    const path = 'http://localhost/test.pbf'
    const searchParams = new URLSearchParams(`path=${path}&layer_name=NGA_DepRationAdm2`)
    const pbf = fs.readFileSync(`${__dirname}/0.pbf`)
    mockGet(path).willResolve(pbf)
    const res = await get({ url: { searchParams } })

    const stringProperties = res.body.filter((item) => item.type === 'string')
    expect(stringProperties.length).toEqual(6)

    const stringProperty = stringProperties[0]
    const propertyKeys = ['attribute', 'type', 'count', 'values'].sort()
    expect(Object.keys(stringProperty).sort()).toEqual(propertyKeys)

    expect(stringProperty.attribute).toBeTypeOf('string')
    expect(stringProperty.type).toBeTypeOf('string')
    expect(stringProperty.type).toEqual('string')
    expect(stringProperty.count).toBeTypeOf('number')
    expect(stringProperty.values).toBeTypeOf('object')
  })

  it('should return a number property with valid object keys and object types', async () => {
    const path = 'http://localhost/test.pbf'
    const searchParams = new URLSearchParams(`path=${path}&layer_name=NGA_DepRationAdm2`)
    const pbf = fs.readFileSync(`${__dirname}/0.pbf`)
    mockGet(path).willResolve(pbf)
    const res = await get({ url: { searchParams } })

    const numberProperties = res.body.filter((item) => item.type === 'number')
    expect(numberProperties.length).toEqual(3)

    const numberProperty = numberProperties[0]
    const propertyKeys = ['attribute', 'type', 'count', 'min', 'max', 'histogram'].sort()
    expect(Object.keys(numberProperty).sort()).toEqual(propertyKeys)

    const histogramKeys = ['count', 'bins'].sort()
    expect(Object.keys(numberProperty.histogram).sort()).toEqual(histogramKeys)

    expect(numberProperty.attribute).toBeTypeOf('string')
    expect(numberProperty.type).toBeTypeOf('string')
    expect(numberProperty.type).toEqual('number')
    expect(numberProperty.count).toBeTypeOf('number')
    expect(numberProperty.min).toBeTypeOf('number')
    expect(numberProperty.max).toBeTypeOf('number')
    expect(numberProperty.histogram).toBeTypeOf('object')
    expect(numberProperty.histogram.count).toBeTypeOf('object')
    expect(numberProperty.histogram.count.length).toBeGreaterThan(0)
    expect(numberProperty.histogram.bins.length).toBeGreaterThan(0)
  })
})
