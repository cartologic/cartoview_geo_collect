import MapConfigService from '@boundlessgeo/sdk/services/MapConfigService';
import MapConfigTransformService from '@boundlessgeo/sdk/services/MapConfigTransformService';
import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
class MapViewer extends React.Component {
    constructor(props) {
        super(props);
        this.loaded = false;
        this.feature = new ol.Feature({
            geometry: new ol.geom.Point([0, 0]),
            geometryName: 'the_geom'
        });
        const featureStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [
                    0.5, 31
                ],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                color: "#00B7F1",
                src: URLS.static +
                'cartoview_geoform/marker.png'
            }),
            text: new ol.style.Text({
                text: '+',
                fill: new ol.style.Fill({ color: '#fff' }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                }),
                textAlign: 'center',
                offsetY: -20,
                font: '18px serif'
            })
        });
        this.vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [this.feature]
            }),
            style: featureStyle
        });
        this.modifyInteraction = new ol.interaction.Modify({
            features: new ol.Collection([this.feature]),
            pixelTolerance: 32
        });
        this.modifyInteraction.on('modifyend', this.onFeatureMove)
        this.map = this.props.map
    }
    onFeatureMove = (event) => {
        this.props.onFeatureMove(this.feature.getGeometry().getCoordinates());
    }
    update(mapId) {
        if (mapId) {
            var url = getMapConfigUrl(mapId);
            fetch(url, {
                method: "GET",
                credentials: 'include'
            }).then((response) => {
                if (response.status == 200) {
                    return response.json();
                }
            }).then((config) => {
                if (config) {
                    MapConfigService.load(
                        MapConfigTransformService.transform(
                            config), this.map);
                    this.feature.setGeometry(new ol.geom.Point(
                        this.map.getView().getCenter()
                    ));
                    this.map.addLayer(this.vectorLayer);
                    this.map.addInteraction(this.modifyInteraction);
                    this.modifyInteraction.setActive(true);
                    if (typeof this.props.onMapReady ==
                        'function') this.props.onMapReady(
                            this.map);
                }
            });
        }
    }
    componentDidMount() {
        this.map.setTarget(ReactDOM.findDOMNode(this.refs.map));
        this.update(this.props.mapId);
        this.map.updateSize();
    }
    render() {
        var {
            className = '',
            xy
        } = this.props;
        if (xy) {
            console.log(xy);
            const coords = ol.proj.transform([
                parseFloat(xy.x),
                parseFloat(xy.y)
            ], 'EPSG:4326', 'EPSG:900913');
            this.map.getView().setCenter(coords);
            this.feature.setGeometry(new ol.geom.Point(coords))
        }
        return (
            <div ref="map" style={{ border: "2px solid lightgray", borderRadius: "8px" }} className={className + ' map-ct'}>
                {this.props.children}
            </div>
        );
    }
}
export default MapViewer
