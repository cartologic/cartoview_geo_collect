import React, { Component } from 'react'

import PropTypes from 'prop-types'
import Spinner from 'react-spinkit'

export default class InfoModal extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            history: null,
            totalCount: null
        }
    }
    componentWillMount( ) {
        let { urls, layer } = this.props
        fetch( `${urls.historyListCreate}?layer__typename=${layer}` ).then(
            ( response ) => response.json( ) ).then( ( data ) => {
            this.setState( {
                history: data.objects,
                totalCount: data
                    .meta.total_count
            } )
        } ).catch( ( error ) => {
            console.error( error )
        } )
    }

    componentDidMount( ) {
        $( this.modal ).modal( 'show' )
        $( this.modal ).on( 'hidden.bs.modal', this.props.close )
    }
    save = ( ) => {
        $( this.modal ).modal( 'hide' )
    }
    render( ) {
        let { history, totalCount } = this.state
        return (

            <div ref={el=>this.modal=el} className="modal fade" tabIndex="-1" role="dialog">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
							<h4 className="modal-title">Info</h4>
						</div>
						<div className="modal-body">
                            {history && totalCount &&  <table className="table table-striped">
                                <tbody>
                                    <tr>
                                        <td>Number of Collected Points</td>
                                        <td>{totalCount}</td>
                                    </tr>
                                    <tr>
                                        <td>Last Point Collected at</td>
                                        <td>{new Date(history[0].created_at).toDateString()}</td>
                                    </tr>
                                </tbody>
                            </table>}
                            {history && totalCount &&  <div>
                                <h3 className="text-center">Last Collected data</h3>
                                <table className="table table-striped">
                                <tbody>
                                    {Object.keys(history[0].data).map(key=>{
                                        return <tr key={key}>
                                            <td>{key}</td>
                                            <td>{history[0].data[key]}</td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                            </div>}
                           
                            {!history && !totalCount && < Spinner name = "line-scale-pulse-out" color = "steelblue" />}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
        )
    }
}
InfoModal.propTypes = {
    urls: PropTypes.object.isRequired,
    close: PropTypes.func.isRequired,
    layer:PropTypes.string.isRequired
}
