import React, { Component } from 'react'
import {
    getAccessOptions,
    getAccessTemplate,
    getKeywordsOptions,
    getKeywordsTemplate
} from './AutoCompleteInput'

import t from 'tcomb-form'

const Form = t.form.Form
const selectAccessItem = t.struct( {
    value: t.String,
    label: t.String,
    email: t.String
} )
const selectKeywordItem = t.struct( {
    value: t.String,
    label: t.String
} )

const options = {
    fields: {
        title: {
            label: "App Title"
        },
        access: {
            factory: t.form.Textbox,
            template: getAccessTemplate( {
                loadOptions: getAccessOptions
            } )
        },
        keywords: {
            factory: t.form.Textbox,
            template: getKeywordsTemplate( {
                loadOptions: getKeywordsOptions
            } )
        }
    }
}
export default class General extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            defaultConfig: {
                title: this.props.state.config.title ? this.props.state
                    .config.title : this.props.instance.title ||
                    "No Title Provided",
                abstract: this.props.state.config.abstract ? this.props
                    .state.config.abstract : this.props.instance.abstract ||
                    "No Abstract Provided",
                access: this.props.state.config.access ? this.props.state
                    .config.access : this.props.config ? this.props.config
                    .access : null,
                keywords: this.props.state.config.access ? this.props.state
                    .config.keywords : this.props.config ? this.props.config
                    .keywords : null,

            },
        }
    }
    save( ) {
        var basicConfig = this.form.getValue( )
        if ( basicConfig ) {
            let properConfig = {
                title: basicConfig.title,
                abstract: basicConfig.abstract,
                access: basicConfig.access,
                keywords: basicConfig.keywords
            }
            this.props.onComplete( properConfig )
        }
    }
    render( ) {
        let mapConfig = t.struct( {
            title: t.String,
            abstract: t.String,
            access: t.list( selectAccessItem ),
            keywords: t.list( t.maybe( selectKeywordItem ) )
        } )
        return (
            <div className="row">
				<div className="row">
					<div className="col-xs-5 col-md-4">
						<h4>{'General'}</h4>
					</div>
					<div className="col-xs-7 col-md-8">
						<button
							style={{
							display: "inline-block",
							margin: "0px 3px 0px 3px"
						}}
							className="btn btn-primary btn-sm pull-right"
							onClick={this.save.bind( this )}>{"next "}
							<i className="fa fa-arrow-right"></i>
						</button>

						<button
							style={{
							display: "inline-block",
							margin: "0px 3px 0px 3px"
						}}
							className="btn btn-primary btn-sm pull-right"
							onClick={( ) => this.props.onPrevious( )}>
							<i className="fa fa-arrow-left"></i>{" Previous"}</button>
					</div>
				</div>
				<hr></hr>

				<Form
					ref={(form)=>this.form=form}
					value={this.state.defaultConfig}
					type={mapConfig}
                    onChange={this.onChange}
					options={options}/>
                
			</div>
        )
    }
}
