import FileBase64 from 'react-file-base64'
import React from 'react'
export default class ImageUploader extends React.Component {
    constructor() {
        super()
        this.state = {
            file: null
        }
    }
    getFiles(file) {
        this.setState({ file: file }, () => console.log(this.state.file))
    }
    save = () => {

    }
    render() {
        let { file } = this.state
        return (
            <div className="col-xs-12 col-sm-12 col-md-12">
                <div className="row">
                    <div className="col-xs-5 col-md-4">
                        <h4>{'Instance Logo'}</h4>
                    </div>
                    <div className="col-xs-7 col-md-8">
                        {file && <button
                            style={{
                                display: "inline-block",
                                margin: "0px 3px 0px 3px"
                            }}
                            className="btn btn-primary btn-sm pull-right"
                            onClick={() => this.save.bind(this)}>{"next "}
                            <i className="fa fa-arrow-right"></i>
                        </button>}
                        {!file && <button
                            style={{
                                display: "inline-block",
                                margin: "0px 3px 0px 3px"
                            }}
                            className="btn btn-primary btn-sm pull-right disabled"
                            onClick={() => this.save.bind(this)}>{"next "}
                            <i className="fa fa-arrow-right"></i>
                        </button>}

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
                {file && <div className="row" style={{ marginTop: "5%" }}>
                    <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
                        <img className="img-responsive" src={file.base64} />
                    </div>
                </div>}
            </div>

        )
    }
}
