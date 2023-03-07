import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as helper from '../helper'
import { ClassificationMethodTypes } from '../config/AppConfig'

describe('downloadFile', () => {
  let linkElement: HTMLAnchorElement
  const link = {
    ...linkElement,
    click: vi.fn(),
    remove: vi.fn(),
    download: '',
    href: '',
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    linkElement = document.createElement('a') as HTMLAnchorElement
  })

  it('should create an HTML element to download a file when content is available ', () => {
    vi.spyOn(document, 'createElement').mockReturnValue(link)
    helper.downloadFile('test-file.txt', 'test content here')

    expect(link.download).toEqual('test-file.txt')
    expect(link.href).toEqual('data:text/plain;charset=utf-8,test%20content%20here')
    expect(link.click).toHaveBeenCalledTimes(1)
    expect(link.remove).toHaveBeenCalledTimes(1)
  })

  it('should create an HTML element to download a file when no content is available ', () => {
    vi.spyOn(document, 'createElement').mockReturnValue(link)
    helper.downloadFile('test-file.txt')

    expect(link.download).toEqual('test-file.txt')
    expect(link.href).toEqual('test-file.txt')
    expect(link.click).toHaveBeenCalledTimes(1)
    expect(link.remove).toHaveBeenCalledTimes(1)
  })
})

describe('clean', () => {
  it('should remove underscore characters', () => {
    const value = helper.clean('Proportion_of_local_governments_implementing_local_disaster_risk_reduction_strategies')
    expect(value).toEqual('Proportion Of Local Governments Implementing Local Disaster Risk Reduction Strategies')
  })

  it('should remove hyphen characters', () => {
    const value = helper.clean('climate-action-plan')
    expect(value).toEqual('Climate Action Plan')
  })

  it('should remove extension', () => {
    const file = helper.clean('AUTOEXEC.BAT')
    expect(file).toEqual('AUTOEXEC')

    const file1 = helper.clean('wEb.html')
    expect(file1).toEqual('WEb')
  })

  it('should apply start case', () => {
    const file = helper.clean('AUTOEXEC.BAT')
    expect(file).toEqual('AUTOEXEC')

    const file1 = helper.clean('wEb.html')
    expect(file1).toEqual('WEb')
  })

  it('should remove underscores, extension and apply start/title case', () => {
    const value = helper.clean(
      'Biotic_genetic_resources_for_food_and_agriculture_secured_in_conservation_facilities.tif',
    )
    expect(value).toEqual('Biotic Genetic Resources For Food And Agriculture Secured In Conservation Facilities')
  })
})

describe('remapInputValue', () => {
  it('should remap with default scale (0 / 255)', () => {
    const value = helper.remapInputValue(150, 100, 200)
    expect(Math.floor(value)).toEqual(127)
  })

  it('should remap with new scale', () => {
    const value = helper.remapInputValue(15, 5, 200, 50, 1000)
    expect(Math.floor(value)).toEqual(98)
  })
})

describe('getSampleFromInterval', () => {
  it('should have the length of the resulting array be equal to the numberOfItems', () => {
    const samplesList = helper.getSampleFromInterval(0, 1, 1000)
    expect(samplesList.length).toEqual(1000)
  })
})

describe('getSampleFromInterval', () => {
  it('should have the length of the resulting array be equal to the numberOfItems', () => {
    const samplesList = helper.getSampleFromInterval(0, 1, 1000)
    expect(samplesList).toHaveLength(1000)
  })
})

describe('getIntervalList', () => {
  it('should return an interval list : natural breaks', () => {
    const randomSample = helper.getSampleFromInterval(1, 120, 1000)
    const samplesList = helper.getIntervalList(ClassificationMethodTypes.NATURAL_BREAK, 1, 1000, randomSample, 5)
    expect(samplesList).toHaveLength(6)
  })
  it('should return an interval list : equidistant', () => {
    const randomSample = helper.getSampleFromInterval(1, 120, 1000)
    const samplesList = helper.getIntervalList(ClassificationMethodTypes.EQUIDISTANT, 1, 1000, randomSample, 5)
    expect(samplesList).toEqual([1, 200.8, 400.6, 600.4, 800.2, 1000])
  })
  it('should return an interval list : quantile', () => {
    const randomSample = helper.getSampleFromInterval(1, 120, 1000)
    const samplesList = helper.getIntervalList(ClassificationMethodTypes.QUANTILE, 1, 1000, randomSample, 5)
    expect(samplesList).toHaveLength(6)
  })
  it('should return an interval list : logarithmic', () => {
    const randomSample = helper.getSampleFromInterval(1, 120, 1000)
    const samplesList = helper.getIntervalList(ClassificationMethodTypes.LOGARITHMIC, 1, 1000, randomSample, 5)
    expect(samplesList).toEqual([1, 3.98, 15.85, 63.1, 251.19, 1000])
  })
  it('should return an interval list : logarithmic', () => {
    const randomSample = helper.getSampleFromInterval(-23, 120, 1000)
    const samplesList = helper.getIntervalList(ClassificationMethodTypes.LOGARITHMIC, -23, 1000, randomSample, 8)
    expect(samplesList).toEqual([-23, -21.62, -18.34, -10.55, 8, 52.11, 157.02, 406.54, 1000])
  })
  it('should return an interval list : logarithmic', () => {
    const randomSample = helper.getSampleFromInterval(0, 1, 1000)
    const samplesList = helper.getIntervalList(ClassificationMethodTypes.LOGARITHMIC, 0, 1, randomSample, 5)
    expect(samplesList).toEqual([0, 0.15, 0.32, 0.52, 0.74, 1])
  })
})
