import { geoPropTypes, geolocated } from 'react-geolocated'

import MapConfigService from '@boundlessgeo/sdk/services/MapConfigService'
import MapConfigTransformService from '@boundlessgeo/sdk/services/MapConfigTransformService'
import React from 'react'
import ol from 'openlayers'

class MapViewer extends React.Component {
    constructor( props ) {
        super( props )
        this.loaded = false
        this.feature = new ol.Feature( {
            geometry: new ol.geom.Point( [ 0, 0 ] ),
            geometryName: 'the_geom'
        } )
        const featureStyle = new ol.style.Style( {
            image: new ol.style.Icon( {
                anchor: [
                    0.5, 31
                ],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                color: "#00B7F1",
                src: this.props.urls.static +
                    'cartoview_geo_collect/marker.png'
            } ),
            text: new ol.style.Text( {
                text: '+',
                fill: new ol.style.Fill( { color: '#fff' } ),
                stroke: new ol.style.Stroke( {
                    color: '#fff',
                    width: 2
                } ),
                textAlign: 'center',
                offsetY: -20,
                font: '18px serif'
            } )
        } )
        this.vectorLayer = new ol.layer.Vector( {
            source: new ol.source.Vector( {
                features: [ this.feature ]
            } ),
            style: featureStyle
        } )
        this.modifyInteraction = new ol.interaction.Modify( {
            features: new ol.Collection( [ this.feature ] ),
            pixelTolerance: 32
        } )
        this.modifyInteraction.on( 'modifyend', this.onFeatureMove )
        this.map = this.props.map
    }
    onFeatureMove = ( event ) => {
        this.props.onFeatureMove( this.feature.getGeometry( ).getCoordinates( ) )
    }
    update( url ) {
        if ( url ) {
            fetch( url, {
                method: "GET",
                credentials: 'include'
            } ).then( ( response ) => {
                if ( response.status == 200 ) {
                    return response.json( )
                }
            } ).then( ( config ) => {
                if ( config ) {
                    MapConfigService.load(
                        MapConfigTransformService.transform(
                            config ), this.map )
                    this.feature.setGeometry( new ol.geom.Point(
                        this.map.getView( ).getCenter( )
                    ) )
                    this.map.addLayer( this.vectorLayer )
                    this.map.addInteraction( this.modifyInteraction )
                    this.modifyInteraction.setActive( true )
                    if ( typeof this.props.onMapReady ==
                        'function' && this.props.xyValue==null ) this.props.onMapReady(
                        this.map )
                }
            } )
        }
    }
    componentDidMount( ) {
        this.map.setTarget( this.mapRef )
        this.update( this.props.urls.mapJsonUrl )
        this.map.updateSize( )
    }
    render( ) {
        var {
            className = '',
            xyValue,
        } = this.props
        if ( xyValue ) {
            const coordsTransformed = ol.proj.transform( [
                parseFloat( xyValue.x ),
                parseFloat( xyValue.y )
            ], 'EPSG:4326', 'EPSG:900913' )
            this.map.getView( ).setCenter( coordsTransformed )
            this.feature.setGeometry( new ol.geom.Point(
                coordsTransformed ) )
        }
        return (
            <div>
                <div ref={(mapRef)=>this.mapRef=mapRef} style={{ border: "2px solid lightgray", borderRadius: "8px",height:400}} className={className + ' map-ct'}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
MapViewer.propTypes = { ...MapViewer.propTypes, ...geoPropTypes }
export default geolocated( {
    positionOptions: {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: Infinity,
    },
    userDecisionTimeout: null,
} )( MapViewer )
