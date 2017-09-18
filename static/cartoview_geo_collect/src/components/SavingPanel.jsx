import React, { Component } from 'react'

import PropTypes from 'prop-types'
import Spinner from 'react-spinkit'

export default class SavingPanel extends Component {
    constructor( props ) {
        super( props )
    }
    render( ) {
        let { saving } = this.props
        return <div className="text-center">
            {saving && <Spinner name="line-scale-pulse-out" color="steelblue"/>}
            {!saving && <div>
                <div className="alert alert-success" role="alert">{'Your Data Saved Successfully'}</div>
                <a href="/apps/cartoview_geo_collect/95/view/" className="btn btn-lg btn-success">Add New Entry</a>
                </div>}
        </div>

    }
}
SavingPanel.propTypes = {
    saving: PropTypes.bool.isRequired
}
