import React, { Component } from 'react'

import FieldConfigModal from "Source/components/edit/FieldConfigModal"
import { Loader } from 'Source/components/edit/CommonComponents'
import PropTypes from "prop-types"
import t from 'tcomb-form'
import update from 'immutability-helper'

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
        const { config, attributes } = this.props
        this.state = {
            attributes: typeof ( config.layer ) === "undefined" ? [] : config
                .config.layer === config.layer ? config.attributes : [],
            geometryName: null,
            allAttributes: attributes,
            showModal: false,
            attribute: null,
            attributesLoading: false,
            descripeFeatureLoading: false,
            buildingForm: false,
            fieldList: [],
            fieldConfig: null,
            defaultValue: null,
            currentId: null,
            featureTypes: null,
            formFieldOptions: null
        }
    }
    componentWillMount() {
        const { config, urls } = this.props
        this.setState( { attributesLoading: true } )
        fetch( urls.layerAttributes + "?layer__typename=" + config.config.layer )
            .then( ( response ) => response.json() ).then(
                ( data ) => {
                    this.setState( { allAttributes: data.objects } )
                    this.setState( { attributesLoading: false } )
                } ).catch( ( error ) => {
                    throw error
                })
    }
    init = () => {
        let attributes = []
        this.setState( { buildingForm: true } )
        this.state.allAttributes.map( ( attribute ) => {
            if ( attribute.attribute_type.indexOf( "gml" ) == 0 ) {
                this.setState( { geometryName: attribute.attribute } )
                return
            }
            let dataType = this.getDataType( attribute )
            attributes.push( {
                included: true,
                name: attribute.attribute,
                id: attribute.id,
                label: attribute.attribute_label ||
                    attribute.attribute,
                placeholder: attribute.attribute_label ||
                    attribute.attribute,
                helpText: "",
                required: !this.checkNillable( attribute.attribute ) ?
                    true : false,
                defaultValue: null,
                options: [],
                dataType: dataType,
                fieldType: initialTypeMapping[ dataType ] ||
                    "text"
            } )
        } )
        this.setState( { attributes: attributes, buildingForm: false } )
    }
    getFeatureTypes = ( callBack = () => {} ) => {
        const { doDescribeFeatureType, config } = this.props
        doDescribeFeatureType( config.config.layer ).then( result => {
            this.setState( {
                featureTypes: result.featureTypes[ 0 ].properties,
                descripeFeatureLoading: false
            }, callBack )
        } )
    }
    componentDidMount() {
        this.setState( { descripeFeatureLoading: true } )
        if ( this.state.attributes.length == 0 ) {
            this.getFeatureTypes( this.init )
        } else {
            this.getFeatureTypes()
        }
    }
    getDataType = ( attribute ) => {
        return attribute.attribute_type.split( ":" ).pop().toLowerCase()
    }
    searchById = ( id ) => {
        let result = this.state.attributes.find( ( attribute ) => {
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
            fieldList = t.enums( { chekbox: "Checkbox" } )
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
            helpText: t.maybe( t.String ),
            required: t.Boolean,
            defaultValue: t.maybe( t.String ),
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
        const attributeDisabled = attribute.required ? {
            required: {
                disabled: true
            }
        } : {}
        const formFieldOptions = {
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
                },
                ...attributeDisabled
            }
        }
        this.setState( {
            fieldConfig,
            defaultValue,
            formFieldOptions,
        } )
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
    includeChanged = ( id ) => {
        let { attributes } = this.state
        let currentAtrribute = this.searchById( id )
        attributes[ attributes.indexOf( currentAtrribute ) ].included =
            this[ "attr_check_" + id ].checked
        this.setState( { attributes: attributes } )
    }
    openModal = ( attribute ) => {
        this.generateForm( attribute )
        this.setState( { showModal: true } )
    }
    handleHideModal = () => {
        this.setState( { showModal: false } )
    }
    checkNillable = ( attributeName ) => {
        const { featureTypes } = this.state
        let result = featureTypes.filter( attr => attr.name ===
            attributeName )
        let nillable = result.length > 0 ? result[ 0 ].nillable : true
        return nillable
    }
    render() {
        let {
            loading,
            featureTypes,
            showModal,
            attributes,
            formFieldOptions,
            fieldConfig,
            defaultValue,
            buildingForm,
            descripeFeatureLoading
        } = this.state
        const { onComplete, onPrevious } = this.props
        return (
            <div>
                <div className="row">
                    <div className="col-xs-5 col-md-4"></div>
                    <div className="col-xs-7 col-md-8">
                        <button
                            className={loading ? "btn btn-primary btn-sm navigation-buttons pull-right disabled" : "btn btn-primary btn-sm navigation-buttons pull-right"}
                            onClick={() => {
                                onComplete({ attributes: this.state.attributes, geometryName: this.state.geometryName })
                            }}>{"next "}
                            <i className="fa fa-arrow-right"></i>
                        </button>
                        <button
                            className="btn btn-primary btn-sm navigation-buttons pull-right"
                            onClick={() => onPrevious()}>
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
                    {loading || buildingForm || descripeFeatureLoading && <Loader />}
                    {!loading &&  !buildingForm && !descripeFeatureLoading && attributes.length > 0 && featureTypes && featureTypes.length > 0 && attributes.map((attribute, index) => {
                        return <div key={index} className="col-lg-6">
                            <div className="input-group">
                                <span className="input-group-addon">
                                    <input
                                        defaultChecked={attribute.included}
                                        onChange={() => this.includeChanged(attribute.id)}
                                        ref={(checkRef) => this["attr_check_" + attribute.id] = checkRef}
                                        type="checkbox" disabled={this.checkNillable(attribute.name) ? false : true} />
                                </span>
                                <input type="text" value={attribute.label} className="form-control" disabled />
                                <span className="input-group-addon" id="basic-addon2">
                                    <i className="fa fa-cog" onClick={() => this.openModal(attribute)}></i>
                                </span>
                            </div>
                        </div>
                    })}
                    {showModal
                        ? <FieldConfigModal
                            options={formFieldOptions}
                            fieldConfig={fieldConfig}
                            defaultValue={defaultValue}
                            handleHideModal={this.handleHideModal} updateAttribute={this.updateAttribute} />
                        : null}
                </div>

            </div>
        )
    }
}
FormFields.propTypes = {
    config: PropTypes.object.isRequired,
    urls: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired,
    doDescribeFeatureType: PropTypes.func.isRequired,
    onPrevious: PropTypes.func.isRequired,
    attributes: PropTypes.array,
}
