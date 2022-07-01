import { fetchUrl } from '$lib/helper'
import type { TreeNode } from '$lib/types'

export async function get({ url }) {
  const startTime = performance.now()

  const containerLabel = url.searchParams.get('label')
  const containerPath = url.searchParams.get('path')
  const isSchema = url.searchParams.get('isschema')

  const indexData = await fetchUrl(`${containerPath}`)
  const children = []
  if (isSchema === 'true') {
    Object.keys(indexData).forEach((id) => {
      const table = indexData[id]
      if (table.schema === containerLabel) {
        const chjld: TreeNode = {
          label: table.table,
          path: table.id,
          url: containerPath.replace('index', table.id),
          children: [],
          isRaster: false,
          isStac: false,
          isMartin: true,
        }
        children.push(chjld)
      }
    })
  } else {
    Object.keys(indexData).forEach((id) => {
      const table = indexData[id]
      let schema: TreeNode = children.find((s) => s.label === table.schema)
      if (!schema) {
        schema = {
          label: table.schema,
          path: containerPath,
          url: null,
          children: [],
          isRaster: false,
          isStac: false,
          isMartin: true,
        }
        children.push(schema)
      }
    })
  }

  const tree: TreeNode = {
    label: containerLabel,
    path: containerPath,
    url: null,
    children: children,
    isRaster: false,
    isStac: false,
    isMartin: true,
  }

  const endTime = performance.now()

  return {
    body: {
      tree,
      responseTime: endTime - startTime,
    },
  }
}
