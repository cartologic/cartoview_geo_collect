import { GravatarOption, GravatarValue } from './GavatarOption'
import Select,{ AsyncCreatable } from 'react-select'

import React from 'react'

export const getAccessTemplate = ( options ) => {
    function renderInput( locals ) {
        return <div style={{paddingTop:5,paddingBottom:5}} className={locals.hasError?"has-error":""}>
            <label  className={"control-label"}>{locals.label}</label>
            <Select.Async
        {...locals}
        onChange={locals.onChange}
        inputProps={locals.inputProps}
        optionComponent={GravatarOption}
        valueComponent={GravatarValue}
        loadOptions={options.loadOptions}
        value={locals.value}
        multi={true}
        required={true}
        deleteRemoves={true}
        resetValue={null}
        placeholder={"Select User Who Can Enter Data"}/>
        </div>
    }

    return renderInput
}
export const getKeywordsTemplate = ( options ) => {
    function renderInput( locals ) {
        return <div style={{paddingTop:5,paddingBottom:5}} className={locals.hasError?"has-error":""}>
            <label  className={"control-label"}>{locals.label}</label>
            <AsyncCreatable
        {...locals}
        onChange={locals.onChange}
        inputProps={locals.inputProps}
        loadOptions={options.loadOptions}
        value={locals.value}
        multi={true}
        deleteRemoves={true}
        resetValue={null}
        placeholder={"Select Or enter Keyword"}/>
        </div>
    }

    return renderInput
}
export const  getAccessOptions = ( input, callback ) => {
    fetch( "/api/profiles/" ).then( ( response ) => response.json( ) )
        .then( ( data ) => {
            let users = [ ]
            data.objects.forEach( user => {
                users.push( {
                    label: user.username,
                    value: user
                        .username,
                    email: user.email
                } )
            } )
            callback( null, {
                options: users,
                complete: true
            } )

        } )

}
export const  getKeywordsOptions = ( input, callback ) => {
    fetch( "/api/keywords" ).then( ( response ) => response.json( ) )
        .then( ( data ) => {
            let keywords = [ ]
            data.objects.forEach( keyword => {
                keywords.push( {
                    label: keyword.name,
                    value: keyword.name,
                } )
            } )
            callback( null, {
                options: keywords,
                complete: true
            } )

        } )

}