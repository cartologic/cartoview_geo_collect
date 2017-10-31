import React, { Component } from 'react'

import PropTypes from 'prop-types'
import t from 'tcomb-form'

const HomeButtonFunction = t.enums( {
    instancePage: 'Instance Page',
    appHome: 'App Home'
} );
const mapConfig = t.struct( {
    HomeButtonFunction,
    showZoombar: t.Boolean,
    showLayerSwitcher: t.Boolean,
    showBaseMapSwitcher: t.Boolean,
    showLegend: t.Boolean
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
        }
    }
}
const getPropertyFromConfig = (config, property, defaultValue) => {
    console.log(config)
    const propertyValue = config[property] || config[property]===false ? config[property] : defaultValue
    const nestedPropertyValue = config.config && config.config[property] ?
        config.config[property] : propertyValue
    return nestedPropertyValue
}
const Form = t.form.Form
export default class NavigationTools extends Component {
    constructor( props ) {
        super( props )
        const { config } = this.props
        this.state = {
            defaultConfig: {
                showZoombar: getPropertyFromConfig(config,'showZoombar',true),
                showLayerSwitcher: getPropertyFromConfig(config,'showLayerSwitcher',true),
                showBaseMapSwitcher: getPropertyFromConfig(config,'showBaseMapSwitcher',true),
                showLegend: getPropertyFromConfig(config,'showLegend',true),
                HomeButtonFunction: getPropertyFromConfig(config,'HomeButtonFunction','instancePage'),
            }
        }
    }
    componentWillReceiveProps( nextProps ) {
        this.setState( {success: nextProps.success
        } )
    }
    save( ) {
        var basicConfig = this.refs.form.getValue( )
        if ( basicConfig ) {
            this.setState({defaultConfig:basicConfig})
            this.props.onComplete( basicConfig )
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
