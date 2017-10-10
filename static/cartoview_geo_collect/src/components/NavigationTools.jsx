import React, { Component } from 'react'

import PropTypes from 'prop-types'
import t from 'tcomb-form'

const mapConfig = t.struct( {
    showZoombar: t.Boolean,
    showLayerSwitcher: t.Boolean,
    showBaseMapSwitcher: t.Boolean,
    showLegend: t.Boolean,
    EnableGeolocation: t.Boolean
} )
const options = {
    fields: {
        showZoombar: {
            label: "Zoom Bar"
        },
        showLayerSwitcher: {
            label: "Layer Switcher"
        },
        showBaseMapSwitcher: {
            showBaseMapSwitcher: "Base Map Switcher"
        },
        showLegend: {
            label: "Legend"
        },
        EnableGeolocation: {
            label: "GeoLocation"
        }
    }
};
const Form = t.form.Form
export default class NavigationTools extends Component {
    constructor( props ) {
        super( props )
        const { config } = this.props
        this.state = {
            defaultConfig: {
                showZoombar: config && config.config && config.config.showZoombar ?
                    config.config.showZoombar : true,
                showLayerSwitcher: config && config.config && config.config
                    .showLayerSwitcher ? config.config.showLayerSwitcher : true,
                showBaseMapSwitcher: config && config.config && config
                    .config.showBaseMapSwitcher ? config.config.showBaseMapSwitcher : true,
                showLegend: config && config.config && config.config.showLegend ?
                    config.config.showLegend : true,
                EnableGeolocation: config && config.config && config.config
                    .EnableGeolocation ? config.config.EnableGeolocation : true,
            }
        }
    }
    componentWillReceiveProps( nextProps ) {
        this.setState( {
            success: nextProps.success
        } )
    }
    save( ) {
        var basicConfig = this.refs.form.getValue( )
        if ( basicConfig ) {
            const properConfig = {
                showZoombar: basicConfig.showZoombar,
                showLayerSwitcher: basicConfig.showLayerSwitcher,
                showBaseMapSwitcher: basicConfig.showBaseMapSwitcher,
                showLegend: basicConfig.showLegend,
                EnableGeolocation: basicConfig.EnableGeolocation
            }
            this.props.onComplete( properConfig )
        }
    }
    render( ) {
        let { urls, id, onPrevious } = this.props
        return (
            <div className="row">
                <div className="row">
                    <div className="col-xs-5 col-md-4"></div>
                    <div className="col-xs-7 col-md-8">
                        <button className="top-buttons btn btn-primary btn-sm pull-right disabled" onClick={this.save.bind(this)}>{"next "}<i className="fa fa-arrow-right"></i></button>

                        <button className="top-buttons btn btn-primary btn-sm pull-right"
                            onClick={() => onPrevious()}><i className="fa fa-arrow-left"></i>{" Previous"}</button>
                    </div>
                </div>
                <div className="row" style={{
                    marginTop: "3%"
                }}>
                    <div className="col-xs-5 col-md-4">
                        <h4>{'NavigationTools '}</h4>
                    </div>
                    <div className="col-xs-7 col-md-8">
                        <a className={this.state.success || id
                            ? "btn btn-primary btn-sm pull-right top-buttons"
                            : "btn btn-primary btn-sm pull-right top-buttons disabled"}
                            href={urls.viewURL(id)}>
                            View
						</a>

                        <a className={this.state.success ||id 
                            ? "btn btn-primary btn-sm pull-right top-buttons"
                            : "btn btn-primary btn-sm pull-right top-buttons disabled"}
                            href={urls.detailsURL(id)}
                            target={"_blank"}>
                            Details
						</a>

                        <button className={this.state.success===true
                            ? "btn btn-primary btn-sm pull-right top-buttons disabled"
                            : "btn btn-primary btn-sm top-buttons pull-right"}
                            onClick={this.save.bind(this)}>Save</button>

                        <p className={this.state.success ? "top-buttons-right" : "top-buttons-right-hidden"}>
                            App instance successfully created!</p>
                    </div>
                </div>
                <hr></hr>

                <Form
                    ref="form"
                    value={this.state.defaultConfig}
                    type={mapConfig}
                    options={options} />
            </div>
        )
    }
}
NavigationTools.propTypes = {
    urls: PropTypes.object.isRequired,
    config: PropTypes.object,
    onPrevious: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    success: PropTypes.bool
}
