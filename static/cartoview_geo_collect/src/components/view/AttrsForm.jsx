import React, { Component } from 'react'

import PropTypes from 'prop-types'
import t from 'tcomb-form'

export default class AttrsForm extends Component {
    save = () => {
        const { onSave, toggleComponent } = this.props
        const value = this.form.getValue()
        if (value) {
            onSave(value)
            toggleComponent("fileForm")
        }
    }
    render() {
        let { schema, value, fields,extraClasses } = this.props
        return (
            <div className={extraClasses}>
                <div className="panel panel-primary">
                    <div className="panel-heading">Enter Information</div>
                    <div className="panel-body">
                        <t.form.Form ref={f => this.form = f} type={t.struct(schema)} options={{ fields }} value={value} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-sm-offset-3 col-md-offset-4 col-lg-offset-4 ">
                        <button onClick={() => this.save()} className="btn btn-block btn-primary">Next</button>
                    </div>
                </div>
            </div>
        )
    }
}
AttrsForm.propTypes = {
    schema: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    extraClasses: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    toggleComponent: PropTypes.func.isRequired
}
