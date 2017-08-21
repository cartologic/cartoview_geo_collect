import React, { Component } from 'react'

import Img from 'react-image'
import {
  Link
} from 'react-router-dom'
import PropTypes from 'prop-types'
import Spinner from "react-spinkit"
import noImage from '../img/no-img.png'

export default class InfoPage extends Component {
    constructor(props) {
        super(props)

    }
    componentDidMount() {
        
    }
    render() {
        let {
            title,
            description,
        } = this.props
        return (
            <div>
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-9">
                        <h3 id="info-title">{title}</h3>
                        <hr />
                        <p id="info-description" >{description}</p>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-3">
                        <a href="javascript:;" className="thumbnail">
                            <Img
                                src={[
                                    "/static/cartoview_geo_collect/logo.png",
                                    noImage
                                ]}
                                loader={<Spinner className="loading-center" name="line-scale-party" color="steelblue" />}
                                className="img-responsive img-thumbnail"
                            />
                        </a>
                    </div>

                </div>
                <hr/>
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-md-offset-3 col-lg-offset-3">
                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6"><a href="/apps/appinstances/?app__title=GeoCollect" className="btn btn-primary">Home</a></div>
                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6"><Link className="btn btn-success" to="/form">Add New</Link></div>
                       
                    </div>
                </div>
            </div>
        )
    }
}
InfoPage.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
}
