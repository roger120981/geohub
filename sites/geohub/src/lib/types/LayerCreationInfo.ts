import type {
	RasterLayerSpecification,
	RasterSourceSpecification,
	VectorSourceSpecification
} from 'maplibre-gl';
import type { VectorLayerSpecification } from './VectorLayerSpecification';
import type { RasterTileMetadata } from './RasterTileMetadata';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';
import type { ClassificationMethodTypes } from '$lib/config/AppConfig';
import type { DatasetDefaultLayerStyle } from '.';

export interface LayerCreationInfo {
	layer: RasterLayerSpecification | VectorLayerSpecification;
	source: RasterSourceSpecification | VectorSourceSpecification;
	sourceId: string;
	metadata: RasterTileMetadata | VectorTileMetadata;
	colormap_name: string;
	classification_method: ClassificationMethodTypes;
	classification_method_2: ClassificationMethodTypes;
	defaultStyle: DatasetDefaultLayerStyle;
}
