import React, { Component } from 'react'

import PropTypes from 'prop-types'
import t from 'tcomb-form'

const Form = t.form.Form
const options = {
    fields: {
        name: {
            disabled: true
        },
        dataType: {
            disabled: true
        },
        fieldType: {
            nullOption: {
                value: '',
                text: 'Choose Field Type'
            }
        },
        id: {
            type: 'hidden'
        }
    }
}
export default class FieldConfigModal extends Component {
    constructor(props) {
        super(props)
        const {options}=this.props
        this.options = options
    }
    componentDidMount() {
        $(this.modal).modal('show')
        $(this.modal).on('hidden.bs.modal', this.props
            .handleHideModal)
    }
    save = () => {
        var value = this.form.getValue()
        if (value) {
            this.props.updateAttribute(value)
            $(this.modal).modal('hide')
        }
    }
    render() {
        const {fieldConfig,defaultValue}=this.props
        return (
            <div ref={(modalRef)=>this.modal=modalRef} className="modal fade" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 className="modal-title">{"Configure the Field"}</h4>
                        </div>
                        <div className="modal-body">
                            <Form
                                ref={(formRef)=>this.form=formRef}
                                type={fieldConfig}
                                value={defaultValue}
                                options={this.options} />
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
    defaultValue:PropTypes.object.isRequired,
    options:PropTypes.object.isRequired
}
