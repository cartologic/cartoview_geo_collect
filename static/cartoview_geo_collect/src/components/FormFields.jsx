import React, { Component } from 'react'

import FieldConfigModal from "./FieldConfigModal"
import t from 'tcomb-form';
import update from 'immutability-helper';

const initialTypeMapping = {
    string: "text",
    double: "number",
    int: "number",
    long: "number",
    boolean: "checkbox",
    datetime: "datetime"
}
const Options = t.struct( {
    label: t.String,
    value: t.String
} )
export default class FormFields extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            attributes: this.props.config && this.props.currentConfig.layer === this.props.config.layer ? this.props.config.attributes : [ ],
            geometryName: undefined,
            allAttributes: this.props.attributes,
            showModal: false,
            attribute: null,
            loading: false,
            fieldList: [ ],
            fieldConfig: null,
            defaultValue: null,
            currentId: null
        }
    }
    componentDidMount( ) {
        if ( this.state.attributes.length == 0 ) {
            this.init( )
        }
    }
    getDataType = ( attribute ) => {
        return attribute.attribute_type.split( ":" ).pop( ).toLowerCase( );
    }
    searchById = ( id ) => {
        let result = this.state.attributes.find( ( attribute, index ) => {
            return attribute.id === id
        } )
        return result
    }
    getFieldList( fieldType ) {
        let fieldList = null
        switch ( fieldType ) {
        case "text":
            fieldList = t.enums( {
                text: 'Text',
                textarea: 'Multi-line Text',
                select: "Drop Down List",
                checkboxList: "Checkbox List",
                radioList: "Radio Button List"
            } )
            break
        case "number":
            fieldList = t.enums( {
                number: "Number",
                chekbox: "Checkbox",
                select: "Drop Down List",
                radioList: "Radio Button List"
            } )
            break
        case "boolean":
            fieldList = t.enums( { chekbox: "Checkbox" } );
            break
        case "datatime":
            fieldList = t.enums( {
                text: 'Text',
                textarea: 'Multi-line Text',
                number: "Number",
                chekbox: "Checkbox",
                select: "Drop Down List",
                checkboxList: "Checkbox List",
                radioList: "Radio Button List",
                datatime: "Date"
            } )
            break
        }
        return fieldList
    }
    generateForm = ( attribute ) => {
        let fieldList = this.getFieldList( attribute.fieldType ) || this.getFieldList(
            initialTypeMapping[ attribute.dataType ] || "text" )
        const fieldConfig = t.struct( {
            name: t.String,
            dataType: t.String,
            label: t.String,
            id: t.Number,
            placeholder: t.String,
            helpText: t.String,
            required: t.Boolean,
            defaultValue: t.String,
            fieldType: fieldList,
            options: t.list( Options )
        } )
        const defaultValue = {
            name: attribute.name,
            dataType: attribute.dataType,
            label: attribute.label,
            id: attribute.id,
            options: attribute.options,
            fieldType: attribute.fieldType,
            placeholder: attribute.placeholder,
            helpText: attribute.helpText,
            required: attribute.required,
            defaultValue: attribute.defaultValue
        }
        this.setState( { fieldConfig: fieldConfig, defaultValue: defaultValue } )
    }
    updateAttribute = ( attribute ) => {
        let { attributes } = this.state
        let currentAtrribute = this.searchById( attribute.id )
        if ( currentAtrribute ) {
            const id = attributes.indexOf( currentAtrribute )
            let updatedObj = update( currentAtrribute, { $merge: attribute } )
            attributes[ id ] = updatedObj
            this.setState( { attributes: attributes } )
        }
    }
    init = ( ) => {
        let attributes = [ ];
        this.setState( { loading: true } )
        this.state.allAttributes.map( ( attribute ) => {
            if ( attribute.attribute_type.indexOf( "gml" ) == 0 ) {
                this.setState( { geometryName: attribute.attribute } )
                return;
            }
            let dataType = this.getDataType( attribute );
            attributes.push( {
                included: true,
                name: attribute.attribute,
                id: attribute.id,
                label: attribute.attribute_label ||
                    attribute.attribute,
                placeholder: attribute.attribute_label ||
                    attribute.attribute,
                helpText: "",
                required: false,
                defaultValue: null,
                options: [ ],
                dataType: dataType,
                fieldType: initialTypeMapping[ dataType ] ||
                    "text"
            } );
        } )
        this.setState( { attributes: attributes, loading: false } )
    }
    includeChanged = ( id ) => {
        let { attributes } = this.state;
        let currentAtrribute = this.searchById( id )
        attributes[ attributes.indexOf( currentAtrribute ) ].included =
            this.refs[ "attr_check_" + id ].checked
        this.setState( { attributes: attributes } )
    }
    openModal = ( attribute ) => {
        this.generateForm( attribute )
        this.setState( { showModal: true } )
    }
    handleHideModal = ( ) => {
        this.setState( { showModal: false } )
    }
    render( ) {
        let { loading } = this.state
        return (
            <div className="row">
                <div className="row">
                    <div className="col-xs-5 col-md-4"></div>
                    <div className="col-xs-7 col-md-8">
                        <button
                            style={{
                                display: "inline-block",

                                margin: "0px 3px 0px 3px"
                            }}
                            className={loading ? "btn btn-primary btn-sm pull-right disabled" :"btn btn-primary btn-sm pull-right"}
                            onClick={() => {
                                this.props.onComplete({attributes: this.state.attributes, geometryName: this.state.geometryName })
                            }}>{"next "}
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
                <div className="row" style={{
                    marginTop: "3%"
                }}>
                    <div className="col-xs-5 col-md-4">
                        <h4>{'Form Customization'}</h4>
                    </div>
                </div>
                <hr></hr>
                <div className="row">
                    {this.state.attributes.length > 0 && this.state.attributes.map((attribute, index) => {
                        return <div key={index} className="col-lg-6">
                            <div className="input-group">
                                <span className="input-group-addon">
                                    <input
                                        defaultChecked={attribute.included}
                                        onChange={() => this.includeChanged(attribute.id)}
                                        ref={"attr_check_" + attribute.id}
                                        type="checkbox" />
                                </span>
                                <input type="text" value={attribute.label} className="form-control" disabled />
                                <span className="input-group-addon" id="basic-addon2">
                                    <i className="fa fa-cog" onClick={() => this.openModal(attribute)}></i>
                                </span>
                            </div>
                        </div>
                    })}
                    {this.state.showModal
                        ? <FieldConfigModal
                            fieldConfig={this.state.fieldConfig}
                            defaultValue={this.state.defaultValue}
                            handleHideModal={this.handleHideModal} updateAttribute={this.updateAttribute} />
                        : null}
                </div>

            </div>
        )
    }
}
