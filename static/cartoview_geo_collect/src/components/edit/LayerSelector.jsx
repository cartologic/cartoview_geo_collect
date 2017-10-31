// import 'react-select/dist/react-select.css'
import React, { Component } from 'react'

import PropTypes from 'prop-types'

export default class LayerSelector extends Component {
    constructor(props) {
        super(props)
        const { config } = this.props
        this.state = {
            layers: [],
            loading: true,
            selectedLayer: config ? config.layer : null,
            attributes: [],
        }
    }
    selectLayer() {
        if (this.refs.selectedLayer.value) {
            this.setState({
                selectedLayer: this.refs.selectedLayer.value
            })
        }
    }
    loadLayers() {
        fetch(this.props.urls.mapLayers + "?id=" + this.props.map.id).then(
            (response) => response.json()).then((data) => {
                let pointLayers = data.objects.filter((layer) => {
                    return layer.layer_type.toLowerCase().includes(
                        "point")
                })
                this.setState({ layers: pointLayers, loading: false })
            }).catch((error) => {
                console.error(error)
            })
    }
    handleSubmit() {
        this.refs.submitButton.click()
    }
    componentWillMount() {
        this.loadLayers()
    }
    save(e) {
        e.preventDefault()
        this.props.onComplete({
            config: {
                layer: this.state.selectedLayer
            }
        })
    }
    render() {
        let { layers, loading, attributes, selectedLayer } = this.state
        return (
            <div className="row">
                <div className="row">
                    <div className="col-xs-5 col-md-4"></div>
                    <div className="col-xs-7 col-md-8">
                        <button
                            className="btn navigation-buttons btn-primary btn-sm pull-right"
                            onClick={this.handleSubmit.bind(this)}>{"next "}
                            <i className="fa fa-arrow-right"></i>
                        </button>
                        <button
                            className="btn navigation-buttons btn-primary btn-sm pull-right"
                            onClick={() => this.props.onPrevious()}>
                            <i className="fa fa-arrow-left"></i>{" Previous"}</button>
                    </div>
                </div>
                <div className="row" style={{
                    marginTop: "3%"
                }}>
                    <div className="col-xs-5 col-md-4">
                        <h4>{'Select Layer'}</h4>
                    </div>
                </div>
                <hr></hr>
                <form onSubmit={this.save.bind(this)}>
                    {!loading && <div className="form-group">
                        <label htmlFor="layer-select">Layer</label>
                        <select
                            className="form-control"
                            id="layer-select"
                            ref="selectedLayer"
                            defaultValue={this.state.selectedLayer}
                            onChange={this.selectLayer.bind(this)}
                            required>
                            <option value="">Choose Layer</option>
                            {layers.length > 0 && layers.map((layer, i) => {
                                return <option value={layer.typename} key={i}>{layer.name}</option>
                            })}
                        </select>
                    </div>}
                    {layers.length == 0 && !loading && <b>No Point Layers In this Map Please Select a Map With Point Layer</b>}
                    <button
                        style={{
                            display: 'none'
                        }}
                        ref="submitButton"
                        type="submit"
                        value="submit"
                        className="btn btn-primary">Save</button>

                </form>
            </div>
        )
    }
}
LayerSelector.propTypes = {
    onComplete: PropTypes.func.isRequired,
    onPrevious: PropTypes.func.isRequired,
    config: PropTypes.object,
    urls: PropTypes.object.isRequired,
    map: PropTypes.object.isRequired,
}
