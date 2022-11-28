import { v4 as uuidv4 } from 'uuid'
import { COLOR_CLASS_COUNT_MAXIMUM, ErrorMessages, STAC_MINIMUM_ZOOM } from './constants'
import { getBase64EncodedUrl, getRandomColormap } from './helper'
import type { RasterTileMetadata, StacItemFeature } from './types'
import { PUBLIC_TITILER_ENDPOINT } from './variables/public'
import type { Map, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl'

export class MosaicJsonData {
  private feature: StacItemFeature
  private map: Map
  private url: string
  private assetName: string

  constructor(map: Map, feature: StacItemFeature, assetUrl: string, assetName: string) {
    this.map = map
    this.feature = feature
    this.url = assetUrl
    this.assetName = assetName
  }

  private getMetadata = async (tilejson: { bounds: any; tiles: string[] }, isUniqueValue: boolean) => {
    const tileUrl = new URL(tilejson.tiles[0])
    const mosaicUrl = tileUrl.searchParams.get('url')
    const mosaicAssetUrl = `${PUBLIC_TITILER_ENDPOINT.replace('cog', 'mosaicjson')}/${tilejson.bounds.join(
      ',',
    )}/assets?url=${encodeURIComponent(mosaicUrl)}`
    let res = await fetch(mosaicAssetUrl)
    if (!res.ok) throw new Error(res.statusText)
    const assets: string[] = await res.json()
    if (assets && assets.length > 0) {
      const assetUrl = assets[0].replace('/vsicurl/', '')
      const data: RasterTileMetadata = await this.getRasterMetadata(getBase64EncodedUrl(assetUrl))
      if (!(data.band_metadata.length > 1)) {
        const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${encodeURIComponent(assetUrl)}${
          isUniqueValue ? '&categorical=true' : ''
        }`
        res = await fetch(statsURL)
        if (!res.ok) throw new Error(res.statusText)
        const layerStats = await res.json()
        data.stats = layerStats
        data.active_band_no = Object.keys(layerStats)[0]
      }
      data.isMosaicJson = true
      return data
    } else {
      const data: RasterTileMetadata = {
        bounds: tilejson.bounds,
      }
      data.isMosaicJson = true
      return data
    }
  }

  private getRasterMetadata = async (url: string) => {
    let res = await fetch(`${PUBLIC_TITILER_ENDPOINT}/info?url=${url}`)
    if (!res.ok) throw new Error(res.statusText)
    const data: RasterTileMetadata = await res.json()

    if (
      data &&
      data.band_metadata &&
      data.band_metadata.length > 0 &&
      //TODO needs fix: Ioan band
      Object.keys(data.band_metadata[0][1]).length === 0
    ) {
      res = await fetch(`${PUBLIC_TITILER_ENDPOINT}/statistics?url=${url}`)
      if (!res.ok) throw new Error(res.statusText)
      const statistics = await res.json()
      if (statistics) {
        for (let i = 0; i < data.band_metadata.length; i++) {
          const bandValue = data.band_metadata[i][0]
          const bandDetails = statistics[bandValue]
          if (bandDetails) {
            data.band_metadata[i][1] = {
              STATISTICS_MAXIMUM: `${bandDetails.max}`,
              STATISTICS_MEAN: `${bandDetails.mean}`,
              STATISTICS_MINIMUM: `${bandDetails.min}`,
              STATISTICS_STDDEV: `${bandDetails.std}`,
              STATISTICS_VALID_PERCENT: `${bandDetails.valid_percent}`,
            }
          }
        }
      }
    }
    return data
  }

  public add = async (defaultColormap?: string) => {
    const zoom = this.map.getZoom()
    if (zoom < STAC_MINIMUM_ZOOM) {
      throw new Error(ErrorMessages.TOO_SMALL_ZOOM_LEVEL)
    }

    const bounds = this.map.getBounds()
    const bbox = [
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat,
      bounds.getNorthEast().lng,
      bounds.getNorthEast().lat,
    ]

    let res = await fetch(
      `stac/mosaicjson?url=${encodeURIComponent(this.url)}&bbox=${JSON.stringify(bbox)}&asset=${this.assetName}`,
    )
    if (!res.ok) throw new Error(res.statusText)
    const mosaicjson = await res.json()
    const numberOfClasses = mosaicjson.classmap ? Object.keys(mosaicjson.classmap).length : 0
    const isUniqueValueLayer = numberOfClasses > 0 && numberOfClasses <= COLOR_CLASS_COUNT_MAXIMUM ? true : false
    res = await fetch(mosaicjson.tilejson)
    if (!res.ok) throw new Error(res.statusText)
    const tilejson = await res.json()
    const rasterInfo = await this.getMetadata(tilejson, isUniqueValueLayer)
    const bandMetaStats = rasterInfo.band_metadata[0][1]
    const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM']
    const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM']

    bandMetaStats.STATISTICS_UNIQUE_VALUES = mosaicjson.classmap

    let colormap = defaultColormap ?? getRandomColormap()
    if (rasterInfo.band_metadata.length > 1) {
      colormap = ''
    }
    tilejson.tiles = tilejson.tiles.map((tile) => {
      tile = tile.replace('http://', 'https://')
      if (rasterInfo.band_metadata.length > 1) {
        return tile
      } else {
        const _url = new URL(tile)
        _url.searchParams.delete('colormap_name')
        _url.searchParams.delete('rescale')
        _url.searchParams.set('colormap_name', colormap)
        _url.searchParams.set('rescale', [layerBandMetadataMin, layerBandMetadataMax].join(','))
        return decodeURI(_url.toString())
      }
    })

    const maxzoom = Number(tilejson.maxzoom && tilejson.maxzoom <= 24 ? tilejson.maxzoom : 24)

    const source: RasterSourceSpecification = {
      type: 'raster',
      // convert http to https because titiler's /mosaicjson/tilejson.json does not return https protocol currently
      tiles: tilejson.tiles,
      minzoom: 0,
      maxzoom: maxzoom ?? 22,
      bounds: tilejson.bounds,
      attribution:
        'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
              Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
    }
    if (source.maxzoom > 24) {
      source.maxzoom = 24
    }
    const sourceId = this.feature.properties.id
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, source)
    }

    const layerId = uuidv4()
    const layer: RasterLayerSpecification = {
      id: layerId,
      type: 'raster',
      source: sourceId,
      minzoom: source.minzoom,
      layout: {
        visibility: 'visible',
      },
    }

    let firstSymbolId = undefined
    for (const layer of this.map.getStyle().layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id
        break
      }
    }
    this.map.addLayer(layer, firstSymbolId)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.map.fitBounds(rasterInfo.bounds)

    return {
      layer,
      source,
      sourceId,
      metadata: rasterInfo,
    }
  }
}
