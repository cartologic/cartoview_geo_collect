// import 'react-select/dist/react-select.css'
import React, { Component } from 'react'

import PropTypes from 'prop-types'
import Select from 'react-select'

export default class ListOptions extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            layers: [ ],
            loading: true,
            selectedLayer: this.props.config ? this.props.config.layer : null,
            selectedTitleAttribute: this.props.config ? this.props.config
                .titleAttribute : null,
            selectedSubtitleAttribute: this.props.config ? this.props.config
                .subtitleAttribute : null,
            pagination: this.props.config ? this.props.config.pagination : null,
            attributes: [ ],
            searchOptions: [ ],
			filters: [ ],
			messages:null
        }
    }
    attributesOption = ( ) => {
        let options = [ ]
        this.state.attributes.forEach( ( attribute ) => {
            if ( attribute.attribute_type.indexOf( "gml:" ) == -1 ) {
                options.push( { value: attribute.attribute, label: attribute
                        .attribute } )
            }
        } )
        this.setState( { searchOptions: options } )
    }
    selectLayer( ) {
        if ( this.refs.selectedLayer.value ) {
            this.setState( {
                selectedLayer: this.refs.selectedLayer.value
            }, this.loadAttributes( ) )
        }
    }
    selectTitleAttribute( ) {
        if ( this.refs.selectedTitleAttribute.value !== "" ) {
            this.setState( {
                selectedTitleAttribute: this.refs.selectedTitleAttribute
                    .value
            } )
        }
    }
    selectSubtitleAttribute( ) {
        if ( this.refs.selectedSubtitleAttribute.value !== "" ) {
            this.setState( {
                selectedSubtitleAttribute: this.refs.selectedSubtitleAttribute
                    .value
            } )
        }
    }
    selectPagination( ) {
        if ( this.refs.selectedPagination.value !== "" ) {
            console.log( this.refs.selectedPagination.value )
            this.setState( {
                pagination: this.refs.selectedPagination.value
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
                    this.setState( { attributes: data.objects }, ( ) => { this
                            .attributesOption( ) } )
                } ).catch( ( error ) => {
                console.error( error )
            } )
        }
    }
    loadLayers( ) {
        fetch( this.props.urls.mapLayers + "?id=" + this.props.map.id ).then(
            ( response ) => response.json( ) ).then( ( data ) => {
            let pointLayers = data.objects.filter( ( layer ) => {
                return layer.layer_type.toLowerCase( ).includes(
                    "point" )
            } )
            this.setState( { layers: pointLayers, loading: false } )
        } ).catch( ( error ) => {
            console.error( error )
        } )
    }
    handleSelectChange = ( value ) => {
        this.setState( { filters: value ,messages:null} )
    }
    handleSubmit( ) {
		if(this.state.filters.length>0){
			this.refs.submitButton.click( )
		}else{
			this.setState({messages:"Please Select Search Attribute"})
		}
        
    }
    componentDidMount( ) {
        this.loadLayers( )
        if ( this.state.selectedLayer ) {
            this.loadAttributes( )
        }
    }
    save( e ) {
        e.preventDefault( )
        this.props.setAttributes( this.state.attributes )
        this.props.onComplete( {
            config: {
                layer: this.state.selectedLayer,
                titleAttribute: this.state.selectedTitleAttribute,
                subtitleAttribute: this.state.selectedSubtitleAttribute,
				pagination: this.state.pagination,
				filters:this.state.filters
            }
        } )
    }
    render( ) {
        let { layers, loading, attributes, selectedLayer } = this.state
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
							onClick={this.handleSubmit.bind(this)}>{"next "}
							<i className="fa fa-arrow-right"></i>
						</button>
						<button
							style={{
								display: "inline-block",
								margin: "0px 3px 0px 3px"
							}}
							className="btn btn-primary btn-sm pull-right"
							onClick={() => this.props.onPrevious()}>
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
				<form onSubmit={this.save.bind(this)}>
					{!loading && <div className="form-group">
						<label htmlFor="layer-select">Layer</label>
						<select
							className="form-control"
							id="layer-select"
							ref="selectedLayer"
							defaultValue={this.state.selectedLayer}
							onChange={this.selectLayer.bind(this)}
							required>
							<option value="">Choose Layer</option>
							{layers.length > 0 && layers.map((layer, i) => {
								return <option value={layer.typename} key={i}>{layer.name}</option>
							})}
						</select>
					</div>}
					{layers.length == 0 && !loading && <b>No Point Layers In this Map Please Select a Map With Point Layer</b>}
					{!loading && selectedLayer && <div className="form-group">
						<label htmlFor="attribute-select">Title Attribute</label>
						<select
							className="form-control"
							id="attribute-select"
							ref="selectedTitleAttribute"
							defaultValue={this.state.selectedTitleAttribute}
							onChange={this.selectTitleAttribute.bind(this)}
							required>
							<option value="">Choose Attribute</option>
							{attributes.length > 0 && attributes.map((attribute, i) => {
								if (attribute.attribute_type.indexOf("gml:") == -1) {
									return <option key={i} value={attribute.attribute}>
										{attribute.attribute || attribute.attribute_label}
									</option>
								}
							})}
						</select>
					</div>}
					{!loading && selectedLayer && <div className="form-group">
						<label htmlFor="attribute-select">Subtitle Attribute</label>
						<select
							className="form-control"
							id="attribute-select"
							ref="selectedSubtitleAttribute"
							defaultValue={this.state.selectedSubtitleAttribute}
							onChange={this.selectSubtitleAttribute.bind(this)}
							required>
							<option value="">Choose Attribute</option>
							{attributes.length > 0 && attributes.map((attribute, i) => {
								if (attribute.attribute_type.indexOf("gml:") == -1) {
									return <option key={i} value={attribute.attribute}>
										{attribute.attribute || attribute.attribute_label}
									</option>
								}
							})}
						</select>
					</div>}
					{!loading && selectedLayer && <div className="form-group">
						<label htmlFor="pagination-select">Features Per Page</label>
						<select
							className="form-control"
							id="pagination-select"
							ref="selectedPagination"
							defaultValue={this.state.pagination}
							onChange={this.selectPagination.bind(this)}
							required>
							<option value="">Choose Number Of Features</option>
							<option value="10">10</option>
							<option value="20">20</option>
							<option value="50">50</option>
							<option value="80">80</option>
							<option value="100">100</option>
						</select>
					</div>}

					<Select
						multi={true}
						onChange={this.handleSelectChange}
						value={this.state.filters}
						options={this.state.searchOptions} />
					{this.state.messages && <small style={{color:"red"}}>{this.state.messages}</small>}
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
ListOptions.propTypes = {
    onComplete: PropTypes.func.isRequired,
    setAttributes: PropTypes.func.isRequired,
    onPrevious: PropTypes.func.isRequired,
    config: PropTypes.object,
    urls: PropTypes.object.isRequired,
    map: PropTypes.object.isRequired,
}
