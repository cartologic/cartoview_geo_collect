import FileBase64 from 'react-file-base64'
import PropTypes from 'prop-types'
import React from 'react'
export default class ImageUploader extends React.Component {
    constructor( props ) {
        super( props )
        this.state = {
            file: this.props.config ? this.props.config.logo : null,
            messages: ""
        }
    }
    getFiles( file ) {
        let imageRegx = new RegExp( '^image\/*', 'i' )
        if ( imageRegx.test( file.type ) ) {
            if ( Math.ceil( file.file.size / Math.pow( 1024, 2 ), 2 ) >
                3 ) {
                this.setState( { messages: "Max File Size is 3 MB" } )
            } else {
                this.setState( { file: file, messages: "" } )
            }
        } else {
            this.setState( { messages: "this file isn't an image" } )
        }
    }
    save = ( ) => {
        this.props.onComplete( { logo: this.state.file } )
    }
    render( ) {
        let { file, messages } = this.state
        return (
            <div className="col-xs-12 col-sm-12 col-md-12">
                <div className="row">
                    <div className="col-xs-5 col-md-4">
                        <h4>{'Logo'}</h4>
                    </div>
                    <div className="col-xs-7 col-md-8">
                        <button
                            style={{
                                display: "inline-block",
                                margin: "0px 3px 0px 3px"
                            }}
                            className="btn btn-primary btn-sm pull-right"
                            onClick={this.save}>{"next "}
                            <i className="fa fa-arrow-right"></i>
                        </button>
                        <button
                            style={{
                                display: "inline-block",
                                margin: "0px 3px 0px 3px"
                            }}
                            className="btn btn-primary btn-sm pull-right"
                            onClick={() => this.props.onPrevious()}>
                            <i className="fa fa-arrow-left"></i>{" Previous"}</button>
                    </div>
                </div>
                <hr></hr>
                <FileBase64
                    multiple={false}
                    onDone={this.getFiles.bind(this)} />
                <h4 style={{color:"red"}}>{messages}</h4>
                {file && <div className="row" style={{ marginTop: "5%" }}>
                    <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
                        <img className="img-responsive" src={file.base64} />
                    </div>
                </div>}
            </div>
        )
    }
}
ImageUploader.propTypes = {
    onComplete: PropTypes.func.isRequired,
    onPrevious: PropTypes.func.isRequired,
    config: PropTypes.object,
    urls: PropTypes.object.isRequired,
}
