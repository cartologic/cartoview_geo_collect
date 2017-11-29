import GeoCollect from 'Source/containers/GeoCollect'
import React from 'react'
import { getCRSFToken } from 'Source/helpers/helpers.jsx'
import { render } from 'react-dom'
class GeoCollectViewer {
    constructor(domId, username, urls, instanceId) {
        this.domId = domId
        this.urls = urls
        this.username = username
        this.instanceId = instanceId
    }
    loadConfig() {
        return fetch(this.urls.appInstance, {
            method: 'GET',
            credentials: "same-origin",
            headers: new Headers({
                "Content-Type": "application/json; charset=UTF-8",
                "X-CSRFToken": getCRSFToken()
            })
        }).then((response) => response.json())
    }
    view() {
        this.loadConfig().then((res) => {
            this.config = {
                config: res.config,
                title: res.title,
                abstract: res.abstract,
                map: res.map
            }
            render(
                <GeoCollect config={this.config} username={this.username} urls={this.urls} instanceId={this.instanceId} />,
                document.getElementById(this.domId))
        })
    }
}
global.GeoCollectViewer = GeoCollectViewer
