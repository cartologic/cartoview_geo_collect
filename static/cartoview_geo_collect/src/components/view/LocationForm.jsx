import React, { Component } from 'react'

import PropTypes from 'prop-types'
import t from 'tcomb-form'

const xyFormSchema = t.struct({
    x: t.Number,
    y: t.Number
})
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
    constructor(props) {
        super(props)
    }
    componentDidUpdate(prevProps, prevState){
        const {map}=this.props
        map.updateSize()
    }
    componentDidMount() {
        const {map,mapInit}=this.props
        map.setTarget(this.mapDiv)
        mapInit()
    }
    render() {
        let { locationValue, toggleComponent, onSave, extraClasses } = this.props

        return (
            <div className={extraClasses}>
                <div className="panel panel-primary">
                    <div className="panel-heading">Set Location</div>
                    <div className="panel-body">
                        <t.form.Form ref={f => this.xyForm = f} type={xyFormSchema}
                            options={options}
                            value={locationValue}
                            onChange={(xyValue) => onSave(xyValue)} />
                        <div id="map-ct" ref={mapRef => this.mapDiv = mapRef} className=' map-ct'>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-6col-lg-6 text-center">
                        <button onClick={() => toggleComponent("fileForm")} className={"btn btn-block  btn-primary"}>Previous</button>
                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6  text-center">
                        <button onClick={() => toggleComponent("detailsPage")} className={"btn btn-block  btn-primary"}>Next</button>
                    </div>
                </div>
            </div>
        )
    }
}
LocationForm.propTypes = {
    toggleComponent: PropTypes.func.isRequired,
    locationValue: PropTypes.object,
    map: PropTypes.object.isRequired,
    extraClasses: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    mapInit: PropTypes.func.isRequired,
}
