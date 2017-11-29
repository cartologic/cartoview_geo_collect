import React, { Component } from 'react'

import PropTypes from 'prop-types'

export default class DetailsPage extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        let { value, file, toggleComponent, saveAll, extraClasses } = this.props
        return (
            <div className={`col-md-12 ${extraClasses}`}>
                <h2>Details</h2>
                <hr />
                <h4>{"Form Data"}</h4>
                <small>{"Are you Sure You Want to Save The Following Values:"} </small><br /><br />
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>{"Field"}</th>
                            <th>{"Value"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(value).map((key, i) => {
                            return <tr key={i}>
                                <td>{key}</td>
                                <td>{value[key]}</td>
                            </tr>
                        })}
                    </tbody>
                </table>
                <h4>Attachment </h4>
                {file && <div className="row" style={{ marginTop: "5%" }}>
                    <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
                        <img className="img-responsive" src={file.base64} />
                    </div>
                </div>}
                <br /><br /><br /><br />
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-6col-lg-6 text-center">
                        <button onClick={() => toggleComponent("locationForm")} className={"btn btn-block  btn-primary"}>Previous</button>
                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6  text-center">
                        <button onClick={() => saveAll()} className={file ? "btn btn-block btn-primary" : "btn btn-block btn-primary disabled"}>Save</button>
                    </div>
                </div>
            </div>
        )
    }
}
DetailsPage.propTypes = {
    value: PropTypes.object.isRequired,
    file: PropTypes.object,
    toggleComponent: PropTypes.func.isRequired,
    saveAll: PropTypes.func.isRequired,
    extraClasses: PropTypes.string,
}
