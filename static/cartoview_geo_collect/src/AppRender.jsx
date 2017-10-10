import Edit from './Edit.jsx'
import React from 'react'
import { getCRSFToken } from './helpers/helpers.jsx'
import { render } from 'react-dom'
class Viewer {
    constructor( domId, username, urls ) {
        this.domId = domId
        this.urls = urls
        this.username = username
        this.config = null
    }
    loadConfig( ) {
        return fetch( this.urls.appInstance, {
            method: 'GET',
            credentials: "same-origin",
            headers: new Headers( {
                "Content-Type": "application/json; charset=UTF-8",
                "X-CSRFToken": getCRSFToken( )
            } )
        } ).then( ( response ) => response.json( ) )
    }
    view( ) {
        if ( this.urls.appInstance ) {
            this.loadConfig( ).then( ( res ) => {
                this.config = {
                    config: res.config,
                    title: res.title,
                    abstract: res.abstract,
                    keywords: res.keywords,
                    map: res.map,
                    id:res.id
                }
                this.currentlayer=res.config.layer
                render(
                    <Edit urls={this.urls} config={this.config} username={this.username}/>,
                    document.getElementById( this.domId ) )
            } )
        } else {
            render(
                <Edit urls={this.urls} config={this.config} username={this.username}/>,
                document.getElementById( this.domId ) )
        }
    }
}
global.Viewer = Viewer
