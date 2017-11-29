import Img from 'react-image'
import Logo from '../../../../cartoview_geo_collect/logo.png'
import PropTypes from 'prop-types'
import React from 'react'
export const NavigationButtons = (props) => {
    const { showHistoryModal, config, urls } = props
    return <div className="container">
        <a onClick={showHistoryModal} href="javascript:;"><i className="fa fa-question-circle fa-2x pull-right" aria-hidden="true"></i></a>
        <a onClick={() => window.location.href = config.config.HomeButtonFunction && config.config.HomeButtonFunction === "instancePage" ? urls.instancesPage : "/"} href="javascript:;"><i className="fa fa-home fa-2x pull-right" aria-hidden="true"></i></a>
    </div>
}
NavigationButtons.propTypes = {
    showHistoryModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    urls: PropTypes.object.isRequired
}
export const Header = (props) => {
    const { config } = props
    return (
        <div className="collector-title">
            <div className="col-xs-4 col-sm-2 col-md-2 vcenter">
                <Img src={[
                    config.config.logo ? config.config.logo : "",
                    config.map.thumbnail_url,
                    Logo
                ]}
                    style={{ height: 60 }}
                    className="img-responsive img-rounded" />
            </div>
            <div className="col-xs-8 col-sm-9 col-md-9 vcenter">
                <span className="h3 text-wrap"><b>{config.title || 'Add'}</b></span>
            </div>
        </div>
    )
}
Header.propTypes = {
    config: PropTypes.object.isRequired,
}
