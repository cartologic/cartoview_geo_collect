import React from 'react'
import Spinner from 'react-spinkit'
export const Loader = ( props ) => {
    return (
        <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-md-offset-3 text-center">
                <Spinner name="line-scale-pulse-out" color="steelblue" />
            </div>
        </div>
    )
}
