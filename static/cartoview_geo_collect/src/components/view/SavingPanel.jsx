import React, { Component } from 'react'

import AlertContainer from 'react-alert'
import PropTypes from 'prop-types'
import Spinner from 'react-spinkit'

export default class SavingPanel extends Component {
    constructor(props) {
        super(props)
    }
    showMessage = (message, type = "error") => {
        this.msg.show(
            message, {
                time: 5000,
                type
            })
    }
    render() {
        const alertOptions = {
            offset: 14,
            position: 'top right',
            theme: 'light',
            time: 5000,
            transition: 'scale'
        }
        let { saving, urls, extraClasses } = this.props
        return <div className={`text-center ${extraClasses}`}>
            <AlertContainer ref={a => this.msg = a} {...alertOptions} />
            {saving && <Spinner name="line-scale-pulse-out" color="steelblue" />}
            {!saving && <div>
                <div className="alert alert-success" role="alert">{'Your Data Saved Successfully'}</div>
                <a href={urls.viewURL} className="btn btn-lg btn-success">{"Add New Entry"}</a>
            </div>}
        </div>

    }
}
SavingPanel.propTypes = {
    saving: PropTypes.bool.isRequired,
    urls: PropTypes.object.isRequired,
    extraClasses: PropTypes.string,
}
