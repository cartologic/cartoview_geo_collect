import '../css/geoform.css'

import React, { Component } from 'react'

import AlertContainer from 'react-alert'
import AttrsForm from './AttrsForm'
import DetailsPage from './DetailsPage'
import FileForm from './FileForm'
import Img from 'react-image'
import LocationForm from './LocationForm'
import PropTypes from 'prop-types'
import SavingPanel from './SavingPanel'
import WFSClient from '../utils/WFSClient.jsx'
import { getCRSFToken } from '../helpers/helpers.jsx'
import ol from 'openlayers'

// check if number is int
// const getSRSName = ( geojson ) => {
//     //"EPSG:900913"
//     const srs = geojson.crs.properties.name.split( ":" ).pop( )
//     return "EPSG:" + srs
// }
let map_obj = new ol.Map( {
    layers: [ new ol.layer.Tile( {
        title: 'OpenStreetMap',
        source: new ol.source.OSM( )
    } ) ],
    view: new ol.View( {
        center: [
            0, 0
        ],
        zoom: 3
    } )
} )
class GeoCollect extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            currentComponent: "attrsForm",
            showModal: false,
            proceed: false,
            attrsValue: null,
            file: null,
            xyValue: null
        }
        this.map = map_obj
    }
    WFS = new WFSClient( this.props.urls.geoserverUrl )
    onSubmit = ( e ) => {
        // e.preventDefault( )
        if ( this.form.getValue( ) && this.xyForm.getValue( ) && this.fileForm
            .getValue( ) ) {
            this.showModal( )
        }
    }
    saveAll = ( ) => {
        let that = this;
        this.setState( { currentComponent: "savingPanel" } )
        const { config, username, urls } = this.props
        const { attrsValue, file, xyValue } = this.state
        let { geometryName, layer } = config.config
        if ( typeof ( geometryName ) === "undefined" ) {
            geometryName = "the_geom"
        }
        const properties = { ...attrsValue }
        const geometry = {
            name: geometryName,
            srsName: "EPSG:4326",
            ...xyValue
        }
        this.setState( {
            saving: true
        } )
        this.WFS.insertFeature( layer, properties, geometry ).then( res =>
            res.text( ) ).then( ( xml ) => {
            const parser = new DOMParser( )
            const xmlDoc = parser.parseFromString( xml, "text/xml" )
            const featureElements = xmlDoc.getElementsByTagNameNS(
                'http://www.opengis.net/ogc', 'FeatureId' )
            if ( featureElements.length > 0 ) {
                const fid = featureElements[ 0 ].getAttribute(
                    "fid" )
                const data = {
                    file: file.base64,
                    file_name: file.name,
                    username: username,
                    is_image: true,
                    feature_id: fid,
                    tags: [ `geo_collect_${this.layerName( )}` ]
                }
                fetch( urls.attachmentUploadUrl( this.layerName( ) ), {
                        method: 'POST',
                        credentials: "same-origin",
                        headers: new Headers( {
                            "Content-Type": "application/json; charset=UTF-8",
                            "X-CSRFToken": getCRSFToken( )
                        } ),
                        body: JSON.stringify( data )
                    } ).then( ( response ) => response.json( ) )
                    .then( res => {
                        fetch( urls.historyListCreate, {
                            method: 'POST',
                            credentials: "same-origin",
                            headers: new Headers( {
                                "Content-Type": "application/json; charset=UTF-8",
                                "X-CSRFToken": getCRSFToken( )
                            } ),
                            body: JSON.stringify( {
                                layer: this
                                    .props.config
                                    .config.layer,
                                data: properties,
                            } )
                        } ).then( apiRes => {
                            that.setState( { saving: false } )
                            that.msg.show(
                                'Your Data Saved successfully', {
                                    time: 5000,
                                    type: 'success',
                                    icon: <i style={{ color: "#4caf50" }} className="fa fa-check-square-o fa-lg" aria-hidden="true"></i>
                                } )
                        } )
                    } ).catch( ( error ) => {
                        this.msg.show(
                            'Error while saving Data please Contact our Support', {
                                time: 5000,
                                type: 'error',
                                icon: <i style={{ color: "#e2372a" }} className="fa fa-times-circle-o fa-lg" aria-hidden="true"></i>
                            } )
                    } )
            }
            //ogc:FeatureId
        } ).catch( ( error ) => {
            this.msg.show(
                'Error while saving Data please Contact our Support', {
                    time: 5000,
                    type: 'success',
                    icon: <i style={{ color: "#e2372a" }} className="fa fa-times-circle-o fa-lg" aria-hidden="true"></i>
                } )
        } )
    }
    layerName( ) {
        return this.props.config.config.layer.split( ":" ).pop( )
    }
    setAttrsValue = ( attrsValue ) => {
        this.setState( { attrsValue } )
    }
    setFileFormValue = ( file ) => {
        this.setState( {
            file
        } )
    }
    onFeatureMove = ( coords ) => {
        const center = ol.proj.transform( coords, 'EPSG:900913',
            'EPSG:4326' )
        this.setState( {
            xyValue: {
                x: center[ 0 ],
                y: center[ 1 ]
            }
        } )
    }
    showModal = ( ) => {
        this.setState( { showModal: !this.state.showModal } )
    }
    setCurrentComponent = ( currentComponent ) => {
        this.setState( { currentComponent } )
    }
    onMapReady = ( map ) => {
        this.onFeatureMove( map.getView( ).getCenter( ) )
    }
    changeXY = ( xy ) => {
        this.setState( { xyValue: xy } )
    }
    onYes = ( ) => {
        this.saveAll( )
    }
    toggleComponent = ( component ) => {
        this.setState( { currentComponent: component } )
    }
    alertOptions = {
        offset: 14,
        position: 'top right',
        theme: 'light',
        time: 5000,
        transition: 'scale'
    }
    render( ) {
        const { config, urls } = this.props
        const { xyValue, saving, currentComponent, attrsValue, file } =
        this.state
        return (
            <div className="row" style={{ paddingTop: 50, paddingBottom: 50 }}>
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <AlertContainer ref={a => this.msg = a} {...this.alertOptions} />
                    <div>
                        <div className="container">
                        <a href="../"><i className="fa fa-question-circle fa-2x pull-right" aria-hidden="true"></i></a>
                        <a href="/"><i className="fa fa-home fa-2x pull-right" aria-hidden="true"></i></a>
                        
                        </div>
                        <div className="row collector-title">
                            <div style={{ textAlign: '-webkit-center' }} className="col-xs-4 col-sm-2 col-md-2 vcenter">
                                <Img src={[
                                    config.config.logo ? config.config.logo : "",
                                        config.map.thumbnail_url,
                                        urls.appLogo
                                    ]}
                                    style={{ height: 60 }}
                                    className="img-responsive img-rounded"/>
                            </div>
                            <div className="col-xs-8 col-sm-9 col-md-9 vcenter">
                                <span className="h3"><b>{config.title || 'Add'}</b></span>
                            </div>
                        </div>
                        <div className="container">
                        {currentComponent==="savingPanel" && <SavingPanel urls={urls} saving={saving}/>}
                        {currentComponent==="detailsPage" && <DetailsPage saveAll={this.saveAll} setCurrentComponent={this.setCurrentComponent} file={file} attrsValue={attrsValue} />}
                        {currentComponent==="attrsForm" && <AttrsForm setCurrentComponent={this.setCurrentComponent} onSave={this.setAttrsValue} key="attrsForm" attributes={config.config.attributes} ref={f => this.form = f} />}
                        {currentComponent==="fileForm" && <FileForm file={file} setCurrentComponent={this.setCurrentComponent} message={this.state.message} onSave={this.setFileFormValue} ref={f => this.fileForm = f} key="fileform" />}
                        {currentComponent==="locationForm" && <LocationForm urls={urls} onMapReady={this.onMapReady} map={this.map} changeXY={this.changeXY} onFeatureMove={this.onFeatureMove} xyValue={xyValue} setCurrentComponent={this.setCurrentComponent} ref={f => this.locationForm = f} key="locationForm" />}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
GeoCollect.propTypes = {
    urls: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired,
    instanceId: PropTypes.number.isRequired
}
export default GeoCollect
