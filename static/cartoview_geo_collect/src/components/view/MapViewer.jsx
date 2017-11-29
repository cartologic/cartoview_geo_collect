import React from 'react'

class MapViewer extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div>
                <div ref={(mapRef) => this.mapRef = mapRef} style={{ border: "2px solid lightgray", borderRadius: "8px", height: 400 }} className={className + ' map-ct'}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
export default MapViewer
