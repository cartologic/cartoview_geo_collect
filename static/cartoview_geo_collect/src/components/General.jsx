import React, { Component } from 'react';

import KeywordsInput from './KeywordsInput.jsx'
import t from 'tcomb-form';
const Form = t.form.Form;
const options = {
    fields: {
        title: {
            label: "App Title"
        },
        access: {
            help: 'Use <ctrl> or <cmd> key to choose multiple users',
            factory: t.form.Select
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
                    .access : 'private'
            },
            users: {}
        }
    }
    componentWillMount( ) {
        fetch( "/api/profiles/" ).then( ( response ) => response.json( ) )
            .then( ( data ) => {
                let users = {}
                data.objects.forEach( user => {
                    users[ user.username ] =
                        `${user.username} , email: <${user.email!==""? user.email: "no Email"}> `
                } )
                this.setState( { users } )
            } )
    }
    save( ) {
        var basicConfig = this.refs.form.getValue( );
        if ( basicConfig ) {
            console.log( basicConfig )
            let properConfig = {
                title: basicConfig.title,
                abstract: basicConfig.abstract,
                access: basicConfig.access,
                keywords: this.keywords
            }
            this.props.onComplete( properConfig )
        }
    }
    Keywords = [ ]
    updateKeywords( keywords ) {
        this.keywords = keywords.map( ( keyword ) => {
            return keyword.name
        } )
    }
    render( ) {
        let access = t.enums( this.state.users )
        let mapConfig = t.struct( {
            title: t.String,
            abstract: t.String,
            access: t.list( access )
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
					ref="form"
					value={this.state.defaultConfig}
					type={mapConfig}
					options={options}/>

				<KeywordsInput
					updateKeywords={( keywords ) => {
					this.updateKeywords( keywords )
				}}
					keywords={this.props.state.config.keywords
					? this.props.state.config.keywords
					: typeof(keywords)==="undefined" ? [] : keywords}/>
				<small>{"use <enter> key to seperate  keywords"}</small>
			</div>
        )
    }
}
