import UrlAssembler from 'url-assembler'
const nominatimURL = " http://nominatim.openstreetmap.org/search?"
class OSMGeoCoding {
    constructor() {
        this.OSMSettings = {
            q: '',
            format: 'json',
            addressdetails: 1,
            limit: 10,
            countrycodes: '',
            'accept-language': 'en-US'
        }
        this.url = null
    }
    getPatamters = ( query ) => {
        this.OSMSettings.q = query
        return this.OSMSettings
    }
    getURL = ( query ) => {
        const paramters = this.getPatamters( query )
        return UrlAssembler( nominatimURL ).query( paramters ).toString()
    }
    doGet = () => {
        return fetch( this.url, {
            method: 'GET'
        } ).then( ( response ) => {
            return response.json()
        } )
    }
    search = ( query, callBack ) => {
        this.url = this.getURL( query )
        this.doGet().then( result => callBack( result ) )
    }
}
export default new OSMGeoCoding()
