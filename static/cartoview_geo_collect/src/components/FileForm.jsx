import React, { Component } from 'react'

import FileBase64 from 'react-file-base64'
import PropTypes from 'prop-types'

export default class FileForm extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            messages: ""
        }
    }
    getFiles( file ) {
        let imageRegx = new RegExp( '^image\/*', 'i' )
        if ( imageRegx.test( file.type ) ) {
            if ( Math.ceil( file.file.size / Math.pow( 1024, 2 ), 2 ) > 5 ) {
                this.setState( { messages: "Max File Size is 5 MB" }, ( ) =>
                    this.props.onSave( null ) )
            } else {
                this.setState( { messages: "" }, ( ) => this.props.onSave(
                    file ) )
            }
        } else {
            this.setState( { messages: "this file isn't an image" }, ( ) =>
                this.props.onSave( null ) )
        }
    }
    save = ( ) => {
        const { file } = this.props
        if ( file ) {
            this.props.onSave( file )
            this.props.setCurrentComponent( "locationForm" )
        }
    }
    render( ) {
        let { messages } = this.state
        let { file } = this.props
        return (
            <div>
                <div className="panel panel-primary">
                    <div className="panel-heading">Images</div>
                    <div className="panel-body">
                        <FileBase64
                            multiple={false}
                            onDone={this.getFiles.bind(this)} />
                        <h4 style={{ color: "red" }}>{messages}</h4>
                        {file && <div className="row" style={{ marginTop: "5%" }}>
                            <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
                                <img className="img-responsive" src={file.base64} />
                            </div>
                        </div>}
                    </div>
                    
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-6col-lg-6 text-center">
                        <button onClick={()=>this.props.setCurrentComponent("attrsForm")} className={"btn btn-block  btn-primary"}>Previous</button>
                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6  text-center">
                        <button onClick={()=>this.save()} className={file?"btn btn-block btn-primary":"btn btn-block btn-primary disabled"}>Next</button>
                    </div>
                </div>
        </div>
        )
    }
}
FileForm.propTypes = {
    setCurrentComponent: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    file: PropTypes.object
}
