import './css/app.css'

import React, { Component } from 'react'

import FormFields from './components/FormFields'
import General from './components/General.jsx'
import ImageUploader from "./components/ImageUploader.jsx"
import LayerSelector from "./components/LayerSelector.jsx"
import NavigationTools from './components/NavigationTools.jsx'
import Navigator from './components/Navigator.jsx'
import PropTypes from 'prop-types'
import ResourceSelector from './components/ResourceSelector.jsx'
import { getCRSFToken } from './helpers/helpers.jsx'

export default class Edit extends Component {
    constructor( props ) {
        super( props )
        const { config } = this.props
        this.state = {
            step: 0,
            title: config ? config.title : null,
            abstract: config ? config.abstract : null,
            config: config ? config.config : null,
            selectedResource: config ? config.map : null,
            id: config ? config.id : null
        }
    }
    goToStep( step ) {
        this.setState( { step } )
    }
    doDescribeFeatureType = ( typename ) => {
        let { urls } = this.props
        return fetch( urls.describeFeatureType( typename ) ).then(
            ( response ) => response.json( ) )
    }
    save = ( instanceConfig ) => {
        const { config } = this.state
        const { urls } = this.props
        const { id } = this.state
        const url = id ? urls.editURL( id ) : urls.newURL
        this.setState( {
            config: instanceConfig
        } )
        fetch( url, {
            method: 'POST',
            credentials: "same-origin",
            headers: new Headers( { "Content-Type": "application/json; charset=UTF-8", "X-CSRFToken": getCRSFToken( ) } ),
            body: JSON.stringify( instanceConfig )
        } ).then( ( response ) => response.json( ) ).then( result => {
            if ( result.success === true ) {
                this.setState( {
                    success: true,
                    id: result.id
                } )
            }
        } )
    }
    onPrevious( ) {
        let { step } = this.state
        this.goToStep( step -= 1 )
    }
    render( ) {
        let { urls, username, keywords } = this.props
        var {
            step,
            selectedResource,
            config,
            success,
            abstract,
            title,
            id
        } = this.state
        const steps = [
            {
                label: "Select Map",
                component: ResourceSelector,
                props: {
                    resourcesUrl: urls.resources_url,
                    username: username,
                    selectedResource: selectedResource,
                    selectMap: ( resource ) => {
                        this.setState( { selectedResource: resource } )
                    },
                    limit: 9,
                    onComplete: ( ) => {
                        var { step, config } = this.state
                        this.setState( {
                            config: { ...config,
                                map: selectedResource.id
                            }
                        } )
                        this.goToStep( ++step )
                    }
                }
            }, {
                label: "Select Layer",
                component: LayerSelector,
                props: {
                    map: selectedResource,
                    config,
                    urls,
                    onComplete: ( listConfig ) => {
                        let { step, config } = this.state
                        this.setState( {
                            config: { ...config,
                                ...listConfig
                            }
                        }, this.goToStep( ++step ) )
                    },
                    onPrevious: ( ) => {
                        this.onPrevious( )
                    }
                }
            }, {
                label: "Form Customization",
                component: FormFields,
                props: {
                    map: selectedResource,
                    config,
                    urls,
                    currentLayer,
                    doDescribeFeatureType: this.doDescribeFeatureType,
                    onComplete: ( fieldConfig ) => {
                        let { step, config } = this.state
                        this.setState( {
                            config: { ...config,
                                config: { ...config.config,
                                    ...fieldConfig
                                }
                            }
                        }, this.goToStep( ++step ) )
                    },
                    onPrevious: ( ) => {
                        this.onPrevious( )
                    }
                }
            }, {
                label: "Logo",
                component: ImageUploader,
                props: {
                    config,
                    urls,
                    onComplete: ( Image ) => {
                        let { step, config } = this.state
                        this.setState( {
                            config: { ...config,
                                config: { ...config.config,
                                    ...Image
                                }
                            }
                        }, this.goToStep( ++step ) )
                    },
                    onPrevious: ( ) => {
                        this.onPrevious( )
                    }
                }
            }, {
                label: "General ",
                component: General,
                props: {
                    keywords: config && config.keywords ? config.keywords : keywords,
                    urls,
                    abstract,
                    title,
                    selectedResource,
                    config,
                    onComplete: ( basicConfig ) => {
                        let { step, config } = this.state
                        this.setState( {
                            config: { ...config,
                                ...basicConfig
                            }
                        } )
                        this.goToStep( ++step )
                    },
                    onPrevious: ( ) => {
                        this.onPrevious( )
                    }
                }
            }, {
                label: "Navigation Tools",
                component: NavigationTools,
                props: {
                    instance: selectedResource,
                    config,
                    urls,
                    success,
                    id:id,
                    onComplete: ( basicConfig ) => {
                        var { config } = this.state
                        const instanceConfig = { ...config,
                            config: { ...config.config,
                                ...basicConfig
                            }
                        }
                        this.save( instanceConfig )
                    },
                    onPrevious: ( ) => {
                        this.onPrevious( )
                    }
                }
            } ]
        return (
            <div className="wrapping">
                <Navigator
                    steps={steps}
                    step={step}
                    onStepSelected={(step) => this.goToStep(step)} />
                <div className="col-xs-12 col-sm-12 col-md-9 col-lg-9 right-panel">
                    {steps.map((s, index) => index == step && <s.component key={index} {...s.props} />)}
                </div>
            </div>
        )
    }
}
Edit.propTypes = {
    urls: PropTypes.object.isRequired,
    config: PropTypes.object,
    username: PropTypes.string.isRequired,
    title: PropTypes.string,
    abstract: PropTypes.string,
    keywords: PropTypes.array
}
