import React, { Component } from 'react'

import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

export default class FieldConfigModal extends Component {
    constructor( props ) {
        super( props )
    }
    componentDidMount( ) {
        $( ReactDOM.findDOMNode( this ) ).modal( 'show' )
        $( ReactDOM.findDOMNode( this ) ).on( 'hidden.bs.modal', this.props
            .handleHideModal )
    }
    save = ( ) => {
            $( ReactDOM.findDOMNode( this ) ).modal( 'hide' )
    }
    render( ) {
        return (
            <div className="modal fade" tabIndex="-1" role="dialog">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
							<h4 className="modal-title">Info</h4>
						</div>
						<div className="modal-body">
							<Form
								ref="form"
								type={this.props.fieldConfig}
								value={this.props.defaultValue}
								options={options}/>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
							<button type="button" onClick={this.save} className="btn btn-primary">Save changes</button>
						</div>
					</div>
				</div>
			</div>
        )
    }
}
FieldConfigModal.propTypes = {
    handleHideModal: PropTypes.func.isRequired,
    fieldConfig: PropTypes.func.isRequired,
    updateAttribute: PropTypes.func.isRequired,
}
