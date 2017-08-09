import './css/geoform.css'

import React, { Component } from 'react'

import MapViewer from './components/MapViewer.jsx'
import ReactDOM from 'react-dom'
import WFSClient from './utils/WFSClient.jsx'
import ol from 'openlayers'
import t from 'tcomb-form'

// check if number is int
const Int = t.refinement(t.Number, (n) => n % 1 == 0)
const getSRSName = (geojson) => {
    //"EPSG:900913"
    const srs = geojson.crs.properties.name.split(":").pop()
    return "EPSG:" + srs;
}
class AttrsForm extends Component {
    getValue() {
        return this.form.getValue();
    }
    render() {
        const { attributes } = this.props;
        const schema = {},
            fields = {},
            value = {};
        attributes.forEach(a => {
            if (a.included) {
                fields[a.name] = {
                    label: a.label,
                    help: a.helpText,
                    type: a.fieldType,
                    attrs: {
                        placeholder: a.placeholder
                    }
                }
                value[a.name] = a.defaultValue
                if (a.fieldType == "select") {
                    const options = {}
                    a.options.forEach(o => options[o.value] = o
                        .label);
                    schema[a.name] = t.enums(options);
                } else if (a.fieldType == "number") {
                    fields[a.name].type = 'number'
                    schema[a.name] = a.dataType == "int" ? Int :
                        t.Number
                } else if (a.fieldType == "checkbox") {
                    schema[a.name] = t.Bool
                }
                //default case if data type is string
                // here field type may be text or textarea
                else if (a.dataType == "string") {
                    schema[a.name] = t.String
                }
                if (schema[a.name]) {
                    if (a.required) {
                        fields[a.name].help += " (Required)"
                    } else {
                        schema[a.name] = t.maybe(schema[a.name])
                    }
                }
            }
        });
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">Enter Information</div>
                <div className="panel-body">
                    <t.form.Form ref={f => this.form = f} type={t.struct(schema)} options={{ fields }} value={value} />
                </div>
            </div>
        )
    }
}
class FileForm extends Component {
    getValue() {
        return { file: this.input.files[0] };
    }
    render() {
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">Images</div>
                <div className="panel-body">
                    <div className="form-group">
                        <label>Image</label>
                        <input type="file" ref={i => this.input = i} />
                    </div>
                </div>
            </div>
        )
    }
}
class GeoCollect extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentComponent: "form"
        }
        this.map = new ol.Map({
            // controls: [new ol.control.Attribution({collapsible: false}), new
            // ol.control.ScaleLine()],
            layers: [new ol.layer.Tile({
                title: 'OpenStreetMap',
                source: new ol.source.OSM()
            })],
            view: new ol.View({
                center: [
                    0, 0
                ],
                zoom: 3
            })
        });
    }
    WFS = new WFSClient(this.props.geoserverUrl)
    onSubmit = (e) => {
        e.preventDefault()
        const { layer, geometryName, uploadUrl } = this.props;
        const properties = Object.assign({}, this.form.getValue());
        console.log(properties);
        const geometry = Object.assign({
            name: geometryName,
            srsName: "EPSG:4326"
        }, this.xyForm.getValue());
        this.setState({
            saving: true
        })
        console.log(geometry)
        this.WFS.insertFeature(layer, properties, geometry).then(res =>
            res.text()).then((xml) => {
                console.log(xml);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xml, "text/xml");
                const featureElements = xmlDoc.getElementsByTagNameNS(
                    'http://www.opengis.net/ogc', 'FeatureId');
                if (featureElements.length > 0) {
                    const fid = featureElements[0].getAttribute(
                        "fid").split(".").pop();
                    const fileFormValue = this.fileForm.getValue();
                    console.log(fileFormValue);
                    const fd = new FormData();
                    fd.append('file', fileFormValue.file,
                        fileFormValue.file.name);
                    fd.append('layer', layer.split(":").pop());
                    fd.append('fid', fid);
                    fetch(uploadUrl, {
                        method: 'POST',
                        credentials: 'include',
                        body: fd
                    }).then(res => res.json()).then(res => {
                        this.setState({
                            saving: false
                        })
                    });
                }
                //ogc:FeatureId
            })
    }
    layerName() {
        return this.props.layer.split(":").pop()
    }
    getXYForm() {
        const { xyValue } = this.state;
        const xyFormSchema = t.struct({
            x: t.Number,
            y: t.Number
        });
        const options = {
            fields: {
                x: {
                    label: "Longitude (X)",
                    type: "number"
                },
                y: {
                    label: "Latitude (Y)",
                    type: "number"
                }
            }
        }
        return <t.form.Form ref={f => this.xyForm = f} type={xyFormSchema}
            options={options}
            value={xyValue}
            onChange={(xyValue) => this.setState({ xyValue })} />
    }
    onFeatureMove = (coords) => {
        const center = ol.proj.transform(coords, 'EPSG:900913',
            'EPSG:4326')
        this.setState({
            xyValue: {
                x: center[0],
                y: center[1]
            }
        })
    }
    onMapReady = (map) => {
        this.onFeatureMove(map.getView().getCenter());
    }
    toggleComponent = (component) => {
        let { currentComponent } = this.state
        if (currentComponent != component) {
            this.setState({ currentComponent: component })
        }
    }
    changeXY=(xy)=>{
        this.setState({xyValue:xy})
    }
    render() {
        const { formTitle, mapId, attributes } = this.props
        const { xyValue, saving, currentComponent } = this.state;
        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <div>
                    <div className="row collector-title">
                        <div style={{ textAlign: '-webkit-center' }} className="col-xs-4 col-sm-2 col-md-2 vcenter">
                            <img style={{ height: 60 }} className="img-responsive img-rounded" src={this.props.logo.base64} />

                        </div>
                        <div className="col-xs-8 col-sm-9 col-md-9 vcenter">
                            <span className="h3"><b>{formTitle || 'Add'}</b></span>
                        </div>
                    </div>
                    <AttrsForm key="attrsForm" attributes={attributes} ref={f => this.form = f} />
                    <FileForm ref={f => this.fileForm = f} key="fileform" />
                    <div className="panel panel-primary">
                        <div className="panel-heading">Select Location</div>
                        <div className="panel-body">
                            {this.getXYForm()}
                        </div>
                    </div>
                    <div>
                        <MapViewer changeXY={this.changeXY} map={this.map} mapId={mapId} xy={xyValue} onMapReady={this.onMapReady} onFeatureMove={this.onFeatureMove} EnableGeolocation={this.props.EnableGeolocation} />
                    </div>
                    <hr />
                    <div className="form-group" style={{ marginTop: "2%" }}>
                        <button onClick={this.onSubmit} className="btn btn-primary" disabled={saving}>
                            {saving && <div className="loading"></div>}
                            Submit
                                </button>
                    </div>
                </div>
            </div>
        )
    }
}
global.GeoCollect = {
    show: (el, props) => {
        var geoCollect = React.createElement(GeoCollect, props);
        ReactDOM.render(geoCollect, document.getElementById(el));
    }
};
export default GeoCollect
