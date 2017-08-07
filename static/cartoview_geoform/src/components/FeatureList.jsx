import FeatureListMap from "./FeatureListMap"
import MapConfigService from '@boundlessgeo/sdk/services/MapConfigService'
import MapConfigTransformService from '@boundlessgeo/sdk/services/MapConfigTransformService'
import PropTypes from 'prop-types';
import React from 'react'
import Spinner from "react-spinkit"
import UltimatePaginationBootstrap3 from './BootstrapPaginate'
import WMSService from '@boundlessgeo/sdk/services/WMSService'
import ol from 'openlayers'
import { wfsQueryBuilder } from "../helpers/helpers.jsx"

const image = new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({ color: 'black', width: 2 })
})
const styles = {
    'Point': new ol.style.Style({ image: image }),
    'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'green', width: 1 })
    }),
    'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'green', width: 1 })
    }),
    'MultiPoint': new ol.style.Style({ image: image }),
    'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'yellow', width: 1 }),
        fill: new ol.style.Fill({ color: 'rgba(255, 255, 0, 0.1)' })
    }),
    'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            lineDash: [
                4],
            width: 3
        }),
        fill: new ol.style.Fill({ color: 'rgba(0, 0, 255, 0.1)' })
    }),
    'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'magenta', width: 2 }),
        fill: new ol.style.Fill({ color: 'magenta' }),
        image: new ol.style.Circle({
            radius: 10,
            fill: null,
            stroke: new ol.style.Stroke({ color: 'magenta' })
        })
    }),
    'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
        fill: new ol.style.Fill({ color: 'rgba(255,0,0,0.2)' })
    })
}
const styleFunction = (feature) => {
    return styles[feature.getGeometry().getType()]
}
const isWMSLayer = (layer) => {
    return layer.getSource() instanceof ol.source.TileWMS || layer.getSource() instanceof ol
        .source.ImageWMS
}
const getWMSLayer = (name, layers) => {
    var wmsLayer = null
    layers.forEach((layer) => {
        if (layer instanceof ol.layer.Group) {
            wmsLayer = getWMSLayer(name, layer.getLayers())
        } else if (isWMSLayer(layer) && layer.getSource().getParams()
            .LAYERS == name) {
            wmsLayer = layer
        }
        if (wmsLayer) {
            return false
        }
    })
    return wmsLayer
}
export default class FeatureList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            features: [],
            loading: true,
            totalFeatures: 0,
            selectMode: false,
            selectedFeatures: [],
            perPage: 50,
            currentPage: 1,
            selectionLayerAdded: false,
            drawerOpen: true,
            config: { mapId: this.props.mapId }
        }
        this.map = new ol.Map({
            layers: [new ol.layer.Tile({ title: 'OpenStreetMap', source: new ol.source.OSM() })],
            view: new ol.View({
                center: [
                    0, 0
                ],
                zoom: 3,
                minZoom: 3,
                maxZoom: 19
            })
        })
        this.featureCollection = new ol.Collection()
        this.selectLayer = new ol.layer.Vector({
            source: new ol.source.Vector({ features: this.featureCollection }),
            style: styleFunction,
            title: "Selected Features",
            zIndex: 10000,
            format: new ol.format.GeoJSON({
                defaultDataProjection: this.map.getView()
                    .getProjection(),
                featureProjection: this.map.getView()
                    .getProjection()
            })
        })
    }
    init(map) {
        map.on('singleclick', (e) => {
            document.body.style.cursor = "progress"
            WMSService.getFeatureInfo(getWMSLayer(this.props
                .layer, map.getLayers().getArray()),
                e.coordinate, map, 'application/json', (
                    result) => {
                    if (result.features.length == 1) {
                        result.features[0].getGeometry()
                            .transform('EPSG:4326', this.map.getView().getProjection()
                            )
                        this.zoomToFeature(result.features[
                            0])
                        this.setState({
                            selectedFeatures: result
                                .features,
                            selectMode: true
                        })
                    } else if (result.features.length > 1) {
                        let transformedFeatures = []
                        result.features.forEach((feature) => {
                            feature.getGeometry()
                                .transform(
                                'EPSG:4326',
                                this.map
                                    .getView().getProjection()
                                )
                            transformedFeatures.push(
                                feature)
                        })
                        this.setState({
                            selectedFeatures: transformedFeatures,
                            selectMode: true
                        })
                    }
                    document.body.style.cursor = "default"
                })
        })
    }
    updateMap(config) {
        if (config && config.mapId) {
            var url = getMapConfigUrl(this.props.mapId);
            fetch(url, {
                method: "GET",
                credentials: 'include'
            }).then((response) => {
                if (response.status == 200) {
                    return response.json();
                }
            }).then((config) => {
                if (config) {
                    MapConfigService.load(MapConfigTransformService.transform(config), this.map)

                }
            })
        }
    }
    componentWillMount() {
        this.updateMap(this.state.config)
    }
    getLayers(layers) {
        var children = []
        layers.forEach((layer) => {
            if (layer instanceof ol.layer.Group) {
                children = children.concat(this.getLayers(
                    layer.getLayers()))
            } else if (layer.getVisible() && isWMSLayer(
                layer)) {
                children.push(layer)
            }
        })
        return children
    }
    loadfeatures() {
        let { loading } = this.state
        if (!loading) {
            this.setState({ loading: true })
        }
        const url = wfsQueryBuilder(this.props.geoserverUrl, {
            service: 'wfs',
            version: '2.0.0',
            request: 'GetFeature',
            typeNames: this.props.layer,
            outputFormat: 'json',
            count: this.state.perPage,
            startIndex: this.state.perPage * (this.state.currentPage -
                1)
        })
        fetch(url).then((response) => response.json()).then((
            data) => {
            let features = new ol.format.GeoJSON().readFeatures(
                data, {
                    featureProjection: this.map.getView()
                        .getProjection()
                })
            if (this.state.totalFeatures == 0) {
                this.setState({
                    features: features,
                    loading: false,
                    totalFeatures: data.totalFeatures
                })
            } else {
                this.setState({ features: features, loading: false })
            }
        })
    }
    backToList() {
        this.featureCollection.clear()
        this.setState({ selectMode: false })
    }
    zoomToFeature(feature) {
        if (!this.state.selectionLayerAdded) {
            this.map.addLayer(this.selectLayer)
            this.setState({ selectionLayerAdded: true })
        }
        this.setState({ selectMode: true })
        this.setState({ selectedFeatures: [feature] })
        this.featureCollection.clear()
        this.featureCollection.push(feature)
        this.map.getView().fit(feature.getGeometry().getExtent(),
            this.map.getSize(), { duration: 10000 })
    }
    componentDidMount() {
        this.loadfeatures()
        this.init(this.map)
    }
    render() {
        let { loading } = this.state
        return (
            <div>
                {loading && <div style={{ textAlign: "center" }} className="col-xs-12 col-sm-12 col-md-12"><Spinner className="loading-center" name="line-scale-party" color="steelblue" /></div>}
                {!loading && !this.state.selectMode && <ul className="list-group">
                    {this.state.features.map((feature, i) => {
                        return <li key={i} onClick={this.zoomToFeature.bind(this, feature)} className="list-group-item">{feature.getProperties()[this.props.attribute]}</li>
                    })}
                </ul>}
                {!loading && !this.state.selectMode && <div style={{ textAlign: "center" }} className="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-md-offset-3"><UltimatePaginationBootstrap3
                    totalPages={Math.ceil(this.state.totalFeatures / this.state.perPage)}
                    currentPage={this.state.currentPage}
                    onChange={number => this.setState({
                        currentPage: number
                    }, this.loadfeatures.bind(this))} /></div>}
                {!loading && this.state.selectMode && this.state.selectedFeatures.length == 1 && <div className="col-xs-12 col-sm-12 col-md-12">

                    <button type="button" onClick={
                        this.backToList.bind(this)
                    } className="btn btn-primary pull-right"><i className="fa fa-arrow-left" aria-hidden="true"></i>  Back</button>

                </div>}
                {!loading && this.state.selectMode && this.state.selectedFeatures.length == 1 &&
                    <div>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(this.state.selectedFeatures[0].getProperties()).map((key, i) => {
                                    if (key != "geometry") {
                                        return <tr key={i}>
                                            <td>{key}</td>
                                            <td style={{ whiteSpace: 'pre-line' }}>{this.state.selectedFeatures[0].getProperties()[key]}</td>
                                        </tr>
                                    }
                                })}
                            </tbody>
                        </table>
                    </div>
                }
                <div style={{ height: 400, display: this.state.selectMode ? "block" : "none" }}>
                    <FeatureListMap map={this.map} display={this.state.selectMode ? true : false} mapRef="fmap" {...this.props}></FeatureListMap>
                </div>
            </div>
        )
    }
}
FeatureList.propTypes = {
    // map: PropTypes.object.isRequired,
    layer: PropTypes.string.isRequired,
    geoserverUrl: PropTypes.string.isRequired,
    attribute: PropTypes.string.isRequired
};
