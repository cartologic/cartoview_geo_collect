import Gravatar from 'react-gravatar'
import PropTypes from 'prop-types'
import React from 'react'
import createClass from 'create-react-class'
const GRAVATAR_SIZE = 15
export const GravatarOption = createClass( {
    propTypes: {
        children: PropTypes.node,
        className: PropTypes.string,
        isDisabled: PropTypes.bool,
        isFocused: PropTypes.bool,
        isSelected: PropTypes.bool,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        option: PropTypes.object.isRequired,
    },
    handleMouseDown( event ) {
        event.preventDefault( )
        event.stopPropagation( )
        this.props.onSelect( this.props.option, event )
    },
    handleMouseEnter( event ) {
        this.props.onFocus( this.props.option, event )
    },
    handleMouseMove( event ) {
        if ( this.props.isFocused ) return
        this.props.onFocus( this.props.option, event )
    },
    render( ) {
        let gravatarStyle = {
            borderRadius: 3,
            display: 'inline-block',
            marginRight: 10,
            position: 'relative',
            top: -2,
            verticalAlign: 'middle',
        }
        return (
            <div className={this.props.className}
				onMouseDown={this.handleMouseDown}
				onMouseEnter={this.handleMouseEnter}
				onMouseMove={this.handleMouseMove}
				title={this.props.option.title}>
				<Gravatar email={this.props.option.email} size={GRAVATAR_SIZE} style={gravatarStyle} />
				{this.props.children}
			</div>
        )
    }
} )
export const GravatarValue = createClass( {
    propTypes: {
        children: PropTypes.node,
        placeholder: PropTypes.string,
        value: PropTypes.object,
        onRemove: PropTypes.func.isRequired,
        disabled: PropTypes.bool.isRequired,
    },
    render( ) {
        let { disabled, value, onRemove } = this.props
        var gravatarStyle = {
            borderRadius: 3,
            display: 'inline-block',
            marginRight: 10,
            position: 'relative',
            top: -2,
            verticalAlign: 'middle',
        };
        return (
            <div className="Select-value" title={this.props.value.title}>
                
				<span className="Select-value-label">
					<Gravatar email={this.props.value.email} size={GRAVATAR_SIZE} style={gravatarStyle} />
					{this.props.children}
                    {` | `}<i onMouseDown={e => {
                        if(!disabled) {
                            onRemove(value)
                        }
                        // for sanity's sake
                        e.stopPropagation()
                    }} className="fa fa-times" aria-hidden="true"></i>
				</span>
			</div>
        )
    }
} )

