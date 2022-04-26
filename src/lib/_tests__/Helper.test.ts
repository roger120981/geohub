import { describe, expect, it, vi } from 'vitest'

import { bannerMessages } from '$stores'
import * as helper from '../helper'
import type { BannerMessage } from '$lib/types'

describe('stringifyStyleJSON', () => {
  it('should return a string', () => {
    const json = {
      foo: 'bar',
      test: 'me',
    }

    expect(helper.stringifyStyleJSON(JSON.parse(JSON.stringify(json)))).toEqual(`{
    "foo": "bar",
    "test": "me"
}`)
  })
})

describe('downloadFile', () => {
  it('should create an HTML element to download a file ', () => {
    const linkElement: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement
    const link = {
      ...linkElement,
      click: vi.fn(),
      remove: vi.fn(),
      download: '',
      href: '',
    }

    vi.spyOn(document, 'createElement').mockReturnValue(link)
    helper.downloadFile('test-file.txt', 'test content here')

    expect(link.download).toEqual('test-file.txt')
    expect(link.href).toEqual('data:text/plain;charset=utf-8,test%20content%20here')
    expect(link.click).toHaveBeenCalledTimes(1)
    expect(link.remove).toHaveBeenCalledTimes(1)
  })
})

describe('fetchUrl', () => {
  it('should return a json object upon no timeout ', async () => {
    const { Response, Headers } = await vi.importActual('node-fetch')
    const meta = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      'Breaking-Bad': '<3',
    }

    const headers = new Headers(meta)
    const ResponseInit = {
      status: 200,
      statusText: 'fail',
      headers,
    }

    const response = new Response(JSON.stringify({ data: {} }), ResponseInit)
    const fetchWithNoTimeout = vi.spyOn(helper, 'fetchWithTimeout').mockReturnValue(Promise.resolve(response))
    const json = await helper.fetchUrl('http://www.google.com')
    expect(json).toEqual({ data: {} })
    expect(fetchWithNoTimeout).toHaveBeenCalledTimes(1)
  })

  it('should return no json object and a banner message store should be updated upon timeout', async () => {
    const fetchWithTimeout = vi.spyOn(helper, 'fetchWithTimeout').mockRejectedValue(new Error('TIME_OUT'))
    const json = await helper.fetchUrl('http://www.google.com')
    expect(json).toBeNull()
    expect(fetchWithTimeout).toHaveBeenCalledTimes(1)

    bannerMessages.subscribe((messages) => {
      expect(messages).toHaveLength(1)
      const message: BannerMessage = messages[0]
      expect(message.type).toEqual('danger')
      expect(message.title).toEqual('Whoops! Something went wrong.')
      expect(message.message).toEqual('The request took longer than expected. Please try again later.')
    })
  })

  describe('hash', () => {
    it('should return a value with no seed parameter', () => {
      const value = helper.hash('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
      expect(value).toEqual(2009597772892510)
    })

    it('should return a value with a seed parameter', () => {
      const value = helper.hash(
        'ed in lorem sed turpis luctus hendrerit at eu ipsum. Nulla vestibulum, mi ac dapibus commodo, ipsum lectus mattis ex, eget hendrerit lectus libero a velit.',
        123345,
      )
      expect(value).toEqual(2462451796570643)
    })

    it('should return a different value everytime with date as a seed', () => {
      const value = helper.hash(
        ' Nulla vestibulum, mi ac dapibus commodo, ipsum lectus mattis ex',
        Math.round(new Date().getTime() / 1000),
      )
      expect(value).not.toEqual(7325803889978825)
    })
  })
})
