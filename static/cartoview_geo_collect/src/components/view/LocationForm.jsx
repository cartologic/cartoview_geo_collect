import React, { Component } from 'react'

import MapViewer from './MapViewer'
import PropTypes from 'prop-types'
import t from 'tcomb-form'

const xyFormSchema = t.struct( {
    x: t.Number,
    y: t.Number
} )
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
export default class LocationForm extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            xyValue: this.props.xyValue ? this.props.xyValue : null
        }
    }
    componentWillReceiveProps( nextProps ) {
        if ( this.props.xyValue !== nextProps.xyValue ) {
            this.setState( { xyValue: nextProps.xyValue } )
        }
    }
    render( ) {
        let { xyValue } = this.props

        return (
            <div>
                <div className="panel panel-primary">
                <div className="panel-heading">Set Location</div>
                <div className="panel-body">
                <t.form.Form ref={f => this.xyForm = f} type={xyFormSchema}
                    options={options}
                    value={xyValue}
                    onChange={(xyValue) => this.setState({ xyValue })} />
                <MapViewer {...this.props} />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12 col-sm-6 col-md-6col-lg-6 text-center">
                    <button onClick={()=>this.props.setCurrentComponent("fileForm")} className={"btn btn-block  btn-primary"}>Previous</button>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6  text-center">
                    <button onClick={()=>this.props.setCurrentComponent("detailsPage")}  className={"btn btn-block  btn-primary"}>Next</button>
                </div>
            </div>
            </div>
        )
    }
}
LocationForm.propTypes = {
    setCurrentComponent: PropTypes.func.isRequired,
    xyValue: PropTypes.object,
    map: PropTypes.object.isRequired,
    urls: PropTypes.object.isRequired,
    onMapReady: PropTypes.func,
    changeXY: PropTypes.func.isRequired,
    onFeatureMove: PropTypes.func.isRequired
}
