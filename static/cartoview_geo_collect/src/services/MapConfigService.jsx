import Attribution from 'ol/attribution'
import Base from 'ol/layer/base';
import BingMaps from 'ol/source/bingmaps'
import Cluster from 'ol/source/cluster'
import GeoJSON from 'ol/format/geojson'
import Group from 'ol/layer/group'
import Heatmap from 'ol/layer/heatmap'
/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */
import Image from 'ol/layer/image'
import ImageWMS from 'ol/source/imagewms'
import Layer from 'ol/layer/layer'
import LayerIdService from 'Source/services/LayerIdService'
import OSM from 'ol/source/osm'
import { default as SourceImage } from 'ol/source/image'
import { default as SourceVector } from 'ol/source/vector'
import Tile from 'ol/layer/tile'
import TileArcGISRest from 'ol/source/tilearcgisrest'
import TileWMS from 'ol/source/tilewms'
import Vector from 'ol/layer/vector'
import VectorTile from 'ol/layer/vectortile'
import View from 'ol/view'
import WMTS from 'ol/source/wmts'
import XYZ from 'ol/source/xyz'
import {default as olProj} from 'ol/proj'
import util from 'Source/services/sdkUtils'

let sources = {
    'OSM': OSM,
    'TileArcGISRest': TileArcGISRest,
    'TileWMS': TileWMS,
    'XYZ': XYZ,
    'ImageWMS': ImageWMS,
    'Cluster': Cluster,
    'BingMaps': BingMaps,
    'Vector': SourceVector,
    'Image': SourceImage,
    'WMTS': WMTS
}
let layersMaping={
    'Tile':Tile,
    'Group':Group,
    'Base':Base,
    'Heatmap':Heatmap,
    'Image':Image,
    'Layer':Layer,
    'Vector':Vector,
    'VectorTile':VectorTile
    
}
class MapConfigService {
    generateSourceFromConfig(map, config, opt_proxy, opt_wfsUrl,
        opt_wfsTypeName) {
        var props = config.properties || {};
        if (props.attributions) {
            var attributions = [];
            for (var i = 0, ii = props.attributions.length; i < ii; ++i) {
                attributions.push(new Attribution({
                    html: props.attributions[i]
                }));
            }
            props.attributions = attributions;
        }
        props.wrapX = false;
        if (config.type === 'Cluster') {
            props.source = this.generateSourceFromConfig(map, config.source,
                opt_proxy, opt_wfsUrl, opt_wfsTypeName);
        }
        if (config.type === 'TMS') {
            config.type = 'XYZ';
            var urls = props.urls || [props.url];
            props.tileUrlFunction = function (tileCoord, pixelRatio,
                projection) {
                var min = 0;
                var max = urls.length - 1;
                var idx = Math.floor(Math.random() * (max - min + 1)) +
                    min;
                var x, y, z;
                z = tileCoord[0];
                x = tileCoord[1];
                y = tileCoord[2] + (1 << z);
                return urls[idx] + z + '/' + x + '/' + y + '.' +
                    props.format;
            };
            delete props.urls;
            delete props.url;
            var source = new sources[config.type](props);
            source.set('originalType', 'TMS');
            source.set('originalProperties', Object.assign({}, props, {
                urls: urls
            }));
            return source;
        }
        var sourceObj = new sources[config.type](props);
        if (opt_proxy && config.type === 'TileWMS') {
            sourceObj.once('tileloaderror', function () {
                sourceObj.setTileLoadFunction((function () {
                    var tileLoadFn = sourceObj.getTileLoadFunction();
                    return function (tile, src) {
                        tileLoadFn(tile, util.getProxiedUrl(
                            src, opt_proxy
                        ));
                    };
                })());
            });
        }
        return sourceObj;
    }
    generateLayerFromConfig(config, map, opt_proxy) {
        var type = config.type;
        var layerConfig = config.properties || {};
        layerConfig.id = LayerIdService.generateId();
        if (type === 'Group') {
            layerConfig.layers = [];
            for (var i = 0, ii = config.children.length; i < ii; ++i) {
                layerConfig.layers.push(this.generateLayerFromConfig(
                    config.children[i], map, opt_proxy));
            }
        }
        var layer = new layersMaping[type](layerConfig);
        var sourceConfig = config.source;
        if (sourceConfig) {
            var source = this.generateSourceFromConfig(map, sourceConfig,
                opt_proxy, layerConfig.url, layerConfig.name);
            layer.setSource(source);
        }
        return layer;
    }
    getLayerType(layer) {
        if (layer instanceof Group) {
            return 'Group';
        } else if (layer instanceof Vector) {
            return 'Vector';
        } else if (layer instanceof Tile) {
            return 'Tile';
        } else if (layer instanceof Image) {
            return 'Image';
        }
    }
    getFormatType(format) {
        if (format instanceof GeoJSON) {
            return 'GeoJSON';
        }
    }
    getSourceConfig(source) {
        var config = {};
        var attributions;
        var attr = source.getAttributions();
        if (attr !== null) {
            attributions = [];
            for (var i = 0, ii = attr.length; i < ii; ++i) {
                attributions.push(attr[i].getHTML());
            }
        }
        if (source instanceof TileWMS) {
            config.type = 'TileWMS';
            config.properties = {
                params: source.getParams(),
                urls: source.getUrls()
            };
        } else if (source instanceof Cluster) {
            config.type = 'Cluster';
            config.source = this.getSourceConfig(source.getSource());
        } else if (source instanceof SourceVector) {
            config.type = 'Vector';
            config.properties = {
                attributions: attributions,
                format: {
                    type: this.getFormatType(source.getFormat())
                },
                url: source.getUrl()
            };
        } else if (source instanceof ImageWMS) {
            config.type = 'ImageWMS';
            config.properties = {
                url: source.getUrl(),
                params: source.getParams(),
                attributions: attributions
            };
        } else if (source instanceof OSM) {
            config.type = 'OSM';
            config.properties = {
                attributions: attributions
            };
        } else if (source instanceof BingMaps) {
            config.type = 'BingMaps';
            config.properties = {
                key: source.getApiKey(),
                imagerySet: source.getImagerySet()
            };
        } else if (source instanceof XYZ) {
            if (source.get('originalType') === 'TMS') {
                config.type = 'TMS';
                config.properties = source.get('originalProperties');
            } else {
                config.type = 'XYZ';
                config.properties = {
                    attributions: attributions,
                    urls: source.getUrls()
                };
            }
        } else if (source instanceof TileArcGISRest) {
            config.type = 'TileArcGISRest';
            config.properties = {
                urls: source.getUrls(),
                params: source.getParams()
            };
        }
        return config;
    }
    getLayerConfig(config, layer) {
        config.type = this.getLayerType(layer);
        config.properties = layer.getProperties();
        delete config.properties.maxResolution;
        delete config.properties.minResolution;
        var source = (config.type !== 'Group') ? layer.getSource() :
            null;
        if (source) {
            delete config.properties.source;
            config.source = this.getSourceConfig(source);
        }
        if (layer instanceof Group) {
            delete config.properties.layers;
            config.children = [];
            layer.getLayers().forEach(function (child) {
                if (child.get('title') !== null) {
                    var childConfig = {};
                    config.children.push(childConfig);
                    this.getLayerConfig(childConfig, child);
                }
            }, this);
        }
        return config;
    }
    load(mapConfig, map, opt_proxy) {
        var viewConfig = mapConfig.view;
        var layerConfig = mapConfig.layers;
        var remove = [];
        map.getLayers().forEach(function (lyr) {
            if (lyr.get('title') !== null) {
                remove.push(lyr);
            }
        });
        var i, ii;
        for (i = 0, ii = remove.length; i < ii; ++i) {
            map.removeLayer(remove[i]);
        }
        for (i = 0, ii = layerConfig.length; i < ii; ++i) {
            var layer = this.generateLayerFromConfig(layerConfig[i],
                map, opt_proxy);
            map.addLayer(layer);
        }
        var view = map.getView(),
            proj = olProj.get(viewConfig.projection);
        if (proj && !olProj.equivalent(view.getProjection(), proj)) {
            map.setView(new View({
                center: viewConfig.center,
                resolution: viewConfig.resolution,
                zoom: viewConfig.zoom,
                rotation: viewConfig.rotation,
                projection: viewConfig.projection
            }));
        } else {
            view.setCenter(viewConfig.center);
            if (viewConfig.resolution !== undefined) {
                view.setResolution(viewConfig.resolution);
            } else if (viewConfig.zoom !== undefined) {
                view.setZoom(viewConfig.zoom);
            }
            if (viewConfig.rotation !== undefined) {
                view.setRotation(viewConfig.rotation);
            }
        }
    }
    save(map) {
        var layers = [];
        map.getLayers().forEach(function (layer) {
            if (layer.get('title') !== null) {
                var config = {};
                layers.push(config);
                this.getLayerConfig(config, layer);
            }
        }, this);
        var config = {};
        config.layers = layers;
        var view = map.getView();
        config.view = {
            projection: view.getProjection().getCode(),
            center: view.getCenter(),
            resolution: view.getResolution(),
            zoom: view.getZoom(),
            rotation: view.getRotation()
        };
        return config;
    }
}
export default new MapConfigService();
