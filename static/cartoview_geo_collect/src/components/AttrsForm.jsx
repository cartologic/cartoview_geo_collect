import React, { Component } from 'react'

import PropTypes from 'prop-types'
import t from 'tcomb-form'

const Int = t.refinement( t.Number, ( n ) => n % 1 == 0 )
export default class AttrsForm extends Component {
    state = {
        schema: {},
        fields: {},
        value: {}
    }
    buildForm = ( ) => {
        const { attributes } = this.props
        const schema = {},
            fields = {},
            value = {}
        attributes.forEach( a => {
            if ( a.included ) {
                fields[ a.name ] = {
                    label: a.label,
                    help: a.helpText,
                    type: a.fieldType,
                    attrs: {
                        placeholder: a.placeholder
                    }
                }
                value[ a.name ] = a.defaultValue
                if ( a.fieldType == "select" ) {
                    const options = {}
                    a.options.forEach( o => options[ o.value ] = o
                        .label )
                    schema[ a.name ] = t.enums( options )
                } else if ( a.fieldType == "number" ) {
                    fields[ a.name ].type = 'number'
                    schema[ a.name ] = a.dataType == "int" ? Int :
                        t.Number
                } else if ( a.fieldType == "checkbox" ) {
                    schema[ a.name ] = t.Bool
                }
                //default case if data type is string
                // here field type may be text or textarea
                else if ( a.dataType == "string" ) {
                    schema[ a.name ] = t.String
                }
                if ( schema[ a.name ] ) {
                    if ( a.required ) {
                        fields[ a.name ].help += " (Required)"
                    } else {
                        schema[ a.name ] = t.maybe( schema[ a.name ] )
                    }
                }
            }
        } )
        this.setState( {
            schema,
            value,
            fields
        } )
    }
    componentWillMount( ) {
        this.buildForm( )
    }
    save = ( ) => {
        const value = this.form.getValue( )
        if ( value ) {
            this.props.onSave( value )
            this.setState( { value } )
            this.props.setCurrentComponent( "fileForm" )
        }
    }
    render( ) {
        let { schema, value, fields } = this.state
        return (
            <div>
                <div className="panel panel-primary">
                    <div className="panel-heading">Enter Information</div>
                    <div className="panel-body">
                        <t.form.Form ref={f => this.form = f} type={t.struct(schema)} options={{ fields }} value={value} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-sm-offset-3 col-md-offset-4 col-lg-offset-4 ">
                        <button onClick={()=>this.save()} className="btn btn-block btn-primary">Next</button>
                    </div>
                </div>
            </div>
        )
    }
}
AttrsForm.propTypes = {
    attributes: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    setCurrentComponent: PropTypes.func.isRequired
}
