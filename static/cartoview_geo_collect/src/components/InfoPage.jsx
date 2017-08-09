import React, { Component } from 'react'

import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

export default class QuestionModal extends Component {
    constructor(props) {
        super(props)

    }
    componentDidMount() {
        $(ReactDOM.findDOMNode(this)).modal('show')
        $(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props
            .handleHideModal)
    }
    save = () => {
        this.props.onYes()
        $(ReactDOM.findDOMNode(this)).modal('hide')
    }
    render() {
        return (
            <div className="modal fade" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 className="modal-title">Question??</h4>
                        </div>
                        <div className="modal-body">
                            <div className="alert alert-warning">
                                <strong>Warning!</strong> You are about to save data on server! Are you Sure?
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">No</button>
                            <button type="button" onClick={this.save} className="btn btn-primary">Yes</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
QuestionModal.propTypes = {
    handleHideModal: PropTypes.func.isRequired,
    onYes: PropTypes.func.isRequired,
}
