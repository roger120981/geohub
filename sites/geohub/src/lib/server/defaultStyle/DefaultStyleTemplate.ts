import type { UserConfig } from '$lib/config/DefaultUserConfig';
import type { DatasetDefaultLayerStyle, DatasetFeature, RasterTileMetadata } from '$lib/types';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';

export interface DefaultStyleTemplate {
	dataset: DatasetFeature;
	metadata: RasterTileMetadata | VectorTileMetadata;
	config: UserConfig;

	create: (colormap_name?: string) => Promise<DatasetDefaultLayerStyle>;

	getMetadata: () => Promise<RasterTileMetadata | VectorTileMetadata>;
}
