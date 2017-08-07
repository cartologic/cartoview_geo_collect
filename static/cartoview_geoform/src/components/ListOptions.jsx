import React, { Component } from 'react';
export default class ListOptions extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            layers: [ ],
            loading: true,
            selectedLayer: this.props.config ? this.props.config.layer : null,
            selectedAttribute: this.props.config ? this.props.config.attribute : null,
            attributes: [ ]
        }
    }
    selectLayer( ) {
        if ( this.refs.selectedLayer.value ) {
            this.setState( {
                selectedLayer: this.refs.selectedLayer.value
            }, this.loadAttributes( ) )
        }
    }
    selectAttribute( ) {
        if ( this.refs.selectedAttribute.value !== "" ) {
            this.setState( {
                selectedAttribute: this.refs.selectedAttribute.value
            } )
        }
    }
    loadAttributes( ) {
        let typename = this.refs.selectedLayer ? this.refs.selectedLayer.value :
            this.state.selectedLayer
        if ( typename != "" && typename ) {
            fetch( this.props.urls.layerAttributes + "?layer__typename=" +
                typename ).then( ( response ) => response.json( ) ).then(
                ( data ) => {
                    this.setState( { attributes: data.objects } )
                } ).catch( ( error ) => {
                console.error( error );
            } );
        }
    }
    loadLayers( ) {
        fetch( this.props.urls.mapLayers + "?id=" + this.props.map.id ).then(
            ( response ) => response.json( ) ).then( ( data ) => {
            let pointLayers = data.objects.filter( ( layer ) => {
                return layer.layer_type.toLowerCase( ).includes(
                    "point" )
            } );
            this.setState( { layers: pointLayers, loading: false } )
        } ).catch( ( error ) => {
            console.error( error );
        } );
    }
    handleSubmit( ) {
        this.refs.submitButton.click( )
    }
    componentDidMount( ) {
        this.loadLayers( )
        if ( this.state.selectedLayer ) {
            this.loadAttributes( )
        }
    }
    save( e ) {
        e.preventDefault( );
        this.props.setAttributes( this.state.attributes )
        this.props.onComplete( {
            config: {
                layer: this.state.selectedLayer,
                attribute: this.state.selectedAttribute
            }
        } )
    }
    render( ) {
        let { layers, loading, attributes, selectedLayer } = this.state;
        return (
            <div className="row">
				<div className="row">
					<div className="col-xs-5 col-md-4"></div>
					<div className="col-xs-7 col-md-8">
						<button
							style={{
							display: "inline-block",
							margin: "0px 3px 0px 3px"
						}}
							className="btn btn-primary btn-sm pull-right"
							onClick={this.handleSubmit.bind( this )}>{"next "}
							<i className="fa fa-arrow-right"></i>
						</button>
						<button
							style={{
							display: "inline-block",
							margin: "0px 3px 0px 3px"
						}}
							className="btn btn-primary btn-sm pull-right"
							onClick={( ) => this.props.onPrevious( )}>
							<i className="fa fa-arrow-left"></i>{" Previous"}</button>
					</div>
				</div>
				<div className="row" style={{
					marginTop: "3%"
				}}>
					<div className="col-xs-5 col-md-4">
						<h4>{'Customize List'}</h4>
					</div>
				</div>
				<hr></hr>
				<form onSubmit={this.save.bind( this )}>
					{!loading && <div className="form-group">
						<label htmlFor="layer-select">Layer</label>
						<select
							className="form-control"
							id="layer-select"
							ref="selectedLayer"
							defaultValue={this.state.selectedLayer}
							onChange={this.selectLayer.bind( this )}
							required>
							<option value="">Choose Layer</option>
							{layers.length > 0 && layers.map(( layer, i ) => {
								return <option value={layer.typename} key={i}>{layer.name}</option>
							})}
						</select>
					</div>}
					{layers.length == 0 && !loading && <b>No Point Layers In this Map Please Select a Map With Point Layer</b>}
					{!loading && selectedLayer && <div className="form-group">
						<label htmlFor="attribute-select">Attribute to Display</label>
						<select
							className="form-control"
							id="attribute-select"
							ref="selectedAttribute"
							defaultValue={this.state.selectedAttribute}
							onChange={this.selectAttribute.bind( this )}
							required>
							<option value="">Choose Attribute</option>
							{attributes.length > 0 && attributes.map(( attribute, i ) => {
								if ( attribute.attribute_type.indexOf( "gml:" ) == -1 ) {
									return <option key={i} value={attribute.attribute}>
										{attribute.attribute || attribute.attribute_label}
									</option>
								}
							})}
						</select>
					</div>}

					<button
						style={{
						display: 'none'
					}}
						ref="submitButton"
						type="submit"
						value="submit"
						className="btn btn-primary">Save</button>
				</form>
			</div>
        )
    }
}
