import React, { Component } from 'react'

import PropTypes from 'prop-types'
import ReactJson from 'react-json-view'
import Spinner from 'react-spinkit'

export default class InfoModal extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            history: null,
            totalCount: null,
            loading: false
        }
    }
    componentWillMount( ) {
        let { urls, layer } = this.props
        this.setState( { loading: true } )
        fetch( `${urls.historyListCreate}?layer__typename=${layer}` ).then(
            ( response ) => response.json( ) ).then( ( data ) => {
            this.setState( {
                history: data.objects,
                totalCount: data.meta.total_count,
                loading: false
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
        let { history, totalCount, loading } = this.state
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
                            {!loading && history.length>0 &&  totalCount!=0  &&  <table className="table table-striped">
                                <tbody>
                                    <tr>
                                        <td>Number of Collected Points</td>
                                        <td>{totalCount}</td>
                                    </tr>
                                    <tr>
                                        <td>Last Point Collected at</td>
                                        <td>{new Date(history[0].created_at).toString()}</td>
                                    </tr>
                                </tbody>
                            </table>}
                            {!loading && history.length>0 &&  totalCount!=0  && <div className="container-fluid">
                            <h3 className="text-center">Last Collected data</h3>
                                <div className="row">
                                    <div style={{overflowX:'overlay'}} className="col-md-12">
                                    <ReactJson src={history[0].data} name={'data'} enableClipboard={false} displayDataTypes={false} />
                                    </div>
                                </div>
                            </div>}
                           
                            {loading && < Spinner name = "line-scale-pulse-out" color = "steelblue" />}
                            {!loading && history.length===0 && totalCount===0 && <h5>No Data Collected</h5>}
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
    layer: PropTypes.string.isRequired
}
