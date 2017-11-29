import React, { Component } from 'react'

import AttrsForm from 'Source/components/view/AttrsForm'
import DetailsPage from 'Source/components/view/DetailsPage'
import FileForm from 'Source/components/view/FileForm'
import { Header } from 'Source/components/view/CommonComponents'
import InfoModal from 'Source/components/view/InfoModal'
import LocationForm from 'Source/components/view/LocationForm'
import {NavigationButtons} from 'Source/components/view/CommonComponents'
import PropTypes from 'prop-types'
import SavingPanel from 'Source/components/view/SavingPanel'
import classnames from 'classnames'

class GeoCollect extends Component {
    constructor(props) {
        super(props)
    }
    showMessage = (message, type) => {
        this.savingPanel.showMessage(message, type)
    }
    getAttrsFormProps = () => {
        const { childrenProps } = this.props
        let props = {
            schema: childrenProps.schema,
            fields: childrenProps.fields,
            value: childrenProps.value,
            toggleComponent: childrenProps.toggleComponent,
            onSave: childrenProps.setFormValue,
            extraClasses: classnames({
                'hidden': childrenProps.currentComponent !==
                    "attrsForm"
            })
        }
        return props
    }
    getHeaderProps = () => {
        const { childrenProps } = this.props
        let props = {
            config: childrenProps.config,
        }
        return props
    }
    getFileFormProps = () => {
        const { childrenProps } = this.props
        let props = {
            file: childrenProps.file,
            extraClasses: classnames({
                'hidden': childrenProps.currentComponent !==
                    "fileForm"
            }),
            onSave: childrenProps.setFileFormValue,
            toggleComponent: childrenProps.toggleComponent,
        }
        return props
    }
    getLocationFormProps = () => {
        const { childrenProps } = this.props
        let props = {
            locationValue: childrenProps.locationValue,
            map: childrenProps.map,
            extraClasses: classnames({
                'hidden': childrenProps.currentComponent !==
                    "locationForm"
            }),
            onSave: childrenProps.changeLocationValue,
            mapInit: childrenProps.mapInit,
            toggleComponent: childrenProps.toggleComponent,
        }
        return props
    }
    getDetailsPageProps = () => {
        const { childrenProps } = this.props
        let props = {
            value: childrenProps.value,
            file: childrenProps.file,
            extraClasses: classnames({
                'hidden': childrenProps.currentComponent !==
                    "detailsPage"
            }),
            saveAll: childrenProps.saveAll,
            toggleComponent: childrenProps.toggleComponent,
        }
        return props
    }
    getSavingPanelProps = () => {
        const { childrenProps } = this.props
        let props = {
            saving: childrenProps.saving,
            urls: childrenProps.urls,
            extraClasses: classnames({
                'hidden': childrenProps.currentComponent !==
                    "savingPanel"
            }),
        }
        return props
    }
    getModalProps = () => {
        const { childrenProps } = this.props
        let props = {
            layer:childrenProps.config.config.layer,
            close:childrenProps.showHistoryModal,
            urls:childrenProps.urls
        }
        return props
    }
    getNavigationProps = () => {
        const { childrenProps } = this.props
        let props = {
            config:childrenProps.config,
            showHistoryModal:childrenProps.showHistoryModal,
            urls:childrenProps.urls
        }
        return props
    }
    render() {
        const {childrenProps}=this.props
        return (
            <div className="container">
                <div className=" row wrap">
                    {childrenProps.showHistory && <InfoModal {...this.getModalProps()} />}
                    <NavigationButtons {...this.getNavigationProps()}  />
                    <Header {...this.getHeaderProps() } />
                    <AttrsForm {...this.getAttrsFormProps() } />
                    <FileForm {...this.getFileFormProps() } />
                    <LocationForm {...this.getLocationFormProps() } />
                    <DetailsPage  {...this.getDetailsPageProps() } />
                    <SavingPanel ref={(ref) => this.savingPanel = ref} {...this.getSavingPanelProps() } />
                </div>
            </div>
        )
    }
}
GeoCollect.propTypes = {
    childrenProps: PropTypes.object.isRequired,
}
export default GeoCollect
