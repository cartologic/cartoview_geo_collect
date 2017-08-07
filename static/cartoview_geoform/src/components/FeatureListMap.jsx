import { findDOMNode, render } from 'react-dom'

import React from 'react'

export default class FeatureListMap extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            config: {
                mapId: this.props.mapId
            }
        }
        this.map = this.props.map
    }
    componentDidMount() {


    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.display) {
            setTimeout(() => {
                this.map.setTarget(findDOMNode(this.refs[this.props.mapRef]))
                this.map.updateSize();
            }, 1000)
        }
    }
    render() {
        return (
            <div style={{ width: "100%", height: "100%" }} ref={this.props.mapRef}></div>
        )
    }
}