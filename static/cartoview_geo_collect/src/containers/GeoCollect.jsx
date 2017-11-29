import 'Source/css/geoform.css'

import React, { Component } from 'react'
import { doGet, doPost } from 'Source/containers/utils'

import GeoCollect from 'Source/components/view/GeoCollect'
import GeoCollectHelper from 'Source/helpers/GeoCollectHelper'
import LayerHelper from 'Source/helpers/LayersHelper'
import MapConfigService from 'Source/services/MapConfigService'
import MapConfigTransformService from 'Source/services/MapConfigTransformService'
import PropTypes from 'prop-types'
import URLS from 'Source/containers/URLS'
import { getCRSFToken } from 'Source/helpers/helpers.jsx'

class GeoCollectContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentComponent: "attrsForm",
            showHistory: false,
            file: null,
            feature: null,
            locationValue: null,
            schema: null,
            fields: null,
            value: null,
            targetNameSpace: null,
            saving: false,
            geometryName: null,
            selectionLayer: false,
            map: GeoCollectHelper.getMap()
        }
        this.urls = new URLS(this.props.urls)
    }
    setFeatureAttibutes = () => {
        let { feature, value } = this.state
        Object.keys(value).map(property => {
            feature.set(property, value[property])
        })
        this.setState({ feature })
    }
    saveLog = () => {
        const { urls, config } = this.props
        let { value } = this.state
        const url = urls.historyListCreate
        const data = JSON.stringify({
            layer: config.config.layer,
            data: value,
        })
        fetch(urls.historyListCreate, {
            method: 'POST',
            credentials: "same-origin",
            headers: new Headers({
                "Content-Type": "application/json; charset=UTF-8",
                "X-CSRFToken": getCRSFToken()
            }),
            body: data
        }).then(response => {
            this.setState({ saving: false })
            this.geoCollect.showMessage(
                'Your Data Saved successfully',
                'success'
            )
        })
    }
    showHistoryModal=()=>{
        let {showHistory}=this.state
        this.setState({showHistory:!showHistory})
    }
    saveAttachments = (featureId) => {
        let { file } = this.state
        const { username, config, urls } = this.props
        const layerName = LayerHelper.layerName(config.config.layer)
        const data = {
            file: file.base64,
            file_name: file.name,
            username: username,
            is_image: true,
            feature_id: featureId,
            tags: [`geo_collect_${layerName}`]
        }
        doPost(urls.attachmentUploadUrl(layerName), JSON.stringify(data), {
            "Content-Type": "application/json; charset=UTF-8"
        }).then(result => this.saveLog())
    }
    sendRequest = () => {
        const { urls, config } = this.props
        const layer = config.config.layer
        let { feature, map, targetNameSpace } = this.state
        const xml = GeoCollectHelper.wfsTransaction(feature, layer, targetNameSpace, map.getView().getProjection().getCode())
        const proxiedURL = this.urls.getProxiedURL(urls.wfsURL)
        return doPost(proxiedURL, xml, {
            'Content-Type': 'text/xml',
        }, 'xml').then(xml => {
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(xml, "text/xml")
            const featureElements = xmlDoc.getElementsByTagNameNS(
                'http://www.opengis.net/ogc', 'FeatureId')
            if (featureElements.length > 0) {
                const featureId = featureElements[0].getAttribute(
                    "fid")
                this.saveAttachments(featureId)
            }

        }).catch((error) => {
            this.geoCollect.showMessage(
                'Error while saving Data please Contact our Support',
                'error')
        })

    }
    saveAll = () => {
        let { feature, value } = this.state
        Object.keys(value).map(property => {
            feature.set(property, value[property])
        })
        this.setState({ feature, saving: true, currentComponent: "savingPanel" }, this.sendRequest)

    }
    setFormValue = (value) => {
        this.setState({ value })
    }
    setFileFormValue = (file) => {
        this.setState({
            file
        })
    }
    changeLocationValue = (locationValue) => {
        let { feature } = this.state
        feature.setGeometry(GeoCollectHelper.getPointGeomerty([locationValue.x, locationValue.y]))
        this.setState({ locationValue })
    }
    componentWillMount() {
        const { config } = this.props
        let form = GeoCollectHelper.buildForm(config.config.attributes)
        this.setState({ ...form })
    }
    onFeatureMove = (event) => {
        let { feature } = this.state
        let location = feature.getGeometry().getCoordinates()
        this.setState({
            locationValue: {
                x: location[0],
                y: location[1]
            }
        })
    }
    buildDescribeFeatureTypeURL = (typeName) => {
        const { urls } = this.props
        const url = this.urls.wfsQueryBuilder(urls.wfsURL, {
            version: '1.3.0',
            request: "describeFeatureType",
            outputFormat: "application/json",
            service: "WFS",
            typeName
        })
        return url
    }
    getGeometryName = () => {
        const { config } = this.props
        let { map } = this.state
        const url = this.buildDescribeFeatureTypeURL(config.config.layer)
        doGet(url).then(result => {
            result.featureTypes[0].properties.forEach(attribute => {
                if (attribute.type.includes("gml:")) {
                    const data = {
                        targetNameSpace: result.targetNamespace,
                        geometryName: attribute.name
                    }
                    this.setState({ ...data }, () => this.onMapReady(map.getView().getCenter()))
                }
            })
        })
    }
    onMapReady = (center) => {
        let { map, selectionLayer, geometryName } = this.state
        let locationValue = {
            x: center[0],
            y: center[1]
        }
        let feature = GeoCollectHelper.getPointFeature(center, geometryName)
        let layer = GeoCollectHelper.getVectorLayer(feature)
        let interaction = GeoCollectHelper.getModifyInteraction(feature)
        if (!selectionLayer) {
            map.addLayer(layer)
            interaction.on('modifyend', this.onFeatureMove)
            map.addInteraction(interaction)
            interaction.setActive(true)
            this.setState({ feature, selectionLayer: true, map, locationValue })
        }
    }
    mapInit = () => {
        const { urls } = this.props
        let { map } = this.state
        fetch(urls.mapJsonUrl, {
            method: "GET",
            credentials: 'include'
        }).then((response) => response.json()).then((config) => {
            MapConfigService.load(MapConfigTransformService.transform(
                config), map, urls.proxy)
            this.getGeometryName()
        })
    }
    toggleComponent = (currentComponent) => {
        this.setState({ currentComponent })
    }
    getChildrenProps = () => {
        const { config, urls, username } = this.props
        let props = {
            ...this.state,
            config,
            urls,
            username,
            toggleComponent: this.toggleComponent,
            setFormValue: this.setFormValue,
            setFileFormValue: this.setFileFormValue,
            changeLocationValue: this.changeLocationValue,
            mapInit: this.mapInit,
            saveAll: this.saveAll,
            showHistoryModal:this.showHistoryModal
        }
        return props
    }
    render() {
        return <GeoCollect ref={ref => this.geoCollect = ref} childrenProps={this.getChildrenProps()} />
    }
}
GeoCollectContainer.propTypes = {
    urls: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired
}
export default GeoCollectContainer
